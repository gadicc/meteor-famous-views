function famousEachRender(component, template, data) {
  var famousData = component.famousData;
  var sequence = famousData.sequence;
  var children = famousData.children = [];
  var size = famousData.size;

  if (_.isArray(data)) {

    _.each(data, function(row) {
      var div = document.createElement('div');
      div.style.width='100%'; div.style.height='100%';

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

        var extend = {
          data: dataFunc,
          famousView: new CompView(null, {}, true)
        };
        if (famousData.parent.pipeChildrenTo)
          extend.famousView.pipeChildrenTo
            = famousData.parent.pipeChildrenTo;

        var newComponent = UI.render(template.extend(extend), component);
        newComponent.famousView.component = newComponent;

        children.splice(atIndex, 0, newComponent);
        sequence.splice(atIndex, 0, newComponent.famousView);

        // force materialization of child templates... better way?
        var div = window.document.createElement('div');
        UI.insert(newComponent, div);
      },
      changedAt: function(newDocument, oldDocument, atIndex) {
        children[atIndex].data.$set(newDocument);
      },
      removedAt: function(oldDocument, atIndex) {
        children.splice(atIndex, 1);
        sequence.splice(atIndex, 1);
      },
      movedTo: function(document, fromIndex, toIndex, before) {
        var item = sequence.splice(fromIndex, 1)[0];
        sequence.splice(toIndex, 0, item);

        item = children.splice(fromIndex, 1)[0];
        children.splice(toIndex, 0, item);
      }
    });

  } else {

    throw new Error('famousEach data argument must be array or cursor');
  }  
}

function famousEachCreated() {
  log.debug('FamousEach component '
    + this.__component__.guid + ' instantiated in template "'
    + getKind(this.__component__) + '"');

  var component = this.__component__;
  var famousData = component.famousData = {};

  // famousEach specific: don't create new compView
  var parent = component;
  while ((parent=parent.parent) && !parent.famousView);

  famousData.parent = parent ? parent.famousView : { node: mainCtx };
  famousData.sequence = famousData.parent.sequencer.child();
}

// Used for {{#famous}}content{{/famous}}
function famousEachRendered() {
  famousEachRender(this.__component__,
    this.__component__.__content, this.data);
}

function famousEachDestroyed() {
  var component = this.__component__;
  log.debug('FamousEach component ' + this.__component__.guid + ' destroyed');

  var data = component.famousData;
  if (data) {
    if (data.observeHandle)
      observeHandle.stop();
  }
}

/*
// Keep this at the bottom; Firefox doesn't do function hoisting
UI.registerHelper('famousEach', function () {
  return UI.Component.extend({
    created: famousEachCreated,
    rendered: famousEachRendered,
    destroyed: famousEachDestroyed
  });
});
*/

Template.famousEach.created = famousEachCreated;
Template.famousEach.rendered = famousEachRendered;
Template.famousEach.destroyed = famousEachDestroyed;
