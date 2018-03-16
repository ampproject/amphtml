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

import {AmpConsent} from '../amp-consent';
import {CONSENT_ITEM_STATE} from '../consent-state-manager';
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

  beforeEach(() => {
    doc = env.win.document;
    win = env.win;
    toggleExperiment(win, 'amp-consent', true);
    storageValue = {};
    jsonMockResponses = {
      'response1': '{"consentRequired": true, "prompt": true}',
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

      it('assert valid config', () => {
        // Check script type equals to application/json
        scriptElement.textContent = JSON.stringify(defaultConfig);
        consentElement.appendChild(scriptElement);
        scriptElement.setAttribute('type', '');
        expect(() => ampConsent.assertAndParseConfig_()).to.throw();
        doc.body.appendChild(consentElement);
        const ampConsent = new AmpConsent(consentElement);
        expect(() => ampConsent.assertAndParseConfig_()).to.throw();

        // Check consent config exists
        scriptElement.setAttribute('type', 'application/json');
        scriptElement.textContent = JSON.stringify({});
        expect(() => ampConsent.assertAndParseConfig_()).to.throw();

        // Check there is only one script object
        scriptElement.textContent = JSON.stringify(defaultConfig);
        const script2 = doc.createElement('script');
        consentElement.appendChild(script2);
        expect(() => ampConsent.assertAndParseConfig_()).to.throw();
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
      const parseSpy = sandbox.spy(ampConsent, 'parseConsentResponse_');
      ampConsent.buildCallback();
      yield macroTask();
      expect(parseSpy).to.be.calledWith('ABC', {
        'consentRequired': true,
        'prompt': true,
      });
    });
  });

  describe('policy config', () => {
    let defaultConfig;
    let ampConsent;
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
      const consentElement = doc.createElement('amp-consent');
      consentElement.setAttribute('layout', 'nodisplay');
      const scriptElement = doc.createElement('script');
      scriptElement.setAttribute('type', 'application/json');
      scriptElement.textContent = JSON.stringify(defaultConfig);
      consentElement.appendChild(scriptElement);
      doc.body.appendChild(consentElement);
      ampConsent = new AmpConsent(consentElement);
    });

    it('create default policy', function* () {
      ampConsent.buildCallback();
      yield macroTask();
      expect(ampConsent.policyConfig_).to.deep.equal({
        'default': {
          'waitFor': {
            'ABC': undefined,
            'DEF': undefined,
          },
        },
      });
    });
  });

  describe('UI', () => {

  });
});
