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

import * as TcfApiCommands from '../tcf-api-commands';
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
      let msg;

      describe('isValidTcfApiCall', () => {
        it('validates __tcfapiCall post message', async () => {
          msg = {};
          const errorSpy = env.sandbox.stub(user(), 'error');
          msg.__tcfapiCall = 'bad';
          expect(TcfApiCommands.isValidTcfApiCall(msg.__tcfapiCall)).to.be
            .false;
          expect(errorSpy.args[0][1]).to.match(
            /"tcfapiCall" is not an object: bad/
          );
          errorSpy.resetHistory();

          msg.__tcfapiCall = {
            'command': 'bad',
          };
          expect(TcfApiCommands.isValidTcfApiCall(msg.__tcfapiCall)).to.be
            .false;
          expect(errorSpy.args[0][1]).to.match(
            /Unsupported command found in "tcfapiCall": bad/
          );
          errorSpy.resetHistory();

          msg.__tcfapiCall.command = 'ping';
          msg.__tcfapiCall.parameter = [1, 2, 3];
          expect(TcfApiCommands.isValidTcfApiCall(msg.__tcfapiCall)).to.be
            .false;
          expect(errorSpy.args[0][1]).to.match(
            /Unsupported parameter found in "tcfapiCall": [1,2,3]/
          );
          errorSpy.resetHistory();

          msg.__tcfapiCall.parameter = undefined;
          msg.__tcfapiCall.version = 1;
          expect(TcfApiCommands.isValidTcfApiCall(msg.__tcfapiCall)).to.be
            .false;
          expect(errorSpy.args[0][1]).to.match(
            /Found incorrect version in "tcfapiCall": 1/
          );
          errorSpy.resetHistory();

          msg.__tcfapiCall.version = 2;
          expect(TcfApiCommands.isValidTcfApiCall(msg.__tcfapiCall)).to.be.true;
          expect(errorSpy).to.not.be.called;
        });
      });
    });
  }
);
