atmosphere = {
  subs: [],
  cols: {}
};
window.atmosphere = atmosphere; // debug

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
    _.each(pluginNames, function(name) {
      atmosphere.subs.push(
        atmosphere.con.subscribe('package/installs', name));
    });
  },
  onStop: function() {
    while (atmosphere.subs.length)
      atmosphere.subs.shift().stop();
  }
});

var pluginNames = [
  'gadicohen:fview-kenburns',
  'gadicohen:fview-lagometer',
  'pierreeric:fview-animatedicon',
  'pierreeric:fview-devices',
  'pierreeric:fview-bksurfaceimage',
  'pierreeric:fview-dotloader',
  'pierreeric:fview-slidedeck',
];


Blaze.registerHelper('plugin', new Blaze.Template(function() {
  var view = this;

  if (!view.templateContentBlock)
    return 'No content';

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
  data.desc = marked(data.desc);

  data.nameOrig = data.name;
  data.authorName = data.name.split(':', 2);
  data.packageName = data.authorName[1];
  data.authorName = data.authorName[0];

  data.name = data.name.replace(/fview-(\w+)/,
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
    var doc = atmosphere.cols.installCounts.findOne({ name: this.nameOrig });
    return doc && doc.count;
  }
});

Template.plugins.helpers({
  sizeModes: [
    { sizeMode: 'AUTO' },
    { sizeMode: 'FILL' },
    { sizeMode: 'ASPECTFILL' },
    { sizeMode: 'ASPECTFIT' }
  ]
});

Template.plugins.rendered = function() {
  var button = FView.byId('animatedicon'),
      buttonState = true;
  button.children[0].view.on('click', function() {
    button.children[1].view.setShape(Number(buttonState));
    return buttonState = !buttonState;
  });
};
