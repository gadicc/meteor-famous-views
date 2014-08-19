var fs = Npm.require('fs');
var path = Npm.require('path');

Package.describe({
    summary: 'Blaze Components for Famous; doing Famous Meteor-style'
});

Package.on_use(function (api) {
	api.use(['underscore', 'jquery'], 'client');
  api.use(['ui', 'blaze', 'minimongo', 'templating', 'deps', 'observe-sequence'], 'client');
	api.use('pince', 'client');

  // https://github.com/meteor/meteor/issues/1358
  if (packageUsed('famono'))
    api.use('famono', 'client', { weak: true });
  if (packageUsed('mj-famous'))
    api.use('mj-famous', 'client', { weak: true });
  if (packageUsed('famous-compiled'))
    api.use('famous-compiled', 'client', { weak: true });
 
  api.add_files(
  	[
  		'lib/famous-components.js',
      'lib/compView.js',
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
