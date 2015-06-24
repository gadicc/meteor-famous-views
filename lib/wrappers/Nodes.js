var fvNode = FView._classes._Node = function fvNode() {
  MeteorFamousView.apply(this, arguments);
};
fvNode.prototype = Object.create(MeteorFamousView.prototype);
fvNode.prototype.constructor = fvNode;

fvNode.prototype.className = 'unnamedNode';
fvNode.prototype.famousClass = null;

/*
 * Create a new Famous class instance, e.g. var node = new Node();
 */
fvNode.prototype.newFamousInstance = function() {
  return new this.famousClass();
};

/*
 * Add a fview child to the current fview
 */
fvNode.prototype.addChild = function(fviewChild) {
  this.node.addChild(fviewChild.node);
};

/*
 * How we are added to our parent
 */
fvNode.prototype.addNodeToParent = function() {
  this.parent.addChild(this);
};

/*
 * For observes, an add relative to a sequence
 */
fvNode.prototype.addedAt = function(id, item, index, fviewChild) {
  this.addChild(fviewChild);
};

/*
 * How to remove a famous child
 */
fvNode.prototype.removeChild = function(famousChild) {
  console.log(this.node, 'has child?', famousChild);
  this.node.removeChild(famousChild);
};

/*
 * What to do with our node when an fview instance is destroyed (usually
 * via Template destroy).  We call parent.removeChild() rather than
 * the node's dismount() directly, to let the parent decide what to do.
 * 
 */
fvNode.prototype.dismount = function() {
  this.parent.removeChild.call(this.parent, this.node);
};

/*
 * Called when removed from an observe sequence
 */
fvNode.prototype.removedAt = function(id, item, index, fviewChild) {
  this.removeChild(fviewChild);
};

/*
 * Regular nodes don't care about this, views/layouts will
 */
fvNode.prototype.changedAt = noop;
fvNode.prototype.movedTo = noop;

/*
 * How to handle reactive attribute changes
 */
/*
attrUpdate: function(key, value, oldValue, data, firstTime) {
  var fview = this;
  switch (key) {
    default:
      fview._class._super.attrUpdate(key, value, oldValue, data, firstTime);
  }
},
*/

fvNode.prototype._preventDestroyWith = function(func) {
  this._destroyPrevented = func;
}

fvNode.template = {

  /*
   * How to construct our template
   */
  make: function(_class) {
    var template = new Blaze.Template('Famous.' + _class.className,
      this.renderFunc);
    template.created = this.onCreate(_class);
    template.destroyed = this.onDestroy;
    template._fviewClass = _class;
    return template;
  },

  /*
   * The Blaze "renderFunc" that reruns reactively, used to call attrUpdate
   */
  renderFunc: function() {
    var blazeView = this;
    if (blazeView.parentView && !blazeView.parentView.__isTemplateWith)
      return null;      // No arguments, data is from a `with`

    var data = Blaze.getData(this);
    if (!data)
      return null;      // No data context, i.e. no arguments

    var tpl = blazeView._templateInstance;
    var fview = blazeView._fview;
    // var _class = blazeView.template._fviewClass; no longer needed

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
      fview.attrUpdate.call(fview,
        key, changed[key], orig[key], tpl.data, !blazeView.hasRendered);

    blazeView.hasRendered = true;
    return null;
  },

  /*
   * What to do on a Blaze template created lifeycle callback
   */
  onCreate: function (_class) {
    return function() {
      var blazeView = this.view;
      var data = this.data || {};
      var _class = blazeView.template._fviewClass;
      var fview = new _class(fviewParentFromBlazeView(blazeView),
        data.id, parentDetails(blazeView));

      blazeView._fview = fview;
      fview.blazeView = blazeView;
      fview._class = _class;
      fview.components = {};
      fview._attrUpdate = _class.attrUpdate; // for testing
      // console.log('created', fview.node);

      fview.node = fview.newFamousInstance();
      fview.addNodeToParent();

      fview.autorun = function(func) {
        blazeView.autorun(function() {
          func.call(fview);
        });
      };

      var viewToRender;
      if (blazeView.parentView && blazeView.parentView.__isTemplateWith) {
        viewToRender = Blaze._TemplateWith(
          Blaze._parentData(1, true /*_functionWrapped*/),
          function() { return fview.blazeView.templateContentBlock; }
        );
      } else
        viewToRender = fview.blazeView.templateContentBlock;

      // This materializes the Node's spacebars contents; div is never used
      Blaze.render(viewToRender, unusedDiv, fview.blazeView);

      if (data._onRender) {
        var onRender = getHelperFunc(blazeView, data._onRender);
        if (onRender)
          onRender.call(fview);
        else
          log.error("No such helper for _onRender: " + data._onRender);
        delete data._onRender;
      }
    };
  },

  /*
   * What to do on a Blaze template destroyed lifecycle callback
   */
  onDestroy: function() {
    this.view._fview.destroy(true);
  }

}; /* template */

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

/*
 * Default attrUpdate for a typical node
 */
fvNode.prototype.attrUpdate = function(key, value, oldValue, data, firstTime) {
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
      if (!fview.node[method])
        throw new Error(fview.node.type + " has no attribute " + key);

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

//FView._attrUpdate = NodeClass.attrUpdate; // for testing

FView.wrap = _.partial(wrappers.partial, fvNode);
