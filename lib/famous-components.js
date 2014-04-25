var mainCtx = null;

Engine = null,
    Modifier = null,
    Surface = null,
    Transform = null,
    SequentialLayout = null,
    StateModifier = null,
    Utility = null;

famousCmp = {};
famousCmp.views = {};
famousCmp.modifiers = {};

Meteor.startup(function() {
  require("famous-polyfills"); // Add polyfills
  require("famous/core/famous"); // Add the default css file

  // Basic deps
  Engine           = require("famous/core/Engine");
  Modifier         = require("famous/core/Modifier");
  Surface          = require("famous/core/Surface");
  Transform        = require("famous/core/Transform");
  RenderNode       = require("famous/core/RenderNode");
  SequentialLayout = require("famous/views/SequentialLayout");
//  RenderController = require("famous/views/RenderController");

  StateModifier    = require("famous/modifiers/StateModifier");

  famousCmp.views['Scrollview'] = require('famous/views/Scrollview');
  famousCmp.views['SequentialLayout'] = SequentialLayout;

  Utility          = require('famous/utilities/Utility');

  if (famousCmp.mainCtx)
    mainCtx = famousCmp.mainCtx;
  else {
    if (famousCmp.mainCtx !== false)
      console.log('[famousCmp] Creating a new main context.  If you already have '
        + 'your own, set famousCmp.mainCtx = yourMainContext (or to false to get '
        + 'rid of this warning)');
    famousCmp.mainCtx = mainCtx = Engine.createContext();
  }

  if (Template.famousInit)
    UI.insert(UI.render(Template.famousInit), document.body);

});

/*
 * Templates are always added to a cmpView, in turn is added to it's parent
 * cmpView or a context.  This allows us to handle situations where a
 * template is later removed (since nodes cannot ever be manually removed
 * from the render tree).
 * 
 * http://stackoverflow.com/questions/23087980/how-to-remove-nodes-from-the-ren
 */

CompView = function(component, options) {
  var parent = component;
  while ((parent=parent.parent) && !parent.famousView);
  parent = parent ? parent.famousView : { node: mainCtx };

  this.component = component;
  this.parent = parent;

  if (options) {
    if (options.size) {
      this.size = options.size;
    }
  }

  if (parent.sequencer)
    parent.sequencer.sequence.push(this);
  else
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
CompView.prototype.destroy = function() {
  this.isDestroyed = true;
  this.node = null;
  this.parent.sequencePurge();
}
CompView.prototype.sequencePurge = function() {
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
  return this.size || [undefined, 200];
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
    if (_.isString(value)) {
      if (value.substr(0,1) == '[')
        options[key] = floatArray(value.substr(1,value.length-2));
    }
    // more coming soon
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
  this.sequence.push(value);
  this.parent.sequence.splice(this.startIndex+this.sequence.length-1, 0, value);
  for (var i=this.childNo+1; i < this.parent.children.length; i++) {
    this.parent.children[i].startIndex++;
  }
}
childSequence.prototype.splice = function(index, howMany /*, arguments */) {
  var max = this.sequence.length - index;
  if (howMany > max)
    howMany = max;

  this.sequence.splice.apply(this.sequence, arguments);
  arguments[0] += this.startIndex;  // add startIndex and re-use args
  this.parent.sequence.splice.apply(this.parent.sequence, arguments);

  var diff = (arguments.length - 2) - howMany; // inserts - howMany
  for (var i=this.childNo+1; i < this.parent.children.length; i++)
    this.parent.children[i].startIndex += diff;
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


