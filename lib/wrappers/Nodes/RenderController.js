FView.ready(function() {
  var Node = famous.core.Node;

  function RenderController() {
    Node.call(this);

    this.wrapperMap = {};
    this.current = null;
  }
  RenderController.prototype = Object.create(Node.prototype);
  RenderController.prototype.constructor = RenderController;

  RenderController.prototype.addChild = function(child) {
    var wrapperNode = new Node();
    wrapperNode.addChild(child);
    this.wrapperMap[child] = wrapperNode;   // TODO cleanup
    
    if (!this.current) this.current = wrapperNode;
    this.__proto__.__proto__.addChild.call(this, wrapperNode);
  };

  RenderController.prototype.hide = function(origNode, transition, callback) {
    var node = this.wrapperMap[origNode];
    var size = this.getSize();

    if (!node)
      throw new Error("hide called with unknown node");

    if (!node.position)
      node.position = new famous.components.Position(node);

    if (!transition)
      transition = { duration: 500 };

    node.position.set(-size[0], 0, size[2], transition, function() {
      node.hide();
      if (callback)
        callback();
    });
  };

  RenderController.prototype.show = function(origNode, transition, callback) {
    var node = this.wrapperMap[origNode];
    var size = this.getSize();

    if (!node)
      throw new Error("hide called with unknown node");

    if (!node.position)
      node.position = new famous.components.Position(node);

    if (!transition)
      transition = { duration: 500 };

    node.position.set(size[0], 0, 0);
    node.show();
    node.position.set(0, 0, 0, transition, callback);

    this.current = node;
  }

  FView.wrap('RenderController', RenderController, {

    addChild: function(child) {
      var rc = this;

      child._preventDestroyWith(function() {
        var child = this;
        rc.node.hide(child.node, null, function() { child.destroy() } );
      });

      this.__proto__.__proto__.addChild.call(this, child);

      if (this.node.getChildren().length > 1)
        this.node.show(child);
    }

  });
});
