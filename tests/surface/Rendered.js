/* When a Surface rendered callback is run, the template's contents should have
 * been rendered not just to a document fragment but should be available inside
 * the root document DOM, i.e. via jQuery's $() */

Tinytest.addAsync('Famous - Surface - rendered callback - added to document DOM',
    function (test, complete) {
  var root = createTestDIV([200, 200], test);

  Template.famousSurfaceRendered_inner.rendered = function() {
    var p = $('#famousSurfaceRendered_inner').eq(0);
    test.equal(p.length && p.attr('data-value'), "123");
    complete();
  };

  Blaze.render(Template.famousSurfaceRendered, root);
});