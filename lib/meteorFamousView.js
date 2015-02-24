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

  this._callbacks = { cleanup: [], /* destroy: [] */ };

  if (noAdd)
    return;

  var parent = blazeView;
  while ((parent=parent.parentView) && !parent.fview);
  if (parent) {
    parent = parent.fview;
  } else {
    // backcompat with children created in limbo going to main context
    // but we should still only create that if we need to now
    if (!FView.mainCtx) {
      if (typeof FView.mainCtx === 'undefined')
        log.debug('Creating a new main context to maintain backwards ' +
          'compatibility.  Consider using ' +
          '{{#famousContext id="mainCtx"}} in your body.');
        /*
        log.debug('Creating a new main context.  If you already have '
          + 'your own, set FView.mainCtx = yourMainContext (or to false to get '
          + 'rid of this warning, or null to not set a mainContext)');
        */
      if (FView.mainCtx !== null) {
        var view = FView.famousContext.constructView();
        var wrapped = Blaze.With({ id:"mainCtx" },
          function() { return view; });
        wrapped.__isTemplateWith = true;
        // Because of id:mainCtx, this populates FView.mainCtxFView
        Blaze.render(wrapped, document.body);
      }
      parent = FView.mainCtxFView;
    } else {
      // backcompat, user set FView.mainCtx manually

    }
  }
  //parent = parent ? parent.fview : { node: FView.mainCtx, children: [] };

  this.parent = parent;

  // Keep track of fview children, since Meteor only tracks children in DOM
  parent.children.push(this);

  // Adding to famous parent node, once done here, is now in famous.js

  // Now we have a tree, and a FView.mainCtx if in appMode
  if (postFirstAddQueue) {
    for (var i=0; i < postFirstAddQueue.length; i++)
      Engine.defer(postFirstAddQueue[i]);
    postFirstAddQueue = null;
    FView.postFirstAdd = function(func) {
      Engine.defer(postFirstAddQueue[i]);
    };
  }
};

MeteorFamousView.prototype.render = function() {
  if (this.isDestroyed)
    return [];
  if (this.node)
    return this.node.render();
  console.log('render called before anything set');
  return [];
};

MeteorFamousView.prototype.setNode = function(node) {
  // surface or modifier/view
  this.node = new famous.core.RenderNode(node);
  return this.node;
};

MeteorFamousView.prototype.getSize = function() {
  return this.node && this.node.getSize() || this.size || [true,true];
};

/*
  Replace fview.onDestroy = function() with fview.on('destroy', function)
  which can be called multiple times.  The old way will still work
  but will show a deprecation warning.

MeteorFamousView.prototype.onDestroy = function() {
  return '__original__';
}
*/

MeteorFamousView.prototype.preventDestroy = function() {
  this.destroyPrevented = true;
};

/*
 * A "TemplateDestroy" is when destroy() is called via a Blaze.remove
 * destroyed callback, and should observe destroyPrevented if set.
 * Otherwise, when destroy() is called directly / purposefully /
 * with no arguments, we force cleanup (and ignore destroyPrevented).
 */
