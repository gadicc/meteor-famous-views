function famousEachRender(eachView, template, argFunc) {
  var fview = eachView.fview;
  var sequence = fview.sequence;            // fviews for Famous Render Tree
  var children = fview.children = [];       // each contentBlock instance

  // For Blaze.currentView (see blaze/builtins.js#each)
  eachView.argVar = new Blaze.ReactiveVar();
  eachView.autorun(function () {
    eachView.argVar.set(argFunc());
  }, eachView.parentView);

  // used for view overrides per event callback below
  var viewParent = fview.parent;

  eachView.stopHandle = ObserveSequence.observe(function () {
      return eachView.argVar.get();
    }, {
      addedAt: function (id, item, index) {
        var override = (viewParent._view && viewParent._view.addedAt)
          || viewParent.addedAt;
        var _super = function() {
          Tracker.nonreactive(function () {
            var newItemView = Blaze.With(item, function() {
              return template.constructView();
            });

            /*
             * This is the repeated block inside famousEach, but not the actual node/
             * view/surface that gets created on render as this block's children.
             * We create a pseudo-fview for this
             */
            newItemView.fview = new MeteorFamousView(null, {}, true /* noAdd */);
            newItemView.fview.kind = 'famousEachBlock';

            if (fview.parent.pipeChildrenTo)
              newItemView.fview.pipeChildrenTo =
                fview.parent.pipeChildrenTo;

            // Maintain ordering with other deferred operations
            Engine.defer(function() {
              newItemView.fview.sequence = sequence.child(index);
              children.splice(index, 0, { blazeView: newItemView });

              var unusedDiv = document.createElement('div');
              Blaze.render(newItemView, unusedDiv, eachView);
            });

            //Blaze.materializeView(newItemView, eachView);
            //runRenderedCallback(newItemView);  // now called by Blaze.render
          });
        };

        if (override)
          override.call(viewParent, id, item, index, _super, eachView);
        else
          _super();
      },
      removedAt: function (id, item, index) {
        var override = (viewParent._view && viewParent._view.removedAt)
          || viewParent.removedAt;
        var _super = function() {
          Engine.defer(function() {
            Blaze.remove(children[index].blazeView);
            children.splice(index, 1);
          });
        };

        if (override)
          override.call(viewParent, id, item, index, _super, eachView);
        else
          _super();
      },
      changedAt: function (id, newItem, oldItem, index) {
        var override = (viewParent._view && viewParent._view.changedAt)
          || viewParent.changedAt;
        var _super = function() {
          Engine.defer(function() {
            children[index].blazeView.dataVar.set(newItem);
          });
        };

        if (override) override.call(viewParent,
          id, newItem, oldItem, index, _super, eachView);
        else
          _super();
      },
      movedTo: function (id, doc, fromIndex, toIndex) {
        var override = (viewParent._view && viewParent._view.movedTo)
          || viewParent.movedTo;
        var _super = function() {
          Engine.defer(function () {
            var item = sequence.splice(fromIndex, 1)[0];
            sequence.splice(toIndex, 0, item);

            item = children.splice(fromIndex, 1)[0];
            children.splice(toIndex, 0, item);
          });
        };

        if (override) override.call(viewParent,
          id, doc, fromIndex, toIndex, _super, eachView);
        else
          _super();
      }
    });
}

function famousEachCreated() {
  var blazeView = this.view;
  var fview = blazeView.fview = new MeteorFamousView(blazeView, {});
  fview.kind = 'famousEach';

  log.debug('New famousEach' + " (#" + fview.id + ')' +
    ' (parent: ' + parentViewName(blazeView.parentView) + ',' +
    ' template: ' + parentTemplateName(blazeView.parentView) + ')');


  // Maintain order with other deferred operations
  Engine.defer(function() {
    fview.sequence = fview.parent.sequence.child();

    // Contents of {{#famousEach}}block{{/famousEach}}
    if (blazeView.templateContentBlock)
      famousEachRender(blazeView, blazeView.templateContentBlock, function() {
        return Blaze.getData(blazeView);
      });
  });
}

function famousEachDestroyed() {
  this.view.fview.destroy(true);
}

// Keep this at the bottom; Firefox doesn't do function hoisting

FView.famousEachView = new Template(
  'famousEach',       // viewName: "famousEach"
  function() {        // Blaze.View "renderFunc"
    var view = this;  // Blaze.View, viewName "famousEach"
    // console.log(view);
    return null;
  }
);

Blaze.registerHelper('famousEach', FView.famousEachView);
FView.famousEachView.created = famousEachCreated;
FView.famousEachView.destroyed = famousEachDestroyed;

/*
FView.Each = function (argFunc, contentFunc, elseFunc) {
  var eachView = Blaze.View('Feach', function() {
    return null;
  });

  eachView.onCreated(function() {
    // For Blaze.currentView (see blaze/builtins.js#each)
    eachView.autorun(function () {
      eachView.argVar.set(argFunc());
    }, eachView.parentView);


  });

  return eachView;
}
Blaze.registerHelper('famousEach', FView.Each);
*/
