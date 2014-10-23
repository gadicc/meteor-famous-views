Menu.add({name:'#24 nestedScrolls',route:'issue24'}, 'Issues');

Router.map(function() {
  this.route('issue24');
});

Template.issue24.items = function() {
	return Items.find().fetch();
}