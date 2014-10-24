Tinytest.addAsync('Famous - Surface - attribute - properties - static text value', function (test, complete) {
  var root = createTestDIV([200, 200]);

  Template.AttrPropertiesTests_1.rendered = function() {
    window.requestAnimationFrame(function() {
      var target = $(root).find('.surface');
      test.equal(target.css('background-color'), 'rgb(44, 55, 66)');
      complete();
    });
  };

  Blaze.render(Template.AttrPropertiesTests_1, root);
});

Tinytest.addAsync('Famous - Surface - attribute - properties - reactive helper', function (test, complete) {
  var root = createTestDIV([200, 200]);

  var props = new ReactiveVar({
    backgroundColor : 'rgb(44, 55, 66)'
  });

  Template.AttrPropertiesTests_2.helpers({
    reactiveProperties: function () {
      return props.get();
    }
  });

  Template.AttrPropertiesTests_2.rendered = function() {
    window.requestAnimationFrame(function() {
      var target = $(root).find('.surface');

      test.equal(target.css('background-color'), 'rgb(44, 55, 66)');

      props.set({
        backgroundColor : 'rgb(11, 22, 33)'
      });
      Tracker.flush();

      window.requestAnimationFrame(function() {
        var target = $(root).find('.surface');
        test.equal(target.css('background-color'), 'rgb(11, 22, 33)');
        complete();
      });
    });
  };

  Blaze.render(Template.AttrPropertiesTests_2, root);
});