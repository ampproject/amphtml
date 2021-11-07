// src/polyfills.js must be the first import.
import './polyfills';

import {initLogConstructor, setReportError} from '#utils/log';

import {AmpContext} from './ampcontext';

initLogConstructor();

// TODO(alanorozco): Refactor src/error.reportError so it does not contain big
// transitive dependencies and can be included here.
setReportError(() => {});

/**
 *  If window.context does not exist, we must instantiate a replacement and
 *  assign it to window.context, to provide the creative with all the required
 *  functionality.
 */
try {
  const windowContextCreated = new Event('amp-windowContextCreated');
  window.context = new AmpContext(window);
  // Allows for pre-existence, consider validating correct window.context lib
  // instance?
  window.dispatchEvent(windowContextCreated);
} catch (err) {
  // do nothing with error
}
