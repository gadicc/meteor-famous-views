## vNEXT

## v0.0.14

* Upgrade to famono 0.3.x
* Rely on global famous object instead of require's
* Rework how we handle famous-compiled and CDN

## v0.0.13

* `Scrollview`'s can now be nested (in alternating `directions`'s).  Fixes #24.

## v0.0.12

* `Scrollview` now pipes events from child Surfaces rather than from Engine
  This allows multiple scrollviews per page and finally closes issue #11.

## v0.0.11

* Make `famousCmp.transitions` public so that it's easier to create custom
named transitions for RenderController.
* Add `HeaderFooterLayout` view (closes #18)
* Add `Flipper` view (TODO, ability to create new contexts for perspective)
* Add `EdgeSwapper` view

## v0.0.10

* In addition to Famono, we now support famous-compiled, mj-famous and CDN
* Added a windowSlide transition shortcut, ability to use for pages on demo

## v0.0.9

* Added a RenderController component (transition support)
* Added ability for a view to register a custom `add` method which will
  be called with child compViews instead of directly calling `add` on
  a Famous renderable.
* a compView now has a `viewNode` property, which will reference the
  final renderable even if a modifier is chained in before it.
* added `compView.preventDestroy()` method and `onDestroy` hook

## v0.0.8

See also [Progress Update](https://github.com/gadicc/meteor-famous-components/issues/16).

* Removing passing of entire data context with `data=this` and instead
referencing elements directly like `../../name` resulted in more
fine-grained reactivity (changes just in HTML).  Need to look at this
more.  XXX RECHECK FAMOUS VS FAMOUSEACH

* Views should now be registered like
`famousCmp.registerView('Scrollview', require('famous/views/Scrollview'));`.
This makes the view available in JS via `famousCmp.views.Scrollview` and
in templates via `{{#famous view='Scrollview'}}` and since this release,
just `{{#Scrollview}}`.  Note how all the examples in the demo look a lot
cleaner/clearer now.  (fixes #9)

* Adjustments to demo layoutTemplate which makes more sense, with clearer
comments in the HTML.  Also fixed some sizing issues related to Famous
upgrades past v0.1.1. (fixes #12).

## v0.0.7

* Big breaking change for ``#famousEach``.  It's now a lot more like Meteor's
`#each`, and also no longer creates surfaces for you, instead you should use
`{{#famous}}` inside a famousEach block.  This may seem like a little more
work, but gives you a lot more flexibility for what you can put inside a
sequence.

   ```
   {{#famousEach items}}
     {{>famous data=this template='listItem' view='SomethingCool'}}
   {{/famousEach}}
   ```

  Unforuntately fine-grained reactivity isn't working with the new method.
  If data changes, currently the template is rerendered.  This can be fixed
  once [Meteor issue #2010](https://github.com/meteor/meteor/issues/2010) is
  closed.  Consequentally, the old ``#famousEach`` behaviour is still
  available (for now) as ``#famousEachSurface``.  *(Fixed in v0.0.8; just
  be careful with which reactive data you pass in the templates (in .html
  files).*

* Log via pince.  Default level debug (for now).  Put
  `Logger.setLevel("famous-components", "info");` in your app to change.
* Force surfaces' enclosing `<div>` to have `style="width:100%;height:100%"`
* Make GridLayout look a bit nicer

## v0.0.6

* Better support for all kinds of template attributes "[1,undefined,true]" etc
  (see README).
* Fixed up the demo "Layouts" page for more useful examples, with source code.
* Made Events demo cuter, added source code to page.
* Added 'View' as a builtin view (useful for manual position of multiple
  surfaces).

## v0.0.4

In the 'demo' app, the database was replaced with something more useful.  If
you're upgrading from < 0.0.3, please `meteor reset` or `Items.remove()`.

* "Sequencer" implementation; can now have multiple surfaces,famousEaches per seq
* Arrays should now be specified like cellSize="[150,250]" (note the []'s)
* Start of restructuring in demo app, see client/views directory (e.g. GridView)
* Support for class="class1 class2 etc", as per note below.
* Allow empty templates when `view='Surface'`

## v0.0.3

* Support for classes="class1,class2,etc".  Not reactive, so consider
  rather setting classes inline with an extra <div class="x"></div>.
* Fix template class helper for inline {{#famous}} use
* Add support for "direction" attribute, allows for columns
* surfaces from {{famous}} should use specified size (fixes #2)

## v0.0.1

This release is dedicated to sayawan, for creating a
[leaderboard](https://github.com/sayawan/meteor-famous-leaderboard)
example using the code in under 24 hrs! :)

* `dataFromCmp` -> `dataFromComponent`, `dataFromTpl` -> `dataFromTemplate`
The original names still work, and *might* be left as aliases (but might also
be deprecated in the future)

* famousCmp.dataFromElement(), gets the CompView from a DOM element
(useful for e.g. drag & drop)

* Fix broken reactivity in famousEach (#1)

## "Playground"

This was the code available when the announcement on meteor-talk was made.

This release is dedicated to raix, for his Famono package, and his super fast
resolution of every issue I raised for it on github :)