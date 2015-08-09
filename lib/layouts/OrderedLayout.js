OrderedLayout = null;

FView.ready(function() {

  OrderedLayout = function() {
    Node.apply(this, arguments);
    this._orderedChildren = [];
  };

  OrderedLayout.prototype = Object.create(Node.prototype);
  OrderedLayout.prototype.constructor = OrderedLayout;

  OrderedLayout.prototype.addChild = function(child) {
    child = Node.prototype.addChild.call(this, child);
    this.orderedChildren.push(child);
    if (this.reflow) this.reflow();
    return child;
  };

  OrderedLayout.prototype.removeChild = function(child) {
    Node.prototype.addChild.call(this, child);
    this.orderedChildren = _.without(this.orderedChildren, child);
    if (this.reflow) this.reflow();
  };

  OrderedLayout.prototype.addedAt = function(child, index) {
    Node.prototype.addChild.call(this, child);
    this.orderedChildren.splice(index, 0, child);
    if (this.reflow) this.reflow();
  };

  // TODO, do an action before the remove
  OrderedLayout.prototype.removedAt = function(child, index) {
    Node.prototype.removeChild.call(this, child);
    this.orderedChildren.splice(index, 1);
    if (this.reflow) this.reflow();
  };

  OrderedLayout.prototype.movedTo = function(fromIndex, toIndex) {
    var item = this.orderedChildren.splice(fromIndex, 1)[0];
    this.orderedChildren.splice(toIndex, 0, item);
    if (this.reflow) this.reflow();
  };
});
