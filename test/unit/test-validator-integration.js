/**
 * @fileoverview Description of this file.
 */

import * as eventHelper from '#utils/event-helper';

import * as mode from '../../src/mode';
import {loadScript, maybeValidate} from '../../src/validator-integration';

describes.fakeWin('validator-integration', {}, (env) => {
  let loadScriptStub;
  let getModeStub;
  let isModeDevelopmentStub;
  let win;
  describe('maybeValidate', () => {
    beforeEach(() => {
      win = env.win;
      loadScriptStub = env.sandbox
        .stub(eventHelper, 'loadPromise')
        .returns(Promise.resolve());
      getModeStub = env.sandbox.stub(mode, 'getMode');
      isModeDevelopmentStub = env.sandbox.stub(mode, 'isModeDevelopment');
    });

    it('should not load validator script if not in dev mode', () => {
      getModeStub.returns({});
      isModeDevelopmentStub.returns(false);
      maybeValidate(win);
      expect(loadScriptStub).not.to.have.been.called;
    });

    it('should not load validator script if bypassed', () => {
      getModeStub.returns({test: true});
      isModeDevelopmentStub.returns(true);
      win.location = 'https://www.example.com/#development=1&validate=0';
      maybeValidate(win);
      expect(loadScriptStub).not.to.have.been.called;
    });

    it('should load validator script if dev mode', () => {
      getModeStub.returns({});
      isModeDevelopmentStub.returns(true);
      loadScriptStub.returns(Promise.resolve());
      maybeValidate(win);
      expect(loadScriptStub).to.have.been.called;
    });

    it('should load WebAssembly validator', () => {
      getModeStub.returns({test: true});
      isModeDevelopmentStub.returns(true);
      win.location = 'https://www.example.com/#development=1';
      maybeValidate(win);
      expect(loadScriptStub).to.have.been.calledWith(
        env.sandbox.match(
          (el) =>
            el.getAttribute('src') ===
            'https://cdn.ampproject.org/v0/validator_wasm.js'
        )
      );
    });
  });

  describe('loadScript', () => {
    it('should propagate pre-existing nonces', () => {
      const scriptEl = env.win.document.createElement('script');
      scriptEl.setAttribute('nonce', '');
      scriptEl.nonce = '123';
      win.document.head.append(scriptEl);

      loadScriptStub = env.sandbox
        .stub(eventHelper, 'loadPromise')
        .returns(Promise.resolve());

      loadScript(
        win.document,
        'https://cdn.ampproject.org/v0/validator_wasm.js'
      );

      expect(loadScriptStub).calledWith(
        env.sandbox.match((el) => el.nonce === '123')
      );
    });
  });
});
