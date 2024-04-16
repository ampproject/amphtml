'use strict';

import sinon from 'sinon'; // eslint-disable-line local/no-import

import * as coreError from '#core/error';

import {setReportError} from '#utils/log';

import {
  expectedAsyncErrors,
  indexOfExpectedMessage,
} from './console-logging-setup';

import {reportError} from '../src/error-reporting';

let rethrowAsyncSandbox;

/**
 * Initializes the stubs to prevent async errors from being thrown during tests.
 */
function stubAsyncErrorThrows() {
  rethrowAsyncSandbox = sinon.createSandbox();
  rethrowAsyncSandbox.stub(coreError, 'rethrowAsync').callsFake((...args) => {
    const error = coreError.createError.apply(null, args);
    const index = indexOfExpectedMessage(error.message);
    if (index != -1) {
      expectedAsyncErrors.splice(index, 1);
      return;
    }
    self.__AMP_REPORT_ERROR(error);
    throw error;
  });
}

/**
 * Resets async error behavior to its default.
 */
function restoreAsyncErrorThrows() {
  rethrowAsyncSandbox.restore();
}

/**
 * Used to prevent asynchronous throwing of errors during each test.
 */
export function preventAsyncErrorThrows() {
  self.stubAsyncErrorThrows = stubAsyncErrorThrows;
  self.restoreAsyncErrorThrows = restoreAsyncErrorThrows;
  setReportError(reportError);
  stubAsyncErrorThrows();
}
