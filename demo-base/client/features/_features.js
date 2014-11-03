Menu.add({name:'Iron Router',route:'features/iron-router'}, 'Features');
Menu.add({name:'Reactivity',route:'features/reactivity'}, 'Features');
Menu.add({name:'API Docs',route:'features/api'}, 'Features');

// Static pages don't need their own JS
Router.route('features_ironRouter', { path: '/features/iron-router' });
Router.route('features_api', { path: '/features/api' });
