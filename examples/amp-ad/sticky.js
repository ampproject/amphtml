window.onload = function () {
  var iframe = document.querySelector('#creative');

  // Step 1: Once knowing the ad size is 300x250, hide the frame and request to have ad shown
  iframe.style.top = '150px';
  iframe.style.transition = '3s';
  window.context.requestResize(300, 150).then(function () {
    iframe.style.top = '0px';
  });
};
