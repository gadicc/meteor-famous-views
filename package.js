var fs = Npm.require('fs');
var path = Npm.require('path');

Package.describe({
  name: "gadicohen:famous-views",
  summary: 'Blaze Views for Famous; doing Famous Meteor-style',
  version: "0.1.16",
  git: "https://github.com/gadicc/meteor-famous-views.git"
});

Package.on_use(function (api) {
  configurePackage(api);
});

Package.on_test(function(api) {
  configurePackage(api, true /* isTesting */);

  api.use('tinytest', 'client');
  api.use('less', 'client');
  api.use('reactive-var', 'client');

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

function configurePackage(api, testing) {
  if (api.versionsFrom) {
    //api.versionsFrom("METEOR@0.9.1.1");
    api.use("jag:pince@0.0.5", 'client');
    api.use(['underscore@1.0.0', 'jquery@1.0.0'], 'client');
    // TODO, deps -> tracker namespace upgrade
    api.use(['blaze@2.0.0', 'templating@1.0.5', 'deps@1.0.2', 'observe-sequence@1.0.2'], 'client');
  } else {
    api.use("pince", 'client');
    api.use(['underscore', 'jquery'], 'client');
    api.use(['blaze', 'templating', 'deps', 'observe-sequence'], 'client');
  }

  if (api.versionsFrom) {
    if (testing)
      api.use('mjn:famous', 'client');
    else if (packageUsed('mjn:famous'))
      api.use('mjn:famous', 'client' /*, { weak: true } */);
    else if (packageUsed('raix:famono')) {
      // File isn't scanned properly on a weak dep
      api.use('raix:famono@0.7.4', 'client');
      // Line below means we get to load sooner but code will be sent twice
      // https://github.com/raix/Meteor-famono/issues/41#issuecomment-54081868
      // api.add_files('lib/smart.require', 'client');
    }
//    api.use('iron:router@0.9.3', 'client', { weak: true });
  } else {
    // https://github.com/meteor/meteor/issues/1358
    if (packageUsed('famono'))
      api.use('famono', 'client');
    if (packageUsed('mj-famous'))
      api.use('mj-famous', 'client', { weak: true });
    if (packageUsed('famous-compiled'))
      api.use('famous-compiled', 'client', { weak: true });    
//    if (packageUsed('iron-router'))
//      api.use('iron-router', 'client', { weak: true });    
  }

  api.add_files(
    [
      'lib/famous-views.js',
      'lib/meteorFamousView.js',
      'lib/sequencer.js',
      'lib/famous.js',
      'lib/famousEach.js',
      'lib/famousIf.js',
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

      'lib/context/FamousContext.html',
      'lib/context/FamousContext.js'
    ],
    'client'
  );

  api.export(['famousCmp', 'FView'], 'client');
}

// Thanks to Arunoda as usual :)
// https://github.com/arunoda/meteor-fast-render/blob/master/package.js

// tiny mod to only read list once
var meteorPackages = meteorRoot() // meteorRoot() is null on 0.9.0 during meteor publish
  && fs.readFileSync(path.join(meteorRoot(), '.meteor', 'packages'), 'utf8');
  
/*
 * We need to cover
 *
 * 1) Starting inside Meteor (everything works how we expect)
 * 2) Inside Famono parser (weird dir?)
 * 3) While publishing
*/
function packageUsed(package) {
  /* Famono parser.  This hack relies on the fact that famono doesn't provide
   * the new camel case Package.onUse.  meteorPackages won't be set inside parser
   * or during publish */
  if (!meteorPackages && !Package.onUse)
    return true;

  return meteorPackages && !!meteorPackages.match(new RegExp(package));
}

function isAppDir(filepath) {
  try {
    return fs.statSync(path.join(filepath, '.meteor', 'packages')).isFile();
  } catch (e) {
    return false;
  }
}

function meteorRoot() {
  var currentDir = process.cwd();
  while (currentDir) {
    var newDir = path.dirname(currentDir);

    if (isAppDir(currentDir)) {
      break;
    } else if (newDir === currentDir) {
      return null;
    } else {
      currentDir = newDir;
    }
  }

  return currentDir;
}
