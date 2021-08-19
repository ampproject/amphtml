import {createExtensionScript} from '#service/extension-script';

const loaded = Object.create(null);

/**
 * @param {!Window} win
 * @param {string} name
 * @param {string=} version
 * @return {!Promise<*>}
 */
function loadExtensionScript(win, name, version = '0.1') {
  const scriptElement = createExtensionScript(win, name, version);
  return new Promise((resolve, reject) => {
    scriptElement.onload = resolve;
    scriptElement.onerror = reject;
    self.document.head.appendChild(scriptElement);
  });
}

export default new (class {
  // Forbidden term: pr*loadExtension
  /* eslint-disable local/no-forbidden-terms */
  /**
   * @param {string} name
   * @return {!Promise}
   */
  preloadExtension(name) {
    /* eslint-enable local/no-forbidden-terms */
    // We know for sure that we try to load `amp-crypto-polyfill`.
    // In its place, we inject it in the bundle to install it synchronously
    if (name !== 'amp-crypto-polyfill') {
      throw new Error(name);
    }
    if (!loaded[name]) {
      loaded[name] = loadExtensionScript(self, name);
    }
    return loaded[name];
  }
})();
