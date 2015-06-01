var wrap = function(fvClassBase, name, famousClass, overrides) {
  var fvClass = _.extend({}, fvClassBase,
    { name: name, famousClass: famousClass, _super: NodeClass }, overrides);

  var template = fvClass.makeTemplate(fvClass);
  Blaze.registerHelper(fvClass.name, template);
};

var NodeClass = FView._NodeClass = {
  name: 'UnnamedNode',
  famousClass: null,

  newInstance: function(fview) {
    var fview = this;
    return new fview.fvClass.famousClass();
  },

  addChild: function(child) {
    var fview = this;
    fview.node.addChild(child);
  },

  addToParent: function() {
    var fview = this;
    fview.parent.fvClass.addChild.call(fview.parent, fview.node)
  },

  /*
  attrUpdate: function(key, value, oldValue, data, firstTime) {
    var fview = this;
    switch (key) {
      default:
        fview.fvClass._super.attrUpdate(key, value, oldValue, data, firstTime);
    }
  },
  */

  makeTemplate: function(fvClass) {
    var template = new Blaze.Template('Famous.' + fvClass.name,
      fvClass.renderFunc);
    template.created = fvClass.templateCreated;
    template.destroyed = fvClass.templateDestroyed;
    template._fviewClass = fvClass;
    return template;
  },

  renderFunc: function() {
    var data = Blaze.getData(this);
    if (!data)
      return null;

    var blazeView = this;
    var tpl = blazeView._templateInstance;
    var fview = blazeView._fview;
    var fvClass = blazeView.template._fviewClass;

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
        key, changed[key], orig[key], tpl.data, !blazeView.hasRendered);

    blazeView.hasRendered = true;
    return null;
  },

  templateCreated: function() {
    var blazeView = this.view;
    var data = this.data || {};
    var fvClass = blazeView.template._fviewClass;
    var fview = new MeteorFamousView(fviewParentFromBlazeView(blazeView),
      data.id, fvClass.name, parentDetails(blazeView));

    blazeView._fview = fview;
    fview.blazeView = blazeView;
    fview.fvClass = fvClass;
    fview.components = {};
    fview._attrUpdate = fvClass.attrUpdate; // for testing
    // console.log('created', fview.node);

    fview.node = fvClass.newInstance.call(fview);
    fview.fvClass.addToParent.call(fview);

    var viewToRender;
    if (blazeView.parentView && blazeView.parentView.__isTemplateWith) {
      viewToRender = Blaze._TemplateWith(
        Blaze._parentData(1, true /*_functionWrapped*/),
        function() { return fview.blazeView.templateContentBlock; }
      );
    } else
      viewToRender = fview.blazeView.templateContentBlock;

    // This materializes the Node's spacebars contents; div is never used
    Blaze.render(viewToRender, document.createElement('div'), fview.blazeView);

    if (data._onRender) {
      var onRender = getHelperFunc(blazeView, data._onRender);
      if (onRender)
        onRender.call(fview);
      else
        log.error("No such helper for _onRender: " + data._onRender);
      delete data._onRender;
    }
  },

  templateDestroyed: function() {
    var fview = FView.from(this);
    fview.destroy();
    fview.node.dismount();    
  }
};

var sizeKey;
FView.ready(function() {
  sizeKey = {
    A: famous.core.Node.ABSOLUTE_SIZE,
    R: famous.core.Node.RELATIVE_SIZE,
    P: famous.core.Node.RELATIVE_SIZE, // there's no Node.PROPORTIONAL_SIZE,
    D: famous.core.Node.RELATIVE_SIZE  // there's no Node.DIFFERENTIAL_SIZE
  };
});
var sizeMethods = { A: 'setAbsolute', P: 'setProportional', D: 'setDifferential' };

function argsFromVecTransitionCB(vec, transition, callback) {
  var args = vec.slice();  // don't mutate
  if (args.length === 2)
    args.push(0);
  if (transition) {
    args.push(transition);
    if (callback)
      args.push(callback);
  }
  return args;
}

NodeClass.attrUpdate = function(key, value, oldValue, data, firstTime) {
  var fview = this;

  switch(key) {
    case 'size':
      var i, cur, modes = [], sizes = { A: [], D: [], P: [] }, usedSizes = {};
      value = value.split(';');
      for (i=0; i < value.length; i++) {
        cur = value[i].split(':');
        cur[0] = cur[0].trim().toUpperCase();
        if (cur[0] === 'RENDERSIZE' || cur[0] === 'RS') {
          modes[i] = famous.core.Node.RENDER_SIZE;
        } else {
          cur[0] = cur[0].charAt(0);
          modes[i] = sizeKey[cur[0]] || famous.core.Node.DEFAULT_SIZE;
          if (cur[0] === 'R') {
            cur[1] = cur[1].split(',');
            sizes['P'][i] = parseFloat(cur[1][0].trim());
            if (!cur[1][1])
              throw new Error("Size, expecting 'relative: proportion, differential'");
            sizes['D'][i] = parseFloat(cur[1][1].trim());
            usedSizes['P'] = true;
            usedSizes['D'] = true;
          } else {
            sizes[cur[0]][i] = parseFloat(cur[1]);
            if (cur[0] === 'P') sizes['D'][i] = 0;
            else if (cur[0] === 'D') sizes['P'][i] = 1;
            usedSizes[cur[0]] = true;
          }
        }
      }
      if (!fview.size)
        fview.size = new Size(fview.node);

      fview.size.setMode.apply(fview.size, modes);
      // console.log('setMode', modes);
      _.each(Object.keys(usedSizes), function(which) {
        // console.log(sizeMethods[which], sizes[which]);
        fview.size[sizeMethods[which]].apply(fview.size, sizes[which]);
      });
      break;

    default:
      var args, method = 'set' + key[0].toUpperCase() + key.substr(1); // TODO, cache
      value = optionString(value, key, fview.blazeView);
      if (typeof value === 'object' && !(value instanceof Array)) {
        if (!fview[key])
          fview[key] = new famous.components[key[0].toUpperCase()+key.substr(1)](fview.node);
        if (value.value) {
          // console.log(key, 'obj', value);
          if (value.halt)
            fview[key].halt();
          var args = argsFromVecTransitionCB(value.value, value.transition, value.callback);
          // console.log(key, args);
          fview[key].set.apply(fview[key], args);
        } else if (value.value1) {
          var args1, args2;
          var f1 = function() { fview[key].set.apply(fview[key], args1); };
          var f2 = function() { fview[key].set.apply(fview[key], args2); };
          args1 = argsFromVecTransitionCB(value.value1, value.transition, f2);
          args2 = argsFromVecTransitionCB(value.value2, value.transition, f1);
          fview[key].halt();
          f1();
        }
      } else {
        // console.log(method, value);
        fview.node[method].apply(fview.node, value);
      }
  }
}

FView._attrUpdate = NodeClass.attrUpdate; // for testing

var ComponentClass = {
  name: 'unnamdeComponent',
  famousClass: null,

  newComponentInstance: function(fview) {
    var fvClass = this;
    return new fvClass.famousClass(fview.node);
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
    var data = Blaze.getData(this);
    if (!data)
      return null;

    var blazeView = this;
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

    fview[fvClass.shortcutName] = fview.components[fvClass.name].instance;
  },

  templateDestroyed: function() {
    throw new Error("You tried to remove a Component via Blaze, but you "
      + "but should remove it's parent node instead");
  },

  makeTemplate: NodeClass.makeTemplate
}

FView.wrap = _.partial(wrap, NodeClass);
FView.wrapComponent = _.partial(wrap, ComponentClass);
