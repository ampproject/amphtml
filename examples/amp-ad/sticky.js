window.onload = function () {
  var iframe = document.querySelector('#creative');

  // Step 1: Once knowing the ad size is 300x250, hide the frame and request to have ad shown
  iframe.style.top = '250px';
  iframe.style.transition = '3s';
  window.context.requestResize(300, 250).then(function () {
    iframe.style.top = '0px';
    iframe.addEventListener('transitionend', function () {
      // Animation ended, now signaling AMP the ad is now interactive
      window.context.signalInteractive();
    });
  });
};
