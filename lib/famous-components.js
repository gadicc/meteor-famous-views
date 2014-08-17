var mainCtx = null;

log = new Logger('famous-components');
Logger.setLevel('famous-components', 'trace');

famousCmp = {};

var readyQueue = [];
var readyDep = new Deps.Dependency;
famousCmp.ready = function(func) {
	if (func)
		readyQueue.push(func);
	else {
		readyDep.depend();
		return famousCmp.isReady;
	}
}
famousCmp.runReadies = function() {
	famousCmp.isReady = true;
	readyDep.changed();
	while(readyQueue.length) {
		(readyQueue.shift())();
	}
}

// famous-components globals from Famous
Transform = null;

if (typeof(famous) === 'undefined' && typeof(define) !== 'undefined')
define(function(require) {
//  console.log(1);
});

famousCmp.startup = function() {
  log.info('Current logging default is "debug".  Change in your app with '
    + 'Logger.setLevel("famous-components", "info");');
  famousCmp.startedUp = true;

  famousCmp.registerView('SequentialLayout', famous.views.SequentialLayout);
  famousCmp.registerView('View', famous.core.View);

  famous.polyfills;
  famous.core.famous;

  Transform        = famous.core.Transform;

  if (famousCmp.mainCtx)
    mainCtx = famousCmp.mainCtx;
  else {
    if (famousCmp.mainCtx !== false)
      log.warn('Creating a new main context.  If you already have '
        + 'your own, set famousCmp.mainCtx = yourMainContext (or to false to get '
        + 'rid of this warning)');
    famousCmp.mainCtx = mainCtx = famous.core.Engine.createContext();
  }

  if (Template.famousInit)
    UI.insert(UI.render(Template.famousInit), document.body);

  famousCmp.runReadies();
};

famousCmp.isReady = false;
Meteor.startup(function() {
  if (typeof(famous) !== 'undefined')
  	famousCmp.startup();
});

optionString = function(string) {
  if (string == 'undefined')
    return undefined;
  if (string == 'true')
    return true;
  if (string == 'false')
    return false;
  if (string.substr(0,1) == '[') {
    var out = [];
    string = string.substr(1, string.length-2).split(',');
    for (var i=0; i < string.length; i++)
      out.push(optionString(string[i].trim()));
    return out;
  }
  if (string.match(/^[0-9\.]+$/))
    return parseFloat(string);
  return string;
}

handleOptions = function(data, compView) {
  options = {};
  for (key in data) {
    var value = data[key];
    if (_.isString(value))
      options[key] = optionString(value);
    else
      options[key] = value;
  }
  return options;
}

/* --- totally not done --- */

famousCmp.showTreeGet = function(renderNode) {
  var obj = renderNode._node._child._object;
    if (obj.node)
      obj.node = this.showTreeGet(obj.node);
  return obj;
}
famousCmp.showTreeChildren = function(renderNode) {
  var out = {}, i=0;
  if (renderNode._node)
    out['child'+(i++)] = this.showTreeGet(renderNode)
  return out;
}
famousCmp.showTree = function() {
  console.log(this.showTreeChildren(mainCtx));
}

/* --- */


