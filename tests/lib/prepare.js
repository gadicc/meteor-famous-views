noop = function() {};

testDiv = function(id) {
  var div = document.createElement('div');
  div.style.display = 'none';
  if (id) div.id = id;
  document.body.appendChild(div);  
  return div;
}
