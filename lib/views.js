FView.views = {};

/* Available in JS via `FView.views.Scrollview` and in templates via
	`{{#famous view='Scrollview'}}` or just `{{#Scrollview}}`. */
FView.registerView = function(name, famousView, options) {
	if (FView.views[name])
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

	FView.views[name]
		= _.extend(options || {}, { name: name, class: famousView });
}

/* Do we still need this?  Most people explicitly register views with
   registerView() these days, to get the template helper */
FView.getView = function(name)  {
	// @famono silent
  if (FView.views[name])
    return FView.views[name].class;
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
