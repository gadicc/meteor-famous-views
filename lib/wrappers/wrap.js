var list = [];

wrappers = {
  partial: function(fvClassBase, name, famousClass, overrides) {
    var fvClass = _.extend({}, fvClassBase,
      { name: name, famousClass: famousClass, _super: fvClassBase }, overrides);

    var template = fvClass.makeTemplate(fvClass);
    Blaze.registerHelper(fvClass.name, template);

    list.push(name);
  },

  checkForConflicts: function() {
    var names = [];
    _.each(list, function(name) {
      if (typeof Template[name] !== 'undefined')
        names.push(name);
    });
    if (names.length)
      throw new Error("You have created Template(s) with the same name " +
        "as these famous-views: " + names.join(', ') +
        '.  Nothing will work until you rename them.');
  }
};
