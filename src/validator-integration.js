import {propagateNonce} from '#core/dom';
import {getHashParams} from '#core/types/string/url';

import {loadPromise} from '#utils/event-helper';

import {urls} from './config';
import {isModeDevelopment} from './mode';

/**
 * Triggers validation for the current document if there is a script in the
 * page that has a "development" attribute and the bypass validation via
 * #validate=0 is absent.
 *
 * @param {!Window} win Destination window for the new element.
 */
export function maybeValidate(win) {
  const filename = win.location.href;
  if (filename.startsWith('about:')) {
    // Should only happen in tests.
    return;
  }
  let validator = false;
  const params = getHashParams(win);
  if (isModeDevelopment(win, params)) {
    validator = params['validate'] !== '0';
  }

  if (validator) {
    loadScript(win.document, `${urls.cdn}/v0/validator_wasm.js`).then(() => {
      /* global amp: false */
      amp.validator.validateUrlAndLog(filename, win.document);
    });
  }
}

/**
 * Loads script
 *
 * @param {Document} doc
 * @param {string} url
 * @return {!Promise}
 */
export function loadScript(doc, url) {
  const script = /** @type {!HTMLScriptElement} */ (
    doc.createElement('script')
  );
  script.src = url;
  propagateNonce(doc, script);

  const promise = loadPromise(script).then(
    () => {
      doc.head.removeChild(script);
    },
    () => {}
  );
  doc.head.appendChild(script);
  return promise;
}
