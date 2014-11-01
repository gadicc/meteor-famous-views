Menu.add({name:'#110 modifier view',route:'issues/110'}, 'Issues');

Router.map(function() {
  this.route('issue110', { path: 'issues/110' } );
});

FView.attrEvalAllowedKeys = '*';

Template.issue110.getSize = function() {
	return Session.get('getSize') || [undefined,160];
}
