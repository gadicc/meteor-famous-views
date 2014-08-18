function famousEachRender(eachView, template, argFunc) {
  var famousData = eachView.famousView;
  var sequence = famousData.sequence;
  var children = famousData.children = [];
  var size = famousData.size;

  // For Blaze.currentView (see blaze/builtins.js#each)
  eachView.argVar = new Blaze.ReactiveVar;
  eachView.autorun(function () {
    eachView.argVar.set(argFunc());
  }, eachView.parentView);

  eachView.stopHandle = ObserveSequence.observe(function () {
      return eachView.argVar.get();
    }, {
      addedAt: function (id, item, index) {
        Deps.nonreactive(function () {
          var newItemView = Blaze.With(item, function() {
            return template.__makeView();
          });
          newItemView.famousView = new CompView(null, {}, true);

          if (famousData.parent.pipeChildrenTo)
            newItemView.famousView.pipeChildrenTo
              = famousData.parent.pipeChildrenTo;

          children.splice(index, 0, newItemView);
          sequence.splice(index, 0, newItemView.famousView);

          Blaze.materializeView(newItemView, eachView);
          runRenderedCallback(newItemView);
        });
      },
      removedAt: function (id, item, index) {
        Deps.nonreactive(function () {
          children.splice(index, 1);
          sequence.splice(index, 1);
        });
      },
      changedAt: function (id, newItem, oldItem, index) {
        Deps.nonreactive(function () {
          children[index].dataVar.set(newItem);
        });
      },
      movedTo: function (id, doc, fromIndex, toIndex) {
        Deps.nonreactive(function () {
          var item = sequence.splice(fromIndex, 1)[0];
          sequence.splice(toIndex, 0, item);

          item = children.splice(fromIndex, 1)[0];
          children.splice(toIndex, 0, item);
        });
      }
    });
}

function famousEachCreated() {
  var blazeView = this.__view__;
  var famousData = blazeView.famousView = {};

  log.debug('New famousEach'
    + ' (parent: ' + parentKind(blazeView.parentView) + ','
    + ' template: ' + parentTemplateName(blazeView.parentView) + ')');

  // famousEach specific: don't create new compView
  var parent = blazeView;
  while ((parent=parent.parentView) && !parent.famousView);

  famousData.parent = parent ? parent.famousView : { node: mainCtx };
  famousData.sequence = famousData.parent.sequencer.child();

  if (!parent.famousView.eaches)
    parent.famousView.eaches = [];
  parent.famousView.eaches.push(blazeView);

  // "children" are compViews (not famous nodes, stored in sequence)
  /*
  famousData.children = [];
  if (!parent.famousView.childenArrays)
    parent.famousView.childrenArrays = [];
  parent.famousView.childrenArrays.push(famousData.children);
  */

  // Contents of {{#famousEach}}block{{/famousEach}}
  if (blazeView.templateContentBlock)
    famousEachRender(blazeView, blazeView.templateContentBlock, function() {
      return Blaze.getViewData(blazeView);
    });
}

function famousEachDestroyed() {
  var blazeView = this.__view__;
  var famousData = blazeView.famousView;

  log.debug('Destroying FamousEach...');

  if (blazeView.stopHandle)
    blazeView.stopHandle.stop();

  for (var i=0; i < famousData.children.length; i++)
    Blaze.destroyView(famousData.children[i]);
}

// Keep this at the bottom; Firefox doesn't do function hoisting

famousCmp.famousEachView = Template.__create__(
  'famousEach',           // "kind": "helper"
  function() {        // Blaze.View "renderFunc"
    var view = this;  // Blaze.View, kind "helper"
    // console.log(view);
    return null;
  }
);

UI.registerHelper('famousEach', famousCmp.famousEachView);
famousCmp.famousEachView.created = famousEachCreated;
famousCmp.famousEachView.destroyed = famousEachDestroyed;

/*
famousCmp.Each = function (argFunc, contentFunc, elseFunc) {
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
UI.registerHelper('famousEach', famousCmp.Each);
*/