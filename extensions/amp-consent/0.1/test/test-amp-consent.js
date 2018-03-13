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
import {toggleExperiment} from '../../../../src/experiments';
import {
  getService,
  registerServiceBuilder,
  resetServiceForTesting,
} from '../../../../src/service';
import {installXhrService} from '../../../../src/service/xhr-impl';
import {Services} from '../../../../src/services';

describes.realWin('amp-consent', {
  amp: {
    extensions: ['amp-consent'],
  },
}, env => {
  let win;
  let ampdoc;
  let doc;
  let jsonMockResponses;

  beforeEach(() => {
    doc = env.win.document;
    win = env.win;
    ampdoc = env.ampdoc;
    toggleExperiment(win, 'amp-consent', true);
    jsonMockResponses = {
      'consentRequired': true,
      'prompt': true,
    };
    jsonMockResponses = {
      'invalidConfig': '{"transport": {"iframe": "fake.com"}}',
      'config1': '{"vars": {"title": "remote"}}',
      'https://foo/Test%20Title': '{"vars": {"title": "magic"}}',
      'config-rv2': '{"requests": {"foo": "https://example.com/remote"}}',
    };
    resetServiceForTesting(win, 'xhr');
    registerServiceBuilder(win, 'xhr', function() {
      return {fetchJson: (url, init) => {
        return Promise.resolve({
          json() {
            console.log('json');
            return Promise.resolve(JSON.parse(jsonMockResponses[url]));
          },
        });
      }};
    });
    resetServiceForTesting(win, 'cid');
    registerServiceBuilder(win, 'cid', function() {
      return {get: () => {
        return Promise.resolve('cid123');
      }};
    });

    // installXhrService(win);
    // sandbox.stub(Services, 'xhrFor').returns(
    //     {fetchJson: () => {
    //       console.log("fetchJson");
    //       return Promise.resolve({
    //         json() {
    //           return Promise.resolve(JSON.parse('{"transport": {"iframe": "fake.com"}}'));
    //         },
    //       });
    //     }
    //     });
  });

  describe('amp-consent', () => {
    let defaultConfig;
    let consentElement;
    let scriptElement;
    describe('consent config', () => {
      let defaultConfig;
      let consentElement;
      let scriptElement;
      beforeEach(() => {
        defaultConfig = {
          'consents': {
            'ABC': {
              'check-consent-href': 'http://localhost:8000/get-consent',
            },
            'DEF': {
              'check-consent-href': 'http://localhost:8000/get-consent',
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

      });
    });
  });

  describe('server communication', () => {
    it('send post request to server', () => {

    });

    it('pass persist state to server', () => {

    });

    it('assert server endpoint valid', () => {

    });

    it('parse server response', () => {

    });
  });

  describe('policy config', () => {
    it('create default policy', () => {

    });
  });

  describe('UI', () => {

  });
});
