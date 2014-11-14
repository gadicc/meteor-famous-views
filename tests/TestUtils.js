createTestDIV = function (dim, test) {
  check(dim, [Number]);

  var testDIV = $('<div class="test-container"></div>')[0];
  document.body.appendChild(testDIV);

  if (test && test.test_case && test.test_case.name) {
    testDIV.appendChild($('<div class="test-name" style="width:' + dim[0] + '">'
    	+ test.test_case.name.substr(8) /* strip "Famous - " */ + '</div>')[0]);
  }

  var contentDIV = $('<div class="test-content" style="width:' + dim[0] + 'px;height:' + dim[1] + 'px"></div>')[0];
  testDIV.appendChild(contentDIV);

  return contentDIV;
};

FView.mainCtx = null;

// Make sure we can see our tests :)
Meteor.startup(function() {
	window.setTimeout(function() {
		$('html').removeClass('famous-root');
		$('body').removeClass('famous-root');
	}, 3000);
});
