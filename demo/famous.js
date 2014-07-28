if (Meteor.isClient) {
  Items = new Meteor.Collection(null);

  _.each([
    { name: 'Apple', type: 'fruit', picUrl: 'http://cdn.oxwordsblog.wpfuel.co.uk/wpcms/wp-content/uploads/apple-e1382039006457.jpg' },
    { name: 'Banana', type: 'fruit', picUrl: 'http://statfaking2.firstpost.in/wp-content/uploads/2014/01/Banana.jpeg' },
    { name: 'Cupcake', type: 'android', picUrl: 'http://www.sellmymobile.com/blog/wp-content/uploads/2011/03/ANdroid-Cupcake.gif' },
    { name: 'Donut', type: 'android', picUrl: 'http://img1.wikia.nocookie.net/__cb20130520200422/logopedia/images/c/c5/Android-1_6-donut.jpg'},
    { name: 'Eclair', type: 'android', picUrl: 'http://www.teleread.com/wp-content/uploads/2012/10/Android-Eclair.png'},
    { name: 'Froyo', type: 'android', picUrl: 'http://www.androidcentral.com/sites/androidcentral.com/files/articleimage/684/2010/07/froyo-android.png'},
    { name: 'Gingerbread', type: 'android', picUrl: 'http://4.bp.blogspot.com/-bEV5FOGSm1A/Unp5OqUrchI/AAAAAAAAAJY/WGa-VRiFjQk/s1600/Gingerbread.png'},
    { name: 'Honeycomb', type: 'android', picUrl: 'http://www.intomobile.com/wp-content/uploads/2010/11/Android-Honeycomb-Yellow-660x7591.jpg'},
    { name: 'Ice Cream', type: 'android', picUrl: 'http://pic.youmobile.org/img/Android-Ice-Cream-Sandwich-logo-588x394.jpg'},
    { name: 'Jelly Bean', type: 'android', picUrl: 'http://www.extremetech.com/wp-content/uploads/2012/06/android-jelly-bean-logo1.jpg'},
    { name: 'Kit Kat', type: 'android', picUrl: 'http://www.android.com/kitkat/images/android.png'},
  ], function(item) {
    Items.insert(item);
  });

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
    yieldTemplates: {
      'header': {to: 'header'}
    }
  });

  // haha, for CDN loads :)
  if (typeof(dontSetLayoutYet) === 'undefined')
    Router.configure({
      layoutTemplate: 'layout'
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

  // famous globals for APP code
  Transform=null;
  famousCmp.ready(function(require) {
    Transform        = famous.core.Transform;
  });

  // within the demo app, but famous-components will use this global too
  if (Package['famous-compiled']) {
    famous = {
      core: Famous.Core,
      events: Famous.Events,
      inputs: Famous.Inputs,
      math: Famous.Math,
      modifiers: Famous.Modifiers,
      physics: Famous.Physics,
      surfaces: Famous.Surfaces,
      transitions: Famous.Transitions,
      utilities: Famous.Utilities,
      views: Famous.Views,
      widgets: Famous.Widgets
    }
  }

  Template.header.menu = function(issues) {
    var out = [];
    for (cat in Menu.list) {
      if (!issues && cat != 'Issues' || issues && cat == 'Issues')
      out.push({ cat: cat, items: Menu.list[cat] });
    }
    return out;
  };

  Template.yieldMain.getTransition = function() {
    var useForPages = Session.get('transitionPages');
    return useForPages ? Session.get('currentTransition') : 'opacity';
  }

}
