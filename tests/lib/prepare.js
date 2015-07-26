noop = function() {};

testDiv = function(id) {
  var div = document.createElement('div');
  div.style.display = 'none';
  if (id) div.id = id;
  document.body.appendChild(div);  
  return div;
}

// Make sure scene stuff doesn't interfere with scrolling
Meteor.startup(function() {
  $('.container-fluid').css('height', '100%').css('overflow', 'auto');
});