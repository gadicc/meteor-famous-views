Items = new Meteor.Collection('items');
//Items.insert({name: Random.id()});

if (Meteor.isClient) {
  Router.configure({
    layoutTemplate: 'layout',
    yieldTemplates: {
      'header': {to: 'header'}
    }
  });

  Router.map(function() {
    this.route('home', {
      path: '/'
    });
  });

  Template.hello.greeting = function () {
    return "Welcome to famous.";
  };

  Template.hello.events({
    'click input': function () {
      // template data, if any, is available in 'this'
      if (typeof console !== 'undefined')
        console.log("You pressed the button");
    }
  });

  Template.list.items = [
    {_id:1, name:'A'}, {_id:2, name:'B'}
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
