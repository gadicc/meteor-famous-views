## SOON

* auto check for final size and check for screen resize event

## vNEXT

## v0.1.13

* Feature: allow transition/halt/etc in reactive modifiers (#87)
  Thanks @mcbain for the idea.  Example at bottom of reactive demo.

* Bugfix: famousEvents now works with multiple events (#84)
* Bugfix: correctly transform mid-transition modifierstates

* Docs/demo: Switch from prism to snippets (show js+coffee, spacebars+jade)
* Docs/demo: improve event example/explanation (#84)
* Docs/demo: start a FAQ page, more tips in QuickStart
* Docs/demo: Fix reactive demo sliders for skewX/skewY + pic align

* Testing: initial tinytests for Views (famous.js)

## v0.1.12

* Fix undefined fview in famousIf destroyed (fixes #81)
* Refactor code for View destroys and fview.destroy().

## v0.1.11

* Fix links to famo.us examples, thanks @PEM--!  (fixes #75, #79)

* Sequencer is now 100% recursive, and supports multiple generations

* famousEach is now a lot smarter and uses sequencer a lot better.
  In short, preventDestroy() and other hooks will now work for more
  than one child View, and famousIf also benefits from this logic.

* Defer all add()'s to the render tree; this reduces a lot of flicker.

* We now throw an error if put any kind of View inside a Surface (#78)

* Add {{#famousIf}} which currently just retains order in a sequence
  (Some more notes/thoughts in lib/famousIf.js)

* Fixed bug in childSequence.push()  (removed erranous -1 for parent)
* Change sequencer naming to clearer and more flexible.
  fview->sequencer is now fview->sequence
  sequencer->sequence is now sequencer->_sequence to be clearer that this
  shouldn't be accessed directly.  sequencer.push() method added.

## v0.1.10

* More famous 0.3 align fixes for Flipper, RenderController demo
* Add in scaleX, scaleY, scaleZ attribute transform reactive helpers
* Add Views to Famous Render Tree at latest possible time, allowing
  render() functions to run beforehand.
* Fixed one more bug in famousEach ordering with preventDestroy
  Note, adding more items after a remove starts and before it finishes
  can still result in out-of-order items, will fix this in next release.

## v0.1.9

* Demo: Switch to prism for syntax highlighting, cleanup code examples
* Switch to Famous 0.3.0-alpha, emphasize `align` in examples/layouts.
* famousEach now properly destroys livedata removes (fixes #67)
* famousEach now properly supports fview.preventDestroy() (fixes #66)
* Catch and report on JSON parse errors for optionString

## v0.1.8

* Revert demo symbolic link so it's easier to link to stuff on github
* Add a slideWindowLeft/slideWindowRight transition type, not final (#60)
* Let autoSize take more time if needed (in 10ms increments).

## v0.1.7

* Fix some typos and superfluous stuff on demo Scrollview page (#58)
* Warn about any Templates defined with the same name as a View (#54, #58)

## v0.1.6

* Fix how `packageUsed` works during `meteor publish` (#48)

## v0.1.5

* Fix `{{#containSurface}}` and support `overflow="hidden"` + `class=`.
* Add a Timbre Menu example to the demo/docs.

## v0.1.4

* `attrUpdate` BREAKING CHANGE.  Insert `oldValue` between value and fullData
  attrUpdate(key, value, **oldValue**, fullData, isFirstTime).
* `attrUpdate` now actually gets called on the first time (with initial value)

* Fix `rotateZ` so that it works, and fix demo to actually use it
* `rotate*`,`skew*` now applies diff of new rotation to previous on that axis
* `translate` attribute is now reactive.

## v0.1.3

* Error with FView.fromElement (#57)

## v0.1.2

* Remove `versionsFrom` and depend on individual core packages, so now
  we can work on both 0.9.1.1 and 0.9.2-rc1
* Fix one more thing from 0.9.1 changes (FamousEach destroy)

## v0.1.1

* Faster loading for weak packages
* Rename to gadicohen:famous-views (there will still be gadicohen:gadicc)
* Update demo quickstart for more useful help on 0.9.0+

## v0.1.0

* Meteor 0.9.1.1 support, NOT BACKWARDS COMPATIBLE (too many API changes)
* Introduce FView.get() shortcut, can take a blazeView, TplInstance, domNode
* In demo/events, mention all available Famo.us Surface events

## v0.0.24

* Add initial Velocity support!  Expect PRs to now include tests :)
  Unfortunately only available with 0.8.3 until Velocity 0.9 support
  is ready.  Symlinked from demo-test to demo-0.8.3-mj-famous.

* Make sure a View with no attributes still renders with correct data
  context.  (Closes #45)

* Re-add support for specifying a data context with `data=`.  Basically
  a shorcut for surrounding with `{{#with}}`.  (Closes #46)

* Since Meteor supports template names with spaces, and we use the
  template name as a CSS classname, "s/ /_/" before passing to Famous
  to avoid an uncaught exception (Closes #47).

* Startup as early as possible, i.e. if famous global var is available
  before Meteor.startup(), run FView.startup() then.  Also, log when
  we're starting up so we know what's going on and can better identify
  problems.  (Relates to #48)

## v0.0.23

* Mixed compatibility with Meteor <= 0.8.3 and Meteor >= 0.9.0
* for famousEvents (and examples), target = surface || view._eventInput

## v0.0.22

* `optionsString` now simply decodes JSON when possible
* Introduce `size="[undefined,auto]"` for Surfaces (early release)
* Ensure surface options are parsed with optionString before setting
* Introduce new famousEvents() method on templates, like Famous
* Improve docs and examples in the demo

## v0.0.21

* `famousInit` template now added at the correct time!  thanks @blouze
* Surface view reactive size no longer checks size before setting
* Temp workaround for RenderController reactivity

## v0.0.20

* Renaming / improvements in various internal identifiers
* compView -> meteorFamousView (aka "fview")
* blazeView.famousView -> blazeView.fview (a meteorFamousView object);
* fview.component -> fview.blazeView;

* Debug: Don't show parent & template if they're the same
* a registeredView's add() method now gets a child_options argument

## v0.0.19

* Renaming of public API to reflect name change and be more descriptive
* famousCmp -> FView
* famousCmp.byId() -> FView.byId()
* famousCmp.dataFromView() -> FView.fromBlazeView()
* famousCmp.dataFromTemplate() -> FView.fromTemplate()
* Change all code in the demo to reflect the above

## v0.0.18

* Big improvement of demo site / live docs, i.e. more actual docs :)
* REACTIVE ARGUMENTS FOR VIEWS!  See Features->Reactivity on the site.
* Fix regression from v0.0.17 where template.rendered() funcs weren't run

* Each CompView now gets a unique id (see debug log).
* If you commit to a single simultaneous render, you can set id="name"
* Fetch a CompView directly with `famousCmp.byId(id);`

* Keep track of children and destroy them properly
* Fix famousEach observe computation leak

* famousCmp.views refactor, including breaking changes:
** famousData.viewNode -> famousData.view (the actual Famous view instance)
** famousData._view is now all the view data from `registerView`
** famousData.view -> famousData._view.name

* famousCmp.modifiers refactor, including breaking changes:
** famousData.modifier (same as before)
** famousData._modifier is now all the mod data from `registerModifier`
** famousCmp.modifiers[x] is no longer a class, just an object

## v0.0.17

* Major data context improvements
  Each View no longer creates it's own data context, so no longer necessary
  to do `{{../../name}}` etc.  To scope a particular data context, use
  `{{#with}}` like usual.

## v0.0.16

* Change to new Blaze APIs from 0.8.3 (fixes #39)
  Use v0.0.15 for Meteor versions below 0.8.3

## v0.0.15

* Fix edge case where `destroy` would bail (fixes #27)

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