/* Sequencer and childSequence */

sequencer = function() {
  this._sequence = [];
  this._children = [];
}

// push on a sequencer root, not a childSequence
sequencer.prototype.push = function(value) {
	this._sequence.push(value);
}

// create a child sequencer and add it to sequencer root
// note: the child sequencer behaves likes a root sequencer and is chainable
sequencer.prototype.child = function() {
  var child = new childSequence(this);
  this._children.push(child);
  return child;
}

function childSequence(parent, childNo, startIndex) {
    this.parent = parent;
    this.childNo = parent._children.length;
    this.startIndex = parent._sequence.length;
    this._sequence = [];
}

/*
 * 1. Splice into correct position in root sequencer's _sequence
 * 2. Update the startIndex of all siblings born after us
 * 3. Modify our own _sequence
 */
childSequence.prototype.push = function(value) {
  this.parent._sequence.splice(this.startIndex+this._sequence.length, 0, value);
  for (var i=this.childNo+1; i < this.parent._children.length; i++) {
    this.parent._children[i].startIndex++;
  }
  return this._sequence.push(value);
}

// Basically same requirements as above
childSequence.prototype.splice = function(index, howMany /*, arguments */) {
  var diff, max = this._sequence.length - index;
  if (howMany > max) howMany = max;
  diff = (arguments.length - 2) - howMany; // inserts - howMany

  for (var i=this.childNo+1; i < this.parent._children.length; i++)
    this.parent._children[i].startIndex += diff;

  this._sequence.splice.apply(this._sequence, arguments);
  arguments[0] += this.startIndex;  // add startIndex and re-use args  
  return this.parent._sequence.splice.apply(this.parent._sequence, arguments);
}
