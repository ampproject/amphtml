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

import {createCUID, isDateInFuture} from '../addthis-utils/cuid';
import {createElementWithAttributes} from '../../../../src/dom';
import {dict} from '../../../../src/utils/object';
import {
  getAddThisMode,
  isProductCode,
  isPubId,
  isWidgetId,
} from '../addthis-utils/mode';
import {getConfigManager} from '../amp-addthis';
import {getDetailsForMeta, getMetaElements} from './../addthis-utils/meta';
import {getKeywordsString} from './../addthis-utils/classify';
import {getSessionId} from '../addthis-utils/session';
import {getWidgetOverload} from
  '../addthis-utils/getWidgetIdOverloadedWithJSONForAnonymousMode';
import {isBoolean} from '../addthis-utils/boolean';
import {isNumber} from '../addthis-utils/number';
import {isString} from '../addthis-utils/string';
import {toArray} from '../../../../src/types';

describes.realWin('amp-addthis', {
  amp: {
    extensions: ['amp-addthis'],
  },
}, env => {
  const configManager = getConfigManager();
  const pubId = 'ra-5988ef04ee1db125';
  const widgetId = '29nf';
  const floatingPubId = 'ra-5b2947993c86010c';
  const floatingWidgetId = '4hvd';
  const productCode = 'shin';
  let doc;
  let registerStub;
  let unregisterStub;

  beforeEach(() => {
    doc = env.win.document;
    registerStub = env.sandbox.stub(configManager, 'register');
    unregisterStub = env.sandbox.stub(configManager, 'unregister');
  });

  function getAT(configuration, opt_responsive, opt_beforeLayoutCallback) {
    const {shareConfig = {}} = configuration;
    const elementAttributes = dict({
      'width': '320px',
      'height': '90px',
    });
    if (configuration.pubId) {
      elementAttributes['data-pub-id'] = configuration.pubId;
    }
    if (configuration.widgetId) {
      elementAttributes['data-widget-id'] = configuration.widgetId;
    }
    if (configuration.productCode) {
      elementAttributes['data-product-code'] = configuration.productCode;
    }
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

  it('fails when tag needs pub id', () => {
    allowConsoleError(() => {
      expect(getAT({widgetId})).to.be.rejectedWith(
          /The pub id attribute is required for /,
      );
    });
  });

  it('fails when tag needs widget id', () => {
    allowConsoleError(() => {
      expect(getAT({pubId})).to.be.rejectedWith(
          /Widget id or product code is required for /,
      );
    });
  });

  it('fails when tag needs pub id and has empty product code', () => {
    allowConsoleError(() => {
      expect(getAT({widgetId})).to.be.rejectedWith(
          /The pub id attribute is required for /,
      );
    });
  });

  it('fails when tag has pubId but not widget id or product code', () => {
    allowConsoleError(() => {
      expect(getAT({pubId})).to.be.rejectedWith(
          /Widget id or product code is required for /,
      );
    });
  });

  it('fails when tag has no pub id, widget id, or product code', () => {
    allowConsoleError(() => {
      expect(getAT({})).to.be.rejectedWith(
          /Widget id or product code is required for /,
      );
    });
  });

  // success here means "no errors thrown when creating element"
  it('succeeds when tag has pub id and widget id', () => {
    expect(getAT({
      pubId, widgetId,
    })).to.not.equal(void 0);
  });

  it('succeeds when tag has pub id and product code', () => {
    expect(getAT({
      pubId, productCode,
    })).to.not.equal(void 0);
  });

  it('succeeds when tag has just a product code', () => {
    expect(getAT({
      productCode,
    })).to.not.equal(void 0);
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
    return getAT({pubId, widgetId, shareConfig: {}}).then(() => {
      expect(registerStub.calledOnce).to.equal(true);
    });
  });

  it('unregisters the frame with the configManager on unlayoutCallback', () => {
    return getAT({pubId, widgetId}).then(({at}) => {
      const obj = at.implementation_;
      obj.unlayoutCallback();

      expect(unregisterStub.calledOnce).to.equal(true);
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

  it('gives id for iframe if floating tool loaded', () => {
    return getAT({
      pubId: floatingPubId, widgetId: floatingWidgetId,
    }).then(
        ({at}) => {
          testIframe(at.querySelector('iframe'));
          const iframe = at.querySelector('iframe');
          expect(iframe.getAttribute('id')).to.equal(floatingWidgetId);
        },
    );
  });

  it('gets mode correctly based on attributes', () => {
    const widgetId = 'abcd';
    const pubId = 'ra-0000000000000000';
    const productCode = 'shfs';
    const mode1 = {widgetId, pubId};
    const mode2 = {productCode, pubId};
    const mode3 = {productCode};
    const mode4 = {widgetId, productCode, pubId};
    const mode5 = {widgetId};
    const mode6 = {pubId};
    const mode7 = {pubId, widgetId: ''};
    const mode8 = {pubId, productCode: ''};
    const mode9 = {pubId, widgetId: '', productCode: ''};

    expect(getAddThisMode({})).to.equal(-1);
    expect(getAddThisMode(mode1)).to.equal(1);
    expect(getAddThisMode(mode2)).to.equal(2);
    expect(getAddThisMode(mode3)).to.equal(3);
    expect(getAddThisMode(mode4)).to.equal(-1);
    expect(getAddThisMode(mode5)).to.equal(-1);
    expect(getAddThisMode(mode6)).to.equal(-1);
    expect(getAddThisMode(mode7)).to.equal(-1);
    expect(getAddThisMode(mode8)).to.equal(-1);
    expect(getAddThisMode(mode9)).to.equal(-1);
  });

  it('isPubId: pretty much knows if a thing is a pub id or not', () => {
    expect(isPubId(1)).to.equal(false);
    expect(isPubId(String('maybe'))).to.equal(true);
    expect(isPubId('maybe')).to.equal(true);
    expect(isPubId({})).to.equal(false);
    expect(isPubId([])).to.equal(false);
    expect(isPubId(void 0)).to.equal(false);
    expect(isPubId(null)).to.equal(false);
  });

  it('isProductCode: pretty much knows if a thing is a product code or not',
      () => {
        expect(isProductCode(1)).to.equal(false);
        expect(isProductCode(String('mayb'))).to.equal(false);
        expect(isProductCode(String('shin'))).to.equal(true);
        expect(isProductCode('maybe')).to.equal(false);
        expect(isProductCode('shin')).to.equal(true);
        expect(isProductCode('shfs')).to.equal(true);
        expect(isProductCode({})).to.equal(false);
        expect(isProductCode([])).to.equal(false);
        expect(isProductCode(void 0)).to.equal(false);
        expect(isProductCode(null)).to.equal(false);
      });

  it('isWidgetId: pretty much knows if a thing is a widget id or not', () => {
    expect(isWidgetId(1)).to.equal(false);
    expect(isWidgetId(String('mayb'))).to.equal(true);
    expect(isWidgetId(String('101x'))).to.equal(true);
    expect(isWidgetId('maybe')).to.equal(false);
    expect(isWidgetId('shin')).to.equal(true);
    expect(isWidgetId('shfs')).to.equal(true);
    expect(isWidgetId({})).to.equal(false);
    expect(isWidgetId([])).to.equal(false);
    expect(isWidgetId(void 0)).to.equal(false);
    expect(isWidgetId(null)).to.equal(false);
  });

  it('isString: knows if a thing is a string or not', () => {
    expect(isString(1)).to.equal(false);
    expect(isString(String('mayb'))).to.equal(true);
    expect(isString(String('101x'))).to.equal(true);
    expect(isString('maybe')).to.equal(true);
    expect(isString('shin')).to.equal(true);
    expect(isString('shfs')).to.equal(true);
    expect(isString({})).to.equal(false);
    expect(isString([])).to.equal(false);
    expect(isString(void 0)).to.equal(false);
    expect(isString(null)).to.equal(false);
  });

  it('isNumber: knows if a thing is a number or not', () => {
    expect(isNumber(1)).to.equal(true);
    expect(isNumber(Number('0x1'))).to.equal(true);
    expect(isNumber(Number())).to.equal(true);
    expect(isNumber(Infinity)).to.equal(true);
    expect(isNumber('0')).to.equal(false);
    expect(isNumber(0x1)).to.equal(true);
    expect(isNumber({})).to.equal(false);
    expect(isNumber([])).to.equal(false);
    expect(isNumber(void 0)).to.equal(false);
    expect(isNumber(null)).to.equal(false);
  });

  it('isBoolean: knows if a thing is a boolean or not', () => {
    expect(isBoolean(true)).to.equal(true);
    expect(isBoolean(false)).to.equal(true);
    expect(isBoolean(Boolean())).to.equal(true);
    expect(isBoolean(Boolean(1))).to.equal(true);
    expect(isBoolean('false')).to.equal(false);
    expect(isBoolean('true')).to.equal(false);
    expect(isBoolean({})).to.equal(false);
    expect(isBoolean([])).to.equal(false);
    expect(isBoolean(void 0)).to.equal(false);
    expect(isBoolean(null)).to.equal(false);
  });

  it('getWidgetOverload: self.element.getAttribute function argument', () => {
    expect(getWidgetOverload({})).to.equal('');
    expect(getWidgetOverload({element: {}})).to.equal('');
    const result = '{"counts":"none","numPreferredServices":5}';
    const mock = {
      'data-attr-counts': 'none',
      'data-attr-numPreferredServices': 5,
    };
    const getAttribute = key => mock[key] ;
    const self = {element: {getAttribute}};
    expect(getWidgetOverload(self)).to.equal(result);
  });

  it('getWidgetOverload: doesn\'t pass unknown params', () => {
    const mock = {
      'data-attr-csounts': 'none',
      'data-attr-nsumPreferredServices': 5,
    };
    const getAttribute = key => mock[key] ;
    const self = {element: {getAttribute}};
    expect(getWidgetOverload(self)).to.equal('');
  });

  it('getWidgetOverload: only saves string, boolean, number', () => {
    const mock = {
      'data-attr-backgroundColor': undefined,
      'data-attr-counterColor': null,
      'data-attr-counts': [],
      'data-attr-countsFontSize': {},
      'data-attr-desktopPosition': new Function(),
    };
    const getAttribute = key => mock[key] ;
    const self = {element: {getAttribute}};
    expect(getWidgetOverload(self)).to.equal('');
  });

  it('getWidgetOverload: passes all params correctly', () => {
    const mock = {
      'data-attr-backgroundColor': 1,
      'data-attr-counterColor': 1,
      'data-attr-counts': 1,
      'data-attr-countsFontSize': 1,
      'data-attr-desktopPosition': 1,
      'data-attr-elements': 1,
      'data-attr-hideDevice': 1,
      'data-attr-hideEmailSharingConfirmation': 1,
      'data-attr-hideLabel': 1,
      'data-attr-iconColor': 1,
      'data-attr-mobilePosition': 1,
      'data-attr-numPreferredServices': 1,
      'data-attr-offset': 1,
      'data-attr-originalServices': 1,
      'data-attr-postShareFollowMsg': 1,
      'data-attr-postShareRecommendedMsg': 1,
      'data-attr-postShareTitle': 1,
      'data-attr-responsive': 1,
      'data-attr-shareCountThreshold': 1,
      'data-attr-size': 1,
      'data-attr-style': 1,
      'data-attr-textColor': 1,
      'data-attr-thankyou': 1,
      'data-attr-titleFontSize': 1,
      'data-attr-__hideOnHomepage': 1,
    };
    const getAttribute = key => mock[key] ;
    const self = {element: {getAttribute}};
    expect(getWidgetOverload(self).length).to.equal(447);
  });

  it('getSessionId: returns a string of 16 characters containing 0-9 a-f',
      () => {
        expect(isString(getSessionId())).to.equal(true);
        expect(getSessionId().length).to.equal(16);
        expect(/^[0-9a-f]{16}$/.test(getSessionId())).to.equal(true);

        // within the same session, ids match
        const a = getSessionId();
        const b = getSessionId();
        expect(a).to.equal(b);
      });

  it('createCUID: returns a string of 16 characters containing 0-9 a-f', () => {
    expect(isString(createCUID())).to.equal(true);

    const a = createCUID();
    const b = createCUID();
    expect(a).to.not.equal(b);

    const o = {};
    for (let i = 0; i < 100000; i += 1) {
      const c = createCUID().length;
      if (!o[c]) {
        o[c] = 0;
      }
      o[c] = o[c] + 1;
    }
    expect(o[16]).to.equal(100000);
  });
});
