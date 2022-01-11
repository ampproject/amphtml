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
import {createElementWithAttributes} from '#core/dom';

import {Services} from '#service';

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
      prebidappnexus: {
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
    it('should return proper url with vendor data', async () => {
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
            /^https:\/\/www\.smartadserver\.com\/ac\?siteid=111&pgid=121&fmtid=222&tag=sas_222&out=amp-hb&hb_bid=appnexus&hb_cpm=1.7&hb_ccy=USD&hb_cache_id=0cb22b3e-aa2d-4936-9039-0ec93ff67de5&hb_cache_host=prebid.ams1.adnxs-simple.com&hb_cache_path=%2Fpbc%2Fv1%2Fcache&hb_width=300&hb_height=250&pgDomain=[a-zA-Z0-9.-]+&tmstp=[0-9]+$/
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
            /^https:\/\/www\.smartadserver\.com\/ac\?siteid=11&fmtid=23&tag=sas_23&out=amp-hb&hb_cpm=0.4&hb_ccy=USD&hb_cache_id=0cb22b3e-aa2d-4936-9039-0ec93ff67de5&hb_cache_host=prebid.ams1.adnxs-simple.com&hb_cache_path=%2Fpbc%2Fv1%2Fcache&pgDomain=[a-zA-Z0-9.-]+&tmstp=[0-9]+$/
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
            /^https:\/\/www\.smartadserver\.com\/ac\?siteid=11&fmtid=23&tag=sas_23&out=amp-hb&hb_cpm=0.8&hb_ccy=USD&pgDomain=[a-zA-Z0-9.-]+&tmstp=[0-9]+$/
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
            /^https:\/\/ww7\.smartadserver\.com\/ac\?siteid=1&fmtid=33&tag=sas_33&out=amp-hb&pgDomain=[a-zA-Z0-9.-]+&tmstp=[0-9]+$/
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
            /^https:\/\/www\.smartadserver\.com\/ac\?siteid=2&fmtid=3&tag=sas_3&out=amp-hb&pgDomain=[a-zA-Z0-9.-]+&tmstp=[0-9]+$/
          );
        });
    });
  });

  describe('sendXhrRequest', () => {
    function mockXhrFor(response) {
      return {
        fetch: () =>
          Promise.resolve({
            text: () => Promise.resolve(response),
          }),
      };
    }

    it('should not collapse when ad response', async () => {
      env.sandbox
        .stub(Services, 'xhrFor')
        .returns(
          mockXhrFor('<html><body><div>advertisement</div></body></html>')
        );

      impl = new AmpAdNetworkSmartadserverImpl(doc.createElement('amp-ad'));
      const stub = env.sandbox.stub(impl, 'collapse');

      expect(stub.notCalled).to.equal(true);
      await impl.sendXhrRequest();
      expect(stub.notCalled).to.equal(true);
    });

    it('should collapse when no ad response', async () => {
      env.sandbox
        .stub(Services, 'xhrFor')
        .returns(mockXhrFor('<html><head></head><body></body></html>'));

      impl = new AmpAdNetworkSmartadserverImpl(doc.createElement('amp-ad'));
      const stub = env.sandbox.stub(impl, 'collapse');

      expect(stub.notCalled).to.equal(true);
      await impl.sendXhrRequest();
      expect(stub.calledOnce).to.equal(true);
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
          callout: 'prebidappnexus',
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
          'callout': 'prebidappnexus',
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
});
