## Meteor Famous Components

*Doing Famous the Meteor Way*

This is a work in progress, released for discussion purposes.  It may be useable, but
the API is not finalized, and will change without notice.

Likewise, this is a very early attempt at creating Blaze Components for Famous.  This
covers just a few cases, with the intention of creating a base to work upon.

## Design Goals

I believe that for regular web development, "Meteor-style" (i.e. clean, easy and
quick with powerful results), developers shouldn't need to touch the Famous
Javascript for basic work.  So famous-components abstracts this away, allowing you to
use just templates.  A core principle is "templates are famous nodes", and should
contain either:

1. *Only* HTML (e.g. a Surface), *or*
2. Including (many) other node(s).

Don't use `{{> foo}}` to include other templates anymore, use
`{{famous template='foo'}}`.  By default, this creates a new Surface, which
may include HTML.  But you can also pass, e.g. `view='Scrollview'`, and that
template can then include other surfaces/templates/nodes.

When necessary, we provide access to the relevant Famous instances via a `.famous`
property in each relevant Blaze component instance.  This will contain a `node`
(usually a surface) and `parent` (context, scrollview, etc), a long with any other 
properties specific to that instance (e.g. `sequence` for a Scrollview).

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

* dataFromTpl, dataFromCmp

* set modifiers

## Template API

Note: I believe a lot of the arguments to the `{{famous}}` helper would be better
served as constants to the template itself, via attributes (see the examples below).
If people share this belief, I'll submit a PR to Meteor to allow this in the future.

```html
<!-- Template.famousInit auto added to body when helpers are ready -->
<template name="famousInit">
	{{>famous template='list' view='Scrollview'}}
</template>

<!-- will be loaded as a Scrollview -->
<template name="list" view="Scrollview (TODO, requires PR)">
	{{>famousEach data=items template='listItem' size='undefined,100'}}
</template>

<!-- used to generate surfaces, passed to Scrollview.sequenceFrom -->
<template name="listItem" size="undefined,100 (TODO, requires PR)">
	<div>{{name}}</div>
</template>
```

Note, for "famousEach", we could very easily allow a more Meteor style call, like:

```html
<template name="list">
  {{#each items}}}
  	{{>famous template='listItem'}}
  {{/each}}
</template>
```

and still run everything through Famous.  But it creates a lot of unnecessary
work for Meteor (to generate data and run functions that won't ever actually be
used), so I stuck with the `famousEach` call above, which is more performant.

## TODO

Allow mixing of sequences:

```html
<template name="list" view="Scrollview (TODO, requires PR)">
	{{>famous template="surface"}}

	{{! the below is reactive, of course; maps to a sequenceFrom }}
	{{>famousEach data=items template='listItem' size='undefined,100'}}

	{{>famous template="surface"}}
</template>
```

Add surfaces as part of a sequence depending on parent:

```html
<template name="page" view="SequentialLayout (TODO, requires PR)">
	{{>famous template="surface"}}
	{{>famous template="surface"}}
	{{>famous template="surface"}}
</template>
```

Inline surfaces:

```html
<template name="page" view="SequentialLayout (TODO, requires PR)">
	{{#surface}}
		<div>Once upon a time...</div>
	{{/surface}}
	{{>famous template="surface"}}	
</template>
```

Creation and destruction of renderables:

```html
<template name="page" view="SequentialLayout (TODO, requires PR)">
	{{#if something}}
		{{>famous template="surface1"}}
	{{else}}
		{{>famous template="surface1"}}
	{{/if}}
</template>
```
