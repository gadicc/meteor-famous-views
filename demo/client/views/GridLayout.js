// https://github.com/Famous/examples/blob/master/src/examples/views/GridLayout/

Menu.add('GridLayout', 'Views');

Router.map(function() {
  this.route('GridLayout');
});

famousCmp.views.GridLayout = require('famous/views/GridLayout');

Template.GridLayout.items = function() {
  return Items.find({}, {sort: {name: 1}});
}
