Tinytest.add('famous-views - Wrappers - Scene - attaches to parent', function(test) {
  // TODO
});

Tinytest.add('famous-views - Wrappers - Scene - id specified', function(test) {
  var div = document.createElement('div');
  document.body.appendChild(div); // famous uses document selector
  Blaze.render(Template.scene_with_id, div);
  Tracker.flush();
  test.equal(div.className, 'fview-scene');
  test.equal(div.id, 'scene_with_id');
});

Tinytest.add('famous-views - Wrappers - Scene - parent is body', function(test) {
  var body = document.createElement('body');
  Blaze.render(Template.scene, body);
  Tracker.flush();
  test.equal(body.className, 'fview-scene');

  // Need to - in an isolated way - test for body,html CSS; pass custom document?
  // Note, this test will have famous setup the scene by selector, on main body :(
});

Tinytest.add('famous-views - Wrappers - Scene - parent not body, existing id', function(test) {
  var div = document.createElement('div');
  document.body.appendChild(div); // famous uses document selector
  Blaze.render(Template.scene, div);
  Tracker.flush();
  test.equal(div.className, 'fview-scene');
  test.equal(div.id.substr(0, 5), 'fview');
});

Tinytest.add('famous-views - Wrappers - Scene - parent not body, absent', function(test) {
  var div = document.createElement('div');
  div.id = 'existing';
  document.body.appendChild(div); // famous uses document selector
  Blaze.render(Template.scene, div);
  Tracker.flush();
  test.equal(div.className, 'fview-scene');
  test.equal(div.id, 'existing');
});
