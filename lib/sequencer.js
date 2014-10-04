/* Sequencer and childSequence */

sequencer = function(parent) {
  this._sequence = [];
  this._children = [];

  if (parent) {
    this.parent = parent;
    this.childNo = parent._children.length;
    this.startIndex = parent._sequence.length;
  }
}

sequencer.prototype.child = function() {
  var child = new sequencer(this);
  this._children.push(child);
  return child;
}

/*
 * For both functions below:
 * 
 *   1. Splice into correct position in parent sequencer's _sequence
 *   2. Update the startIndex of all siblings born after us
 *   3. Modify our own _sequence
 */

sequencer.prototype.push = function(value) {
  if (this.parent) {
    this.parent.splice(this.startIndex+this._sequence.length, 0, value);
    for (var i=this.childNo+1; i < this.parent._children.length; i++) {
      this.parent._children[i].startIndex++;
    }
  }
  return this._sequence.push(value);
}

sequencer.prototype.splice = function(index, howMany /*, arguments */) {
  if (!this.parent)
    return this._sequence.splice.apply(this._sequence, arguments);

  var diff, max = this._sequence.length - index;
  if (howMany > max) howMany = max;
  diff = (arguments.length - 2) - howMany; // inserts - howMany

  for (var i=this.childNo+1; i < this.parent._children.length; i++)
    this.parent._children[i].startIndex += diff;

  this._sequence.splice.apply(this._sequence, arguments);
  arguments[0] += this.startIndex;  // add startIndex and re-use args
  return this.parent.splice.apply(this.parent, arguments);
}

/*
 * Currently we don't keep track of our children and descedent children separately,
 * so grandChild.push(x) && parent.remove(x) would break everything :)
 */
sequencer.prototype.remove = function(value /*, suspectedIndex */) {
  var index;
  for (index=0; index < this._sequence.length; index++)
    if (this._sequence[index] === value) 
      return this.splice(index, 1);
}
