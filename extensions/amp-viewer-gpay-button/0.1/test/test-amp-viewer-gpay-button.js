/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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

import '../amp-viewer-gpay-button';

import {AmpPaymentGoogleIntegration} from '../../../../src/service/payments/amp-payment-google';
import {Services} from '../../../../src/services';
import {mockServiceForDoc} from '../../../../testing/test-helper';

describes.realWin(
  'amp-viewer-gpay-button',
  {
    amp: {
      extensions: ['amp-viewer-gpay-button'],
    },
  },
  env => {
    let win, doc;
    let viewerMock;

    beforeEach(() => {
      win = env.win;
      doc = win.document;
    });

    describe('inside google context', () => {
      beforeEach(() => {
        viewerMock = mockServiceForDoc(env.sandbox, env.ampdoc, 'viewer', [
          'whenFirstVisible',
          'isTrustedViewer',
          'sendMessage',
          'sendMessageAwaitResponse',
        ]);

        viewerMock.whenFirstVisible.returns(Promise.resolve());
        viewerMock.isTrustedViewer.returns(Promise.resolve(true));
        viewerMock.sendMessageAwaitResponse
          .withArgs('initializePaymentClient', {isTestMode: true})
          .returns(Promise.resolve());
      });

      it('should render button when payment method present is not required', () => {
        viewerMock.sendMessageAwaitResponse
          .withArgs('isReadyToPay', sinon.match.any)
          .returns(
            Promise.resolve({'result': true, 'paymentMethodPresent': false})
          );
        const buttons = doc.getElementsByTagName('button');
        expect(buttons.length).to.equal(0);

        return getAmpPaymentGoogleButton(
          true /* isTestMode */,
          null /*requestStringJson */,
          false /*renderIfPayementMethodRequired */
        ).then(gPayButton => {
          const buttons = gPayButton.getElementsByTagName('button');
          expect(buttons.length).to.equal(1);
        });
      });

      it('should not render button when payment method present is required', () => {
        viewerMock.sendMessageAwaitResponse
          .withArgs('isReadyToPay', sinon.match.any)
          .returns(
            Promise.resolve({'result': true, 'paymentMethodPresent': false})
          );
        const buttons = doc.getElementsByTagName('button');
        expect(buttons.length).to.equal(0);

        return getAmpPaymentGoogleButton(
          true /* isTestMode */,
          null /*requestStringJson */,
          true /*renderIfPayementMethodRequired */
        ).then(gPayButton => {
          const buttons = gPayButton.getElementsByTagName('button');
          expect(buttons.length).to.equal(0);
        });
      });

      it('should render button when payment method present is required', () => {
        viewerMock.sendMessageAwaitResponse
          .withArgs('isReadyToPay', sinon.match.any)
          .returns(
            Promise.resolve({'result': true, 'paymentMethodPresent': true})
          );
        const buttons = doc.getElementsByTagName('button');
        expect(buttons.length).to.equal(0);

        return getAmpPaymentGoogleButton(
          true /* isTestMode */,
          null /*requestStringJson */,
          true /*renderIfPayementMethodRequired */
        ).then(gPayButton => {
          const buttons = gPayButton.getElementsByTagName('button');
          expect(buttons.length).to.equal(1);
        });
      });

      it('should call initialize payment client before render button', () => {
        viewerMock.sendMessageAwaitResponse
          .withArgs('isReadyToPay', sinon.match.any)
          .returns(Promise.resolve({'result': true}));
        const buttons = doc.getElementsByTagName('button');
        expect(buttons.length).to.equal(0);

        return getAmpPaymentGoogleButton(true /* isTestMode */).then(
          gPayButton => {
            const buttons = gPayButton.getElementsByTagName('button');
            expect(buttons.length).to.equal(1);
          }
        );
      });

      it('should not render button if initialize payment client fails', () => {
        viewerMock.sendMessageAwaitResponse
          .withArgs('initializePaymentClient', {isTestMode: true})
          .returns(Promise.reject('initialize payment client fails'));

        return getAmpPaymentGoogleButton(true /* isTestMode */).then(
          gPayButton => {
            throw new Error('This should not be called');
          },
          error => {
            expect(error).to.equal('initialize payment client fails');
          }
        );
      });

      it('loads a button and displays the selected instrument', () => {
        viewerMock.sendMessageAwaitResponse
          .withArgs('isReadyToPay', sinon.match.any)
          .returns(Promise.resolve({'result': true}));
        return getAmpPaymentGoogleButton(true /* isTestMode */).then(
          gPayButton => {
            viewerMock.sendMessageAwaitResponse
              .withArgs('loadPaymentData', sinon.match.any)
              .returns(
                Promise.resolve({
                  paymentMethodToken: {
                    token: 'fakeToken',
                  },
                })
              );

            const trigger = sandbox.spy(
              gPayButton.implementation_.paymentsIntegration_.actions_,
              'trigger'
            );

            const buttons = gPayButton.getElementsByTagName('button');
            expect(buttons.length).to.equal(1);
            buttons.item(0).click();

            // Delay until the 'loadPaymentData' message response is
            // processed.
            return Services.timerFor(win)
              .promise(50)
              .then(() => {
                expect(trigger).to.be.calledWith(
                  gPayButton,
                  'loadPaymentData',
                  sinon.match.any
                );

                trigger.restore();
              });
          }
        );
      });

      it('should throw error if isReadyToPay returns false', () => {
        viewerMock.sendMessageAwaitResponse
          .withArgs('isReadyToPay', sinon.match.any)
          .returns(Promise.resolve({'result': false}));

        return getAmpPaymentGoogleButton(true /* isTestMode */).then(
          gPayButton => {
            throw new Error('This should not be called');
          },
          error => {
            expect(error).to.equal('Google Pay is not supported');
          }
        );
      });

      it('should send full paymentDataRequest for isReadyToPay', () => {
        viewerMock.sendMessageAwaitResponse
          .withArgs('isReadyToPay', {
            'testKey': 'testValue',
            'existingPaymentMethodRequired': false,
          })
          .returns(Promise.resolve({'result': true}));

        return getAmpPaymentGoogleButton(
          true /* isTestMode */,
          '{"testKey": "testValue"}'
        ).then(gPayButton => {
          const buttons = gPayButton.getElementsByTagName('button');
          expect(buttons.length).to.equal(1);
        });
      });
    });

    describe('outside google context', () => {
      let localIsReadyToPayStub;

      beforeEach(() => {
        viewerMock = mockServiceForDoc(env.sandbox, env.ampdoc, 'viewer', [
          'whenFirstVisible',
          'isTrustedViewer',
        ]);

        viewerMock.whenFirstVisible.returns(Promise.resolve());
        viewerMock.isTrustedViewer.returns(Promise.resolve(false));

        localIsReadyToPayStub = sandbox
          .stub(AmpPaymentGoogleIntegration.prototype, 'localIsReadyToPay_')
          .returns(Promise.resolve({'result': true}));
      });

      it('should call initialize payment client before render button', () => {
        const buttons = doc.getElementsByTagName('button');
        expect(buttons.length).to.equal(0);

        return getAmpPaymentGoogleButton(true /* isTestMode */).then(
          gPayButton => {
            const buttons = gPayButton.getElementsByTagName('button');
            expect(buttons.length).to.equal(1);
          }
        );
      });

      it('should render button when payment method present is not required', () => {
        localIsReadyToPayStub.returns(
          Promise.resolve({'result': true, 'paymentMethodPresent': false})
        );
        const buttons = doc.getElementsByTagName('button');
        expect(buttons.length).to.equal(0);

        return getAmpPaymentGoogleButton(
          true /* isTestMode */,
          null /*requestStringJson */,
          false /*renderIfPayementMethodRequired */
        ).then(gPayButton => {
          const buttons = gPayButton.getElementsByTagName('button');
          expect(buttons.length).to.equal(1);
        });
      });

      it('should not render button when payment method present is required', () => {
        localIsReadyToPayStub.returns(
          Promise.resolve({'result': true, 'paymentMethodPresent': false})
        );
        const buttons = doc.getElementsByTagName('button');
        expect(buttons.length).to.equal(0);

        return getAmpPaymentGoogleButton(
          true /* isTestMode */,
          null /*requestStringJson */,
          true /*renderIfPayementMethodRequired */
        ).then(gPayButton => {
          const buttons = gPayButton.getElementsByTagName('button');
          expect(buttons.length).to.equal(0);
        });
      });

      it('should render button when payment method present is required', () => {
        localIsReadyToPayStub.returns(
          Promise.resolve({'result': true, 'paymentMethodPresent': true})
        );
        const buttons = doc.getElementsByTagName('button');
        expect(buttons.length).to.equal(0);

        return getAmpPaymentGoogleButton(
          true /* isTestMode */,
          null /*requestStringJson */,
          true /*renderIfPayementMethodRequired */
        ).then(gPayButton => {
          const buttons = gPayButton.getElementsByTagName('button');
          expect(buttons.length).to.equal(1);
        });
      });

      it('loads a button and displays the selected instrument', () => {
        return getAmpPaymentGoogleButton(true /* isTestMode */).then(
          gPayButton => {
            sandbox
              .stub(
                gPayButton.implementation_.paymentsIntegration_.client_,
                'loadPaymentData'
              )
              .returns(
                Promise.resolve({
                  paymentMethodToken: {
                    token: 'fakeToken',
                  },
                })
              );
            const trigger = sandbox.spy(
              gPayButton.implementation_.paymentsIntegration_.actions_,
              'trigger'
            );

            const buttons = gPayButton.getElementsByTagName('button');
            expect(buttons.length).to.equal(1);
            buttons.item(0).click();

            // Delay until the 'loadPaymentData' message response is
            // processed.
            return Services.timerFor(win)
              .promise(50)
              .then(() => {
                expect(trigger).to.be.calledWith(
                  gPayButton,
                  'loadPaymentData',
                  sinon.match.any
                );

                trigger.restore();
              });
          }
        );
      });

      it('should throw error if isReadyToPay returns false', () => {
        localIsReadyToPayStub.returns(Promise.resolve({'result': false}));

        return getAmpPaymentGoogleButton(true /* isTestMode */).then(
          gPayButton => {
            throw new Error('This should not be called');
          },
          error => {
            expect(error).to.equal('Google Pay is not supported');
          }
        );
      });
    });

    function getAmpPaymentGoogleButton(
      opt_isTestMode,
      opt_requestStringJson,
      opt_renderIfPaymentMethodPresent
    ) {
      const button = doc.createElement('amp-viewer-gpay-button');
      button.setAttribute('is-test-mode', opt_isTestMode);
      if (opt_renderIfPaymentMethodPresent != null) {
        button.setAttribute(
          'render_only_if_payment_method_present',
          opt_renderIfPaymentMethodPresent
        );
      }

      const config = doc.createElement('script');
      config.setAttribute('type', 'application/json');
      config.innerHTML = opt_requestStringJson || '{}';
      button.appendChild(config);

      doc.body.appendChild(button);

      return button
        .build()
        .then(() => button.layoutCallback())
        .then(() => button);
    }
  }
);
