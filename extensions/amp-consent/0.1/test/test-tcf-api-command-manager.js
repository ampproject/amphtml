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
      let mockTcString;
      let mockSharedData;
      let callId;

      beforeEach(() => {
        mockWin = mockWindowInterface(window.sandbox);
        mockWin.postMessage = window.sandbox.spy();
        mockMetadata = {};
        mockSharedData = {};
        mockTcString = '';
        mockPolicyManager = {
          getConsentMetadataInfo: (opt_policy) => {
            return Promise.resolve(mockMetadata);
          },
          getConsentStringInfo: (opt_policy) => {
            return Promise.resolve(mockTcString);
          },
          getMergedSharedData: (opt_policy) => {
            return Promise.resolve(mockSharedData);
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
          mockMetadata = getMetadata(false);
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
          mockMetadata = getMetadata();
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
          callId = 'pingCallId';
          data = getData('ping', callId);
          mockMetadata = getMetadata(true);
          tcfApiCommandManager = new TcfApiCommandManager(mockPolicyManager);
          tcfApiCommandManager.handleTcfCommand(data, mockWin);
          await macroTask();

          // No 'success' sent for ping
          const postMessageArgs = mockWin.postMessage.args[0];
          expect(postMessageArgs[0]).to.deep.equals(
            getTcfApiReturn(
              callId,
              tcfApiCommandManager.getMinimalPingReturnForTesting(mockMetadata)
            )
          );
        });
      });

      describe('handleGetTcData', () => {
        it('creates a minimal TcData object', async () => {
          mockMetadata = getMetadata(false, 'xyz987', false);
          tcfApiCommandManager = new TcfApiCommandManager(mockPolicyManager);
          expect(
            tcfApiCommandManager.getMinimalTcDataForTesting(
              mockMetadata,
              mockSharedData,
              mockTcString
            )
          ).to.deep.equals({
            tcfPolicyVersion: 2,
            gdprApplies: false,
            tcString: mockTcString,
            listenerId: undefined,
            cmpStatus: 'loaded',
            eventStatus: 'tcloaded',
            purposeOneTreatment: false,
            additionalData: {'additionalConsent': 'xyz987'},
          });

          mockTcString = 'abc123';
          mockSharedData = {'data': 'data1'};

          expect(
            tcfApiCommandManager.getMinimalTcDataForTesting(
              mockMetadata,
              mockSharedData,
              mockTcString
            )
          ).to.deep.equals({
            tcfPolicyVersion: 2,
            gdprApplies: false,
            tcString: mockTcString,
            listenerId: undefined,
            cmpStatus: 'loaded',
            eventStatus: 'tcloaded',
            purposeOneTreatment: false,
            additionalData: {'data': 'data1', 'additionalConsent': 'xyz987'},
          });
        });

        it('sends a minimal TcData via PostMessage', async () => {
          callId = 'getTcDataId';
          data = getData('getTCData', callId);
          mockMetadata = getMetadata(false, 'xyz987', false);
          mockTcString = 'abc123';
          mockSharedData = {'data': 'data1'};
          tcfApiCommandManager = new TcfApiCommandManager(mockPolicyManager);
          tcfApiCommandManager.handleTcfCommand(data, mockWin);
          await macroTask();

          const postMessageArgs = mockWin.postMessage.args[0];
          expect(postMessageArgs[0]).to.deep.equals(
            getTcfApiReturn(
              callId,
              tcfApiCommandManager.getMinimalTcDataForTesting(
                mockMetadata,
                mockSharedData,
                mockTcString
              ),
              true
            )
          );
        });
      });
    });
  }
);

/**
 * @param {string} command
 * @param {string} callId
 * @param {string=} opt_parameter
 */
function getData(command, callId, opt_parameter) {
  return {
    __tcfapiCall: {
      command,
      callId,
      version: 2,
      parameter: opt_parameter,
    },
  };
}

/**
 * @param {string=} opt_gdprApplies
 * @param {string=} opt_addtlConsent
 * @param {boolean=} opt_purposeOne
 */
function getMetadata(opt_gdprApplies, opt_addtlConsent, opt_purposeOne) {
  return {
    gdprApplies: opt_gdprApplies,
    additionalConsent: opt_addtlConsent,
    purposeOne: opt_purposeOne,
  };
}

/**
 * @param {string} callId
 * @param {Object=} opt_returnValue
 * @param {boolean=} opt_success
 */
function getTcfApiReturn(callId, opt_returnValue, opt_success) {
  return {
    __tcfapiReturn: {
      callId,
      returnValue: opt_returnValue,
      success: opt_success,
    },
  };
}
