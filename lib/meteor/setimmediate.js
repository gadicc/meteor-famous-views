// log.debug('Overriding Meteor._setImmediate() to use FView.defer');

var setImmediate = function (fn) {
  FView.defer(fn);
};

setImmediate.implementation = 'famous';
Meteor._setImmediate = setImmediate;
