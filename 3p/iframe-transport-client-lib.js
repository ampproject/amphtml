

// src/polyfills.js must be the first import.
import './polyfills';

import {IframeTransportClient} from './iframe-transport-client';

import {initLogConstructor, setReportError} from '../src/log';

initLogConstructor();
// TODO(alanorozco): Refactor src/error.reportError so it does not contain big
// transitive dependencies and can be included here.
setReportError(() => {});

/**
 *  Instantiate IframeTransportClient, to provide the creative with
 *  all the required functionality.
 */
try {
  new IframeTransportClient(window);
} catch (err) {
  // do nothing with error
}
