FView.init = function() {
  if (famous.core.FamousEngine.removeScene) {
    log.warn("Famous-views strongly recommends using Famous Engine v0.5.2. " +
      "The later releases have serious regressions and we think you'll have a " +
      "better experience with that version. Try " +
      "'meteor add gadicohen:famous@=0.5.2' (note the @=) and remove it later " +
      "when we have news.");
    // FView.initted = 'abort';
    // return;
  }

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
