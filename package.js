Package.describe({
    summary: 'Blaze Components for Famous; doing Famous Meteor-style'
});

Package.on_use(function (api) {
	api.use(['ui', 'templating', 'famono', 'underscore'], 'client');
  api.add_files(['famous-components.html', 'famous-components.js'], 'client');
  api.export('famousCmp', 'client');
});
