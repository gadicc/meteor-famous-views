/* Extend Meteor Template framework for .famousEvents() */
Template.prototype.famousEvents = function (eventMap) {
  var template = this;
  template.__famousEventMaps = (template.__famousEventMaps || []);
  template.__famousEventMaps.push(eventMap);
};

function setupEvents(fview, template) {
  if (template.__famousEventMaps) {
    var target = fview.surface || fview.view;
    _.each(template.__famousEventMaps, function(eventMap) {
      for (var k in eventMap) {
        target.on(k, (function(k) {
          return function(/* arguments */) {
            Array.prototype.push.call(arguments, fview);
            eventMap[k].apply(this, arguments);
          };
        })(k));
      }
    });
  }
}

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
    window.setTimeout(function() {
      fview.autoHeight();
    }, 10);  // FYI: 16.67ms = 1x 60fps animation frame
  }
}

function templateSurface(div, fview, renderedTemplate, tName, options) {
  // var div = document.createElement('div');
  var autoSize = options.size && options.size[1] == 'auto';

  if (autoSize)
    options.size = [0, 0];
  else
    div.style.height='100%';
  div.style.width='100%';

  /*
  if (fview.uiHooks)
    div._uihooks = fview.uiHooks;
  */

//  UI.insert(renderedTemplate, div);

//  we're now forced to always render in main func
//  renderedTemplate.domrange.attach(div);

  if (!options)
    options = {};

  // If any HTML was generated, create a surface for it
  if (options.view=='Surface' || div.innerHTML.trim().length) {
    fview.surfaceClassName = 't_'+tName.replace(/ /, '_');
    if (options.classes)
      throw new Error('Surface classes="x,y" is deprecated.  Use class="x y" instead.');

    var surfaceOptions = {
      content: div,
      size: fview.size
    };

    fview.surface = fview.view;
    fview.surface.setOptions(surfaceOptions);

    /*
    fview.surface = new famous.core.Surface(surfaceOptions);
    if (!fview.node)
      // nothing, i.e. Surface & no modifier
      fview.setNode(fview.surface);
    else if (!fview.sequencer)
      // add Surface as only child
      fview.node.add(fview.surface);
    else {
      fview.sequencer.sequence.push(fview.surface);
    }
    */

    var pipeChildrenTo = fview.parent.pipeChildrenTo;
    if (pipeChildrenTo)
      for (var i=0; i < pipeChildrenTo.length; i++)
        fview.surface.pipe(pipeChildrenTo[i]);

    if (autoSize) {
      fview.autoHeight = autoHeight;
      fview.autoHeight();
    }
  }  
}

// Used by famousEach too
parentViewName = function(blazeView) {
  while (blazeView.name == "with" || blazeView.name == "(contentBlock)")
    blazeView = blazeView.parentView;
  return blazeView.name;
}
parentTemplateName = function(blazeView) {
  while (blazeView && !blazeView.name.match(/^Template/))
    blazeView = blazeView.parentView;
  return blazeView.name;
}

// Need to fire manually at appropriate time,
// for non-Surfaces which are never added to the DOM by meteor
runRenderedCallback = function(view) {
//  if (view._callbacks.rendered && view._callbacks.rendered.length)
  var needsRenderedCallback = true; // uh yeah, TODO :>
  view.domrange = null; // TODO, check if it's a surface / real domrange
  if (needsRenderedCallback && ! view.isDestroyed &&
      view._callbacks.rendered && view._callbacks.rendered.length) {
    Tracker.afterFlush(function callRendered() {
      if (needsRenderedCallback && ! view.isDestroyed) {
        needsRenderedCallback = false;
        Blaze._fireCallbacks(view, 'rendered');
      }
    });
  }
}

