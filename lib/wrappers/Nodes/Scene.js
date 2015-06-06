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

FView.wrap('Scene', null, {

  makeTemplate: function(fvClass) {
    var template = fvClass._super.makeTemplate(fvClass);
    template.rendered = fvClass.templateRendered;
    return template;
  },

  dismount: function() {
    // FamousEngine does not destroy scenes #182
    // https://github.com/Famous/engine/issues/182
    this._scene.dismount();
  },

  renderFunc: function() {
    // There are no reactive attributes on a Scene
    return null;
  },

  templateCreated: function() {
    var fview = new MeteorFamousView(
      fviewParentFromBlazeView(this),
      this.data && this.data.id,
      'Scene',
      parentDetails(this)
    );

    fview.blazeView = this.view;
    fview.blazeView._fview = fview;
    fview.fvClass = this.view.template._fviewClass;
    fview.components = {};
  },

  templateRendered: function() {
    var blazeView = this.view;
    var fview = blazeView._fview;
    var data = this.data || {};

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

    var viewToRender;
    if (blazeView.parentView && blazeView.parentView.__isTemplateWith) {
      viewToRender = Blaze._TemplateWith(
        Blaze._parentData(1, true /*_functionWrapped*/),
        function() { return fview.blazeView.templateContentBlock; }
      );
    } else
      viewToRender = fview.blazeView.templateContentBlock;

    // This materializes the Node's spacebars contents; div is never used
    Blaze.render(viewToRender, unusedDiv, fview.blazeView);

    if (data._onRender) {
      var onRender = getHelperFunc(blazeView, data._onRender);
      if (onRender)
        onRender.call(fview);
      else
        log.error("No such helper for _onRender: " + data._onRender);
      delete data._onRender;
    }
  }
});
