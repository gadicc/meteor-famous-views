## Meteor Famous Components

*Doing Famous the Meteor Way*

Famous-components is an attempt at a tight integration between Blaze and Famous. All the other approaches I've seen so far side step most of Blaze, and require writing large amounts of code in JavaScript, which felt very unnatural to me in Meteor. Meteor code should be small, concise and easy with powerful results.

Copyright (c) 2014 Gadi Cohen, released under the LGPL v3.

### Features & Basics

* The `{{famous}}` component uses templates to create
Famous Views and Surfaces, without touching any Javascript.

* `{{famousEach}}` helps create a Scrollview using regular Template
helpers/data like Items.find().  No additional code.  Still 100%
reactive.

* Views, modifiers and modifier options are easily set via component attributes

* Need to manipulate Famous objects?  No problem, do it in `Template.events`,
`Template.rendered`, etc, just like usual.

* Compatible out the box with iron-router (transitions coming soon).

This is a very early release.  More for playing around and discussion purposes.
But it seems to be useable :)  Feedback is both welcome and appreciated, on
github.

## Quick Start

`mrt add famous-components`

You are also welcome to clone the github repo and play around in the demo,
which is still a work in progress (I wanted to get the package out first).
More cool stuff coming soon.

```bash
$ git clone https://github.com/gadicc/meteor-famous-components
$ cd meteor-famous-components/demo
$ mrt update
$ meteor
```

First run takes a while to download Famous.

See also the [leaderboard](https://github.com/sayawan/meteor-famous-leaderboard)
example from sayawan.  Big props for getting an app out using famous-components
in under 24 hrs! :)

## Template API

In general, there are new two components.  `famous` and `famousEach`.  Both can
be used as either a block helper `{{#famous}}content{{/famous}}` or an inclusion
function `{{>famous template='name'}}`.

Every time you call `{{famous}}`, you're creating a new Famous node, which can
be manipulated independantly.  By default, this creates a new SequentialView.
but you can also pass `view='Surface'`; or `view='Scrollview'`.  Any HTML
will be added to the sequence, as will any included {{famous}} calls for
child or inline templates.

TL;DR; -- skip to examples below.

{{famous}} templates should:

1. Consist of *only* HTML (e.g. a Surface), *or*
2. Include (many) other node(s) with child {{famous}} calls

If you mix the above, the surface content (HTML) will be the last element
added to the specified view.

The template component instance gets given a **`.famous` property** which references
the compView instance (see Render Tree below), and in turn references the `node`
(SequentialView, Surface, etc) and `parent` (parent compView or an object with
`node: context`), along with any special properties for that instance
(e.g. `sequence`).  This allows you to interact directly with Famous objects
from e.g. **Template.events, Template.rendered, helpers, etc**.
`famousCmp.dataFromTemplate` or `famousCmp.dataFromComponent` will help you retrieve
the compView from descendent template instances.  `famousCmp.dataFromElement` acts on
a DOM element (useful for drag & drop, etc).  See the Sample Render Tree at the 
bottom of this doc.

Don't forget, components are fully coupled to the render tree.  If you have
a template with `translate="100,100"`, that has a child template with
`translate="50,50"`, the final template's surfcace will be translated to
`[150,150]` which of course is very useful.

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
  {{! the below is reactive, of course; maps to a sequenceFrom }}
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

## JS API

* `famousCmp.mainCtx = yourMainContext`, else one will be generated for you and made
available here.

* `famousCmp.dataFromTemplate` and `.dataFromComponent` -- use these functions in
Template created, rendered, events, helpers, to get the compView object, which
contains a `node` property to the actual Famous node (view, surface, etc).  Feel
free to use these functions in descendent templates, they'll climb the component
tree until they find the enclosing compView.

  ```js
    Template.blockSpring.events({
      'click': function(event, tpl) {
        var famousData = famousCmp.dataFromTpl(tpl);
        famousData.modifier.setTransform(
          Transform.translate(Math.random()*500,Math.random()*300),
          springTransition
        );
      }
    });
  ```

* `famousCmp.dataFromElement` -- as above but for a DOM element.  If you're using
jQuery, be sure to put `[0]` at the end, e.g. `$('#el')[0]` to get an actual DOM
element and not a jQuery object.  Useful for drag & drog, etc.  Returns the
containing view in the case of a sequence (need to think about this). 

* `famousCmp.views['Scrollview'] = require('famous/views/Scrollview')` (done by
default for Scrollview, but you can add other views like this... they'll also
be looked for under a `Famous` global variable).

* Setting modifiers:

  ```js
  famousCmp.modifiers.pageTransition = function(component, options) {
    this.component = component;
    this.famous = new StateModifier({
      origin    : [-1, 0]
    });
  }
  famousCmp.modifiers.pageTransition.prototype.postRender = function() {
    this.famous.setOrigin([0,0], {duration : 500});
  }
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
	{{>famousEach data=items template='listItem' size='undefined,100'}}
	{{>famous template="surface"}}
</template>
```

## TODO

* ~~Allow placing of surfaces before and after a `famousEach` (currently
it overwrites the entire sequence).  This will also allow multiple
famousEach's in the same template.~~

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

1. When a template instance is created, a `compView` wrapper is added
to the render tree, which wraps the template's renderable so it can
be removed when the template instance is destroyed.

1. Unless otherwise specified, a template, by default, will form a
SequentialLayout, since this is "natural" to how templates usually
behave.

1. Children templates from `{{famous}}` and `{{#famous}}` are added.

1. If a template generates any HTML (from includes/helpes too), it will
be placed in a surface and added to the template's sequence.  If they
template contains child templates, they'll be added to the sequence too.

Note, there is currently no final/published API for Components.  The internals
of this code will definitely change, but the API we expose should remain the same.
Internally, we are doing some things in a less-than-ideal way to get access to
component instances.

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
[famono](https://atmosphere.meteor.com/package/famono) package which
is used to `require` Famous (and anything else for that matter; a super big
deal for us Meteorites), but more so, for his stellar efforts at super quick
enhancements to the package for things I needed for this package.  Thanks raix!

* [Zoltan Olah](https://github.com/zol) from
[Percolate Studios](http://percolatestudio.com/).  His devshop talk with
David Fetterman from Famo.us,
[Meteor + Famo.us: Made for each other](https://www.youtube.com/watch?v=bmd-cXSGQAA)
was the first time I saw Meteor and Famous being used together, and it was
quite inspiring.