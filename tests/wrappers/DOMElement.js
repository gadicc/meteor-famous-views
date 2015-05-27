Tinytest.addAsync('famous-views - Wrappers - DOMElement - content', function(test, complete) {
  Template.domEl1_inner.rendered = function() {
    var fview = FView.current();
    var domRenderer = fview._loadedDomRenderer();
    var el = domRenderer._target.content;
    test.ok(el.textContent.trim(), 'domEl1_inner');
    _.defer(complete);
  };

  Blaze.render(Template.domEl1, commonDiv);
});

Tinytest.add('famous-views - Wrappers - DOMElement - attributes - classes', function(test) {
  var classes = new ReactiveVar("x y"); // classes as string

  Template.domEl_classes.helpers({
    getClasses: function() { return classes.get(); }
  });

  Blaze.render(Template.domEl_classes, commonDiv);
  Tracker.flush();

  var fview = FView.byId("domEl_classes");
  test.isTrue(fview.domElement.hasClass('x'));
  test.isTrue(fview.domElement.hasClass('y'));
  test.isFalse(fview.domElement.hasClass('z'));

  classes.set(["y", "z"]); // classes as array
  Tracker.flush();

  test.isFalse(fview.domElement.hasClass('x'));
  test.isTrue(fview.domElement.hasClass('y'));
  test.isTrue(fview.domElement.hasClass('z'));
});

Tinytest.add('famous-views - Wrappers - DOMElement - attributes - style', function(test) {
  var style = new ReactiveVar("background-color: red; color: white"); // as string

  Template.domEl_style.helpers({
    reactiveStyle: function() { return style.get(); }
  });

  Blaze.render(Template.domEl_style, commonDiv);
  Tracker.flush();

  var DE = FView.byId("domEl_style").domElement;
  test.equal(DE._styles['background-color'], 'red');
  test.equal(DE._styles['color'], 'white');

  style.set({ 'background-color': 'red', 'font-weight': 'bold' });  // as dict
  Tracker.flush();

  test.equal(DE._styles['background-color'], 'red');
  test.equal(DE._styles['color'], '');
  test.equal(DE._styles['font-weight'], 'bold');
});

Tinytest.add('famous-views - Wrappers - DOMElement - attributes - other', function(test) {
  var dir = new ReactiveVar("ltr");
  var lang = new ReactiveVar("en");

  Template.domEl_attributes.helpers({
    getDir: function() { return dir.get(); },
    getLang: function() { return lang.get(); }
  });

  Blaze.render(Template.domEl_attributes, commonDiv);
  Tracker.flush();

  var DE = FView.byId("domEl_attributes").domElement;
  test.equal(DE._attributes.dir, 'ltr');
  test.equal(DE._attributes.lang, 'en');

  dir.set('rtl');
  lang.set('ar');
  Tracker.flush();

  test.equal(DE._attributes.dir, 'rtl');
  test.equal(DE._attributes.lang, 'ar');
});