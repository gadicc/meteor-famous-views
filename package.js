Package.describe({
  name: "gadicohen:famous-views",
  summary: 'Blaze Views for Famous; doing Famous Meteor-style',
  version: "0.1.19",
  git: "https://github.com/gadicc/meteor-famous-views.git"
});

function configurePackage(api, testing) {
  // Core Dependencies
  api.use(['underscore@1.0.0', 'jquery@1.0.0'], 'client');
  api.use(
    [
      'blaze@2.0.0',
      'templating@1.0.5',
      'tracker@1.0.2',
      'observe-sequence@1.0.2'
    ],
    'client'
  );

  // Community Packages
  api.use("jag:pince@0.0.5", 'client');

  api.add_files(
    [
      'lib/famous-views.js',
      'lib/meteorFamousView.js',
      'lib/sequencer.js',
      'lib/famous.js',
      'lib/famousEach.js',
      'lib/famousIf.js',
      'lib/famousContext.js',
      'lib/modifiers.js',
      'lib/views.js'
    ],
    'client'
  );

  api.add_files(
    [
      'lib/views/_simple.js',
      'lib/views/ContainerSurface.js',
      'lib/views/EdgeSwapper.js',
      'lib/views/Flipper.js',
      'lib/views/HeaderFooterLayout.js',
      'lib/views/RenderController.js',
      'lib/views/Scrollview.js',
      'lib/views/Surface.js',
    ],
    'client'
  );

  api.export('FView', 'client');
}

Package.on_use(function (api) {
  configurePackage(api);

  // Famous Providers
  api.use('mjn:famous@0.3.0_5', 'client', { weak: true });
  api.use('raix:famono@0.9.14', { weak: true });

  /*
   * This lets us access Famono stuff before Meteor.startup(), but also
   * results in all the deps being sent down the wire twice.  Need to work
   * something out with Famono.  Note, only works without { weak: true }
   */
  // api.add_files('lib/smart.require', 'client');
});

Package.on_test(function(api) {
  configurePackage(api, true /* isTesting */);

  api.use('tinytest', 'client');
  api.use('less', 'client');
  api.use('reactive-var', 'client');

  // Strong dependency; force testing platform to install this
  api.use('mjn:famous@0.3.0_5', 'client');

  api.add_files([
    'tests/TestStyles.less',
    'tests/TestUtils.js',
    'tests/sequencer.js',
    'tests/famous.html',
    'tests/famous.js',

    'tests/surface/AttrClassTests.html',
    'tests/surface/AttrClassTests.js',

    'tests/surface/AttrSizeTests.html',
    'tests/surface/AttrSizeTests.js',

    'tests/surface/AttrPropertiesTests.html',
    'tests/surface/AttrPropertiesTests.js',

    'tests/context/FamousContextTests.html',
    'tests/context/FamousContextTests.js'
  ], 'client');
});
