## Meteor Famous Components

*Doing Famous the Meteor Way*

This is a work in progress, released for discussion purposes.  It may be useable, but
the API is not finalized, and will change without notice.

Likewise, this is a very early attempt at creating Blaze Components for Famous.  This
covers just a few cases, with the intention of creating a base to work upon.

## Design Goals

I believe that for regular "Meteor-style" web development (i.e. clean, easy and
quick with powerful results), developers shouldn't need to touch the Famous
Javascript for basic work.  So, famous-components abstracts all this away,
allowing you to use just templates for basic app setup.  A core principle is
"templates are famous nodes", and should either:

1. Consist of *only* HTML (e.g. a Surface), *or*
2. Include (many) other node(s) with child {{famous}} calls

If you want to include another template as a *seperate famous node*, use
`{{>famous template='foo'}}` instead of `{{> foo}}`, or specify inline
(see below).  By default, this creates a new SequentialView, and any HTML
is rendered to a Surface and added to it.  You could also pass
`view='Surface'`; or `view='Scrollview'` and include other
surfaces/templates/nodes.  See the **Sample Render Tree* at the
bottom of this doc.

The template component instance gets given a **`.famous` property** which references
the compView instance (see Render Tree below), and in turn references the `node`
(SequentialView, Surface, etc) and `parent` (parent compView or an object with
`node: context`), along with any special properties for that instance
(e.g. `sequence`).  This allows you to interact directly with Famous objects
from e.g. **Template.events, Template.rendered, helpers, etc**.
`famousCmp.dataFromTpl` or `famousCmp.dataFromCmp` will help you retrieve the
compView from descendent template instances.

Don't forget, components are fully coupled to the render tree.  If you have
a template with `translate="100,100"`, that has a child template with
`translate="50,50"`, the final template's surfcace will be translated to
`[150,150]` which of course is very useful.

Final note, there is currently no final/published API for Components.  The internals
of this code will definitely change, but the API we expose should remain the same.
Internally, we are doing some things in a less-than-ideal way to get access to
component instances.

## JS API

* `famousCmp.mainCtx = yourMainContext`, else one will be generated for you and made
available here.

* `FamousCmp.views['Scrollview'] = require('famous/views/Scrollview')` (done by
default for Scrollview, but you can add other views like this... they'll also
be looked for under a `Famous` global variable).

* `dataFromTpl`, `dataFromCmp` -- use these functions in Template created,
rendered, events, helpers, to get the compView object, which contains a `node`
property to the actual Famous node (view, surface, etc).  Feel free to use
these functions in descendent templates, they'll climb the component tree
until they find the enclosing compView.

* set modifiers (3 ways)

## Template API

In general, there are new two components.  `famous` and `famousEach`.  Both can
be used as either a block helper `{{#famous}}content{{/famous}}` or an inclusion
function `{{>famous template='name'}}`.

Every time you call `{{famous}}`, you're creating a new Famous node, which can
be manipulated independantly.  If any HTML is specified, it will ultimately
land up in it's own Surface, and of course, remains reactive.

Note: I believe a lot of the arguments to the `{{famous}}` helper would be better
served as constants to the template itself, via attributes (see the examples below).
If people share this belief, I'll submit a PR to Meteor to allow this in the future.

Note: The examples below are a bit excessive, you probably wouldn't want all
these things as seperate surfaces, but just demonstrating what's possible.

```html
<!-- Template.famousInit is auto added to body/mainCtx when helpers are ready -->
<template name="famousInit">
	{{>famous template='test'}}
</template>

<!-- "inclusion", inline, ifBlocks -->
<template name="test">
  {{>famous template='welcome'}}

  {{#famous}}
  	<p>hello there</p>
  {{/famous}}

  {{#if loggedIn}}
  	{{>famous template='userBar'}}
  {{else}}
  	{{>famous template='pleaseLogIn'}}
  {{/if}}
</template>
```

Here's an example of creating a Scrollview:

