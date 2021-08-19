import {urls} from 'src/config';

const loaded = Object.create(null);

/**
 * @param {!Window} win
 * @param {string} name
 * @param {string=} version
 * @return {!Promise<*>}
 */
function loadExtensionScript(win, name, version = '0.1') {
  const scriptElement = win.document.createElement('script');
  scriptElement.async = true;
  scriptElement.src =
    urls.cdn +
    // eslint-disable-next-line local/no-forbidden-terms
    `/rtv/${INTERNAL_RUNTIME_VERSION}` +
    `/v0/${name}${version}${IS_ESM ? '.mjs' : '.js'}`;
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
    // We may try to load `amp-crypto-polyfill` on old browsers or insecure
    // contexts.
    if (name !== 'amp-crypto-polyfill') {
      throw new Error(name);
    }
    if (!loaded[name]) {
      // TODO(alanorozco): I haven't tested that this works lol
      loaded[name] = loadExtensionScript(self, name);
    }
    return loaded[name];
  }
})();
