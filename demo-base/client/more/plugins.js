/* Atmosphere integration moved to server/atmosphere.js */

Router.route('plugins', {});

Plugins = new Meteor.Collection("plugins"); // in server/plugin.js
Meteor.subscribe('plugins');

/* Plugin display code */

function zeroPad(num) {
  return ("0" + num).substr(-2);
}

Template.plugins.helpers({
  plugins: function() {
    var options = { sort: {} };
    var sortBy = Session.get('sortBy');
    options.sort[sortBy] = sortBy === 'packageName' ? 1 : -1;
    return Plugins.find({}, options);
  },
  extra: function() { return Template['plugin:'+this.name]; }
});

Template.pluginButtons.helpers({
  sortBy: function(what) { return Session.get('sortBy') === what; }
});

Session.setDefault('sortBy', 'releasedAt');
Template.pluginButtons.events({
  'click button': function(event, tpl) {
    Session.set('sortBy', $(event.target).attr('data-sort'));
  }
});

Template.plugin.helpers({
  releasedAt: function() {
    var d = this.releasedAt;
    return d.getFullYear()+'-'+zeroPad(d.getMonth())+'-'+zeroPad(d.getDate());
  }
});

/* Per plugin JS (sorted alphabetically) */

Template['plugin:pierreeric:fview-animatedicon'].rendered = function() {
  var button = FView.byId('animatedicon'),
      buttonState = true;
  button.children[0].view.on('click', function() {
    button.children[1].view.setShape(Number(buttonState));
    return buttonState = !buttonState;  // jshint ignore:line
  });
};

Template['plugin:pierreeric:bksurfaceimage'].helpers({
  sizeModes: [
    { sizeMode: 'AUTO' },
    { sizeMode: 'FILL' },
    { sizeMode: 'ASPECTFILL' },
    { sizeMode: 'ASPECTFIT' }
  ]
});
