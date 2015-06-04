var DEFER_RUN_THRESHOLD = 2;

/*
 * Rather than just `setTimeout(f, 0)`, let's assume defer'd functions don't
 * need to be run "as soon as possible".  We can loop through them once per
 * frame, and abort the queue if we exceed the given threshold.  Inspired by
 * famous 0.3.
 */

var queue = [];
var timer = typeof performance === 'object' ? performance : Date;

FView.defer = function(func) {
  queue.push(func);
};

// avoid garbage collection
var start, i, len, diff;

var deferRunObj = {
  onUpdate: function() {
    start = timer.now();
    len = queue.length;

    for (i = 0; i < len && timer.now() - start < DEFER_RUN_THRESHOLD; i++)
      queue[i]();

    queue.splice(0, i);
    FamousEngine.requestUpdateOnNextTick(deferRunObj);
  }
};

FView.ready(function() {
  FamousEngine.requestUpdate(deferRunObj);
});
