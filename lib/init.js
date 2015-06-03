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
  FView.init();
} else {
  Meteor.startup(function() {
    if (typeof famous === 'undefined')
      console.warn("Couldn't find `famous` global, call FView.init() at appropriate time.")
    else
      FView.init();
  });
}
