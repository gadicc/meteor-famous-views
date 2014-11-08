var mainCtx = null;

// Could use something from --settings too
var isDev = ("localhost" === window.location.hostname);

log = new Logger('famous-views');
Logger.setLevel('famous-views', isDev ? 'trace' : 'info');

FView = {};

var readyQueue = [];
var readyDep = new Tracker.Dependency;
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
  log.debug('Current logging default is "debug" (for localhost).  '
    + 'Change in your app with Logger.setLevel("famous-views", "info");');
  FView.startedUp = true;

  famous.polyfills;
  famous.core.famous;
  Transform = famous.core.Transform;

  // Note, various views are registered here
  FView.runReadies();

  // Required document.body
  Meteor.startup(function() {

    // Sanity check, disallow templates with same name as a View
    var names = [];
    for (var name in FView.views)
      if (Template[name])
        names.push(name);
    if (names.length)
      throw new Error("You have created Template(s) with the same name "
        + "as these famous-views: " + names.join(', ')
        + '.  Nothing will work until you rename them.');

    if (FView.mainCtx)
      mainCtx = FView.mainCtx;
    else {
      if (FView.mainCtx !== false)
        log.debug('Creating a new main context.  If you already have '
          + 'your own, set FView.mainCtx = yourMainContext (or to false to get '
          + 'rid of this warning)');
      FView.mainCtx = mainCtx = famous.core.Engine.createContext();
    }

    if (Template.famousInit)
      Blaze.render(Template.famousInit, document.body);
  });
};

FView.isReady = false;

// Imports from weak deps
/*
if (Package['mjnetworks:famous'])
  // @famono ignore
  famous = Package['mjnetworks:famous'].famous;
else if (Package['mjnetworks:mj-famous'])
  // @famono ignore
  famous = Package['mjnetworks:mj-famous'].famous;
*/

// Load as ealry as possible, and keep trying
if (typeof(famous) !== 'undefined') {
  log.debug("Starting up.  famous global found while loading package, great!");
  FView.startup();
}
else
  Meteor.startup(function() {
    if (typeof(famous) !== 'undefined') {
      log.debug("Starting up.  famous global found during Meteor.startup()");
    	FView.startup();
    } else {
      log.debug("No famous global available in Meteor.startup().  Call FView.startup() when appropriate.");
    }
  });

var optionEval = function(string, key) {
  if (FView.attrEvalAllowedKeys && (FView.attrEvalAllowedKeys == '*'
      || FView.attrEvalAllowedKeys.indexOf(key) > -1))
    return eval(string.substr(5));  // strip "eval:"
  else
    throw new Error("[famous-views] Blocked " + key + '="' + string + '".  Set '
      + 'FView.attrEvalAllowedKeys = "*" or FView.attrEvalAllowedKeys = ["'
      + key + '"] and make sure you understand the security implications. '
      + 'Particularly, make sure none of your helper functions return a string '
      + 'that can be influenced by client-side input');
}

var optionBlaze = function(string, key, blazeView) {
  // temporary, for options that get called (wrongly!) from init as well
  // or maybe that is the right place and render is the wrong place :)
  if (!blazeView)
    return '__FVIEW::SKIP__';

  var args = string.substr(2, string.length-4).split(" ");
  var view = blazeView, value;
  while (view.name.substr(0,9) !== 'Template.')
    view = view.parentView;
  value = view.lookup(args.splice(0,1)[0]);

  // Scalar value from data context
  if (typeof value !== 'function')
    return value;

  // Reactive value from helper
  _.defer(function() {
    blazeView.autorun(function() {
      var run = value.apply(null, args);
      blazeView.fview._view.attrUpdate.call(blazeView.fview, key, run);
    });
  });

  return '__FVIEW::SKIP__';
}

optionString = function(string, key, blazeView) {
  if (string.substr(0,5) == 'eval:')
    return optionEval(string, key);
  if (string == 'undefined')
    return undefined;
  if (string == 'true')
    return true;
  if (string == 'false')
    return false;  
  if (string === null)
    return null;

  if (string.substr(0,2) === '{{')
    return optionBlaze(string, key, blazeView);

  if (string[0] == '[' || string[0] == '{') {
    var obj;
    string = string.replace(/\bauto\b/g, '"auto"');
    string = string.replace(/undefined/g, '"__undefined__"');
    // JSON can't parse values like ".5" so convert them to "0.5"
    string = string.replace(/([\[\{,]+)(\W*)(\.[0-9])/g, '$1$20$3');

    try {
      obj = JSON.parse(string);
    }
    catch (err) {
      log.error("Couldn't parse JSON, skipping: " + string);
      log.error(err);
      return undefined;
    }

    for (var key in obj)
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
  for (var key in data) {
    var value = data[key];
    if (_.isString(value))
      options[key] = optionString(value, key);
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


