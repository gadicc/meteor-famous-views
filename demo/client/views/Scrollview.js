// https://github.com/Famous/examples/blob/master/src/examples/views/Scrollview/example.js

Menu.add('Scrollview', 'Views');

Router.map(function() {
  this.route('Scrollview');
});

Template.Scrollview.items = Template.list.items = function() {
  //return [{_id:1, name:'A'}, {_id:2, name:'B'}, {_id:1, name:'C'}, {_id:2, name:'D'}];
  return Items.find();
}
