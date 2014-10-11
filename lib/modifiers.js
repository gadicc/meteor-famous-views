FView.modifiers = {};

function defaultCreate(options) {
  return new this._modifier.modifier(options);
}

FView.registerModifier = function(name, modifier, options) {
  if (!FView.modifiers[name])
    FView.modifiers[name] = _.extend(
      { create: defaultCreate },
      options,
      { name: name, modifier: modifier }
    );
}

FView.ready(function(require) {

  FView.registerModifier('modifier', famous.core.Modifier);

  FView.registerModifier('identity', null, {
    create: function(options) {
      return new Modifier(_.extend({
        transform : Transform.identity
      }, options));
    }
  });

  FView.registerModifier('inFront', null, {
    create: function(options) {
      return new Modifier(_.extend({
        transform : Transform.inFront
      }, options));
    }
  });

  function modifierMethod(fview, method, value, options) {
    if (typeof options.halt !== 'undefined'
        ? options.halt : fview.modifierTransitionHalt)
      fview.modifier.halt();

    fview.modifier[method](
      value,
      options.transition || fview.modifierTransition,
      options.done || fview.modifierTransitionDone
    );
  }
  function degreesToRadians(x) {
    return x * Math.PI / 180;
  }
  FView.registerModifier('StateModifier', famous.modifiers.StateModifier, {

    attrUpdate: function(key, value, oldValue, data, firstTime) {
      // Allow for values like { value: 30, transition: {}, halt: true }
      var options = {};
      if (typeof value === 'object' && value && typeof value.value !== 'undefined') {
        options = value;
        value = options.value;
      }
      if (typeof oldValue === 'object' && oldValue && typeof oldValue.value !== 'undefined')
        oldValue = oldValue.value;

      switch(key) {
        case 'transform': case 'opacity': case 'align': case 'size':
          modifierMethod(this, 'set'+key[0].toUpperCase()+key.substr(1), value, options);
          break;

        // Below are helpful shortcuts for transforms

        case 'translate':
          modifierMethod(this, 'setTransform',
            Transform.translate.apply(null, value), options);
          break;

        case 'scaleX': case 'scaleY': case 'scaleZ':
          var amount = degreesToRadians((value || 0) - (oldValue || 0));
          var scale = [0,0,0];
          if (key == 'scaleX') scale[0] = amount;
          else if (key == 'scaleY') scale[1] = amount;
          else scale[2] = amount;
          modifierMethod(this, 'setTransform', Transform.multiply(
            this.modifier.getFinalTransform(),
            Transform.scale.apply(null, scale)
          ), options);
          break;

        case 'skewX': case 'skewY':
          var skewBy = (value || 0) - (oldValue || 0);
          modifierMethod(this, 'setTransform', Transform.multiply(
            this.modifier.getFinalTransform(),
            Transform[key](degreesToRadians(skewBy))
          ), options);
          break;

        case 'skewZ': // doesn't exist in famous
          var skewBy = (value || 0) - (oldValue || 0);
          modifierMethod(this, 'setTransform', Transform.multiply(
            this.modifier.getFinalTransform(),
            Transform.skew(0, 0, degreesToRadians(skewBy))
          ), options);
          break;

        case 'rotateX': case 'rotateY': case 'rotateZ':
          // value might be undefined from Session with no SessionDefault
          var rotateBy = (value || 0) - (oldValue || 0);
          modifierMethod(this, 'setTransform', Transform.multiply(
            this.modifier.getFinalTransform(),
            Transform[key](degreesToRadians(rotateBy))
          ), options);
          break;
      }
    }
  });


});

/*
FView.modifiers.pageTransition = function(blazeView, options) {
  this.blazeView = blazeView;
  this.famous = new Modifier({
    transform : Transform.identity,
    opacity   : 1,
    origin    : [-0.5, -0.5],
    size      : [100, 100]
  });
};

FView.modifiers.pageTransition.prototype.postRender = function() {
  this.famous.setOrigin([0,0], {duration : 5000});
};
*/