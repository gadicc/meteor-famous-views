Menu.add({name:'FAQ',route:'faq'}, 'More');
Menu.add({name:'Gitter Chat',route:'https://gitter.im/gadicc/meteor-famous-views'}, 'More');
Menu.add({name:'Plugins',route:'plugins'}, 'More');
Menu.add({name:'GitHub',route:'https://github.com/gadicc/meteor-famous-components'}, 'More');
Menu.add({name:'Changelog',route:'https://github.com/gadicc/meteor-famous-views/blob/master/History.md'}, 'More');
Menu.add({name:'Testimonials',route:'more/testimonials'}, 'More');
Menu.add({name:'Performance',route:'performance'}, 'More');

// Static pages don't need their own JS

Router.route('more_testimonials', {
  path: '/more/testimonials'
});

Router.route('faq');

Router.route('performance');