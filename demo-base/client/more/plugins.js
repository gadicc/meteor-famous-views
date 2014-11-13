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
		'fview-<span class="pluginNameMain">$1</span');

	return Blaze.With(data, function() {
		var newView = Template.plugin_template.constructView();
		if (view.templateElseBlock)
			newView.templateElseBlock = view.templateElseBlock;
		return newView;
	});
}));