/**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
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

import '../../../amp-ad/0.1/amp-ad';
import {expect} from 'chai';

import {createElementWithAttributes} from '#core/dom';

import {Services} from '#service';

import {createIframeWithMessageStub} from '#testing/iframe';

import {XORIGIN_MODE} from '../../../amp-a4a/0.1/amp-a4a';
import {AmpAdNetworkSmartadserverImpl} from '../amp-ad-network-smartadserver-impl';

const realWinConfig = {
  amp: {
    extensions: ['amp-ad-network-smartadserver-impl'],
  },
  ampAdCss: true,
  allowExternalResources: false,
};

describes.realWin('amp-ad-network-smartadserver-impl', realWinConfig, (env) => {
  const rtcConfig = {
    vendors: {
      prebidappnexuspsp: {
        PLACEMENT_ID: 13133382,
        ACCOUNT_ID: 101010,
      },
      indexexchange: {SITE_ID: 123456},
    },
    timeoutMillis: 500,
  };

  let element, impl, win, doc;

  beforeEach(() => {
    win = env.win;
    doc = win.document;
  });

  describe('isValidElement', () => {
    it('should be valid', async () => {
      element = createElementWithAttributes(doc, 'amp-ad', {
        width: '300',
        height: '250',
        type: 'smartadserver',
      });
      impl = new AmpAdNetworkSmartadserverImpl(element);

      expect(impl.isValidElement()).to.be.true;
    });
  });

  describe('isXhrAllowed', () => {
    it('should be not allowed', async () => {
      impl = new AmpAdNetworkSmartadserverImpl(
        createElementWithAttributes(doc, 'amp-ad', {})
      );

      expect(impl.isXhrAllowed()).to.be.false;
    });
  });

  describe('getCustomRealTimeConfigMacros', () => {
    it('should return correct macros', () => {
      const macros = {
        'data-slot': '5678',
        'height': '50',
        'width': '200',
        'data-override-width': '310',
        'data-override-height': '260',
      };
      const json = {
        targeting: {a: 123},
      };

      element = createElementWithAttributes(doc, 'amp-ad', {
        'width': macros['width'],
        'height': macros['height'],
        'type': 'smartadserver',
        'data-slot': 5678,
        'data-override-width': 310,
        'data-override-height': 260,
        'layout': 'fixed',
        'json': JSON.stringify(json),
        'rtc-config': JSON.stringify(rtcConfig),
      });
      env.win.document.body.appendChild(element);

      const scrollTopValue = 100;
      const scrollHeightValue = 700;
      env.sandbox.stub(Services, 'viewportForDoc').callsFake(() => {
        return {
          getScrollTop: () => scrollTopValue,
          getScrollHeight: () => scrollHeightValue,
        };
      });

      impl = new AmpAdNetworkSmartadserverImpl(element, env.win.doc, win);
      const docInfo = Services.documentInfoForDoc(element);
      const customMacros = impl.getCustomRealTimeConfigMacros_();

      expect(customMacros.PAGEVIEWID()).to.equal(docInfo.pageViewId);
      expect(customMacros.PAGEVIEWID_64()).to.equal(docInfo.pageViewId64);
      expect(customMacros.HREF()).to.equal(win.location.href);
      expect(customMacros.CANONICAL_URL()).to.equal(docInfo.canonicalUrl);
      expect(customMacros.TGT()).to.equal(JSON.stringify(json['targeting']));
      expect(customMacros.ELEMENT_POS()).to.equal(
        element.getBoundingClientRect().top + scrollY
      );
      expect(customMacros.SCROLL_TOP()).to.equal(scrollTopValue);
      expect(customMacros.PAGE_HEIGHT()).to.equal(scrollHeightValue);
      expect(customMacros.BKG_STATE()).to.equal(
        impl.getAmpDoc().isVisible() ? 'visible' : 'hidden'
      );
      Object.keys(macros).forEach((macro) => {
        expect(customMacros.ATTR(macro)).to.equal(macros[macro]);
      });
      return Promise.all([
        customMacros.ADCID().then((adcid) => {
          expect(adcid).to.not.be.null;
        }),
      ]);
    });

    it('should skip not allowed macros', () => {
      const macros = {
        'width': '300',
        'height': '250',
        'json': '',
        'not-allowed': 'blabla',
      };
      element = createElementWithAttributes(doc, 'amp-ad', macros);
      impl = new AmpAdNetworkSmartadserverImpl(element);
      const customMacros = impl.getCustomRealTimeConfigMacros_();

      expect(customMacros.TGT()).to.equal(undefined);
      expect(customMacros.ATTR('width')).to.equal(macros['width']);
      expect(customMacros.ATTR('height')).to.equal(macros['height']);
      expect(customMacros.ATTR('not-allowed')).to.not.be.equal(
        macros['not-allowed']
      );
      expect(customMacros.ATTR('not-allowed')).to.equal('');
    });
  });

  describe('getAdUrl', () => {
    it('should return proper url with vendor(default) data', async () => {
      element = createElementWithAttributes(doc, 'amp-ad', {
        'width': 300,
        'height': 250,
        'data-site': 111,
        'data-page': 121,
        'data-format': 222,
        'type': 'smartadserver',
        'rtc-config': JSON.stringify(rtcConfig),
      });
      doc.body.appendChild(element);

      const viewer = Services.viewerForDoc(element);
      env.sandbox.stub(viewer, 'getReferrerUrl');

      const rtcResponseArray = [
        {
          response: {
            targeting: {
              'hb_bidder': 'appnexus',
              'hb_cache_host': 'prebid.ams1.adnxs-simple.com',
              'hb_cache_id': '0cb22b3e-aa2d-4936-9039-0ec93ff67de5',
              'hb_cache_path': '/pbc/v1/cache',
              'hb_pb': '1.7',
              'hb_size': '300x250',
            },
          },
          rtcTime: 210,
        },
      ];

      return new AmpAdNetworkSmartadserverImpl(element)
        .getAdUrl({}, Promise.resolve(rtcResponseArray))
        .then((url) => {
          expect(url).to.match(
            /^https:\/\/www\.smartadserver\.com\/ac\?siteid=111&pgid=121&fmtid=222&tag=sas_222&out=amp-hb&hb_bid=appnexus&hb_cpm=1.7&hb_ccy=USD&hb_cache_id=0cb22b3e-aa2d-4936-9039-0ec93ff67de5&hb_cache_host=prebid.ams1.adnxs-simple.com&hb_cache_path=%2Fpbc%2Fv1%2Fcache&hb_width=300&hb_height=250&isasync=1&pgDomain=[a-zA-Z0-9.%]+&tmstp=1\-[0-9]+$/
          );
        });
    });

    it('should return proper url with Criteo vendor data', async () => {
      element = createElementWithAttributes(doc, 'amp-ad', {
        'width': 728,
        'height': 90,
        'data-site': 111,
        'data-page': 121,
        'data-format': 222,
        'type': 'smartadserver',
        'rtc-config': JSON.stringify(rtcConfig),
      });
      doc.body.appendChild(element);

      const viewer = Services.viewerForDoc(element);
      env.sandbox.stub(viewer, 'getReferrerUrl');

      const rtcResponseArray = [
        {
          response: {
            targeting: {
              'hb_bidder': 'appnexus',
              'hb_cache_host': 'prebid.ams1.adnxs-simple.com',
              'hb_cache_id': '0cb22b3e-aa2d-4936-9039-0ec93ff67de5',
              'hb_cache_path': '/pbc/v1/cache',
              'hb_pb': '1.7',
              'hb_size': '300x250',
            },
          },
          rtcTime: 210,
        },
        {
          response: {
            targeting: {
              'crt_display_url': 'http://test.test',
              'crt_amp_rtc_pb': '2.6',
              'crt_amp_rtc_format': '728x90',
            },
          },
          rtcTime: 97,
          callout: 'criteo',
        },
      ];

      return new AmpAdNetworkSmartadserverImpl(element)
        .getAdUrl({}, Promise.resolve(rtcResponseArray))
        .then((url) => {
          expect(url).to.match(
            /^https:\/\/www\.smartadserver\.com\/ac\?siteid=111&pgid=121&fmtid=222&tag=sas_222&out=amp-hb&hb_bid=criteo&hb_cpm=2.6&hb_ccy=USD&hb_cache_url=http%3A%2F%2Ftest.test&hb_width=728&hb_height=90&hb_cache_content_type=application%2Fjavascript&isasync=1&pgDomain=[a-zA-Z0-9.%]+&tmstp=1\-[0-9]+$/
          );
        });
    });

    it('should return proper url while missing some vendor data', async () => {
      element = createElementWithAttributes(doc, 'amp-ad', {
        'data-site': 11,
        'data-format': 23,
        'type': 'smartadserver',
        'rtc-config': JSON.stringify(rtcConfig),
      });
      doc.body.appendChild(element);

      const viewer = Services.viewerForDoc(element);
      env.sandbox.stub(viewer, 'getReferrerUrl');

      const rtcResponseArray = [
        {
          response: {
            'targeting': {
              'hb_cache_host': 'prebid.ams1.adnxs-simple.com',
              'hb_cache_id': '0cb22b3e-aa2d-4936-9039-0ec93ff67de5',
              'hb_cache_path': '/pbc/v1/cache',
              'hb_pb': '0.4',
              'hb_size': '300x250',
            },
          },
          rtcTime: 109,
        },
      ];

      return new AmpAdNetworkSmartadserverImpl(element)
        .getAdUrl({}, Promise.resolve(rtcResponseArray))
        .then((url) => {
          expect(url).to.match(
            /^https:\/\/www\.smartadserver\.com\/ac\?siteid=11&fmtid=23&tag=sas_23&out=amp-hb&hb_cpm=0.4&hb_ccy=USD&hb_cache_id=0cb22b3e-aa2d-4936-9039-0ec93ff67de5&hb_cache_host=prebid.ams1.adnxs-simple.com&hb_cache_path=%2Fpbc%2Fv1%2Fcache&isasync=1&pgDomain=[a-zA-Z0-9.%]+&tmstp=1\-[0-9]+$/
          );
        });
    });

    it('should return proper url with default vendor data', async () => {
      element = createElementWithAttributes(doc, 'amp-ad', {
        'data-site': 11,
        'data-format': 23,
        'rtc-config': JSON.stringify(rtcConfig),
      });
      doc.body.appendChild(element);

      const viewer = Services.viewerForDoc(element);
      env.sandbox.stub(viewer, 'getReferrerUrl');

      const rtcResponseArray = [
        {
          response: {
            'targeting': {
              'hb_pb': '0.8',
              'hb_size': '100x200',
            },
          },
          rtcTime: 109,
        },
      ];

      return new AmpAdNetworkSmartadserverImpl(element)
        .getAdUrl({}, Promise.resolve(rtcResponseArray))
        .then((url) => {
          expect(url).to.match(
            /^https:\/\/www\.smartadserver\.com\/ac\?siteid=11&fmtid=23&tag=sas_23&out=amp-hb&hb_cpm=0.8&hb_ccy=USD&isasync=1&pgDomain=[a-zA-Z0-9.%]+&tmstp=1\-[0-9]+$/
          );
        });
    });

    it('should return proper url without vendor data', async () => {
      element = createElementWithAttributes(doc, 'amp-ad', {
        'width': '100',
        'height': '50',
        'data-site': '1',
        'data-format': '33',
        'data-domain': 'https://ww7.smartadserver.com',
        'type': 'smartadserver',
      });
      doc.body.appendChild(element);

      const viewer = Services.viewerForDoc(element);
      env.sandbox.stub(viewer, 'getReferrerUrl');

      return new AmpAdNetworkSmartadserverImpl(element)
        .getAdUrl({}, Promise.resolve())
        .then((url) => {
          expect(url).to.match(
            /^https:\/\/ww7\.smartadserver\.com\/ac\?siteid=1&fmtid=33&tag=sas_33&out=amp-hb&isasync=1&pgDomain=[a-zA-Z0-9.%]+&tmstp=1\-[0-9]+$/
          );
        });
    });

    it('should return proper url with falsy callout response', async () => {
      element = createElementWithAttributes(doc, 'amp-ad', {
        'data-site': 2,
        'data-format': 3,
      });
      doc.body.appendChild(element);

      const viewer = Services.viewerForDoc(element);
      env.sandbox.stub(viewer, 'getReferrerUrl');

      return new AmpAdNetworkSmartadserverImpl(element)
        .getAdUrl({}, null)
        .then((url) => {
          expect(url).to.match(
            /^https:\/\/www\.smartadserver\.com\/ac\?siteid=2&fmtid=3&tag=sas_3&out=amp-hb&isasync=1&pgDomain=[a-zA-Z0-9.%]+&tmstp=1\-[0-9]+$/
          );
        });
    });

    it('should return proper url with HB vendor and Amazon data', async () => {
      const rtcResponseArray = [
        {
          response: {
            targeting: {
              'hb_bidder': 'appnexus',
              'hb_cache_host': 'prebid.ams1.adnxs-simple.com',
              'hb_cache_id': '0cb22b3e-aa2d-4936-9039-0ec93ff67de5',
              'hb_cache_path': '/pbc/v1/cache',
              'hb_pb': '1.3',
              'hb_size': '300x250',
            },
          },
          callout: 'prebidappnexuspsp',
          rtcTime: 184,
        },
        {
          response: {
            'targeting': {
              'amzniid': 'JBJnc908',
              'amznsz': '300x250',
              'amznp': '19131mo',
              'amznbid': 'amp_dv85c0',
              'amznhost': 'https://amazon-adsystem.com',
            },
          },
          callout: 'aps',
          rtcTime: 102,
        },
      ];

      element = createElementWithAttributes(doc, 'amp-ad', {
        'width': 300,
        'height': 250,
        'data-site': 1,
        'data-page': 22,
        'data-format': 333,
        'data-target': 'key=value',
        'type': 'smartadserver',
        'rtc-config': JSON.stringify(rtcConfig),
      });
      doc.body.appendChild(element);

      const viewer = Services.viewerForDoc(element);
      env.sandbox.stub(viewer, 'getReferrerUrl');

      return new AmpAdNetworkSmartadserverImpl(element)
        .getAdUrl({}, Promise.resolve(rtcResponseArray))
        .then((url) => {
          expect(url).to.match(
            /^https:\/\/www\.smartadserver\.com\/ac\?siteid=1&pgid=22&fmtid=333&tgt=amzniid%3DJBJnc908%3Bamznp%3D19131mo%3Bamznbid%3Ddv85c0%3Bkey%3Dvalue&tag=sas_333&out=amp-hb&hb_bid=appnexus&hb_cpm=1.3&hb_ccy=USD&hb_cache_id=0cb22b3e-aa2d-4936-9039-0ec93ff67de5&hb_cache_host=prebid.ams1.adnxs-simple.com&hb_cache_path=%2Fpbc%2Fv1%2Fcache&hb_width=300&hb_height=250&isasync=1&pgDomain=[a-zA-Z0-9.%]+&tmstp=1\-[0-9]+$/
          );
        });
    });

    it('should return proper url with schain value', async () => {
      element = createElementWithAttributes(doc, 'amp-ad', {
        'data-site': '1',
        'data-format': '22',
        'data-schain': 'some-sco-string',
      });
      doc.body.appendChild(element);
      const viewer = Services.viewerForDoc(element);
      env.sandbox.stub(viewer, 'getReferrerUrl');
      return new AmpAdNetworkSmartadserverImpl(element)
        .getAdUrl({}, null)
        .then((url) => {
          expect(url).to.match(
            /^https:\/\/www\.smartadserver\.com\/ac\?siteid=1&fmtid=22&tag=sas_22&out=amp-hb&schain=some-sco-string&isasync=1&pgDomain=[a-zA-Z0-9.%]+&tmstp=1-[0-9]+$/
          );
        });
    });

    it('should not return chain parameter in url if empty value', async () => {
      element = createElementWithAttributes(doc, 'amp-ad', {
        'data-site': 10,
        'data-format': '3',
        'data-schain': '',
      });
      doc.body.appendChild(element);
      const viewer = Services.viewerForDoc(element);
      env.sandbox.stub(viewer, 'getReferrerUrl');
      return new AmpAdNetworkSmartadserverImpl(element)
        .getAdUrl({}, null)
        .then((url) => {
          expect(url).to.match(
            /^https:\/\/www\.smartadserver\.com\/ac\?siteid=10&fmtid=3&tag=sas_3&out=amp-hb&isasync=1&pgDomain=[a-zA-Z0-9.%]+&tmstp=1-[0-9]+$/
          );
        });
    });
    it('should return proper url with isasync value when it is not setted', async () => {
      element = createElementWithAttributes(doc, 'amp-ad', {
        'data-site': 10,
        'data-format': '3',
        'data-isasync': '',
      });
      doc.body.appendChild(element);
      const viewer = Services.viewerForDoc(element);
      env.sandbox.stub(viewer, 'getReferrerUrl');
      return new AmpAdNetworkSmartadserverImpl(element)
        .getAdUrl({}, null)
        .then((url) => {
          expect(url).to.match(
            /^https:\/\/www\.smartadserver\.com\/ac\?siteid=10&fmtid=3&tag=sas_3&out=amp-hb&isasync=1&pgDomain=[a-zA-Z0-9.%]+&tmstp=1-[0-9]+$/
          );
        });
    });

    it('should return proper url with isasync value when it is setted with not boolean value ', async () => {
      element = createElementWithAttributes(doc, 'amp-ad', {
        'data-site': 10,
        'data-format': '3',
        'data-isasync': 'test',
      });
      doc.body.appendChild(element);
      const viewer = Services.viewerForDoc(element);
      env.sandbox.stub(viewer, 'getReferrerUrl');
      return new AmpAdNetworkSmartadserverImpl(element)
        .getAdUrl({}, null)
        .then((url) => {
          expect(url).to.match(
            /^https:\/\/www\.smartadserver\.com\/ac\?siteid=10&fmtid=3&tag=sas_3&out=amp-hb&isasync=1&pgDomain=[a-zA-Z0-9.%]+&tmstp=1-[0-9]+$/
          );
        });
    });

    it('should return proper url with isasync value when it is setted to false', async () => {
      element = createElementWithAttributes(doc, 'amp-ad', {
        'data-site': 10,
        'data-format': '3',
        'data-isasync': 'false',
      });
      doc.body.appendChild(element);
      const viewer = Services.viewerForDoc(element);
      env.sandbox.stub(viewer, 'getReferrerUrl');
      return new AmpAdNetworkSmartadserverImpl(element)
        .getAdUrl({}, null)
        .then((url) => {
          expect(url).to.match(
            /^https:\/\/www\.smartadserver\.com\/ac\?siteid=10&fmtid=3&tag=sas_3&out=amp-hb&isasync=0&pgDomain=[a-zA-Z0-9.%]+&tmstp=1-[0-9]+$/
          );
        });
    });

    it('should return proper url when isasync is true', async () => {
      element = createElementWithAttributes(doc, 'amp-ad', {
        'data-site': '1',
        'data-format': '22',
        'data-isasync': 'true',
      });
      doc.body.appendChild(element);
      const viewer = Services.viewerForDoc(element);
      env.sandbox.stub(viewer, 'getReferrerUrl');
      return new AmpAdNetworkSmartadserverImpl(element)
        .getAdUrl({}, null)
        .then((url) => {
          expect(url).to.match(
            /^https:\/\/www\.smartadserver\.com\/ac\?siteid=1&fmtid=22&tag=sas_22&out=amp-hb&isasync=1&pgDomain=[a-zA-Z0-9.%]+&tmstp=1-[0-9]+$/
          );
        });
    });
  });

  describe('getNonAmpCreativeRenderingMethod', () => {
    it('should return iframe get if iOS browser', () => {
      win.navigator.__defineGetter__('userAgent', () => {
        return 'Mozilla/5.0 (iPod; CPU iPhone OS 12_0 like macOS) AppleWebKit/602.1.50 (KHTML, like Gecko) Version/12.0 Mobile/14A5335d Safari/602.1.50';
      });

      element = createElementWithAttributes(doc, 'amp-ad', {
        type: 'smartadserver',
      });

      expect(
        new AmpAdNetworkSmartadserverImpl(
          element
        ).getNonAmpCreativeRenderingMethod()
      ).to.equal(XORIGIN_MODE.IFRAME_GET);
    });
  });

  describe('getBestRtcCallout', () => {
    beforeEach(() => {
      impl = new AmpAdNetworkSmartadserverImpl(doc.createElement('amp-ad'));
    });

    it('should return best callout data', async () => {
      const rtcResponseArray = [
        {
          response: {
            targeting: {
              'hb_bidder': 'appnexus',
              'hb_bidder_appnexus': 'appnexus',
              'hb_cache_host': 'prebid.ams1.adnxs-simple.com',
              'hb_cache_host_appnex': 'prebid.ams1.adnxs-simple.com',
              'hb_cache_id': '558a891a-a532-423c-a30e-11a9caeea688',
              'hb_cache_id_appnexus': '558a891a-a532-423c-a30e-11a9caeea688',
              'hb_cache_path': '/pbc/v1/cache',
              'hb_cache_path_appnex': '/pbc/v1/cache',
              'hb_pb': '0.10',
              'hb_pb_appnexus': '0.10',
              'hb_size': '300x250',
              'hb_size_appnexus': '300x250',
            },
          },
          rtcTime: 134,
          callout: 'prebidappnexuspsp',
        },
        {
          response: {},
          rtcTime: 122,
          callout: 'criteo',
        },
        {
          'response': {
            'targeting': {
              'hb_bidder': 'indexexchange',
              'hb_cache_host': 'amp.casalemedia.com',
              'hb_cache_id': '558a891a-a532-423c-a30e-11a9caeea688',
              'hb_cache_path': '/amprtc/v1/cache',
              'hb_pb': '0.30',
              'hb_size': '300x250',
            },
          },
          'rtcTime': 106,
          'callout': 'indexexchange',
        },
      ];

      expect(impl.getBestRtcCallout_(rtcResponseArray)).to.deep.equal(
        rtcResponseArray[2].response.targeting
      );
    });

    it('should return empty object when no offers', async () => {
      const rtcResponseArray = [
        {
          'response': {},
          'rtcTime': 92,
          'callout': 'prebidappnexuspsp',
        },
        {
          'response': {},
          'rtcTime': 117,
          'callout': 'indexexchange',
        },
        {
          'response': {},
          'rtcTime': 131,
          'callout': 'criteo',
        },
      ];

      expect(impl.getBestRtcCallout_(rtcResponseArray)).to.deep.equal({});
    });

    it('should return empty object when empty callouts array', async () => {
      expect(impl.getBestRtcCallout_([])).to.deep.equal({});
    });

    it('should return empty object when falsy argument', async () => {
      expect(impl.getBestRtcCallout_(null)).to.deep.equal({});
    });
  });

  describe('addListener', () => {
    it('should collapse below viewport on collapse event', async () => {
      const offset = createElementWithAttributes(doc, 'div');
      offset.setAttribute('style', 'width:100%; height:10000px');
      doc.body.appendChild(offset);

      element = createElementWithAttributes(doc, 'amp-ad');
      const iframe = createIframeWithMessageStub(win);
      element.appendChild(iframe);
      doc.body.appendChild(element);
      impl = new AmpAdNetworkSmartadserverImpl(element, doc, win);

      const attemptCollapse = env.sandbox
        .stub(impl, 'attemptCollapse')
        .callsFake(() => {
          return Promise.resolve();
        });

      const data = {
        sentinel: impl.sentinel,
        type: 'collapse',
      };

      expect(element.getBoundingClientRect().top).to.equal(10000);
      expect(attemptCollapse).to.not.be.called;

      iframe.contentWindow.parent.postMessage('collapse', '*');
      expect(attemptCollapse).to.not.be.called;

      iframe.contentWindow.parent.postMessage(
        {
          sentinel: 1234,
          type: 'collapse',
        },
        '*'
      );
      expect(attemptCollapse).to.not.be.called;

      iframe.contentWindow.parent.postMessage(data, '*');
      expect(attemptCollapse).to.be.calledOnce;

      iframe.contentWindow.parent.postMessage(data, '*');
      expect(attemptCollapse).to.be.calledOnce;
    });

    it('should not collapse in viewport on collapse event', async () => {
      element = createElementWithAttributes(doc, 'amp-ad');
      const iframe = createIframeWithMessageStub(win);
      element.appendChild(iframe);
      doc.body.appendChild(element);
      impl = new AmpAdNetworkSmartadserverImpl(element, doc, win);

      const attemptCollapse = env.sandbox
        .stub(impl, 'attemptCollapse')
        .callsFake(() => {
          return Promise.resolve();
        });

      const data = {
        sentinel: impl.sentinel,
        type: 'collapse',
      };

      expect(element.getBoundingClientRect().top).to.equal(0);
      expect(doc.body.getBoundingClientRect().height).to.be.lt(160);
      expect(attemptCollapse).to.not.be.called;

      iframe.contentWindow.parent.postMessage(data, '*');
      expect(attemptCollapse).to.be.calledOnce;
      expect(element.getBoundingClientRect().height).to.be.gt(150);
    });
  });

  describe('modifyVendorResponse', () => {
    beforeEach(() => {
      impl = new AmpAdNetworkSmartadserverImpl(doc.createElement('amp-ad'));
    });

    it('should handle empty response', async () => {
      const bidResponses = [
        {},
        {
          'response': {},
        },
        {
          'response': {
            'targeting': {},
          },
          'callout': 'criteo',
        },
      ];

      const res = impl.modifyVendorResponse(bidResponses);

      expect(res[0]).to.deep.equal(bidResponses[0]);
      expect(res[1]).to.deep.equal(bidResponses[1]);
      expect(res[2]).to.deep.equal(bidResponses[2]);
    });

    it('should handle Criteo response', async () => {
      const criteoExampleResponse = [
        {
          'response': {
            'targeting': {
              'crt_display_url':
                'https%3A%2F%2Fads.eu.criteo.com%2Fdelivery%2Fr%2Fajs.php%3Fu%3D%257CyYP2Nxn%252BAmlnchiEQlOsuklsAFFZpGm3EU%252FjjuD0GOA%253D%257C%26c1%3D0n2XosTo5cmttfZ_Xo-xoRysCgATX3DvUOIjpsZKqJdm3eyNZdKRXiG1WaNgOl-yTgKu_JgyoYLHkIsbBRPK5MapBzXSKnuPUJPy0V6STkn6pelkbbtucKKReRNkE_d9ovu_dCN5_74mNyHExIWAhfzTHwsdk0ZdrYKbkuQzQjTaI46HGlSNLcJFInpzROSggbHvxVeN-leVzY818y-Ecu2pqHgq8_mGpyLWnL69l00EeuGdOORdpHGk5erc99iT74U7z9834rxtE6UZSB_dYOZjoHA5Asz33g3Siyu-N6woBaYGBqcaFWpH2t9dYbAvrSFo0dKG2zqyr16C0ls-qzk65I7WcFBBbyzxZ74My577ukVt_nluaBHHuougmq6czxQ3kiKBUMau_k7d_mnh1qN5s_2e3st-zYsJYUlQHjlpH0ENsWBk30Zdk3OTcAnD2I1StD3nkWPDZPKmJ4a0uV7bmrHqgKxkuVAQMaCs2no',
              'crt_amp_rtc_pb': '0.81',
              'crt_amp_rtc_format': '728x90',
            },
          },
          'rtcTime': 97,
          'callout': 'criteo',
        },
      ];
      let res = impl.modifyVendorResponse(criteoExampleResponse);
      expect(res[0].response.targeting.hb_pb).to.deep.equal(
        criteoExampleResponse[0].response.targeting.crt_amp_rtc_pb
      );
      expect(res[0].response.targeting.hb_cache_content_type).to.deep.equal(
        'application/javascript'
      );
      expect(res[0].response.targeting.hb_cache_url).to.deep.equal(
        criteoExampleResponse[0].response.targeting.crt_display_url
      );
      criteoExampleResponse[0].response.targeting['crt_display_url'] =
        undefined;
      res = impl.modifyVendorResponse(criteoExampleResponse);
      expect(res[0]).to.deep.equal(criteoExampleResponse[0]);
    });

    describe('Amazon', () => {
      beforeEach(() => {
        expect(impl.exTgt_).to.deep.equal('');
      });

      it('should add keywords to target', async () => {
        const amazonBid = [
          {
            'response': {
              'targeting': {
                'amzniid': 'JBJnc908',
                'amznsz': '300x250',
                'amznp': '19131mo',
                'amznbid': 'amp_dv85c0',
                'amznhost': 'https://amazon-adsystem.com',
              },
            },
            'rtcTime': 212,
            'callout': 'aps',
          },
        ];

        const res = impl.modifyVendorResponse(amazonBid);

        expect(res[0]).to.deep.equal(amazonBid[0]);
        expect(impl.exTgt_).to.deep.equal(
          'amzniid=JBJnc908;amznp=19131mo;amznbid=dv85c0;'
        );
      });

      it('should not modify target when no bid', async () => {
        const amazonBid = [
          {
            'response': {
              'targeting': {},
            },
            'rtcTime': 13,
            'callout': 'aps',
          },
        ];

        const res = impl.modifyVendorResponse(amazonBid);

        expect(res[0]).to.deep.equal(amazonBid[0]);
        expect(impl.exTgt_).to.deep.equal('');
      });
    });
  });
});
