var DOMElement = famous.domRenderables.DOMElement;

var attrUpdate = function(key, value, oldValue, data, firstTime) {
  var fview = this;

  if (!fview._domElementData) {
    fview._domElementData = {
      // yeah this is all stored in domElement as well, but then we're not separate
      classes: {},
      properties: {}
    }
  }

  switch(key) {
    // TODO, optimize
    case 'class':
    case 'classes':
      if (Match.test(value, String))
        value = value === "" ? [] : value.split(" ");
      else if (!Match.test(value, [String]))
        throw new Error('DOMElement class= expects string or array of strings, not ' +
          JSON.stringify(value));
      _.each(value, function(className) {
        fview.domElement.addClass(className);
        fview._domElementData.classes[className] = true;
      });
      _.each(
        _.difference(_.keys(fview._domElementData.classes), value),
        function(className) {
            fview.domElement.removeClass(className);
            delete fview._domElementData.classes[className];
        }
      );
      //this.view.setClasses(value);
      break;

    // TODO, optimize
    case 'style':
    case 'properties':
      if (Match.test(value, String)) {
        var parts = value.split(';'), pair;
        value = {};
        for (var i=0; i < parts.length; i++) {
          pair = parts[i].split(':');
          if (pair.length > 1)
            value[pair[0].trim()] = pair[1].trim();
        }
      }
      if (!Match.test(value, Object))
        throw new Error('DOMElement properties= expects string or key-value dictionary ' + 
          ', not ' + JSON.stringify(value));
      //this.view.setProperties(value);

      _.each(_.keys(fview._domElementData.properties), function(prop) {
        if (!value[prop]) {
          fview.domElement.setProperty(prop, '');
          delete fview._domElementData.properties[prop];
        }
      });
      for (var prop in value) {
        fview.domElement.setProperty(prop, value[prop]);
        fview._domElementData.properties[prop] = true;
      }
      break;

    default:
      fview.domElement.setAttribute(key, value);
  }
};

// Note, we can't re-use Node's renderFunc, since this is a COMPONENT *on* the node
// However, we should modularize common code.
var DOMElementView = new Blaze.Template('Famous.DOMElement', function() {
  var data = Blaze.getData(this);
  if (!data)
    return null;

  var blazeView = this;
  var tpl = blazeView._templateInstance;
  //var fview = blazeView._fview;
  var fview = fviewParentFromBlazeView(blazeView);

  delete data.id;
  delete data._onRender;

  var changed = {};
  var orig = {};

  for (var key in data) {
    var value = data[key];
    if (value !== '__FVIEW_SKIP__' &&
        (!blazeView.hasRendered || !EJSON.equals(value, tpl.data[key]))) {
      orig[key] = blazeView.hasRendered ? tpl.data[key] : null;
      changed[key] = tpl.data[key] = value;
    }
  }

  for (var key in changed)
    attrUpdate.call(fview,
      key, changed[key], orig[key], tpl.data, !blazeView.hasRendered);

  blazeView.hasRendered = true;
  return null;
});

DOMElementView.created = function() {
  var blazeView = this.view;
  var fview = fviewParentFromBlazeView(blazeView);

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
};

Blaze.registerHelper('DOMElement', DOMElementView);