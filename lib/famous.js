function templateSurface(compView, renderedTemplate, tName, options) {
  var div = document.createElement('div');
  div.style.width='100%'; div.style.height='100%';

  /*
  if (compView.uiHooks)
    div._uihooks = compView.uiHooks;
  */

//  UI.insert(renderedTemplate, div);
  renderedTemplate.domrange.attach(div);

  if (!options)
    options = {};

  if (options.autoSize) {
    if (options.size)
      throw new Error("Can't specify size and autoSize");
    options.size = [undefined, undefined];
    console.log(compView);
  }

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
    surfaceOptions.size = compView.size;

    compView.surface = compView.view;
    compView.surface.setOptions(surfaceOptions);

    /*
    compView.surface = new famous.core.Surface(surfaceOptions);
    if (!compView.node)
      // nothing, i.e. Surface & no modifier
      compView.setNode(compView.surface);
    else if (!compView.sequencer)
      // add Surface as only child
      compView.node.add(compView.surface);
    else {
      compView.sequencer.sequence.push(compView.surface);
    }
    */

    var pipeChildrenTo = compView.parent.pipeChildrenTo;
    if (pipeChildrenTo)
      for (var i=0; i < pipeChildrenTo.length; i++)
        compView.surface.pipe(pipeChildrenTo[i]);

    if (options.autoSize) {
      var $div = $(div), size = [ $div.width(), $div.height() ];
      compView.size = size;
      if (compView.sequencer)
        compView.surface.setSize(size);
      else {
        compView.node._object.setSize(size);
      }
      console.log(compView.size);
    }

  }  
}

// Used by famousEach too
parentKind = function(view) {
  while (view.kind == "with" || view.kind == "(contentBlock)")
    view = view.parentView;
  return view.kind;
}
parentTemplateName = function(view) {
  while (view && !view.kind.match(/^Template/))
    view = view.parentView;
  return view.kind;
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
    throw new Error('[famous-components] size="' + this.data.size + '" is deprecated, please use '
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

  var compView = blazeView.famousView = new CompView(blazeView, options);
  compView._view = FView.views[this.data.view] || { name: this.data.view };

  log.debug('New ' + famousViewName + " (#" + compView.id + ')'
    + (this.data.template
      ? ', content from "' + this.data.template + '"'
      : ', content from inline block')
    + ' (parent: ' + parentKind(blazeView.parentView) + ','
    + ' template: ' + parentTemplateName(blazeView.parentView) + ')');


  /*
  if (FView.viewOptions[this.data.view]
      && FView.viewOptions[this.data.view].childUiHooks) {
    // if childUiHooks specified, store them here too
    compView.childUiHooks = FView.viewOptions[this.data.view].childUiHooks;
  } else if (compView.parent.childUiHooks) {
    if (this.data.view == 'Surface') {
      compView.uiHooks = compView.parent.childUiHooks;
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
      compView.sequencer = new sequencer();
      node.sequenceFrom(compView.sequencer.sequence);
    }

  }

  if (this.data.modifier) {

    compView._modifier = FView.modifiers[this.data.modifier];
    compView.modifier = compView._modifier.create.call(compView, options);

    if (node) {
      compView.setNode(compView.modifier).add(node);
      compView.view = node;
    } else
      compView.setNode(compView.modifier);

    if (compView._modifier.postRender)
      compView._modifier.postRender();

  } else if (node) {

    compView.setNode(node);
    compView.view = node;

  }

  // could do pipe=1 in template helper?
  if (compView.parent.pipeChildrenTo)
    compView.pipeChildrenTo = compView.parent.pipeChildrenTo;

  // think about what else this needs
  if (compView._view && compView._view.famousCreatedPost)
    compView._view.famousCreatedPost.call(compView);


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
    templateSurface(compView, scopedView,
      this.data.template || parentTemplateName(blazeView.parentView).substr(9) + '_inline',
      this.data);
  else
    runRenderedCallback(newBlazeView);
}

function famousDestroyed() {
  var blazeView = this.__view__;
  var compView = blazeView.famousView;
  log.debug('Destroying ' + compView._view.name + ' (#' + compView.id + ') and children');

  if (compView.children)
    for (var i=0; i < compView.children.length; i++)
      Blaze.destroyView(compView.children[i].component);

  if (compView.eaches)
    for (var i=0; i < compView.eaches.length; i++)
      Blaze.destroyView(compView.eaches[i]);    

  // XXX ADD TO DOCS
  if (compView.onDestroy)
    compView.onDestroy();
  if (!compView.destroyPrevented) {
    compView.destroy();
  }
}

// Keep this at the bottom; Firefox doesn't do function hoisting

FView.famousView = Template.__create__(
  'famous',           // "kind": "helper"
  function() {        // Blaze.View "renderFunc"
    var view = this;  // Blaze.View, kind "helper"

    var data = Blaze.getViewData(view);
    var tpl = this._templateInstance;
    var compView = view.famousView;

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

      // If the compView has a modifier or view
      var what = '_' + node;
      if (compView[what]) {
        if (compView[what].attrUpdate) {
          // If that mod/view wants to finely handle reactive updates
          for (key in changed)
            compView[what].attrUpdate.call(compView,
              key, changed[key], tpl.data, !view.hasRendered);
        } else if (compView[node].setOptions && view.hasRendered) {
          // Otherwise if it has a setOptions
          compView[node].setOptions(tpl.data);
        }
      }

    });

//    console.log(view);
    view.hasRendered = true;
    return null;
  }
);

UI.registerHelper('famous', FView.famousView);
FView.famousView.created = famousCreated;
FView.famousView.destroyed = famousDestroyed;
