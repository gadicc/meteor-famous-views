var mainCtx = null;

var Engine = null,
    Modifier = null,
    Surface = null,
    Transform = null,
    SequentialLayout = null,
    StateModifier = null;

famousCmp = {};
famousCmp.views = {};
famousCmp.modifiers = {};

Meteor.startup(function() {
  require("famous-polyfills"); // Add polyfills
  require("famous/core/famous"); // Add the default css file

  // Basic deps
  Engine           = require("famous/core/Engine");
  Modifier         = require("famous/core/Modifier");
  Surface          = require("famous/core/Surface");
  Transform        = require("famous/core/Transform");
  RenderNode       = require("famous/core/RenderNode");
  SequentialLayout = require("famous/views/SequentialLayout");
//  RenderController = require("famous/views/RenderController");

  StateModifier    = require("famous/modifiers/StateModifier");

  famousCmp.views['Scrollview'] = require('famous/views/Scrollview');
  famousCmp.views['SequentialLayout'] = SequentialLayout;

  if (famousCmp.mainCtx)
    mainCtx = famousCmp.mainCtx;
  else {
    if (famousCmp.mainCtx !== false)
      console.log('[famousCmp] Creating a new main context.  If you already have '
        + 'your own, set famousCmp.mainCtx = yourMainContext (or to false to get '
        + 'rid of this warning)');
    famousCmp.mainCtx = mainCtx = Engine.createContext();
  }

  if (Template.famousInit)
    UI.insert(UI.render(Template.famousInit), document.body);

});

function floatArray(string) {
  if (_.isArray(string))
    return string;

  var out = [];
  var args = string.split(',');
  var length = args.length;
  for (var i=0; i < length; i++) {
    out[i] = parseFloat(args[i]);
    if (isNaN(out[i]))
      out[i] = undefined;
  }
  return out;
}

/*
 * Templates are always added to a cmpView, in turn is added to it's parent
 * cmpView or a context.  This allows us to handle situations where a
 * template is later removed (since nodes cannot ever be manually removed
 * from the render tree).
 * 
 * http://stackoverflow.com/questions/23087980/how-to-remove-nodes-from-the-ren
 */

function CompView(component, options) {
  var parent = component;
  while ((parent=parent.parent) && !parent.famousView);
  parent = parent ? parent.famousView : { node: mainCtx };

  this.component = component;
  this.parent = parent;

  if (options) {
    if (options.size)
      this.size = options.size;
  }

  if (parent.sequence)
    parent.sequence.push(this);
  else
    parent.node.add(this);
}
CompView.prototype.render = function() {
  if (this.isDestroyed)
    return [];
  if (this.node)
    return this.node.render();
  console.log('render called before anything set');
  return [];
}
CompView.prototype.setNode = function(node) {
  // surface or modifier/view
  console.log('setNode', node);
  this.node = new RenderNode(node);
  return this.node;
}
CompView.prototype.destroy = function() {
  this.isDestroyed = true;
  this.node = null;
  this.parent.sequencePurge();
}
CompView.prototype.sequencePurge = function() {
  var sequence = this.sequence,
    length = this.sequence.length;

  for (var i=0; i < length; i++)
    if (sequence[i].isDestroyed) {
      this.sequence.splice(i--, 1);
      length--;
    }
}
CompView.prototype.getSize = function() {
  return this.size || [undefined, 200];
}
//CompView.prototype.add = function() {
//}


function templateSurface(compView, renderedTemplate) {
  var div = document.createElement('div');
  UI.insert(renderedTemplate, div);

  // If any HTML was generated, create a surface for it
  if (div.innerHTML.trim().length) {
    compView.surface = new Surface({
      content: div,
      size: [window.innerWidth,undefined]
    });
    compView.sequence.push(compView.surface);
  }  
}

Template.famous.created = function() {
  this.data = this.data || {};
  console.log('\n[famous] Famous component '
    + this.__component__.guid + ' instantiated to render template "'
    + this.data.template + '"');

  var options = {};

  if (this.data.size)
    options.size = floatArray(this.data.size);
  if (this.data.origin)
    options.origin = floatArray(this.data.origin);
  if (this.data.opacity)
    options.opacity = parseFloat(this.data.opacity);
  if (this.data.translate) {
    options.transform = Transform.translate(floatArray(this.data.translate));
    delete options.translate;
  }
  // any other transforms added here later must act on existing transform matrix
  console.log(options);

  if (!this.data.modifier && (this.data.origin || this.data.size || this.data.translate))
    this.data.modifier = 'StateModifier';

  var component = this.__component__;
  var compView = component.famousView = new CompView(component, options);

  var newComponent, div, view, node;

  console.log(component);


  if (this.data.view) {
    view = famousCmp.views[this.data.view] || (Famous && Famous[this.data.view]);
    if (!view)
      throw new Error('Wanted view "' + this.data.view + '" but it doesn\'t exists.'
        + "Try famousCmp.views."+this.data.view+" = require(...)");
  } else
    view = SequentialLayout;

  node = new view(options);

  if (this.data.view == 'Scrollview') {
    console.log('Scrollview', compView);
  }

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

    templateSurface(compView, newComponent);
  }
}

