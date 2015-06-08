FView._classes = {};

wrappers = {
  partial: function(classBase, name, famousClass, overrides) {
    var _class = _.extend({}, classBase,
      { name: name, famousClass: famousClass, _super: classBase }, overrides);

    var template = _class.makeTemplate(_class);
    Blaze.registerHelper(_class.name, template);

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
