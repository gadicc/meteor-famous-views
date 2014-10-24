Tinytest.addAsync('Famous - Surface - attribute - class - static text value', function (test, complete) {
  var root = createTestDIV([200, 200]);

  Template.AttrClassTests_1.rendered = function() {
    window.requestAnimationFrame(function() {
      test.length($(root).find('.abc'), 1);
      test.length($(root).find('.def'), 1);
      complete();
    });
  };

  Blaze.render(Template.AttrClassTests_1, root);
});

Tinytest.addAsync('Famous - Surface - attribute - class - reactive helper', function (test, complete) {
  var root = createTestDIV([200, 200]);

  var classes = new ReactiveVar(['a','b']);

  Template.AttrClassTests_2.helpers({
    reactiveClasses: function () {
      return classes.get();
    }
  });

  Template.AttrClassTests_2.rendered = function() {
    window.requestAnimationFrame(function() {
      // Test initial value
      test.length($(root).find('.a'), 1);
      test.length($(root).find('.b'), 1);

      classes.set(['a','c']);
      Tracker.flush();

      // Test reactive change
      window.requestAnimationFrame(function() {
        test.length($(root).find('.a'), 1);
        test.length($(root).find('.c'), 1);

        complete();
      });
    });
  };

  Blaze.render(Template.AttrClassTests_2, root);
});
