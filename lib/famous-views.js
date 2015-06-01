log = new Logger('famous-views');
Logger.setLevel('famous-views', 'trace');

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
