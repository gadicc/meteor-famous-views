Package.describe({
  name: 'gadicohen:famous-views',
  version: '1.0.0-pre.6',
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
  api.use([
    'jag:pince@0.0.6',
    'pierreeric:cssc@1.0.4'
  ], client)

  // Famous
  api.use('gadicohen:famous@0.5.0_4', client);

  api.addFiles([
    'lib/famous-views.js',
    'lib/utilities.js',
    'lib/meteorFamousView.js',
    'lib/wrap.js',
    'lib/wrappers/Scene.js',
    'lib/wrappers/Node.js',
    'lib/wrappers/DOMElement.js',
    'lib/wrappers/Camera.js',
    'lib/wrappers/Mesh.js',
    'lib/wrappers/PointLight.js',
    'lib/init.js'
  ], client);
};

Package.onUse(function(api) {
  api.versionsFrom('1.1.0.2');

  common(api);

  api.export('FView', client);
});

Package.onTest(function(api) {
  api.use('tinytest');
  api.use(['templating', 'random', 'reactive-var'], client);
  //api.use('gadicohen:famous-views');
  
  common(api);

  api.addFiles([
    'tests/lib/prepare.js',
    'tests/utilities.js',
    'tests/meteorFamousView.js',
    'tests/wrappers/Scene.html',
    'tests/wrappers/Scene.js',
    'tests/wrappers/Node.html',
    'tests/wrappers/Node.js',
    'tests/wrappers/DOMElement.html',
    'tests/wrappers/DOMElement.js'
  ], 'client');
});
