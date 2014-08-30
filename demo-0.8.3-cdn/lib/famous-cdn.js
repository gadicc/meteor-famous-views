if (Meteor.isClient) {
  if (Router) {
    dontSetLayoutYet = true;
    Router.onBeforeAction(function(pause) {
      if (!famousCmp.ready()) {
        this.render('famousLoading');
        pause();
      } else {
        this.layout('layout');
      }
    });
  }
}