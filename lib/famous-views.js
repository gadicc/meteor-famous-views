var mainCtx = null;

log = new Logger('famous-views');
Logger.setLevel('famous-views', 'trace');

FView = famousCmp = {};

var readyQueue = [];
var readyDep = new Deps.Dependency;
FView.ready = function(func) {
	if (func) {
    if (FView.isReady)
      func();
    else  
		  readyQueue.push(func);
  } else {
		readyDep.depend();
		return FView.isReady;
	}
}
FView.runReadies = function() {
	FView.isReady = true;
	readyDep.changed();
	while(readyQueue.length) {
		(readyQueue.shift())();
	}
}

// famous-views globals from Famous
Transform = null;

if (typeof(famous) === 'undefined' && typeof(define) !== 'undefined')
define(function(require) {
//  console.log(1);
});

FView.startup = function() {
  log.info('Current logging default is "debug".  Change in your app with '
    + 'Logger.setLevel("famous-views", "info");');
  FView.startedUp = true;

  FView.registerView('SequentialLayout', famous.views.SequentialLayout);
  FView.registerView('View', famous.core.View);

  famous.polyfills;
  famous.core.famous;

  Transform        = famous.core.Transform;

  if (FView.mainCtx)
    mainCtx = FView.mainCtx;
  else {
    if (FView.mainCtx !== false)
      log.warn('Creating a new main context.  If you already have '
        + 'your own, set FView.mainCtx = yourMainContext (or to false to get '
        + 'rid of this warning)');
    FView.mainCtx = mainCtx = famous.core.Engine.createContext();
  }

  FView.runReadies();

  if (Template.famousInit)
    UI.insert(UI.render(Template.famousInit), document.body);
};

FView.isReady = false;
Meteor.startup(function() {
  if (typeof(famous) !== 'undefined')
  	FView.startup();
});

optionString = function(string) {
  if (string == 'undefined')
    return undefined;
  if (string == 'true')
    return true;
  if (string == 'false')
    return false;  
  if (string === null)
    return null;

  if (string[0] == '[' || string[0] == '{') {
    var obj;
    string = string.replace(/\bauto\b/g, '"auto"');
    string = string.replace(/undefined/g, '"__undefined__"');
    // JSON can't parse values like ".5" so convert them to "0.5"
    string = string.replace(/([\[\{,]+)(\W*)(\.[0-9])/g, '$1$20$3');
    obj = JSON.parse(string);
    for (key in obj)
      if (obj[key] === '__undefined__')
        obj[key] = undefined;
    return obj;
  } else {
    var float = parseFloat(string);
    if (!_.isNaN(float))
      return float;
    return string;
  }

  /*
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
  */
}

handleOptions = function(data) {
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

FView.showTreeGet = function(renderNode) {
  var obj = renderNode._node._child._object;
    if (obj.node)
      obj.node = this.showTreeGet(obj.node);
  return obj;
}
FView.showTreeChildren = function(renderNode) {
  var out = {}, i=0;
  if (renderNode._node)
    out['child'+(i++)] = this.showTreeGet(renderNode)
  return out;
}
FView.showTree = function() {
  console.log(this.showTreeChildren(mainCtx));
}

/* --- */


