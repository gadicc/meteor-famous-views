// https://github.com/Famous/examples/blob/master/src/examples/views/GridLayout/

Menu.add({name:'GridLayout',route:'views/GridLayout'}, 'Views');

Router.map(function() {
  this.route('views_GridLayout', {
    path: '/views/GridLayout'
  });
});

FView.ready(function(require) {
  FView.registerView('GridLayout', famous.views.GridLayout);
});

Template.views_GridLayout.helpers({
  items: function() {
    return Items.find({}, {sort: {name: 1}, limit: 8});
  }
});

var queue = [];
Template.gridItem.rendered = function() {
  var modifier = FView.from(this).modifier;

  // not sure about this :>
  /*
  var fview = FView.dataFromTemplate(this);
  var ContainerSurface = fview.parent.node._object.node._child[0]._object;
  var GridLayout = fview.parent.component.parent.famousData.parent.node._child._object;
  modifier._modifier.sizeFrom(function() {
    var contextSize = GridLayout._contextSizeCache;
    var dimensions = GridLayout._dimensionsCache;
    var rowSize = Math.round(contextSize[1] / dimensions[1]);
    var colSize = Math.round(contextSize[0] / dimensions[0]);
    return [undefined,undefined];
  });
  */

  modifier.setTransform(
    Transform.translate(500,500)
  );

  queue.push(function() {
    modifier.setTransform(
      Transform.translate(0,0),
      //springTransition
       { duration : 1000, curve: 'easeInOut' }
    );
  });
};

Meteor.setInterval(function() {
  if (queue.length)
    queue.shift()();
},100);

var springTransition = {
  method: "spring",
  period: 100,
  dampingRatio: 0.1,
  velocity: 0.005
};
