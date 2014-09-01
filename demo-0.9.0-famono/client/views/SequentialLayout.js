// https://github.com/Famous/examples/blob/master/src/examples/views/Scrollview/example.js

Menu.add({name:'SequentialLayout',route:'views/SequentialLayout'}, 'Views');

Router.map(function() {
  this.route('views_SequentialLayout', {
    path: '/views/SequentialLayout'
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


Template.surfaceA.rendered = function(){
    var fview = FView.fromTemplate(this);
    /*
    console.log('div #surfaceA');
    console.dir(this.$('#surfaceA')[0]);
    var sA = this.$('#surfaceA');
    sA.ready(function(){
        console.lor('Resizing sA!!!');
        var heightA = sA.clientHeight;
        console.lor('heightA: ' + heightA);
        Session.set('heightA', heightA);
    });
    */

    Meteor.setTimeout(function(){
        var heightA = fview.view.content.clientHeight;
        Session.set('heightA', heightA);
        //console.log('2. div #surfaceA');
        //console.dir($('#surfaceA'));
    }, 50);

    /*
    console.log('this:');
    console.dir(this);
    console.log('viewA:');
    console.dir(FView.byId('viewA'));
    console.log('sA:');
    console.dir(FView.byId('sA'));
    */
};

Template.surfaceA.events({
    'render #surfaceA': function(){
        console.log('render #surfaceA: ' + $('#surfaceA').content.clientHeight);
    }
});

Template.surfaceB.rendered = function(){
    var fview = FView.fromTemplate(this);
    Meteor.setTimeout(function(){
        var heightA = fview.view.content.clientHeight;
        Session.set('heightB', heightA);
    }, 50);
};

Template.surfaceC.rendered = function(){
    var fview = FView.fromTemplate(this);
    Meteor.setTimeout(function(){
        var heightA = fview.view.content.clientHeight;
        Session.set('heightC', heightA);
    }, 50);
};
