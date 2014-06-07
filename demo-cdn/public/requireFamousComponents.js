define(function(require) {
	/* App-level requires go in here.  This is useful just for the demo which
	 * needs to accomodate 4 different ways of including Famous.  For a real CDN
	 * and RequireJS setup, you'd set up your require's as usual (i.e. in a
	 * very un-Meteor way :)).
	 */

	// from lib/views/RenderController.js
	require('famous/views/RenderController');

	// from lib/views/GridLayout.js
	require('famous/views/GridLayout');
	require('famous/surfaces/ContainerSurface');

	// from lib/views/RenderController.js
	require('famous/views/RenderController');

	// from famous.js (in root demo dir)
	require('famous/transitions/SpringTransition');
});
