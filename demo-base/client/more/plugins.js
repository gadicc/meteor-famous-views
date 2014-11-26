/* Atmosphere integration */

atmosphere = {
  subs: [],
  cols: {}
};

Router.route('plugins', {
  onBeforeAction: function() {
    atmosphere.con = DDP.connect('https://atmospherejs.com/');

    if (!atmosphere.cols.packages)
      atmosphere.cols.packages = new Mongo.Collection('packages',
        { connection: atmosphere.con });
    atmosphere.subs.push(atmosphere.con.subscribe('packages/search', 'fview-', 20));

    if (!atmosphere.cols.installCounts)
      atmosphere.cols.installCounts = new Mongo.Collection('installCounts',
        { connection: atmosphere.con });
    _.each(_.pluck(plugins, 'name'), function(name) {
      atmosphere.subs.push(
        atmosphere.con.subscribe('package/installs', name));
    });

    this.next();
  },
  onStop: function() {
    while (atmosphere.subs.length)
      atmosphere.subs.shift().stop();
  }
});

/* Plugin display code */

Template.plugins.helpers({
  plugins: function() { return plugins; }
});

Blaze.registerHelper('plugin', new Blaze.Template(function() {
  var view = this;

  if (!view.templateContentBlock) {
    return Template.plugin_template;
  }

  var content = Blaze._toText(view.templateContentBlock, HTML.TEXTMODE.STRING);

  // Remove initial newlines and initial indent
  content = content.replace(/^\n*/, '');
  var initialIndent = content.match(/^([\t ]*)/);
  content = content.replace(new RegExp('^' + initialIndent[0], 'gm'), '');

  var match, data={}, re=/^([A-Za-z]+)=(.*)$/gm, last;
  while((match = re.exec(content)) !== null) {
    data[match[1]] = match[2];
    last = match;
  }
  data.desc = content.substr(last.index + last[0].length + 1 /* \n */);

  data.authorName = data.name.split(':', 2);
  data.packageName = data.authorName[1];
  data.authorName = data.authorName[0];

  data.prettyName = data.name.replace(/fview-(\w+)/,
    'fview-<span class="text-primary">$1</span');

  return Blaze.With(data, function() {
    var newView = Template.plugin_template.constructView();
    if (view.templateElseBlock)
      newView.templateElseBlock = view.templateElseBlock;
    return newView;
  });
}));

Template.plugin_template.helpers({
  starCount: function() {
    var doc = atmosphere.cols.packages.findOne(
      { authorName: this.authorName, baseName: this.packageName });
    return doc && doc.starCount;
  },
  installCount: function() {
    var doc = atmosphere.cols.installCounts.findOne({ name: this.name });
    return doc && doc.count;
  }
});

/* Plugin data */

