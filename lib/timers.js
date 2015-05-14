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

FView.ready(function() {
  var FamousTimer = famous.utilities.Timer;

  _.extend(Meteor, {
    setTimeout: function (f, duration) {
      return FamousTimer.setTimeout(bindAndCatch("setTimeout callback", f), duration);
    },
    setInterval: function (f, duration) {
      return FamousTimer.setInterval(bindAndCatch("setInterval callback", f), duration);
    },
    clearInterval: function(x) {
      return FamousTimer.clear(x);
    },
    clearTimeout: function(x) {
      return FamousTimer.clear(x);
    },
    defer: function (f) {
      Meteor._setImmediate(bindAndCatch("defer callback", f));
    }
  });
});
