UI.registerHelper('famous', function () {
  return UI.Component.extend({
    created: famousCreated,
    rendered: famousRendered,
    destroyed: famousDestroyed
  });
});

function templateSurface(compView, renderedTemplate, tName) {
  var div = document.createElement('div');
  UI.insert(renderedTemplate, div);

  // If any HTML was generated, create a surface for it
  if (div.innerHTML.trim().length) {
    compView.surface = new Surface({
      content: div,
      size: compView.size,
      classes: ['t_' + tName]
    });
    compView.sequence.push(compView.surface);
  }  
}

function famousCreated() {
  this.data = this.data || {};
  console.log('\n[famous] Famous component '
    + this.__component__.guid + ' instantiated '
    + (this.data.template
      ? 'to render template "' + this.data.template + '"' 
      : 'inline in template "' + getKind(this.__component__) + '"'));

  var options = {};

  if (this.data.size)
    options.size = floatArray(this.data.size);
  if (this.data.origin)
    options.origin = floatArray(this.data.origin);
  if (this.data.opacity)
    options.opacity = parseFloat(this.data.opacity);
  if (this.data.direction)
    options.direction = this.data.direction == "Y"
      ? Utility.Direction.Y : Utility.Direction.X;
  if (this.data.translate) {
    options.transform =
      Transform.translate.apply(null, floatArray(this.data.translate));
    delete options.translate;
  }
  console.log(options);
  // any other transforms added here later must act on existing transform matrix

  if (!this.data.modifier && (this.data.origin || this.data.size || this.data.translate))
    this.data.modifier = 'StateModifier';

  var component = this.__component__;
  var compView = component.famousView = new CompView(component, options);

  var newComponent, div, view, node;

  if (this.data.view) {
    view = famousCmp.views[this.data.view] || (Famous && Famous[this.data.view]);
    if (!view)
      throw new Error('Wanted view "' + this.data.view + '" but it doesn\'t exists.'
        + "Try famousCmp.views."+this.data.view+" = require(...)");
  } else
    view = SequentialLayout;

  node = new view(options);

  if (node.sequenceFrom) {
    compView.sequence = [];
    node.sequenceFrom(compView.sequence);
  }

  // TODO, if parent has sequenceFrom and not add, add to array etc
  if (this.data.modifier) {
    var modifier = famousCmp.modifiers[this.data.modifier];
    modifier = typeof modifier == 'function'
      ? new modifier(component, options)
      : { famous: modifier };

    compView.setNode(modifier.famous).add(node);
    compView.modifierCmp = modifier;
    compView.modifier = modifier.famous;
    if (modifier.postRender)
      modifier.postRender();
  } else
    compView.setNode(node);

  // could do pipe=1 in template helper?
  if (this.data.view == 'Scrollview')
    Engine.pipe(node);

  if (this.data.template) {
    // Render the given Template (will render children too)
    newComponent = this.data.data
      ? UI.renderWithData(Template[this.data.template], this.data.data, component)
      : UI.render(Template[this.data.template], component);
    console.log('[famous]   Completed render of "' + this.data.template
      + '" to component instance ' + newComponent.guid);

    templateSurface(compView, newComponent, this.data.template);
  }
}

// Used for {{#famous}}content{{/famous}}
function famousRendered() {
  var component = this.__component__;
  // TODO, get containing template for "inline"
  if (component.__content)
    templateSurface(component.famousView, this.data
      ? UI.renderWithData(component.__content, this.data, component)
      : UI.render(component.__content, component, component.parent.parent.kind + '_inline'));
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
  console.log('[famous] Famous component ' + this.__component__.guid + ' destroyed');
  component.famousView.destroy();
}
