## vNEXT

## v1.3.0

* Added a simple SequentialLayout that takes direction=1, spacing=10 args
* Default attrUpdate func now uses Func.call if not given an array value
* Internally, Node is now famous.core.Node and DOMNode is the original Node

* Classes can now be defined with methods, e.g. already included by default:

```js
FView.defineClass('center', {
  onRender: function() {
    this.node.setMountPoint(0.5, 0.5, 0.5);
    this.node.setAlign(0.5, 0.5, 0.5);
    this.node.setOrigin(0.5, 0.5, 0.5);
  }
});
```

Which means you can:

```jade
+Node class="center"
  +Node class="center"
```

etc.

## v1.3.0 (pre-releases)

* Support Engine 0.5.2 *and* later versions, to make development easier.
  Note: we strongly advise to only use 0.5.2, later versions have serious
  regressions.  You'll get a warning if you're using a later version.

* Change Tracker mods to not squash any existing computations (#258)
* Move "Tracker._FViewRunFlush" from log.debug to log.trace.

* More natural sizing: "x, y, z" where these can be (spaces optional):

  * `renderSize or rs` (case insensitive) --> RENDER_SIZE
  * `100` (a number) --> ABSOLUTE_SIZE
  * `50%` (a number + percent sign) --> proportional (via RENDER_SIZE)
  * `+10` (+/- a number) --> differtial (via RENDER_SIZE)
  * `20% - 10` --> RENDER_SIZE

* Values like { value1: .., value2: ..., transition: ... } can now have a
  property, `_loopFromBeginning` (better names welcome), which, when true,
  will reset the loop to value1 on each cycle, for a continuous animation
  in the same direction (when given appropriate values), vs default behaviour
  to cycle back and forth between two values.

* Nodes now support a class="class1 class2" type tag.

* New FV(), like jQuery's $()

  * FV(fview), FV('#id'), FV('.class'), FV('Node') -- multiple selectors soon
  * FV(fview).children(selector), closest(), parents(), parent(), find(),
    siblings(), eq(), each()
  * Chainable (but not so many methods yet), jQuery like (so use FV(something)[0]
    to get the real fview and not an FV-wrapped array), etc

## v1.2.1 / v1.2.1

* Warn about using with famous > 0.5.2

BREAKING.  Mostly stuff that I doubt anyone else is using yet, so not bumping
major version... it's too early in dev there might be a few of these, apologies
if it affects you.

* `_class`
  * `addChild(famousChild)` -> `addChild(fviewChild)`
  * `newInstance()` -> `newFamousInstance()`
  * `addToParent()` -> `addNodeToParent()`

Major refactor of how wrapper classes work, using proper inheritance now, much
cleaner.

## v1.2.0

* Components [Cc]olor attributes
* Mesh glossiness attribute
* Internal "fvClass" -> "_class"; store classes in FView._classes
* Warn if dev puts more than 1 node inside of famousEach

## v1.1.0

* Fix for Famous 0.5.2 (and further work on DOMElement handling)
  Please be aware of https://github.com/Famous/engine/issues/245.

* Support components that don't add themselves to the node + set `_id`
* `fview.autorun()` like tplOrView.autorun() in Meteor/Blaze; this = fview

* Fix wrapper with no args' renderFunc using `with` data as args
* famousEach, in a totally new and extensible way
* Initial child cleanup handling
* Some internal changes in how nodes are dismounted

## v1.0.0

PLEASE NOTE, this is not a "1.0.0 production quality release".  Meteor packages
use SEMANTIC VERSIONING (see http://semver.org/).  The new major version (v1)
indicates a breaking change in API from the previous version, and does not
imply anything about build quality.  This is still an early release (but still
quite useable and fun to play with).

See http://forums.famous-views.org/t/update-on-mixed-mode-famous-v0-5/28/13.

* Override Meteor timers/setimmediate/tracker to work with Famous event loop

## v1.0.0-pre.6

* Data context fix inside of DOMElement

## v1.0.0-pre.5

* `FView.wrap()`, `FView.wrapComponent()`, existing wrappers modularized
* Scene now handles data context correctly and has _onRender
* Added delayed init with FView.ready(), detect famous global
* Added basic wrappers for Camera, PointLight, Mesh
* Fixed argument mutation in Node attrUpdate / argsFromVecTransitionCB

## v1.0.0-pre.4

- Fix DOMElement not always rendering properly
- Some early cleanup code, but no handling of children yet.

## v1.0.0-pre.3

- Fix Scene attach behaviour, add appropriate CSS as relevant (see README)
- Allow longform size attributes, and shortform "RS" for "renderSize" (see README)
- BREAKING CHANGE (who's using this already?).  The size separator is now
  a semicolon (";"), and relative separator a comma (","), e.g.
  `size="absolute: 10; relative: 0.5,-10; renderSize"` or abbreviated form.

## v1.0.0-pre.2

- Attributes (style, class, general attributes) in DOMElement (no tagName yet)

## v1.0.0-pre.1

- First release