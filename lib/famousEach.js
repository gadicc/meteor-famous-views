var OP = {
  NULL: 0,
  ADDED_AT: 1,
  REMOVED_AT: 2
};

var currentOp = { type: OP.NULL };

function famousEachRender(eachView, template, argFunc) {
  var fview = eachView._fview;
  var children = fview.eachChildren = [];       // each contentBlock instance

  // For Blaze.currentView (see blaze/builtins.js#each)
  eachView.argVar = new Blaze.ReactiveVar();
  eachView.autorun(function () {
    eachView.argVar.set(argFunc());
  }, eachView.parentView);

  eachView.stopHandle = ObserveSequence.observe(function () {
      return eachView.argVar.get();
    }, {
      addedAt: function (id, item, index) {
        // Deferred since could trigger any time and Blaze stuff takes time
        FView.defer(function() {
          var newItemView = Blaze.With(item, function() {
            return template.constructView();
          });

          /*
           * During Blaze.render(), newNode.addToParent() calls
           * FamousEach.addChild() which calls GrandParent.addedAt()
           * using the stored data below.
           */
          currentOp.type = OP.ADDED_AT;
          currentOp.index = index;
          currentOp.id = id;
          currentOp.addCount = 0;
          currentOp.item = item;
          children.splice(index, 0, newItemView);
          Blaze.render(newItemView, unusedDiv, eachView);
          currentOp.type = OP.NULL;
        });
      },
      removedAt: function (id, item, index) {
        // Deferred since could trigger any time and Blaze stuff takes time
        FView.defer(function() {
          // same deal as addedAt
          currentOp.type = OP.REMOVED_AT;
          currentOp.index = index;
          currentOp.id = id;
          currentOp.item = item;
          Blaze.remove(children[index]);
          children.splice(index, 1);
          currentOp.type = OP.NULL;
        });
      },
      changedAt: function (id, newItem, oldItem, index) {
        // Deferred only to maintain order with addedAt/removedAt
        FView.defer(function() {
          children[index].dataVar.set(newItem);
          fview.parent.changedAt(id, newItem, oldItem, index,
            children[index]._fviewEach);
        });
      },
      movedTo: function (id, doc, fromIndex, toIndex) {
        // Deferred only to maintain order with addedAt/removedAt
        FView.defer(function() {
          item = children.splice(fromIndex, 1)[0];
          children.splice(toIndex, 0, item);
          fview.parent.movedTo(id, doc, fromIndex, toIndex,
            children[toIndex]._fviewEach);
        });
      }
    });
}

FView.wrap('famousEach', noop, {

  addChild: function(fviewChild) {
    if (currentOp.type !== OP.ADDED_AT)
      throw new Error("famousEach: got op out of order, please report this.");
    if (currentOp.addCount++)
      throw new Error("famousEach: inline block may only contain a single node.");
    // this = fview
    // need to diff famousEach position in child list
    this.parent.addedAt(currentOp.id, currentOp.item, currentOp.index, fviewChild);

    // TODO, see if this leaks anywhere, document?
    this.eachChildren[currentOp.index]._fviewEach = fviewChild;
  },

  removeChild: function(fviewChild) {
    if (currentOp.type !== OP.REMOVED_AT)
      throw new Error("famousEach: got op out of order, please report this.");
    // this = fview
    // need to diff famousEach position in child list
    this.parent.removedAt(currentOp.id, currentOp.item, currentOp.index, fviewChild);
  },

  template: {

    make: function(_class) {
      var template = new Blaze.Template('FamousEach', this.renderFunc);
      template.created = this.onCreate(_class);
      template.destroyed = this.onDestroy;
      template._fviewClass = _class;
      return template;
    },

    renderFunc: function() {
      return null;
    },

    onCreate: function(_class) {
      return function() {
        var blazeView = this.view;
        var fview = new _class(fviewParentFromBlazeView(blazeView),
          null /* id */, parentDetails(blazeView));
        blazeView._fview = fview;
        fview._class = _class;

        // Contents of {{#famousEach}}block{{/famousEach}}
        if (blazeView.templateContentBlock)
          famousEachRender(blazeView, blazeView.templateContentBlock, function() {
            return Blaze.getData(blazeView);
          });        
      }
    },

    onDestroy: function() {
      this.view._fview.destroy(true);
    }

  }  

});