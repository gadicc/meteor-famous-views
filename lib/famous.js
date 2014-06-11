function templateSurface(compView, renderedTemplate, tName, options) {
  var div = document.createElement('div');
  div.style.width='100%'; div.style.height='100%';

  /*
  if (compView.uiHooks)
    div._uihooks = compView.uiHooks;
  */

  UI.insert(renderedTemplate, div);

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

    compView.surface = new Surface(surfaceOptions);

    if (!compView.node)
      // nothing, i.e. Surface & no modifier
      compView.setNode(compView.surface);
    else if (!compView.sequencer)
      // add Surface as only child
      compView.node.add(compView.surface);
    else {
      compView.sequencer.sequence.push(compView.surface);
    }

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

function famousCreated() {
  this.data = this.data || {};
  if (!this.data.view)
    this.data.view = 'SequentialLayout';

  log.debug('Famous ' + (this.data.view || '') + ' component '
    + this.__component__.guid + ' instantiated '
    + (this.data.template
      ? 'to render template "' + this.data.template + '"' 
      : 'inline in template "' + getKind(this.__component__) + '"'));
//  console.log(this);

  // See attribute parsing notes in README
  var options = handleOptions(this.data);

  // To be deprecated
  if (this.data.size && this.data.size.substr(0,1) != '[') {
    log.warn('   size="' + this.data.size + '" is deprecated, please use '
      + 'size="['+ this.data.size + ']" instead');
    options.size = floatArray(this.data.size);
  }

  // These require special handling (but should still be moved elsewhere)
  if (this.data.direction)
    options.direction = this.data.direction == "Y"
      ? Utility.Direction.Y : Utility.Direction.X;
  if (this.data.translate) {
    options.transform =
      Transform.translate.apply(null, floatArray(this.data.translate));
    delete options.translate;
  }
  // any other transforms added here later must act on existing transform matrix

  if (!this.data.modifier && (this.data.origin || this.data.size || this.data.translate))
    this.data.modifier = 'StateModifier';

  var component = this.__component__;
  var compView = component.famousView = new CompView(component, options);
  compView.view = this.data.view;

  /*
  if (famousCmp.viewOptions[this.data.view]
      && famousCmp.viewOptions[this.data.view].childUiHooks) {
    // if childUiHooks specified, store them here too
    compView.childUiHooks = famousCmp.viewOptions[this.data.view].childUiHooks;
  } else if (compView.parent.childUiHooks) {
    if (this.data.view == 'Surface') {
      compView.uiHooks = compView.parent.childUiHooks;
    } else {
      // Track descedents
    }
    console.log('child ' + this.data.view);
  }
  */

  var newComponent, div, view, node;

  if (this.data.view != 'Surface') {

    if (famousCmp.views[this.data.view])
      view = famousCmp.views[this.data.view];
    else if (typeof Famous !== 'undefined' && Famous[this.data.view])
      view = Famous[this.data.view];
    else
      throw new Error('Wanted view "' + this.data.view + '" but it doesn\'t exists.'
        + " Try famousCmp.views."+this.data.view+" = require(...)");

    node = new view(options);

    if (node.sequenceFrom) {
      compView.sequencer = new sequencer();
      node.sequenceFrom(compView.sequencer.sequence);
    }

  }

  if (this.data.modifier) {
    var modifier = famousCmp.modifiers[this.data.modifier];
    modifier = typeof modifier == 'function'
      ? new modifier(component, options)
      : { famous: modifier };

    if (node) {
      compView.setNode(modifier.famous).add(node);
      compView.viewNode = node;
    } else
      compView.setNode(modifier.famous);

    compView.modifierCmp = modifier;
    compView.modifier = modifier.famous;
    if (modifier.postRender)
      modifier.postRender();
  } else if (node) {
    compView.setNode(node);
    compView.viewNode = node;
  }

  // could do pipe=1 in template helper?
  if (compView.parent.pipeChildrenTo)
    compView.pipeChildrenTo = compView.parent.pipeChildrenTo;

  // think about what else this needs
  if (famousCmp.viewOptions[compView.view] &&
      famousCmp.viewOptions[compView.view].famousCreatedPost)
    famousCmp.viewOptions[compView.view].famousCreatedPost.call(compView);

  if (this.data.template) {
    // Render the given Template (will render children too)
    var template = Template[this.data.template];
    if (!template)
      throw new Error('Famous called with template="' + this.data.template
        + '" but no such template exists');
    newComponent = this.data.data
      ? UI.renderWithData(template, this.data.data, component)
      : UI.render(template, component);
    log.debug('  Completed render of "' + this.data.template
      + '" to component instance ' + newComponent.guid);

    templateSurface(compView, newComponent, this.data.template, this.data);
  }
}

// Used for {{#famous}}content{{/famous}}
function famousRendered() {
  var component = this.__component__;
  // {{#famous data=Something}} will use Something for rendered childrens' data
  var data = this.data ? this.data.data || this.data : null;
  if (component.__content) {
    templateSurface(component.famousView, data
      ? UI.renderWithData(component.__content, data, component)
      : UI.render(component.__content, component),
      getKind(component).substr(9) + '_inline',  // strlen("Template_")==9
      this.data);
  }
}

/*
    // maybe: throw error in this case.  and if there are no child templates,
    // drop sequentialview and make us a plain surface  OPTIMIZATION
    if (compView.sequence.length) {
      console.log('[famous] WARNING!  Template "' + this.data.template
        + '" mixes HTML and famous components.  Adding as last surface in '
        + 'sequence, but rather explicitly declare it as a surface using '
        + '{{famous}} or {{#famous}}');
    }
*/

function famousDestroyed() {
  var component = this.__component__;
  var famousView = component.famousView;
  log.debug('Famous ' + famousView.view + ' component ' + component.guid
    + ' destroyed (and children will be garbage collected)');

  // XXX ADD TO DOCS
  if (famousView.onDestroy)
    famousView.onDestroy();
  if (!famousView.destroyPrevented)
    famousView.destroy();
}

// Keep this at the bottom; Firefox doesn't do function hoisting

if (Template.famous) {

  Template.famous.created = famousCreated;
  Template.famous.rendered = famousRendered;
  Template.famous.destroyed = famousDestroyed;

} else {

  famousCmp.famousComponent = function() {
    return UI.Component.extend({
      created: famousCreated,
      rendered: famousRendered,
      destroyed: famousDestroyed
    });
  }
  UI.registerHelper('famous', famousCmp.famousComponent);

}
