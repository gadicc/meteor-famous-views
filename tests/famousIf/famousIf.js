var Engine = famous.core.Engine;
Tinytest.addAsync('famous-views - famousIf - not in a sequence, i.e. via add()',
    function (test, complete) {
  var root = createTestDIV([200, 200], test);

  var startFalse = new ReactiveVar(false);
  var startTrue = new ReactiveVar(true);

  var registers = {};
  Template.famousIfTests1.helpers({
    startFalse: function() { return startFalse.get(); },
    startTrue: function() { return startTrue.get(); },
    register: function() { registers[this.key] = this.value; }
  });

  Template.famousIfTests1.rendered = function() {
    Engine.nextTick(function() {
      test.isUndefined(FView.byId("startFalse"));
      test.isTrue(!!FView.byId("startTrue"));

      startFalse.set(true);
      startTrue.set(false);
      Engine.defer(function() {
        Tracker.flush();
        Engine.nextTick(function() {
          test.isTrue(!!FView.byId("startFalse"));
          test.isUndefined(FView.byId("startTrue"));
          complete();
        });
      });

      // TODO, tests for swapping if/else
      // TODO, tests to make sure only one child of
      //   container.children, fview.children, fview.node.children
    });
  };

  Blaze.render(Template.famousIfTests1, root);
  Tracker.flush();
});
