var optionEval = function(string, key) {
  if (FView.attrEvalAllowedKeys && (FView.attrEvalAllowedKeys == '*' ||
      FView.attrEvalAllowedKeys.indexOf(key) > -1)) {
    /* jshint ignore:start */
    // Obviously this is "safe" since it's been whitelisted by app author
    return eval(string.substr(5));  // strip "eval:"
    /* jshint ignore:end */
  } else {
    throw new Error("[famous-views] Blocked " + key + '="' + string + '".  ' +
      'Set FView.attrEvalAllowedKeys = "*" or FView.attrEvalAllowedKeys = ["' +
      key + '"] and make sure you understand the security implications. ' +
      'Particularly, make sure none of your helper functions return a string ' +
      'that can be influenced by client-side input');
    }
};

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
};

optionString = function(string, key, blazeView) {
  // special handling based on special key names
  /*
  if (key === 'direction' &&
      typeof famous.utilities.Utility.Direction[string] !== 'undefined')
    return famous.utilities.Utility.Direction[string];
  if (key === 'id')
    return string;
  */
  if (!_.isString(string))
    return string;

  // general string handling
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

    // unescape __defined__
    for (key in obj)
      if (obj[key] === '__undefined__')
        obj[key] = undefined;

    return obj;

  } else if (/^[-+]?(?:(?:\d*[.])?\d+|Infinity)$/.test(string)) {

    return parseFloat(string);

  } else {
    
    return string;
  }
};

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
};

var parentViewName = function(blazeView) {
  while (blazeView &&
      (blazeView.name == "with" || blazeView.name == "(contentBlock)"))
    blazeView = blazeView.parentView;
  return blazeView ? (
      blazeView._fview ? blazeView._fview.type + '#'+blazeView._fview.id : blazeView.name 
    ) : '(root)';
};

var parentTemplateName = function(blazeView) {
  while (blazeView &&
      !blazeView.name.match(/^Template/) && !blazeView.name.match(/^body_content/))
    blazeView = blazeView.parentView;
  return blazeView ? blazeView.name : '(none)';
};

parentDetails = function(blazeView) {
  var pViewName = parentViewName(blazeView.parentView);
  var pTplName = parentTemplateName(blazeView.parentView);
  return '(parent: ' + pViewName +
    (pViewName == pTplName ? '' : ', template: ' + pTplName) + ')';
};

getHelperFunc = function(view, name) {
  var helper;
  while ((view = view.parentView) !== null && !helper) {
    helper = view.template && view.template.__helpers.get(name);
  }
  return helper;
}

// from discussion in https://github.com/Famous/engine/issues/183
getElementFromDOMElement = function(node, callback) {
  var clock = FamousEngine.getClock();
  var query = function() {
    var nodeId = node.getLocation();
    var elements = document
      .querySelector(nodeId.split('/')[0])
      .querySelectorAll('[data-fa-path]');
    for (var i = 0; i < elements.length; ++i) {
      if (elements[i].dataset.faPath === nodeId) {
        return callback(elements[i]);
      }
    }
    clock.setTimeout(query, 16);
  };
  // except for this :(
  clock.setTimeout(query, 64);
};

block = function(s) {
  var ms = s * 1000;
  var start = performance.now();
  console.log('blocking for ' + s + 's');
  while (performance.now() - start < ms);
}
