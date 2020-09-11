if (!window.context) {
  // window.context doesn't exist yet, must perform steps to create it
  // before using it
  console.log('window.context NOT READY');

  // load ampcontext-lib.js which will create window.context
  ampContextScript = document.createElement('script');
  ampContextScript.src =
    'https://localhost:8000/dist.3p/current/ampcontext-lib.js';
  document.head.appendChild(ampContextScript);
}

function intersectionCallback(payload) {
  var changes = payload.changes;
  // Code below is simply an example.
  var latestChange = changes[changes.length - 1];

  // Amp-ad width and height.
  var w = latestChange.boundingClientRect.width;
  var h = latestChange.boundingClientRect.height;

  // Visible width and height.
  var vw = latestChange.intersectionRect.width;
  var vh = latestChange.intersectionRect.height;

  // Position in the viewport.
  var vx = latestChange.boundingClientRect.x;
  var vy = latestChange.boundingClientRect.y;

  // Viewable percentage.
  var viewablePerc = ((vw * vh) / (w * h)) * 100;

  console.log(viewablePerc, w, h, vw, vh, vx, vy);
}

function dummyCallback(changes) {
  console.log(changes);
}

var shouldStopVis = false;
var stopVisFunc;
var shouldStopInt = false;
var stopIntFunc;

function toggleObserveIntersection() {
  if (shouldStopInt) {
    stopIntFunc();
  } else {
    stopIntFunc = window.context.observeIntersection(intersectionCallback);
  }
  shouldStopInt = !shouldStopInt;
}

function toggleObserveVisibility() {
  if (shouldStopVis) {
    stopVisFunc();
  } else {
    stopVisFunc = window.context.observePageVisibility(dummyCallback);
  }
  shouldStopVis = !shouldStopVis;
}

function resizeAd() {
  window.context
    .requestResize(500, 600)
    .then(function () {
      console.log('Success!');
      this.innerWidth = 500;
      this.innerHeight = 600;
    })
    .catch(function () {
      console.log('DENIED');
    });
}
