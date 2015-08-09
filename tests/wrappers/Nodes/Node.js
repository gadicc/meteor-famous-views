var sceneIds = {};
function fviewWithNode(source) {
  // new sizesystem etc relies on a node being mounted (and accessible via
  // getLocation,)
  var id = 'n_' +SHA256(source);
  if (sceneIds[id])
    throw new Error(source + " is not unique");
  sceneIds[id] = true;

  var div = testDiv(id);
  var scene = famous.core.FamousEngine.createScene('#' + id);

  var fview = new FView._classes._Node(null, null, source);
  fview.node = new famous.core.Node();
  scene.addChild(fview.node);

  return fview;
}

var Node = famous.core.Node;

Tinytest.add('famous-views - Wrappers - Node - size component (method 1)', function(test) {
  var fview = fviewWithNode('wrappers/node/sizeComponent1');

  fview.attrUpdate('size', "A:100; renderSize; relative: 2,10");
  var result = fview.size.getValue();
  test.equal(result.sizeMode, { 0:Node.ABSOLUTE_SIZE, 1:Node.RENDER_SIZE, 2:Node.RELATIVE_SIZE }, 'modes from A:,renderSize,R:');
  test.equal(result.absolute.x, 100, 'setAbsolute');
  test.equal(result.proportional.z, 2, 'setProportional via R');
  test.equal(result.differential.z, 10, 'setDifferential via R');

  fview.attrUpdate('size', "P:5; D:-10");
  var result = fview.size.getValue();
  test.equal(result.sizeMode, { 0:Node.RELATIVE_SIZE, 1:Node.RELATIVE_SIZE, 2:Node.DEFAULT_SIZE });
  test.equal(result.proportional.x, 5);
  test.equal(result.differential.x, 0);
  test.equal(result.proportional.y, 1);
  test.equal(result.differential.y, -10);

  fview.attrUpdate('size', "Prop:5; Diff:-10; RenderSize");
  var result = fview.size.getValue();
  test.equal(result.sizeMode, { 0:Node.RELATIVE_SIZE, 1:Node.RELATIVE_SIZE, 2:Node.RENDER_SIZE });
  test.equal(result.proportional.x, 5);
  test.equal(result.differential.x, 0);
  test.equal(result.proportional.y, 1);
  test.equal(result.differential.y, -10);
});

Tinytest.add('famous-views - Wrappers - Node - size component (method 2)', function(test) {
  var fview = fviewWithNode('wrappers/node/sizeComponent2');

  fview.attrUpdate('size', "100, renderSize, 200% + 10");
  var result = fview.size.getValue();
  test.equal(result.sizeMode, { 0:Node.ABSOLUTE_SIZE, 1:Node.RENDER_SIZE, 2:Node.RELATIVE_SIZE }, 'sizeMode from 100, renderSize, 200% + 10');
  test.equal(result.absolute.x, 100, 'absolute from 100');
  test.equal(result.proportional.z, 2, 'proportional from 200% + 10');
  test.equal(result.differential.z, 10, 'differential from 200% + 10');

  fview.attrUpdate('size', "500%, -10");
  var result = fview.size.getValue();
  test.equal(result.sizeMode, { 0:Node.RELATIVE_SIZE, 1:Node.RELATIVE_SIZE, 2:Node.DEFAULT_SIZE }, 'sizeMode from "500%, -10"');
  test.equal(result.proportional.x, 5, 'proportional from 500%');
  test.equal(result.differential.x, 0, 'differential from 500%');
  test.equal(result.proportional.y, 1, 'proportional from -10');
  test.equal(result.differential.y, -10, 'differential from -10');

  fview.attrUpdate('size', "500%, -10, RS");
  var result = fview.size.getValue();
  test.equal(result.sizeMode, { 0:Node.RELATIVE_SIZE, 1:Node.RELATIVE_SIZE, 2:Node.RENDER_SIZE });
  test.equal(result.proportional.x, 5);
  test.equal(result.differential.x, 0);
  test.equal(result.proportional.y, 1);
  test.equal(result.differential.y, -10);
});


Tinytest.add('famous-views - Wrappers - Node - non-size builtins', function(test) {
  var fview = fviewWithNode('wrappers/node/nonSizeBuiltins');
  fview.attrUpdate('position', "[1,2,3]");
  test.equal(fview.node.getPosition(), {0:1, 1:2, 2:3});
});

Tinytest.add('famous-views - Wrappers - Node - non-size components', function(test) {
  var fview = fviewWithNode('wrappers/node/nonSizeComponents');
  fview.position = new famous.components.Position(fview.node);

  fview.attrUpdate('position', { value: [1,2,3] });
  test.equal(fview.position.getValue(),
    { component: "Position", x: 1, y: 2, z: 3 });
});

Tinytest.addAsync('famous-views - Wrappers - Node - _onRender', function(test, complete) {
  Template.node2.helpers({
    onRender: function() {
      // should we look for anything in particular?
      complete();
    }
  });

  Blaze.render(Template.node2, testDiv());
});

// also tests: addToParent, addChild
Tinytest.addAsync('famous-views - Wrappers - Node - template create', function(test, complete) {
  Template.node3.rendered = function() {
    var scene = FView.byId('node3_scene');
    var node = FView.byId('node3_node');

    test.equal(scene.children.indexOf(node), 0);
    test.equal(scene.node._children.indexOf(node.node), 0);
    complete();
  };
  Blaze.render(Template.node3, testDiv());
});

// also tests: dismount
Tinytest.addAsync('famous-views - Wrappers - Node - template destroy', function(test, complete) {
  var x = new ReactiveVar(true);
  Template.node4.helpers({
    x: function() { return x.get(); }
  });

  Template.node4.rendered = function() {
    var scene = FView.byId('node4_scene');
    var node = FView.byId('node4_node');

    Tracker.afterFlush(function() {
      test.equal(scene.children.indexOf(node), -1);
      test.equal(scene.node._children.indexOf(node.node), -1);
      complete();
    });
    x.set(false);
  };
  Blaze.render(Template.node4, testDiv());
});

Tinytest.addAsync('famous-views - Wrappers - Node - classes (static)', function(test, complete) {
  Template.node5_static.rendered = function() {
    var fview = FView.byId("node5_static");
    test.equal(fview._classes, ['class1', 'class2']);

    test.isTrue(fview.hasClass('class1'));
    test.isFalse(fview.hasClass('class3'));

    fview.addClass('class3');
    test.isTrue(fview.hasClass('class3'));

    fview.removeClass('class2');
    test.isFalse(fview.hasClass('class2'));

    complete();
  }
  Blaze.render(Template.node5_static, testDiv());
});

// TODO, dynamic classes?

Tinytest.addAsync('famous-views - Wrappers - Node - class onRender method (& before Node onRender)', function(test, complete) {
  FView.defineClass('node6', {
    onRender: function() {
      this.classOnRenderRan = true;
    }
  });

  Template.node6.helpers({
    onRender: function() {
      test.isTrue(this.classOnRenderRan);
      complete();
    }
  });

  Template.node6.rendered = function() {
    var fview = FView.byId("node6");

    complete();
  }
  Blaze.render(Template.node6, testDiv());
});