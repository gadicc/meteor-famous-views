Menu.add({name:'#14 updateDestroy',route:'issue14'}, 'Issues');

Router.map(function() {
  this.route('issue14');
});

Clienti = new Meteor.Collection(null);

if (Meteor.isClient) {
	Template.issue14.myVariables = function() {
	    return Clienti.find();
	};
	 
	Template.issue14.isDanger = function() {
	    return Meteor.status().connected ? 'btn-danger' : 'btn-primary';
	};
	 
	Template.issue14.dangerText = function() {
	    return Meteor.status().connected ? 'disconnect' : 'reconnect';
	};
	 
	Template.issue14_detailTemplate.events({
	    'click .btn-decrease': function(e, tpl) {
	        e.preventDefault();

	        var fview = FView.fromTemplate(tpl);
	        var data = UI.getElementData(event.target);

	        Clienti.update({_id: data._id}, {$inc: {numar: -1}});
	        
	        // this transition is not working -- template gets destroyed
	        
	        var springTransition = {
	            method: "spring",
	            period: 200,
	            dampingRatio: .5,
	            velocity: 0.01
	        }
	        fview.modifier.setTransform(
	            Transform.translate(0,0),
	            springTransition
	        );
	    },
	    'click .btn-increase': function(e, tpl) {
	        e.preventDefault();
	        var data = UI.getElementData(event.target);
	        Clienti.update({_id: data._id}, {$inc: {numar: 1}});
	    }
	});	
}

if (Clienti.find().count() == 0) {
	for (var i=0; i < 5; i++)
		Clienti.insert({
			numar: Math.round(5 * Math.random())
		});
}
