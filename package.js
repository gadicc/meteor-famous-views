Package.describe({
  name: 'gadicohen:famous-views',
  version: '1.0.0-pre.1',
  summary: 'Famous, the Meteor Way (with Reactive Blaze Templates/Views)',
  git: 'https://github.com/gadicc/meteor-famous-views.git'
});

var client = 'client';

function common(api) {
  // Meteor core packages
  api.use(['blaze', 'htmljs', 'ejson'], client);

  // 3rd-party included in core
  api.use(['underscore'], client);

  // Atmosphere
  api.use(['jag:pince@0.0.6'], client)

  // Famous
  api.use('gadicohen:famous@0.5.0', client);


  api.addFiles([
    'lib/globals.js',
    'lib/utilities.js',
    'lib/meteorFamousView.js',
    'lib/wrappers/Scene.js',
    'lib/wrappers/Node.js',
    'lib/wrappers/DOMElement.js'
  ], client);
};

Package.onUse(function(api) {
  api.versionsFrom('1.1.0.2');

  common(api);

  api.export('FView', client);
});

Package.onTest(function(api) {
  api.use('tinytest');
  api.use(['templating', 'random'], client);
  //api.use('gadicohen:famous-views');
  
  common(api);

  api.addFiles([
    'tests/lib/prepare.js',
    'tests/utilities.js',
    'tests/meteorFamousView.js',
    'tests/wrappers/Node.html',
    'tests/wrappers/Node.js',
    'tests/wrappers/DOMElement.html',
    'tests/wrappers/DOMElement.js'
  ], 'client');
});
