var mainCtx = null;

Engine = null,
    Modifier = null,
    Surface = null,
    Transform = null,
    SequentialLayout = null,
    StateModifier = null;

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

  if (parent.sequence)
    parent.sequence.push(this);
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
  var sequence = this.sequence,
    length = this.sequence.length;

  for (var i=0; i < length; i++)
    if (sequence[i].isDestroyed) {
      this.sequence.splice(i--, 1);
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
  if (_.isArray(string))
    return string;

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


