Tinytest.addAsync('Famous - Surface - attribute - properties - static text value', function (test, complete) {
  var root = createTestDIV([200, 200], test);

  Template.AttrPropertiesTests_1.rendered = function() {
    var properties = FView.byId('AttrPropertiesTests_1').surface.getProperties();
    test.equal(properties['background-color'], 'rgb(44,55,66)');
    complete();
  };

  Blaze.render(Template.AttrPropertiesTests_1, root);
});

Tinytest.addAsync('Famous - Surface - attribute - properties - reactive helper + updates', function (test, complete) {
  var root = createTestDIV([200, 200], test);

  var props = new ReactiveVar({ 'background-color' : 'rgb(44,55,66)' });

  Template.AttrPropertiesTests_2.helpers({
    reactiveProperties: function () {
      return props.get();
    }
  });

  Template.AttrPropertiesTests_2.rendered = function() {
    var surface = FView.byId('AttrPropertiesTests_2').surface;
    test.equal(surface.getProperties()['background-color'], 'rgb(44,55,66)');

    _.defer(function() {
      props.set({ 'background-color' : 'rgb(11,22,33)' });
      Tracker.flush();
      test.equal(surface.getProperties()['background-color'], 'rgb(11,22,33)');
      complete();
    });
  };

  Blaze.render(Template.AttrPropertiesTests_2, root);
});