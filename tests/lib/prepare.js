noop = function() {};

testDiv = function() {
  var div = document.createElement('div');
  div.style.display = 'none';
  document.body.appendChild(div);  
  return div;
}
