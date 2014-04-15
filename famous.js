Items = new Meteor.Collection('items');
//Items.insert({name: Random.id()});

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
    this.route('home', {
      path: '/'
    });

    this.route('Scrollview');
  });

  Template.list.items = [
    {_id:1, name:'A'}, {_id:2, name:'B'}, {_id:1, name:'C'}, {_id:2, name:'D'},
  ];
  /*
  Template.list.data = function() {
    return Items.find();
  }
  */
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
