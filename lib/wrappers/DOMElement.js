var DOMElement = famous.domRenderables.DOMElement;

Blaze.registerHelper('DOMElement', new Blaze.Template('Famous.DOMElement', function() {
  var blazeView = this;
  var fview = fviewParentFromBlazeView(blazeView);

  // XXX
  //fview.node.setSizeMode(famous.core.Node.RENDER_SIZE, famous.core.Node.RENDER_SIZE);


  fview.domElement = new DOMElement(fview.node);
  var path = fview.node.getId();
  var context = path.split('/', 1)[0];
  var domRenderer = FamousEngine.compositor.getOrSetContext(context).DOMRenderer;

  fview._loadedDomRenderer = function() {
    domRenderer.loadPath(path);
    domRenderer.findTarget();
    return domRenderer;
  };

  fview.updateSize = function() {
    domRenderer.loadPath(path);
    domRenderer.findTarget();
    domRenderer.setSize(
      domRenderer._target.explicitWidth ? false : domRenderer._target.size[0],
      domRenderer._target.explicitHeight ? false : domRenderer._target.size[1]
    );
  };

  fview.updateSizeDeferred = function() {
    _.defer(function() {
      fview.updateSize();
    });
  };

  var id = fview.node.addComponent({
    onUpdate: function(time) {
      domRenderer.loadPath(path);
      domRenderer.findTarget();
      if (domRenderer._target) {
        domRenderer.findChildren();

        domRenderer._target.content = document.createElement('div');
        domRenderer._target.content.classList.add('famous-dom-element-content');
        domRenderer._target.element.insertBefore(
            domRenderer._target.content,
            domRenderer._target.element.firstChild
        );

        Blaze.render(
          blazeView.templateContentBlock,
          domRenderer._target.content,
          blazeView
        );

        domRenderer.setSize(
          domRenderer._target.explicitWidth ? false : domRenderer._target.size[0],
          domRenderer._target.explicitHeight ? false : domRenderer._target.size[1]
        );
      } else {
        fview.node.requestUpdate(id);
      }
    }
  });
  fview.node.requestUpdate(id);

}));
