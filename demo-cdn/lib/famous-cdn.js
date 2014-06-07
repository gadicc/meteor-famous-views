// Thanks Keith Nicholas for the initial code from this post:
// https://groups.google.com/d/msg/meteor-talk/DIwkRASNrCM/3ZS8ytRSAv8J

/*
$(body).ready(functoin() {
 require(['famous/core/Engine','famous/core/Surface'],function(Engine,Surface) {
   var mainContext = Engine.createContext();
   var surface = new Surface({ size: [200, 200],    content: 'Hello World'});
   mainContext.add(surface);
 });
});
*/