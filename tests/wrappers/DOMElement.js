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