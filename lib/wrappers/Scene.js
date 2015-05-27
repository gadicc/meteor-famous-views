var css = new CSSC();
css.add('.fview-scene', {
  position: 'absolute',
  webkitTransformStyle: 'preserve-3d',
  transformStyle: 'preserve-3d',
  webkitFontSmoothing: 'antialiased',
  webkitTapHighlightColor: 'transparent',
  webkitPerspective: 0,
  perspective: 'none',
  overflow: 'hidden',
});

var SceneView = new Blaze.Template('Famous.Scene', function() {
  // TODO, reactivity
  return null;
});

SceneView.rendered = function() {
  var fview = new MeteorFamousView(
    fviewParentFromBlazeView(this),
    this.data && this.data.id,
    'Scene',
    parentDetails(this)
  );

  fview.blazeView = this.view;
  fview.blazeView._fview = fview;

  var selector;
  var container = this.view._domrange.parentElement;
  if (container.tagName === 'BODY') {
    selector = "body";
    _.each(['body', 'html'], function(el) {
      css.add(el, {
        width: '100%',
        height: '100%',
        margin: '0px',
        padding: '0px'
      });
    });
  } else if (container.id) {
    selector = "#" + container.id;    
  } else {
    selector = _.isNumber(fview.id) ? 'fview'+fview.id : fview.id;
    container.id = selector;
    selector = '#' + selector;
  }
  container.className =
    (container.className === '' ? '' : container.className + ' ') + 'fview-scene';

  fview._scene = fview.node =
    famous.core.FamousEngine.createScene(selector);

  // materialize contents
  Blaze.render(
    fview.blazeView.templateContentBlock,
    document.createElement('div'),
    fview.blazeView
  );
};

Blaze.registerHelper('Scene', SceneView);
