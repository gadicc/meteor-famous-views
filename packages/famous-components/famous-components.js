var mainCtx = null;

var Engine = null,
    Modifier = null,
    Surface = null,
    Transform = null,
    SequentialLayout = null;

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
  SequentialLayout = require('famous/views/SequentialLayout');
//  RenderController = require("famous/views/RenderController");

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

function famousSize(size) {
  size = size.split(',');
  var x = parseFloat(size[0]), y = parseFloat(size[1]);
  return [
    _.isNaN(x) ? undefined : x,
    _.isNaN(y) ? undefined : y
  ];
}

/*
 * Templates are always added to a cmpView, in turn is added to it's parent
 * cmpView or a context.  This allows us to handle situations where a
 * template is later removed (since nodes cannot ever be manually removed
 * from the render tree).
 * 
 * TODO, recreated templates should recycle a previously used cmpView?
 * need more info on the famous memory management (which does exist)
 * http://stackoverflow.com/questions/23087980/how-to-remove-nodes-from-the-ren
 *
 */

function CompView(component) {
//  for (var cmp = component; cmp; cmp = cmp.parent)

  var parent = component;
  while ((parent=parent.parent) && !parent.famousView);
  parent = parent ? parent.famousView : { node: mainCtx };

  this.component = component;
  this.parent = parent;

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
//CompView.prototype.add = function() {
//}

Template.famous.created = function() {
  console.log('\n[famous] Famous component '
    + this.__component__.guid + ' instantiated to render template "'
    + this.data.template + '"');

  var component = this.__component__;
  var compView = component.famousView = new CompView(component);

  var self = this;
  var newComponent, div, view, node;

  // TODO move surface stuff elsewhere
  var options = {};
  if (self.data.size)
    options.size = famousSize(self.data.size);
  if (self.data.origin)
    options.origin = famousSize(self.data.origin);
  if (_.keys(options).length && !self.data.modifier)
    self.data.modifier = 'identity';

  view = self.data.view
    ? (famousCmp.views[self.data.view] || (Famous && Famous[self.data.view]))
    : SequentialLayout;
  node = new view(options);

  if (node.sequenceFrom) {
    compView.sequence = [];
    node.sequenceFrom(compView.sequence);
  }

  // TODO, if parent has sequenceFrom and not add, add to array etc
  if (self.data.modifier) {
    var modifier = famousCmp.modifiers[self.data.modifier];
    modifier = typeof modifier == 'function'
      ? new modifier(component, options)
      : { famous: modifier };

    compView.setNode(modifier.famous).add(node);
    compView.modifierCmp = modifier;
    compView.modifier = modifier.famous;
    if (modifier.postRender)
      modifier.postRender();
  } else
    compView.setNode(node);

  // could do pipe=1 in template helper?
  if (self.data.view == 'Scrollview')
    Engine.pipe(node);

  // Render the given Template (will render children too)
  newComponent = self.data.data
    ? UI.renderWithData(Template[self.data.template], self.data.data, component)
    : UI.render(Template[self.data.template], component);
  console.log('[famous]   Completed render of "' + this.data.template
    + '" to component instance ' + newComponent.guid);

  // If any HTML was generated, create a surface for it
  div = document.createElement('div');
  UI.insert(newComponent, div);
  if (div.innerHTML.trim().length) {
    // TODO, use size var if it exists and no modifier specified
    // TODO, default to dimensions of container?
    // TODO, proper function to recalculate on resize, etc
    compView.surface = new Surface({
      content: div,
      size: [window.innerWidth,undefined]
    });

    compView.sequence.push(compView.surface);
  };
}

Template.famous.destroyed = function() {
  var component = this.__component__;
  console.log('[famous] Famous component ' + this.__component__.guid + ' destroyed');
  component.famousView.destroy();
}

Template.famousEach.created = function() {
  alert('famousEach called');
  return;
  //console.log('\nStarting render for "' + this.data.template + '" in '
  //  + 'famous.created instance with guid ' + this.__component__.guid);

  var self = this;
  var component = self.__component__, parent = famousParent(component);
  var data = self.data.data;
  var size = famousSize(self.data.size);

  // todo, store sequence in parent, store startIndex here (to allow surfaces
  // before, after, inbetween two eaches, etc)

  if (_.isArray(data)) {
    component.famous.sequence = _.map(data, function(row) {
      var div = document.createElement('div');
      var newComponent = UI.renderWithData(Template[self.data.template], row, component);
      UI.insert(newComponent, div);
      return new Surface({
        size: size,
        content: div
      });
    });
  } else {
    typeof(data);
  }

  component.famous.parent.sequenceFrom(component.famous.sequence); 
}

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

famousCmp.dataFromCmp = function(component) {
  while ((component=component.parent) && !component.famous);
  return component ? component.famous : undefined;
}
famousCmp.dataFromTpl = function(tplInstance) {
  return this.dataFromCmp(tplInstance.__component__);
}

famousCmp.modifiers.identity = function(component, options) {
  this.component = component;
  this.famous = new Modifier(_.extend({
    transform : Transform.identity
  }, options));  
}

famousCmp.modifiers.inFront = function(component, options) {
  this.component = component;
  this.famous = new Modifier(_.extend({
    transform : Transform.inFront
  }, options));
}

famousCmp.modifiers.pageTransition = function(component, options) {
  this.component = component;
  this.famous = new Modifier({
    transform : Transform.identity,
    opacity   : 1,
    origin    : [-0.5, -0.5],
    size      : [100, 100]
  });
}

famousCmp.modifiers.pageTransition.prototype.postRender = function() {
  this.famous.setOrigin([0,0], {duration : 5000});
}
