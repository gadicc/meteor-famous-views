function CrazyIn(duration, curve) {
  return function (modifier, done) {

    modifier.setAlign([0.5, 0.5]);
    modifier.setOrigin([0.5, 0.5]);

    var originalSize = modifier.getSize();

    modifier.setTransform(
      famous.core.Transform.multiply(
        famous.core.Transform.rotate(0, 0, -Math.PI),
        famous.core.Transform.scale(0.5, 0.5)
      )
    );

    modifier.setTransform(
      famous.core.Transform.multiply(famous.core.Transform.rotate(0, 0, 0), famous.core.Transform.scale(1, 1)),
      {duration: duration, curve: curve},
      done
    );
  }
}

function CrazyOut(duration1, duration2, curve) {
  return function (modifier, done) {
    modifier.setOpacity(0, {duration: duration1, curve: curve});

    modifier.setTransform(
      famous.core.Transform.multiply(
        famous.core.Transform.rotate(0, 0, -Math.PI),
        famous.core.Transform.scale(0.1, 0.1)
      ),
      {duration: duration2, curve: curve}, done
    );
  }
}

FView.registerTransition('out:crazy.fast', CrazyOut(500, 500, 'easeOut'));
FView.registerTransition('in:crazy.fast', CrazyIn(500, 'easeOut'));

var Letters = new Meteor.Collection(null);

function randomColumn() {
  var COLORS = [];
  var i;
  for (i = 0; i <= 255; i++) {
    COLORS[i] = i;
  }
  var ABC = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  return {
    name: Random.choice(ABC),
    bg: 'rgb(' + Random.choice(COLORS) + ',' + Random.choice(COLORS) + ',' + Random.choice(COLORS) + ')'
  }
}

Letters.insert(randomColumn());
Letters.insert(randomColumn());
Letters.insert(randomColumn());

Meteor.setInterval(function () {
  var all = Letters.find({}).fetch();

  // insert/remove with 50% distribution
  if ( (all.length < 8 && Random.choice([0,1]) === 1) || (all.length <= 2)) {
    Letters.insert(randomColumn());
  }
  else {
    // remove one randomly
    if (all.length > 0) {
      Letters.remove(Random.choice(all)._id);
    }
  }
}, 2000);

Template['plugin:mjn:fview-animate'].helpers({
  letters : function () {
    return Letters.find({});
  },

  letterStyle: function () {
    var data = Blaze.getData();

    return {
      border: '1px solid black',
      backgroundColor: data.bg
    };
  }
});