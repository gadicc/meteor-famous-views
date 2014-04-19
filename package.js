Package.describe({
    summary: 'Blaze Components for Famous; doing Famous Meteor-style'
});

Package.on_use(function (api) {
	api.use(['underscore', 'ui', 'minimongo'], 'client');
	api.use(['famono'], 'client');

  api.add_files(
  	[
  		'lib/famous-components.js',
      'lib/famous.js',
      'lib/famousEach.js',
      'lib/modifiers.js'
  	],
  	'client'
  );

  api.export('famousCmp', 'client');
});
