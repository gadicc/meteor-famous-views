UI.registerHelper('famousEach', function () {
  return UI.Component.extend({
    created: famousEachCreated,
    rendered: famousEachRendered,
    destroyed: famousEachDestroyed
  });
});

// todo, store sequence in parent, store startIndex here (to allow surfaces
// before, after, inbetween two eaches, etc)
function famousEachRender(component, template, data) {

  var famousData = component.famousData;
  var sequence = famousData.parent.sequence;
  var indexes = famousData.indexes = {};
  var size = famousData.size;

  if (_.isArray(data)) {

    _.each(data, function(row) {
      var div = document.createElement('div');
      var newComponent = UI.renderWithData(template, row, component);
      UI.insert(newComponent, div);
      sequence.push(new Surface({
        size: size,
        content: div
      }));
    });

  } else if (typeof(data) == 'object') {

    // "data" is a MiniMongo cursor.  TODO, instanceof cursor check.
    famousData.observeHandle = data.observe({
      addedAt: function(document, atIndex, before) {
        // just like https://github.com/meteor/meteor/blob/devel/packages/ui/each.js
        var data = document;
        var dep = new Deps.Dependency;
        var dataFunc = function() {
          dep.depend();
          return data;
        };
        dataFunc.$set = function(v) {
          data = v;
          dep.changed();
        };

        var newComponent = UI.render(template.extend({data: dataFunc}), component);
        indexes[LocalCollection._idStringify(document._id)] = newComponent;

        var div = window.document.createElement('div');
        UI.insert(newComponent, div);
        sequence.splice(atIndex, 0, new Surface({
          size: size,
          content: div
        }));
      },
      changedAt: function(newDocument, oldDocument, atIndex) {
        indexes[LocalCollection._idStringify(newDocument._id)]
          .data.$set(newDocument);
      },
      removedAt: function(oldDocument, atIndex) {
        sequence.splice(atIndex, 1);
      },
      movedTo: function(document, fromIndex, toIndex, before) {
        var item = sequence.splice(fromIndex, 1)[0];
        sequence.splice(toIndex, 0, item);
      }
    });

  } else {

    throw new Error('famousEach data argument must be array or cursor');
  }  
}

function famousEachCreated() {
  console.log('\n[famous] FamousEach component '
    + this.__component__.guid + ' instantiated '
    + (this.data.template
      ? 'to render template "' + this.data.template + '"' 
      : 'inline in template "' + getKind(this.__component__) + '"'));

  var component = this.__component__;
  var famousData = component.famousData = {};

  // famousEach specific: don't create new compView
  var parent = component;
  while ((parent=parent.parent) && !parent.famousView);

  famousData.parent = parent ? parent.famousView : { node: mainCtx };
  famousData.size = floatArray(this.data.size);

  if (this.data.template)
  famousEachRender(component, Template[this.data.template], this.data.data)
}

// Used for {{#famous}}content{{/famous}}
function famousEachRendered() {
  famousEachRender(this.__component__,
    this.__component__.__content, this.data.data);
}

function famousEachDestroyed() {
  var component = this.__component__;
  console.log('[famous] FamousEach component ' + this.__component__.guid + ' destroyed');

  var data = component.famousData
  if (data) {
    if (data.observeHandle)
      observeHandle.stop();
  }
}
