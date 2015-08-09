SequentialLayout = null;

FView.ready(function() {

  SequentialLayout = function(options) {
    this.options = _.extend({}, this.DEFAULT_OPTIONS, options);
    this.orderedChildren = [];
    OrderedLayout.apply(this, arguments);
  }

  SequentialLayout.prototype = Object.create(OrderedLayout.prototype);
  SequentialLayout.prototype.constructor = SequentialLayout;

  SequentialLayout.prototype.DEFAULT_OPTIONS = {
    direction: 1,
    spacing: 0
  }

  SequentialLayout.prototype.reflow = _.debounce(function() {
    var children = this.orderedChildren;
    var direction = this.options.direction;
    var spacing = this.options.spacing;
    var pos = [0, 0, 0];

    for (var i=0; i < children.length; i++) {
      children[i].setPosition.apply(children[i], pos);
      pos[direction] += children[i].getSize()[direction] + spacing;
    }
  }, 50);

  SequentialLayout.prototype.addChild = function(child) {
    var self = this;
    child = OrderedLayout.prototype.addChild.call(this, child);

    child.addComponent({
      onSizeChange: function() { self.reflow(); }
    });
  };

  SequentialLayout.prototype.removeChild = function(child) {
    OrderedLayout.prototype.removeChild.call(this, child);
    // clean up component?
  }

  _.each(_.keys(SequentialLayout.prototype.DEFAULT_OPTIONS), function(option) {
    var upper = option.charAt(0).toUpperCase() + option.substr(1);
    SequentialLayout.prototype['set'+upper] = function(value) {
      this.options[option] = value || 0;
      this.reflow();
    }
    SequentialLayout.prototype['get'+upper] = function() {
      return this.options[option];
    }
  });

  FView.wrap('SequentialLayout', SequentialLayout, {
    addedAt: function(id, child, index) {
      this.node.addedAt(child, index);
    },
    removedAt: function(id, child, index) {
      this.node.removedAt(child, index);
    },
    movedTo: function(id, doc, fromIndex, toIndex) {
      this.node.movedTo(fromIndex, toIndex);
    }
  });
});