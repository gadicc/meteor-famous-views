/*
 * In brief, on Create we setup a child sequence to serve as a placeholder for
 * any children (so that order is retained).  On reactive render, we destroy any
 * existing children and render the contentBlock / elseBlock (as our children).
 * On destroy, we cleanup and remove (TODO) child sequence placeholder.
 */

/* Other thoughts:
 * - Currently this is only used to retain order in a sequence
 * - If used in a surface we could force rerun of autoHeight, etc?
 */

function famousIfCreated() {
  var blazeView = this.view;
  var fview = blazeView.fview = new MeteorFamousView(blazeView, {});

  log.debug('New famousIf' + " (#" + fview.id + ')'
    + ' (parent: ' + parentViewName(blazeView.parentView) + ','
    + ' template: ' + parentTemplateName(blazeView.parentView) + ')');

  fview.kind = 'famousIf';
  fview.sequence = fview.parent.sequence.child();
}

function cleanupChildren(blazeView) {
	var children = blazeView.fview.children;
	for (var i=0; i < children.length; i++)
  	Blaze.remove(children[i].blazeView);
}

function famousIfDestroyed() {
	var blazeView = this.view;
	cleanupChildren(blazeView);

  log.debug("Destroying famousIf (#" + fview.id + ')');
  // TODO, support for sequence destroychild
  // but while missing there is no real impact except for some small overhead
}

FView.famousIfView = new Template('famousIf', function() {
	var blazeView = this;
	var condition = Blaze.getData(blazeView);

  var dataContext = null /* this.data.data */
    || Blaze._parentData(1) && Blaze._parentData(1, true)
    || Blaze._parentData(0) && Blaze._parentData(0, true)
    || {};

  var unusedDiv = document.createElement('div');
  var template = blazeView.templateContentBlock;

  // Any time condition changes, remove all old children
  cleanupChildren(blazeView);

  var template = condition
  	? blazeView.templateContentBlock : blazeView.templateElseBlock;

  if (template)
	  Blaze.renderWithData(template, dataContext, unusedDiv, null, blazeView);
});

Blaze.registerHelper('famousIf', FView.famousIfView);
FView.famousIfView.created = famousIfCreated;
FView.famousIfView.destroyed = famousIfDestroyed;
