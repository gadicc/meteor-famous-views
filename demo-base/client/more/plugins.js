/* Atmosphere integration moved to server/atmosphere.js */

Router.route('plugins', {});

// Preload
Packages = new Mongo.Collection('packages');
InstallCounts = new Mongo.Collection('installCounts');
//autopublish
//Meteor.subscribe('packages');
//Meteor.subscribe('installCounts');

/* Plugin display code */

function zeroPad(num) {
  return ("0" + num).substr(-2);
}

Template.plugins.helpers({
  plugins: function() {
    var options = { sort: {} };
    var sortBy = Session.get('sortBy');
    options.sort[sortBy] = sortBy === 'packageName' ? 1 : -1;
    return Plugins.find({}, options);
  },
  extra: function() { return Template['plugin:'+this.name]; }
});

Template.pluginButtons.helpers({
  sortBy: function(what) { return Session.get('sortBy') === what; }
});

Session.setDefault('sortBy', 'releaseDate');
Template.pluginButtons.events({
  'click button': function(event, tpl) {
    Session.set('sortBy', $(event.target).attr('data-sort'));
  }
});

Template.plugin.helpers({
  releasedAt: function() {
    var d = this.releasedAt;
    return d.getFullYear()+'-'+zeroPad(d.getMonth())+'-'+zeroPad(d.getDate());
  }
});

/* Plugin data */

Plugins = new Meteor.Collection(null);

