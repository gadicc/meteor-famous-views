Tinytest.addAsync('Famous - Surface - attribute - class - static text value', function (test, complete) {
  var root = createTestDIV([200, 200], test);

  Template.AttrClassTests_1.rendered = function() {
    var classes = FView.byId('AttrClassTests_1').surface.getClassList();
    test.include(classes, 'abc');
    test.include(classes, 'def');
    complete();
  };

  Blaze.render(Template.AttrClassTests_1, root);
});

Tinytest.addAsync('Famous - Surface - attribute - class - reactive helper + updates', function (test, complete) {
  var root = createTestDIV([200, 200], test);

  var reactiveClasses = new ReactiveVar(['a','b']);

  Template.AttrClassTests_2.helpers({
    reactiveClasses: function () {
      return reactiveClasses.get();
    }
  });

  Template.AttrClassTests_2.rendered = function() {
    var classes = FView.byId('AttrClassTests_2').surface.getClassList();
    test.include(classes, 'a');
    test.include(classes, 'b');

    _.defer(function() {
      reactiveClasses.set(['a','c']);
      Tracker.flush();

      test.include(classes, 'a');
      test.ok(classes.indexOf('b') === -1);
      test.include(classes, 'c');
      complete();
    });
  };

  Blaze.render(Template.AttrClassTests_2, root);
});
