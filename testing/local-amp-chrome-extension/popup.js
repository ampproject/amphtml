

const background = chrome.extension.getBackgroundPage(); // eslint-disable-line no-undef

function toggleProxy(unusedE) {
  background.disabled = !background.disabled;
  background.updateBadge();
}

document.addEventListener('DOMContentLoaded', function() {
  const switchButton = document.querySelector('input[type="checkbox"]');
  switchButton.addEventListener('change', toggleProxy);
  if (!background.disabled) {
    switchButton.checked = true;
  }

  const baseUrlInput = document.getElementById('base-url');
  baseUrlInput.placeholder = background.defaultBaseUrl;
  baseUrlInput.value = background.baseUrl;
  baseUrlInput.addEventListener('input', () => {
    const url = new URL(baseUrlInput.value.trim() || background.defaultBaseUrl);
    if (!url.pathname.endsWith('/')) {
      url.pathname += '/';
    }
    background.baseUrl = url.href;
  });
});
