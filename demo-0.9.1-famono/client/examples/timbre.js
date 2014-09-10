Menu.add({name:'Timbre Menu',route:'examples/timbre'}, 'Examples');

Router.map(function() {
  this.route('timbre', { path: '/examples/timbre' });
});

Session.set('menuOpen', false);

// Translation for "main" page, depending on whether menu is open or not
Template.timbre.menuTranslate = function() {
  return Session.get('menuOpen') ? [300,0,20] : [0,0,20];
}

// Set the transition to be used when translate= changes reactively
Template.timbre_main.rendered = function() {
  FView.from(this).modifierTransition = { curve: 'easeOut', duration: 500 };
}

// On click, toggle the menuOpen state / reactive Session variable
Template.timbre_main.famousEvents({
  'click': function(event, tpl) {
    Session.set('menuOpen', !Session.get('menuOpen'));
  }
});

// Simple queue.  Push functions which will get run and removed every 100ms
var queue = [];
Meteor.setInterval(function() {
  if (queue.length)
    queue.shift()();
}, 100);

Deps.autorun(function() {
  if (Session.get('menuOpen'))
    _.each(FView.byId('timbre-menu').children, function(strip) {
      // Move the strips out of sight immediately
      strip.modifier.setTransform(Transform.translate(-500,85));

      // And queue them to stagger in back to their original position
      queue.push(function() {
        strip.modifier.setTransform(Transform.translate(0,0),
          { duration: 500, curve: 'easeOut' });
      });
    });
});
