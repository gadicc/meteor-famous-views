## vNEXT

## v0.2.2

* Fix `ContainerSurface`'s reactive `properties`, thanks @adamwong246 (#255)

## v0.2.1

* When using `famousEvents()`, `this` is now correctly the data context just
  like regular `Template.x.events()`.

* Internal: store `fview.renderBlazeView`, which is very useful for getting
  the data context... like `fview.surfaceBlazeView` but present in surfaces
  and non-surfaces.

## v0.2.0

* Experimental `_onRender` attribute, to define `onRender` callbacks
  via template helpers.  `this` is the blazeView, like usual.

* Override Meteor's `setInterval`, `setTimer`, `defer` too.

* Make new Tracker code work with older versions of Meteor too.

**v0.1.33-pre.3**

* RenderController: prerender mode for better performance (see docs).

* fixed Blaze.remove not called on all children; our own forEach.

* Modifier can't handle true size, so let Surface handle that (#214)
  (thanks @ShawnOceanHu)

* Fix for new Event() failure on browsers that do not support it, e.g.
  IE.  (#239)  (thanks @chaosmaster99)

* Update to use latest Tracker.  Log long computations by default.
  Tracker.warnOnLongComputations = true;
  Tracker.showFullFuncsInWarnings = false;
  Tracker.showComputationsInWarnings = false;  

* Override Meteor.setImmediate() to use famous.core.Engine.defer();

* Make optionString() stricter about handing off to parseFloat (#220)
  thanks @fredevery.

**v0.1.33-pre.1**

* MAJOR.  We now override Tracker with our own modified version to make sure
  recomputations don't result in skipped frames.  Shouldn't cause any
  change in behaviour (except for buttery smoothness), but let us know if
  anything breaks.  Look out for "Tracker.flush" fview debug messages in
  the console.

* Some early code to automatically handle a case where a parent contains
  children with destroyPrevented, and to defer the parent's destroy() until
  all children are cleaned up.

* Bug fix (invisible) - internal; properly cleanup children from parents.
  Minor memory leak since most data was cleaned up anyway.

* fview.on(event, callback) like node, supporting: "destroy", "cleanup".
  .listeners(event) and .removeListener(event, callback) work too.

* famousEach observe events, now run inside the same Engine.defer as the
  _super() code.  Note, you'll still want to defer any layout code in here
  to make sure any rendering (which is also deferred) is run beforehand.

* Bugfix: StateModifier scaleX,Y,Z now work properly.

## v0.1.32

* Bugfix (#famous regression): direction="X" now works again

## v0.1.31

* Bugfix (#famous regression): Revert back to Blaze.render (for non-Surfaces)
  to ensure rendered callbacks of nested templates are correctly run (#199)

* Bugfix (#famous regression): direction="1" now works again (#207)

* Bugfix (#RenderController): fview._transition is now properly honoured (#193)

* Bugfix: `fview.destroy()` now correctly removes children from
  child sequences (#153)

* Enhancement (#famousEach): Allow overrides on all famousEach observe within
  the containing fview.  See Views README for details. (#201)

* Enhancement (#Surface): watchSize now uses javascript-detect-element-resize
  lib to detect size changes on

* Enhancement (#Surface): Defer running of Surface rendered callbacks for
  smoother performance.

## v0.1.30

* ~~Fix some flicker that snuck back (use Engine.nextTick instead of .defer)~~
  (not yet; was in some of the .rc releases)

* Introduce `FView.registerTransition(name, func)`, which stores the transition
  func in `FView.transitions[name]` and may be used by other parts of this
  package and plugins.  `Func(modifier, done)` acts on `modifier` and calls
  `done` when the animation is finished.  `this` will be the fview, if
  available.

* The special direction="X" (taking a string instead of integer) now works
  on reactive updates too. (#170)

* Docs: updated Scrollview to reflect reactive properties.

* Generally using `{{#famousContext}}` in `<body>` these days is considered
  safe and reliable.  However, as a precaution for weird situations, we now
  insert a wrapper view and only roll once FView.ready() is true.

* **famousIf**, previously, was used to maintain the correct position inside
  of a sequence.  Now, it can be used inside of a regular renderNode too,
  and cleans up children when the condition changes (#179)

* Document `StateModifier`.  Add missing `origin` reactivity.

* Speed increase.  Do our own materialization of non-Surface templates to
  avoid some unnecessary DOM stuff.  (And cleaned-up `lib/famous.js`)

* For registerables, add an `onDestroy()` callback to be fired just before
  the fview is completely destroyed.

* Add support for `watchSize=true` on Surfaces.  Document Surfaces.
  Document pattern to retrigger `true`-sized Surface size calculations.
  (#163)

* Registerables: onRenderTree() callback (not used for anything yet)
  Views: postRender() callback (was only available for modifiers until now)
  ~~Surfaces: Template.x.onDocumentDom() callback, but this is now the
  default behaviour for .rendered() - so rather use that~~

* Internal: when called with inclusion, store a link to the used template
  in `fview.template`.

* `FView.from()` and `FView.fromBlazeView()` now return an fview on the
  given blazeView if it exists, and not only from it's ancestors.

* Surfaces now store a `fview.surfaceBlazeView` for the blazeView used
  to render the Surface's contents.

* For **Surfaces**, Template.x.rendered now runs after the template has
  been rendered *and added to the document*.  This is later than before,
  but more in line with how Meteor does things and allows for more
  intuitive use.  E.g. jQuery plugins work better.  Note, even though
  `$()` will work here now, you should **always** use `this.$()` when
  possible, for performance.  (#192)

* Start recording ChangeLog on View pages too (e.g. Surfaces, Views README)

* Bugfix: don't try "decode" the `id` attribute (#100)

## v0.1.29

* For those still using the (deprecated) autoHeight, fixes a serious regression
  where this would cause an infinite loop and freeze the browser.

## v0.1.28

* Fix regression with auto-famousContext and queue nodes added to famousContext
  until it's really ready.

## v0.1.27

* BREAKING.  #famousContext now creates it's own div, you can specify
  id/class/style as attributes.  For the old behaviour, use `useParent=1`.

* POTENTIALLY BREAKING.  We completely changed the way the main context
  is created, but are quite sure it's all backwards compatible.  Let us
  know if anything breaks for you on this upgrade.  We also have new
  recommended app patterns that will be online on the website soon.

* BREAKING.  FView.mainCtx is no longer ready in FView.ready().  In any
  case, the existence of this variable is no longer guaranteed, and
  depends how the app is setup (appMode or not).

* We now defer code via Famous' defer queue.  Should get rid of some
  flicker and jitter.

* If you need it, FView.postFirstAdd() will queue functions to run after
  the render tree has it's first node.  Useful for plugins who want to
  check for the existence of FView.mainCtx / appMode, etc.

## v0.1.26

* ContainerSurface now has a reactive `perspective=500` attribute.

## v0.1.25

* More data context tests and fixes.  The last time, I think.

## v0.1.24

* POTENTIALLY BREAKING, FView.ready() functions now run AFTER the main
  context is created (and at least after Meteor.startup()).  This is more
  useful, and quite unlikely to cause problems with existing code.

* `FView.log` is now available for other packages to use without needing
  to include pince, etc.

* The demo now includes the fview-lagometer package, in production only.
  Click to focus on the app window and press alt-L to toggle.

## v0.1.23

* BREAKING/famono.  We used to pull in famo.us pollyfills and CSS for you,
  with `famous.polyfills` and `famous.core.famous`, respectively.  This
  should really be done app-level, and you would have done this anyway
  if you followed the famono README.  If you didn't, you need to do it
  now, see the bottom of http://famous-views.meteor.com/start

* Bugfix, avoid leak/mutation in some cases where no arguments/attributes
  given, e.g. `{{#Surface}} with no args {{/Surface}}`. (#135)

* BREAKING, `FView.transitions`, in case you use it directly, is now
  more correctly named `FView.transitionModifiers` (currently used
  for `transition="slideWindow"` etc in `RenderController`.

* RenderController now supports setting of transition (as opposed to
  transition modifier, e.g. a curve or physics transition), by setting
  `fview._transition`. (#93)

* RenderController now supports once-off transition and transition
  modifiers (useful for per-route transitions in iron-router), using
  `fview._transitionOnce` and `fview.transitionModifierOnce`.  See
  the RenderController page in the demo for more info. (#93)

* You can now set `FView.mainCtx = null` to avoid famous-views creating
  a main context.  Useful for using `#famousContext` in regular
  apps.

## v0.1.22

* famousContext improvements.  Amongst other changes, you can now pass
  it an `id` and find it again with `FView.byId()`, like anything else.

* reactive properties in Scrollview, e.g. `fview.properties.get('index')`
  will reactively invalidate when user changes pages on paginated sview

* early support for `{{#Surface value="{{helper arg}}"}}` :)
  i.e. putting a spacebars expression as a value for an attribute for
  inside a view; pseudo-recursive-spacebars

* bugfix: don't use parent's options when no attributes are specified
* Surfaces: Fix empty text ("") value for reactive classes

* test improvements - faster, more robust
* clarify famousContext usage in API docs
* improve QuickStart instructions
* Super QuickStart clone instructions at the beginning

## v0.1.21

* Defer some manipulations to the render tree to greatly reduce flicker.

## v0.1.20

* Support `style="background: red; color: blue" etc (alias for `properties`)
  on Surfaces (#124)

* slideWindow transition used to also include opacity.  Changing transitions
  would leak opacity/translate if only one was used.  Fixed.

## v0.1.19

* Support for {{#Modifier}}, etc.
* Internally, FView.views and FView.modifiers now live in
  FView._registerables, with { type: "view", constructor: func }, etc.

* BREAKING.  Default to adding `modifier="Modifier"` on transform, translate,
  align, etc.  Specify modifier=`StateModifier` explicitly if you want
  reactivity.

  It seems we used to inadvertantly add StateModifier to anything
  specifying `size=`.  So if some of your old code break, maybe it's because
  you now need to explicitly specify `modifier="StateModifier"`.  (We now
  only do this for things that can't have their own size, e.g.
  famous.core.View).

  See also `examples/layouts` on the site, some of our recommendations have
  changed.  Particularly, for position multiple Surfaces in the same area,
  use `{{#Modifier}}` instead of `{{#View}}`.

* `size="[undefined,true]" (introduced in Famo.us 0.3.0) now works properly
  in fviews.  As such, we have deprecated `size="[undefined,auto]"`.  You
  can still use it for now, but you'll get a warning until you change it.
  All instances of `auto` have been removed from site/demo code (and for
  the same bother, we now correctly setup `Template.x.helpers()` as required
  by Meteor 0.9.4+).

## v0.1.18

* package.js cleanup, deps->tracker, famono tested working again

## v0.1.17

* Fix Surface classes="multiple classes" regression

* Introduce {{#famousContext}}, full credits to #mcbain!
  See https://github.com/gadicc/meteor-famous-views/issues/74 for more
  info.

* Test improvements, continous integration testing via Travis

## v0.1.16

* Merge PR #103 from @mcbain, some very welcome tiny tests to help
  get famous-views more production ready.

* Upgrade famono demo from 0.3.0-alpha to 0.3.0, add src:root (#102)

* More cleanly separate into demo-base, demo-famono and demo-mjn.

## v0.1.15

* Remove iron-router weak dependency.  famous-views no longer requires
  iron-router directly, just include the version you need in your app.

## v0.1.14

* Bugfix: famousEvents now correctly works on Views (#26)
  It also now provides the same context/this and arguments as
  the original function provides (since Famous 0.3)

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
