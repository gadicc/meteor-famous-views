// Could use something from --settings too
var isDev = ("localhost" === window.location.hostname);

log = new Logger('famous-views');
Logger.setLevel('famous-views', isDev ? 'trace' : 'info');

FView = {};

readyFuncs = [];
FView.ready = function(func) {
  if (FView.initted) {
    if (FView.initted !== 'abort')
      func();
  } else
    readyFuncs.push(func);
}

FView.ready(function() {
  setGlobals();

  // XXX
  FamousEngine.init();
});

unusedDiv = null;
FView.ready(function() {
  // this will always be empty, but Blaze needs a real div to render to.
  // let's make sure we only ping the dom once and don't garbage collect
  unusedDiv = FView.unusedDiv = document.createElement('div');
});

noop = function() {};