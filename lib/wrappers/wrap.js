wrapFunc = function(fvClassBase, name, famousClass, overrides) {
  var fvClass = _.extend({}, fvClassBase,
    { name: name, famousClass: famousClass, _super: fvClassBase }, overrides);

  var template = fvClass.makeTemplate(fvClass);
  Blaze.registerHelper(fvClass.name, template);
};
