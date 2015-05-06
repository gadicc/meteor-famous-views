FView._registerables = {};  // used in views.js too

function defaultCreate(_options) {
  // Don't mutate original _options.  Note: shallow copy.
  var i, options = Object.create(_options);

  // Default modifier can't handle "true" size
  // Be careful not to mutate the original size ARRAY which might already be used elsewhere
  if (_options.size) {
    options.size = [];
    for (i=0; i < _options.size.length; i++)
      options.size[i] = _options.size[i] === true ? undefined : _options.size[i];
  }

  return new this._modifier.constructor(options);
}

/* Available in JS via `FView._registerables.Modifier` and in templates via
  `{{#famous modifier='Scrollview'}}` or just `{{#Modifier}}`. */
FView.registerModifier = function(name, modifier, options) {
  if (FView._registerables[name])
    return;

  FView._registerables[name] = _.extend(
    { create: defaultCreate },
    options,
    { name: name, constructor: modifier, type: 'modifier' }
  );

  var fview = FView.famousView;
  var tpl = new Template('Famous.' + name, fview.renderFunction);
  tpl.created = fview.created;
  tpl.destroyed = fview.destroyed;
  Blaze.registerHelper(name, tpl);
};

FView.ready(function(require) {
  var Modifier = famous.core.Modifier;

  /*
   * "Modifier" (the base class) should not be used for dynamic
   * updates (as per the docs deprecating setXXX methods).  As
   * such, we set up everything in `create` vs an `attrUpdate`
   * function.
   */
  FView.registerModifier('Modifier', Modifier);

  /* simple short cuts below */

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

  FView.registerModifier('behind', null, {
    create: function(options) {
      return new Modifier(_.extend({
        transform : Transform.behind
      }, options));
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
