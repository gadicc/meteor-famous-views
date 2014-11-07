Tinytest.addAsync('Famous - Surface - attribute - size - static text value', function (test, complete) {
  var root = createTestDIV([200, 200], test);

  Template.AttrSizeTests_1.rendered = function() {
    var surface = FView.byId('AttrSizeTests_1').surface;

    test.equal(surface.getSize(), [101, 102]);
    complete();
  };

  Blaze.render(Template.AttrSizeTests_1, root);
});

Tinytest.addAsync('Famous - Surface - attribute - size - reactive helper update + updates', function (test, complete) {
  var root = createTestDIV([200, 200], test);

  var reactiveSize = new ReactiveVar([101, 102]);

  Template.AttrSizeTests_2.helpers({
    reactiveSize: function () {
      return reactiveSize.get();
    }
  });

  Template.AttrSizeTests_2.rendered = function() {
    var surface = FView.byId('AttrSizeTests_2').surface;

    test.equal(surface.getSize(), [101, 102]);

    _.defer(function() {
      reactiveSize.set([87, 86]);
      Tracker.flush();
      test.equal(surface.getSize(), reactiveSize.get());
      complete();
    });
  };

  Blaze.render(Template.AttrSizeTests_2, root);
});