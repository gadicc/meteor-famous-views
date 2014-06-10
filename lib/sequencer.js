/* Sequencer and childSequence */

sequencer = function() {
  this.sequence = [];
  this.children = [];
}

sequencer.prototype.child = function() {
  var child = new childSequence(this);
  this.children.push(child);
  return child;
}

function childSequence(parent, childNo, startIndex) {
    this.parent = parent;
    this.childNo = parent.children.length;
    this.startIndex = parent.sequence.length;
    this.sequence = [];
}

childSequence.prototype.push = function(value) {
  this.parent.sequence.splice(this.startIndex+this.sequence.length-1, 0, value);
  for (var i=this.childNo+1; i < this.parent.children.length; i++) {
    this.parent.children[i].startIndex++;
  }
  return this.sequence.push(value);
}

childSequence.prototype.splice = function(index, howMany /*, arguments */) {
  var diff, max = this.sequence.length - index;
  if (howMany > max) howMany = max;
  diff = (arguments.length - 2) - howMany; // inserts - howMany

  for (var i=this.childNo+1; i < this.parent.children.length; i++)
    this.parent.children[i].startIndex += diff;

  this.sequence.splice.apply(this.sequence, arguments);
  arguments[0] += this.startIndex;  // add startIndex and re-use args  
  return this.parent.sequence.splice.apply(this.parent.sequence, arguments);
}