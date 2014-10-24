Tinytest.addAsync('Famous - Surface - attribute - size - static text value', function (test, complete) {
  var root = createTestDIV([200, 200], test);

  Template.AttrSizeTests_1.rendered = function() {
    window.requestAnimationFrame(function() {
      var target = $(root).find('.surface');

      test.equal(target.width(), 101);
      test.equal(target.height(), 102);
      complete();
    });
  };

  Blaze.render(Template.AttrSizeTests_1, root);
});

Tinytest.addAsync('Famous - Surface - attribute - size - reactive helper update + updates', function (test, complete) {
  var root = createTestDIV([200, 200], test);

  var size = new ReactiveVar([101, 102]);

  Template.AttrSizeTests_2.helpers({
    reactiveSize: function () {
      return size.get();
    }
  });

  Template.AttrSizeTests_2.rendered = function() {
    window.requestAnimationFrame(function() {
      var target = $(root).find('.surface');

      test.equal(target.width(), 101);
      test.equal(target.height(), 102);

      size.set([87, 86]);
      Tracker.flush();

      window.requestAnimationFrame(function() {
        var target = $(root).find('.surface');

        test.equal(target.width(), 87);
        test.equal(target.height(), 86);
        complete();
      });
    });
  };

  Blaze.render(Template.AttrSizeTests_2, root);
});