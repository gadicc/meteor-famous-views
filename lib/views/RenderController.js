function fullOpacity() { return 1; }
function transformIdentity() { return Transform.Identity; }

FView.transitionModifiers = {
  opacity: {
    outOpacityFrom: function (progress) {
      return progress;
    },
    inOpacityFrom: function (progress) {
      return progress;
    },
    outTransformFrom: transformIdentity, inTransformFrom: transformIdentity
  },
  slideWindow: {
    outTransformFrom: function(progress) {
      return Transform.translate(window.innerWidth * progress - window.innerWidth, 0, 0);
    },
    inTransformFrom: function(progress) {
      return Transform.translate(window.innerWidth * (1.0 - progress), 0, 0);
    },
    inOpacityFrom: fullOpacity, outOpacityFrom: fullOpacity
  },
  WIP: {
    outTransformFrom: function(progress) {
      return Transform.rotateY(Math.PI*progress);
    },
    inTransformFrom: function(progress) {
      return Transform.rotateY(Math.PI + Math.PI*progress);
    },
    inOpacityFrom: fullOpacity, outOpacityFrom: fullOpacity
  }
};

// Other option is to allow a slideDirection attribute.  Think about this.
FView.transitionModifiers.slideWindowLeft = FView.transitionModifiers.slideWindow;
FView.transitionModifiers.slideWindowRight = {
    outTransformFrom: FView.transitionModifiers.slideWindow.inTransformFrom,
    inTransformFrom: FView.transitionModifiers.slideWindow.outTransformFrom
};

function showHide(fview, child_fview, dynamic) {
  if (fview._currentShow)
    fview._previousShow = fview._currentShow;
  fview._currentShow = child_fview;

  if (dynamic)
    child_fview.preventDestroy();

  var transition = fview._transition || null;

  var origTransitionData = {};
  if (typeof fview._transitionOnce !== 'undefined') {
    origTransitionData.transition = transition;
    transition = fview._transitionOnce;
    delete fview._transitionOnce;
  }
  if (fview._transitionModifierOnce) {
    origTransitionData.modifierName = fview._transitionModifier;
    var data = FView.transitionModifiers[fview._transitionModifierOnce];
    if (data) {
      for (var key in data)
        fview.view[key](data[key]);
    } else {
      log.error('No such transition ' + fview._transitionModifierOnce);
    }
    delete fview._transitionModifierOnce;
  }

  fview.view.show(child_fview, transition, function() {
    // Now that transition is complete, we can destroy the old template
    if (fview._previousShow && dynamic)
      fview._previousShow.destroy();

    // If _transitionOnce was used, now we can restore the defaults
    if (origTransitionData.modifierName) {
      // console.log('restore ' + origTransitionData.modifierName);
      var data = FView.transitionModifiers[origTransitionData.modifierName];
      for (var key in data)
        fview.view[key](data[key]);
    }
    if (origTransitionData.transition)
      fview._transition = origTransitionData.transition;
  });
}

function showHideId(id) {
  var fview = this;
  var child = fview.prerenderIds[id];

  if (child) {
    showHide(fview, child, false /* dynamic */)
  } else {
    if (fview.onRenderTree)
      throw new Error("showId changed to '" + id + "' but we have no children with that id");
    else
      fview.renderQueue = id;
  }
}

FView.ready(function(require) {
  FView.registerView('RenderController', famous.views.RenderController, {
    create: function(options) {
      var fview = this;

      if (options.prerender) {
        fview.prerenderIds = {};
        fview.showId = showHideId;
      }

      return new fview._view.constructor(options);
    },

    add: function(child_fview, child_options) {
      var fview = this;

      if (!fview.view)
        return;  // when?

      if (fview.prerenderIds) {
        if (!child_options.id)
          throw new Error("When using renderController prerender=true, every child must use id=somethingUnique");
        fview.prerenderIds[child_options.id] = child_fview;
        return;
      }

      showHide(fview, child_fview, true /* dynamic */);
    },

    attrUpdate: function(key, value, oldValue, data, firstTime) {
      if (key == 'transition') {
        var data = FView.transitionModifiers[value];
        if (data) {
          this._transitionModifier = value;
          for (var key in data)
            this.view[key](data[key]);
        } else if (value) {
          log.error('No such transition ' + value);
        }
      }

      if (key == 'showId') {
        this.showId(value);
      }
    },

    onRenderTree: function() {
      this.onRenderTree = true;
      if (this.renderQueue) {
        this.showId(this.renderQueue);
        delete this.renderQueue;
      }
    },

    onDestroy: function() {
      if (this.prerenderIds)
        delete this.prerenderIds;
    }
  });
});
