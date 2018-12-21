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


import {CONSENT_POLICY_STATE} from '../../../../src/consent-state';
import {ConsentConfig, expandPolicyConfig} from '../consent-config';
import {dict} from '../../../../src/utils/object';
import {toggleExperiment} from '../../../../src/experiments';

describes.realWin('ConsentConfig', {amp: 1}, env => {
  let win;
  let doc;
  let element;
  let defaultConfig;
  beforeEach(() => {
    win = env.win;
    doc = env.win.document;
    element = doc.createElement('div');
    toggleExperiment(win, 'multi-consent', true);
    toggleExperiment(win, 'amp-consent-v2', true);
    defaultConfig = dict({
      'consents': {
        'ABC': {
          'checkConsentHref': 'https://response1',
        },
        'DEF': {
          'checkConsentHref': 'https://response1',
        },
      },
    });
  });

  function appendConfigScriptElement(doc, element, config) {
    const scriptElement = doc.createElement('script');
    scriptElement.setAttribute('type', 'application/json');
    scriptElement.textContent = JSON.stringify(config);
    element.appendChild(scriptElement);
  }

  describe('read consent config', () => {
    it('read inline config', () => {
      appendConfigScriptElement(doc, element, defaultConfig);
      const consentConfig = new ConsentConfig(element);
      expect(consentConfig.getConsentConfig()).to.deep.equal(dict({
        'ABC': {
          'checkConsentHref': 'https://response1',
        },
        'DEF': {
          'checkConsentHref': 'https://response1',
        },
      }));
      expect(consentConfig.getPolicyConfig()).to.deep.equal(dict({}));
      expect(consentConfig.getPostPromptUI()).to.not.be.ok;
    });

    it('read cmp config', () => {
      appendConfigScriptElement(doc, element, dict({}));
      element.setAttribute('type', '_ping_');
      const consentConfig = new ConsentConfig(element);
      expect(consentConfig.getConsentConfig()).to.deep.equal(dict({
        '_ping_': {
          'checkConsentHref': '/get-consent-v1',
          'promptUISrc':
              '/test/manual/diy-consent.html',
        },
      }));
      expect(consentConfig.getPolicyConfig()).to.deep.equal(dict({}));
      expect(consentConfig.getPostPromptUI()).to.not.be.ok;
    });

    it('merge inline config w/ cmp config', () => {
      appendConfigScriptElement(doc, element, dict({
        'consents': {
          '_ping_': {
            'promptIfUnknownForGeoGroup': 'eea',
            'checkConsentHref': '/override',
          },
        },
        'policy': {
          'default': {
            'waitFor': {},
          },
        },
        'postPromptUI': 'test',
      }));
      element.setAttribute('type', '_ping_');
      const consentConfig = new ConsentConfig(element);
      expect(consentConfig.getConsentConfig()).to.deep.equal(dict({
        '_ping_': {
          'checkConsentHref': '/override',
          'promptUISrc':
              '/test/manual/diy-consent.html',
          'promptIfUnknownForGeoGroup': 'eea',
        },
      }));
      expect(consentConfig.getPolicyConfig()).to.deep.equal(dict({
        'default': {
          'waitFor': {},
        },
      }));
      expect(consentConfig.getPostPromptUI()).to.equal('test');
    });

    it('assert valid config', () => {
      const scriptTypeError = 'amp-consent/consent-config: <script> child ' +
          'must have type="application/json"';
      const consentExistError = 'amp-consent/consent-config: ' +
          'consents config is required';
      const multiScriptError =
          'amp-consent/consent-config: Found 2 <script> children. Expected 1';
      const invalidJsonError = 'amp-consent/consent-config: ' +
          'Failed to parse <script> contents. Is it valid JSON?';
      const invalidCMPError = 'amp-consent/consent-config: invalid CMP type';
      // Check script type equals to application/json

      const scriptElement = doc.createElement('script');
      scriptElement.textContent = JSON.stringify(defaultConfig);
      scriptElement.setAttribute('type', '');
      element.appendChild(scriptElement);

      expect(() => new ConsentConfig(element).getConsentConfig())
          .to.throw(scriptTypeError);

      // Check consent config exists
      scriptElement.setAttribute('type', 'application/json');
      scriptElement.textContent = JSON.stringify({});
      allowConsoleError(() => {
        expect(() => new ConsentConfig(element).getConsentConfig())
            .to.throw(consentExistError);
      });

      // Check invalid CMP
      element.setAttribute('type', 'not_exist');
      allowConsoleError(() => {
        expect(() => new ConsentConfig(element).getConsentConfig())
            .to.throw(invalidCMPError);
      });

      scriptElement.textContent = '"abc": {"a",}';
      expect(() => new ConsentConfig(element).getConsentConfig())
          .to.throw(invalidJsonError);

      // Check there is only one script object
      scriptElement.textContent = JSON.stringify(defaultConfig);
      const script2 = doc.createElement('script');
      element.appendChild(script2);
      expect(() => new ConsentConfig(element).getConsentConfig())
          .to.throw(multiScriptError);
    });

    it('remove not supported policy', () => {
      toggleExperiment(win, 'multi-consent', false);
      appendConfigScriptElement(doc, element, dict({
        'consents': {
          'ABC': 'r1',
        },
        'policy': {
          'ABC': undefined,
        },
      }));
      const consentConfig = new ConsentConfig(element);
      expect(consentConfig.getPolicyConfig()).to.deep.equal({});
    });
  });

  describe('expandPolicyConfig', () => {
    it('create default policy', () => {
      const policy = expandPolicyConfig(dict({}), defaultConfig['consents']);
      expect(policy['default']).to.deep.equal({
        'waitFor': {
          'ABC': undefined,
          'DEF': undefined,
        },
      });
    });

    it('create predefined _till_responded policy', function* () {
      const policy = expandPolicyConfig(dict({}), defaultConfig['consents']);
      expect(policy['_till_responded']).to.deep.equal({
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

    it('create predefined _till_accepted policy', function* () {
      const policy = expandPolicyConfig(dict({}), defaultConfig['consents']);
      expect(policy['_till_accepted']).to.deep.equal({
        'waitFor': {
          'ABC': undefined,
          'DEF': undefined,
        },
      });
    });

    it('create default _auto_reject policy', function* () {
      const policy = expandPolicyConfig(dict({}), defaultConfig['consents']);
      expect(policy['_auto_reject']).to.deep.equal({
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
      const policy = expandPolicyConfig(dict({
        'default': {
          'waitFor': {
            'ABC': [],
          },
        },
      }), defaultConfig['consents']);
      expect(policy['default']).to.deep.equal({
        'waitFor': {
          'ABC': [],
        },
      });
      expect(policy['_till_accepted']).to.deep.equal({
        'waitFor': {
          'ABC': undefined,
          'DEF': undefined,
        },
      });
    });
  });
});
