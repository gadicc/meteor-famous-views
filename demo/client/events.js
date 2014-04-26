Router.map(function() {
  this.route('eventsDemo', { path: '/events'});
});

var springTransition = {
  method: "spring",
  period: 100,
  dampingRatio: .1,
  velocity: 0.005
}

Session.setDefault('showCode', false);
UI.registerHelper('showCode', function() {
  return Session.get('showCode');
});
Template.codeButton.events({
  'click button': function() {
    Session.set('showCode', !Session.get('showCode'));
  }
});

Template.springBall.events({
  'mouseover': function(event, tpl) {
    var famousComp = famousCmp.dataFromTpl(tpl);
    famousComp.modifier.halt();
    famousComp.modifier.setTransform(
      Transform.translate(
        Math.random()*(window.innerWidth/2),
        Math.random()*(window.innerHeight/2)
      ),
      springTransition
    );
  }
});
