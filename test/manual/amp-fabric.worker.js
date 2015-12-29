
console.log('WORKER: started!');

importScripts(
  '/third_party/fabric/fabric-for-worker.js',  // TODO: compile in instead.
  '/dist/workers/amp-fabric.max.js'
);

console.log('WORKER: initialized?');

var canvas = AMP.canvas;
console.log('WORKER: canvas = ' + canvas);

var rect = new fabric.Rect({
  left: 30,
  top: 30,
  fill: 'green',
  width: 20,
  height: 20,
  angle: 45
});
canvas.add(rect);

/*

var circle = new fabric.Circle({
  radius: 20, fill: 'green', left: 200, top: 100
});
var triangle = new fabric.Triangle({
  width: 20, height: 30, fill: 'blue', left: 50, top: 50
});
canvas.add(circle, triangle);

var text = new fabric.Text('hello world',
   { left: 100, top: 200,
    fontFamily: 'Comic Sans'});
canvas.add(text);
*/

// TODO: call this automatically either on a frame or via events.
AMP.mount();
