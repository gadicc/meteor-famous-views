# famous-views v1.x series [![Build Status](https://api.travis-ci.org/gadicc/meteor-famous-views.svg?branch=master)](https://travis-ci.org/gadicc/meteor-famous-views)

Oh look, it's a new major number.  That means I can break the API :)

You're on the **master** branch, where work is in development for the totally
unstable famous-views v1.x series, which works with famous v0.5 (mixed mode).

For the stable (but deprecated) famous-views v0.x, which works with famous v0.3.5,
please see the [v0](https://github.com/gadicc/meteor-famous-views/tree/v0) branch.

[Forums.Famous-Views.Org](http://forums.famous-views.org/) and 
[![Join the chat at https://gitter.im/gadicc/meteor-famous-views](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/gadicc/meteor-famous-views?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

To learn the basics through an interactive tutorial with live, editable code,
check out https://fview-lab2.meteor.com/gadicc.

## API

The v1 series is a rewrite.  A good opportunity for code househeeping.  Code
from v0 will be copied in and adapted on a per unit bases, after inspection
and ideally tests.

Please read this README in it's entirety to understand what's going on :)  Also,
the `v1.0.0` -- it's semver, we're bumping the major version to indicate an API
change.  Please don't draw any conclusions about being "production ready".  We'll
also have `v1.0.0-pre.1`, `-pre.2` up to some very big number before a "stable"
version is released.

To learn the basics through an interactive tutorial with live editable code,
check out https://fview-lab2.meteor.com/gadicc.

Quick start:

```bash
# you'll have to watch out for new versions by hand, unfortunately :(
# but that's good, so you know to check History.md on every update!
meteor add gadicohen:famous gadicohen:famous-views@1.0.0-pre.3
```

[gadicohen:famous](https://atmospherejs.com/gadicohen/famous) is a temporary
package until our regular options are available again.  It exports everything
to a global `famous` var, e.g. `famous.core.FamousEngine`, etc.  When we reach
stable, we'll have a recommended pattern that works with all packages, which
may involve wrapping famous-requiring-code with `FView.ready()` like last time,
we'll see.  But for now just use the globals.

The new markup structure looks like this:

```handlebars
<body>
  {{#Scene}}
    {{#Node}}
      {{#DOMElement}}
        <p>Yo!</p>
      {{/DOMElement}}
    {{/Node}}
  {{/Scene}}
</body>
```

Or a "full" example: (in Jade...  use Jade!)

```jade
body
  +Scene
    +Node id="baseNode"
      +Node size="absolute: 100; renderSize" rotation="[1,1]"
        +DOMElement style="background: red" class="domEl" dir="rtl"
          p Howzit!
      +Node size="A:100; RS" rotation=reactiveRotationHelper
        +DOMElement
          p Shalom!
```

### Scene

* The only attribute supported is `id`

* The scene attaches itself to the containing DOM element ('body' in the above example).
* This element is given a 'fview-scene' class (which has appropriate CSS rules).
* If attached to 'body', the relevant CSS is added for `html` and `body` to give you
  full control over the browser window.
* For *any other element* (e.g. 'div'), you should set the
  appropriate `width`, `height`, `margin` and `padding` as appropriate.  If the
  element has no `id`, famous-Views will map it to the node's id.

## Node

Supported non-reactive attributes:

* `id` - retrievable via FView.byId(x)
* `_onRender` shortcut -- see below

Supported reactive attributes:

* `size` - adds `fview.size` instance and sets size (see below for the format)
* `position` / `align` / `mountPoint` / `origin` / `rotation` / `scale` - see below

**Sizing**

See http://famous.org/learn/sizing.html for the sizing types.  We believe in minimal
typing, so we have a proprietary string format that looks as follows (spaces are
optional, names may be shortened and case is insensitive, so the following two
snippets are equivalent):

    size="proportional: 0.5; differential: -10"
    size="P:0.5; D:-10"

    size="absolute: 150; renderSize; relative: 0.5,-10"
    size="A:150; RS; R:0.5,-10"

The second group would do the following in famous:

```js
var size = fview.size = new Size(node);
size.setMode(Node.ABSOLUTE_SIZE, Node.RENDER_SIZE, Node.RELATIVE_SIZE)
size.setAbsolute(150);
size.setProportional(undefined, undefined, 0.5);
size.setDifferential(undefined, undefined, -10);
```

**Everything else** (including position, rotation, etc)

String decoding similar to famous-views 0.x, e.g. position="[100,100]",
JSON and some other stuff.  You should return an exact value (e.g. an
Array of Numbers) from reactive helpers.

Notes: 

* *Numbers are passed as is*.  In v0 we took degrees from helpers and
converted them to radians to pass to Famous.  This may or may not happen
in v1 (i.e. API is still unstable).  Probably we'll have a rotationDeg
shortcut, etc.

* We only instantiate a new component as `fview.position` etc if a
transition is specified.

For animations, you can return a special object ala famous-views v0:

```js
Template.body.helpers({
  reactiveRotate: function() {
    return {
      value: [0, 1],
      transition: { duration: 1000, curve: 'inBounce' }
      halt: true,                   // optional
      callback: function() { ... }  // optional
    };
  }
});
```

To keep switching between two values, we provide a shortcut to infinity:

```jade
+Node rotation='{ "value1": [0,-3.14], "value2": [0,3.14], "transition": { "duration": 1000 } }'
```

You can also simply manipulate the `fview` directly and
`return '__FVIEW_SKIP__'`, e.g.:

```js
Template.body.helpers({
  reactiveRotate: function() {
    FView.current().node.setRotation(x,y,z);
    return '__FVIEW_SKIP__';
  },
  reactiveRotate2: function() {
    var fview = FView.current();
    if (!fview.rotate)
      fview.rotate = new famous.components.Rotate(fview.node);
    fview.rotate.set(1,2,3, transition, callback);
    fview.rotate.setX(1, transition, callback);
    return '__FVIEW_SKIP__';
  }
});
```

***Special Attributes***:

**_onRender**:

Specify the name (by string) of a helper function that we should run after
adding the node to the Scene Graph.

```jade
body
  +Node _onRender="renderFunc" // note, String name
```

```js
Template.body.helpers({
  renderFunc: function() {
    // this = fview
  }
});
```

### DOMElement

This is a component that is added to the enclosing node, it's not a real node on it's
own, it simply attaches a DOMElement component to the enclosing node, and the augments
that node's `fview` with:

* `fview.domElement` - the DOMElement instance
* `fview.updateSize()` - forces an update for RENDER_SIZE'd nodes
* `fview.updateSizeDeferred()` - as above, but deferred (useful for reactive helpers)

Template attributes:

* style="background: red; color: white" (reactive)
* class="class1 class2 etc" (reactive)
* dir="rtl" and any other attribute (reactive)
* tagName like in famous -- NOT IMPLEMENTED YET (TODO)
* watchSize like in v0 -- NOT IMPLEMENTED YET (TODO)

The `{{>Surface template="x"}}` format is gone, just put `{{>x}}` inside.

If using RENDER_SIZE, you have to let us know if you do anything that could
change the size of the rendered content, using one of the Methods above.
Here's an example for a reactive helper:

```js
Template.body.helpers({
  something: function() {
    FView.current().updateSizeDeferred();
    return variableSizedStuff;
  }
});
```

### Others

`Mesh`, `Camera``, `PointLight` are all very simple wrappers and work how you'd
expect.  See the live demos for some examples.

## FView (global)

* `FView.byId(id)` - gets the fview from e.g. `{{#Node id="myNode"}}etc{{/Node}}`
* `FView.from(viewOrTplorEl)` - gets the `fview` from a
  [Blaze View](http://docs.meteor.com/#/full/blaze_view), a
  [Template Instance](http://docs.meteor.com/#/full/template_inst) or a
  DOM element (of the regular, non-famous variety)
* `FView.current()` - great new shortcut for inside helpers, Meteor events,
  template/view autoruns and some callbacks.  Uses `Blaze.currentView` internally.

## Wrap your Own

Just as with v0, famous-views is primarily a low-level wrapper around Famous,
to make it fit in naturally with Meteor.  We don't aim to provide a comprehensive
library of community components, instead, we realy on other developers to
provide fview-* plugin packages.  It's not so hard to do, and we'll have some
example patterns for v1 available soon.

But what about stuff you don't want to publish, or isn't already published?
How can you wrap simple things?  Well, like this:

```js
FView.wrap('Node', famous.core.Node);  // silly example, already included
FView.wrapComponent('Mesh', famous.webglRenderables.Mesh);
```

This will give you `{{#Node}}` and `{{#Mesh}}` helpers to use in your
templates.  Adding children / attaching components all work as you'd expect.
Admittedly it's not always this simple, but a 3rd parameter, `options` can
provide a dictionary of overrides to adapt as necessary.  You may find some
more useful examples here:

https://github.com/gadicc/meteor-famous-views/tree/master/lib/wrappers

## Logging

Package['jag:pince'].Logger.setLevel('famous-views', 'info');

Levels are: trace, debug, info, warn, error

In a later release I'll enable to change this before load, for those who hate anything
on console :)

## Events

Might add something to do this in a Meteor way again.  For now, either set these
up famous-style `_onRender` (in famous style, see their docs) or do something like
this:

```handlebars
<template name="outer">
  {{#DOMElement}}
    {{>inner}}
  {{/DOMElement}}
</template>

<template name="inner">
  <!-- NB: Critical to have one element in here to receive the event -->
  <!-- depending on your needs, maybe style="width: 100%; height: 100%" -->
  <div>Blah blah blah</div>
</template>
```

```js
Template.inner.events({
  'click': function(event, templateInstance) {
    var fview = FView.current();
    // `this` is data context; regular Meteor event, etc.
  }
});
```

## What's missing / TODO / Roadmap

* [ ] Defer/tracker override
* [ ] Ability to remove/destroy templates :)
* [ ] famousEach, famousIf, etc
* [ ] Events in a Meteor way again?
* [ ] Loads of other stuff from v0... request them and I'll prioritize

## Differences from v0

Besides the underlying Famous API and how we deal with it:

* In v0 we could use famous-views stuff **inline** `{{#Surface}}...{{/Surface}}`
  and via **inclusion** `{{>Surface template="mySurface"}}`.  The latter enabled
  us to use life cycle callbacks and events, but was a big source of confusion
  amongst users, and stifled fast development but requiring a lot of extraneous
  subtemplating.  In the new version we just use `_onRender` and `_eventMap`
  attributes, provided from the enclosing Templates single helper.  Feedback
  welcome.  You can still use regular inclusion `{{>template}}` like usual.
