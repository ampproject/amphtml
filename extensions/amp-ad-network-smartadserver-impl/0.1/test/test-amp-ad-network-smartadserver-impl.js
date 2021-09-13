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
import {AmpAdNetworkSmartadserverImpl} from '../amp-ad-network-smartadserver-impl';
import {Services} from '#service';
import {createElementWithAttributes} from '#core/dom';

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

  function jsonOk() {
    return Promise.resolve(
      new window.Response(
        JSON.stringify({
          key: 'value',
        }),
        {
          status: 200,
          headers: {
            'Content-type': 'application/json',
          },
        }
      )
    );
  }

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
        'targeting': {'a': '123'},
      };

      element = createElementWithAttributes(doc, 'amp-ad', {
        width: macros['width'],
        height: macros['height'],
        type: 'smartadserver',
        'data-slot': 5678,
        'data-override-width': 310,
        'data-override-height': 260,
        layout: 'fixed',
        json: JSON.stringify(json),
        'rtc-config': JSON.stringify(rtcConfig),
      });
      env.win.document.body.appendChild(element);

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
      const rtcResponseArray = [
        {
          response: {
            'targeting': {
              'hb_bidder': 'appnexus',
              'hb_cache_host': 'prebid.ams1.adnxs-simple.com',
              'hb_cache_id': '0cb22b3e-aa2d-4936-9039-0ec93ff67de5',
              'hb_cache_path': '/pbc/v1/cache',
              'hb_pb': '0.4',
              'hb_size': '300x250',
            },
          },
          rtcTime: 210,
        },
      ];

      element = doc.createElement('amp-ad');
      element.setAttribute('type', 'smartadserver');
      element.setAttribute('width', 300);
      element.setAttribute('height', 250);
      element.setAttribute('data-site', 111);
      element.setAttribute('data-format', 222);
      element.setAttribute('rtc-config', JSON.stringify(rtcConfig));
      doc.body.appendChild(element);

      impl = new AmpAdNetworkSmartadserverImpl(element);

      const stub = env.sandbox.stub(window, 'fetch');
      stub.onCall(0).returns(jsonOk());

      expect(stub.notCalled).to.equal(true);

      await impl.getAdUrl(
        {consentString: 'consent-string', gdprApplies: true},
        Promise.resolve(rtcResponseArray)
      );
      expect(stub.calledOnce).to.equal(true);
      expect(stub).to.have.been.calledWithMatch(
        /^https:\/\/www\.smartadserver\.com\/ac\?siteid=111&fmtid=222&tag=sas_222&out=amp&hb_bid=appnexus&hb_cpm=0\.4&hb_ccy=USD&pgDomain=[a-zA-Z0-9.-]+&tmstp=[0-9]+$/,
        {
          credentials: 'include',
        }
      );
    });

    it('should return proper url while missing some vendor data', async () => {
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

      element = doc.createElement('amp-ad');
      element.setAttribute('data-site', 11);
      element.setAttribute('data-format', '23');
      element.setAttribute('rtc-config', JSON.stringify(rtcConfig));
      doc.body.appendChild(element);

      impl = new AmpAdNetworkSmartadserverImpl(element);

      const stub = env.sandbox.stub(window, 'fetch');
      stub.onCall(0).returns(jsonOk());

      expect(stub.notCalled).to.equal(true);

      await impl.getAdUrl(
        {consentString: 'consent-string', gdprApplies: true},
        Promise.resolve(rtcResponseArray)
      );
      expect(stub.calledOnce).to.equal(true);
      expect(stub).to.have.been.calledWithMatch(
        /^https:\/\/www\.smartadserver\.com\/ac\?siteid=11&fmtid=23&tag=sas_23&out=amp&hb_bid=unknown&hb_cpm=0\.4&hb_ccy=USD&pgDomain=[a-zA-Z0-9.-]+&tmstp=[0-9]+$/,
        {
          credentials: 'include',
        }
      );
    });

    it('should return proper url without vendor data', async () => {
      element = doc.createElement('amp-ad');
      element.setAttribute('type', 'smartadserver');
      element.setAttribute('width', 100);
      element.setAttribute('height', 50);
      element.setAttribute('data-site', '1');
      element.setAttribute('data-format', '33');
      element.setAttribute('data-domain', 'https://ww7.smartadserver.com');

      doc.body.appendChild(element);
      impl = new AmpAdNetworkSmartadserverImpl(element);
      const stub = env.sandbox.stub(window, 'fetch');
      stub.onCall(0).returns(jsonOk());
      expect(stub.notCalled).to.equal(true);
      await impl.getAdUrl(
        {consentString: 'consent-string', gdprApplies: true},
        Promise.resolve([])
      );
      expect(stub.calledOnce).to.equal(true);
      expect(stub).to.have.been.calledWithMatch(
        /^https:\/\/ww7\.smartadserver\.com\/ac\?siteid=1&fmtid=33&tag=sas_33&out=amp&pgDomain=[a-zA-Z0-9.-]+&tmstp=[0-9]+$/,
        {
          credentials: 'include',
        }
      );
    });

    it('should return proper url with falsy callout response', async () => {
      element = doc.createElement('amp-ad');
      element.setAttribute('data-site', 2);
      element.setAttribute('data-format', 3);
      doc.body.appendChild(element);
      impl = new AmpAdNetworkSmartadserverImpl(element);

      const stub = env.sandbox.stub(window, 'fetch');
      stub.onCall(0).returns(jsonOk());
      expect(stub.notCalled).to.equal(true);
      await impl.getAdUrl({}, null);
      expect(stub.calledOnce).to.equal(true);
      expect(stub).to.have.been.calledWithMatch(
        /^https:\/\/www\.smartadserver\.com\/ac\?siteid=2&fmtid=3&tag=sas_3&out=amp&pgDomain=[a-zA-Z0-9.-]+&tmstp=[0-9]+$/,
        {
          credentials: 'include',
        }
      );
    });
  });

  describe('getBestRtcCallout', () => {
    it('should return best callout data', async () => {
      const rtcResponseArray = [
        {
          'response': {
            'targeting': {
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
          'rtcTime': 134,
          'callout': 'prebidappnexus',
        },
        {
          'response': {},
          'rtcTime': 122,
          'callout': 'criteo',
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

      impl = new AmpAdNetworkSmartadserverImpl(doc.createElement('amp-ad'));

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

      impl = new AmpAdNetworkSmartadserverImpl(doc.createElement('amp-ad'));

      expect(impl.getBestRtcCallout_(rtcResponseArray)).to.deep.equal({});
    });

    it('should return empty object when empty callouts array', async () => {
      impl = new AmpAdNetworkSmartadserverImpl(doc.createElement('amp-ad'));

      expect(impl.getBestRtcCallout_([])).to.deep.equal({});
    });
  });

  describe('getRtcAd', () => {
    it('should fetch creative while proper ad data', async () => {
      const fetchStub = env.sandbox.stub(window, 'fetch');
      element = doc.createElement('amp-ad');
      impl = new AmpAdNetworkSmartadserverImpl(element);

      fetchStub.onCall(0).returns(jsonOk());
      expect(fetchStub.notCalled).to.equal(true);

      const cache = {
        id: 'my_creative-id',
        host: 'callout.host.com',
        path: '/my/cache/path',
      };

      await impl.getRtcAd_(cache, element);

      expect(fetchStub).to.have.been.calledOnceWithExactly(
        new Request(
          'https://callout.host.com/my/cache/path?showAdm=1&uuid=my_creative-id'
        )
      );
    });
  });

  describe('renderIframe', () => {
    beforeEach(() => {
      element = doc.createElement('amp-ad');
      doc.body.appendChild(element);
      impl = new AmpAdNetworkSmartadserverImpl(element);
    });

    it('should render html ad markup', async () => {
      const html = '<div id="my_ad"></div>';
      impl.renderIframe_(html, element);

      expect(element.innerHTML).to.deep.equal(
        '<iframe width="100%" height="100%" scrolling="no" style="border:0; margin:0"></iframe>'
      );

      const iframe = element.firstChild;
      expect(iframe.contentDocument.documentElement.innerHTML).to.deep.equal(
        '<head></head><body style="margin:0">' + html + '</body>'
      );
    });

    it('should render script ad markup', async () => {
      const script = 'const myConst = true;';
      impl.renderIframe_(script, element, false);

      expect(element.innerHTML).to.deep.equal(
        '<iframe width="100%" height="100%" scrolling="no" style="border:0; margin:0"></iframe>'
      );

      const iframe = element.firstChild;
      expect(iframe.contentDocument.documentElement.innerHTML).to.deep.equal(
        '<head></head><body style="margin:0"><script>' +
          script +
          '</script></body>'
      );
    });

    it('should hide fallback', async () => {
      impl.fallback_ = doc.createElement('div');
      impl.fallback_.setAttribute('fallback', '');
      impl.element.appendChild(impl.fallback_);

      expect(element.innerHTML).to.deep.equal('<div fallback=""></div>');

      const html = '<h1>OK</h1>';
      impl.renderIframe_(html, element);

      expect(element.innerHTML).to.deep.equal(
        '<div fallback="" hidden=""></div><iframe width="100%" height="100%" scrolling="no" style="border:0; margin:0"></iframe>'
      );

      const iframe = element.childNodes[1];
      expect(iframe.contentDocument.documentElement.innerHTML).to.deep.equal(
        '<head></head><body style="margin:0">' + html + '</body>'
      );
    });
  });
});
