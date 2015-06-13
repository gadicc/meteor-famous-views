FView.ready(function() {
  // Yes, to track everything, and remove repurposed nodes
  var rendered = {};
  var renderedPaths = {};

  FView.wrapComponent('DOMElement', famous.domRenderables.DOMElement, {
    attrUpdate: function(key, value, oldValue, data, firstTime) {
      var comp = this;

      if (!this.data) {
        comp.data = {
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
            comp.instance.addClass(className);
            comp.data.classes[className] = true;
          });
          _.each(
            _.difference(_.keys(comp.data.classes), value),
            function(className) {
                comp.instance.removeClass(className);
                delete comp.data.classes[className];
            }
          );
          //comp.view.setClasses(value);
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
          //comp.view.setProperties(value);

          _.each(_.keys(comp.data.properties), function(prop) {
            if (!value[prop]) {
              comp.instance.setProperty(prop, '');
              delete comp.data.properties[prop];
            }
          });
          for (var prop in value) {
            comp.instance.setProperty(prop, value[prop]);
            comp.data.properties[prop] = true;
          }
          break;

        default:
          comp.instance.setAttribute(key, value);
      }
    },

    destroy: function() {
      var domRenderer = this.fview._loadedDomRenderer();
      delete domRenderer._target.content._fview;
      Blaze.remove(this.renderedView);
      this.__proto__.__proto__.destroy.apply(this, arguments);
    },

    template: {

      onCreate: function(_class) {
        return function() {
          var blazeView = this.view;
          var fview = fviewParentFromBlazeView(blazeView);
          var comp = new _class();
          blazeView._fviewComp = comp;

          comp.fview = fview;
          comp.blazeView = blazeView;
          comp.instance = comp.newComponentInstance(fview);

          fview.components[_class.className] = comp;      
          fview.domElement = comp.instance; // shortcut

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
            FView.defer(function() {
              fview.updateSize();
            });
          };

          var viewToRender;
          if (blazeView.parentView && blazeView.parentView.__isTemplateWith) {
            viewToRender = Blaze._TemplateWith(
              Blaze._parentData(1, true /*_functionWrapped*/),
              function() { return blazeView.templateContentBlock; }
            );
          } else
            viewToRender = blazeView.templateContentBlock;

          var blazeRenderComponent = fview.node.addComponent({
            onUpdate: function(time) {
              domRenderer.loadPath(path);
              domRenderer.findTarget();
              if (domRenderer._target &&
                  !(domRenderer._target.content && domRenderer._target.content._fview)) {
                // Remove when merged: https://github.com/Famous/engine/pull/58
                domRenderer.findChildren();

                if (!domRenderer._target.content) {
                  domRenderer._target.content = document.createElement('div');
                  domRenderer._target.content.classList.add('famous-dom-element-content');
                  domRenderer._target.element.insertBefore(
                      domRenderer._target.content,
                      domRenderer._target.element.firstChild
                  );
                }
                // make sure we don't rerender to an existing element
                domRenderer._target.content._fview = true;

                // Store renderedView ref for cleanup on distroy()
                fview.components[_class.className].renderedView =
                  Blaze.render(viewToRender, domRenderer._target.content, blazeView);

                domRenderer.setSize(
                  domRenderer._target.explicitWidth ? false : domRenderer._target.size[0],
                  domRenderer._target.explicitHeight ? false : domRenderer._target.size[1]
                );
              } else {
                fview.node.requestUpdate(blazeRenderComponent);
              }
            }
          });
          fview.node.requestUpdate(blazeRenderComponent);
        /*
          // var renderedPaths = {};  <-- declared in file scope
          var origNodeId = fview.node.getLocation();
          var blazeRenderComponent = fview.node.addComponent({
            onMount: function(node, id) {
              var rendered, nodeId = node.getLocation();
              console.log('unMount', 'nodeId', nodeId, 'origNodeId', nodeId);

              if (rendered = renderedPaths[nodeId]) {
                // Check that the previous location wasn't destroyed already by us
                if (!rendered.blazeView.isDestroyed) {
                  log.debug('Node re-using previous location, destroying/rerendering DOMElement in Blaze');
                  Blaze.remove(rendered.blazeView);
                  rendered.div.parentNode.removeChild(rendered.div);
                }
              } else
                rendered = renderedPaths[nodeId] = {};

              // getElementFromDOMElement is a callback version of the discussed Promise
              getElementFromDOMElement(fview.node, function(el) {
                rendered.div = document.createElement('div');
                rendered.div.style.width = "100%";
                rendered.div.style.height = "100%";
                rendered.div.style.position = "absolute";
                el.appendChild(rendered.div);

                rendered.blazeView = Blaze.render(
                  blazeView.templateContentBlock,
                  rendered.div,
                  blazeView
                );
              });
            }
          });
        */
        }
      }
    }
  });
});