/*
 * Really not sure about this.  Super useful and convenient, super inefficient
 * I guess if we were guranteed ES6 and could use generators, we'd be ok, maybe.
 * Probably ok: FV(fview).children(selector), etc
 * Probably bad: FV(selector) on a big tree
 */

FV = function(selector) {
  var results = new FVI();

  if (!selector) {

    // empty result set; what jQuery does

  } else if (selector instanceof FView._classes._Node) {

    results.push(selector);

  } else if (_.isString(selector)) {

    if (selector.substr(0, 1) === '#') {

      // shortcut since only one match
      var fview = FView.byId(selector.substr(1));
      if (fview)
        results.push(fview);

    } else {

      // loop through entire tree
      _.each(FView._fviews, function(fview) {
        if (matches(fview, selector))
          results.push(fview);    
      });

    }

  } else {

    var fview = FView.from(selector);
    if (fview)
      results.push(fview);

  }

  return results;
};

// super simple for now
function matches(fview, selector) {
  if (!selector)
    return true;

  if (_.isString(selector)) {
    if (selector.substr(0, 1) === '#')
      return fview.id == selector.substr(1);  // Note ==, must match numeric ids
    if (selector.substr(0, 1) === '.')
      return fview.hasClass(selector.substr(1));
    return fview.type === selector;
  }

  return fview === selector;
}

FVI = function() {
  this.length = 0;
};

FVI.prototype.splice = Array.prototype.splice;
FVI.prototype.push = Array.prototype.push;


/* ------------------------------ tree traversal ----------------------------- */

// https://api.jquery.com/category/traversing/tree-traversal/

// missing:
//   * next, nextAll, nextUntil
//   * offsetParent, parentsUntil,
//   * prev, prevAll, prevUntil

// Get the children of each element in the set of matched elements, optionally filtered by a selector.
// https://api.jquery.com/children/
FVI.prototype.children = function(selector) {
  var results = new FVI();

  _.each(this, function(fview) {
    _.each(fview.children, function(fview) {
      if (matches(fview, selector))
        results.push(fview);
    });
  });

  return results;
};

// Get the descendants of each element in the current set of matched elements, filtered by a selector, jQuery object, or element.
// https://api.jquery.com/find/
FVI.prototype.find = function(selector) {
  var results = new FVI();

  _.each(this, function(fview) {
    _.each(fview.children, function(fview) {
      findPushMatches(fview, selector, results);
    });
  });

  return results;
}
function findPushMatches(fview, selector, results) {
  if (matches(fview, selector))
    results.push(fview);
  if (fview.children)
    for (var i=0; i < fview.children.length; i++)
      findPushMatches(fview.children[i], selector, results);
}

// Get the parent of each element in the current set of matched elements, optionally filtered by a selector.
// https://api.jquery.com/parent/
FVI.prototype.parent = function(selector) {
  var results = new FVI();

  _.each(this, function(fview) {
    if (matches(fview.parent, selector))
      results.push(fview.parent);
  });

  return results;
};

// Get the ancestors of each element in the current set of matched elements, optionally filtered by a selector.
// https://api.jquery.com/parents/
FVI.prototype.parents = function(selector) {
  var results = new FVI();

  _.each(this, function(fview) {
    var fview2 = fview;
    while ( (fview2 = fview2.parent) !== undefined ) {
      if (matches(fview2, selector) && results.indexOf(fview2 === -1))
        results.push(fview2);
    }
  });

  return results;
};

// For each element in the set, get the first element that matches the selector by testing the element itself and traversing up through its ancestors in the DOM tree.
// https://api.jquery.com/closest/
FVI.prototype.closest = function(selector) {
  var results = new FVI();

  if (selector)
    _.each(this, function(fview) {
      closestPushMatches(fview, selector, results);
    });

  return results;
}
function closestPushMatches(fview, selector, results) {
  if (matches(fview, selector))
    results.push(fview);
  else if (fview.parent)
    closestPushMatches(fview.parent, selector, results);  
}

// Get the siblings of each element in the set of matched elements, optionally filtered by a selector.
// https://api.jquery.com/siblings/
FVI.prototype.siblings = function(selector) {
  var results = new FVI();

  _.each(this, function(fview) {
    _.each(fview.parent.children, function(fview2) {
      if (fview2 !== fview &&
          matches(fview2, selector) && results.indexOf(fview2 === -1))
        results.push(fview2);
    });
  });

  return results;
};

/* ---------------------------------- filtering ------------------------------ */

// https://api.jquery.com/category/traversing/filtering/
// missing: filter, first, has, is, last, map, not, slice

// https://api.jquery.com/category/traversing/filtering/
// https://api.jquery.com/eq/
FVI.prototype.eq = function(index) {
  return FV(this[index]);
};

/* ------------------------------------ other -------------------------------- */


// Iterate over a jQuery object, executing a function for each matched element.
// https://api.jquery.com/each/
FVI.prototype.each = function(func) {
  for (var i=0; i < this.length; i++)
    func.call(this[i], i);
};

// Retrieve one of the elements matched by the jQuery object.
// https://api.jquery.com/get/
FVI.prototype.get = function(index) {
  return this[index];
};
