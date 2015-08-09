FView._nodeClasses = {};

FView.defineClass = function(_class, options) {
  FView._nodeClasses[_class] = options;
}

FView.defineClass('center', {
  onRender: function() {
    this.node.setMountPoint(0.5, 0.5, 0.5);
    this.node.setAlign(0.5, 0.5, 0.5);
    this.node.setOrigin(0.5, 0.5, 0.5);
  }
});
