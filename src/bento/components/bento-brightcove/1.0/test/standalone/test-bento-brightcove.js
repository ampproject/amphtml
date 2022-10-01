import {CSS} from '#build/bento-base-carousel-1.0.css';

import {BaseElement as BentoBrightcove} from '#bento/components/bento-brightcove/1.0/base-element';
import {adoptStyles} from '#bento/util/unit-helpers';

import {createElementWithAttributes} from '#core/dom';

import {defineBentoElement} from '#preact/bento-ce';

import {waitFor} from '#testing/helpers/service';

import {parseUrlDeprecated} from '../../../../../../url';

describes.realWin(
  'bento-brightcove-1.0',
  {
    amp: false,
  },
  (env) => {
    let win;
    let doc;

    beforeEach(() => {
      win = env.win;
      doc = win.document;
      defineBentoElement('bento-brightcove', BentoBrightcove, win);
      adoptStyles(win, CSS);
    });

    async function getBrightcove(attributes) {
      const element = createElementWithAttributes(
        doc,
        'bento-brightcove',
        attributes
      );

      doc.body.appendChild(element);
      await element.getApi();
      return element;
    }

    it('should not remove `dock`', async () => {
      const element = await getBrightcove({
        'data-account': '1290862519001',
        'data-video-id': 'ref:amp-test-video',
        'dock': '',
      });
      expect(element.hasAttribute('dock')).to.be.true;
    });

    it('renders', async () => {
      const element = await getBrightcove({
        'data-account': '1290862519001',
        'data-video-id': 'ref:amp-test-video',
      });

      const iframe = element.shadowRoot.querySelector('iframe');
      expect(iframe).to.not.be.null;
      expect(iframe.src).to.equal(
        'https://players.brightcove.net/1290862519001/default_default' +
          '/index.html?amp=1' +
          '&videoId=ref:amp-test-video&playsinline=true'
      );
    });

    it('should pass data-param-* attributes to the iframe src', async () => {
      const element = await getBrightcove({
        'data-account': '1290862519001',
        'data-video-id': 'ref:amp-test-video',
        'data-param-my-param': 'hello world',
      });

      const iframe = element.shadowRoot.querySelector('iframe');
      const params = parseUrlDeprecated(iframe.src).search.split('&');
      expect(params).to.contain('myParam=hello%20world');
    });

    it('should exclude data-param-autoplay attribute', async () => {
      const element = await getBrightcove({
        'data-account': '1290862519001',
        'data-video-id': 'ref:amp-test-video',
        'data-param-autoplay': 'muted',
      });

      const iframe = element.shadowRoot.querySelector('iframe');
      const params = parseUrlDeprecated(iframe.src).search.split('&');
      expect(params).to.not.contain('autoplay');
    });

    it('should propagate mutated attributes', async () => {
      const element = await getBrightcove({
        'data-account': '1290862519001',
        'data-video-id': 'ref:amp-test-video',
      });
      const iframe = element.shadowRoot.querySelector('iframe');
      const initialSrc =
        'https://players.brightcove.net/1290862519001/default_default' +
        '/index.html?amp=1' +
        '&videoId=ref:amp-test-video&playsinline=true';
      expect(iframe.src).to.equal(initialSrc);

      element.setAttribute('data-account', '12345');
      element.setAttribute('data-video-id', 'aelementdef');
      await waitFor(() => iframe.src !== initialSrc, 'src changed');
      expect(iframe.src).to.equal(
        'https://players.brightcove.net/' +
          '12345/default_default/index.html?amp=1' +
          '&videoId=aelementdef&playsinline=true'
      );
    });

    it('should give precedence to playlist id', async () => {
      const element = await getBrightcove({
        'data-account': '1290862519001',
        'data-video-id': 'ref:amp-test-video',
        'data-playlist-id': 'ref:test-playlist',
      });

      const iframe = element.shadowRoot.querySelector('iframe');
      expect(iframe.src).to.contain('playlistId=ref:test-playlist');
      expect(iframe.src).not.to.contain('videoId');
    });

    it('should allow both playlist and video id to be unset', async () => {
      const element = await getBrightcove({
        'data-account': '1290862519001',
      });

      const iframe = element.shadowRoot.querySelector('iframe');
      expect(iframe.src).not.to.contain('&playlistId');
      expect(iframe.src).not.to.contain('&videoId');
    });

    it('should pass referrer', async () => {
      const element = await getBrightcove({
        'data-account': '1290862519001',
        'data-referrer': 'COUNTER',
      });

      const iframe = element.shadowRoot.querySelector('iframe');
      expect(iframe.src).to.contain('referrer=COUNTER');
    });

    it('should force playsinline', async () => {
      const element = await getBrightcove({
        'data-account': '1290862519001',
        'data-video-id': 'ref:amp-test-video',
        'data-param-playsinline': 'false',
      });

      const iframe = element.shadowRoot.querySelector('iframe');
      expect(iframe.src).to.contain('playsinline=true');
    });
  }
);
