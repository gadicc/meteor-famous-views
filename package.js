var fs = Npm.require('fs');
var path = Npm.require('path');

Package.describe({
  summary: 'Blaze Views for Famous; doing Famous Meteor-style',
  version: "0.0.24",
  git: "https://github.com/gadicc/meteor-famous-components.git"
});

Package.on_use(function (api) {
  if (api.versionsFrom) {
    api.versionsFrom("METEOR@0.9.0");
    api.use("jag:pince@0.0.5", 'client');
  } else {
    api.use("pince", 'client');
  }

	api.use(['underscore', 'jquery'], 'client');
  api.use(['ui', 'blaze', 'minimongo', 'templating', 'deps', 'observe-sequence'], 'client');

  if (api.versionsFrom) {
      api.use('mjnetworks:mj-famous@0.2.1-1', 'client', { weak: true });
      api.use('jonperl:famous-compiled@0.2.0', 'client', { weak: true });
      api.use('iron:router@0.9.1', 'client', { weak: true });
      if (packageUsed('raix:famono')) {
        // File isn't scanned properly on a weak dep
        api.use('raix:famono@0.7.4', 'client');
        // Line below means we get to load sooner but code will be sent twice
        // https://github.com/raix/Meteor-famono/issues/41#issuecomment-54081868
        // api.add_files('lib/smart.require', 'client');
      }
  } else {
    // https://github.com/meteor/meteor/issues/1358
    if (packageUsed('famono'))
      api.use('famono', 'client');
    if (packageUsed('mj-famous'))
      api.use('mj-famous', 'client', { weak: true });
    if (packageUsed('famous-compiled'))
      api.use('famous-compiled', 'client', { weak: true });    
    if (packageUsed('iron-router'))
      api.use('iron-router', 'client', { weak: true });    
  }
 
  api.add_files(
  	[
  		'lib/famous-views.js',
      'lib/meteorFamousView.js',
      'lib/sequencer.js',
      'lib/famous.js',
      'lib/famousEach.js',
      'lib/modifiers.js',
      'lib/views.js'
  	],
  	'client'
  );

  api.add_files(
    [
      'lib/views/_simple.js',
      'lib/views/EdgeSwapper.js',
      'lib/views/Flipper.js',
      'lib/views/HeaderFooterLayout.js',
      'lib/views/RenderController.js',
      'lib/views/Scrollview.js',
      'lib/views/Surface.js'
    ],
    'client'
  );

  api.export(['famousCmp', 'FView'], 'client');
});


// Thanks to Arunoda as usual :)
// https://github.com/arunoda/meteor-fast-render/blob/master/package.js

// meteorRoot() is null on 0.9.0 during meteor publish
if (meteorRoot()) {
  // tiny mod to only read list once
  var meteorPackages = fs.readFileSync(path.join(meteorRoot(), '.meteor', 'packages'), 'utf8');
  function packageUsed(package) {
    if (!meteorPackages) return true; // for inside famono parser
    return !!meteorPackages.match(new RegExp(package));
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
}
