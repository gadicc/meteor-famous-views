var mainCtx = null;

var Engine = null,
    Modifier = null,
    Surface = null,
    Transform = null;

FamousCmp = {};
FamousCmp.views = {};
FamousCmp.modifiers = {};

Meteor.startup(function() {
  require("famous-polyfills"); // Add polyfills
  require("famous/core/famous"); // Add the default css file

  // Basic deps
  Engine           = require("famous/core/Engine");
  Modifier         = require("famous/core/Modifier");
  Surface          = require("famous/core/Surface");
  Transform        = require("famous/core/Transform");
//  RenderController = require("famous/views/RenderController");

  FamousCmp.views['Scrollview'] = require('famous/views/Scrollview');

  // Move to transitioner
  FamousCmp.views['SequentialLayout'] = require('famous/views/SequentialLayout');

  if (FamousCmp.mainCtx)
    mainCtx = FamousCmp.mainCtx;
  else {
    if (FamousCmp.mainCtx !== false)
      console.log('[famousCmp] Creating a new main context.  If you already have '
        + 'your own, set famousCmp.mainCtx = yourMainContext (or to false to get '
        + 'rid of this warning)');
    FamousCmp.mainCtx = mainCtx = Engine.createContext();
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

function famousParent(component, addable) {
  // skipping the immediate parent is intentional (it's where our own famous is set)
  var parent = component;
  while ((parent = parent.parent)
    && !(parent.famous && (parent.famous.node.add || parent.famous.node.sequenceFrom)));
  // for (parent = component; parent && !parent.famous; parent = parent.parent);

  component.famous = {};
  component.famous.parent = (parent && parent.famous.node) || mainCtx;

  console.log('famousParent on guid ' + component.guid + ' found '
    + (parent && parent.guid));
  return parent;
}


Template.famous.created = function() {
  console.log('\nStarting render for "' + this.data.template + '" in '
    + 'famous.created instance with guid ' + this.__component__.guid);

  var self = this;
  var newComponent, div, view, node;
  var component = self.__component__, parent = famousParent(component);

  // TODO move surface stuff elsewhere
  var options = {};
  if (self.data.size)
    options.size = famousSize(self.data.size);
  if (self.data.origin)
    options.origin = famousSize(self.data.origin);
  if (_.keys(options).length && !self.data.modifier)
    self.data.modifier = 'identity';

  view = self.data.view
    ? (FamousCmp.views[self.data.view] || (Famous && Famous[self.data.view]))
    : Surface;
  // need to create and set before children templates are created
  component.famous.node = node = new view(options);
  console.log(options);

  newComponent = self.data.data
    ? UI.renderWithData(Template[self.data.template], self.data.data, component)
    : UI.render(Template[self.data.template], component);
  console.log('Rendered Component of kind "' + this.data.template
    + '" with gid ' + newComponent.guid);

  if (newComponent.destroyed)
    newComponent.origDestroyed = newComponent.destroyed;
  newComponent.destroyed = famousDestroyed; 

  console.log('newcomp');
  console.log(newComponent);
  if (!FamousCmp.cmps)
    FamousCmp.cmps = [];
  FamousCmp.cmps.push(newComponent);

  div = document.createElement('div');
  UI.insert(newComponent, div);

  // todo, which if any content
  console.log('want to setcontent', div);
  if (node.setContent && 1 || div.innerHTML != "")
    node.setContent(div);
  else
    console.log('skipped', !!node.setContent, !!div.innerHTML, div);

  if (self.data.modifier) {
    var modifier = new FamousCmp.modifiers[self.data.modifier](component, options);
    component.famous.parent
      .add(modifier.famous)
      .add(node);
    component.famous.modifierCmp = modifier;
    component.famous.modifier = modifier.famous;
    if (modifier.postRender)
      modifier.postRender();
  } else
    component.famous.parent.add(node);

  // could do pipe=1 in template helper?
  if (self.data.view == 'Scrollview')
    Engine.pipe(node);
}

Template.famous.destroyed = function() {
  console.log('destroyed');
  console.log(this);
  FamousCmp.cmp = this;
}

var famousDestroyed = function() {
  console.log('famousDestroyed');
  console.log(this);
  if (this.famous)
  if (this.origDestroyed)
    this.origDestroyed.apply(this, arguments);
}

Template.famousEach.created = function() {
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
  }

  component.famous.parent.sequenceFrom(component.famous.sequence); 
}



FamousCmp.modifiers.identity = function(component, options) {
  this.component = component;

  console.log(_.extend({
    transform : Transform.identity,
  }, options));

  this.famous = new Modifier(_.extend({
    transform : Transform.identity
  }, options));  
}

FamousCmp.modifiers.inFront = function(component, options) {
  this.component = component;
  this.famous = new Modifier({
    transform : Transform.inFront
  });
}

FamousCmp.modifiers.pageTransition = function(component, options) {
  this.component = component;
  this.famous = new Modifier({
    transform : Transform.identity,
    opacity   : 1,
    origin    : [-0.5, -0.5],
    size      : [100, 100]
  });
}

FamousCmp.modifiers.pageTransition.prototype.postRender = function() {
  this.famous.setOrigin([0,0], {duration : 5000});
}