function famousCreated() {
  var blazeView = this.view;
  var famousViewName = blazeView.name ? blazeView.name.substr(7) : "";

  this.data = this.data || {};
  var dataContext = this.data.data
    || Blaze._parentData(1) && Blaze._parentData(1, true)
    || Blaze._parentData(0) && Blaze._parentData(0, true)
    || {};

  // deprecate
  if (!this.data.view && famousViewName === "")
    this.data.view = 'SequentialLayout';
  if (!this.data.view) this.data.view = famousViewName;
  else if (!famousViewName) {
    famousViewName = this.data.view;
    blazeView.viewName = 'Famous.' + famousViewName;
  }

  // Deprecated 2014-08-17
  if (this.data.size && _.isString(this.data.size) && this.data.size.substr(0,1) != '[')
    throw new Error('[famous-views] size="' + this.data.size + '" is deprecated, please use '
      + 'size="['+ this.data.size + ']" instead');

  // See attribute parsing notes in README
  var options = handleOptions(this.data);

  // These require special handling (but should still be moved elsewhere)
  if (this.data.direction)
    options.direction = this.data.direction == "Y"
      ? famous.utilities.Utility.Direction.Y
      : famous.utilities.Utility.Direction.X;
  if (options.translate) {
    options.transform =
      Transform.translate.apply(null, options.translate);
    delete options.translate;
  }
  // any other transforms added here later must act on existing transform matrix

  if (!this.data.modifier && (this.data.origin || this.data.size || this.data.translate || this.data.transform))
    this.data.modifier = 'StateModifier';

  var fview = blazeView.fview = new MeteorFamousView(blazeView, options);
  fview._view = FView.views[this.data.view] || { name: this.data.view };

  var pViewName = parentViewName(blazeView.parentView);
  var pTplName = parentTemplateName(blazeView.parentView);
  log.debug('New ' + famousViewName + " (#" + fview.id + ')'
    + (this.data.template
      ? ', content from "' + this.data.template + '"'
      : ', content from inline block')
    + ' (parent: ' + pViewName
    + (pViewName == pTplName
      ? ''
      : ', template: ' + pTplName)
    + ')');

  /*
  if (FView.viewOptions[this.data.view]
      && FView.viewOptions[this.data.view].childUiHooks) {
    // if childUiHooks specified, store them here too
    fview.childUiHooks = FView.viewOptions[this.data.view].childUiHooks;
  } else if (fview.parent.childUiHooks) {
    if (this.data.view == 'Surface') {
      fview.uiHooks = fview.parent.childUiHooks;
    } else {
      // Track descedents
    }
    console.log('child ' + this.data.view);
  }
  */

  var view, node;

  if (this.data.view /* != 'Surface' */) {

    view = FView.getView(this.data.view);
    node = new view(options);

    if (node.sequenceFrom) {
      fview.sequence = new sequencer();
      node.sequenceFrom(fview.sequence._sequence);
    }

  }

  if (this.data.modifier) {

    fview._modifier = FView.modifiers[this.data.modifier];
    fview.modifier = fview._modifier.create.call(fview, options);

    if (node) {
      fview.setNode(fview.modifier).add(node);
      fview.view = node;
    } else
      fview.setNode(fview.modifier);

    if (fview._modifier.postRender)
      fview._modifier.postRender();

  } else if (node) {

    fview.setNode(node);
    fview.view = node;

  }

  // could do pipe=1 in template helper?
  if (fview.parent.pipeChildrenTo)
    fview.pipeChildrenTo = fview.parent.pipeChildrenTo;

  // think about what else this needs
  if (fview._view && fview._view.famousCreatedPost)
    fview._view.famousCreatedPost.call(fview);


  // Render contents (and children)
  var newBlazeView, template, scopedView;
  if (blazeView.templateContentBlock) {
    if (this.data.template)
      throw new Error("A block helper {{#View}} cannot also specify template=X");
    // Called like {{#famous}}inlineContents{{/famous}}
    template = blazeView.templateContentBlock;
  } else if (this.data.template) {
    template = Template[this.data.template];
    if (!template)
      throw new Error('Famous called with template="' + this.data.template
        + '" but no such template exists');
  } else {
    // Called with inclusion operator but not template {{>famous}}
    throw new Error("No template='' specified");
  }

  /*
  newBlazeView = template.constructView();
  scopedView = Blaze.With(dataContext, function() { return newBlazeView; });
  Blaze.materializeView(scopedView, blazeView);
  */

  /*
  newBlazeView = Blaze.render(function() {
    Blaze.With(dataContext, function() { return template.constructView(); })
  }, div, null, blazeView);
  */

  // Avoid Blaze running rendered() before it's actually on the DOM
  // Delete must happen before Blaze.render() called.
  /*
  var onRendered = this.data.view == 'Surface' && template.rendered;
  if (onRendered)
    delete template.rendered;
  */

  var div = document.createElement('div');
  newBlazeView = Blaze.renderWithData(template, dataContext, div, null, blazeView);
  setupEvents(fview, template);

  if (this.data.view == 'Surface') {
    templateSurface(div, fview, scopedView,
      this.data.template || parentTemplateName(blazeView.parentView).substr(9) + '_inline',
      options);
  } else {
    // no longer necessary since we're forced to render to a div now
    // runRenderedCallback(newBlazeView);
  }

  /*
  var template = options.template;
  if (template && Template[template].beforeAdd)
  	Template[template].beforeAdd.call(this);
  */

  /* This is the final step where the fview is added to Famous Render Tree */
  /* By deferring the actual add we can prevent a little flicker */

  var parent = fview.parent;
//  _.defer(function() {
    if (parent._view && parent._view.add)
      // views can explicitly handle how their children should be added
      parent._view.add.call(parent, fview, options);
    else if (parent.sequence)
      // 'sequence' can be an array, sequencer or childSequencer, it doesn't matter
      parent.sequence.push(fview);
    else if (!parent.node || (parent.node._object && parent.node._object.isDestroyed))
      // compView->compView.  long part above is temp hack for template rerender #2010
      parent.setNode(fview);
    else
      // default case, just use the add method
      parent.node.add(fview);
 // });

  /*
   * Now that the Template has been rendered to the Famous Render Tree (and
   * also to the DOM in the case of a Surface), let's run any rendered()
   * callback that may have been defined.
   */
  /*
  if (onRendered)
    onRendered.call(fview.blazeView._templateInstance);
  */
}

