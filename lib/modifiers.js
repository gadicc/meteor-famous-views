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

  function modifierMethod(fview, method, value) {
    if (fview.modifierTransitionHalt)
      fview.modifier.halt();

    fview.modifier[method](value,
      fview.modifierTransition, fview.modifierTransitionDone);
  }
  FView.registerModifier('StateModifier', famous.modifiers.StateModifier, {

    attrUpdate: function(key, value, data, firstTime) {
      switch(key) {
        case 'transform': case 'opacity': case 'align': case 'size':
          modifierMethod(this, 'set'+key[0].toUpperCase()+key.substr(1), value);
          break;

        // Below are helpful shortcuts for transforms

        case 'skewX': case 'skewY':
          modifierMethod(this, 'setTransform', Transform.multiply(
            Transform.skewX(data.skewX), Transform.skewY(data.skewY)
          ));
          break;

        // Note, we take degrees and convert to radians
        case 'rotateX': case 'rotateY': case 'rotateZ':
          modifierMethod(this, 'setTransform', Transform.multiply(
            Transform.rotateX(data.rotateX ? data.rotateX * Math.PI / 180 : 0),
            Transform.rotateY(data.rotateY ? data.rotateY * Math.PI / 180 : 0),
            Transform.rotateZ(data.rotateZ ? data.rotateZ * Math.PI / 180 : 0)
          ));
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