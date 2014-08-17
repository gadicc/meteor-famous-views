Menu.add({name:'Iron Router',route:'features/iron-router'}, 'Features');
Menu.add({name:'Reactivity',route:'features/reactivity'}, 'Features');

// Static pages don't need their own JS
Router.map(function() {
  this.route('features_ironRouter', {
  	path: '/features/iron-router'
  });
});
