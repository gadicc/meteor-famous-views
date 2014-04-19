famousCmp.modifiers.StateModifier = function(component, options) {
  this.component = component;
  this.famous = new StateModifier(options);
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
