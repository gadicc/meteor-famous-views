Tinytest.addAsync('Famous - Surface - watchSize', function (test, complete) {
  var root = createTestDIV([200, 200], test);

  Template.surfaceWatchSize_inner.rendered = function() {
    var div = this.$('div').eq(0);
    var surface = FView.from(this).surface;

    window.setTimeout(function() {
      var origHeight = surface.getSize()[1];
      div.html('line 1<br>line 2<br>line 3<br>line 4<br>');

      window.setTimeout(function() {
        var curHeight = surface.getSize()[1];
        test.isTrue(curHeight > origHeight);
        complete();
      }, 50);
    }, 50);  // 2 frames?
  };

  Blaze.render(Template.surfaceWatchSize, root);
});