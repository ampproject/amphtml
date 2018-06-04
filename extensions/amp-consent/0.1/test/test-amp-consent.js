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

import {ACTION_TYPE, AMP_CONSENT_EXPERIMENT, AmpConsent} from '../amp-consent';
import {CONSENT_ITEM_STATE} from '../consent-state-manager';
import {CONSENT_POLICY_STATE} from '../../../../src/consent-state';
import {MULTI_CONSENT_EXPERIMENT} from '../consent-policy-manager';
import {computedStyle} from '../../../../src/style';
import {dev} from '../../../../src/log';
import {macroTask} from '../../../../testing/yield';

import {
  registerServiceBuilder,
  resetServiceForTesting,
} from '../../../../src/service';
import {toggleExperiment} from '../../../../src/experiments';

describes.realWin('amp-consent', {
  amp: {
    extensions: ['amp-consent'],
    ampdoc: 'single',
  },
}, env => {
  let win;
  let doc;
  let jsonMockResponses;
  let storageValue;
  let requestBody;
  let ISOCountryGroups;

  beforeEach(() => {
    doc = env.win.document;
    win = env.win;
    toggleExperiment(win, AMP_CONSENT_EXPERIMENT, true);
    toggleExperiment(win, MULTI_CONSENT_EXPERIMENT, true);

    storageValue = {};
    jsonMockResponses = {
      'response1': '{"promptIfUnknown": true}',
      'response2': '{}',
      'response3': '{"promptIfUnknown": false}',
    };

    resetServiceForTesting(win, 'xhr');
    registerServiceBuilder(win, 'xhr', function() {
      return {fetchJson: (url, init) => {
        requestBody = init.body;
        expect(init.credentials).to.equal('include');
        expect(init.method).to.equal('POST');
        return Promise.resolve({
          json() {
            return Promise.resolve(JSON.parse(jsonMockResponses[url]));
          },
        });
      }};
    });

    resetServiceForTesting(win, 'geo');
    registerServiceBuilder(win, 'geo', function() {
      return Promise.resolve({
        'ISOCountryGroups': ISOCountryGroups,
      });
    });

    resetServiceForTesting(win, 'storage');
    registerServiceBuilder(win, 'storage', function() {
      return Promise.resolve({
        get: name => {
          return Promise.resolve(storageValue[name]);
        },
        set: (name, value) => {
          storageValue[name] = value;
          return Promise.resolve();
        },
      });
    });
  });

  describe('amp-consent', () => {
    describe('consent config', () => {
      let defaultConfig;
      let consentElement;
      let scriptElement;
      beforeEach(() => {
        defaultConfig = {
          'consents': {
            'ABC': {
              'checkConsentHref': 'response1',
            },
            'DEF': {
              'checkConsentHref': 'response1',
            },
          },
        };
        consentElement = doc.createElement('amp-consent');
        consentElement.setAttribute('id', 'amp-consent');
        consentElement.setAttribute('layout', 'nodisplay');
        scriptElement = doc.createElement('script');
        scriptElement.setAttribute('type', 'application/json');
      });

      it('read config', () => {
        scriptElement.textContent = JSON.stringify(defaultConfig);
        consentElement.appendChild(scriptElement);
        doc.body.appendChild(consentElement);
        const ampConsent = new AmpConsent(consentElement);
        ampConsent.buildCallback();
        expect(ampConsent.consentConfig_).to.deep.equal(
            defaultConfig['consents']);
      });

      it.skip('assert valid config', () => {
        // TODO(@zhouyx): Unskip/remove this test that check for error throwing
        // Check script type equals to application/json
        scriptElement.textContent = JSON.stringify(defaultConfig);
        consentElement.appendChild(scriptElement);
        scriptElement.setAttribute('type', '');
        allowConsoleError(() => {
          expect(() => ampConsent.assertAndParseConfig_()).to.throw();
        });
        doc.body.appendChild(consentElement);
        const ampConsent = new AmpConsent(consentElement);
        allowConsoleError(() => {
          expect(() => ampConsent.assertAndParseConfig_()).to.throw();
        });

        // Check consent config exists
        scriptElement.setAttribute('type', 'application/json');
        scriptElement.textContent = JSON.stringify({});
        allowConsoleError(() => {
          expect(() => ampConsent.assertAndParseConfig_()).to.throw();
        });

        // Check there is only one script object
        scriptElement.textContent = JSON.stringify(defaultConfig);
        const script2 = doc.createElement('script');
        consentElement.appendChild(script2);
        allowConsoleError(() => {
          expect(() => ampConsent.assertAndParseConfig_()).to.throw();
        });
      });
    });
  });

  describe('server communication', () => {
    let defaultConfig;
    let ampConsent;
    beforeEach(() => {
      defaultConfig = {
        'consents': {
          'ABC': {
            'checkConsentHref': 'response1',
          },
        },
      };
      const consentElement = doc.createElement('amp-consent');
      consentElement.setAttribute('id', 'amp-consent');
      consentElement.setAttribute('layout', 'nodisplay');
      const scriptElement = doc.createElement('script');
      scriptElement.setAttribute('type', 'application/json');
      scriptElement.textContent = JSON.stringify(defaultConfig);
      consentElement.appendChild(scriptElement);
      doc.body.appendChild(consentElement);
      ampConsent = new AmpConsent(consentElement);
    });

    it('send post request to server', function* () {
      ampConsent.buildCallback();
      yield macroTask();
      expect(requestBody).to.deep.equal({
        'consentInstanceId': 'ABC',
      });
    });

    it('parse server response', function* () {
      const parseSpy = sandbox.spy(ampConsent, 'isPromptRequired_');
      ampConsent.buildCallback();
      yield macroTask();
      expect(parseSpy).to.be.calledWith('ABC', {
        'promptIfUnknown': true,
      });
    });
  });

  describe('amp-geo integration', () => {
    let defaultConfig;
    let ampConsent;
    let scriptElement;
    let consentElement;
    beforeEach(() => {
      defaultConfig = {
        'consents': {
          'ABC': {
            'promptIfUnknownForGeoGroup': 'testGroup',
          },
        },
      };
      consentElement = doc.createElement('amp-consent');
      consentElement.setAttribute('id', 'amp-consent');
      consentElement.setAttribute('layout', 'nodisplay');
      scriptElement = doc.createElement('script');
      scriptElement.setAttribute('type', 'application/json');
      scriptElement.textContent = JSON.stringify(defaultConfig);
      doc.body.appendChild(consentElement);
    });

    it('in geo group', function* () {
      consentElement.appendChild(scriptElement);
      ampConsent = new AmpConsent(consentElement);
      ISOCountryGroups = ['unknown', 'testGroup'];
      ampConsent.buildCallback();
      yield macroTask();
      expect(ampConsent.consentRequired_['ABC']).to.equal(true);
    });

    it('not in geo group', function* () {
      consentElement.appendChild(scriptElement);
      ampConsent = new AmpConsent(consentElement);
      ISOCountryGroups = ['unknown'];
      ampConsent.buildCallback();
      yield macroTask();
      expect(ampConsent.consentRequired_['ABC']).to.equal(false);
    });

    it('promptIfUnknow override geo', function* () {
      ISOCountryGroups = ['unknown'];
      defaultConfig = {
        'consents': {
          'ABC': {
            'checkConsentHref': 'response1',
            'promptIfUnknownForGeoGroup': 'testGroup',
          },
        },
      };
      scriptElement.textContent = JSON.stringify(defaultConfig);
      consentElement.appendChild(scriptElement);
      ampConsent = new AmpConsent(consentElement);
      ampConsent.buildCallback();
      yield macroTask();
      expect(ampConsent.consentRequired_['ABC']).to.equal(true);
    });

    it('promptIfUnknow override geo with false value', function* () {
      ISOCountryGroups = ['unknown'];
      defaultConfig = {
        'consents': {
          'ABC': {
            'checkConsentHref': 'response3',
            'promptIfUnknownForGeoGroup': 'unknown',
          },
        },
      };
      scriptElement.textContent = JSON.stringify(defaultConfig);
      consentElement.appendChild(scriptElement);
      ampConsent = new AmpConsent(consentElement);
      ampConsent.buildCallback();
      yield macroTask();
      expect(ampConsent.consentRequired_['ABC']).to.equal(false);
    });

    it('checkConsentHref w/o promptIfUnknow not override geo', function* () {
      ISOCountryGroups = ['testGroup'];
      defaultConfig = {
        'consents': {
          'ABC': {
            'checkConsentHref': 'response2',
            'promptIfUnknownForGeoGroup': 'testGroup',
          },
        },
      };
      scriptElement.textContent = JSON.stringify(defaultConfig);
      consentElement.appendChild(scriptElement);
      ampConsent = new AmpConsent(consentElement);
      ampConsent.buildCallback();
      yield macroTask();
      expect(ampConsent.consentRequired_['ABC']).to.equal(true);
    });
  });

  describe('policy config', () => {
    let defaultConfig;
    let ampConsent;
    let scriptElement;
    let consentElement;
    beforeEach(() => {
      defaultConfig = {
        'consents': {
          'ABC': {
            'checkConsentHref': 'response1',
          },
          'DEF': {
            'checkConsentHref': 'response1',
          },
        },
      };
      consentElement = doc.createElement('amp-consent');
      consentElement.setAttribute('id', 'amp-consent');
      consentElement.setAttribute('layout', 'nodisplay');
      scriptElement = doc.createElement('script');
      scriptElement.setAttribute('type', 'application/json');
      scriptElement.textContent = JSON.stringify(defaultConfig);
      consentElement.appendChild(scriptElement);
      doc.body.appendChild(consentElement);
      ampConsent = new AmpConsent(consentElement);
    });

    it('create default policy', function* () {
      ampConsent.buildCallback();
      yield macroTask();
      expect(ampConsent.policyConfig_['default']).to.deep.equal({
        'waitFor': {
          'ABC': undefined,
          'DEF': undefined,
        },
      });
    });

    it('create predefined _if_responded policy', function* () {
      ampConsent.buildCallback();
      yield macroTask();
      expect(ampConsent.policyConfig_['_if_responded']).to.deep.equal({
        'waitFor': {
          'ABC': undefined,
          'DEF': undefined,
        },
        'unblockOn': [
          CONSENT_POLICY_STATE.UNKNOWN,
          CONSENT_POLICY_STATE.SUFFICIENT,
          CONSENT_POLICY_STATE.INSUFFICIENT,
          CONSENT_POLICY_STATE.UNKNOWN_NOT_REQUIRED,
        ],
      });
    });

    it('create predefined _if_accepted policy', function* () {
      ampConsent.buildCallback();
      yield macroTask();
      expect(ampConsent.policyConfig_['_if_accepted']).to.deep.equal({
        'waitFor': {
          'ABC': undefined,
          'DEF': undefined,
        },
      });
    });

    it('create default _auto_reject policy', function* () {
      ampConsent.buildCallback();
      yield macroTask();
      expect(ampConsent.policyConfig_['_auto_reject']).to.deep.equal({
        'waitFor': {
          'ABC': undefined,
          'DEF': undefined,
        },
        'timeout': {
          'seconds': 0,
          'fallbackAction': 'reject',
        },
        'unblockOn': [
          CONSENT_POLICY_STATE.UNKNOWN,
          CONSENT_POLICY_STATE.SUFFICIENT,
          CONSENT_POLICY_STATE.INSUFFICIENT,
          CONSENT_POLICY_STATE.UNKNOWN_NOT_REQUIRED,
        ],
      });
    });

    it('override default policy', function* () {
      defaultConfig = {
        'consents': {
          'ABC': {
            'checkConsentHref': 'response1',
          },
          'DEF': {
            'checkConsentHref': 'response1',
          },
        },
        'policy': {
          'default': {
            'waitFor': {
              'ABC': [],
            },
          },
        },
      };
      scriptElement.textContent = JSON.stringify(defaultConfig);
      ampConsent = new AmpConsent(consentElement);
      ampConsent.buildCallback();
      yield macroTask();
      expect(ampConsent.policyConfig_['default']).to.deep.equal({
        'waitFor': {
          'ABC': [],
        },
      });
      expect(ampConsent.policyConfig_['_if_accepted']).to.deep.equal({
        'waitFor': {
          'ABC': undefined,
          'DEF': undefined,
        },
      });
    });
  });

  describe('UI', () => {
    let uiElement;
    let defaultConfig;
    let ampConsent;
    let updateConsentInstanceStateSpy;
    let consentElement;
    let postPromptUI;
    beforeEach(() => {
      defaultConfig = {
        'consents': {
          'ABC': {
            'checkConsentHref': 'response1',
            'promptUI': '123',
          },
          'DEF': {
            'checkConsentHref': 'response1',
            'promptUI': '123',
          },
          'GH': {
            'checkConsentHref': 'response1',
            'promptUI': '123',
          },
        },
        'postPromptUI': 'test',
      };
      consentElement = doc.createElement('amp-consent');
      consentElement.setAttribute('id', 'amp-consent');
      consentElement.setAttribute('layout', 'nodisplay');
      const scriptElement = doc.createElement('script');
      scriptElement.setAttribute('type', 'application/json');
      scriptElement.textContent = JSON.stringify(defaultConfig);
      uiElement = document.createElement('div');
      uiElement.setAttribute('id', '123');
      consentElement.appendChild(uiElement);
      consentElement.appendChild(scriptElement);
      postPromptUI = document.createElement('div');
      postPromptUI.setAttribute('id', 'test');
      consentElement.appendChild(postPromptUI);
      doc.body.appendChild(consentElement);
      ampConsent = new AmpConsent(consentElement);
      sandbox.stub(ampConsent.vsync_, 'mutate').callsFake(fn => {
        fn();
      });
    });

    it('update current displaying consent', function* () {
      ampConsent.buildCallback();
      yield macroTask();
      updateConsentInstanceStateSpy =
          sandbox.spy(ampConsent.consentStateManager_,
              'updateConsentInstanceState');
      yield macroTask();
      yield macroTask();
      yield macroTask();
      ampConsent.handleAction_(ACTION_TYPE.ACCEPT);
      expect(updateConsentInstanceStateSpy).to.be.calledWith(
          'ABC', CONSENT_ITEM_STATE.ACCEPTED);
      yield macroTask();
      ampConsent.handleAction_(ACTION_TYPE.REJECT);
      expect(updateConsentInstanceStateSpy).to.be.calledWith(
          'DEF', CONSENT_ITEM_STATE.REJECTED);
      yield macroTask();
      ampConsent.handleAction_(ACTION_TYPE.DISMISS);
      expect(updateConsentInstanceStateSpy).to.be.calledWith(
          'GH', CONSENT_ITEM_STATE.DISMISSED);
    });

    it('throw error when no consent is displaying', function* () {
      ampConsent.buildCallback();
      yield macroTask();
      updateConsentInstanceStateSpy =
          sandbox.spy(ampConsent.consentStateManager_,
              'updateConsentInstanceState');
      ampConsent.handleAction_(ACTION_TYPE.DISMISS);
      yield macroTask();
      ampConsent.handleAction_(ACTION_TYPE.DISMISS);
      yield macroTask();
      ampConsent.handleAction_(ACTION_TYPE.DISMISS);
      yield macroTask();
      const errorSpy = sandbox.stub(dev(), 'error');
      ampConsent.handleAction_(ACTION_TYPE.DISMISS);
      expect(errorSpy).to.be.calledWith('amp-consent',
          'No consent ui is displaying, consent id null');
    });

    describe('schedule display', () => {
      it('should check for pending consent UI', function* () {
        ampConsent.buildCallback();
        yield macroTask();
        expect(ampConsent.notificationUiManager_.queueSize_).to.equal(3);
        ampConsent.scheduleDisplay_('ABC');
        expect(ampConsent.notificationUiManager_.queueSize_).to.equal(3);
        ampConsent.hide_();
        yield macroTask();
        expect(ampConsent.notificationUiManager_.queueSize_).to.equal(2);
        ampConsent.scheduleDisplay_('GH');
        expect(ampConsent.notificationUiManager_.queueSize_).to.equal(2);
        ampConsent.scheduleDisplay_('ABC');
        expect(ampConsent.notificationUiManager_.queueSize_).to.equal(3);
      });
    });

    describe('postPromptUI', () => {
      beforeEach(() => {
        storageValue = {
          'amp-consent:ABC': CONSENT_ITEM_STATE.ACCEPTED,
          'amp-consent:DEF': CONSENT_ITEM_STATE.ACCEPTED,
          'amp-consent:GH': CONSENT_ITEM_STATE.ACCEPTED,
        };
        ampConsent.buildCallback();
      });

      it('handle postPromptUI', function* () {
        expect(ampConsent.postPromptUI_).to.not.be.null;
        expect(computedStyle(ampConsent.win, ampConsent.element)['display'])
            .to.equal('none');
        expect(computedStyle(ampConsent.win, ampConsent.postPromptUI_)
            ['display']).to.equal('none');
        yield macroTask();

        expect(computedStyle(ampConsent.win, ampConsent.element)['display'])
            .to.not.equal('none');
        expect(ampConsent.element.classList.contains('amp-active')).to.be.true;
        expect(ampConsent.element.classList.contains('amp-hidden')).to.be.false;
        expect(computedStyle(ampConsent.win, ampConsent.postPromptUI_)
            ['display']).to.not.equal('none');
        ampConsent.scheduleDisplay_('ABC');
        expect(computedStyle(ampConsent.win, ampConsent.postPromptUI_)
            ['display']).to.equal('none');
      });
    });
  });
});
