function templateSurface(compView, renderedTemplate, tName, options) {
  var div = document.createElement('div');
  div.style.width='100%'; div.style.height='100%';
  UI.insert(renderedTemplate, div);

  // If any HTML was generated, create a surface for it
  if (options.view=='Surface' || div.innerHTML.trim().length) {
    var surfaceOptions = { classes: [ 't_'+tName ] };
    if (!options)
      options = {};
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
  }  
}

function famousCreated() {
  this.data = this.data || {};
  log.debug('Famous component '
    + this.__component__.guid + ' instantiated '
    + (this.data.template
      ? 'to render template "' + this.data.template + '"' 
      : 'inline in template "' + getKind(this.__component__) + '"'));

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

  var newComponent, div, view, node;

  if (this.data.view != 'Surface') {

    if (!this.data.view)
      view = SequentialLayout;
    else if (famousCmp.views[this.data.view])
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

    if (node)
      compView.setNode(modifier.famous).add(node);
    else
      compView.setNode(modifier.famous);

    compView.modifierCmp = modifier;
    compView.modifier = modifier.famous;
    if (modifier.postRender)
      modifier.postRender();
  } else if (node)
    compView.setNode(node);

  // could do pipe=1 in template helper?
  if (this.data.view == 'Scrollview')
    Engine.pipe(node);

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
  if (component.__content) {
    templateSurface(component.famousView, this.data
      ? UI.renderWithData(component.__content, this.data, component)
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
  log.debug('Famous component ' + this.__component__.guid + ' destroyed');
  component.famousView.destroy();
}


// Keep this at the bottom; Firefox doesn't do function hoisting
UI.registerHelper('famous', function () {
  return UI.Component.extend({
    created: famousCreated,
    rendered: famousRendered,
    destroyed: famousDestroyed
  });
});
