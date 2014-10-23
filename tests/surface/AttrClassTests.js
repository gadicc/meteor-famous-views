/*
Tinytest.addAsync('Famous - Surface - attribute - class - allow initial value', function (test, complete) {
  var root = createTestDIV([200, 200]);
  Blaze.render(Template.AttrClassTests_1, root);

  Meteor.setTimeout(function () {
    test.length($(root).find('.abc'), 1);
    test.length($(root).find('.def'), 1);
    complete();
  }, 50);
});
*/

Tinytest.addAsync('Famous - Surface - attribute - class - allow reactive update', function (test, complete) {
  var root = createTestDIV([200, 200]);

  var classes = new ReactiveVar(['a','b']);

  Template.AttrClassTests_2.helpers({
    reactiveClasses: function () {
      return classes.get();
    }
  });

  Blaze.render(Template.AttrClassTests_2, root);

  Meteor.setTimeout(function () {
    test.length($(root).find('.a'), 1);
    test.length($(root).find('.b'), 1);

    classes.set(['a','c']);
    Tracker.flush();

    Meteor.setTimeout(function () {
      test.length($(root).find('.a'), 1);
      test.length($(root).find('.c'), 1);

      complete();
    }, 50);
  }, 50);
});