plugins = [
  {
    name: 'oorabona:fview-boxlayout',
    href: 'https://atmospherejs.com/oorabona/fview-boxlayout',
    releasedAt: new Date(2014,11,29),
    image: 'https://github.com/IjzerenHein/famous-boxlayout/raw/master/BoxLayout.png',
    desc: 'Layout-view for quickly setting margins or creating flexible layouts.' +
      '\n\n**demo**: [fview-boxlayout](http://fview-boxlayout.meteor.com/).'
  },
  {
    name: 'mjn:fview-animate',
    href: 'https://atmospherejs.com/mjn/fview-animate',
    releasedAt: new Date(2014,11,19),
    desc: 'Super easy entrance and exit animations.  Just wrap any ' +
      '`{{#Surface}}` with `{{#Animate}}`, even inside a `{{#famousEach}}`, ' +
      'and have their entrance and exits controlled by pre-baked or custom ' +
      'animations.' +
      '\n\n**demo**: [fview-animate](http://meteorpad.com/pad/rXrmAYnMtuP7rnFeD/#Animate).'
  },
  {
    name: 'pierreeric:fview-animatedicon',
    href: 'https://atmospherejs.com/pierreeric/fview-animatedicon',
    releasedAt: new Date(2014,11,13),
    desc: 'This is [@IjzerenHein\'s Animated icon]' +
      '(https://github.com/IjzerenHein/famous-animatedIcon) packaged for ' +
      'famous-views: A handy hamburger menu.'
  },
  {
    name: 'pierreeric:fview-bksurfaceimage',
    href: 'https://atmospherejs.com/pierreeric/fview-bksurfaceimage',
    releasedAt: new Date(2014,11,13),
    desc: 'Adaptive Images!  Need your images to fit how you want them? ' +
      'This is [@IjzerenHein\'s BkSurfaceImage]' +
      '(https://github.com/IjzerenHein/famous-bkimagesurface) packaged for ' +
      'famous-views: BkImageSurface adds support for sizing strategies such ' +
      'as **AspectFit** and **AspectFill** for displaying images with ' +
      'famo.us. It uses a `div` with a background-image rather than a `img` ' +
      'tag.  Can be used as a drop-in replacement for ImageSurface, in case ' +
      'the size of the div is not derived from the image.' +
      '\n\n**demo**: [fview-bksurfaceimage](http://fview-bksurfaceimage.meteor.com/).'
  },
  {
    name: 'pierreeric:fview-devices',
    href: 'https://atmospherejs.com/pierreeric/fview-devices',
    releasedAt: new Date(2014,11,16),
    image: 'https://raw.githubusercontent.com/PEM--/fview-devices/master/private/doc/tablet.png',
    desc: 'Customizable SVG containers creating a `ContainerSurface` for demoing ' +
      'your apps. Available containers are: `{{#desktopSvg}}`, `{{#smartphoneSvg}}` ' +
      'and `{{#tabletSvg}}`.' +
      '\n\n**demo**: [fview-devices](http://fview-devices.meteor.com/).'
  },
  {
    name: 'pierreeric:fview-dotloader',
    href: 'href=https://atmospherejs.com/pierreeric/fview-dotloader',
    releasedAt: new Date(2014,11,14),
    desc: 'This plugin brings an animated loader that could be used when a ' +
      'long task is requested. It is inspired from the work of ' +
      '[LeXXiK](https://github.com/LeXXik) and ' +
      '[Tony Alves](https://github.com/talves) in ' +
      '[Famousco.de](http://famousco.de/2014/07/animated-dots-icon/).'  +
      '\n\n**demo**: [fview-dotloader](http://fview-dotloader.meteor.com).'
  },
  {
    name: 'wenape:fview-infinitescrollview',
    href: 'https://atmospherejs.com/wenape/fview-infinitescrollview',
    releasedAt: new Date(2014,11,23),
    desc: 'Scroll to infinity like a Zen Monk!  This is [JonnyBGod\'s famous-' +
      'infinitescroll](https://github.com/JonnyBGod/famous-infinitescroll) ' +
      'packaged for famous-views.' +
      '\n\n**demo**: [fview-infinitescrollview](http://infinitescroll.meteor.com/).'
  },
  {
    name: 'gadicohen:fview-kenburns',
    href: 'https://atmospherejs.com/gadicohen/fview-kenburns',
    releasedAt: new Date(2014,11,13),
    image: 'https://github.com/IjzerenHein/famous-kenburnscontainer/raw/master/screenshot.gif',
    desc: 'For the photo pro!  Want to zoom and pan your photos like Ken ' +
      'Burns? This is [@IjzerenHein\'s KenBurnsContainer]' +
      '(https://github.com/IjzerenHein/famous-kenburnscontainer) ' +
      'packaged for famous-views.'
  },
  {
    name: 'gadicohen:fview-lagometer',
    href: 'https://atmospherejs.com/gadicohen/fview-lagometer',
    releasedAt: new Date(2014,11,12),
    image: 'https://github.com/IjzerenHein/famous-lagometer/raw/master/lagometer.png',
    desc: 'A developer must!  Want a live FPS count and chart showing ' +
    'computation times?  This is [@IjzerenHein\'s Lagometer]' +
    '(https://github.com/IjzerenHein/famous-lagometer) packaged for ' +
    'famous-views.  You can enable/disable the lagometer with **ALT**+**l** ' +
    '(`l`, for lag).  Starts disabled by default - there when you need it, not in ' +
    'your way otherwise.  This `debugOnly` package is never ' +
    'bundled/deployed to production.'
  },
  {
    name: 'pierreeric:fview-slidedeck',
    releasedAt: new Date(2014,11,15),
    href: 'https://atmospherejs.com/pierreeric/fview-slidedeck',
    desc: 'This plugin brings a slide deck engine. It takes its inspiration ' +
      'on Reveal.js, Bespoke.js and Impress.js. Using Meteor and Famous, it ' +
      'has never been that easy to create imerssive and collaborative slides ' +
      'within minutes or seconds.' +
      '\n\n**demo**: [fview-slidedeck](http://meetupfamousslides.meteor.com/).'
  },
  {
    name: 'pierreeric:fview-flexgrid',
    releasedAt: new Date(2014,11,25),
    href: 'https://atmospherejs.com/pierreeric/fview-flexgrid',
    desc: 'This plugin brings a flexible grid layout adapting the number of ' +
      'cards on each row depending on the size of the container.' +
      '\n\n**demo**: [fview-flexgrid](http://fview-flexgrid.meteor.com).'
  }
];

for (var i=0; i < plugins.length; i++) {
  var data = plugins[i];
  data.authorName = data.name.split(':', 2);
  data.packageName = data.authorName[1];
  data.authorName = data.authorName[0];

  data.prettyName = data.name.replace(/fview-(\w+)/,
  'fview-<span class="text-primary">$1</span');

  /*
  var tpl = Template['plugin:'+data.name];
  if (tpl) data.extra = tpl;
  */

  Plugins.insert(data);
}

function updateByName(name, field, value) {
  for (var i=0; i < plugins.length; i++)
    if (plugins[i].name == name) {
      plugins[i][field] = value;
      break;
    }
}

Packages.find().observeChanges({
  added: function(id, fields) {
    Plugins.update({ name: fields.name }, { $set: { starCount: fields.starCount }});
  }, changed: function(id, fields) {
    Plugins.update({ name: fields.name }, { $set: { starCount: fields.starCount }});
  }
});

InstallCounts.find().observeChanges({
  added: function(id, fields) {
    Plugins.update({ name: fields.name }, { $set: { installCount: fields.count }});
  }, changed: function(id, fields) {
    Plugins.update({ name: fields.name }, { $set: { installCount: fields.count }});
  }
});

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
