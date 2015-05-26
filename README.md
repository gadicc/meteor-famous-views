## famous-views for Meteor [![Build Status](https://api.travis-ci.org/gadicc/meteor-famous-views.svg?branch=v0)](https://travis-ci.org/gadicc/meteor-famous-views)

[![Join the chat at https://gitter.im/gadicc/meteor-famous-views](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/gadicc/meteor-famous-views?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

![famous-views-logo](https://raw.githubusercontent.com/gadicc/meteor-famous-views/master/assets/meteor_famous_view_logo.png)

> Doing Famous the Meteor Way

Famous-views (formerly famous-components) is an attempt at a tight integration
between Blaze and Famous. All the other approaches I've seen so far side step
most of Blaze, and require writing large amounts of code in JavaScript, which
felt very unnatural to me in Meteor. Meteor code should be small, concise and
easy with powerful results.

Demo, QuickStart, Docs and Example Code available in the source and live at
[famous-views.meteor.com](https://famous-views.meteor.com/).
The demo includes example code, ***which supercedes the syntax/examples
given in this README***!  **PLEASE FOLLOW [History.md](History.md) IN THESE
EARLY DAYS**.

Copyright (c) 2014 Gadi Cohen, released under the LGPL v3.

### Build the Famous Render Tree with Reactive Blaze Views

```html
{{#Scrollview}}

  {{#Surface size="[200,undefined]"}}
    <h1>Scrollview Example</h1>
  {{/Surface}}

  {{#famousEach items}}
    {{>Surface template="item" size=reactiveSize}}
  {{/famousEach}}

{{/Scrollview}}
```

### Features & Basics

* The `{{#famous}}` component uses templates to create
Famous Views and Surfaces, without touching any Javascript.  Registered
Views are aliased as their own block helpers for ease and clarity, e.g.
`{{#Scrollview}}`, etc.

* `{{#famousEach}}` helps creates Sequences (for e.g. Scrollview) using
regular Template helpers/data like Items.find().  No additional code.
Still 100% reactive.

* Views, modifiers and modifier options are easily set via component attributes,
like `size="[undefined,700]"`, `translate="[0,20,1]"`, etc.

* Need to manipulate Famous objects?  No problem, do it in `Template.events`,
`Template.rendered`, etc, just like usual.

* Compatible out the box with iron-router (with transition support).

This is a very early release.  More for playing around and discussion purposes.
But it seems to be useable :)  Feedback is both welcome and appreciated, on
github.

## See the Demo and Live Docs

https://famous-views.meteor.com/

The most up-to-date information is here, including Quick Start,
iron-router integration, etc.  Information below this line is less
up to date, but still an important read until it makes it online :)

## Contributing

Please see [CONTRIBUTING.md](CONTRIBUTING.md).

### Asking questions?

Github issues are for... issues.

Let us talk with a more appropriate mean: https://gitter.im/gadicc/meteor-famous-views.

## Template API

All components may be used either inline or to include another template:

Inline: `{{#famous}}content{{/famous}}`

Inclusion: `{{>famous template='name'}}`

Since v0.0.8, each View gets it's own helper, which results in shorter,
clearer code.  Like this:

```
  {{#Scrollview}}
    {{#famousEach items}}
      {{>Surface template='item'}}
    {{/famousEach}}
  {{/Scrollview}}
```

Commonly used Views like `SequentialLayout`, `View` and the explicit
`Surface` are all built in.  Anything else you need should be explicitly
registered, to avoid unnecessary code being send down to the client:

```js
FView.ready(function() {
  FView.registerView('SpecialView', famous.views.SpecialView));
});
```

The `Fview.ready()` is only required in some cases.  But if you're unsure,
rather put it in to be safe.

For more examples and the full docs, please see the live demo at
[famous-views.meteor.com](https://famous-views.meteor.com/).

**Template Attributes:**

Any attributes passed to the template will be passed through to the surface,
modifier, view, etc.  Using a template helper, you can pass actual JavaScript
objects.  Alternatively, you can specify e.g. `{{famous attribute="value"}}`.
The value will be decoded for you, so `"[150,true]"` will become an array
with number `150` and boolean `true`.

For more info see the [Views README](views/README).

Don't forget, components are fully coupled to the render tree.  If you have
a template with `translate="[100,100]"`, that has a child template with
`translate="[50,50]"`, the final template's surface will be translated to
`[150,150]`, which of course is very useful.

Available but not recommended (yet): `data` is a special attribute name.
It specifies the data context for
rendered children.  Basically, you'll need this if you specify any other
attributes.  e.g. `{{#famous}}` gets the same data context as
`{{#famous data=this attr1='one'}}`.  Without `data`, the data context
would be just `{ attr1: 'one' }` without any parent data.  Particularly
useful inside a `{{#famousEach}}`.  However, this can break the fine
grained reactivity... we suggest passing just the data you need or
referencing the parent data directly.  See the examples in the demo.

Note: I believe a lot of the arguments to the `{{famous}}` helper would be better
served as constants to the template itself, via attributes).
If people share this belief, I'll submit a PR to Meteor to allow this in the future.  e.g. `<template name="myBlock" size="[300,300]">`

**Template Properties:**

To get an `fview` from a template Instance or blaze View, use:

```js
var fview = FView.from(templateInstanceOrView);  // usually the "this" object
```

For more info including the list of properties and methods on the
fview object, please see the [API docs](http://famous-views.meteor.com/features/api).

### Surfaces and Events

* A reminder that Meteor events, via the `Template.x.events()` system,
are DOM events.  As such, you can only setup events on **Surfaces**
*with at least one element*, so make sure if your template is all text,
you wrap it in a `<div>` or `<span>`.  This also only works with inclusion,
e.g. `{{>Surface template='x'}}`, since with inline blocks, there is
nothing to attach to.

**It's imperative that you read http://famous-views.meteor.com/examples/events.**

### A note on comments

* Don't forget that HTML comments affect browser rendering only and have
no effect on Blaze.  Just like `<!-- {{name}} -->` would still translate
to `<!-- Gadi -->`, "commenting out" famous-views helpers (with
HTML) will have no effect, and everything will still be rendered.  To
comment out components, use Blaze's comment syntax `{{! like this}}`.

## JS API

Please see http://famous-views.meteor.com/features/api.

For more examples see the live demo at
[famous-views.meteor.com](https://famous-views.meteor.com/).

## Behind the scenes

1. When a template instance is **created**, a `meteorFamousView` wrapper is added
to the render tree, which wraps the template's renderable so it can
be removed when the template instance is destroyed.

1. Child templates from inside the block helper / named template
are added.

1. When the template is **destroyed**, the `node`
property of the compView is set to null, and all children will no longer
be rendered, and will be garbaged collected as possible.

Note, there is currently no final/published API for Components.  The internals
of this code will definitely change, but the API we expose should remain the same.
Internally, we are doing some things in a less-than-ideal way to get access to
component instances.

## Sample Render Tree

As explained above, every template instance is wrapped in a compView before
being added to the render tree.  It will be either a specified View or
a Surface, and a modifier can be specified, together with optional
arguments.  If arguments are given, but no modifier specified, the default
is a StateModifier.

`{{>Scrollview template="scroller" modifier="inFront" size="undefined,500"}}`

```
                             Context
                   +------------|-------------+
               compView                   compView
               ("page")                   ("header")
                   |                          |
           SequentialLayout                Surface
      +------------|-----------+         (HTML from
      |            |           |           "header")
   surface     compView     surface
  (inline)    ("endtext")  (HTML from
 {{#famous}}       |         "page")
                modifier
                   |
           SequentialLayout
                   |
                surface
              (HTML from)
               "endtext")
```

```
                Context
                    |
                compView
              ("scroller")
                    |
                scrollView
                    |
        +---+---+---+---+---+-----+
        |       |   |   |   |     |
    cmpView     S2.......S4   cmpView
  ("scrlHead")  (famousEach)  ("sFoot")
        |                         |
    surface                   surface
  (HTML from                 (HTML from
  "scrlHead")                 "sFoot")
```

## Credits

* Massive props to Morten Henriksen aka raix, firstly for his awesome
[famono](https://atmospherejs.com/raix/famono) package which
is used to `require` Famous (and anything else for that matter; a super big
deal for us Meteorites), but more so, for his stellar efforts at super quick
enhancements to the package for things I needed for this package.  Thanks raix!

* Big props also to sayawan, for his
[leaderboard](https://github.com/sayawan/meteor-famous-leaderboard)
example.  This was the first app written by someone else using famous-views,
in under 24 hours after it was first made public.

* [Zoltan Olah](https://github.com/zol) from
[Percolate Studios](http://percolatestudio.com/).  His devshop talk with
David Fetterman from Famo.us,
[Meteor + Famo.us: Made for each other](https://www.youtube.com/watch?v=bmd-cXSGQAA)
was the first time I saw Meteor and Famous being used together, and it was
quite inspiring.
