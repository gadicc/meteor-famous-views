var mainCtx = null;

log = new Logger('famous-components');
Logger.setLevel('famous-components', 'trace');

Engine = null,
    Modifier = null,
    Surface = null,
    Transform = null,
    SequentialLayout = null,
    StateModifier = null,
    Utility = null;

famousCmp = {};
famousCmp.views = {};
famousCmp.viewOptions = {};
famousCmp.modifiers = {};


/* Available in JS via `famousCmp.views.Scrollview` and in templates via
	`{{#famous view='Scrollview'}}` or just `{{#Scrollview}}`. */
famousCmp.registerView = function(name, func, options) {
	if (famousCmp.views[name])
		return;

	famousCmp.views[name] = func;
	UI.registerHelper(name, function(/*arguments*/) {
		this.view = name;
		return famousCmp.famousComponent.apply(this, arguments);
	});

	if (options)
		famousCmp.viewOptions[name] = options;
}

famousCmp.require = function(lib) {
	if (!famousCmp.startedUp)
		throw new Error('famousCmp.require called too early; wrap in famousCmp.ready()');

	if (Package.famono)
		return Package.famono.require.apply(null, arguments);

	if (famousCmp._require)
		return famousCmp._require.apply(null, arguments);

	lib = lib.split('/');

	if (typeof(famous) === 'object')
		return famous[lib[1]][lib[2]];

	if (typeof(Famous) === 'object') {
		lib[1] = lib[1][0].toUpperCase() + lib[1].substr(1);
		return Famous[lib[1]][lib[2]];
	}

	throw new Error('famousCmp.require needs real require or Famous/famous'
		+ ' objects (when requesting "' + lib.join('/') + '")');
}

var readyQueue = [];
var readyDep = new Deps.Dependency;
famousCmp.ready = function(func) {
	if (func)
		readyQueue.push(func);
	else {
		readyDep.depend();
		return famousCmp.isReady;
	}
}
famousCmp.runReadies = function(require) {
	famousCmp.isReady = true;
	readyDep.changed();
	while(readyQueue.length) {
		(readyQueue.shift())(require);
	}
}

if (Package.famono)
	Meteor.startup(function() {
		(function(require) {
		  require("famous-polyfills");		// Add polyfills
		  require("famous/core/famous");	// Add the default css file
		})(Package.famono.require);
	});

famousCmp.startup = function(require) {
  log.info('Current logging default is "debug".  Change in your app with '
    + 'Logger.setLevel("famous-components", "info");');
  famousCmp.startedUp = true;

  // Basic deps
  Engine           = require("famous/core/Engine");
  Modifier         = require("famous/core/Modifier");
  Surface          = require("famous/core/Surface");
  Transform        = require("famous/core/Transform");
  RenderNode       = require("famous/core/RenderNode");
  SequentialLayout = require("famous/views/SequentialLayout");
//  RenderController = require("famous/views/RenderController");

  StateModifier    = require("famous/modifiers/StateModifier");

  famousCmp.registerView('Scrollview', require('famous/views/Scrollview'));
  famousCmp.registerView('SequentialLayout', SequentialLayout);
  famousCmp.registerView('View', require("famous/core/View"));
  famousCmp.registerView('Surface', Surface);  // special case

  Utility          = require('famous/utilities/Utility');

  if (famousCmp.mainCtx)
    mainCtx = famousCmp.mainCtx;
  else {
    if (famousCmp.mainCtx !== false)
      log.warn('Creating a new main context.  If you already have '
        + 'your own, set famousCmp.mainCtx = yourMainContext (or to false to get '
        + 'rid of this warning)');
    famousCmp.mainCtx = mainCtx = Engine.createContext();
  }

  if (Template.famousInit)
    UI.insert(UI.render(Template.famousInit), document.body);

  famousCmp.runReadies(require);
};

famousCmp.isReady = false;
if (Package.famono || Package['famous-compiled'] || Package['mj-famous']) {

	Meteor.startup(function() {
		famousCmp.startup(
			typeof(require) === 'undefined' ? famousCmp.require : require
		);
	});

} else {

	// Let's reassess our situation when the document is fully loaded
	$(document).ready(function() {
		if (typeof(Famous) !== 'undefined' || typeof(famous) !== 'undefined') {
			// Ok, we have a Famous/famous global var, all good
			famousCmp.startup(
				typeof(require) === 'undefined' ? famousCmp.require : require
			);
		} else if (typeof(define) !== 'undefined') {
			// Non famono RequireJS setup, probably from Famous CDN
			// See demo-cdn/lib/famous-cdn.* and public/requireFamousComponents.js
			log.info('RequireJS/CDN setup, expect app to finish init (see demo-cdn)');
		} else {
			throw new Error('Document ready but no require/famous/Famous in global scope');
		}
	});
}

/*
 * Templates are always added to a compView, in turn is added to it's parent
 * compView or a context.  This allows us to handle situations where a
 * template is later removed (since nodes cannot ever be manually removed
 * from the render tree).
 * 
 * http://stackoverflow.com/questions/23087980/how-to-remove-nodes-from-the-ren
 */

