var lastCmd = null;
var callback = null;
var runCallback = function() {
  callback.apply(this, arguments);
}

var overrides = { newInstance: noop, addToParent: noop };
_.each(['addedAt', 'removedAt', 'changedAt', 'movedTo'], function(what) {
  overrides[what] = function() {
    this.lastCmd = what;
    callback.apply(this, arguments);
  }
});
FView.wrap('famousEachContainer', null, overrides);

var Items = new Mongo.Collection(null);
Template.famousEachTest.helpers({
  items: function() { return Items.find({}, { sort: { name: 1 }}); }
});

Tinytest.add('famous-views - famousEach - setup', function(test) {
  // maintain order
  Blaze.render(Template.famousEachTest, testDiv());
});

Tinytest.addAsync('famous-views - famousEach - addedAt append', function(test, complete) {
  var newItemId = Items.insert({ name:'a' });
  callback = function(id, child, index) {
    test.equal(this.lastCmd, 'addedAt');
    test.equal(id, newItemId);
    test.equal(index, 0);

    // for next test ("addedAt insert")
    Items.insert({ name:'c' });
    callback = function() {
      complete();
    }
  };
});

Tinytest.addAsync('famous-views - famousEach - addedAt insert', function(test, complete) {
  var newItemId = Items.insert({name:'b'});
  callback = function(id, child, index) {
    test.equal(this.lastCmd, 'addedAt');
    test.equal(id, newItemId);
    test.equal(index, 1);
    complete();
  };
});

Tinytest.addAsync('famous-views - famousEach - changedAt', function(test, complete) {
  var itemId = Items.findOne({name:'b'})._id;
  Items.update(itemId, { $set: { newInfo: 1 }} );
  callback = function(id, newItem, oldItem, index, child) {
    test.equal(this.lastCmd, 'changedAt');
    test.equal(id, itemId);
    test.equal(newItem.newInfo, 1);
    complete();
  };
});

Tinytest.addAsync('famous-views - famousEach - movedTo', function(test, complete) {
  var itemId = Items.findOne({name:'b'})._id;
  Items.update(itemId, { $set: { name: 'd' }} );
  // changedAt will trigger first
  callback = function() {
    callback = function(id, doc, fromIndex, toIndex) {
      test.equal(this.lastCmd, 'movedTo');
      test.equal(id, itemId);
      test.equal(fromIndex, 1);
      test.equal(toIndex, 2);
      complete();
    };
  };
});

Tinytest.addAsync('famous-views - famousEach - removedAt', function(test, complete) {
  var itemId = Items.findOne({name:'d'})._id;
  Items.remove(itemId);
  callback = function(id, child, index) {
    test.equal(this.lastCmd, 'removedAt');
    test.equal(id, itemId);
    test.equal(index, 2);
    complete();
  };
});

/*

this "works" but no good way to test for exceptions in descendent callbacks

Tinytest.addAsync('famous-views - famousEach - multiple nodes', function(test, complete) {
  Template.famousEachTest2.helpers({
    items: [ { _id: 'X' } ]
  });
  Blaze.render(Template.famousEachTest2, testDiv());
});

*/