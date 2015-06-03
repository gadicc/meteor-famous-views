FView.ready(function() {
  var clock = FamousEngine.getClock();
  // log.debug('Overriding Meteor._setImmediate() to use famous clock');

  var setImmediate = function (fn) {
    clock.setTimeout(fn, 0);
  };

  setImmediate.implementation = 'famous';
  Meteor._setImmediate = setImmediate;
});