// Used for {{#famous}}content{{/famous}}
Template.famous.rendered = function() {
  var component = this.__component__;
  if (component.__content)
    templateSurface(component.famousView, this.data
      ? UI.renderWithData(component.__content, this.data, component)
      : UI.render(component.__content, component));
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

Template.famous.destroyed = function() {
  var component = this.__component__;
  console.log('[famous] Famous component ' + this.__component__.guid + ' destroyed');
  component.famousView.destroy();
}

// similar to templateSurface() above, but always creates a surface without
// checking if it contains anything, and returns the surface without adding
// it to the compView sequence.  creates the rendered template itself.
function templateSurfaceRaw(template, data, parent, size) {
  var div = document.createElement('div');
  var newComponent = UI.renderWithData(template, data, parent);
  UI.insert(newComponent, div);
  return new Surface({
    size: size,
    content: div
  });
}

Template.famousEach.created = function() {
  console.log('\n[famous] FamousEach component '
    + this.__component__.guid + ' instantiated to render template "'
    + this.data.template + '"');

  var component = this.__component__;
  var famousData = component.famousData = {};

  // famousEach specific
  var parent = component;
  while ((parent=parent.parent) && !parent.famousView);
  parent = parent ? parent.famousView : { node: mainCtx };
  console.log(parent);

  var data = this.data.data;
  var size = floatArray(this.data.size);

  // todo, store sequence in parent, store startIndex here (to allow surfaces
  // before, after, inbetween two eaches, etc)

  var template = Template[this.data.template];

  if (_.isArray(data)) {

    _.each(data, function(row) {
      parent.sequence.push(
        templateSurfaceRaw(template, row, component, size)
      );
    });

  } else if (typeof(data) == 'object') {

    // "data" is a MiniMongo cursor.  TODO, instanceof cursor check.

    // Thanks to Zoltan Olah from Perculate Studios
    // https://github.com/percolatestudio/meteor-famous-demos/blob/master/basics-step6/client/cursor-to-array.js
    famousData.observeHandle = data.observe({
      addedAt: function(document, atIndex, before) {
        parent.sequence.splice(atIndex, 0,
          templateSurfaceRaw(template, document, component, size));
      },
      changedAt: function(newDocument, oldDocument, atIndex) {
        // ensure the fragment createFn returns is re-active
      },
      removedAt: function(oldDocument, atIndex) {
        parent.sequence.splice(atIndex, 1);
      },
      movedTo: function(document, fromIndex, toIndex, before) {
        var item = parent.sequence.splice(fromIndex, 1)[0];
        parent.sequence.splice(toIndex, 0, item);
      }
    });

  } else {
    
    throw new Error('famousEach data argument must be array or cursor');
  }
}

Template.famousEach.destroyed = function() {
  var component = this.__component__;
  console.log('[famous] FamousEach component ' + this.__component__.guid + ' destroyed');

  var data = component.famousData
  if (data) {
    if (data.observeHandle)
      observeHandle.stop();
  }
}

famousCmp.showTreeGet = function(renderNode) {
  var obj = renderNode._node._child._object;
    if (obj.node)
      obj.node = this.showTreeGet(obj.node);
  return obj;
}
famousCmp.showTreeChildren = function(renderNode) {
  var out = {}, i=0;
  if (renderNode._node)
    out['child'+(i++)] = this.showTreeGet(renderNode)
  return out;
}
famousCmp.showTree = function() {
  console.log(this.showTreeChildren(mainCtx));

}

famousCmp.dataFromCmp = function(component) {
  while ((component=component.parent) && !component.famous);
  return component ? component.famous : undefined;
}
famousCmp.dataFromTpl = function(tplInstance) {
  return this.dataFromCmp(tplInstance.__component__);
}

famousCmp.modifiers.StateModifier = function(component, options) {
  this.component = component;
  console.log(options);
  this.famous = new StateModifier(options);
}

famousCmp.modifiers.identity = function(component, options) {
  this.component = component;
  this.famous = new Modifier(_.extend({
    transform : Transform.identity
  }, options));  
}

famousCmp.modifiers.inFront = function(component, options) {
  this.component = component;
  this.famous = new Modifier(_.extend({
    transform : Transform.inFront
  }, options));
}

famousCmp.modifiers.pageTransition = function(component, options) {
  this.component = component;
  this.famous = new Modifier({
    transform : Transform.identity,
    opacity   : 1,
    origin    : [-0.5, -0.5],
    size      : [100, 100]
  });
}

famousCmp.modifiers.pageTransition.prototype.postRender = function() {
  this.famous.setOrigin([0,0], {duration : 5000});
}
