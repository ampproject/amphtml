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

import {ACTION_TYPE, AmpConsent} from '../amp-consent';
import {CONSENT_ITEM_STATE} from '../consent-info';
import {GEO_IN_GROUP} from '../../../amp-geo/0.1/amp-geo-in-group';
import {dict} from '../../../../src/utils/object';
import {macroTask} from '../../../../testing/yield';
import {
  registerServiceBuilder,
  resetServiceForTesting,
} from '../../../../src/service';
import {toggleExperiment} from '../../../../src/experiments';

describes.realWin(
  'amp-consent',
  {
    amp: {
      extensions: ['amp-consent'],
      ampdoc: 'single',
    },
  },
  env => {
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
      toggleExperiment(win, 'amp-consent-v2', true);

      storageValue = {};
      jsonMockResponses = {
        'https://response1/': '{"promptIfUnknown": true}',
        'https://response2/': '{}',
        'https://response3/': '{"promptIfUnknown": false}',
        'https://geo-override-check/': '{"consentRequired": false}',
        'https://geo-override-check2/': '{"consentRequired": true}',
        'http://www.origin.com/r/1': '{}',
        'https://invalid.response.com/': '{"consentRequired": 3}',
      };

      xhrServiceMock = {
        fetchJson: (url, init) => {
          requestBody = init.body;
          expect(init.credentials).to.equal('include');
          expect(init.method).to.equal('POST');
          return Promise.resolve({
            json() {
              return Promise.resolve(JSON.parse(jsonMockResponses[url]));
            },
          });
        },
      };

      resetServiceForTesting(win, 'xhr');
      registerServiceBuilder(win, 'xhr', function() {
        return xhrServiceMock;
      });

      resetServiceForTesting(win, 'geo');
      registerServiceBuilder(win, 'geo', function() {
        return Promise.resolve({
          isInCountryGroup: group =>
            ISOCountryGroups.indexOf(group) >= 0
              ? GEO_IN_GROUP.IN
              : GEO_IN_GROUP.NOT_IN,
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

        it('get consent/policy/postPromptUI config', async () => {
          const config = dict({
            'consentInstanceId': 'test',
            'checkConsentHref': '/override',
            'consentRequired': true,
            'clientConfig': {
              'test': 'ABC',
            },
            'postPromptUI': 'test',
          });
          consentElement = createConsentElement(doc, config);
          const postPromptUI = document.createElement('div');
          postPromptUI.setAttribute('id', 'test');
          consentElement.appendChild(postPromptUI);
          doc.body.appendChild(consentElement);
          const ampConsent = new AmpConsent(consentElement);
          await ampConsent.buildCallback();

          expect(ampConsent.postPromptUI_).to.not.be.null;
          expect(ampConsent.consentId_).to.equal('test');
          expect(ampConsent.consentConfig_).to.deep.equal(config);

          expect(Object.keys(ampConsent.policyConfig_)).to.have.length(4);
          expect(ampConsent.policyConfig_['default']).to.be.ok;
          expect(ampConsent.policyConfig_['_till_responded']).to.be.ok;
          expect(ampConsent.policyConfig_['_till_accepted']).to.be.ok;
          expect(ampConsent.policyConfig_['_auto_reject']).to.be.ok;
        });

        it('relative checkConsentHref is resolved', async () => {
          const fetchSpy = env.sandbox.spy(xhrServiceMock, 'fetchJson');
          consentElement = createConsentElement(
            doc,
            dict({
              'checkConsentHref': '/r/1',
              'consentInstanceId': 'XYZ',
            })
          );
          const ampConsent = new AmpConsent(consentElement);
          doc.body.appendChild(consentElement);
          const getUrlStub = env.sandbox.stub(ampdoc, 'getUrl');
          // return a cache Url to test origin source being used to resolve.
          getUrlStub.callsFake(() => {
            return 'https://cdn.ampproject.org/v/www.origin.com/foo/?f=0#h';
          });
          await ampConsent.buildCallback();

          await macroTask();
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

      it('send post request to server', async () => {
        await ampConsent.buildCallback();
        await macroTask();
        expect(requestBody).to.deep.equal({
          'consentInstanceId': 'ABC',
          'consentStateValue': 'unknown',
          'consentString': undefined,
          'isDirty': false,
          'matchedGeoGroup': null,
        });
      });

      it('send post request to server with no matched group', async () => {
        await ampConsent.buildCallback();
        await macroTask();
        expect(requestBody).to.deep.equal({
          'consentInstanceId': 'ABC',
          'consentStateValue': 'unknown',
          'consentString': undefined,
          'isDirty': false,
          'matchedGeoGroup': null,
        });
      });

      it('read promptIfUnknown from server response', async () => {
        await ampConsent.buildCallback();
        await macroTask();
        return ampConsent.getConsentRequiredPromise_().then(isRequired => {
          expect(isRequired).to.be.true;
        });
      });
    });

    describe('geo-override server communication', () => {
      let ampConsent;
      beforeEach(() => {
        toggleExperiment(win, 'amp-consent-geo-override');
      });

      it('sends post request to server when consentRequired is remote', async () => {
        const remoteConfig = {
          'consentInstanceId': 'abc',
          'consentRequired': 'remote',
          'checkConsentHref': 'https://geo-override-check/',
        };
        ampConsent = getAmpConsent(doc, remoteConfig);
        await ampConsent.buildCallback();
        await macroTask();
        expect(await ampConsent.getConsentRequiredPromise_()).to.be.false;
      });

      it('resolves consentRequired to remote response with old format', async () => {
        const remoteConfig = {
          'consents': {
            'oldConsent': {
              'checkConsentHref': 'https://geo-override-check2/',
            },
          },
        };
        ampConsent = getAmpConsent(doc, remoteConfig);
        await ampConsent.buildCallback();
        await macroTask();
        expect(await ampConsent.getConsentRequiredPromise_()).to.be.true;
      });

      it('send post request to server with matched group', async () => {
        const remoteConfig = {
          'consentInstanceId': 'abc',
          'geoOverride': {
            'nafta': {
              'checkConsentHref': 'https://geo-override-check2/',
              'consentRequired': true,
            },
          },
        };
        ISOCountryGroups = ['nafta'];
        ampConsent = getAmpConsent(doc, remoteConfig);
        await ampConsent.buildCallback();
        await macroTask();
        expect(requestBody).to.deep.equal({
          'consentInstanceId': 'abc',
          'consentStateValue': 'unknown',
          'consentString': undefined,
          'isDirty': false,
          'matchedGeoGroup': 'nafta',
        });
      });

      it('only geoOverrides the first matched group', async () => {
        const remoteConfig = {
          'consentInstanceId': 'abc',
          'geoOverride': {
            'na': {
              'checkConsentHref': 'https://geo-override-check2/',
              'consentRequired': true,
            },
            'eea': {
              'consentRequired': false,
            },
          },
        };
        ISOCountryGroups = ['na', 'eea'];
        ampConsent = getAmpConsent(doc, remoteConfig);
        await ampConsent.buildCallback();
        await macroTask();
        expect(await ampConsent.getConsentRequiredPromise_()).to.be.true;
        expect(ampConsent.matchedGeoGroup_).to.equal('na');
        expect(requestBody).to.deep.equal({
          'consentInstanceId': 'abc',
          'consentStateValue': 'unknown',
          'consentString': undefined,
          'isDirty': false,
          'matchedGeoGroup': 'na',
        });
      });

      it('fallsback to true with invalide remote reponse', async () => {
        const remoteConfig = {
          'consentInstanceId': 'abc',
          'consentRequired': 'remote',
          'checkConsentHref': 'https://invalid.response.com/',
        };
        ampConsent = getAmpConsent(doc, remoteConfig);
        await ampConsent.buildCallback();
        await macroTask();
        expect(await ampConsent.getConsentRequiredPromise_()).to.be.true;
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

      it('in geo group', async () => {
        doc.body.appendChild(consentElement);
        ampConsent = new AmpConsent(consentElement);
        ISOCountryGroups = ['unknown', 'testGroup'];
        await ampConsent.buildCallback();
        expect(await ampConsent.getConsentRequiredPromise_()).to.be.true;
      });

      it('not in geo group', async () => {
        doc.body.appendChild(consentElement);
        ampConsent = new AmpConsent(consentElement);
        ISOCountryGroups = ['unknown'];
        await ampConsent.buildCallback();
        expect(await ampConsent.getConsentRequiredPromise_()).to.be.false;
      });

      it('geo override promptIfUnknown', async () => {
        ISOCountryGroups = ['unknown'];
        consentElement = createConsentElement(
          doc,
          dict({
            'consents': {
              'ABC': {
                'checkConsentHref': 'https://response1',
                'promptIfUnknownForGeoGroup': 'testGroup',
              },
            },
          })
        );
        doc.body.appendChild(consentElement);
        ampConsent = new AmpConsent(consentElement);
        await ampConsent.buildCallback();
        expect(await ampConsent.getConsentRequiredPromise_()).to.be.false;
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
        actionSpy = env.sandbox.stub(ampConsent, 'handleAction_');
        ampConsent.enableInteractions_();
        ampIframe = document.createElement('amp-iframe');
        iframe = doc.createElement('iframe');
        ampIframe.appendChild(iframe);
        ampConsent.element.appendChild(ampIframe);
        ampConsent.isPromptUIOn_ = true;
        event = new Event('message');
      });

      it('listen to external consent response msg', () => {
        event.data = {
          'type': 'consent-response',
          'action': 'accept',
          'info': 'accept-string',
        };
        event.source = iframe.contentWindow;
        win.dispatchEvent(event);
        expect(actionSpy).to.be.calledWith(ACTION_TYPE.ACCEPT, 'accept-string');
      });

      it('ignore info when prompt UI is not displayed', () => {
        ampConsent.isPromptUIOn_ = false;
        event.data = {
          'type': 'consent-response',
          'action': 'accept',
          'info': 'accept-string',
        };
        event.source = iframe.contentWindow;
        win.dispatchEvent(event);
        expect(actionSpy).to.not.be.called;
      });

      it('ignore info w/o amp-consent-v2 flag', () => {
        // TODO(@zhouyx): Remove with amp-consent-v2 flag
        toggleExperiment(win, 'amp-consent-v2', false);
        event.data = {
          'type': 'consent-response',
          'action': 'accept',
          'info': 'accept-string',
        };
        event.source = iframe.contentWindow;
        win.dispatchEvent(event);
        expect(actionSpy).to.be.calledWith(ACTION_TYPE.ACCEPT, undefined);
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

      it('ignore info with action dismiss', () => {
        expectAsyncConsoleError(
          '[amp-consent] ' +
            'Consent string value %s not applicable on user dismiss, ' +
            'stored value will be kept and used '
        );
        event.data = {
          'type': 'consent-response',
          'action': 'dismiss',
          'info': 'test',
        };
        event.source = iframe.contentWindow;
        win.dispatchEvent(event);
        expect(actionSpy).to.be.calledWith(ACTION_TYPE.DISMISS);
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
        env.sandbox.stub(ampConsent.vsync_, 'mutate').callsFake(fn => {
          fn();
        });
        env.sandbox.stub(ampConsent, 'mutateElement').callsFake(fn => {
          fn();
        });
      });

      it('update current displaying status', async () => {
        await ampConsent.buildCallback();
        await macroTask();
        updateConsentInstanceStateSpy = env.sandbox.spy(
          ampConsent.consentStateManager_,
          'updateConsentInstanceState'
        );
        await macroTask();
        expect(ampConsent.isPromptUIOn_).to.be.true;
        await macroTask();
        ampConsent.handleAction_(ACTION_TYPE.ACCEPT);
        expect(updateConsentInstanceStateSpy).to.be.calledWith(
          CONSENT_ITEM_STATE.ACCEPTED
        );
        await macroTask();
        expect(ampConsent.isPromptUIOn_).to.be.false;
      });

      it('ignore action when no consent prompt is displaying', async () => {
        await ampConsent.buildCallback();
        await macroTask();
        updateConsentInstanceStateSpy = env.sandbox.spy(
          ampConsent.consentStateManager_,
          'updateConsentInstanceState'
        );
        ampConsent.handleAction_(ACTION_TYPE.DISMISS);
        await macroTask();
        expect(updateConsentInstanceStateSpy).to.be.calledOnce;
        updateConsentInstanceStateSpy.resetHistory();
        expect(ampConsent.isPromptUIOn_).to.be.false;
        ampConsent.handleAction_(ACTION_TYPE.DISMISS);
        await macroTask();
        expect(updateConsentInstanceStateSpy).to.not.be.called;
      });

      describe('schedule display', () => {
        it('should check for pending consent UI', async () => {
          await ampConsent.buildCallback();
          await macroTask();
          expect(ampConsent.notificationUiManager_.queueSize_).to.equal(1);
          ampConsent.scheduleDisplay_();
          expect(ampConsent.notificationUiManager_.queueSize_).to.equal(1);
          ampConsent.hide_();
          await macroTask();
          expect(ampConsent.notificationUiManager_.queueSize_).to.equal(0);
          ampConsent.scheduleDisplay_();
          ampConsent.scheduleDisplay_();
          ampConsent.scheduleDisplay_();
          expect(ampConsent.notificationUiManager_.queueSize_).to.equal(1);
        });
      });

      describe('postPromptUI', () => {
        let postPromptUI;

        beforeEach(() => {
          postPromptUI = doc.getElementById('test');
        });

        it('handle postPromptUI', async () => {
          storageValue = {
            'amp-consent:ABC': true,
          };

          // Build the amp consent, and check that everything is
          // initialized correctly
          await ampConsent.buildCallback();
          ampConsent.element.classList.remove('i-amphtml-notbuilt');
          expect(ampConsent.postPromptUI_).to.not.be.null;
          expect(ampConsent.element).to.have.display('none');
          expect(postPromptUI).to.have.display('none');

          // Wait for all modifications to the element to be applied.
          // Then make more assertions.
          await macroTask();
          expect(ampConsent.element).to.not.have.display('none');
          expect(ampConsent.element.classList.contains('amp-active')).to.be
            .true;
          expect(ampConsent.element.classList.contains('amp-hidden')).to.be
            .false;
          expect(postPromptUI).to.not.have.display('none');

          // Schedule the display of the element
          ampConsent.scheduleDisplay_();

          // Wait for the element to be displayed,
          // And the postPrompt to be hidden.
          await macroTask();
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

          it('hide postPromptUI', async () => {
            await ampConsent.buildCallback();
            ampConsent.element.classList.remove('i-amphtml-notbuilt');
            await macroTask();

            expect(postPromptUI).to.not.be.null;
            expect(postPromptUI).to.have.display('none');
          });

          it('show postPromptUI', async () => {
            storageValue = {
              'amp-consent:ABC': true,
            };
            await ampConsent.buildCallback();
            ampConsent.element.classList.remove('i-amphtml-notbuilt');
            await macroTask();

            expect(postPromptUI).to.not.be.null;
            expect(postPromptUI).to.not.have.display('none');
          });
        });
      });
    });
  }
);

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

/**
 * Create an <amp-consent> element and return AmpConsent object.
 * @param {Document} doc
 * @param {!JsonObject} config
 * @param {string=} opt_type
 * @return {Element}
 */
export function getAmpConsent(doc, config) {
  const consentElement = createConsentElement(doc, config);
  doc.body.appendChild(consentElement);
  return new AmpConsent(consentElement);
}
