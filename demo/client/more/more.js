Menu.add({name:'GitHub',route:'https://github.com/gadicc/meteor-famous-components'}, 'More');
Menu.add({name:'Testimonials',route:'more/testimonials'}, 'More');
Menu.add({name:'FAQ',route:'faq'}, 'More');

// Static pages don't need their own JS
Router.map(function() {
  this.route('more_testimonials', {
  	path: '/more/testimonials'
  });
  this.route('faq', {
  	path: '/faq'
  });
});
