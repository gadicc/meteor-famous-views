Package.describe({
  name: 'gadicohen:famous-views',
  version: '1.1.0',
  summary: 'Famous, the Meteor Way (with Reactive Blaze Templates/Views)',
  git: 'https://github.com/gadicc/meteor-famous-views.git'
});

var client = 'client';

function common(api) {
  // Meteor core packages
  api.use(['blaze', 'htmljs', 'ejson', 'tracker', 'observe-sequence'], client);

  // 3rd-party included in core
  api.use(['underscore'], client);

  // Atmosphere
  api.use([
    'jag:pince@0.0.6',
    'pierreeric:cssc@1.0.4'
  ], client)

  // Famous
  api.use('gadicohen:famous@0.5.2', client);

  api.addFiles([
    'lib/famous-views.js',
    'lib/utilities.js',
    'lib/meteorFamousView.js',
    'lib/defer.js',
    'lib/famousEach.js',

    'lib/wrappers/wrap.js',
    'lib/wrappers/Nodes.js',
    'lib/wrappers/Components.js',
    'lib/wrappers/Nodes/Scene.js',
    'lib/wrappers/Nodes/Node.js',
    'lib/wrappers/Components/DOMElement.js',
    'lib/wrappers/Components/Camera.js',
    'lib/wrappers/Components/Mesh.js',
    'lib/wrappers/Components/PointLight.js',

    'lib/meteor/setimmediate.js',
    'lib/meteor/timers.js',
    'lib/meteor/tracker.js',

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
  api.use(['templating', 'random', 'reactive-var', 'mongo'], client);
  //api.use('gadicohen:famous-views');
  
  common(api);

  api.addFiles([
    'tests/lib/prepare.js',
    'tests/utilities.js',
    'tests/meteorFamousView.js',
    'tests/wrappers/wrap.html',
    'tests/wrappers/wrap.js',
    'tests/wrappers/Scene.html',
    'tests/wrappers/Scene.js',
    'tests/wrappers/Node.html',
    'tests/wrappers/Node.js',
    'tests/wrappers/DOMElement.html',
    'tests/wrappers/DOMElement.js',
    'tests/famousEach.html',
    'tests/famousEach.js',
  ], 'client');
});
