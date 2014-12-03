FView.ready(function(require) {
  FView.registerView('EdgeSwapper', famous.views.EdgeSwapper, {
    add: function(child_fview, child_options) {
      if (!this.view)
        return;  // when?

      if (this.currentShow)
        this.previousShow = this.currentShow;
      this.currentShow = child_fview;

      child_fview.preventDestroy();

      var self = this;
      this.view.show(child_fview, null, function() {
        if (self.previousShow)
          self.previousShow.destroy();
      });
    }
  });
});
