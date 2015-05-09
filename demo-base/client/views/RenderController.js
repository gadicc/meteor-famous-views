// http://www.famo.us/examples/0.2.0/views/rendercontroller/example

Menu.add({name:'RenderController',route:'views/RenderController'}, 'Views');

Router.map(function() {
  this.route('views_RenderController', {
    path: '/views/RenderController'
  });
});

Session.setDefault('currentTemplate', 'rc_surface1');
Session.setDefault('currentTransition', 'opacity');

Template.views_RenderController.helpers({
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

Template.rc_buttons.helpers({
  'buttons': ['rc_surface1', 'rc_surface2', 'rc_surface3'],
  isSet: function() {
    return this.valueOf() == Session.get('currentTemplate') ? 'disabled' : '';
  }
});
Template.rc_buttons.events({
  'click button': function(event, tpl) {
    Session.set('currentTemplate', this.valueOf());
  }
});

Template.rc_transitionModifiers.helpers({
  'transitions': _.keys(FView.transitionModifiers),
  isSet: function() {
    return this.valueOf() == Session.get('currentTransition') ? 'set' : '';
  }
});
Template.rc_transitionModifiers.events({
  'click button': function() {
    Session.set('currentTransition', this.valueOf());
  }
});

Template.rc_transitionOnceOffs.events({
  'click button': function(event, tpl) {
    var what = event.target.getAttribute('data-what');
    if (what == 'spring') {
      var fview = FView.byId("demoRC");
      var SpringTransition = famous.transitions.SpringTransition;
      fview._transitionOnce = { method: SpringTransition, period: 800, dampingRatio: 0.2, velocity: 0.01 };
    }
  }
});

Session.setDefault('transitionPages', false);
Template.rc_useForPages.events({
  'change': function() {
    Session.set('transitionPages', $(event.target).is(':checked'));
  }
});
Template.rc_useForPages.helpers({
  'checked': function() {
    return Session.get('transitionPages');
  }
});

/* --- prerender demo --- */

Session.setDefault('showId', 'preSurface1');

Template.preRenderDemo.helpers({
  showId: function() {
    return Session.get('showId');
  }
});

Template.preRC_buttons.helpers({
  'buttons': ['preSurface1', 'preSurface2', 'preSurface3'],
  isSet: function() {
    return this.valueOf() == Session.get('showId') ? 'disabled' : '';
  }
});
Template.preRC_buttons.events({
  'click button': function(event, tpl) {
    Session.set('showId', this.valueOf());
  }
});
