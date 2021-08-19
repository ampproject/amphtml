import {Deferred} from '#core/data-structures/promise';

import {Services} from '#service';

/** @type {!WeakMap<!../../../src/service/ampdoc-impl.AmpDoc, !Promise>} */
const polyfillPromiseMap = new WeakMap();

/**
 * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
 * @return {Promise<void>}
 */
export function installWebAnimationsIfNecessary(ampdoc) {
  if (polyfillPromiseMap.has(ampdoc)) {
    return polyfillPromiseMap.get(ampdoc);
  }

  const {promise, resolve} = new Deferred();
  polyfillPromiseMap.set(ampdoc, promise);

  const {win} = ampdoc;
  const platform = Services.platformFor(win);
  if (platform.isSafari() && platform.getMajorVersion() < 14) {
    /*
      Force Web Animations polyfill on Safari versions before 14.
      Native Web Animations on WebKit did not respect easing for individual
      keyframes and break overall timing. See https://go.amp.dev/issue/27762 and
      https://bugs.webkit.org/show_bug.cgi?id=210526
      */
    // Using string access syntax to bypass typecheck.
    win.Element.prototype['animate'] = null;
  }

  if (win.Element.prototype['animate']) {
    // Native Support exists, there is no reason to load the polyfill.
    resolve();
    return promise;
  }

  resolve(
    Services.extensionsFor(win).installExtensionForDoc(
      ampdoc,
      'amp-animation-polyfill'
    )
  );

  return promise;
}
