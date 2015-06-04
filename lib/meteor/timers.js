// From meteor/timers.js, 28aug14, commit 3189a36

var withoutInvocation = function (f) {
  if (Package.ddp) {
    var _CurrentInvocation = Package.ddp.DDP._CurrentInvocation;
    if (_CurrentInvocation.get() && _CurrentInvocation.get().isSimulation)
      throw new Error("Can't set timers inside simulations");
    return function () { _CurrentInvocation.withValue(null, f); };
  }
  else
    return f;
};

var bindAndCatch = function (context, f) {
  return Meteor.bindEnvironment(withoutInvocation(f), context);
};

// And our mod

FView.ready(function() {
  var clock = FamousEngine.getClock();
  // log.debug('Overriding Meteor.setTimeout/setInterval/defer to use famous clock');

  _.extend(Meteor, {
    setTimeout: function (f, duration) {
      return clock.setTimeout(bindAndCatch("setTimeout callback", f), duration);
    },
    setInterval: function (f, duration) {
      return clock.setInterval(bindAndCatch("setInterval callback", f), duration);
    },
    clearInterval: function(x) {
      return clock.clearTimer(x);
    },
    clearTimeout: function(x) {
      return clock.clearTimer(x);
    },
    defer: function (f) {
      FView.defer(bindAndCatch("defer callback", f));
    }
  });
});
