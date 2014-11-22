# Contributing
:warning: This documentation section is work in progress. :warning:

## Description
**famous-views** merges Meteor's Blaze approach with Famo.us, a library for layouting and animating visual components on screens.

### Naming convention
All plugins for **famous-views** have their name starts with `fview-` following with an unique name. If your plugin is intended to be used as a template name in Blaze or Jade, the convention is to use the template name in lower case.

**Ex.**:
* `fview-dotloader`: `dotLoader` is the template name.
* `fview-slidedeck`: There is no template associated: the name is free.

### Logging
`FView.log` provide an export of **jag:pince**'s logging package. This allows plugin users to set logs such as:
* `FView.log.debug('my log')`
* `FView.log.info('my log')`
* `FView.log.warn('my log')`
* `FView.log.error('my log')`

> Within **famous-views** package, `FView.log` is set as a global variable `log`.

### Create the plugin
What you need before starting:
* A Github account.
* A Meteor account.

Perform the following steps:
* Create a github repository with the name of your plugin: `fview-blablabla`.
* Create the plugin using Meteor's CLI:
```bash
meteor create --package fview-blablabla
cd fview-blablabla
```
* Create a simple README.md that will be used by your users to understand how your plugin is working.
```bash
touch README.md
```
* Initialize Git.
```bash
git init
git remote add origin https://github.com/YOUR_GITHUB_LOGIN/fview-blablabla.git
```
* Modify your `package.js` to add the name of the package on Atmosphere, a simple summary, a version number which we recommend to be 0.1.0 at start and the Github repository that you've just created. We also use this step to provide the necessary packages for your plugin:
```javascript
Package.describe({
  name: 'YOUR_METEOR_LOGIN:fview-blablabla',
  summary: 'A lorem ipsum plugin for famous-views',
  version: '0.1.0',
  git: 'https://github.com/YOUR_GITHUB_LOGIN/fview-blablabla.git'
});
Package.onUse(function(api) {
  api.versionsFrom('1.0');
  // Both famo.us packages generally used in the Meteor community are
  // included as weak references.
  api.use('mjn:famous@0.3.1_2', 'client', { weak: true });
  api.use('raix:famono@0.9.19', { weak: true });
  // famous-views is integrated a mandatory reference.
  api.use([
    'gadicohen:famous-views@0.1.27'
    ], 'client');
    api.addFiles([
      'fview-blablabla.js'
    ], 'client');
});
```
* Create an empty test project.
```bash
meteor create example
cd example
mkdir packages
cd packages
ln -s ../../../fview-blablabla
```
* Include your package in your example app as it was a regular package. We also use this step to include the necessary packages:
```bash
cd ..
meteor add gadicohen:famous-views raix:famono YOUR_METEOR_LOGIN:fview-blablabla
```
* In the former step, we have used `raix:famono` to import famo.us. It comes out of the box with a configuration that request the last release of famo.us as well as some other helpers. This package is also able to grab other web packages as well. You could also use `mnj:famous`. If you have chosen, `raix:famono`, you can tweak its behavior by modifying the `lib/smart.require` file. Here is a default one:
```json
{
  "famous": {
      "git": "https://github.com/Famous/famous.git",
      "branch": "v0.3.1",
      "root": "src"
  },
  "famous.polyfills": {
      "git": "https://github.com/Famous/polyfills.git"
  }
}
```

* If you have chosen `raix:famono`, note that there is one extra step to perform. This package only import what you are using in your apps by analysing your code and performing all the `define` and `require` for you. To orient `raix:famono` just add the following code in your example app, as stated in our [Quickstart guide](http://famous-views.meteor.com/start):
```javascript
Transform = null;
FView.ready(function() {
  Transform = famous.core.Transform;
  // Famono: load famo.us shims and CSS
  famous.polyfills;
  famous.core.famous; // CSS
});
```

Now, you are ready to make the best plugin ever.

### Some use cases
TODO Explain best practices for:
* importing a community package from Github using submodules.
* creating your own famous component
* creating a component that requires a Blaze or a Jade template

### Publishing
Now that your package is ready and tested. It is time to publish it. Here are the necessary steps:

* Set all your files to be saved in Git:
```bash
# Provides the name of all the files that needs to be added to Git.
# This also lets you review what you will publish.
git status
# Add them in one command if everything is fine.
git add *
```

* Now that your files are marked for addition to Git, commit them with a clean message:
```bash
git commit -am 'Initial commit: 0.1.0 release'
```

* Your local Git should be fine, now, push it to Github:
```bash
git push -u origin master
```
  > For the next commit, just use `git push` as the origin is now set.

* Now that your code is visible as a Github repository, integrate it to Atmosphere, making it available for the Meteor community:
```bash
meteor publish --create
```
  > For your next plugin version, just use `meteor publish` as your package is now known by Atmosphere.
  
* **Make a good case**! For making your plugin visible on [**famous-view** demo site](http://famous-views.meteor.com/plugins), create a little demonstration and make a PR on the [Github repository](http://famous-views.meteor.com/plugins).

## Setting up a project for hacking famous-views
TODO Explain the best practices

## Source tree
* `lib/famous-views.js`: Starts the package.

TODO Some file restructuring should be done for a clearer code structure.

## Tests
While displaying the demo and hacking on **famous-views** code, it is recommended to launch
the unit tests as regression checks.
```bash
meteor --port 2500 test-packages ./
```

Now you can check the test results in your browser at [http://localhost:2500](http://localhost:2500).
