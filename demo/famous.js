Items = new Meteor.Collection('items');
if (Meteor.isServer) {
  if (Items.find().count() == 0)
    for (var i=0; i < 20; i++)
      Items.insert({name: Random.id()});
}

if (Meteor.isClient) {

  navbar = null;
  Template.header.rendered = function() {
    navbar = this.$('.navbar-nav');
    navbarActive(Router.current().path);
  }
  var navbarActive = function(path) {
    if (!navbar) return;
    if (this.path) path = this.path;
    navbar.find('li.active').removeClass('active');
    navbar.find('a[href="'+path+'"]').parent().addClass('active');
  }

  Router.configure({
    onAfterAction: navbarActive,
    layoutTemplate: 'layout',
    yieldTemplates: {
      'header': {to: 'header'}
    }
  });

  Router.map(function() {
    this.route('home', { path: '/' });
    this.route('Scrollview');
    this.route('Events');
  });

  Template.Scrollview.items = Template.list.items = function() {
    //return [{_id:1, name:'A'}, {_id:2, name:'B'}, {_id:1, name:'C'}, {_id:2, name:'D'}];
    return Items.find();
  }

  Template.ifBlock.surfaceOne = function() {
    return Session.get('surfaceOne');
  }

  var springTransition = {
    method: "spring",
    period: 100,
    dampingRatio: .1,
    velocity: 0.005
  }

  Template.blockSpring.events({
    'mouseover': function(event, tpl) {
      var famousComp = famousCmp.dataFromTpl(tpl);
      famousComp.modifier.setTransform(
        Transform.translate(
          Math.random()*(window.innerWidth/2),
          Math.random()*(window.innerHeight/2)
        ),
        springTransition
      );
    }
  });

  var Transform, Transitionable, SpringTransition;
  Meteor.startup(function() {
    Transform        = require('famous/core/Transform');
    Transitionable   = require("famous/transitions/Transitionable");
    SpringTransition = require("famous/transitions/SpringTransition");

    Transitionable.registerMethod('spring', SpringTransition);
  });

}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
