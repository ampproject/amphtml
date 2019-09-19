/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import '../amp-viewer-gpay-inline';

import {
  AmpForm,
  AmpFormService,
} from '../../../../extensions/amp-form/0.1/amp-form';
import {
  AsyncInputClasses,
  SUBMIT_TIMEOUT_TYPE,
} from '../../../../src/async-input';
import {Services} from '../../../../src/services';
import {
  mockServiceForDoc,
  mockServiceForDocWithVariables,
} from '../../../../testing/test-helper';
import {poll} from '../../../../testing/iframe';
import {user} from '../../../../src/log';

/** @const {string} */
const IFRAME_URL = 'http://example.com/somesubpath';

/** @const {string} */
const IFRAME_URL_ORIGIN = 'http://example.com';

/** @const {string} */
const SUBMIT_BUTTON_ID = 'submit-button';

/** @const {string} */
const PAYMENT_DATA = 'payment-data';

/** @const {string} */
const PAYMENT_TOKEN = 'fake-payment-token';

/** @const @private {!../../../../src/service/timer-impl.Timer} */
const timer_ = Services.timerFor(window);

/** @const {int} updated timeout to allow for fake calls*/
const TIMEOUT = 5000;

describes.realWin(
  'amp-viewer-gpay-inline',
  {
    amp: {
      extensions: ['amp-viewer-gpay-inline', 'amp-form'],
    },
  },
  env => {
    let win, doc;
    let viewerMock, xhrMock, iframeMock;

    beforeEach(() => {
      win = env.win;
      doc = win.document;

      new AmpFormService(env.ampdoc);

      viewerMock = mockServiceForDocWithVariables(
        env.sandbox,
        env.ampdoc,
        'viewer',
        [
          'ampdoc',
          'canRenderTemplates',
          'isTrustedViewer',
          'sendMessage',
          'sendMessageAwaitResponse',
          'whenFirstVisible',
          'whenNextVisible',
        ],
        {
          ampdoc: env.ampdoc,
        }
      );
      viewerMock.whenFirstVisible.returns(Promise.resolve());
      viewerMock.whenNextVisible.returns(Promise.resolve());
      viewerMock.canRenderTemplates.returns(false);

      iframeMock = mockServiceForDoc(
        env.sandbox,
        env.ampdoc,
        'payment-google-inline',
        ['sendIframeMessage', 'sendIframeMessageAwaitResponse']
      );

      xhrMock = mockServiceForDoc(env.sandbox, env.ampdoc, 'xhr', ['fetch']);

      viewerMock.sendMessageAwaitResponse
        .withArgs('isReadyToPay', sinon.match.any)
        .returns(Promise.resolve({'result': true}));
      viewerMock.sendMessageAwaitResponse
        .withArgs('initializePaymentClient', sinon.match.any)
        .returns(Promise.resolve({'shouldUseTestOverride': true}));
      viewerMock.sendMessageAwaitResponse
        .withArgs('getInlinePaymentIframeUrl', {})
        .returns(Promise.resolve(IFRAME_URL));
    });

    it('loads initialize payment client with isTestMode', () => {
      const iframes = doc.getElementsByTagName('iframe');
      expect(iframes.length).to.equal(0);

      // Send initial status change event for initiating the iframe component.
      win.postMessage(
        {
          message: 'paymentReadyStatusChanged',
          data: {},
        },
        '*'
      );

      return getAmpPaymentGoogleInline(true /* isTestMode */).then(
        gPayInline => {
          const iframes = gPayInline.getElementsByTagName('iframe');

          expect(iframes.length).to.equal(1);
          expect(iframes[0].src).to.equal(IFRAME_URL);
        }
      );
    });

    it('initialize payment client should be called only once for mutliple build', () => {
      const iframes = doc.getElementsByTagName('iframe');
      expect(iframes.length).to.equal(0);
      // set fake response for call
      viewerMock.sendMessageAwaitResponse
        .withArgs('initializePaymentClient', sinon.match.any)
        .returns(Promise.resolve({'shouldUseTestOverride': true})).calledOnce;
      // Send initial status change event for initiating the iframe component.
      win.postMessage(
        {
          message: 'paymentReadyStatusChanged',
          data: {},
        },
        '*'
      );
      // Intentionally calling it twice
      getAmpPaymentGoogleInline();
      return getAmpPaymentGoogleInline();
    });

    it('loads the inline payment iframe', () => {
      const iframes = doc.getElementsByTagName('iframe');
      expect(iframes.length).to.equal(0);
      // Send intial status change event for initiating the iframe component.
      win.postMessage(
        {
          message: 'paymentReadyStatusChanged',
          data: {},
        },
        '*'
      );
      return getAmpPaymentGoogleInline().then(gPayInline => {
        const iframes = gPayInline.getElementsByTagName('iframe');

        expect(iframes.length).to.equal(1);
        expect(iframes[0].src).to.equal(IFRAME_URL);
      });
    });

    it.only('submits the payment data along with the form', function() {
      // set ample time for fake call to occur
      this.timeout(TIMEOUT);
      // Send intial status change event for initiating the iframe component.
      win.postMessage(
        {
          message: 'paymentReadyStatusChanged',
          data: {},
        },
        '*'
      );
      user().error('test', 'test start')

      // expected response for the hidden input
      const data = '{"paymentMethodToken":{"token":"' + PAYMENT_TOKEN + '"}}';
      return getAmpPaymentGoogleInline().then(gPayInline => {
        const iframes = gPayInline.getElementsByTagName('iframe');
        expect(iframes.length).to.equal(1);
        iframeMock.sendIframeMessageAwaitResponse
          .withArgs(iframes[0], IFRAME_URL_ORIGIN, 'getSelectedPaymentData')
          .returns(
            Promise.resolve({
              paymentMethodToken: {
                token: PAYMENT_TOKEN,
              },
            })
          );

        // Before the form is submitted, the hidden input doesn't exist
        expect(doc.getElementById(PAYMENT_DATA)).to.equal(null);
        const formSubmitted = new Promise((resolve, reject) => {
          user().error('test','form submit')
          // constant check's the form's status and waits till the submition sucsessfully finishes
          poll(
            'get form',
            () => {
              return doc.querySelector('#mainForm.amp-form-submit-success');
            },
            undefined,
            TIMEOUT
          ).then(() => {
            user().error('polling done')
            // Without this try-catch block, the nested promise swallows up
            // any failed expectations and the test times out instead of
            // failing.
            try {
              // The data is present in the form when it is submitted.
              expect(
                doc.querySelector('input[name="' + PAYMENT_DATA + '"]').value
              ).to.equal(data);
              user().error('resolve')
              resolve();
            } catch (e) {
              reject(e);
            }
          });
          xhrMock.fetch.callsFake((url, request) => {
            // Minimal mocked FetchResponse.
            return {
              json: () => Promise.resolve('{}'),
            };
          });
        });

        const button = doc.getElementById(SUBMIT_BUTTON_ID);
        button.click();

        return formSubmitted;
      });
    });

    it('should not propagate payment token if user input timeout occurs', function() {
      expectAsyncConsoleError(
        /Form submission failed: %s Error: Timeout retreiving payment token expired./
      );
      this.timeout(SUBMIT_TIMEOUT_TYPE.INCREASED + 100);

      const timerStub = sandbox
        .stub(timer_, 'promise')
        .callsFake(function(time) {
          return new window.Promise(resolve => {
            // Avoid wrapping in closure if no specific result is
            // produced.
            const timerKey = timer_.delay(
              resolve,
              time - (SUBMIT_TIMEOUT_TYPE.INCREASED - 50)
            );
            if (timerKey == -1) {
              throw new Error('Failed to schedule timer.');
            }
          });
        });

      viewerMock.sendMessageAwaitResponse
        .withArgs('loadPaymentData', sinon.match.any)
        .callsFake(() => {
          return timer_.promise(SUBMIT_TIMEOUT_TYPE.INCREASED);
        });

      // Send intial status event to render using bottom sheet.
      win.postMessage(
        {
          message: 'useIframeContainer',
          data: true,
        },
        '*'
      );
      // Send intial status change event for initiating the iframe
      // component.
      win.postMessage(
        {
          message: 'paymentReadyStatusChanged',
          data: {},
        },
        '*'
      );

      return getAmpPaymentGoogleInline().then(gPayInline => {
        const formSubmitted = new Promise((resolve, reject) => {
          poll(
            'get form',
            () => {
              return doc.querySelector('#mainForm.amp-form-submit-error');
            },
            undefined,
            SUBMIT_TIMEOUT_TYPE.INCREASED
          ).then(() => {
            timerStub.restore();
            try {
              // The timeout for the async call should be increased
              expect(
                gPayInline.classList.contains(
                  AsyncInputClasses.ASYNC_INCREASE_TIMEOUT
                )
              ).to.equal(true);
              // The data is present in the form when it is submitted.
              expect(
                doc.querySelector('input[name="' + PAYMENT_DATA + '"]')
              ).to.equal(null);
              resolve();
            } catch (e) {
              reject(e);
            }
          });
        });

        const button = doc.getElementById(SUBMIT_BUTTON_ID);
        button.click();

        return formSubmitted;
      });
    });

    it('should not propagate payment token if getSelectedPaymentData returns an error', function() {
      expectAsyncConsoleError(/getSelectedPaymentData fail'/);
      // Send intial status change event for initiating the iframe
      // component.
      win.postMessage(
        {
          message: 'paymentReadyStatusChanged',
          data: {},
        },
        '*'
      );

      return getAmpPaymentGoogleInline().then(gPayInline => {
        const iframes = gPayInline.getElementsByTagName('iframe');
        expect(iframes.length).to.equal(1);
        iframeMock.sendIframeMessageAwaitResponse
          .withArgs(iframes[0], IFRAME_URL_ORIGIN, 'getSelectedPaymentData')
          .returns(Promise.reject('getSelectedPaymentData fail'));

        const formSubmitted = new Promise((resolve, reject) => {
          poll(
            'get form',
            () => {
              return doc.querySelector('#mainForm.amp-form-submit-error');
            },
            undefined,
            TIMEOUT
          ).then(() => {
            try {
              // The data is present in the form when it is submitted.
              expect(
                doc.querySelector('input[name="' + PAYMENT_DATA + '"]')
              ).to.equal(null);
              resolve();
            } catch (e) {
              reject(e);
            }
          });
        });

        const button = doc.getElementById(SUBMIT_BUTTON_ID);
        button.click();

        return formSubmitted;
      });
    });

    it('should call loadPaymentData on submit when inline disabled', () => {
      viewerMock.sendMessageAwaitResponse
        .withArgs('loadPaymentData', sinon.match.any)
        .callsFake(() => {
          return Promise.resolve({
            paymentMethodToken: {
              token: PAYMENT_TOKEN,
            },
          });
        });
      // Send intial status event to render using bottom sheet.
      win.postMessage(
        {
          message: 'useIframeContainer',
        },
        '*'
      );

      // Send intial status change event for initiating the iframe component.
      win.postMessage(
        {
          message: 'paymentReadyStatusChanged',
          data: true,
        },
        '*'
      );

      // expected response for the hidden input
      const data = '{"paymentMethodToken":{"token":"' + PAYMENT_TOKEN + '"}}';
      return getAmpPaymentGoogleInline().then(gPayInline => {
        const iframes = gPayInline.getElementsByTagName('iframe');
        expect(iframes.length).to.equal(1);
        // Before the form is submitted, the hidden input doesn't exist
        expect(
          doc.querySelector('input[name="' + PAYMENT_DATA + '"]')
        ).to.equal(null);
        const formSubmitted = new Promise((resolve, reject) => {
          // constant check's the form's status and waits till the submition sucsessfully finishes
          poll(
            'get form',
            () => {
              return doc.querySelector('#mainForm.amp-form-submit-success');
            },
            undefined,
            TIMEOUT
          ).then(() => {
            // Without this try-catch block, the nested promise swallows up
            // any failed expectations and the test times out instead of
            // failing.
            try {
              // The timeout for the async call should be increased
              expect(
                gPayInline.classList.contains(
                  AsyncInputClasses.ASYNC_INCREASE_TIMEOUT
                )
              ).to.equal(true);
              // The data is present in the form when it is submitted.
              expect(
                doc.querySelector('input[name="' + PAYMENT_DATA + '"]').value
              ).to.equal(data);
              resolve();
            } catch (e) {
              reject(e);
            }
          });
          xhrMock.fetch.callsFake((url, request) => {
            // Minimal mocked FetchResponse.
            return {
              json: () => Promise.resolve('{}'),
            };
          });
        });

        const button = doc.getElementById(SUBMIT_BUTTON_ID);
        button.click();

        return formSubmitted;
      });
    });

    it('should not set payment data if submit fails', function() {
      expectAsyncConsoleError(/getSelectedPaymentData fail/);
      // set ample time for fake call
      this.timeout(TIMEOUT);

      // Send intial status change event for initiating the iframe component.
      win.postMessage(
        {
          message: 'paymentReadyStatusChanged',
          data: {},
        },
        '*'
      );

      // expected response for the hidden input
      const data = '{"paymentMethodToken":{"token":"' + PAYMENT_TOKEN + '"}}';
      return getAmpPaymentGoogleInline().then(gPayInline => {
        sandbox
          .stub(gPayInline.implementation_, 'getValue')
          .callsFake(() => Promise.reject('getSelectedPaymentData fail'));

        // Before the form is submitted, the hidden input doesn't exist
        expect(doc.getElementById(PAYMENT_DATA)).to.equal(null);
        const formSubmitted = new Promise((resolve, reject) => {
          // constant check's the form's status and waits till the submition sucsessfully finishes
          poll(
            'get form',
            () => {
              return doc.querySelector('#mainForm.amp-form-submit-success');
            },
            undefined,
            TIMEOUT
          ).then(() => Promise.reject('Form should not submit.'));
          resolve();
        });

        const button = doc.getElementById(SUBMIT_BUTTON_ID);
        button.click();

        return formSubmitted;
      });
    });

    it('should set event listener onPaymentSubmitError with error code for buyer error ', () => {
      expectAsyncConsoleError(/getSelectedPaymentData fail/);

      // Send intial status change event for initiating the iframe component.
      win.postMessage(
        {
          message: 'paymentReadyStatusChanged',
          data: {},
        },
        '*'
      );

      // expected response for the hidden input
      const data = '{"paymentMethodToken":{"token":"' + PAYMENT_TOKEN + '"}}';
      return getAmpPaymentGoogleInline().then(gPayInline => {
        const iframes = gPayInline.getElementsByTagName('iframe');
        iframeMock.sendIframeMessageAwaitResponse
          .withArgs(iframes[0], IFRAME_URL_ORIGIN, 'getSelectedPaymentData')
          .returns(
            Promise.reject({
              statusCode: 'BUYER_ACCOUNT_ERROR',
              statusMessage: 'An buyer account error',
            })
          );

        const actionService = Services.actionServiceForDoc(
          doc.getElementById('mainForm')
        );
        const actionTriggerCalls = {};
        sandbox
          .stub(actionService, 'trigger')
          .callsFake(function(target, eventType, event, trust, opt_args) {
            actionTriggerCalls[eventType] = event.detail;
          });

        const formSubmitted = new Promise((resolve, reject) => {
          poll(
            'get form',
            () => {
              return doc.querySelector('#mainForm.amp-form-submit-error');
            },
            undefined,
            TIMEOUT
          ).then(() => {
            try {
              console.error(JSON.stringify(actionTriggerCalls));
              expect(actionTriggerCalls['onPaymentSubmitError']).to.eql({
                statusCode: 'BUYER_ACCOUNT_ERROR',
              });
              resolve();
            } catch (e) {
              reject(e);
            }
          });
        });

        const button = doc.getElementById(SUBMIT_BUTTON_ID);
        button.click();

        return formSubmitted;
      });
    });

    it('should set event listener onPaymentSubmitError with error code for buyer error with bottom sheet', () => {
      expectAsyncConsoleError(/loadPaymentData fail/);

      viewerMock.sendMessageAwaitResponse
        .withArgs('loadPaymentData', sinon.match.any)
        .callsFake(() => {
          return Promise.reject({
            statusCode: 'BUYER_ACCOUNT_ERROR',
            statusMessage: 'An buyer account error',
          });
        });
      // Send intial status event to render using bottom sheet.
      win.postMessage(
        {
          message: 'useIframeContainer',
        },
        '*'
      );

      // Send intial status change event for initiating the iframe component.
      win.postMessage(
        {
          message: 'paymentReadyStatusChanged',
          data: true,
        },
        '*'
      );

      // expected response for the hidden input
      const data = '{"paymentMethodToken":{"token":"' + PAYMENT_TOKEN + '"}}';
      return getAmpPaymentGoogleInline().then(gPayInline => {
        const actionService = Services.actionServiceForDoc(
          doc.getElementById('mainForm')
        );
        const actionTriggerCalls = {};
        sandbox
          .stub(actionService, 'trigger')
          .callsFake(function(target, eventType, event, trust, opt_args) {
            actionTriggerCalls[eventType] = event.detail;
          });

        const formSubmitted = new Promise((resolve, reject) => {
          poll(
            'get form',
            () => {
              return doc.querySelector('#mainForm.amp-form-submit-error');
            },
            undefined,
            TIMEOUT
          ).then(() => {
            try {
              expect(actionTriggerCalls['onPaymentSubmitError']).to.eql({
                statusCode: 'BUYER_ACCOUNT_ERROR',
              });
              resolve();
            } catch (e) {
              reject(e);
            }
          });
        });

        const button = doc.getElementById(SUBMIT_BUTTON_ID);
        button.click();

        return formSubmitted;
      });
    });

    it('should set event listener onPaymentSubmitError with error code and message for developer error ', () => {
      expectAsyncConsoleError(/getSelectedPaymentData fail/);

      // Send intial status change event for initiating the iframe component.
      win.postMessage(
        {
          message: 'paymentReadyStatusChanged',
          data: {},
        },
        '*'
      );

      // expected response for the hidden input
      const data = '{"paymentMethodToken":{"token":"' + PAYMENT_TOKEN + '"}}';
      return getAmpPaymentGoogleInline().then(gPayInline => {
        const iframes = gPayInline.getElementsByTagName('iframe');
        iframeMock.sendIframeMessageAwaitResponse
          .withArgs(iframes[0], IFRAME_URL_ORIGIN, 'getSelectedPaymentData')
          .returns(
            Promise.reject({
              statusCode: 'DEVELOPER_ERROR',
              statusMessage: 'An developer account error',
            })
          );

        const actionService = Services.actionServiceForDoc(
          doc.getElementById('mainForm')
        );
        const actionTriggerCalls = {};
        sandbox
          .stub(actionService, 'trigger')
          .callsFake(function(target, eventType, event, trust, opt_args) {
            actionTriggerCalls[eventType] = event.detail;
          });

        const formSubmitted = new Promise((resolve, reject) => {
          poll(
            'get form',
            () => {
              return doc.querySelector('#mainForm.amp-form-submit-error');
            },
            undefined,
            TIMEOUT
          ).then(() => {
            try {
              expect(actionTriggerCalls['onPaymentSubmitError']).to.eql({
                statusCode: 'DEVELOPER_ERROR',
                statusMessage: 'An developer account error',
              });
              resolve();
            } catch (e) {
              reject(e);
            }
          });
        });

        const button = doc.getElementById(SUBMIT_BUTTON_ID);
        button.click();

        return formSubmitted;
      });
    });

    it('should set event listener onPaymentSubmitError with error code for developer error with bottom sheet', () => {
      expectAsyncConsoleError(/loadPaymentData fail/);

      viewerMock.sendMessageAwaitResponse
        .withArgs('loadPaymentData', sinon.match.any)
        .callsFake(() => {
          return Promise.reject({
            statusCode: 'DEVELOPER_ERROR',
            statusMessage: 'An developer account error',
          });
        });
      // Send intial status event to render using bottom sheet.
      win.postMessage(
        {
          message: 'useIframeContainer',
        },
        '*'
      );

      // Send intial status change event for initiating the iframe component.
      win.postMessage(
        {
          message: 'paymentReadyStatusChanged',
          data: true,
        },
        '*'
      );

      // expected response for the hidden input
      const data = '{"paymentMethodToken":{"token":"' + PAYMENT_TOKEN + '"}}';
      return getAmpPaymentGoogleInline().then(gPayInline => {
        const actionService = Services.actionServiceForDoc(
          doc.getElementById('mainForm')
        );
        const actionTriggerCalls = {};
        sandbox
          .stub(actionService, 'trigger')
          .callsFake(function(target, eventType, event, trust, opt_args) {
            actionTriggerCalls[eventType] = event.detail;
          });

        const formSubmitted = new Promise((resolve, reject) => {
          poll(
            'get form',
            () => {
              return doc.querySelector('#mainForm.amp-form-submit-error');
            },
            undefined,
            TIMEOUT
          ).then(() => {
            try {
              expect(actionTriggerCalls['onPaymentSubmitError']).to.eql({
                statusCode: 'DEVELOPER_ERROR',
                statusMessage: 'An developer account error',
              });
              resolve();
            } catch (e) {
              reject(e);
            }
          });
        });

        const button = doc.getElementById(SUBMIT_BUTTON_ID);
        button.click();

        return formSubmitted;
      });
    });

    it('should throw error if isReadyToPay returns false', () => {
      viewerMock.sendMessageAwaitResponse
        .withArgs('isReadyToPay', sinon.match.any)
        .returns(Promise.resolve({'result': false}));

      // Send intial status change event for initiating the iframe component.
      win.postMessage(
        {
          message: 'paymentReadyStatusChanged',
          data: {},
        },
        '*'
      );

      return getAmpPaymentGoogleInline().then(
        gPayInline => {
          throw new Error('Should not be called');
        },
        error => {
          expect(error).to.equal('Google Pay is not supported');
        }
      );
    });

    it('should use test-override json params if in test mode', () => {
      viewerMock.sendMessageAwaitResponse
        .withArgs('getInlinePaymentIframeUrl', {'overrideKey': 'overrideValue'})
        .returns(Promise.resolve(IFRAME_URL));

      // Send intial status change event for initiating the iframe component.
      win.postMessage(
        {
          message: 'paymentReadyStatusChanged',
          data: {},
        },
        '*'
      );

      return getAmpPaymentGoogleInline(
        true /* isTestMode */,
        {'overrideKey': 'originalValue'},
        {'overrideKey': 'overrideValue'}
      ).then(gPayInline => {
        const iframes = gPayInline.getElementsByTagName('iframe');

        expect(iframes.length).to.equal(1);
        expect(iframes[0].src).to.equal(IFRAME_URL);
      });
    });

    it('should not use test-override json params if in non-test mode', () => {
      viewerMock.sendMessageAwaitResponse
        .withArgs('initializePaymentClient', sinon.match.any)
        .returns(Promise.resolve({'shouldUseTestOverride': false}));
      viewerMock.sendMessageAwaitResponse
        .withArgs('getInlinePaymentIframeUrl', {'overrideKey': 'originalValue'})
        .returns(Promise.resolve(IFRAME_URL));

      // Send intial status change event for initiating the iframe component.
      win.postMessage(
        {
          message: 'paymentReadyStatusChanged',
          data: {},
        },
        '*'
      );

      return getAmpPaymentGoogleInline(
        true /* isTestMode */,
        {'overrideKey': 'originalValue'},
        {'overrideKey': 'overrideValue'}
      ).then(gPayInline => {
        const iframes = gPayInline.getElementsByTagName('iframe');

        expect(iframes.length).to.equal(1);
        expect(iframes[0].src).to.equal(IFRAME_URL);
      });
    });

    it('should reply validation viewer request from frame in trusted viewer', function() {
      viewerMock.isTrustedViewer.returns(Promise.resolve(true));

      // Send intial status change event for initiating the iframe
      // component.
      win.postMessage(
        {
          message: 'paymentReadyStatusChanged',
          data: {},
        },
        '*'
      );

      return getAmpPaymentGoogleInline().then(gPayInline => {
        const iframes = gPayInline.getElementsByTagName('iframe');
        expect(iframes.length).to.equal(1);

        win.postMessage(
          {
            message: 'validateViewer',
            data: {},
          },
          '*'
        );

        // Delay so that postMessage can be executed
        return Services.timerFor(win)
          .promise(1)
          .then(() => {
            assert(
              iframeMock.sendIframeMessage.withArgs(
                iframes[0],
                IFRAME_URL_ORIGIN,
                'validateViewerReply',
                {'result': true}
              ).calledOnce,
              "Didn't reply validation viewer request with true"
            );
          });
      });
    });

    it('should not reply validation viewer in non-trusted viewer', function() {
      viewerMock.isTrustedViewer.returns(Promise.resolve(false));

      // Send intial status change event for initiating the iframe
      // component.
      win.postMessage(
        {
          message: 'paymentReadyStatusChanged',
          data: {},
        },
        '*'
      );

      return getAmpPaymentGoogleInline().then(gPayInline => {
        const iframes = gPayInline.getElementsByTagName('iframe');
        expect(iframes.length).to.equal(1);

        win.postMessage(
          {
            message: 'validateViewer',
            data: {},
          },
          '*'
        );

        // Delay so that postMessage can be executed
        return Services.timerFor(win)
          .promise(1)
          .then(() => {
            assert(
              iframeMock.sendIframeMessage.withArgs(
                iframes[0],
                IFRAME_URL_ORIGIN,
                'validateViewerReply',
                {'result': false}
              ).calledOnce,
              "Didn't reply validation viewer request with false"
            );
          });
      });
    });

    function getAmpPaymentGoogleInline(
      opt_isTestMode,
      opt_requestJson,
      opt_testOverrideJson
    ) {
      const form = doc.createElement('form');
      form.setAttribute('id', 'mainForm');
      form.setAttribute('method', 'post');
      form.setAttribute('action-xhr', '/my-form-handler');
      doc.body.appendChild(form);

      const button = doc.createElement('button');
      button.id = SUBMIT_BUTTON_ID;
      button.setAttribute('type', 'submit');
      form.appendChild(button);

      const inline = doc.createElement('amp-viewer-gpay-inline');
      inline.setAttribute('layout', 'fixed-height');
      inline.setAttribute('height', '100')
      inline.setAttribute('name', PAYMENT_DATA);
      inline.setAttribute('is-test-mode', opt_isTestMode);
      form.appendChild(inline);

      const config = doc.createElement('script');
      config.setAttribute('type', 'application/json');
      config.innerHTML = opt_requestJson
        ? JSON.stringify(opt_requestJson)
        : '{}';
      inline.appendChild(config);

      if (opt_testOverrideJson) {
        const overrideConfig = doc.createElement('script');
        overrideConfig.setAttribute('type', 'application/json');
        overrideConfig.setAttribute('name', 'test-override');
        overrideConfig.innerHTML = JSON.stringify(opt_testOverrideJson);
        inline.appendChild(overrideConfig);
      }

      return inline
        .build()
        .then(() => inline.layoutCallback())
        .then(() => inline);
    }
  }
);
