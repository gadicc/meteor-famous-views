/* Atmosphere integration */

Packages = new Mongo.Collection('packages');
InstallCounts = new Mongo.Collection('installCounts');

// comment out if working on this
if (process.env.NODE_ENV === 'development') return;

Packages.remove({});
InstallCounts.remove({});

atmosphere = {
  subs: [],
  cols: {}
};

atmosphere.con = DDP.connect('https://atmospherejs.com/');

atmosphere.cols.packages = new Mongo.Collection('packages',
  { connection: atmosphere.con });

atmosphere.cols.installCounts = new Mongo.Collection('installCounts',
  { connection: atmosphere.con });

atmosphere.subs.push(atmosphere.con.subscribe('packages/search', 'fview-', 20));

/*
    _.each(_.pluck(plugins, 'name'), function(name) {
      atmosphere.subs.push(
        atmosphere.con.subscribe('package/installs', name));
    });
*/

atmosphere.cols.packages.find().observeChanges({
  added: function(id, fields) {
    Packages.insert(_.extend(fields, { _id: id }));
    atmosphere.con.subscribe('package/installs', fields.name);
  },
  changed: function(id, fields) { Packages.update(id, { $set: fields }); },
  removed: function(id) {
    Packages.remove(id);
    // TODO, could index and remove names that are removed
  }
});
atmosphere.cols.installCounts.find().observeChanges({
  added: function(id, fields) { InstallCounts.insert(_.extend(fields, { _id: id })); },
  changed: function(id, fields) { InstallCounts.update(id, { $set: fields }); },
  removed: function(id) { InstallCounts.remove(id); }
});

//autopublish
//Meteor.publish('packages', function() { return Packages.find(); });
//Meteor.publish('installCounts', function() { return InstallCounts.find(); });
