createTestDIV = function (dim) {
  check(dim, [Number]);
  var div = $('<div style="width:' + dim[0] + 'px;height:' + dim[1] + 'px; background-color:#eeeeee; margin: 10px; float: left"></div>')[0];
  document.body.appendChild(div);
  return div;
};