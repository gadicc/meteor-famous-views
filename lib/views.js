/* Note, `modifiers.js` is called first, so FView.registerables exists */

/* Available in JS via `FView._registerables.Scrollview` and in templates via
  `{{#famous view='Scrollview'}}` or just `{{#Scrollview}}`. */
FView.registerView = function(name, famousView, options) {
  if (FView._registerables[name])
    return;

  /*
  var tpl = _.clone(FView.famousView);
  tpl.viewName = 'Famous.' + name;
  console.log(tpl);
  */

  var fview = FView.famousView;
  var tpl = new Template('Famous.' + name, fview.renderFunction);
  tpl.created = fview.created;
  tpl.destroyed = fview.destroyed;
  Blaze.registerHelper(name, tpl);

  FView._registerables[name] = _.extend(
    { create: defaultCreate },
    options || {},
    { name: name, constructor: famousView, type: 'view' }
  );
};

function defaultCreate(options) {
  return new this._view.constructor(options);
}

/* Do we still need this?  Most people explicitly register views with
   registerView() these days, to get the template helper */
/*
FView.getView = function(name)  {
  // @famono silent
  if (FView.views[name])
    return FView.views[name].constructor;
  if (typeof Famous !== 'undefined' && Famous[name])
    return Famous[name];
  if (typeof Famous !== 'undefined' && famous.Views && Famous.Views[name])
    return Famous.Views[name];
  if (typeof famous !== 'undefined' && famous.views && famous.views[name])
    return famous.views[name];

  /// XXX temp for proof-of-concept
  if (FView.modifiers[name])
    return FView.modifiers[name].modifier;

  else
    throw new Error('Wanted view "' + name + '" but it doesn\'t exists.'
      + ' Try FView.registerView("'+name+'", require(...))');
}
*/
