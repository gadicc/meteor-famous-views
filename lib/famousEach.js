function famousEachRender(eachView, template, argFunc) {
  var fview = eachView.fview;
  var sequence = fview.sequence;				// fviews for Famous Render Tree
  var children = fview.children = [];		// children blaze views

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
            return template.constructView();
          });

          /*
           * This is the repeated block inside famousEach, but not the actual node/
           * view/surface that gets created on render as this block's children
           */
          newItemView.fview = new MeteorFamousView(null, {}, true /* noAdd */);

          if (fview.parent.pipeChildrenTo)
            newItemView.fview.pipeChildrenTo
              = fview.parent.pipeChildrenTo;

          children.splice(index, 0, newItemView);
        	// Unclear why this is necessary to avoid flicker (see note in removedAt)
          _.defer(function() {
	          sequence.splice(index, 0, newItemView.fview);        	
          });

          var unusedDiv = document.createElement('div');
          Blaze.render(newItemView, unusedDiv, eachView);

          //Blaze.materializeView(newItemView, eachView);
          //runRenderedCallback(newItemView);  // now called by Blaze.render
        });
      },
      removedAt: function (id, item, index) {
        Deps.nonreactive(function () {
        	var blazeView = children[index];
        	// This is actually a hack and is wrong.  Assumes only 1 View in #each.
        	var fview = blazeView.fview.children[0];

        	/*
        	 * We actually want to say, if any children are preventing destroy,
        	 * prevent our destroy.  onDestroy, destroy children (honoring their
        	 * preventdestroys), and only once all children are destroyed, can
        	 * we be destoyed.  XXX
        	 */

        	if (fview.destroyPrevented) {

        		// Keep a reference to this exact child, since index might change
        		var thisChild = children[index];
        		var origIndex = index;

        		fview.destroy = function() {
        			var index = origIndex;

        			// If we're not in the original position, find our new index
        			if (sequence.sequence[index] !== thisChild.fview) {
        				for (var i=0; i < sequence.sequence.length; i++) {
        					if (sequence.sequence[i] === thisChild.fview) {
        						index = i;
        						break;
        					}
        				}
        			}

      				if (sequence.sequence[index] !== thisChild.fview) {
      					log.error("Could not find original child in index!", thisChild.fview.id);
      				} else {
	        			/*
	        			 * In examples_animate, the splice causes a brief flicker, but
	        			 * unclear why, since we're removing a zero width item from
	        			 * a SequentialLayout.  If we defer the remove, we're good...
	        			 * but we might need to revisit this.
	        			 */

      					_.defer(function() {
	      					// Remove from Famous Sequence (Blaze child was removed previously)
				          sequence.splice(index, 1);

				          // Call the original destroy() method that this overrides
		        			MeteorFamousView.prototype.destroy.apply(this, arguments);
      					});
			        }
        		}

        		// Blaze children/indexes must always be in sync with observe
		        children.splice(index, 1);

        	} else {

        		// If !destroyPrevented, just remove immediately
	          children.splice(index, 1);
	          sequence.splice(index, 1);

        	}

        	// Destroys the blaze template/view.  Calls .onDestroy(),
        	// and also .destroy() if .preventDestroy() not called
          Blaze.remove(blazeView);
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
  var blazeView = this.view;
  var fview = blazeView.fview = {};

  log.debug('New famousEach'
    + ' (parent: ' + parentViewName(blazeView.parentView) + ','
    + ' template: ' + parentTemplateName(blazeView.parentView) + ')');

  // famousEach specific: don't create new MeteorFamousView
  var parent = blazeView;
  while ((parent=parent.parentView) && !parent.fview);

  fview.parent = parent ? parent.fview : { node: mainCtx };
  fview.sequence = fview.parent.sequencer.child();

  if (!parent.fview.eaches)
    parent.fview.eaches = [];
  parent.fview.eaches.push(blazeView);

  // Contents of {{#famousEach}}block{{/famousEach}}
  if (blazeView.templateContentBlock)
    famousEachRender(blazeView, blazeView.templateContentBlock, function() {
      return Blaze.getData(blazeView);
    });
}

function famousEachDestroyed() {
  var blazeView = this.view;
  var fview = blazeView.fview;

  log.debug('Destroying FamousEach...');

  if (blazeView.stopHandle)
    blazeView.stopHandle.stop();

  for (var i=0; i < fview.children.length; i++)
    Blaze.remove(fview.children[i]);
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