Menu.add({name:'Flipper',route:'views/Flipper'}, 'Views');

Router.map(function() {
  this.route('views_Flipper', {
    path: '/views/Flipper'
  });
});

function flipSurface(event, fview) {
  fview.parent.view.flip({ curve : 'easeOutBounce', duration : 500});
}
Template.flipper_front.famousEvents({ 'click': flipSurface });
Template.flipper_back.famousEvents({ 'click': flipSurface });
