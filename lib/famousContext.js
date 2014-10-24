Template.famousContext
	= Template.FamousContext
	= new Template('Template.FamousContext', function() {
	  var blazeView = this;

		var children = [];
		var sequence = [];

		// Since all Surfaces are created in a .created callback, the expect to find a fview field on some parent.
		// Fake here one, and later link to real Context
		Blaze.getView().fview = {
			sequence : sequence,
			children : children
		};

		var templateContentBlock = this.templateContentBlock;

		blazeView.onViewReady(function () {
			var firstNode = $(this.templateInstance().firstNode);
			var parent = firstNode.parent();

			var context = famous.core.Engine.createContext(parent[0]);

			_.each(children, function (c) {
				context.add(c);
			});
		});

		return Blaze.View('famousContext', function () {
			return templateContentBlock;
		})
	});
