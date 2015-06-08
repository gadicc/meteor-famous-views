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
          fview.parent._class.changedAt.call(fview.parent,
            id, newItem, oldItem, index);
        });
      },
      movedTo: function (id, doc, fromIndex, toIndex) {
        // Deferred only to maintain order with addedAt/removedAt
        FView.defer(function() {
          item = children.splice(fromIndex, 1)[0];
          children.splice(toIndex, 0, item);
          fview.parent._class.movedTo.call(fview.parent,
            id, doc, fromIndex, toIndex);
        });
      }
    });
}

var famousEachClass = {

  addChild: function(child) {
    if (currentOp.type !== OP.ADDED_AT)
      throw new Error("famousEach: got op out of order, please report this.");
    if (currentOp.addCount++)
      throw new Error("famousEach: inline block may only contain a single node.");
    // this = fview
    // need to diff famousEach position in child list
    this.parent._class.addedAt.call(this.parent,
      currentOp.id, child, currentOp.index);
  },

  removeChild: function(child) {
    if (currentOp.type !== OP.REMOVED_AT)
      throw new Error("we broke :(");
    // this = fview
    // need to diff famousEach position in child list
    this.parent._class.removedAt.call(this.parent,
      currentOp.id, child, currentOp.index);
  }

};

function famousEachCreated() {
  var blazeView = this.view;
  var fview = new MeteorFamousView(fviewParentFromBlazeView(blazeView),
    null /* id */, 'FamousEach', parentDetails(blazeView));
  blazeView._fview = fview;
  fview._class = famousEachClass;

  // Contents of {{#famousEach}}block{{/famousEach}}
  if (blazeView.templateContentBlock)
    famousEachRender(blazeView, blazeView.templateContentBlock, function() {
      return Blaze.getData(blazeView);
    });
}

function famousEachDestroyed() {
  this.view._fview.destroy(true);
}

var famousEachView = new Blaze.Template( 
  'FamousEach',
  function() { return null; }
);
famousEachView.created = famousEachCreated;
famousEachView.destroyed = famousEachDestroyed;

Blaze.registerHelper('famousEach', famousEachView);
