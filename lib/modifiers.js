famousCmp.modifiers = {};

function defaultCreate(options) {
  return new this._modifier.modifier(options);
}

famousCmp.registerModifier = function(name, modifier, options) {
  if (!famousCmp.modifiers[name])
    famousCmp.modifiers[name] = _.extend(
      { create: defaultCreate },
      options,
      { name: name, modifier: modifier }
    );
}

famousCmp.ready(function(require) {

  famousCmp.registerModifier('modifier', famous.core.Modifier);
  famousCmp.registerModifier('StateModifier', famous.modifiers.StateModifier);

  famousCmp.registerModifier('identity', null, {
    create: function(options) {
      return new Modifier(_.extend({
        transform : Transform.identity
      }, options));
    }
  });

  famousCmp.registerModifier('inFront', null, {
    create: function(options) {
      return new Modifier(_.extend({
        transform : Transform.inFront
      }, options));
    }
  });
  
});

/*
famousCmp.modifiers.pageTransition = function(component, options) {
  this.component = component;
  this.famous = new Modifier({
    transform : Transform.identity,
    opacity   : 1,
    origin    : [-0.5, -0.5],
    size      : [100, 100]
  });
};

famousCmp.modifiers.pageTransition.prototype.postRender = function() {
  this.famous.setOrigin([0,0], {duration : 5000});
};
*/