var ComponentClass = {
  name: 'unnamdeComponent',
  famousClass: null,

  newComponentInstance: function(fview) {
    //var fvClass = this;
    var comp = new this.famousClass(fview.node);
    if (!(comp._id || comp.id))
      comp._id = fview.node.addComponent(comp);
    return comp;
  },

  addChild: function(child) {
    var fview = this;
    // TODO, add child needs fvClass
    throw new Error('Components can\'t have children');
  },

  attrUpdate: function(key, value, oldValue, data, firstTime, componentData) {
    var fview = this;

    var method = 'set' + key[0].toUpperCase() + key.substr(1); // TODO, cache
    value = optionString(value, key /*, fview.blazeView  don't have it */);
    componentData.instance[method].call(componentData.instance, value);
  },

 // Note, we can't re-use Node's renderFunc, since this is a COMPONENT *on* the node
  // However, we should modularize common code.
  renderFunc: function() {
    var blazeView = this;
    if (blazeView.parentView && !blazeView.parentView.__isTemplateWith)
      return null;      // No arguments, data is from a `with`

    var data = Blaze.getData(this);
    if (!data)
      return null;      // No data context, i.e. no arguments

    var tpl = blazeView._templateInstance;
    //var fview = blazeView._fview;
    var fview = fviewParentFromBlazeView(blazeView);
    var fvClass = blazeView.template._fviewClass;
    var componentData = fview.components[fvClass.name];

    delete data.id;
    delete data._onRender;

    var changed = {};
    var orig = {};

    for (var key in data) {
      var value = data[key];
      if (value !== '__FVIEW_SKIP__' &&
          (!blazeView.hasRendered || !EJSON.equals(value, tpl.data[key]))) {
        orig[key] = blazeView.hasRendered ? tpl.data[key] : null;
        changed[key] = tpl.data[key] = value;
      }
    }

    for (var key in changed)
      fvClass.attrUpdate.call(fview,
        key, changed[key], orig[key], tpl.data, !blazeView.hasRendered,
        componentData);

    blazeView.hasRendered = true;
    return null;
  },

  templateCreated: function() {
    var blazeView = this.view;
    var fview = fviewParentFromBlazeView(blazeView);
    var fvClass = blazeView.template._fviewClass;

    fview.components[fvClass.name] = {
      fvClass: fvClass,
      blazeView: this,
      instance: fvClass.newComponentInstance.call(fvClass, fview)
    };

    if (fvClass.shortcutName)
      fview[fvClass.shortcutName] = fview.components[fvClass.name].instance;
  },

  destroy: function(fview) {
    // dont do this?  some components rely on node unmount
    //fview.node.removeComponent(this.instance);
  },

  templateDestroyed: function() {
    // TODO, untested
    var blazeView = this.view;
    var fview = fviewParentFromBlazeView(blazeView);
    var fvClass = blazeView.template._fviewClass;
    var componentData = fview.components[fvClass.name];
    fvClass.destroy.call(componentData, fview);

//    throw new Error("You tried to remove a Component via Blaze, but you "
//      + "but should remove it's parent node instead");
  },

  makeTemplate: function(fvClass) {
    var template = new Blaze.Template('Famous.' + fvClass.name,
      fvClass.renderFunc);
    template.created = fvClass.templateCreated;
    template.destroyed = fvClass.templateDestroyed;
    template._fviewClass = fvClass;
    return template;
  }
}

FView.wrapComponent = _.partial(wrappers.partial, ComponentClass);