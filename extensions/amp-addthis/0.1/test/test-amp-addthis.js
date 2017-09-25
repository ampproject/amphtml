/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
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

import {createElementWithAttributes} from '../../../../src/dom';
import {ConfigManager} from '../ConfigManager';
import {getConfigManager} from '../amp-addthis';
import {
  CONFIGURATION_EVENT,
  ORIGIN,
  ALT_TEXT,
  ICON_SIZE,
} from '../constants';

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

  function getAT(pubId, widgetId, opt_responsive, opt_beforeLayoutCallback) {
    const at = createElementWithAttributes(
        doc,
        'amp-addthis',
        /** @type !JsonObject */ ({
          'data-pubId': pubId,
          'data-widgetId': widgetId,
          width: 111,
          height: 222,
        })
    );
    if (opt_responsive) {
      at.setAttribute('layout', 'responsive');
    }
    doc.body.appendChild(at);
    return at.build().then(() => {
      if (opt_beforeLayoutCallback) {
        opt_beforeLayoutCallback(at);
      }
      return at.layoutCallback();
    }).then(() => at);
  }

  function testIframe(iframe) {
    expect(iframe).to.not.be.null;
    expect(iframe.getAttribute('src'))
        .to.equal(`${ORIGIN}/dc/amp-addthis.html`);
    expect(iframe.getAttribute('title')).to.equal(ALT_TEXT);
  }

  it('renders the iframe', () => {
    return getAT(pubId, widgetId).then(at => {
      testIframe(at.querySelector('iframe'));
    });
  });

  it('renders a placeholder with an amp-img', () => {
    return getAT(pubId, widgetId).then(at => {
      const placeholder = at.querySelector('[placeholder]');
      const ampImg = placeholder.querySelector('amp-img');

      expect(placeholder).to.not.be.null;
      expect(ampImg).to.not.be.null;
      expect(ampImg.getAttribute('src')).to.match(/cache\.addthiscdn\.com/);
      expect(ampImg.getAttribute('width')).to.equal(ICON_SIZE);
      expect(ampImg.getAttribute('height')).to.equal(ICON_SIZE);
      expect(ampImg.getAttribute('alt')).to.equal(ALT_TEXT);
    });
  });

  it('requires data-pubId', () => {
    expect(getAT('', widgetId)).to.be.rejectedWith(
        /The data\-pubId attribute is required for/
    );
  });

  it('requires data-widgetId', () => {
    expect(getAT('ra-12345', '')).to.be.rejectedWith(
        /The data\-widgetId attribute is required for/
    );
  });

  it('removes the iframe after unlayoutCallback', () => {
    return getAT(pubId, widgetId).then(at => {
      const obj = at.implementation_;
      testIframe(at.querySelector('iframe'));
      obj.unlayoutCallback();
      expect(at.querySelector('iframe')).to.be.null;
      expect(obj.iframe_).to.be.null;
      expect(obj.iframeLoadPromise_).to.be.null;
    });
  });

  it('registers the frame with the configManager on layout', () => {
    return getAT(pubId, widgetId).then(at => {
      const obj = at.implementation_;

      expect(registerStub.calledOnce).to.be.true;
      expect(registerStub.calledWithExactly({
        pubId,
        widgetId,
        iframe: obj.iframe_,
        iframeLoadPromise: obj.iframeLoadPromise_,
        element: obj.element,
        win: obj.win,
      }));
    });
  });

  it('unregisters the frame with the configManager on unlayoutCallback', () => {
    return getAT(pubId, widgetId).then(at => {
      const obj = at.implementation_;
      obj.unlayoutCallback();

      expect(unregisterStub.calledOnce).to.be.true;
      expect(unregisterStub.calledWithExactly({
        pubId,
        iframe: obj.iframe_,
      }));
    });
  });

  it('registers a view at most once per "session"', () => {
    const testConfigManager = new ConfigManager();
    const mockElement = {
      ownerDocument: {
        location: {
          href: 'http://www.example.com',
        },
        title: 'AMP AddThis Test',
      },
    };
    let numPendingRequests = 0;
    let numViewsRegistered = 0;

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
          element: mockElement,
          iframeLoadPromise: Promise.resolve(),
        });
      }
    });
  });

  it('sends expected JSON config to the iframe after registering', () => {
    const testConfigManager = new ConfigManager();
    const mockElement = {
      ownerDocument: {
        location: {
          href: 'http://www.example.com',
        },
        title: 'AMP AddThis Test',
      },
    };
    const expectedString = JSON.stringify({
      event: CONFIGURATION_EVENT,
      shareConfig: {
        url: mockElement.ownerDocument.location.href,
        title: mockElement.ownerDocument.title,
      },
      pubId: '1234',
      widgetId,
      configRequestStatus: 0,
      dashboardConfig: undefined,
      registerView: true,
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
        win: window,
        iframe: mockIframe,
        element: mockElement,
        iframeLoadPromise: Promise.resolve(),
      });
    });
  });

  it('requests a config exactly once per pubId', () => {
    const testConfigManager = new ConfigManager();
    const mockElement = {
      ownerDocument: {
        location: {
          href: 'http://www.example.com',
        },
        title: 'AMP AddThis Test',
      },
    };
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
          element: mockElement,
          iframeLoadPromise: Promise.resolve(),
        });
      }
    });
  });

});