CompView = function(component, options, noAdd) {
  this.component = component;
  if (noAdd)
    return;
  
  var parent = component;
  while ((parent=parent.parent) && !parent.famousView);
  parent = parent ? parent.famousView : { node: mainCtx };

  this.parent = parent;

  if (options) {
    if (options.size) {
      this.size = options.size;
    }
  }

  if (famousCmp.viewOptions[parent.view] &&
  		famousCmp.viewOptions[parent.view].add)
  	// views can explicitly handle how their children should be added
  	famousCmp.viewOptions[parent.view].add.call(parent, this);
  else if (parent.sequencer)
  	// if the node has a sequencer, add by pushing to the sequence array
    parent.sequencer.sequence.push(this);
  else if (!parent.node || (parent.node._object && parent.node._object.isDestroyed))
    // compView->compView.  long part above is temp hack for template rerender #2010
    parent.setNode(this);
  else
  	// default case, just use the add method
    parent.node.add(this);
}
CompView.prototype.render = function() {
  if (this.isDestroyed)
    return [];
  if (this.node)
    return this.node.render();
  console.log('render called before anything set');
  return [];
}
CompView.prototype.setNode = function(node) {
  // surface or modifier/view
  this.node = new RenderNode(node);
  return this.node;
}
CompView.prototype.preventDestroy = function() {
	this.destroyPrevented = true;	
}
CompView.prototype.destroy = function() {
  this.isDestroyed = true;
  this.node = null;
  this.viewNode = null;
  this.modifier = null;
  this.parent.sequencePurge();
}
CompView.prototype.sequencePurge = function() {
  if (!this.sequencer)
    return;

  var sequence = this.sequencer.sequence,
    length = sequence.length;

  for (var i=0; i < length; i++)
    if (sequence[i].isDestroyed) {
      sequence.splice(i--, 1);
      length--;
    }
}

/*
var moo = _.once(function(compView) {
  console.log('getSize called for', compView);
});
*/
CompView.prototype.getSize = function() {
//  moo(this);
  return this.size || this.node && this.node.getSize() || [true,true];
}
//CompView.prototype.add = function() {
//}


famousCmp.dataFromComponent = function(component) {
  while ((component=component.parent) && !component.famousView);
  return component ? component.famousView : undefined;
}
famousCmp.dataFromTemplate = function(tplInstance) {
  return this.dataFromComponent(tplInstance.__component__);
}
famousCmp.dataFromElement = function(el) {
  var comp = UI.DomRange.getContainingComponent(el);
  return this.dataFromComponent(comp);
}
// Leave as alias?  Deprecate?
famousCmp.dataFromCmp = famousCmp.dataFromComponent;
famousCmp.dataFromTpl = famousCmp.dataFromTemplate;


// used by famous and famousEach.
// returns enclosing Template name.
getKind = function(comp) {
  while (comp = comp.parent)
    if (comp.kind && comp.kind != 'Component' && comp.kind != 'Template_famous')
      return comp.kind;
}

function optionString(string) {
  if (string == 'undefined')
    return undefined;
  if (string == 'true')
    return true;
  if (string == 'false')
    return false;
  if (string.substr(0,1) == '[') {
    var out = [];
    string = string.substr(1, string.length-2).split(',');
    for (var i=0; i < string.length; i++)
      out.push(optionString(string[i].trim()));
    return out;
  }
  if (string.match(/^[0-9\.]+$/))
    return parseFloat(string);
  return string;
}

// used by famous and famousEach.
// "5.2,undefined,.." -> [5.2, undefined, ...]
floatArray = function(string) {
  if (!string || _.isArray(string))
    return string;

  // temporary, until everyone is using this new options format
  if (string.substr(0,1) == '[')
    string = string.substr(1, string.length-2);

  var out = [];
  var args = string.split(',');
  var length = args.length;
  for (var i=0; i < length; i++) {
    out[i] = parseFloat(args[i]);
    if (isNaN(out[i]))
      out[i] = undefined;
  }
  return out;
}

// Note, once issue #2010 is closed, this must handle reactive data
handleOptions = function(data, compView) {
  options = {};
  for (key in data) {
    var value = data[key];
    if (_.isString(value))
      options[key] = optionString(value);
    else
      options[key] = value;
  }
  return options;
}

/* Sequencer and childSequence */

sequencer = function() {
  this.sequence = [];
  this.children = [];
}
sequencer.prototype.child = function() {
  var child = new childSequence(this);
  this.children.push(child);
  return child;
}

function childSequence(parent, childNo, startIndex) {
    this.parent = parent;
    this.childNo = parent.children.length;
    this.startIndex = parent.sequence.length;
    this.sequence = [];
}
childSequence.prototype.push = function(value) {
  this.parent.sequence.splice(this.startIndex+this.sequence.length-1, 0, value);
  for (var i=this.childNo+1; i < this.parent.children.length; i++) {
    this.parent.children[i].startIndex++;
  }
  return this.sequence.push(value);
}
childSequence.prototype.splice = function(index, howMany /*, arguments */) {
  var diff, max = this.sequence.length - index;
  if (howMany > max) howMany = max;
  diff = (arguments.length - 2) - howMany; // inserts - howMany

  for (var i=this.childNo+1; i < this.parent.children.length; i++)
    this.parent.children[i].startIndex += diff;

  this.sequence.splice.apply(this.sequence, arguments);
  arguments[0] += this.startIndex;  // add startIndex and re-use args  
  return this.parent.sequence.splice.apply(this.parent.sequence, arguments);

}

/* --- totally not done --- */

famousCmp.showTreeGet = function(renderNode) {
  var obj = renderNode._node._child._object;
    if (obj.node)
      obj.node = this.showTreeGet(obj.node);
  return obj;
}
famousCmp.showTreeChildren = function(renderNode) {
  var out = {}, i=0;
  if (renderNode._node)
    out['child'+(i++)] = this.showTreeGet(renderNode)
  return out;
}
famousCmp.showTree = function() {
  console.log(this.showTreeChildren(mainCtx));
}

/* --- */


