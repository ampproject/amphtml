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
  ALT_TEXT,
  CONFIGURATION_EVENT,
  ICON_SIZE,
  ORIGIN,
} from '../constants';
import {ConfigManager} from '../config-manager';

import {createElementWithAttributes} from '../../../../src/dom';
import {dict} from '../../../../src/utils/object';
import {getConfigManager} from '../amp-addthis';
import {getDetailsForMeta, getMetaElements} from './../addthis-utils/meta';
import {getKeywordsString} from './../addthis-utils/classify';
import {isDateInFuture} from '../addthis-utils/cuid';
import {toArray} from '../../../../src/types';

describes.realWin('amp-addthis', {
  amp: {
    extensions: ['amp-addthis'],
  },
}, env => {
  const configManager = getConfigManager();
  const pubId = 'ra-5988ef04ee1db125';
  const widgetId = '29nf';
  let doc;
  let registerStub;
  let unregisterStub;

  beforeEach(() => {
    doc = env.win.document;
    registerStub = env.sandbox.stub(configManager, 'register');
    unregisterStub = env.sandbox.stub(configManager, 'unregister');
  });

  function getAT(configuration, opt_responsive, opt_beforeLayoutCallback) {
    const {pubId, widgetId, shareConfig = {}} = configuration;
    const elementAttributes = dict({
      'data-pub-id': pubId,
      'data-widget-id': widgetId,
      'width': 111,
      'height': 222,
    });
    Object.keys(shareConfig).forEach(key => {
      elementAttributes[`data-share-${key}`] = shareConfig[key];
    });
    const at = createElementWithAttributes(
        doc,
        'amp-addthis',
        elementAttributes
    );
    if (opt_responsive) {
      at.setAttribute('layout', 'responsive');
    }
    doc.body.appendChild(at);
    return at.build().then(() => {
      if (opt_beforeLayoutCallback) {
        opt_beforeLayoutCallback(at);
      }
      // Reference to the promise is kept here so that it can be passed on to
      // and returned by the final callback (for the sake of tests), rather than
      // just added to the chain.
      const atIframeLoadPromise = at.layoutCallback();
      return atIframeLoadPromise.then(() => ({atIframeLoadPromise}));
    }).then(({atIframeLoadPromise}) => ({at, atIframeLoadPromise}));
  }

  function testIframe(iframe) {
    expect(iframe).to.not.equal(null);
    expect(iframe.getAttribute('src'))
        .to.equal(`${ORIGIN}/dc/amp-addthis.html`);
    expect(iframe.getAttribute('title')).to.equal(ALT_TEXT);
  }

  it('renders the iframe', () => {
    return getAT({pubId, widgetId}).then(({at}) => {
      testIframe(at.querySelector('iframe'));
    });
  });

  it('renders a placeholder with an amp-img', () => {
    return getAT({pubId, widgetId}).then(({at}) => {
      const placeholder = at.querySelector('[placeholder]');
      const ampImg = placeholder.querySelector('amp-img');

      expect(placeholder).to.not.equal(null);
      expect(ampImg).to.not.equal(null);
      expect(ampImg.getAttribute('src')).to.match(/cache\.addthiscdn\.com/);
      expect(ampImg.getAttribute('width')).to.equal(ICON_SIZE);
      expect(ampImg.getAttribute('height')).to.equal(ICON_SIZE);
      expect(ampImg.getAttribute('alt')).to.equal(ALT_TEXT);
    });
  });

  it('requires data-pub-id', () => {
    expect(getAT({pubId: '', widgetId})).to.be.rejectedWith(
        /The data\-pub\-id attribute is required for/
    );
  });

  it('requires data-widget-id', () => {
    expect(getAT({pubId, widgetId: ''})).to.be.rejectedWith(
        /The data\-widget\-id attribute is required for/
    );
  });

  it('removes the iframe after unlayoutCallback', () => {
    return getAT({pubId, widgetId}).then(({at}) => {
      const obj = at.implementation_;
      testIframe(at.querySelector('iframe'));
      obj.unlayoutCallback();
      expect(at.querySelector('iframe')).to.equal(null);
      expect(obj.iframe_).to.equal(null);
    });
  });

  it('registers the frame with the configManager on layout', () => {
    return getAT({pubId, widgetId}).then(({at, atIframeLoadPromise}) => {
      const obj = at.implementation_;

      expect(registerStub.calledOnce).to.equal(true);
      expect(registerStub.calledWithExactly({
        pubId,
        widgetId,
        iframe: obj.iframe_,
        iframeLoadPromise: atIframeLoadPromise,
        element: obj.element,
        win: obj.win,
      }));
    });
  });

  it('unregisters the frame with the configManager on unlayoutCallback', () => {
    return getAT({pubId, widgetId}).then(({at}) => {
      const obj = at.implementation_;
      obj.unlayoutCallback();

      expect(unregisterStub.calledOnce).to.equal(true);
      expect(unregisterStub.calledWithExactly({
        pubId,
        iframe: obj.iframe_,
      }));
    });
  });

  it('accepts and stores shareConfig data via custom attributes', () => {
    const shareConfig = {
      url: 'https://www.addthis.com',
      title: 'AddThis Website Tools',
      media: 'https://i.imgur.com/yNlQWRM.jpg',
      description: 'This is a fake page.',
    };

    return getAT({pubId, widgetId, shareConfig}).then(({at}) => {
      expect(Object.keys(shareConfig).length).to.equal(4);
      Object.keys(shareConfig).forEach(key => {
        expect(at.getAttribute(`data-share-${key}`)).to.equal(shareConfig[key]);
      });
    });
  });

  it('defaults to sharing ownerDocument\'s title and url', () => {
    return getAT({pubId, widgetId}).then(({at}) => {
      const obj = at.implementation_;
      const {shareConfig_} = obj;
      expect(shareConfig_.title).to.equal(doc.title);
      expect(shareConfig_.url).to.equal(doc.location.href);
    });
  });

  it('registers a view at most once per "session"', done => {
    const testConfigManager = new ConfigManager();
    let numPendingRequests = 0;
    let numViewsRegistered = 0;

    return new Promise((resolve, reject) => {
      done();
      const mockIframe = {
        contentWindow: {
          postMessage: json => {
            let receivedJSON;

            numPendingRequests--;

            try {
              receivedJSON = JSON.parse(json);
            } catch (ex) {
              reject(ex);
            }

            if (receivedJSON.registerView === true) {
              numViewsRegistered++;
            }

            if (numPendingRequests === 0) {
              expect(numViewsRegistered).to.equal(1);
              resolve();
            }
          },
        },
      };

      // Fake a number of registered elements.
      for (let i = 0; i < 3; i++) {
        numPendingRequests++;
        testConfigManager.register({
          pubId,
          widgetId,
          win: window,
          iframe: mockIframe,
          iframeLoadPromise: Promise.resolve(),
        });
      }
    });
  });

  it('sends expected JSON config to the iframe after registering', () => {
    const testConfigManager = new ConfigManager();
    const shareConfig = {
      title: 'lol',
    };
    const expectedString = JSON.stringify({
      event: CONFIGURATION_EVENT,
      shareConfig,
      pubId: '1234',
      widgetId,
      configRequestStatus: 0,
      dashboardConfig: undefined,
    });

    return new Promise((resolve, reject) => {
      const mockIframe = {
        contentWindow: {
          postMessage: (json, origin) => {
            try {
              expect(json).to.equal(expectedString);
              expect(origin).to.equal(ORIGIN);
            } catch (ex) {
              reject(ex);
            } finally {
              testConfigManager.unregister({
                pubId,
                iframe: mockIframe,
              });
            }
            resolve();
          },
        },
      };

      testConfigManager.register({
        pubId: '1234',
        widgetId,
        shareConfig,
        win: window,
        iframe: mockIframe,
        iframeLoadPromise: Promise.resolve(),
      });
    });
  });

  it('requests a config exactly once per pubId', () => {
    const testConfigManager = new ConfigManager();
    const firstPubId = '111';
    const secondPubId = '222';
    const thirdPubId = '333';
    const numConfigsRequested = {
      [firstPubId]: 0,
      [secondPubId]: 0,
      [thirdPubId]: 0,
    };
    let numPendingRequests = 0;

    return new Promise((resolve, reject) => {
      const mockIframe = {
        contentWindow: {
          postMessage: json => {
            let receivedJSON;

            numPendingRequests--;

            try {
              receivedJSON = JSON.parse(json);
            } catch (ex) {
              reject(ex);
            }

            if (receivedJSON.configRequestStatus === 0) {
              numConfigsRequested[receivedJSON.pubId]++;
            }

            if (numPendingRequests === 0) {
              expect(numConfigsRequested[firstPubId]).to.equal(1);
              expect(numConfigsRequested[secondPubId]).to.equal(1);
              expect(numConfigsRequested[thirdPubId]).to.equal(1);
              resolve();
            }
          },
        },
      };

      // Fake a number of registered elements.
      // Registers firstPubId once, secondPubId twice, and thirdPubId thrice.
      for (let i = 0; i < 6; i++) {
        numPendingRequests++;
        testConfigManager.register({
          pubId: i === 0 ? firstPubId : (i < 3 ? secondPubId : thirdPubId),
          widgetId,
          win: window,
          iframe: mockIframe,
          iframeLoadPromise: Promise.resolve(),
        });
      }
    });
  });

  it('gets meta elements from document', () => {
    const meta1 = document.createElement('meta');
    window.document.head.appendChild(meta1);
    expect(toArray(getMetaElements(window.document)).length).to.equal(1);
    const meta2 = document.createElement('meta');
    window.document.head.appendChild(meta2);
    expect(toArray(getMetaElements(window.document)).length).to.equal(2);
  });

  it('gets 0 meta elements from document when there are none', () => {
    expect(toArray(getMetaElements(window.document)).length).to.equal(0);
  });

  it('gets details for meta tag with name in lower case', () => {
    const meta1 = document.createElement('meta');
    meta1.name = 'KEYWORDS';
    meta1.content = 'this,that';
    const details = getDetailsForMeta(meta1);
    expect(details.name).to.equal(meta1.name.toLowerCase());
    expect(details.name).not.to.equal(meta1.name);
    expect(details.content).to.equal(meta1.content);
  });

  it('gets keywords from meta tags', () => {
    const meta1 = document.createElement('meta');
    meta1.name = 'keywords';
    meta1.content = 'this,that';
    expect(getKeywordsString([meta1])).to.equal(meta1.content);
    const meta2 = document.createElement('meta');
    meta2.name = 'keywords';
    meta2.content = 'a,b';
    expect(getKeywordsString([meta1, meta2]))
        .to.equal(`${meta1.content},${meta2.content}`);
  });

  it('can tell future dates from past dates', () => {
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    expect(isDateInFuture(nextYear)).to.equal(true);

    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    expect(isDateInFuture(nextMonth)).to.equal(true);

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    expect(isDateInFuture(tomorrow)).to.equal(true);

    const today = new Date();
    expect(isDateInFuture(today)).to.equal(false);

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    expect(isDateInFuture(yesterday)).to.equal(false);

    const lastYear = new Date();
    lastYear.setFullYear(lastYear.getFullYear() - 1);
    expect(isDateInFuture(lastYear)).to.equal(false);
  });
});
