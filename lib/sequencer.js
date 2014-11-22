/* Sequencer and childSequence */

sequencer = function(parent) {
  this._sequence = [];
  this._children = [];

  if (parent) {
    this.parent = parent;
    this.childNo = parent._children.length;
    this.startIndex = parent._sequence.length;
  }
};

// TODO, refactor + cleanup for constructor
sequencer.prototype.child = function(index) {
  var child = new sequencer(this);

  if (typeof index !== 'undefined') {
    child.childNo = index;
    child.startIndex = index < this._children.length ?
      this._children[index].startIndex : this._sequence.length;
    // Recall for below loop that child has not been inserted yet
    for (var i=index; i < this._children.length; i++)
      this._children[i].childNo++;
  } else
    index = this._children.length;

  this._children.splice(index, 0, child);
  return child;
};

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
};

sequencer.prototype.splice = function(index, howMany /*, arguments */) {
  if (!this.parent)
    return this._sequence.splice.apply(this._sequence, arguments);

  var diff, max = this._sequence.length - index;
  if (howMany > max) howMany = max;
  diff = (arguments.length - 2) - howMany; // inserts - howMany

  for (var i=this.childNo+1; i < this.parent._children.length; i++)
    this.parent._children[i].startIndex += diff;

  this._sequence.splice.apply(this._sequence, arguments);
  // add startIndex and re-use args
  arguments[0] += this.startIndex;  // jshint ignore:line
  return this.parent.splice.apply(this.parent, arguments);
};

/*
 * Currently we don't keep track of our children and descedent children separately,
 * so grandChild.push(x) && parent.remove(x) would break everything.  That's
 * because x lands up in our top-level list, and there's nothing to stop us
 * from removing it from the wrong place (and breaking all indexes).  Although as
 * long as we don't mistakenly do this in our code, the only way this can happen
 * is if x exists in both the grandParent and grandChild (not supported).
 */
sequencer.prototype.remove = function(value /*, suspectedIndex */) {
  var index;
  for (index=0; index < this._sequence.length; index++)
    if (this._sequence[index] === value)
      return this.splice(index, 1);
};
