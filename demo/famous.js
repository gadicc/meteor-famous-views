Items = new Meteor.Collection('items');
if (Meteor.isServer) {

  if (Items.find().count() == 0)
    _.each([
      { name: 'Apple', type: 'fruit', picUrl: 'http://metrouk2.files.wordpress.com/2012/08/article-1344003042762-145d45c2000005dc-485035_466x376.jpg' },
      { name: 'Banana', type: 'fruit', picUrl: 'http://statfaking2.firstpost.in/wp-content/uploads/2014/01/Banana.jpeg' },
      { name: 'Cupcake', type: 'android', picUrl: 'http://www.sellmymobile.com/blog/wp-content/uploads/2011/03/ANdroid-Cupcake.gif' },
      { name: 'Donut', type: 'android', picUrl: 'http://img1.wikia.nocookie.net/__cb20130520200422/logopedia/images/c/c5/Android-1_6-donut.jpg'},
      { name: 'Eclair', type: 'android', picUrl: 'http://www.telecoms.com/files/2009/11/eclair.jpg'},
      { name: 'Froyo', type: 'android', picUrl: 'http://www.androidcentral.com/sites/androidcentral.com/files/articleimage/684/2010/07/froyo-android.png'},
      { name: 'Gingerbread', type: 'android', picUrl: 'http://4.bp.blogspot.com/-bEV5FOGSm1A/Unp5OqUrchI/AAAAAAAAAJY/WGa-VRiFjQk/s1600/Gingerbread.png'},
      { name: 'Honeycomb', type: 'android', picUrl: 'http://mandal.com/wp-content/uploads/2011/01/honeycomb-bee-550x550-540x540.png'},
      { name: 'Ice Cream', type: 'android', picUrl: 'http://pic.youmobile.org/img/Android-Ice-Cream-Sandwich-logo-588x394.jpg'},
      { name: 'Jelly Bean', type: 'android', picUrl: 'http://www.extremetech.com/wp-content/uploads/2012/06/android-jelly-bean-logo1.jpg'},
      { name: 'Kit Kat', type: 'android', picUrl: 'http://www.android.com/kitkat/images/android.png'},
    ], function(item) {
      Items.insert(item);
    });

  var x = Items.findOne({picUrl: 'http://www.telecoms.com/files/2009/11/eclair.jpg'});
  if (x) Items.update(x._id, { $set: { picUrl: 'http://www.teleread.com/wp-content/uploads/2012/10/Android-Eclair.png' }});
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
  });

  /*
  UI.registerHelper('items', function() {
    return Items.find();
  });
*/

  UI.registerHelper('dstache', function() {
    return '{{';
  });

  Template.ifBlock.surfaceOne = function() {
    return Session.get('surfaceOne');
  }

  Transform=null, Transitionable=null;
  Meteor.startup(function() {
    Transform        = require('famous/core/Transform');
    Transitionable   = require("famous/transitions/Transitionable");

    var SpringTransition = require("famous/transitions/SpringTransition");
    Transitionable.registerMethod('spring', SpringTransition);
  });

  Template.header.menu = function(issues) {
    var out = [];
    for (cat in Menu.list) {
      if (!issues && cat != 'Issues' || issues && cat == 'Issues')
      out.push({ cat: cat, items: Menu.list[cat] });
    }
    return out;
  };

  /*
  Template._yieldMain.rendered = function() {
    var famousData = famousCmp.dataFromTpl(this);
    famousData.viewNode.inTransformFrom(function(progress) {
        return Transform.translate(window.innerWidth * (1.0 - progress), 0, 0);
    });
    famousData.viewNode.outTransformFrom(function(progress) {
        return Transform.translate(window.innerWidth * progress - window.innerWidth, 0, 0);
    });
  }
  */

}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
