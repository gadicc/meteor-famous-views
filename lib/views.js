famousCmp.views = {};

/* Available in JS via `famousCmp.views.Scrollview` and in templates via
	`{{#famous view='Scrollview'}}` or just `{{#Scrollview}}`. */
famousCmp.registerView = function(name, famousView, options) {
	if (famousCmp.views[name])
		return;

  var tpl = _.clone(famousCmp.famousView);
  tpl.__viewName = 'Famous.' + name;
  UI.registerHelper(name, tpl);

	famousCmp.views[name]
		= _.extend(options || {}, { name: name, famousView: famousView });
}

/* Do we still need this?  Most people explicitly register views with
   registerView() these days, to get the template helper */
famousCmp.getView = function(name)  {
	// @famono silent
  if (famousCmp.views[name])
    return famousCmp.views[name].famousView;
  if (typeof Famous !== 'undefined' && Famous[name])
    return Famous[name];
  if (typeof Famous !== 'undefined' && famous.Views && Famous.Views[name])
    return Famous.Views[name];
  if (typeof famous !== 'undefined' && famous.views && famous.views[name])
    return famous.views[name];
  else
    throw new Error('Wanted view "' + name + '" but it doesn\'t exists.'
      + ' Try famousCmp.registerView("'+name+'", require(...))');
}
