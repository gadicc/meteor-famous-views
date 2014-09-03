// https://github.com/Famous/examples/blob/master/src/examples/views/Scrollview/example.js

Menu.add({name:'SequentialLayout',route:'views/SequentialLayout'}, 'Views');

Router.map(function() {
  this.route('views_SequentialLayout', {
    path: '/views/SequentialLayout',
  });
});

FView.ready(function(require) {
    FView.registerView('SequentialLayout', famous.views.SequentialLayout);
});

Template.views_SequentialLayout.helpers({
    show: function(target){
        return Session.get(target);
    },
    surfaceASize: function(){
        return Session.get('A') ? [undefined, Session.get('heightA')] : [undefined, undefined];
    },
    surfaceBSize: function(){
        return Session.get('B') ? [undefined, Session.get('heightB')] : [undefined, undefined];
    },
    surfaceCSize: function(){
        return Session.get('C') ? [undefined, Session.get('heightC')] : [undefined, undefined];
    },
});


Template.sl_buttons.helpers({
    buttons: ['A', 'B', 'C'],
    isSet: function() {
        return Session.get(this.valueOf()) ? 'set' : '';
    },
    text: function(){
        var letter = this.valueOf(); 
        return (Session.get(letter) ? 'Hide ' : 'Show ') + letter;  
    }
});

Template.sl_buttons.events({
    'click button': function(event, tpl) {
        console.log(this.valueOf());
        Session.set(this.valueOf(), !Session.get(this.valueOf()));
    }
});



Template.surfaceA.rendered = function(){
    var content = FView.fromTemplate(this).view.content;
    Meteor.setTimeout(function(){
        var height = content.clientHeight;
        Session.set('heightA', height);
    }, 50);
};

Template.surfaceB.rendered = function(){
    var content = FView.fromTemplate(this).view.content;
    Meteor.setTimeout(function(){
        var height = content.clientHeight;
        Session.set('heightB', height);
    }, 50);
};

Template.surfaceC.rendered = function(){
    var content = FView.fromTemplate(this).view.content;
    Meteor.setTimeout(function(){
        var height = content.clientHeight;
        Session.set('heightC', height);
    }, 50);
};
