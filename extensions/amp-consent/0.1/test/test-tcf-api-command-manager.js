/**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
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

import {TcfApiCommandManager} from '../tcf-api-command-manager';
import {macroTask} from '../../../../testing/yield';
import {mockWindowInterface} from '../../../../testing/test-helper';
import {user} from '../../../../src/log';

describes.realWin(
  'tcf api commands',
  {
    amp: {
      extensions: ['amp-consent'],
      ampdoc: 'single',
    },
  },
  (env) => {
    describe('tcf Commands', () => {
      let mockWin;
      let mockPolicyManager;
      let mockMetadata;
      let data;
      let msg;
      let tcfApiCommandManager;

      beforeEach(() => {
        mockWin = mockWindowInterface(window.sandbox);
        mockWin.postMessage = window.sandbox.spy();
        mockMetadata = {};
        mockPolicyManager = {
          getConsentMetadataInfo: (opt_policy) => {
            return Promise.resolve(mockMetadata);
          },
        };
      });

      describe('isValidTcfApiCall', () => {
        it('validates __tcfapiCall post message', async () => {
          tcfApiCommandManager = new TcfApiCommandManager(mockPolicyManager);
          msg = {};
          const errorSpy = env.sandbox.stub(user(), 'error');
          msg.__tcfapiCall = 'bad';
          expect(tcfApiCommandManager.isValidTcfApiCall_(msg.__tcfapiCall)).to
            .be.false;
          expect(errorSpy.args[0][1]).to.match(
            /"tcfapiCall" is not an object: bad/
          );
          errorSpy.resetHistory();

          msg.__tcfapiCall = {
            'command': 'bad',
          };
          expect(tcfApiCommandManager.isValidTcfApiCall_(msg.__tcfapiCall)).to
            .be.false;
          expect(errorSpy.args[0][1]).to.match(
            /Unsupported command found in "tcfapiCall": bad/
          );
          errorSpy.resetHistory();

          msg.__tcfapiCall.command = 'ping';
          msg.__tcfapiCall.parameter = [1, 2, 3];
          expect(tcfApiCommandManager.isValidTcfApiCall_(msg.__tcfapiCall)).to
            .be.false;
          expect(errorSpy.args[0][1]).to.match(
            /Unsupported parameter found in "tcfapiCall": [1,2,3]/
          );
          errorSpy.resetHistory();

          msg.__tcfapiCall.parameter = undefined;
          msg.__tcfapiCall.version = 1;
          expect(tcfApiCommandManager.isValidTcfApiCall_(msg.__tcfapiCall)).to
            .be.false;
          expect(errorSpy.args[0][1]).to.match(
            /Found incorrect version in "tcfapiCall": 1/
          );
          errorSpy.resetHistory();

          msg.__tcfapiCall.version = 2;
          expect(tcfApiCommandManager.isValidTcfApiCall_(msg.__tcfapiCall)).to
            .be.true;
          expect(errorSpy).to.not.be.called;
        });
      });

      describe('handlePingEvent', () => {
        it('creates a minimal ping object', async () => {
          mockMetadata = {
            gdprApplies: false,
          };
          tcfApiCommandManager = new TcfApiCommandManager(mockPolicyManager);
          expect(
            tcfApiCommandManager.getMinimalPingReturnForTesting(mockMetadata)
          ).to.deep.equals({
            gdprApplies: false,
            cmpLoaded: true,
            cmpStatus: 'loaded',
            tcfPolicyVersion: 2,
          });
        });

        it('creates a minimal ping object with no gdprApplies', async () => {
          mockMetadata = {
            gdprApplies: undefined,
          };
          tcfApiCommandManager = new TcfApiCommandManager(mockPolicyManager);
          expect(
            tcfApiCommandManager.getMinimalPingReturnForTesting(mockMetadata)
          ).to.deep.equals({
            gdprApplies: undefined,
            cmpLoaded: true,
            cmpStatus: 'loaded',
            tcfPolicyVersion: 2,
          });
        });

        it('creates a minimal ping object with no metadata', async () => {
          tcfApiCommandManager = new TcfApiCommandManager(mockPolicyManager);
          expect(
            tcfApiCommandManager.getMinimalPingReturnForTesting()
          ).to.deep.equals({
            gdprApplies: undefined,
            cmpLoaded: true,
            cmpStatus: 'loaded',
            tcfPolicyVersion: 2,
          });
        });

        it('sends a minimal PingReturn via PostMessage', async () => {
          const callId = 'pingCallId';
          data = {
            __tcfapiCall: {
              'command': 'ping',
              callId,
              version: 2,
            },
          };
          mockMetadata = {
            gdprApplies: true,
          };
          tcfApiCommandManager = new TcfApiCommandManager(mockPolicyManager);
          tcfApiCommandManager.handleTcfCommand(data, mockWin);
          await macroTask();

          // No 'success' sent for ping
          const postMessageArgs = mockWin.postMessage.args[0];
          expect(postMessageArgs[0]).to.deep.equals({
            __tcfapiReturn: {
              returnValue: {
                cmpLoaded: true,
                gdprApplies: mockMetadata.gdprApplies,
                cmpStatus: 'loaded',
                tcfPolicyVersion: 2,
              },
              callId,
              success: undefined,
            },
          });
        });
      });
    });
  }
);
