Menu.add({name:'FAQ',route:'faq'}, 'More');
Menu.add({name:'Plugins',route:'plugins'}, 'More');
Menu.add({name:'Testimonials',route:'more/testimonials'}, 'More');
Menu.add({name:'GitHub',route:'https://github.com/gadicc/meteor-famous-components'}, 'More');

// Static pages don't need their own JS
Router.route('more_testimonials', {
	path: '/more/testimonials'
});
Router.route('faq');
Router.route('plugins');