var plugins = [
  {
    name: 'mjn:fview-animate',
    href: 'https://atmospherejs.com/mjn/fview-animate',
    desc: 'Super easy entrance and exit animations.  Just wrap any ' +
      '`{{#Surface}}` with `{{#Animate}}`, even inside a `{{#famousEach}}`, ' +
      'and have their entrance and exits controlled by pre-baked or custom ' +
      'animations.'
  },
  {
    name: 'pierreeric:fview-animatedicon',
    href: 'https://atmospherejs.com/pierreeric/fview-animatedicon',
    desc: 'This is [@IjzerenHein\'s Animated icon]' +
      '(https://github.com/IjzerenHein/famous-animatedIcon) packaged for ' +
      'famous-views: A handy hamburger menu.'
  },
  {
    name: 'pierreeric:fview-bksurfaceimage',
    href: 'https://atmospherejs.com/pierreeric/fview-bksurfaceimage',
    desc: 'Adaptive Images!  Need your images to fit how you want them? ' +
      'This is [@IjzerenHein\'s BkSurfaceImage]' +
      '(https://github.com/IjzerenHein/famous-bkimagesurface) packaged for ' +
      'famous-views: BkImageSurface adds support for sizing strategies such ' +
      'as **AspectFit** and **AspectFill** for displaying images with ' +
      'famo.us. It uses a `div` with a background-image rather than a `img` ' +
      'tag.  Can be used as a drop-in replacement for ImageSurface, in case ' +
      'the size of the div is not derived from the image.'
  },
  {
    name: 'pierreeric:fview-devices',
    href: 'https://atmospherejs.com/pierreeric/fview-devices',
    image: 'https://raw.githubusercontent.com/PEM--/fview-devices/master/private/doc/tablet.png',

  },
  {
    name: 'pierreeric:fview-dotloader',
    href: 'href=https://atmospherejs.com/pierreeric/fview-dotloader',
    desc: 'This plugin brings an animated loader that could be used when a ' +
      'long task is requested. It is inspired from the work of ' +
      '[LeXXiK](https://github.com/LeXXik) and ' +
      '[Tony Alves](https://github.com/talves) in ' +
      '[Famousco.de](http://famousco.de/2014/07/animated-dots-icon/).'
  },
  {
    name: 'wenape:fview-infinitescrollview',
    href: 'https://atmospherejs.com/wenape/fview-infinitescrollview',
    desc: 'Scroll to infinity like a Zen Monk!  This is [JonnyBGod\'s famous-' +
      'infinitescroll](https://github.com/JonnyBGod/famous-infinitescroll) ' +
      'packaged for famous-views.'
  },
  {
    name: 'gadicohen:fview-kenburns',
    href: 'https://atmospherejs.com/gadicohen/fview-kenburns',
    image: 'https://github.com/IjzerenHein/famous-kenburnscontainer/raw/master/screenshot.gif',
    desc: 'For the photo pro!  Want to zoom and pan your photos like Ken ' +
      'Burns? This is [@IjzerenHein\'s KenBurnsContainer]' +
      '(https://github.com/IjzerenHein/famous-kenburnscontainer) ' +
      'packaged for famous-views.'
  },
  {
    name: 'gadicohen:fview-lagometer',
    href: 'https://atmospherejs.com/gadicohen/fview-lagometer',
    image: 'https://github.com/IjzerenHein/famous-lagometer/raw/master/lagometer.png',
    desc: 'A developer must!  Want a live FPS count and chart showing ' +
    'computation times?  This is [@IjzerenHein\'s Lagometer]' +
    '(https://github.com/IjzerenHein/famous-lagometer) packaged for ' +
    'famous-views.  You can enable/disable the lagometer with ALT-L (for ' +
    'lag).  Starts disabled by default - there when you need it, not in ' +
    'your way otherwise.  This `debugOnly` package is never ' +
    'bundled/deployed to production'
  },
  {
    name: 'pierreeric:fview-slidedeck',
    href: 'https://atmospherejs.com/pierreeric/fview-slidedeck',
    desc: 'This plugin brings a slide deck engine. It takes its inspiration ' +
      'on Reveal.js, Bespoke.js and Impress.js. Using Meteor and Famous, it ' +
      'has never been that easy to create imerssive and collaborative slides ' +
      'within minutes or seconds.'
  }
];

for (var i=0; i < plugins.length; i++) {
  var data = plugins[i];
  data.authorName = data.name.split(':', 2);
  data.packageName = data.authorName[1];
  data.authorName = data.authorName[0];

  data.prettyName = data.name.replace(/fview-(\w+)/,
  'fview-<span class="text-primary">$1</span');

  var tpl = Template['plugin:'+data.name];
  if (tpl) tpl.extra = tpl;
}

/* Per plugin JS (sorted alphabetically) */

Template['plugin:pierreeric:fview-animatedicon'].rendered = function() {
  var button = FView.byId('animatedicon'),
      buttonState = true;
  button.children[0].view.on('click', function() {
    button.children[1].view.setShape(Number(buttonState));
    return buttonState = !buttonState;
  });
};

Template['plugin:pierreeric:bksurfaceimage'].helpers({
  sizeModes: [
    { sizeMode: 'AUTO' },
    { sizeMode: 'FILL' },
    { sizeMode: 'ASPECTFILL' },
    { sizeMode: 'ASPECTFIT' }
  ]
});
