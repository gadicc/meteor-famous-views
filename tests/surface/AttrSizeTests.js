Tinytest.addAsync('Famous - Surface - attribute - size - allow initial value', function (test, complete) {
  var root = createTestDIV([200, 200], test);
  Blaze.render(Template.AttrSizeTests_1, root);

  Meteor.setTimeout(function () {
    var target = $(root).find('.surface');

    test.equal(target.width(), 101);
    test.equal(target.height(), 102);
    complete();
  }, 50);
});

Tinytest.addAsync('Famous - Surface - attribute - size - allow reactive update', function (test, complete) {
  var root = createTestDIV([200, 200], test);

  var size = new ReactiveVar([101, 102]);

  Template.AttrSizeTests_2.helpers({
    reactiveSize: function () {
      return size.get();
    }
  });

  Blaze.render(Template.AttrSizeTests_2, root);

  Meteor.setTimeout(function () {
    var target = $(root).find('.surface');

    test.equal(target.width(), 101);
    test.equal(target.height(), 102);

    size.set([87, 86]);
    Tracker.flush();

    Meteor.setTimeout(function () {
      var target = $(root).find('.surface');

      test.equal(target.width(), 87);
      test.equal(target.height(), 86);

      complete();
    }, 50);
  }, 50);
});