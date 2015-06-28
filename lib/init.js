FView.init = function() {
  if (famous.core.FamousEngine.removeScene) {
    console.error("Sorry, this version of famous-views only works with famous 0.5.2. "
        + "There might be a newer famous-views version out or we're busy building it! "
        + "Try 'meteor add gadicohen:famous@=0.5.2' (note the @=) and remove later.");
    FView.initted = 'abort';
    return;
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
