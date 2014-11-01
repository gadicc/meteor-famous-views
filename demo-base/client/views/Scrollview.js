// https://github.com/Famous/examples/blob/master/src/examples/views/Scrollview/example.js

Menu.add({name:'Scrollview',route:'views/Scrollview'}, 'Views');

Router.map(function() {
  this.route('views_Scrollview', {
  	path: '/views/Scrollview'
  });
});

Template.views_Scrollview.helpers({
	items: Template.list.items = function() {
	  //return [{_id:1, name:'A'}, {_id:2, name:'B'}, {_id:1, name:'C'}, {_id:2, name:'D'}];
	  //return Items.find();
	  return Items.find({}, { sort: { name: 1 }});
	}
});

Template.moo.created = function() { console.log('created'); }
Template.moo.destroyed = function() { console.log('destroyed'); }
