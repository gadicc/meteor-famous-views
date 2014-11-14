atmosphere = {
	subs: [],
	col: {}
};
window.atmosphere = atmosphere; // debug

Router.route('plugins', {
	onBeforeAction: function() {
		return; // d'oh, https://github.com/percolatestudio/atmosphere-beta/issues/299
		atmosphere.con = DDP.connect('https://atmospherejs.com/');
		atmosphere.col.daiyscores = new Mongo.Collection('package/dailyScores',
			{ connection: atmosphere.con });
		var names = ['gadicohen:famous-views', 'pierreeric:fview-bksurfaceimage'];
		_.each(names, function(name) {
			atmosphere.subs.push(
				atmosphere.con.subscribe('package/dailyScores', name));
		});
	}
});

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

	data.name = data.name.replace(/fview-(\w+)/,
		'fview-<span class="text-primary">$1</span');

	return Blaze.With(data, function() {
		var newView = Template.plugin_template.constructView();
		if (view.templateElseBlock)
			newView.templateElseBlock = view.templateElseBlock;
		return newView;
	});
}));

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
