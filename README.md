## famous-views (for Meteor) [![Build Status](https://api.travis-ci.org/gadicc/meteor-famous-views.svg?branch=master)](https://travis-ci.org/gadicc/meteor-famous-views)

*Doing Famous the Meteor Way*

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
{{#Scrollview size="[undefined,undefined]"}}

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

```bash
$ git clone https://github.com/gadicc/meteor-famous-views
$ cd meteor-famous-views/demo
$ mrt update
$ meteor
```

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

`FView.registerView('View', require("famous/core/View"));`

For more examples see the live demo at
[famous-views.meteor.com](https://famous-views.meteor.com/).

**Template Attributes:**

Any attributes passed to the template will be passed through to the surface,
modifier, view, etc.  Using a template helper, you can pass actual JavaScript
objects.  Alternatively, you can specify e.g. `{{famous attribute="value"}}`.
The value will be decoded for you, so `"[150,true]"` will become an array
with number `150` and boolean `true`.  (Helpers currently only provide
an initial value, but will be fully reactive in a future release).

Certain attribute names are handled especially for you, e.g. `direction="X"`
will map to `Utility.Direction.Y`, the `translate` attribute is instantiated
into a `Transform.translate` for you, etc.  [**TODO**: Since attributes are
passed to the surface, modifier and view, should you want to specify different
values for the same key, use the appropriate prefix, e.g. `surfaceSize`,
`viewSize`, `modifierSize`, etc.]

Don't forget, components are fully coupled to the render tree.  If you have
a template with `translate="[100,100]"`, that has a child template with
`translate="[50,50]"`, the final template's surface will be translated to
`[150,150]`, which of course is very useful.

Available but not recommended (yet): `data` is a special attribute name.  It specifies the data context for
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

The template component instance gets given a **`.famous` property** which
references the compView instance (see Render Tree below), which the following
properties:

* `parent` - parent compView or an object with `node: context`
* `node` - the modifier, if one is specified, otherwise the view/surface
* `view` - SequentialView, Surface, etc, regardless of modifier
* `_view` - the registered View info.  name, class, options
* `modifier` - the modifier, if one was specified
* `_modifier` - the registered Modifier info.  name, class, options
* `sequencer` - for any view that uses a sequence

This allows you to interact directly with Famous objects
from e.g. **Template.events, Template.rendered, helpers, etc**.
`FView.fromTemplate` or `FView.fromBlazeView` will help
you retrieve the compView from descendent template instances.
`FView.fromElement` acts on a DOM element (useful for drag &
drop, etc).  See the Sample Render Tree at the  bottom of this doc.


```html
<!-- Template.famousInit is auto added to body/mainCtx when helpers are ready -->
<template name="famousInit">
  {{>famous template='test'}}
</template>

```

For more examples see the live demo at
[famous-views.meteor.com](https://famous-views.meteor.com/).

### Surfaces and Events

* A reminder that Meteor events, via the `Template.x.events()` system,
are DOM events.  As such, you can only setup events on **Surfaces**
*with at least one element*, so make sure if your template is all text,
you wrap it in a `<div>` or `<span>`.  This also only works with inclusion,
e.g. `{{>Surface template='x'}}`, since with inline blocks, there is
nothing to attach to.

### A note on comments

* Don't forget that HTML comments affect browser rendering only and have
no effect on Blaze.  Just like `<!-- {{name}} -->` would still translate
to `<!-- Gadi -->`, "commenting out" famous-views helpers (with
HTML) will have no effect, and everything will still be rendered.  To
comment out components, use Blaze's comment syntax `{{! like this}}`.

## JS API

* `FView.mainCtx = yourMainContext` else one will be generated for you and made available here.

* `FView.registerView('View', require("famous/core/View") [,options]);`
allows you
to use a `{{#View}}` inline and `{{>View template='name'}}` inclusion
component.  The raw famous View is available as `Fview.views.View`.
You can also manually specify `{{#famous view='View'}}`.  See the next
sectoin for available options.

* `FView.fromTemplate` and `FView.fromBlazeView` -- use these functions in
Template created, rendered, events, helpers, to get the compView object, which
contains a `node` property to the actual Famous node (view, surface, etc).  Feel
free to use these functions in descendent templates, they'll climb the component
tree until they find the enclosing compView.  See *template properties* above
for what we keep in a compView instance.

  ```js
    // Event callbacks
    Template.blockSpring.events({
      'click': function(event, tpl) {
        var fview = FView.fromTemplate(tpl);
        fview.modifier.setTransform(
          Transform.translate(Math.random()*500,Math.random()*300),
          springTransition
        );
      }
    });
  ```

  ```js
    // Lifecycle callbacks (including `created` and `destroyed`)
    Template.example.rendered = function() {
      var fview = FView.fromTemplate(this);
      // Use this.$() to find DOM elements here
      // (since the template is rendered before it's added to the document)
    }
  ```

  Note for lifecycle callbacks, just like with Meteor, you need to have
  a real template.  So if you want to use these, don't define your data
  inline with `{{#View}}`, but rather like `{{>View template="x"}}` and
  then use `Template.x.rendered`, etc.

* `FView.fromElement` -- as above but for a DOM element.  If you're using
jQuery, be sure to put `[0]` at the end, e.g. `$('#el')[0]` to get an actual DOM
element and not a jQuery object.  Useful for drag & drog, etc.  Returns the
containing view in the case of a sequence (need to think about this). 

For more examples see the live demo at
[famous-views.meteor.com](https://famous-views.meteor.com/).

### CompView methods

* `preventDestroy()` will prevent a compView from being
automatically destroyed when it's template is reactively removed.  You
can then call `destroy()` at a later time (like after a transition;
we do this in the RenderController helper).

For more examples see the live demo at
[famous-views.meteor.com](https://famous-views.meteor.com/).

### registerView options

* `add` overrides what happens when children are initialized.  By default,
they are added to a sequence if one exists, or the renderable's native
`add` method is called.  See the `RenderController` source for an example
of where this is useful.

## TODO

* ~~Allow placing of surfaces before and after a `famousEach` (currently
it overwrites the entire sequence).  This will also allow multiple
famousEach's in the same template.~~

* ~~Allow update of StateModifiers from template attributes / data, e.g.
`{{>famous template='name' rotateX=rotateX}}` and enclosing template's
`rotateX` helper is reactive.  (Depends on
[Meteor issue #2010](https://github.com/meteor/meteor/issues/2010))~~

* Help for things like
[responsive layouts](http://stackoverflow.com/questions/23140046/what-is-the-best-pattern-for-responsive-apps-in-famo-us)

* Allow e.g. size="50%,100%" and create necessary functions to calculate this
on each tick from window size or containing compView.  [ref](http://stackoverflow.com/questions/23021796/is-it-possible-to-set-surface-sizes-based-on-percentages-in-famo-us)

## Behind the scenes

1. When a template instance is **created**, a `compView` wrapper is added
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
