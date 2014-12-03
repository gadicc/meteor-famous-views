// NOT DONE!

FView.ready(function(require) {
  FView.registerView('Lightbox', famous.views.Lightbox, {
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
    },

    attrUpdate: function(key, value, oldValue, allData, firstTime) {
      if (key == 'transition') {
        var data = FView.transitions[value];
        if (data) {
          for (key in data)
            this.view[key](data[key]);
        } else {
          log.error('No such transition ' + transition);
        }
      }
    }
  });
});
