FView.ready(function(require) {
  FView.registerView('Surface', famous.core.Surface, {

    add: function(child_fview, child_options) {
      var blazeView = this.blazeView;

      log.error("You tried to embed a " + child_fview._view.name + " inside " +
        "a Surface (parent: " + parentViewName(blazeView) + ", template: " +
        parentTemplateName(blazeView) + ").  Surfaces are endpoints in the " +
        "Famous Render Tree and may not contain children themselves.  See " +
        "https://github.com/gadicc/meteor-famous-views/issues/78 for more info.");

      throw new Error("Cannot add View to Surface");
    },

    attrUpdate: function(key, value, oldValue, data, firstTime) {
      switch(key) {
        case 'size':
          // Let our modifier control our size
          // Long term, rather specify modifierSize and surfaceSize args?
          if (this._modifier && this._modifier.name == 'StateModifier')
            this.surface.setSize([undefined,undefined]);
          else {
            this.surface.setSize(value);
          }
          break;

        case 'class':
        case 'classes':
          if (Match.test(value, String))
            value = value === "" ? [] : value.split(" ");
          else if (!Match.test(value, [String]))
            throw new Error('Surface class= expects string or array of strings');
          value.push(this.surfaceClassName);
          this.view.setClasses(value);
          break;

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
          } else if (!Match.test(value, Object))
            throw new Error('Surface properties= expects string or key-value dictionary');
          this.view.setProperties(value);
          break;
      }
    },

    onDestroy: function() {
      if (this.mutationObserver)
        this.mutationObserver.disconnect();
    },

    postRender: function() {
      if (this.template && this.template.onDocumentDom) {
        var fview = this;
        var cb = function() {
          Engine.defer(function() {
            fview.template.onDocumentDom.call(fview.surfaceBlazeView.templateInstance());
            fview.surface.removeListener('deploy', cb);
          });
        };
        fview.surface.on('deploy', cb);
      }
    }

  });
});

/*
 * Called in famous.js when rendering a Surface (which unlike anything else,
 * gets rendered to a div via Blaze.render and is treated differently)
 */
templateSurface = function (fview, view, parentView, options, tName) {
  div = document.createElement('div');
  Blaze.render(view, div, null, parentView);

  if (!options)
    options = {};

  var autoSize = options.size && options.size[1] == 'auto';

  if (autoSize)
    options.size = [0, 0];
  else
    div.style.height='100%';
  div.style.width='100%';

  fview.surfaceClassName = 't_'+tName.replace(/ /, '_');
  if (options.classes)
    throw new Error('Surface classes="x,y" is deprecated.  Use class="x y" instead.');

  var surfaceOptions = {
    content: div,
    size: fview.size
  };

  fview.surface = fview.view;
  fview.surface.setOptions(surfaceOptions);

  var pipeChildrenTo = fview.parent.pipeChildrenTo;
  if (pipeChildrenTo)
    for (var i=0; i < pipeChildrenTo.length; i++)
      fview.surface.pipe(pipeChildrenTo[i]);

  if (autoSize) {
    fview.autoHeight = autoHeight;
    fview.autoHeight();
    // Deprecated 2014-11-01
    log.warn(fview.surfaceClassName + ': size="[undefined,auto"] is ' +
      'deprecated.  Since Famo.us 0.3.0 ' +
      'you can simply use size="[undefined,true]" and it will work as ' +
      'expected in all cases (including SequentialLayout, Scrollview, etc');
  }

  if (options.watchSize) {
    if (typeof MutationObserver === 'undefined')
      return console.warn("Can't observe on browser where MutationObserver " +
        "is not supported");
    fview.mutationObserver = new MutationObserver(function(mutations) {
      fview.surface._contentDirty = true;
    });
    fview.mutationObserver.observe(div, {
      attributeFilter: true, attributes: true,
      characterData: true, childList: true, subtree: true
    });
  }
};

function autoHeight(callback) {
  var fview = this;
  var div = fview.surface.content;

  var height = div.scrollHeight;
  if (height && (!fview.size || (fview.size.length == 2 && fview.size[1] != height))) {
    fview.size = [undefined, height];
    if (fview.modifier) {
      fview.modifier.setSize(fview.size);
      fview.surface.setSize([undefined,undefined]);
    } else {
      fview.surface.setSize(fview.size);
    }

    if (callback)
      callback.call(fview, height);
  } else {
    // Ideally Engine.nextTick, but
    // https://github.com/Famous/famous/issues/342
    // e.g. /issue10
    window.setTimeout(function() {
      fview.autoHeight();
    }, 10);  // FYI: 16.67ms = 1x 60fps animation frame
  }
}
