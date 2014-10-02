/*
 * In brief, on Create we setup a child sequence to serve as a placeholder for
 * any children (so that order is retained).  On reactive render, we destroy any
 * existing children and render the contentBlock / elseBlock (as our children).
 * On destroy, we cleanup and remove (TODO) child sequence placeholder.
 */

/* Other thoughts:
 * - Currently this is only used to retain order in a sequence
 * - If used in a surface we could force rerun of autoHeight, etc?
 * - Like the old famousEach, unclear how well we handle preventDestroy() etc
 *   the new famousEach code should be refactored so it works more generally
 *   no matter where it's run.
 */

function famousIfCreated() {
  var blazeView = this.view;

  log.debug('New famousIf'
    + ' (parent: ' + parentViewName(blazeView.parentView) + ','
    + ' template: ' + parentTemplateName(blazeView.parentView) + ')');

  // famousEach specific: don't create new MeteorFamousView
	var fview = blazeView.fview = {};
  var parent = blazeView;
  while ((parent=parent.parentView) && !parent.fview);

  fview.parent = parent ? parent.fview : { node: mainCtx };
  fview.sequence = fview.parent.sequence.child();
  fview.children = [];
  fview.kind = 'famousIf';
}

function cleanupChildren(blazeView) {
	var fview = blazeView.fview;
	var children = fview.children;
	var sequence = fview.sequence;

	for (var i=0; i < children.length; i++) {
  	Blaze.remove(children[i].blazeView);
  	children.splice(i, 1);
  	sequence.splice(i, 1);
  }
}

function famousIfDestroyed() {
	var blazeView = this.view;

	cleanupChildren(blazeView);

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
