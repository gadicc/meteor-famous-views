
Session.setDefault('name', 'Gadi');
Session.setDefault('size', 'A:15,R:10,D:5');
Session.setDefault('rotation', [0,1]);

Items = new Mongo.Collection(null);
Items.insert({name: 'a'});
Items.insert({name: 'b'});
Items.insert({name: 'c'});

Template.body.helpers({
  poo: function() {
    console.log(this);
    console.log(FView.current());
    console.log(FV(Blaze.currentView));
    return '__FVIEW_SKIP__';
  },
  x: function() {
    return Session.get('x');
  },
  items: function() {
    return Items.find();
  },
  staticRotation: {
    value1: [ 0, 0 ],
    value2: [ 0, Math.PI*2 ],
    transition: { duration: 2000 },
    _loopFromBeginning: true
  },
  /*
  name: function() {
    console.log('nameHelper');
//    FView.current().updateSizeDeferred();
    return Session.get('name');
  },
  */
  getRotation: function() {
    return Session.get('rotation');
  },
  getSize: function() {
    return Session.get('size');
  },
  geta: function() {
    return Session.set('a');
  },
  onRender: function() {
//    console.log('or', this);
  //  console.log(FView.current());
    var fview = FView.current();
    console.log(fview);
    var clock = famous.core.FamousEngine.getClock();
    clock.setInterval(function() {
          var time = clock.getTime();

          fview.node.setRotation(
              time / 1500,
              time / 1200,
              time / 1300
          );

      }, 16);

//    fview.position = new famous.components.Position(fview.node);
//    fview.position.set(150, 150, 0, { duration: 1000, method: 'spring' });

  }
});

Template.tplX.events({
  'click': function(event, tpl) {
    console.log(FView.current());
    console.log(FView.from(tpl));
  }
});

Template.tplX.helpers({
  'yo': function() {
    console.log(this);
    return 'yo';
  }
});
