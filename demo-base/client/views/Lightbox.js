// http://www.famo.us/examples/0.2.0/views/rendercontroller/example

// Re-uses stuff from RenderController

// not done
//Menu.add({name:'Lightbox',route:'views/Lightbox'}, 'Views');

Router.route('views_Lightbox', {
  path: '/views/Lightbox',
});

Template.views_Lightbox.helpers({
  currentTemplate: function() {
    return Session.get('currentTemplate');
  },
  'showTemplate': function() {
    return Template[this.name];
  },
  'getTransition': function() {
    return Session.get('currentTransition');
  }
});
