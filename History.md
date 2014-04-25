## vNEXT

* "Sequencer" implementation; can now have multiple surfaces,famousEaches per seq
* Arrays should now be specified like cellSize="[150,250]" (note the []'s)
* Start of restructuring in demo app, see client/views directory (e.g. GridView)

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