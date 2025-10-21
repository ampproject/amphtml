// Dynamically adjust Story Ads UI scaling for high-res screens
(function() {
  function setUIScale() {
    var scale = window.devicePixelRatio || 1;
    var root = document.documentElement;
    root.style.setProperty('--ads-ui-scale', scale > 1.5 ? scale : 1);
  }
  window.addEventListener('resize', setUIScale);
  setUIScale();
})();
