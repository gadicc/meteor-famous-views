/*
 * Templates are always added to a MeteorFamousView ("fview"), in turn is
 * added to it's parent fview or a context.  This allows us to handle
 * situations where a template is later removed (since nodes cannot ever
 * be manually removed from the render tree).
 * 
 * http://stackoverflow.com/questions/23087980/how-to-remove-nodes-from-the-ren
 */

var meteorFamousViews = {};
var meteorFamousViewsCount = 0;

MeteorFamousView = function(blazeView, options, noAdd) {
  this.id = options.id || ++meteorFamousViewsCount;
  meteorFamousViews[this.id] = this;

  this.blazeView = blazeView;
  this.children = [];
  if (noAdd)
    return;
  
  var parent = blazeView;
  while ((parent=parent.parentView) && !parent.fview);
  parent = parent ? parent.fview : { node: FView.mainCtx };

  this.parent = parent;

  /*
  if (options) {
    if (options.size) {
      this.size = options.size;
    }
  }
  */

  if (parent.children) // i.e. not main context
    parent.children.push(this);

  if (parent._view && parent._view.add)
  	// views can explicitly handle how their children should be added
  	parent._view.add.call(parent, this, options);
  else if (parent.sequencer)
  	// if the node has a sequencer, add by pushing to the sequence array
    parent.sequencer.sequence.push(this);
  else if (!parent.node || (parent.node._object && parent.node._object.isDestroyed))
    // compView->compView.  long part above is temp hack for template rerender #2010
    parent.setNode(this);
  else
  	// default case, just use the add method
    parent.node.add(this);
}

MeteorFamousView.prototype.render = function() {
  if (this.isDestroyed)
    return [];
  if (this.node)
    return this.node.render();
  console.log('render called before anything set');
  return [];
}

MeteorFamousView.prototype.setNode = function(node) {
  // surface or modifier/view
  this.node = new famous.core.RenderNode(node);
  return this.node;
}

MeteorFamousView.prototype.preventDestroy = function() {
	this.destroyPrevented = true;	
}

MeteorFamousView.prototype.destroy = function() {
  //log.debug('Destroyed ' + this._view.name + ' (#' + this.id + ')');

  if (this.parent && this.parent.sequencePurge)
    this.parent.sequencePurge();

  this.isDestroyed = true;
  this.node = null;
  this.view = null;
  this.modifier = null;
  delete(meteorFamousViews[this.id]);
}

MeteorFamousView.prototype.sequencePurge = function() {
  if (!this.sequencer)
    return;

  var sequence = this.sequencer.sequence,
    length = sequence.length;

  for (var i=0; i < length; i++)
    if (sequence[i].isDestroyed) {
      sequence.splice(i--, 1);
      length--;
    }
}

MeteorFamousView.prototype.getSize = function() {
  return this.node && this.node.getSize() || this.size || [true,true];
}

throwError = function(startStr, object) {
  if (object instanceof Object)
    console.error(object);
  throw new Error('FView.getData() expects BlazeView or TemplateInstance or '
      + 'DOM node, but got ' + object);
}

FView.from = function(viewOrTplorEl) {
  if (viewOrTplorEl instanceof Blaze.View)
    return FView.fromBlazeView(viewOrTplorEl);
  else if (viewOrTplorEl instanceof Blaze.TemplateInstance)
    return FView.fromTemplate(viewOrTplorEl);
  else if (viewOrTplorEl && typeof viewOrTplorEl.nodeType === 'number')
    return FView.fromElement(viewOrTplorEl);
  else {
    throwError('FView.getData() expects BlazeView or TemplateInstance or '
        + 'DOM node, but got ', viewOrTplorEl);
  }
}

FView.fromBlazeView = FView.dataFromView = function(view) {
  while ((view=view.parentView) && !view.fview);
  return view ? view.fview : undefined;  
}

FView.fromTemplate = FView.dataFromTemplate = function(tplInstance) {
  return this.dataFromView(tplInstance.view);
}

FView.fromElement = FView.dataFromElement = function(el) {
  var view = Blaze.getView(el);
  return this.dataFromView(view);
}

FView.byId = function(id) {
  return meteorFamousViews[id];
}

// Leave as alias?  Deprecate?
FView.dataFromCmp = FView.dataFromComponent;
FView.dataFromTpl = FView.dataFromTemplate;

FView.dataFromComponent = function(component) {
  log.warn("FView.dataFromComponent has been deprecated.  Please use 'FView.fromBlazeView' instead.");
  return FView.fromBlazeView(component);
}
