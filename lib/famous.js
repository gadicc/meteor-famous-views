window.x = null;
function templateSurface(fview, renderedTemplate, tName, options) {
  var div = document.createElement('div');
  window.x = options.size;
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
  renderedTemplate.domrange.attach(div);

  if (!options)
    options = {};

  // If any HTML was generated, create a surface for it
  if (options.view=='Surface' || div.innerHTML.trim().length) {
    var surfaceOptions = { classes: [ 't_'+tName ] };
    if (options.classes)
      surfaceOptions.classes = _.union(surfaceOptions.classes,
        _.isArray(options.classes) ? options.classes : options.classes.split(','));
    if (options.class)
      surfaceOptions.classes = _.union(surfaceOptions.classes,
        _.isArray(options.class) ? options.class : options.class.split(' '));

    surfaceOptions.content = div;
    surfaceOptions.size = fview.size;

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
      Meteor.setTimeout(function() {
        fview.size = [undefined, div.scrollHeight];
        if (fview.modifier) {
          fview.modifier.setSize(fview.size);
          fview.surface.setSize([undefined,undefined]);
        } else {
          fview.surface.setSize(fview.size);
        }
      }, 0);
    }
  }  
}

// Used by famousEach too
parentKind = function(blazeView) {
  while (blazeView.kind == "with" || blazeView.kind == "(contentBlock)")
    blazeView = blazeView.parentView;
  return blazeView.kind;
}
parentTemplateName = function(blazeView) {
  while (blazeView && !blazeView.kind.match(/^Template/))
    blazeView = blazeView.parentView;
  return blazeView.kind;
}

// Need to fire manually at appropriate time,
// for non-Surfaces which are never added to the DOM by meteor
runRenderedCallback = function(view) {
//  if (view._callbacks.rendered && view._callbacks.rendered.length)
  var needsRenderedCallback = true; // uh yeah, TODO :>
  view.domrange = null; // TODO, check if it's a surface / real domrange
  if (needsRenderedCallback && ! view.isDestroyed &&
      view._callbacks.rendered && view._callbacks.rendered.length) {
    Deps.afterFlush(function callRendered() {
      if (needsRenderedCallback && ! view.isDestroyed) {
        needsRenderedCallback = false;
        Blaze._fireCallbacks(view, 'rendered');
      }
    });
  }
}

function famousCreated() {
  var blazeView = Blaze.getCurrentView();
  var famousViewName = blazeView.kind.substr(7);

  this.data = this.data || {};

  // deprecate
  if (!this.data.view && famousViewName === "")
    this.data.view = 'SequentialLayout';
  if (!this.data.view) this.data.view = famousViewName;
  else if (!famousViewName) {
    famousViewName = this.data.view;
    blazeView.kind = 'Famous.' + famousViewName;
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

  var pKind = parentKind(blazeView.parentView);
  var pTplName = parentTemplateName(blazeView.parentView);
  log.debug('New ' + famousViewName + " (#" + fview.id + ')'
    + (this.data.template
      ? ', content from "' + this.data.template + '"'
      : ', content from inline block')
    + ' (parent: ' + pKind
    + (pKind == pTplName
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
      fview.sequencer = new sequencer();
      node.sequenceFrom(fview.sequencer.sequence);
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
      throw new Error("Can't use template='' with famous block helper");
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

  newBlazeView = template.__makeView();
  scopedView = Blaze.With(
    // XXX; should we allow data= attribute like before?
    // Is there any time when we don't want this behaviour?
    Blaze._parentData(1, true /* _functionWrapped */),
    function() { return newBlazeView; }
  );
  Blaze.materializeView(scopedView, blazeView);

  if (this.data.view == 'Surface')
    templateSurface(fview, scopedView,
      this.data.template || parentTemplateName(blazeView.parentView).substr(9) + '_inline',
      options);
  else
    runRenderedCallback(newBlazeView);
}

function famousDestroyed() {
  var blazeView = this.__view__;
  var fview = blazeView.fview;
  log.debug('Destroying ' + fview._view.name + ' (#' + fview.id + ') and children');

  if (fview.children)
    for (var i=0; i < fview.children.length; i++)
      Blaze.destroyView(fview.children[i].blazeView);

  if (fview.eaches)
    for (var i=0; i < fview.eaches.length; i++)
      Blaze.destroyView(fview.eaches[i]);    

  // XXX ADD TO DOCS
  if (fview.onDestroy)
    fview.onDestroy();
  if (!fview.destroyPrevented) {
    fview.destroy();
  }
}

// Keep this at the bottom; Firefox doesn't do function hoisting

FView.famousView = Template.__create__(
  'famous',           // "kind": "helper"
  function() {        // Blaze.View "renderFunc"
    var blazeView = this;
    var data = Blaze.getViewData(blazeView);
    var tpl = blazeView._templateInstance;
    var fview = blazeView.fview;

    var changed = {};
    for (key in data) {
      var value = data[key];
      if (typeof value === "string")
        value = optionString(value);
      if (value != tpl.data[key])
        changed[key] = tpl.data[key] = value;
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
          for (key in changed)
            fview[what].attrUpdate.call(fview,
              key, changed[key], tpl.data, !blazeView.hasRendered);
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

UI.registerHelper('famous', FView.famousView);
FView.famousView.created = famousCreated;
FView.famousView.destroyed = famousDestroyed;
