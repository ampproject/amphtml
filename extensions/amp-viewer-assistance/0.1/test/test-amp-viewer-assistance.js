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

import {ActionInvocation} from '../../../../src/service/action-impl';
import {ActionTrust} from '../../../../src/action-constants';
import {AmpViewerAssistance} from '../amp-viewer-assistance';
import {mockServiceForDoc} from '../../../../testing/test-helper';

describes.fakeWin(
  'AmpViewerAssistance',
  {
    amp: true,
    location: 'https://pub.com/doc1',
  },
  env => {
    let document;
    let ampdoc;
    let element;
    let viewerMock;

    beforeEach(() => {
      ampdoc = env.ampdoc;
      document = env.win.document;
      viewerMock = mockServiceForDoc(env.sandbox, env.ampdoc, 'viewer', [
        'isTrustedViewer',
        'sendMessage',
        'sendMessageAwaitResponse',
      ]);
      viewerMock.isTrustedViewer.returns(Promise.resolve(true));
      viewerMock.sendMessageAwaitResponse.returns(Promise.resolve('idToken'));

      element = document.createElement('script');
      element.setAttribute('id', 'amp-viewer-assistance');
      element.setAttribute('type', 'application/json');
      document.body.appendChild(element);
    });

    it('should disable service when no config', () => {
      document.body.removeChild(element);
      const service = new AmpViewerAssistance(ampdoc);
      expect(service.enabled_).to.be.false;
      expect(service.assistanceElement_).to.be.undefined;
    });

    it('should disable service when the viewer is not trusted', () => {
      expectAsyncConsoleError(
        '[amp-viewer-assistance] amp-viewer-assistance is' +
          ' currently only supported on trusted viewers.'
      );
      viewerMock.isTrustedViewer.returns(Promise.resolve(false));
      const config = {
        'providerId': 'foo-bar',
      };
      element.textContent = JSON.stringify(config);
      const service = new AmpViewerAssistance(ampdoc);
      return service.start_().then(() => {
        expect(service.enabled_).to.be.false;
      });
    });

    it('should fail if config is malformed', () => {
      expect(() => {
        new AmpViewerAssistance(ampdoc);
      }).to.throw(Error);
    });

    it('should send the config to the viewer', () => {
      const config = {
        'providerId': 'foo-bar',
      };
      element.textContent = JSON.stringify(config);
      const service = new AmpViewerAssistance(ampdoc);
      expect(service.enabled_).to.be.true;
      expect(service.assistanceElement_).to.equal(element);
      const sendMessageStub = service.viewer_.sendMessage;
      return service.start_().then(() => {
        expect(sendMessageStub).to.be.calledOnce;
        expect(sendMessageStub.firstCall.args[0]).to.equal(
          'viewerAssistanceConfig'
        );
        expect(sendMessageStub.firstCall.args[1]).to.deep.equal({
          'config': config,
        });
      });
    });

    describe('updateActionState', () => {
      let service;
      let sendMessageStub;

      beforeEach(() => {
        const config = {
          'providerId': 'foo-bar',
        };
        element.textContent = JSON.stringify(config);

        service = new AmpViewerAssistance(ampdoc);
        sendMessageStub = service.viewer_.sendMessageAwaitResponse;
      });

      it('should send if "update" params are well-formed', () => {
        const args = {
          'update': {'actionStatus': 'COMPLETED_ACTION_STATUS'},
        };
        const invoke = new ActionInvocation(element, 'updateActionState', args);
        invoke.trust = ActionTrust.LOW;

        return service
          .start_()
          .then(() => {
            sendMessageStub.resetHistory();
            return service.actionHandler_(invoke);
          })
          .then(() => {
            expect(sendMessageStub).to.be.calledOnce;
            expect(sendMessageStub.firstCall.args[0]).to.equal(
              'updateActionState'
            );
            expect(sendMessageStub.firstCall.args[1]).to.deep.equal(args);
          });
      });

      it('should not send if both "update" and "error" params are missing', () => {
        const invoke = new ActionInvocation(element, 'updateActionState', {});
        invoke.trust = ActionTrust.LOW;
        let actionHandlerPromise;
        expectAsyncConsoleError(
          '[amp-viewer-assistance] "updateActionState"' +
            ' action must have an "update" or "error" parameter.',
          1
        );
        return service
          .start_()
          .then(() => {
            sendMessageStub.resetHistory();
            actionHandlerPromise = service.actionHandler_(invoke);
            expect(actionHandlerPromise).to.be.null;
            return actionHandlerPromise;
          })
          .then(() => {
            expect(sendMessageStub).to.not.be.called;
          });
      });

      it('should not send if "update.actionStatus" param is missing', () => {
        const args = {'update': {}};
        const invoke = new ActionInvocation(element, 'updateActionState', args);
        invoke.trust = ActionTrust.LOW;
        let actionHandlerPromise;
        expectAsyncConsoleError(
          '[amp-viewer-assistance] "updateActionState"' +
            ' action "update" parameter must contain a valid "actionStatus"' +
            ' field.',
          1
        );
        return service
          .start_()
          .then(() => {
            sendMessageStub.resetHistory();
            actionHandlerPromise = service.actionHandler_(invoke);
            expect(actionHandlerPromise).to.be.null;
            return actionHandlerPromise;
          })
          .then(() => {
            expect(sendMessageStub).to.not.be.called;
          });
      });

      it('should not send if "update.actionStatus" param is invalid', () => {
        const args = {
          'update': {'actionStatus': 'INVALID_ACTION_STATUS'},
        };
        const invoke = new ActionInvocation(element, 'updateActionState', args);
        invoke.trust = ActionTrust.LOW;
        expectAsyncConsoleError(
          '[amp-viewer-assistance] "updateActionState"' +
            ' action "update" parameter must contain a valid "actionStatus"' +
            ' field.',
          1
        );

        return service.start_().then(() => {
          sendMessageStub.reset();
          expect(service.actionHandler_(invoke)).to.be.null;
          expect(sendMessageStub).to.not.be.called;
        });
      });

      it('should send if "error" param is well-formed', () => {
        const error = {
          text: () => {
            return Promise.resolve('error message');
          },
          status: 500,
        };
        const args = {
          'error': error,
        };
        const invoke = new ActionInvocation(element, 'updateActionState', args);
        invoke.trust = ActionTrust.LOW;

        return service
          .start_()
          .then(() => {
            sendMessageStub.resetHistory();
            service.actionHandler_(invoke);
            return error.text();
          })
          .then(() => {
            expect(sendMessageStub).to.be.calledOnce;
            expect(sendMessageStub.firstCall.args[0]).to.equal(
              'updateActionState'
            );
            expect(sendMessageStub.firstCall.args[1]).to.deep.equal({
              update: {
                actionStatus: 'FAILED_ACTION_STATUS',
                result: {
                  code: 500,
                  message: 'error message',
                },
              },
            });
          });
      });

      it('should not send if "error" param is invalid', () => {
        const error = {
          status: 500,
        };
        const args = {
          'error': error,
        };
        const invoke = new ActionInvocation(element, 'updateActionState', args);
        invoke.trust = ActionTrust.LOW;
        expectAsyncConsoleError(
          '[amp-viewer-assistance] "updateActionState"' +
            ' action "error" parameter must contain a valid "response"' +
            ' object.',
          1
        );

        return service.start_().then(() => {
          sendMessageStub.resetHistory();
          expect(service.actionHandler_(invoke)).to.be.null;
          expect(sendMessageStub).to.not.be.called;
        });
      });

      it('should not send if both "update" and "error" params are present', () => {
        const args = {
          'error': {},
          'update': {},
        };
        const invoke = new ActionInvocation(element, 'updateActionState', args);
        invoke.trust = ActionTrust.LOW;
        expectAsyncConsoleError(
          '[amp-viewer-assistance] "updateActionState"' +
            ' must have only one of the parameters "error" and "update".',
          1
        );

        return service.start_().then(() => {
          sendMessageStub.resetHistory();
          expect(service.actionHandler_(invoke)).to.be.null;
          expect(sendMessageStub).to.not.be.called;
        });
      });
    });

    it('should send handle the signIn action', () => {
      const config = {
        'providerId': 'foo-bar',
      };
      element.textContent = JSON.stringify(config);
      const service = new AmpViewerAssistance(ampdoc);
      const sendMessageStub = service.viewer_.sendMessageAwaitResponse;
      return service.start_().then(() => {
        sendMessageStub.resetHistory();
        sendMessageStub.returns(Promise.reject());

        const invocation = new ActionInvocation(element, 'signIn');
        invocation.trust = ActionTrust.LOW;
        allowConsoleError(() => {
          service.actionHandler_(invocation);
        });
        expect(sendMessageStub).to.not.be.called;

        // signIn requires high-trust.
        invocation.trust = ActionTrust.HIGH;
        service.actionHandler_(invocation);
        expect(sendMessageStub).to.be.calledOnce;
        expect(sendMessageStub.firstCall.args[0]).to.equal('requestSignIn');
        expect(sendMessageStub.firstCall.args[1]).to.deep.equal({
          providers: ['actions-on-google-gsi'],
        });
      });
    });

    it('should make IDENTITY_TOKEN available through a promise', () => {
      const config = {
        'providerId': 'foo-bar',
      };
      element.textContent = JSON.stringify(config);
      const service = new AmpViewerAssistance(ampdoc);
      return service
        .start_()
        .then(() => service.getIdTokenPromise())
        .then(token => expect(token).to.equal('idToken'));
    });

    it('should set a css class if IDENTITY_TOKEN is available', () => {
      const config = {
        'providerId': 'foo-bar',
      };
      element.textContent = JSON.stringify(config);
      const service = new AmpViewerAssistance(ampdoc);
      service.vsync_ = {
        mutate: callback => {
          callback();
        },
      };
      const sendMessageStub = service.viewer_.sendMessageAwaitResponse;
      sendMessageStub.returns(Promise.resolve('idToken'));
      return service.getIdTokenPromise().then(() => {
        expect(sendMessageStub).to.be.calledOnce;
        expect(sendMessageStub.firstCall.args[0]).to.equal(
          'getAccessTokenPassive'
        );
        expect(sendMessageStub.firstCall.args[1]).to.deep.equal({
          providers: ['actions-on-google-gsi'],
        });
        expect(document.documentElement).to.have.class(
          'amp-viewer-assistance-identity-available'
        );
      });
    });
  }
);
