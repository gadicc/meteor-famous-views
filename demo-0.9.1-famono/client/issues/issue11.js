Menu.add({name:'#11 MultiScroll',route:'issue11'}, 'Issues');

Router.map(function() {
  this.route('issue11');
});

Template.issue11.items = function() { return Items.find(); }
