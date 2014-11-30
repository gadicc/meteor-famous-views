// Flag for inserting CSS rules only if at least one context is declared.
var isFamousContextDeclared = false;

var famousContext = new Template('famousContext', function () {
  // Only inject CSS rules if a famousContext is created
  if (!isFamousContextDeclared) {
    var css = new CSSC();
    css.add('div.fview-context', {
      webkitTransformStyle: 'preserve-3d',
      transformStyle: 'preserve-3d',
      webkitBackfaceVisibility: 'visible',
      backfaceVisibility: 'visible',
      pointerEvents: 'none',
      position: 'relative',
      overflow: 'hidden',
      width: '100%',
      height: '100%'
    });
  }
  // Ensure that no additional CSS rules for famousContext will get added.
  isFamousContextDeclared = true;

  // don't re-use parent's data/attributes, don't mutate data object
  var inNewDataContext = this.parentView && this.parentView.__isTemplateWith;
  var data = inNewDataContext ? _.clone(this.templateInstance().data) : {};

  var fview = this.fview = new MeteorFamousView(this, data, true /*noAdd*/ );
  fview.children = [];

  var pViewName = parentViewName(this.parentView);
  var pTplName = parentTemplateName(this.parentView);
  log.debug('New famousContext (#' + fview.id + ')' +
    (data.template ?
      ', content from "' + data.template + '"' :
      ', content from inline block') +
    ' (parent: ' + pViewName +
    (pViewName == pTplName ? '' : ', template: ' + pTplName) + ')');

  var divOptions = {};
  if (!data.useParent) {
    if (data.size) {
      data.size = optionString(data.size, 'size');
      for (var i = 0; i < 2; i++) {
        var size = data.size[i];
        if (size === true)
          throw new Error("Can't use `true` size on famousContext");
        else if (!size)
          data.size[i] = '100%';
        else
          data.size[i] += 'px';
      }
      if (!data.style)
        data.style = '';
      data.style = "width: " + data.size[0];
      data.style = "height: " + data.size[1];
    }

    if (typeof data.style === 'undefined' && data.id !== 'mainCtx')
      log.debug('^__ no style="" specified; you probably want to specify a ' +
        'size, unless you\'re doing it via CSS on .fview-context');

    divOptions.class = 'fview-context';
    if (data.id) divOptions.id = data.id;
    if (data.style) divOptions.style = data.style;
    if (data.class) divOptions.class += ' ' + data.class;

    if (data.id === "mainCtx")
      FView.mainCtxFView = fview;
  }

  var addQueue = [];
  fview.node = fview.context = {
    add: function (node) {
      addQueue.push(node);
    }
  };
  if (data.id === "mainCtx")
    FView.mainCtx = fview.context;

  this.onViewReady(function () {
    var container = data.useParent ? this._domrange.parentElement : this._domrange.members[0];
    fview.node = fview.context = Engine.createContext(container);
    if (data.id === "mainCtx")
      FView.mainCtx = fview.context;

    for (var i = 0; i < addQueue.length; i++)
      fview.node.add(addQueue[i]);
    addQueue = [];

    if (data.id === "mainCtx" || (container.parentNode === document.body &&
        document.body.childElementCount == 1)) {
      initializeFamous();
      $(container).removeClass('fview-context').addClass('famous-container');
      window.dispatchEvent(new Event('resize'));
    }

    var template = data.template ? Template[data.template] : this.templateContentBlock;
    if (!template)
      return;

    if (inNewDataContext) {
      var dataContext = data.data ||
        Blaze._parentData(1) && Blaze._parentData(1, true) || {};
      Blaze.renderWithData(template, dataContext, container, null, this);
    } else
      Blaze.render(template, container, null, this);
  });

  // what else do we need here?  some stuff is automatic because of div/DOM
  this.onViewDestroyed(function() {
    if (fview === FView.mainCtxFView)
      FView.mainCtxFView = null;
      FView.mainCtx = undefined;
  });

  if (data.useParent)
    return null;
  else
    return HTML.DIV(divOptions);
});

Blaze.Template.registerHelper('famousContext', famousContext);
Blaze.Template.registerHelper('FamousContext', famousContext); // alias
FView.famousContext = famousContext;
