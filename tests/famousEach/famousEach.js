// TODO, tests for _super, eachView

var col = new Meteor.Collection(null);
var test = null;
var complete = null;
var runs = 0;

FView.registerView('feTestView', famous.views.SequentialLayout, {
  addedAt: function(id, item, index, _super, eachView) {
    _super();

    if (id === "A") {
      test.equal(Array.prototype.slice.call(arguments, 0, 3), [
        "A",                          // _id
        { _id: "A", name: "apple" },  // item
        0                             // index
      ]);
      test.equal(runs++, 0);
    } else if (id === "C") {
      test.equal(Array.prototype.slice.call(arguments, 0, 3),
        [ "C", { _id: "C", name: "cat" }, 1 ]);
      test.equal(runs++, 1);
      col.insert({ _id: "B", name: 'ball' });
    } else if (id === "B") {
      test.equal(Array.prototype.slice.call(arguments, 0, 3),
        [ "B", { _id: "B", name: "ball" }, 1 ]);
      test.equal(runs++, 2);
      col.update("B", { $set: { name: "dog" }});
    }
  },

  movedTo: function(id, doc, fromIndex, toIndex, _super, eachView) {
    _super();
    if (runs++ > 3) return;

    test.equal(Array.prototype.slice.call(arguments, 0, 4), [
      "B",                          // _id
      { _id: "B", name: "dog" },    // item
      1,                            // fromIndex
      2                             // toIndex
    ]);
    col.remove("B");
  },

  removedAt: function(id, item, index, _super, eachView) {
    _super();
    test.equal(Array.prototype.slice.call(arguments, 0, 3), [
      "B",                          // _id
      { _id: "B", name: "dog" },    // item
      2                             // index
    ]);
    col.update("C", { $set: { name: "CAT" }});
  },

  changedAt: function(id, newItem, oldItem, index, _super, eachView) {
    _super();
    if (runs !== 4) return;

    test.equal(Array.prototype.slice.call(arguments, 0, 4), [
      "C",                          // _id
      { _id: "C", name: "CAT" },    // newItem
      { _id: "C", name: "cat" },    // oldItem
      1                             // index
    ]);
    complete();
  }
});

Template.famousEachTests1.helpers({
  items: function() {
    return col.find({}, { sort: { name:1 } } );
  }
});

Tinytest.addAsync('famous-views - famousEach - observe events',
    function (_test, _complete) {

  test = _test; complete = _complete;
  var root = createTestDIV([200, 200], test);

  Template.famousEachTests1.rendered = function() {

    window.setTimeout(function() {
      col.insert({ _id: "A", name: 'apple' });
      col.insert({ _id: "C", name: 'cat' });
      // B:ball inserted after addedAt runs
    }, 0);

  };

  Blaze.render(Template.famousEachTests1, root);
});
