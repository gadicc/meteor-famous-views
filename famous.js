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
    return [{_id:1, name:'A'}, {_id:2, name:'B'}, {_id:1, name:'C'}, {_id:2, name:'D'}];
    //return Items.find();
  }

  //var
  PhysicsEngine=null, Spring=null, Particle=null, Body=null;
  Meteor.startup(function() {
    PhysicsEngine = require('famous/physics/PhysicsEngine');
    Spring = require('famous/physics/forces/Spring');
    Particle = require('famous/physics/bodies/Particle');
    Body = require('famous/physics/bodies/Body');

    // adapted (updated?) from
    // http://blog.percolatestudio.com/engineering/the-future-of-javascript-animation-with-famous/
    var PE = new PhysicsEngine();
    var spring = new Spring({anchor:[0,0,0]});

    //var particle = PE.addBody({m:1, p:[0,0,0], v:[0,0,0]});
    //var particle = new Particle();
    //PE.addBody(particle);
    var particle = PE.addBody(new Body());

    PE.attach(spring, particle);
    famousCmp.modifiers.springParticle = particle;
  });

  Template.ifBlock.surfaceOne = function() {
    return Session.get('surfaceOne');
  }

  x = null;
  Template.blockSpring.events({
    'click': function(event, tpl) {
      var particle = famousCmp.dataFromTpl(tpl).modifier;
      x = particle;
      console.log(particle);
      var Force = require('famous/physics/forces/Force');
      var force = new Force({ x: 0, y: 0, z: 0 -0.005 * 100});
      force.isZero = function() { return false; };
      particle.applyForce(force);

    }
  });

  Template.Scrollview.destroyed = function() {
    console.log('Scrollview destroyed', this);
  }
  list = null;
  Template.list.created = function() {
    list = this.__component__;
  }
  Template.list.destroyed = function() {
    console.log('list destroyed', this);
  }
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
