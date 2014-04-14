var Engine = null,
    Modifier = null,
    Surface = null,
    Transform = null;

var mainCtx = null;



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
  console.log(size);
  size = size.split(',');
  var x = parseInt(size[0]), y = parseInt(size[1]);
  return [
    _.isNaN(x) ? undefined : x,
    _.isNaN(y) ? undefined : y
  ];
}

function famousParent(component) {
  var parent = component;
  component.famous = {};

  while ((parent = parent.parent) && !parent.famous);
  component.famous.parent = (parent && parent.famous.node) || mainCtx;

  return parent;
}




Template.famousEach.created = function() {

  var self = this;
  console.log(self);
  Meteor.defer(function() {
    var component = self.__component__, parent = famousParent(component);
    var data = self.data.data;
    var size = famousSize(self.data.size);

    if (_.isArray(data)) {
      console.log(data);
      component.famous.sequence = _.map(data, function(row) {
        var div = document.createElement('div');
        var newComponent = UI.renderWithData(Template[self.data.template], row);
        newComponent.parent = component; UI.insert(newComponent, div);
        console.log(div);
        return new Surface({
          size: size,
          content: div
        });
      });
    }

    component.famous.parent.sequenceFrom(component.famous.sequence); 
  });
}

Template.famous.created = function() {
  console.log(this.data.template);
  console.log(this);

  var self = this;
  // Defer necessary since inner templates created after outer template
  // created hook called, so famousSurface etc won't be set yet.
  Meteor.defer(function() {

    var newComponent, div, view, node;
    var component = self.__component__, parent = famousParent(component);

    newComponent = self.data.data
      ? UI.renderWithData(Template[self.data.template], self.data.data)
      : UI.render(Template[self.data.template]);
    newComponent.parent = component;

    div = document.createElement('div');
    UI.insert(newComponent, div);

    view = self.data.view
      ? (FamousCmp.views[self.data.view] || (Famous && Famous[self.data.view]))
      : Surface;
    component.famous.node = node = new view({
      content: div
    });

    if (self.data.modifier) {
      var modifier = new FamousCmp.modifiers[self.data.modifier](component);
      component.famous.parent
        .add(modifier.famous)
        .add(node);
      modifier.postRender();
    } else
      component.famous.parent.add(node);

    if (self.data.view == 'Scrollview')
      Engine.pipe(node);

  });
}


FamousCmp.modifiers.pageTransition = function(component) {
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
