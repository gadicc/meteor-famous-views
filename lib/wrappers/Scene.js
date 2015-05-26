// TODO, size, class
/*
 * Completely non-reactive, must never re-render
 */
Blaze.registerHelper('Scene', new Blaze.Template('Famous.Scene', function() {
  var fview = new MeteorFamousView(fviewParentFromBlazeView(this), null, 'Scene',
    parentDetails(this));
  this._fview = fview; fview._blazeView = this;

  this.onViewReady(function() {
    fview._scene = fview.node =
      famous.core.FamousEngine.createScene('#'+fview._blazeView._templateInstance.firstNode.id);

    Blaze.render(
      fview._blazeView.templateContentBlock,
      document.createElement('div'),
      fview._blazeView
    );
  });

  return HTML.DIV({ id: _.isNumber(fview.id) ? 'fview' + fview.id : fview.id });
}));
