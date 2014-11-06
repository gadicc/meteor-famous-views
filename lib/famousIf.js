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

  // Maintain ordering with other deferred operations
  _.defer(function() {
    fview.sequence = fview.parent.sequence.child();
  });
}

function cleanupChildren(blazeView) {
	var children = blazeView.fview.children;
	for (var i=0; i < children.length; i++)
  	Blaze.remove(children[i].blazeView);
}

function famousIfDestroyed() {
  this.view.fview.destroy(true);
}

FView.famousIfView = new Template('famousIf', function() {
	var blazeView = this;
	var condition = Blaze.getData(blazeView);

  log.debug('famousIf' + " (#" + blazeView.fview.id + ')'
    + ' is now ' + !!condition
    + ' (parent: ' + parentViewName(blazeView.parentView) + ','
    + ' template: ' + parentTemplateName(blazeView.parentView) + ')');

  var dataContext = null /* this.data.data */
    || Blaze._parentData(1) && Blaze._parentData(1, true)
    || Blaze._parentData(0) && Blaze._parentData(0, true)
    || {};

  var unusedDiv = document.createElement('div');
  var template = blazeView.templateContentBlock;

  _.defer(function() {
    // Any time condition changes, remove all old children
    cleanupChildren(blazeView);

    var template = condition
      ? blazeView.templateContentBlock : blazeView.templateElseBlock;

    if (template)
      Blaze.renderWithData(template, dataContext, unusedDiv, null, blazeView);
  });
});

Blaze.registerHelper('famousIf', FView.famousIfView);
FView.famousIfView.created = famousIfCreated;
FView.famousIfView.destroyed = famousIfDestroyed;
