createTestDIV = function (dim, test) {
  check(dim, [Number]);

  var testDIV = $('<div class="test-container"></div>')[0];
  document.body.appendChild(testDIV);

  if (test && test.test_case && test.test_case.name) {
    testDIV.appendChild($('<div class="test-name" style="width:' + dim[0] + '">'+test.test_case.name+'</div>')[0]);
  }

  var contentDIV = $('<div class="test-content" style="width:' + dim[0] + 'px;height:' + dim[1] + 'px"></div>')[0];
  testDIV.appendChild(contentDIV);

  return contentDIV;
};