import {user} from '#utils/log';

import {macroTask} from '#testing/helpers';
import {mockWindowInterface} from '#testing/helpers/service';

import {TcfApiCommandManager} from '../tcf-api-command-manager';

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
      let mockTcfPolicyVersion;
      let mockSharedData;
      let callId;

      beforeEach(() => {
        mockWin = mockWindowInterface(env.sandbox);
        mockWin.postMessage = env.sandbox.spy();
        mockMetadata = {};
        mockSharedData = {};
        mockTcString = '';
        mockTcfPolicyVersion = null;
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
          getTcfPolicyVersion: (opt_policy) => {
            return Promise.resolve(mockTcfPolicyVersion);
          },
          setOnPolicyChange: env.sandbox.spy(),
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

        it('allows parameter value in removeEventListener command', () => {
          tcfApiCommandManager = new TcfApiCommandManager(mockPolicyManager);
          msg = {
            __tcfapiCall: {
              'command': 'removeEventListener',
              'parameter': '30',
              'version': 2,
              'callId': 'callId',
            },
          };
          const errorSpy = env.sandbox.stub(user(), 'error');
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
            tcfApiCommandManager.getMinimalPingReturnForTesting(mockMetadata, 4)
          ).to.deep.equals({
            gdprApplies: false,
            cmpLoaded: true,
            cmpStatus: 'loaded',
            tcfPolicyVersion: 4,
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
          mockTcfPolicyVersion = 4;
          mockSharedData = {'data': 'data1'};

          expect(
            tcfApiCommandManager.getMinimalTcDataForTesting(
              mockMetadata,
              mockSharedData,
              mockTcString,
              undefined,
              mockTcfPolicyVersion
            )
          ).to.deep.equals({
            tcfPolicyVersion: mockTcfPolicyVersion,
            gdprApplies: false,
            tcString: mockTcString,
            listenerId: undefined,
            cmpStatus: 'loaded',
            eventStatus: 'tcloaded',
            purposeOneTreatment: false,
            additionalData: {'data': 'data1', 'additionalConsent': 'xyz987'},
          });
        });

        it('sends a minimal TcData via PostMessage without tcfPolicyVersion stored - fallback to tcfPolicyVersion 2', async () => {
          callId = 'getTcDataId';
          data = getData('getTCData', callId);
          mockMetadata = getMetadata(false, 'xyz987', false);
          mockTcString = 'abc123';
          mockSharedData = {'data': 'data1'};
          tcfApiCommandManager = new TcfApiCommandManager(mockPolicyManager);
          tcfApiCommandManager.handleTcfCommand(data, mockWin);
          await macroTask();

          const postMessageArgs = mockWin.postMessage.args[0];
          const tcfApiReturn = getTcfApiReturn(
            callId,
            tcfApiCommandManager.getMinimalTcDataForTesting(
              mockMetadata,
              mockSharedData,
              mockTcString
            ),
            true
          );
          expect(
            postMessageArgs[0]['__tcfapiReturn']['returnValue'][
              'tcfPolicyVersion'
            ]
          ).to.be.equal(2);
          expect(postMessageArgs[0]).to.deep.equals(tcfApiReturn);
        });

        it('sends a minimal TcData via PostMessage', async () => {
          callId = 'getTcDataId';
          data = getData('getTCData', callId);
          mockMetadata = getMetadata(false, 'xyz987', false);
          mockTcString = 'abc123';
          mockTcfPolicyVersion = 4;
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
                mockTcString,
                undefined,
                mockTcfPolicyVersion
              ),
              true
            )
          );
        });
      });

      describe('addEventListener', () => {
        it(
          'responds to changes in policy manager' +
            ' only after command has been sent',
          async () => {
            data = getData('addEventListener', 'callId');
            tcfApiCommandManager = new TcfApiCommandManager(mockPolicyManager);
            const getConsentsSpy = env.sandbox.spy(
              tcfApiCommandManager,
              'getTcDataPromises_'
            );

            // Fake a TcData change
            tcfApiCommandManager.handleTcDataChange_();
            await macroTask();
            expect(getConsentsSpy).to.not.be.called;

            // Fake responding to event
            tcfApiCommandManager.handleTcfCommand(data, mockWin);

            tcfApiCommandManager.handleTcDataChange_();
            await macroTask();
            expect(getConsentsSpy).to.be.calledOnce;

            tcfApiCommandManager.handleTcDataChange_();
            await macroTask();
            expect(getConsentsSpy).to.be.calledTwice;
          }
        );

        it('sends minimal TcData on TcString change', async () => {
          callId = 'callId';
          data = getData('addEventListener', callId);
          mockTcString = 'newTcString';
          tcfApiCommandManager = new TcfApiCommandManager(mockPolicyManager);

          // Start listening for changes
          tcfApiCommandManager.handleTcfCommand(data, mockWin);

          tcfApiCommandManager.handleTcDataChange_();
          await macroTask();

          const postMessageArgs = mockWin.postMessage.args[0];
          expect(postMessageArgs[0]).to.deep.equals(
            getTcfApiReturn(
              callId,
              tcfApiCommandManager.getMinimalTcDataForTesting(
                mockMetadata,
                mockSharedData,
                mockTcString,
                0
              ),
              true
            )
          );
        });

        it('does not send TcData when TcString is the same', async () => {
          data = getData('addEventListener', 'callId');
          mockTcString = 'prevTcString';
          tcfApiCommandManager = new TcfApiCommandManager(mockPolicyManager);
          tcfApiCommandManager.currentTcString_ = 'prevTcString';
          tcfApiCommandManager.handleTcfCommand(data, mockWin);

          // Fake a TcData change
          tcfApiCommandManager.handleTcDataChange_();
          await macroTask();
          expect(mockWin.postMessage).to.not.be.called;
        });

        it('does not send TcData when TcString is null', async () => {
          data = getData('addEventListener', 'callId');
          mockTcString = null;
          tcfApiCommandManager = new TcfApiCommandManager(mockPolicyManager);
          tcfApiCommandManager.currentTcString_ = 'prevTcString';
          tcfApiCommandManager.handleTcfCommand(data, mockWin);

          // Fake a TcData change
          tcfApiCommandManager.handleTcDataChange_();
          await macroTask();
          expect(mockWin.postMessage).to.not.be.called;
        });

        it('creates listenerIds for each callback and sends TcData to each', async () => {
          callId = 'callId';
          mockTcString = 'tcString';
          tcfApiCommandManager = new TcfApiCommandManager(mockPolicyManager);
          for (let listenerId = 0; listenerId < 4; listenerId++) {
            data = getData('addEventListener', `${callId}${listenerId}`);
            tcfApiCommandManager.handleTcfCommand(data, mockWin);
            expect(tcfApiCommandManager.changeListeners_[listenerId]).to.not.be
              .null;
          }

          // Fake a TcData change
          tcfApiCommandManager.handleTcDataChange_();
          await macroTask();

          for (let listenerId = 0; listenerId < 4; listenerId++) {
            const postMessageArgs = mockWin.postMessage.args[listenerId];
            expect(postMessageArgs[0]).to.deep.equals(
              getTcfApiReturn(
                `${callId}${listenerId}`,
                tcfApiCommandManager.getMinimalTcDataForTesting(
                  mockMetadata,
                  mockSharedData,
                  mockTcString,
                  listenerId
                ),
                true
              )
            );
          }
        });
      });

      describe('removeEventListener', () => {
        it('removes listenerId and listener', async () => {
          callId = 'callId';
          mockTcString = 'tcString';
          tcfApiCommandManager = new TcfApiCommandManager(mockPolicyManager);

          // Register listener
          data = getData('addEventListener', `${callId}`);
          tcfApiCommandManager.handleTcfCommand(data, mockWin);
          expect(
            Object.keys(tcfApiCommandManager.changeListeners_).length
          ).to.equal(1);
          tcfApiCommandManager.handleTcDataChange_();
          await macroTask();
          expect(mockWin.postMessage).to.be.calledOnce;

          // Remove listener
          data = getData('removeEventListener', `${callId}`, '0');
          tcfApiCommandManager.handleTcfCommand(data, mockWin);
          expect(
            Object.keys(tcfApiCommandManager.changeListeners_).length
          ).to.equal(0);
        });

        it('sends undefined returnValue', async () => {
          callId = 'callId';
          mockTcString = 'tcString';
          tcfApiCommandManager = new TcfApiCommandManager(mockPolicyManager);

          // Register listener
          data = getData('addEventListener', `${callId}`);
          tcfApiCommandManager.handleTcfCommand(data, mockWin);
          tcfApiCommandManager.handleTcDataChange_();
          await macroTask();

          // Remove listener
          mockWin.postMessage.resetHistory();
          data = getData('removeEventListener', `${callId}`, '0');
          tcfApiCommandManager.handleTcfCommand(data, mockWin);
          const postMessageArgs = mockWin.postMessage.args[0];
          expect(postMessageArgs[0]).to.deep.equal(
            getTcfApiReturn(callId, undefined, true)
          );
        });

        it('handles incorrect listnerId', async () => {
          callId = 'callId';
          mockTcString = 'tcString';
          tcfApiCommandManager = new TcfApiCommandManager(mockPolicyManager);

          // Register listener
          data = getData('addEventListener', `${callId}`);
          tcfApiCommandManager.handleTcfCommand(data, mockWin);
          tcfApiCommandManager.handleTcDataChange_();
          await macroTask();

          // Remove listener
          mockWin.postMessage.resetHistory();
          data = getData('removeEventListener', `${callId}`, '1');
          tcfApiCommandManager.handleTcfCommand(data, mockWin);
          const postMessageArgs = mockWin.postMessage.args[0];
          expect(
            Object.keys(tcfApiCommandManager.changeListeners_).length
          ).to.equal(1);
          expect(postMessageArgs[0]).to.deep.equal(
            getTcfApiReturn(callId, undefined, false)
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
