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

import {handleTcfCommand} from '../tcf-api-commands';
import {macroTask} from '../../../../testing/yield';
import {mockWindowInterface} from '../../../../testing/test-helper';

describes.realWin(
  'tcf api commands',
  {
    amp: {
      extensions: ['amp-consent'],
      ampdoc: 'single',
    },
  },
  () => {
    describe('tcf Commands', () => {
      let mockWin;
      let mockPolicyManager;
      let mockMetadata;
      let payload;

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

      describe('handlePingEvent', () => {
        it('sends a minimal PingReturn via PostMessage', async () => {
          const callId = 'pingCallId';
          payload = {
            'command': 'ping',
            callId,
          };
          mockMetadata = {
            gdprApplies: true,
          };
          handleTcfCommand(payload, mockWin, mockPolicyManager);
          await macroTask();

          // No 'success' sent for ping
          const postMessageArgs = mockWin.postMessage.args[0];
          expect(postMessageArgs[0]).to.deep.equals({
            __tcfapiReturn: {
              returnValue: {
                cmpLoaded: true,
                gdprApplies: mockMetadata.gdprApplies,
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
