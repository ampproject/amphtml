// Fake mraid.js that lets us pretend to be in a mobile app environment.
window.mraid = {};
window.mraid.getState = function() {
  return Math.random() < 0.5 ? 'ready' : 'loading';
};
window.mraid.addEventListener = function(event, callback) {
  if (event === 'ready') {
    window.setTimeout(1000, callback);
  } else if (event === 'exposureChange') {
    window.setTimeout(1000, function() {
      callback(.7, null, null);
    });
  } else {
    console.log('unknown event ' + event);
  }
};
window.mraid.close = function() {
  console.log('close');
};
window.mraid.open = function (url) {
  console.log('open ' + url);
};
window.mraid.expand = function() {
  console.log('expand');
};
