FView.init = function() {
  FView.initted = true;

  for (var i=0; i < readyFuncs.length; i++)
    readyFuncs[i]();
  readyFuncs = null;

  Meteor.startup(function() {
    wrappers.checkForConflicts();
  });
}

if (typeof famous !== 'undefined') {
  log.debug("Starting up.  famous global found while loading package, great!");
  FView.init();
} else {
  Meteor.startup(function() {
    if (typeof famous === 'undefined')
      log.debug("Couldn't find `famous` global, call FView.init() when appropriate.")
    else {
      log.debug("Starting up.  famous global found during Meteor.startup()");
      FView.init();
    }
  });
}