/*
 * This is called by Blaze when the View/Template is destroyed,
 * e.g. {{#if 0}}{{#Scrollview}}{{/if}}.  When this happens we need to:
 *
 * 1) Destroy children (Blaze won't do it since it's not in the DOM),
 *    and any "eaches" that may have been added from a famousEach.
 * 2) Call fview.destroy() which handles cleanup w.r.t. famous,
 *    which lives in meteorFamousView.js.
 *
 * It's possible we want to have the "template" destroyed but not the
 * fview in the render tree to do a graceful exit animation, etc.
 */
function famousDestroyed() {
  this.view.fview.destroy(true);
}

// Keep this at the bottom; Firefox doesn't do function hoisting

FView.famousView = new Template(
  'famous',           // viewName: "famous"
  function() {        // Blaze.View "renderFunc"
    var blazeView = this;
    var data = Blaze.getData(blazeView);
    var tpl = blazeView._templateInstance;
    var fview = blazeView.fview;

    var changed = {};
    var orig = {};
    for (var key in data) {
      var value = data[key];
      if (typeof value === "string")
        value = optionString(value);
      if (!EJSON.equals(value, tpl.data[key]) || !blazeView.hasRendered) {
        orig[key] = blazeView.hasRendered ? tpl.data[key] : null;
        changed[key] = tpl.data[key] = value;
      }
    }

    /*
     * Think about:
     * 
     * 1) Should the function get the old value or all old data too?
     * 2) Should the function get all the new data, but translated?
     *
     */

    _.each(['modifier', 'view'], function(node) {

      // If the fview has a modifier or view
      var what = '_' + node;
      if (fview[what]) {
        if (fview[what].attrUpdate) {
          // If that mod/view wants to finely handle reactive updates
          for (var key in changed)
            fview[what].attrUpdate.call(fview,
              key, changed[key], orig[key], tpl.data, !blazeView.hasRendered);
        } else if (fview[node].setOptions && blazeView.hasRendered) {
          // Otherwise if it has a setOptions
          fview[node].setOptions(tpl.data);
        }
      }

    });

//    console.log(view);
    blazeView.hasRendered = true;
    return null;
  }
);

Blaze.registerHelper('famous', FView.famousView);
FView.famousView.created = famousCreated;
FView.famousView.destroyed = famousDestroyed;
