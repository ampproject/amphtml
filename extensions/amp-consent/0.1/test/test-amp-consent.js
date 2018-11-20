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

import {
  ACTION_TYPE,
  AmpConsent,
} from '../amp-consent';
import {CONSENT_ITEM_STATE} from '../consent-state-manager';
import {dict} from '../../../../src/utils/object';
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
  let ampdoc;
  let jsonMockResponses;
  let storageValue;
  let requestBody;
  let ISOCountryGroups;
  let xhrServiceMock;

  beforeEach(() => {
    doc = env.win.document;
    ampdoc = env.ampdoc;
    win = env.win;
    toggleExperiment(win, 'multi-consent', true);
    toggleExperiment(win, 'amp-consent-v2', true);


    storageValue = {};
    jsonMockResponses = {
      'https://response1/': '{"promptIfUnknown": true}',
      'https://response2/': '{}',
      'https://response3/': '{"promptIfUnknown": false}',
    };

    xhrServiceMock = {fetchJson: (url, init) => {
      requestBody = init.body;
      expect(init.credentials).to.equal('include');
      expect(init.method).to.equal('POST');
      return Promise.resolve({
        json() {
          return Promise.resolve(JSON.parse(jsonMockResponses[url]));
        },
      });
    }};

    resetServiceForTesting(win, 'xhr');
    registerServiceBuilder(win, 'xhr', function() {
      return xhrServiceMock;
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
      let consentElement;

      it('get consent/policy/postPromptUI config', () => {
        consentElement = createConsentElement(doc, dict({
          'consents': {
            'test': {
              'checkConsentHref': '/override',
            },
          },
          'postPromptUI': 'test',
        }));
        const postPromptUI = document.createElement('div');
        postPromptUI.setAttribute('id', 'test');
        consentElement.appendChild(postPromptUI);
        doc.body.appendChild(consentElement);
        const ampConsent = new AmpConsent(consentElement);
        ampConsent.buildCallback();

        expect(ampConsent.postPromptUI_).to.not.be.null;

        expect(ampConsent.consentConfig_).to.deep.equal(dict({
          'test': {
            'checkConsentHref': '/override',
          },
        }));

        expect(Object.keys(ampConsent.policyConfig_)).to.have.length(4);
        expect(ampConsent.policyConfig_['default']).to.be.ok;
        expect(ampConsent.policyConfig_['_till_responded']).to.be.ok;
        expect(ampConsent.policyConfig_['_till_accepted']).to.be.ok;
        expect(ampConsent.policyConfig_['_auto_reject']).to.be.ok;
      });

      it('relative checkConsentHref is resolved', function* () {
        const fetchSpy = sandbox.spy(xhrServiceMock, 'fetchJson');
        consentElement = createConsentElement(doc, dict({
          'consents': {
            'XYZ': {
              'checkConsentHref': '/r/1',
            },
          },
        }));
        const ampConsent = new AmpConsent(consentElement);
        doc.body.appendChild(consentElement);
        const getUrlStub = sandbox.stub(ampdoc, 'getUrl');
        // return a cache Url to test origin source being used to resolve.
        getUrlStub.callsFake(() => {
          return 'https://cdn.ampproject.org/v/www.origin.com/foo/?f=0#h';
        });
        ampConsent.buildCallback();
        yield macroTask();
        expect(fetchSpy).to.be.calledOnce;
        expect(win.testLocation.origin).not.to.be.empty;
        expect(fetchSpy).to.be.calledWith('http://www.origin.com/r/1');
      });
    });
  });

  describe('server communication', () => {
    let defaultConfig;
    let ampConsent;
    let consentElement;
    beforeEach(() => {
      defaultConfig = dict({
        'consents': {
          'ABC': {
            'checkConsentHref': 'https://response1',
          },
        },
      });
      consentElement = createConsentElement(doc, defaultConfig);
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

    it('read promptIfUnknown from server response', function* () {
      ampConsent.buildCallback();
      yield macroTask();
      expect(ampConsent.consentRequired_['ABC']).to.equal(true);
    });
  });

  describe('amp-geo integration', () => {
    let defaultConfig;
    let ampConsent;
    let consentElement;
    beforeEach(() => {
      defaultConfig = dict({
        'consents': {
          'ABC': {
            'promptIfUnknownForGeoGroup': 'testGroup',
          },
        },
      });
      consentElement = createConsentElement(doc, defaultConfig);
    });

    it('in geo group', function* () {
      doc.body.appendChild(consentElement);
      ampConsent = new AmpConsent(consentElement);
      ISOCountryGroups = ['unknown', 'testGroup'];
      ampConsent.buildCallback();
      yield macroTask();
      expect(ampConsent.consentRequired_['ABC']).to.equal(true);
    });

    it('not in geo group', function* () {
      doc.body.appendChild(consentElement);
      ampConsent = new AmpConsent(consentElement);
      ISOCountryGroups = ['unknown'];
      ampConsent.buildCallback();
      yield macroTask();
      expect(ampConsent.consentRequired_['ABC']).to.equal(false);
    });

    it('geo override promptIfUnknown', function* () {
      ISOCountryGroups = ['unknown'];
      consentElement = createConsentElement(doc, dict({
        'consents': {
          'ABC': {
            'checkConsentHref': 'https://response1',
            'promptIfUnknownForGeoGroup': 'testGroup',
          },
        },
      }));
      doc.body.appendChild(consentElement);
      ampConsent = new AmpConsent(consentElement);
      ampConsent.buildCallback();
      yield macroTask();
      expect(ampConsent.consentRequired_['ABC']).to.equal(false);
    });
  });

  describe('external consent action', () => {
    let defaultConfig;
    let ampConsent;
    let actionSpy;
    let event;
    let ampIframe;
    let iframe;
    let consentElement;
    beforeEach(() => {
      defaultConfig = dict({
        'consents': {
          'ABC': {
            'checkConsentHref': 'https://response1',
          },
        },
      });
      consentElement = createConsentElement(doc, defaultConfig);
      doc.body.appendChild(consentElement);
      ampConsent = new AmpConsent(consentElement);
      actionSpy = sandbox.stub(ampConsent, 'handleAction_');
      ampConsent.enableInteractions_();
      ampIframe = document.createElement('amp-iframe');
      iframe = doc.createElement('iframe');
      ampIframe.appendChild(iframe);
      ampConsent.element.appendChild(ampIframe);
      ampConsent.currentDisplayInstance_ = 'ABC';
      event = new Event('message');
    });

    it('listen to external consent response msg', () => {
      event.data = {
        'type': 'consent-response',
        'action': 'accept',
      };
      event.source = iframe.contentWindow;
      win.dispatchEvent(event);
      expect(actionSpy).to.be.calledWith(ACTION_TYPE.ACCEPT);
    });

    it('ignore msg from incorrect source', () => {
      event.data = {
        'type': 'consent-response',
        'action': 'accept',
      };
      event.source = null;
      win.dispatchEvent(event);
      expect(actionSpy).to.not.be.called;
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
      defaultConfig = dict({
        'consents': {
          'ABC': {
            'checkConsentHref': 'https://response1',
            'promptUI': '123',
          },
          'DEF': {
            'checkConsentHref': 'https://response1',
            'promptUI': '123',
          },
          'GH': {
            'checkConsentHref': 'https://response1',
            'promptUI': '123',
          },
        },
        'postPromptUI': 'test',
      });
      consentElement = createConsentElement(doc, defaultConfig);
      uiElement = document.createElement('div');
      uiElement.setAttribute('id', '123');
      consentElement.appendChild(uiElement);
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

    it('ignore when no consent is displaying', function* () {
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
      expect(updateConsentInstanceStateSpy).to.be.calledThrice;
      updateConsentInstanceStateSpy.resetHistory();
      expect(updateConsentInstanceStateSpy).to.not.be.called;
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
      let postPromptUI;
      beforeEach(() => {
        postPromptUI = doc.getElementById('test');
      });
      it('handle postPromptUI', function* () {
        storageValue = {
          'amp-consent:ABC': CONSENT_ITEM_STATE.ACCEPTED,
          'amp-consent:DEF': CONSENT_ITEM_STATE.ACCEPTED,
          'amp-consent:GH': CONSENT_ITEM_STATE.ACCEPTED,
        };
        ampConsent.buildCallback();
        ampConsent.element.classList.remove('i-amphtml-notbuilt');
        expect(ampConsent.postPromptUI_).to.not.be.null;
        expect(ampConsent.element).to.have.display('none');
        expect(postPromptUI).to.have.display('none');
        yield macroTask();

        expect(ampConsent.element).to.not.have.display('none');
        expect(ampConsent.element.classList.contains('amp-active')).to.be.true;
        expect(ampConsent.element.classList.contains('amp-hidden')).to.be.false;
        expect(postPromptUI).to.not.have.display('none');
        ampConsent.scheduleDisplay_('ABC');
        expect(postPromptUI).to.have.display('none');
      });

      describe('hide/show postPromptUI', () => {
        beforeEach(() => {
          defaultConfig = dict({
            'consents': {
              'ABC': {
                'checkConsentHref': 'https://response3',
              },
            },
            // There's already an amp-consent from a parent beforeEach with a
            // test postPromptUI
            'postPromptUI': 'test2',
          });
          consentElement = createConsentElement(doc, defaultConfig);
          postPromptUI = doc.createElement('div');
          postPromptUI.setAttribute('id', 'test2');
          consentElement.appendChild(postPromptUI);
          doc.body.appendChild(consentElement);
          ampConsent = new AmpConsent(consentElement);
        });

        it('hide postPromptUI', function* () {
          ampConsent.buildCallback();
          ampConsent.element.classList.remove('i-amphtml-notbuilt');
          expect(postPromptUI).to.not.be.null;
          yield macroTask();
          expect(postPromptUI).to.have.display('none');
        });

        it('show postPromptUI', function* () {
          storageValue = {
            'amp-consent:ABC': CONSENT_ITEM_STATE.ACCEPTED,
          };
          ampConsent.buildCallback();
          ampConsent.element.classList.remove('i-amphtml-notbuilt');
          expect(postPromptUI).to.not.be.null;
          yield macroTask();
          expect(postPromptUI).to.not.have.display('none');
        });
      });
    });
  });
});


/**
 * Create an <amp-consent> element from config for testing
 * @param {Document} doc
 * @param {!JsonObject} config
 * @param {string=} opt_type
 * @return {Element}
 */
export function createConsentElement(doc, config, opt_type) {
  const consentElement = doc.createElement('amp-consent');
  consentElement.setAttribute('id', 'amp-consent');
  consentElement.setAttribute('layout', 'nodisplay');
  if (opt_type) {
    consentElement.setAttribute('type', opt_type);
  }
  const scriptElement = doc.createElement('script');
  scriptElement.setAttribute('type', 'application/json');
  scriptElement.textContent = JSON.stringify(config);
  consentElement.appendChild(scriptElement);
  return consentElement;
}
