/**
 * @fileoverview Description of this file.
 */
/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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

import * as eventHelper from '../../src/event-helper';
import * as mode from '../../src/mode';
import {loadScript, maybeValidate} from '../../src/validator-integration';

describes.fakeWin('validator-integration', {}, (env) => {
  let loadScriptStub;
  let modeStub;
  let win;
  describe('maybeValidate', () => {
    beforeEach(() => {
      win = env.win;
      loadScriptStub = env.sandbox.stub(eventHelper, 'loadPromise');
      modeStub = env.sandbox.stub(mode, 'getMode');
    });

    it('should not load validator script if not in dev mode', () => {
      modeStub.returns({development: false});
      maybeValidate(win);
      expect(loadScriptStub).not.to.have.been.called;
    });

    it('should not load validator script if bypassed', () => {
      modeStub.returns({development: true, test: true});
      win.location = 'https://www.example.com/#development=1&validate=0';
      maybeValidate(win);
      expect(loadScriptStub).not.to.have.been.called;
    });

    it('should load validator script if dev mode', () => {
      modeStub.returns({development: true});
      loadScriptStub.returns(Promise.resolve());
      maybeValidate(win);
      expect(loadScriptStub).to.have.been.called;
    });
  });

  describe('loadScript', () => {
    it('should propagate pre-existing nonces', () => {
      const scriptEl = env.win.document.createElement('script');
      scriptEl.setAttribute('nonce', '123');
      win.document.head.append(scriptEl);
      loadScriptStub = env.sandbox
        .stub(eventHelper, 'loadPromise')
        .returns(Promise.resolve());

      loadScript(win.document, 'http://example.com');

      expect(loadScriptStub).calledWith(
        env.sandbox.match((el) => el.getAttribute('nonce') === '123')
      );
    });
  });
});
