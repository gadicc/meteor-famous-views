Router.map(function() {
  this.route('eventsDemo', { path: '/events'});
});

famousCmp.ready(function(require) {
  var SpringTransition = famous.transitions.SpringTransition;
  var Transitionable = famous.transitions.Transitionable;
  Transitionable.registerMethod('spring', SpringTransition);
});

var springTransition = {
  method: "spring",
  period: 100,
  dampingRatio: .1,
  velocity: 0.005
}

Template.springBall.events({
  'mouseover': function(event, tpl) {
    var famousData = famousCmp.dataFromTpl(tpl);
    famousData.modifier.halt();
    famousData.modifier.setTransform(
      famous.core.Transform.translate(
        Math.random()*(window.innerWidth/2),
        Math.random()*(window.innerHeight/2)
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
