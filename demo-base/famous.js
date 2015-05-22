if (Meteor.isServer) {
  Meteor.publish('starsAndInstalls', function() {
    return Atmosphere.Packages.find(
      { name: 'gadicohen:famous-views' },
      { fields: { name: 1, starCount: 1, 'installs-per-year': 1 } }
    );
  });
}

if (Meteor.isClient) {
  Template.registerHelper('isDev', Injected.obj('server').NODE_ENV === 'development');

  Items = new Meteor.Collection(null);

  _.each([
    { name: 'Apple', type: 'fruit', picUrl: 'http://cdn.oxwordsblog.wpfuel.co.uk/wpcms/wp-content/uploads/apple-e1382039006457.jpg' },
    { name: 'Banana', type: 'fruit', picUrl: 'http://statfaking2.firstpost.in/wp-content/uploads/2014/01/Banana.jpeg' },
    { name: 'Cupcake', type: 'android', picUrl: 'http://www.sellmymobile.com/blog/wp-content/uploads/2011/03/ANdroid-Cupcake.gif' },
    { name: 'Donut', type: 'android', picUrl: 'http://img1.wikia.nocookie.net/__cb20130520200422/logopedia/images/c/c5/Android-1_6-donut.jpg'},
    { name: 'Eclair', type: 'android', picUrl: 'http://telecoms.com/wp-content/blogs.dir/1/files/2009/11/eclair.jpg'},
    { name: 'Froyo', type: 'android', picUrl: 'http://www.androidcentral.com/sites/androidcentral.com/files/articleimage/684/2010/07/froyo-android.png'},
    { name: 'Gingerbread', type: 'android', picUrl: 'http://4.bp.blogspot.com/-bEV5FOGSm1A/Unp5OqUrchI/AAAAAAAAAJY/WGa-VRiFjQk/s1600/Gingerbread.png'},
    { name: 'Honeycomb', type: 'android', picUrl: 'http://www.androidheadlines.com/wp-content/uploads/2011/01/honeycomb-bee-550x550-540x540.png'},
    { name: 'Ice Cream', type: 'android', picUrl: 'http://pic.youmobile.org/img/Android-Ice-Cream-Sandwich-logo-588x394.jpg'},
    { name: 'Jelly Bean', type: 'android', picUrl: 'http://www.extremetech.com/wp-content/uploads/2012/06/android-jelly-bean-logo1.jpg'},
    { name: 'Kit Kat', type: 'android', picUrl: 'http://www.android.com/kitkat/images/android.png'},
  ], function(item) {
    Items.insert(item);
    new Image().src = item.picUrl; // preload
  });

  Meteor.subscribe('starsAndInstalls');
  AtmospherePackages = new Mongo.Collection('AtmospherePackages');

  // Force debug logging even on production for famous-views.meteor.com
  Logger.setLevel('famous-views', 'debug');

  navbar = null;
  Template.header.rendered = function() {
    navbar = this.$('.navbar');
    navbarActive(Router.current().path);
  };
  var navbarActive = function(path) {
    if (!navbar) return;
    if (this.path) path = this.path;
    navbar.find('li.active').removeClass('active');
    navbar.find('a.active').removeClass('active');  // brand-header
    navbar.find('a[href="'+path+'"]').parent().addClass('active');
    navbar.find('a[href="'+path+'"]').addClass('active');  // brand-header
  };

  Router.configure({
    onAfterAction: navbarActive,
    notFoundTemplate: 'notFound',
    trackPageView: true,
    yieldTemplates: {
      'header': {to: 'header'}
    }
  });
  Router.setTemplateNameConverter(_.identity);

  // haha, for CDN loads :)
  if (typeof(dontSetLayoutYet) === 'undefined')
    Router.configure({
      layoutTemplate: 'layout'
    });

  Router.route('home', { path: '/' });

  /*
  UI.registerHelper('items', function() {
    return Items.find();
  });
*/

  UI.registerHelper('dstache', function() {
    return '{{';
  });

  // famous globals for APP code
  Transform=null;
  FView.ready(function(require) {
    Transform        = famous.core.Transform;

    // Famono: load famo.us shims and CSS
    famous.polyfills; // jshint ignore:line
    famous.core.famous; // jshint ignore:line
  });

  Template.header.helpers({
    menu: function(issues) {
      var out = [];
      _.each(['Features', 'Views', 'Examples', 'Issues', 'Support', 'Forums', 'More'], function(cat) {
        if (cat === 'Support')
          out.push({ cat: 'Support', route: '/support', name: 'Support' });
        else if (cat === 'Forums')
          out.push({ cat: 'Forums', route: 'http://forums.famous-views.org/', name: 'Forums' });
        else if (!(cat === 'Issues' && Injected.obj('server').NODE_ENV !== 'development'))
          out.push({ cat: cat, items: Menu.list[cat] });
      });
      return out;
    }
  });

  Template.home.helpers({
    my: function() {
      var me = AtmospherePackages.findOne({name:'gadicohen:famous-views'});
      return me ? {
        stars: numeral(me.starCount).format('0,0'),
        installs: numeral(me['installs-per-year']).format('0,0')
      } : {};
    }
  });

  Template.layout.helpers({
    getTransition: function() {
      var useForPages = Session.get('transitionPages');
      return useForPages ? Session.get('currentTransition') : 'opacity';
    }
  });
}
