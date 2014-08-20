Menu.add({name:'Events',route:'examples/events'}, 'Examples');

Router.map(function() {
  this.route('examples_events', { path: '/examples/events'});
});

FView.ready(function(require) {
  var SpringTransition = famous.transitions.SpringTransition;
  var Transitionable = famous.transitions.Transitionable;
  Transitionable.registerMethod('spring', SpringTransition);
});

/* ball code */

var springTransition = {
  method: "spring",
  period: 100,
  dampingRatio: .1,
  velocity: 0.01
}

Template.springBall.events({
  'mouseover': function(event, tpl) {
    var fview = FView.fromTemplate(tpl);
    var parentSize = fview.parent.parent.getSize();
    fview.modifier.halt();
    fview.modifier.setTransform(
      famous.core.Transform.translate(
        Math.random()*((parentSize&&parentSize[0]||window.innerWidth)-100),
        Math.random()*(parentSize&&parentSize[1]-100),
        90
      ),
      springTransition
    );
  }
});

Session.setDefault('showCode', false);
UI.registerHelper('showCode', function() {
  return Session.get('showCode');
});
Template.codeButton.events({
  'click button': function() {
    Session.set('showCode', !Session.get('showCode'));
  }
});

Template.eventsDemo.rcSize = function() {
  return [undefined, Session.get('showCode') ? 550 : 200];
}

/* famous events */

Template.ev_surface_click.clickCount = function() {
  return Session.get('clickCount');
}

Session.setDefault('clickCount', 0);

function clickeyStuff(fview) {
  fview.modifier.halt();
  fview.modifier.setTransform(
      Transform.translate(0,0,10),
      { method:"spring", period: 200, dampingRatio: .5, velocity: 0.1 }
  );
  Session.set('clickCount', Session.get('clickCount')+1);
}

/*
Template.ev_surface_click.events({
  'click': function(event, tpl) {
    var fview = FView.fromTemplate(tpl);
    // event.type == "click"
    clickeyStuff(fview);
  }
});
*/

/*
Template.ev_surface_click.famousEvents({
  'click': function(event, fview) {
    // event.type == "click"
    clickeyStuff(fview);
  }
});
*/

Template.ev_surface_click.rendered = function() {
  var fview = FView.fromBlazeView(this.__view__);
  var target = fview.surface;
  target.on('click', function() {
    clickeyStuff(fview);
  });
}
