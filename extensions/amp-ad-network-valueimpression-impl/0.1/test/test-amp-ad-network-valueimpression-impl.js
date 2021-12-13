// Need the following side-effect import because in actual production code,
// Fast Fetch impls are always loaded via an AmpAd tag, which means AmpAd is
// always available for them. However, when we test an impl in isolation,
// AmpAd is not loaded already, so we need to load it separately.
import '../../../amp-ad/0.1/amp-ad';
import {createElementWithAttributes} from '#core/dom';

import {Services} from '#service';

import {AmpAdNetworkValueimpressionImpl} from '../amp-ad-network-valueimpression-impl';

/**
 * We're allowing external resources because otherwise using realWin causes
 * strange behavior with iframes, as it doesn't load resources that we
 * normally load in prod.
 * We're turning on ampAdCss because using realWin means that we don't
 * inherit that CSS from the parent page anymore.
 */
const realWinConfig = {
  amp: {
    extensions: ['amp-ad-network-valueimpression-impl'],
  },
  ampAdCss: true,
  allowExternalResources: true,
};

describes.realWin(
  'amp-ad-network-valueimpression-impl',
  realWinConfig,
  (env) => {
    let win, doc;
    let element;
    let impl;

    beforeEach(() => {
      win = env.win;
      doc = win.document;
    });

    afterEach(() => {});

    describe('#isValidElement', () => {
      beforeEach(() => {
        element = doc.createElement('amp-ad');
        element.setAttribute('type', 'valueimpression');
        impl = new AmpAdNetworkValueimpressionImpl(element);
      });

      it('should be valid (amp-ad)', () => {
        expect(impl.isValidElement()).to.be.true;
      });

      it('should be valid (amp-embed)', () => {
        element = doc.createElement('amp-embed');
        element.setAttribute('type', 'valueimpression');
        impl = new AmpAdNetworkValueimpressionImpl(element);
        expect(impl.isValidElement()).to.be.true;
      });

      it('should NOT be valid (impl tag name)', () => {
        element = doc.createElement('amp-ad-network-valueimpression-impl');
        element.setAttribute('type', 'valueimpression');
        impl = new AmpAdNetworkValueimpressionImpl(element);
        expect(impl.isValidElement()).to.be.false;
      });
    });

    describe('#getCustomRealTimeConfigMacros_', () => {
      it('should return correct macros', () => {
        const macros = {
          'height': '250',
          'width': '300',
        };
        const rtcConfig = {
          'urls': [
            'https://useast.quantumdex.io/ampv2?client=23&metadata=autoCollect&tagid=1234',
          ],
        };
        element = createElementWithAttributes(env.win.document, 'amp-ad', {
          width: macros['width'],
          height: macros['height'],
          type: 'valueimpression',
          layout: 'fixed',
          'rtc-config': JSON.stringify(rtcConfig),
        });
        env.win.document.body.appendChild(element);

        impl = new AmpAdNetworkValueimpressionImpl(
          element,
          env.win.document,
          env.win
        );
        const customMacros = impl.getCustomRealTimeConfigMacros_();
        expect(customMacros.autoCollect()).to.equal(
          'href=about:srcdoc&canonical_url=http://localhost:9876/context.html&width=300&height=250&element_pos=0&scroll_top=0&page_height=254&bkg_state=visible'
        );
      });
    });

    describe('#getAdUrl', () => {
      beforeEach(() => {
        const rtcConfig = {
          'urls': [
            'https://useast.quantumdex.io/ampv2?client=23&metadata=autoCollect&tagid=1234',
          ],
        };

        element = doc.createElement('amp-ad');
        element.setAttribute('type', 'valueimpression');
        element.setAttribute('width', '300');
        element.setAttribute('height', '250');
        element.setAttribute('rtc-config', JSON.stringify(rtcConfig));
        doc.body.appendChild(element);
        impl = new AmpAdNetworkValueimpressionImpl(element);
        env.sandbox
          .stub(impl, 'getIntersectionElementLayoutBox')
          .callsFake(() => {
            return {
              top: 0,
              bottom: 0,
              left: 0,
              right: 0,
              width: 320,
              height: 350,
            };
          });
      });

      afterEach(() => {
        doc.body.removeChild(element);
      });

      it('returns the right URL', () => {
        const rtcResponseArray = [
          {
            response: {
              'dfpSlot': '/21766683948/example.com',
              'refreshInterval': 20000,
              'targeting': {
                'hb_cache_id': '0487b374-a394-46d8-9337-955793ab03fa',
                'hb_pb': '0.01',
                'hb_cache_path': '/cache/amp',
                'hb_size': '300x250',
                'hb_bidder': 'quantumdex',
                'hb_cache_host': 'quantumsyndication.com',
                'hb_bidid': 'e6e66901-6814-4919-8473-ba1fe65dffc1',
                'vli_sf': '1',
                'vli_adslot': '130',
                'vli_adtype': 'display',
              },
            },
            callout: 'useast.quantumdex.io/ampv2',
            rtcTime: 250,
          },
        ];

        const viewer = Services.viewerForDoc(element);
        env.sandbox
          .stub(viewer, 'getReferrerUrl')
          .returns(Promise.resolve('http://example.com/?foo=bar'));

        const impl = new AmpAdNetworkValueimpressionImpl(element);
        impl.uiHandler = {isStickyAd: () => false};
        return impl
          .getAdUrl(
            {consentString: 'user_consent_string', gdprApplies: true},
            Promise.resolve(rtcResponseArray),
            1
          )
          .then((url) => {
            [
              /^https:\/\/securepubads\.g\.doubleclick\.net\/gampad\/ads/,
              /(\?|&)adk=\d+(&|$)/,
              /(\?|&)gdfp_req=1(&|$)/,
              /(\?|&)impl=ifr(&|$)/,
              /(\?|&)sfv=\d+-\d+-\d+(&|$)/,
              /(\?|&)sz=300x250(&|$)/,
              /(\?|&)u_sd=[0-9]+(&|$)/,
              /(\?|&)is_amp=3(&|$)/,
              /(\?|&)amp_v=%24internalRuntimeVersion%24(&|$)/,
              /(\?|&)d_imp=1(&|$)/,
              /(\?|&)dt=[0-9]+(&|$)/,
              /(\?|&)ifi=[0-9]+(&|$)/,
              /(\?|&)c=[0-9]+(&|$)/,
              /(\?|&)output=html(&|$)/,
              /(\?|&)biw=[0-9]+(&|$)/,
              /(\?|&)bih=[0-9]+(&|$)/,
              /(\?|&)u_aw=[0-9]+(&|$)/,
              /(\?|&)u_ah=[0-9]+(&|$)/,
              /(\?|&)u_cd=(24|30)(&|$)/,
              /(\?|&)u_w=[0-9]+(&|$)/,
              /(\?|&)u_h=[0-9]+(&|$)/,
              /(\?|&)u_tz=-?[0-9]+(&|$)/,
              /(\?|&)u_his=[0-9]+(&|$)/,
              /(\?|&)isw=[0-9]+(&|$)/,
              /(\?|&)ish=[0-9]+(&|$)/,
              /(\?|&)url=https?%3A%2F%2F[a-zA-Z0-9.:%-]+(&|$)/,
              /(\?|&)top=localhost(&|$)/,
              /(\?|&)ref=http%3A%2F%2Fexample.com%2F%3Ffoo%3Dbar/,
              /(\?|&)dtd=[0-9]+(&|$)/,
              /(\?|&)vis=[0-5]+(&|$)/,
              /(\?|&)bdt=[1-9][0-9]*(&|$)/,
            ].forEach((regexp) => expect(url).to.match(regexp));
          });
      });
    });
  }
);