```html
<template name="famousInit">
	{{>famous template='list' view="Scrollview"}}
</template>

<!-- will be loaded as a Scrollview -->
<template name="list" view="Scrollview (TODO, requires PR)">
	{{>famousEach data=items template='listItem' size='undefined,100'}}
</template>

<!-- used to generate surfaces, passed to Scrollview.sequenceFrom -->
<template name="listItem" size="undefined,100 (TODO, requires PR)">
	<div>{{name}}</div>
</template>

Template.list.items = function() { return Items.find() };
```

We could also declare everything inline:

```html
<template name="famousInit">
	{{#famous view='Scrollview' size="undefined,undefined" items=items}}
		{{#famousEach data=../items size="undefined,100"}}
			<div class="listItem">{{name}}</div>
		{{/famousEach}}
	{{/famous}}
</template>

Template.famousInit.items = function() { return Items.find() };
```

## More Examples

Typical iron-router layout:

```html
<!-- we want each yield to be on a different surface -->
<template name="layout">
	{{>famous template='yieldHeader' modifier='inFront' size='undefined,50'}}
	{{>famous template='yieldMain' size="undefined,undefined" translate="0,50"}}
</template>

<template name="yieldMain">
	<div id="main" class="container" role="main">{{> yield}}</div>
</template>

<template name="yieldHeader">
	<div id="header">{{> yield region="header"}}</div>
</template>
```

(set as `layoutTemplate` and let iron-router autoRender as usual, it all works.)

Mixing of sequences (coming soon):

```html
<template name="list" view="Scrollview (TODO, requires PR)">
	{{>famous template="surface"}}

	{{! the below is reactive, of course; maps to a sequenceFrom }}
	{{>famousEach data=items template='listItem' size='undefined,100'}}

	{{>famous template="surface"}}
</template>
```

## TODO

* Allow update of StateModifiers from template attributes / data, e.g.
`{{>famous template='name' rotateX=rotateX}}` and enclosing template's
`rotateX` helper is reactive.

* Help for things like
[responsive grid layout](http://stackoverflow.com/questions/23140046/what-is-the-best-pattern-for-responsive-apps-in-famo-us)

* Allow e.g. size="50%,100%" and create necessary functions to calculate this
on each tick from window size or containing compView.  [ref](http://stackoverflow.com/questions/23021796/is-it-possible-to-set-surface-sizes-based-on-percentages-in-famo-us)

* Optimizations, e.g. if a template consists of only HTML and doesn't include
any child templates, this should be a surface, not a surface in a SequentialLayout.

## Behind the scenes

1. When a template instance is created, a compView wrapper is added
to the render tree, which wraps the template's renderable so it can
be removed when the template instance is destroyed.

1. Unless otherwise specified, a template, by default, will form a
SequentialLayout, since this is "natural" to how templates usually
work.

1. Children templates will be added 

1. If a template generates any HTML, it will be placed in a surface
and added to the template's sequence.  If they template contains
child templates, they'll be added to the sequence too.

## Sample Render Tree

As explained above, every template instance is wrapped in a compView before
being added to the render tree.  When the template is destroyed, the `node`
property of the compview is set to null, and all children will no longer
be rendered, and will be garbaged collected.

By default, a compView creates a SequentialLayout node, since this feels
natural to use coming from a template world.  It can be changed on the
{{famous}} call.  Likewise, a modifier can be specified.  And optional
arguments for the modifier.  If arguments are given, but no modifier
specific, the default is a StateModifier.

`{{> famous template="scroller" view="Scrollview" modifier="inFront" size="undefined,500"}}`

```
                                  Context
                   +-----------------|-----------------+
               compView                            compView
               ("page")                          ("scroller")
                   |                                   |
           SequentialLayout                        scrollView
      +------------|-----------+                       |
      |            |           |               +---+---+---+---+---+-----+
   surface     compView     surface            |       |   |   |   |     |
  (inline)    ("endtext")  (HTML from       cmpView     S2.......S4   cmpView
 {{#famous}}       |           "page")    ("scrlHead")  (famousEach)  ("sFoot")
                modifier                       |                         |
                   |                        surface                   surface
           SequentialLayout               (HTML from                 (HTML from
                   |                      "scrlHead")                 "sFoot")
                surface
              (HTML from)
               "endtext")
```