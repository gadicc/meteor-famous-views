FView._classes = {};

wrappers = {
  partial: function(_super, name, famousClass, overrides) {
    var _class;

    if (typeof overrides === 'function') {

      _class = overrides;

    } else {

       _class = function fvWrapper() {
        _super.apply(this, arguments);
      };
      _class.prototype = Object.create(_super.prototype);
      _class.prototype.constructor = _class;

      if (overrides) {

        if (overrides.template) {
          _class.template = Object.create(_super.template);
           _.extend(_class.template, overrides.template);
          delete overrides.template;
        }

        _.extend(_class.prototype, overrides);

      }

      if (!_class.template)
        _class.template = _super.template;

      _class.prototype.className = name;
      _class.prototype.famousClass = famousClass;

    }

    var template = _class.template.make(_class);
    Blaze.registerHelper(name, template);

    FView._classes[name] = _class;
  },

  checkForConflicts: function() {
    var names = [];
    _.each(_.keys(FView._classes), function(name) {
      if (typeof Template[name] !== 'undefined')
        names.push(name);
    });
    if (names.length)
      throw new Error("You have created Template(s) with the same name " +
        "as these famous-views: " + names.join(', ') +
        '.  Nothing will work until you rename them.');
  }
};
