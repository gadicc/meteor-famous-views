/* Atmosphere integration */

Atmosphere = {
  MIN_INTERVAL: undefined,  // at most, a gap of...  TODO
  MAX_INTERVAL: 3600 * 10   // at least, once every 10 mins
};

Atmosphere.Packages = new Mongo.Collection("AtmospherePackages");

/*
 * By default, don't retrieve updates in devel environment.
 * Override with Atmosphere.disableUpdates = false;
 */
Atmosphere.disableUpdates = process.env.NODE_ENV === 'development';

/*
Sample object got from the response (thanks @splendido)
{
  "installs-per-year": 385,
  "latestVersion": {
    "published": {
      "$date": 1422485989711
    },
    "version": "1.6.1",
    "git": "https://github.com/meteor-useraccounts/core.git",
    "description": "Meteor sign up and sign in templates core package.",
    "readme": "https://warehouse.meteor.com/readme/u8BPj5eWZzHQiFM6q/1422485987517/AnhA9SZLf3/useraccounts:core-1.6.1-readme.md",
    "unmigrated": false
  },
  "name": "useraccounts:core",
  "score": 1.7110424750212552,
  "starCount": 35
}
*/

Atmosphere.updatePackages = function() {
  console.log(new Date(), 'update');

  var packages = Atmosphere.pkgList;
  if (!packages)
    packages = _.pluck(this.Packages.find().fetch(), 'name');
  else if (typeof packages === 'function')
    packages = packages();

  // thanks @splendido
  HTTP.get(
    "https://atmospherejs.com/a/packages/findByNames?names="+packages.join(","),
    { headers: {'Accept': 'application/json'} },
    function(error, response) {
      if (error) {
        console.warn('Atmosphere retrieve error', error);
      } else {
        _.each(response.data, function(pkg) {
          Atmosphere.Packages.upsert({name: pkg.name}, pkg);
        });
        // TODO, removed packages?
      }
    }
  );
};

Meteor.startup(function() {
  if (Atmosphere.disableUpdates)
    return;

  Atmosphere.updatePackages();
  Meteor.setInterval(Atmosphere.updatePackages, Atmosphere.MAX_INTERVAL);
});
