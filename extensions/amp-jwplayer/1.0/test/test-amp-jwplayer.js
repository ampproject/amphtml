import '../amp-jwplayer';
import {createElementWithAttributes} from '#core/dom';

import {toggleExperiment} from '#experiments';

import {waitFor} from '#testing/helpers/service';

import * as consent from '../../../../src/consent';

/**
 * @param {Document} doc
 * @param {JsonObject} attrs
 * @returns {Element}
 */
async function mountComp(doc, attrs) {
  const el = createElementWithAttributes(doc, 'amp-jwplayer', {
    width: '200',
    height: '100',
    ...attrs,
  });

  doc.body.appendChild(el);
  await waitForRender(el);
  return el;
}

async function waitForRender(el) {
  await el.buildInternal();
  const loadPromise = el.layoutCallback();
  const shadow = el.shadowRoot;
  await waitFor(() => shadow.querySelector('iframe'), 'iframe mounted');
  await loadPromise;
}

describes.realWin(
  'amp-jwplayer-v1.0',
  {
    amp: {
      extensions: ['amp-jwplayer:1.0'],
    },
  },
  (env) => {
    beforeEach(async () => {
      toggleExperiment(env.win, 'bento-jwplayer', true, true);
    });

    it('example test renders', async () => {
      const mediaId = 'BZ6tc0gy';
      const playerId = 'uoIbMPm3';
      const element = await mountComp(env.win.document, {
        'data-media-id': mediaId,
        'data-player-id': playerId,
        'data-config-json': JSON.stringify({
          playbackRateControls: true,
          displaytitle: false,
          horizontalVolumeSlider: true,
        }),
        'data-config-skin-url':
          'https://playertest.longtailvideo.com/skins/ethan.css',
        'data-config-plugin-url':
          'https://playertest.longtailvideo.com/plugins/newsticker.js',
        'ad-macros-itemTest': 'val',
        'ad-macros-itemParamList': 'one,two,three',
        'ad-cust-params': JSON.stringify({key1: 'value1', keyTest: 'value2'}),
      });

      expect(element.shadowRoot.querySelector('iframe').src).to.equal(
        `https://content.jwplatform.com/players/${mediaId}-${playerId}.html?backfill=true&isAMP=true`
      );
    });

    it('should merge data-player-param-* and data-player-querystring', async () => {
      const attrs = {
        'data-media-id': 'BZ6tc0gy',
        'data-player-id': 'uoIbMPm3',
        'data-playlist-id': '482jsTAr',
        'data-content-search': 'search val',
        'data-content-recency': 'search rec',
        'data-content-backfill': false,
        'data-player-querystring': 'name1=abc&name2=xyz&name3=123',
        'data-player-param-language': 'de',
        'data-player-param-custom-ad-data': 'key:value;key2:value2',
        'data-block-on-consent': '_till_accepted',
      };

      env.sandbox.stub(consent, 'getConsentPolicyState').resolves('state');
      env.sandbox.stub(consent, 'getConsentPolicyInfo').resolves('info');
      env.sandbox
        .stub(consent, 'getConsentMetadata')
        .resolves({gdprApplies: true});
      const element = await mountComp(env.win.document, attrs);

      expect(element.shadowRoot.querySelector('iframe').src).to.equal(
        `https://content.jwplatform.com/players/${attrs['data-playlist-id']}-${attrs['data-player-id']}.html?language=de&customAdData=key%3Avalue%3Bkey2%3Avalue2&name1=abc&name2=xyz&name3=123&search=search%20val&recency=search%20rec&isAMP=true&consentState=state&consentValue=info&consentGdpr=true`
      );
    });

    it('should pass the loading attribute to the underlying iframe', async () => {
      const attrs = {
        'data-media-id': 'BZ6tc0gy',
        'data-player-id': 'uoIbMPm3',
        'data-playlist-id': '482jsTAr',
        'data-loading': 'lazy',
      };

      const element = await mountComp(env.win.document, attrs);

      expect(
        element.shadowRoot.querySelector('iframe').getAttribute('loading')
      ).to.equal('lazy');
    });

    it('should set data-loading="auto" if no value is specified', async () => {
      const attrs = {
        'data-media-id': 'BZ6tc0gy',
        'data-player-id': 'uoIbMPm3',
      };

      const element = await mountComp(env.win.document, attrs);

      expect(
        element.shadowRoot.querySelector('iframe').getAttribute('loading')
      ).to.equal('auto');
    });

    describe('contextual search', () => {
      it('should get search val from meta tag', async () => {
        const metaTitle = 'mockTitle1';
        env.win.document.head.append(
          createElementWithAttributes(env.win.document, 'meta', {
            property: 'og:title',
            content: metaTitle,
          })
        );

        const mediaId = 'BZ6tc0gy';
        const playerId = 'uoIbMPm3';
        const element = await mountComp(env.win.document, {
          'data-media-id': mediaId,
          'data-player-id': playerId,
          'data-content-search': '__CONTEXTUAL__',
        });
        expect(element.shadowRoot.querySelector('iframe').src).to.equal(
          `https://content.jwplatform.com/players/${mediaId}-${playerId}.html?search=${metaTitle}&backfill=true&isAMP=true`
        );
      });

      it('should get search val from title tag', async () => {
        const title = 'mockTitle2';
        const titleEl = createElementWithAttributes(env.win.document, 'title');
        titleEl.textContent = title;
        env.win.document.head.append(titleEl);

        const mediaId = 'BZ6tc0gy';
        const playerId = 'uoIbMPm3';
        const element = await mountComp(env.win.document, {
          'data-media-id': mediaId,
          'data-player-id': playerId,
          'data-content-search': '__CONTEXTUAL__',
        });
        expect(element.shadowRoot.querySelector('iframe').src).to.equal(
          `https://content.jwplatform.com/players/${mediaId}-${playerId}.html?search=${title}&backfill=true&isAMP=true`
        );
      });
    });
  }
);
