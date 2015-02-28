FView.ready(function() {
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
      var amount;

      switch(key) {
        case 'transform': case 'opacity': case 'align': case 'size': case 'origin':
          modifierMethod(this, 'set'+key[0].toUpperCase()+key.substr(1), value, options);
          break;

        // Below are helpful shortcuts for transforms

        case 'translate':
          modifierMethod(this, 'setTransform',
            Transform.translate.apply(null, value), options);
          break;

        case 'scaleX': case 'scaleY': case 'scaleZ':
          amount = (value || 0) - (oldValue || 0);
          var scale = [1,1,1];
          if (key == 'scaleX') scale[0] = amount;
          else if (key == 'scaleY') scale[1] = amount;
          else scale[2] = amount;
          modifierMethod(this, 'setTransform', Transform.multiply(
            this.modifier.getFinalTransform(),
            Transform.scale.apply(null, scale)
          ), options);
          break;

        case 'skewX': case 'skewY':
          amount = (value || 0) - (oldValue || 0);
          modifierMethod(this, 'setTransform', Transform.multiply(
            this.modifier.getFinalTransform(),
            Transform[key](degreesToRadians(amount))
          ), options);
          break;

        case 'skewZ': // doesn't exist in famous
          amount = (value || 0) - (oldValue || 0);
          modifierMethod(this, 'setTransform', Transform.multiply(
            this.modifier.getFinalTransform(),
            Transform.skew(0, 0, degreesToRadians(amount))
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

function modifierMethod(fview, method, value, options) {
  if (typeof options.halt !== 'undefined' ?
      options.halt : fview.modifierTransitionHalt)
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
