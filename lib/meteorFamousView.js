var fviews = FView._fviews = {};
var fviewCount = FView._fviewCount = 0;

/**
 * A meteor-famous-views node
 * @constructor
 * @param {dict} options
 * @param {MeteorFamousView} parent
 * @property {MeteorFamousView} parent
 * @property {array} children
 */
MeteorFamousView = FView._MeteorFamousView = function(parent, id, type, source) {  
  this.id = id || fviewCount;
  fviews[this.id] = this;
  fviewCount++;

  log.debug("New " + type + " (#" + this.id + ") from " + source);

  this.type = type;
  this.children = [];
  this.parent = parent;
  if (parent)
    parent.children.push(this);
}

FView.byId = function(id) {
  return fviews[id];
};

fviewParentFromBlazeView = FView._fviewParentFromBlazeView = function (blazeView) {
  while ((blazeView = blazeView.parentView) && blazeView.name.substr(0,7) !== 'Famous.');
  return blazeView && blazeView._fview;
};

/**
 * The fviwe corresponding to the current template helper, event handler,
 * callback, or autorun. If there isn't one, null.  Uses Blaze.currentData
 * internally
 */
FView.current = function() {
  return FView.fromBlazeView(Blaze.currentView);
};

/* C&P from v0 */

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

FView.fromBlazeView = function(view) {
  while (!view._fview && (view=view.parentView));
  return view ? view._fview : undefined;
};

FView.fromTemplate = FView.fromTemplateInstance = function(tplInstance) {
  return this.fromBlazeView(tplInstance.view);
};

FView.fromElement = function(el) {
  var view = Blaze.getView(el);
  return this.fromBlazeView(view);
};
