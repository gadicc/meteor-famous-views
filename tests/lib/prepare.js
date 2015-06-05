commonDiv = null;
Meteor.startup(function() {
  commonDiv = document.createElement('div');
  commonDiv.style.display = 'none';
  document.body.appendChild(commonDiv);
});

noop = function() {};