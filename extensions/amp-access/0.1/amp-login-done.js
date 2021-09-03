/**
 * @fileoverview The endpoint for returning Login dialog. It passes the return
 * code back to AMP runtime using window messaging.
 */

import '#polyfills';
import {onDocumentReady} from '#core/document-ready';

import {LoginDoneDialog} from './amp-login-done-dialog';

import {reportError} from '../../../src/error-reporting';
import {initLogConstructor, setReportError} from '../../../src/log';
import {bodyAlwaysVisible} from '../../../src/style-installer';

bodyAlwaysVisible(window);
initLogConstructor();
setReportError(reportError);

onDocumentReady(document, () => {
  new LoginDoneDialog(window).start();
});
