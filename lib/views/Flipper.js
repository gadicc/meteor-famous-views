FView.ready(function(require) {
  FView.registerView('Flipper', famous.views.Flipper, {
    add: function(child_fview, child_options) {
      var target = child_options.target;
      if (!target || (target != 'back' && target != 'front'))
        throw new Error('Flipper must specify target="back/front"');

      if (target == 'front')
        this.view.setFront(child_fview);
      else
        this.view.setBack(child_fview);
    }
  });
});
