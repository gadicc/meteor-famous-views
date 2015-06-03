// Could use something from --settings too
var isDev = ("localhost" === window.location.hostname);

log = new Logger('famous-views');
Logger.setLevel('famous-views', isDev ? 'trace' : 'info');

FView = {};

FamousEngine = null;
Size = null;

readyFuncs = [];
FView.ready = function(func) {
  if (FView.initted)
    func();
  else
    readyFuncs.push(func);
}

FView.ready(function() {
  FamousEngine = FView._FamousEngine = famous.core.FamousEngine;
  Size = famous.components.Size;

  // XXX
  FamousEngine.init();
});
