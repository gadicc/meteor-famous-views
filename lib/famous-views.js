// Could use something from --settings too
var isDev = ("localhost" === window.location.hostname);

log = new Logger('famous-views');
Logger.setLevel('famous-views', isDev ? 'trace' : 'info');

FView = {};
FView.log = log; // allow other fview-* packages to use this too

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
};

postFirstAddQueue = [];
FView.postFirstAdd = function(func) {
  postFirstAddQueue.push(func);
};

// famous-views globals from Famous
Engine = null;
Transform = null;

if (typeof(famous) === 'undefined' && typeof(define) !== 'undefined')
define(function(require) {
//  console.log(1);
});

/*
 * This must be an exact copy of the function from famous.core.Engine
 * which is not public.  We only use it if famousContext is a direct
 * child of the document body.  Current as of 0.3.1.
 */
initializeFamous = function() {
  // prevent scrolling via browser
  window.addEventListener('touchmove', function(event) {
      event.preventDefault();
  }, true);
  document.body.classList.add('famous-root');
  document.documentElement.classList.add('famous-root');
}

FView.startup = function() {
  log.debug('Current logging default is "debug" (for localhost).  '
    + 'Change in your app with Logger.setLevel("famous-views", "info");');
  FView.startedUp = true;

  // Globals for inside all of famous-views
  Engine = famous.core.Engine;
  Engine.setOptions({appMode: false});
  Transform = famous.core.Transform;


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

    /*
    THIS WAS MOVED TO meteorFamousView.js AND IS ONLY CALLED IF A
    VIEW IS CREATED IN LIMBO AND FVIEW.MAINCTX IS UNSET
    if (!FView.mainCtx) {
      if (typeof FView.mainCtx === 'undefined')
        log.debug('Creating a new main context.  If you already have '
          + 'your own, set FView.mainCtx = yourMainContext (or to false to get '
          + 'rid of this warning, or null to not set a mainContext)');
      if (FView.mainCtx !== null) {
        var view = FView.famousContext.constructView();
        var wrapped = Blaze.With({ id:"mainCtx", style:"" },
          function() { return view });
        wrapped.__isTemplateWith = true;
        Blaze.render(wrapped, document.body);

        /*
         * Mostly for old way of using iron-router (pre #famousContext)
         * In future, we could return after Blaze.render
         * and move stuff below to inside arendered callback */
         /*
        Tracker.flush();

        FView.mainCtx = FView.byId("mainCtx").context;
      }
    }
    */

    // Note, various views are registered here
    FView.runReadies();

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
  Engine.defer(function() {
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
