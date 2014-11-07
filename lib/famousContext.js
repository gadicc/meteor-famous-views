var famousContext = new Template('famousContext', function() {
	var data = this.templateInstance().data || {};
  var dataContext = data.data
    || Blaze._parentData(1) && Blaze._parentData(1, true)
    || Blaze._parentData(0) && Blaze._parentData(0, true)
    || {};

	var fview = this.fview = new MeteorFamousView(this, data, true/*noAdd*/);
	fview.children = [];

  var pViewName = parentViewName(this.parentView);
  var pTplName = parentTemplateName(this.parentView);
  log.debug('New famousContext (#' + fview.id + ')'
    + (data.template
      ? ', content from "' + data.template + '"'
      : ', content from inline block')
    + ' (parent: ' + pViewName
    + (pViewName == pTplName
      ? ''
      : ', template: ' + pTplName)
    + ')');

  /*
	this.onViewReady(function() {
		var div = this._domrange.members[0];
		this.fview.node = this.fview.context = famous.core.Engine.createContext(div);
		Blaze.render(this.templateContentBlock, div, null, this);
	});
	return HTML.DIV({class:'famous-context'});
	*/

	this.onViewReady(function () {
		var container = this._domrange.parentElement;
		var template = data.template ? Template[data.template] : this.templateContentBlock;
		fview.node = fview.context = famous.core.Engine.createContext(container);
		Blaze.renderWithData(template, dataContext, container, null, this);
	});
	return null;
});

Blaze.Template.registerHelper('famousContext', famousContext);
Blaze.Template.registerHelper('FamousContext', famousContext);  // alias