MeteorFamousView.prototype.destroy = function(isTemplateDestroy) {
  var i;
  var fview = this;

  // break early and don't run onDestroy().
  if (fview.waitForNoChildrenBeforeDestroy && fview.children.length) {
    if (fview.waitForNoChildrenBeforeDestroy === true) {
      log.debug('Destroying ' + (fview._view ?
        fview._view.name : (fview._modifier ? fview._modifier.name : fview.kind)) +
        ' (#' + fview.id + ') (deferred until all children destroyed)');
      fview.waitForNoChildrenBeforeDestroy = 1;
    }
    return;
  }

  log.debug('Destroying ' + (fview._view ?
    fview._view.name : (fview._modifier ? fview._modifier.name : fview.kind)) +
    ' (#' + fview.id + ') and children' +
    (isTemplateDestroy&&fview.destroyPrevented ? ' (destroyPrevented)':''));

  // XXX ADD TO DOCS
  if (isTemplateDestroy) {

    /*
    if (fview.onDestroy() === '__original__')
      for (var i=0; i < fview._callbacks.destroy.length; i++)
        fview._calbacks.destroy[i].call(fview);
    else
      log.warn('#' + fview.id + ' - you set fview.onDestroy = function().  '
        + 'This will work for now '
        + 'but is deprecated.  Please use fview.onDestoy(callback), which may '
        + 'be used multiple times, and receives the `fview` as `this`.');
    */

    if (fview.onDestroy)
      fview.onDestroy();

    if (fview.destroyPrevented) {
      // log.debug('  #' + fview.id + ' - destroyPrevented');
      return;
    }
  }

  // First delete children (via Blaze to trigger Template destroy callback)
  if (fview.children)
    for (i=0; i < fview.children.length; i++)
      Blaze.remove(fview.children[i].blazeView);

  if (fview._view && fview._view.onDestroy)
    fview._view.onDestroy.call(fview);

  fview.isDestroyed = true;
  fview.node = null;
  fview.view = null;
  fview.modifier = null;

  delete(meteorFamousViews[fview.id]);

  // remove fview from parent
  for (i=0; i < fview.parent.children.length; i++) {
    if (fview.parent.children[i] === fview) {
      fview.parent.children.splice(i, 1);
      break;
    }
  }

  // If we're part of a sequence, now is the time to remove ourselves
  if (fview.parent.sequence) {
    Engine.defer(function() {
      fview.parent.sequence.remove(fview);  // less flicker in a defer
    });
    // Originally we had code here to remove child sequences; this is now
    // handled in famousEach via the cleanup hook.
  }

  if (fview.parent.waitForNoChildrenBeforeDestroy)
    fview.parent.destroy();

  fview._fireCallbacks('cleanup');
};

MeteorFamousView.prototype.on = function(hook, func) {
  this._callbacks[hook].push(func);
};
MeteorFamousView.prototype._fireCallbacks = function(hook, args) {
  for (var i=0; i < this._callbacks[hook].length; i++)
    this._callbacks[hook][i].apply(this, args);
};

throwError = function(startStr, object) {
  if (object instanceof Object)
    console.error(object);
  throw new Error('FView.getData() expects BlazeView or TemplateInstance or ' +
      'DOM node, but got ' + object);
};

FView.from = function(viewOrTplorEl) {
  if (viewOrTplorEl instanceof Blaze.View)
    return FView.fromBlazeView(viewOrTplorEl);
  else if (viewOrTplorEl instanceof Blaze.TemplateInstance)
    return FView.fromTemplate(viewOrTplorEl);
  else if (viewOrTplorEl && typeof viewOrTplorEl.nodeType === 'number')
    return FView.fromElement(viewOrTplorEl);
  else {
    throwError('FView.getData() expects BlazeView or TemplateInstance or ' +
        'DOM node, but got ', viewOrTplorEl);
  }
};

FView.fromBlazeView = FView.dataFromView = function(view) {
  while (!view.fview && (view=view.parentView));
  return view ? view.fview : undefined;
};

FView.fromTemplate = FView.dataFromTemplate = function(tplInstance) {
  return this.dataFromView(tplInstance.view);
};

FView.fromElement = FView.dataFromElement = function(el) {
  var view = Blaze.getView(el);
  return this.dataFromView(view);
};

FView.byId = function(id) {
  return meteorFamousViews[id];
};

// Leave as alias?  Deprecate?
FView.dataFromCmp = FView.dataFromComponent;
FView.dataFromTpl = FView.dataFromTemplate;

FView.dataFromComponent = function(component) {
  log.warn("FView.dataFromComponent has been deprecated.  Please use 'FView.fromBlazeView' instead.");
  return FView.fromBlazeView(component);
};
