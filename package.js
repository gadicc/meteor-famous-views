Package.describe({
    summary: 'Blaze Components for Famous; doing Famous Meteor-style'
});

Package.on_use(function (api) {
	api.use(['underscore', 'ui', 'minimongo', 'templating'], 'client');
	api.use(['pince', 'famono'], 'client');

  api.add_files(
  	[
  		'lib/famous-components.js',
      'lib/famous.html',
      'lib/famous.js',
      'lib/famousEach.js',
      'lib/famousEachSurface.js',
      'lib/modifiers.js',
      'lib/views/RenderController.js'
  	],
  	'client'
  );

  api.export('famousCmp', 'client');
});
