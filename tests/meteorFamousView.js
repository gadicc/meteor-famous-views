Tinytest.add('famous-views - MeteorFamousView - ids', function (test) {
  var fview;

  // Genereated id
  var expectedId = FView._fviewCount;
  fview = new MeteorFamousView(null, null, 'test', 'meteorFamousViews/ids');
  test.equal(fview.id, expectedId);
  test.equal(fview.id, FView.byId(fview.id).id);

  // Explicit id
  var expectedId = Random.id();
  fview = new MeteorFamousView(null, expectedId, 'test', 'meteorFamousViews/ids');
  test.equal(fview.id, expectedId);
  test.equal(fview.id, FView.byId(fview.id).id);
});
