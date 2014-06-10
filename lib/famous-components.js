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


