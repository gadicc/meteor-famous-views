Tinytest.add('famous-views - sequencer', function(test) {

	var parent = new sequencer();

	parent.push('p1');
	parent.push('p2');

	test.equal(parent._sequence, ['p1','p2']);

	// Child starts after p3
	var child = parent.child();

	parent.push('p3');  // child is empty, no difference in parent
	test.equal(parent._sequence, ['p1','p2','p3']);

	child.push('c1');	  // child's first el, should appear after "p2"
	test.equal(parent._sequence, ['p1','p2','c1','p3']);

	// grandChild starts after c1
	var grandChild = child.child();

	grandChild.push('g1');
	test.equal(child._sequence, ['c1', 'g1']);
	test.equal(parent._sequence, ['p1','p2', 'c1', 'g1', 'p3']);

	child.push('c2');
	test.equal(child._sequence, ['c1', 'g1', 'c2']);
	test.equal(parent._sequence, ['p1','p2', 'c1', 'g1', 'c2', 'p3']);

	grandChild.push('g2');
	test.equal(child._sequence, ['c1', 'g1', 'g2', 'c2']);
	test.equal(parent._sequence, ['p1','p2', 'c1', 'g1', 'g2', 'c2', 'p3']);

	/* splice tests (beyond what was already tested above since push uses splice) */

	grandChild.splice(1, 1);
	test.equal(grandChild._sequence, ['g1']);
	test.equal(child._sequence, ['c1', 'g1', 'c2']);
	test.equal(parent._sequence, ['p1', 'p2', 'c1', 'g1', 'c2', 'p3']);

	parent = new sequencer();
	parent.splice(0, 0, 'p1');
	child = parent.child();
	child.splice(0, 0, 'c1');
	test.equal(parent._sequence, ['p1', 'c1']);
});
