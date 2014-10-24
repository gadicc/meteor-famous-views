Tinytest.addAsync('Famous - Surface - attribute - properties - allow initial value', function (test, complete) {
  var root = createTestDIV([200, 200], test);
  Blaze.render(Template.AttrPropertiesTests_1, root);

  Meteor.setTimeout(function () {
    var target = $(root).find('.surface');

    test.equal(target.css('background-color'), 'rgb(44, 55, 66)');
    complete();
  }, 50);
});

Tinytest.addAsync('Famous - Surface - attribute - properties - allow reactive update', function (test, complete) {
  var root = createTestDIV([200, 200], test);

  var props = new ReactiveVar({
    backgroundColor : 'rgb(44, 55, 66)'
  });

  Template.AttrPropertiesTests_2.helpers({
    reactiveProperties: function () {
      return props.get();
    }
  });

  Blaze.render(Template.AttrPropertiesTests_2, root);

  Meteor.setTimeout(function () {
    var target = $(root).find('.surface');

    test.equal(target.css('background-color'), 'rgb(44, 55, 66)');

    props.set({
      backgroundColor : 'rgb(11, 22, 33)'
    });
    Tracker.flush();

    Meteor.setTimeout(function () {
      var target = $(root).find('.surface');

      test.equal(target.css('background-color'), 'rgb(11, 22, 33)');

      complete();
    }, 50);
  }, 50);
});