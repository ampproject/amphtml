import '../amp-soundcloud';
import {htmlFor} from '#core/dom/static-template';

import {toggleExperiment} from '#experiments';

import {waitFor} from '#testing/helpers/service';

describes.realWin(
  'amp-soundcloud-v1.0',
  {
    amp: {
      extensions: ['amp-soundcloud:1.0'],
    },
  },
  (env) => {
    let win;
    let html;
    let doc;

    let element;

    // Perform before every testcase
    beforeEach(async () => {
      win = env.win;
      doc = win.document;
      html = htmlFor(doc);
      toggleExperiment(env.win, 'bento-soundcloud', true, true);
    });

    /**
     * Builds Soundcloud Widget URL
     * @param {string|undefined} color
     * @param {string|undefined} trackId
     * @param {strng|undefined} playlistId
     * @param {boolean|undefined} visual
     * @param {string|undefined} secretToken
     * @returns Soundcloud Widget URL
     */
    const buildURL = (color, trackId, playlistId, visual, secretToken) => {
      // Build Base URL
      const url =
        'https://api.soundcloud.com/' +
        (trackId != undefined ? 'tracks' : 'playlists') +
        '/';

      // Extract Media ID
      const mediaId = playlistId ? playlistId : trackId;

      // Prepare Soundcloud Widget URL for iFrame
      let iframeSrc =
        'https://w.soundcloud.com/player/?' +
        'url=' +
        encodeURIComponent(url + mediaId);

      if (secretToken) {
        // It's very important the entire thing is encoded, since it's part of
        // the `url` query param added above.
        iframeSrc += encodeURIComponent('?secret_token=' + secretToken);
      }

      if (visual === true) {
        iframeSrc += '&visual=true';
      } else if (color) {
        iframeSrc += '&color=' + encodeURIComponent(color);
      }

      return iframeSrc;
    };

    /**
     * Wait for iframe to be mounted
     */
    const waitForRender = async () => {
      await element.buildInternal();
      const loadPromise = element.layoutCallback();
      const {shadowRoot} = element;
      await waitFor(() => shadowRoot.querySelector('iframe'), 'iframe mounted');
      await loadPromise;
    };

    it('renders track', async () => {
      // Prepare Bento Tag
      element = html`
        <amp-soundcloud
          data-color="FF5500"
          data-trackid="243169232"
          data-visual="true"
          width="400"
          height="300"
          layout="responsive"
          sizes="(min-width: 600px) 320px, 100vw"
        ></amp-soundcloud>
      `;

      // Add to Document
      doc.body.appendChild(element);

      // Wait till rendering is finished
      await waitForRender();

      // Extract iframe
      const iframe = element.shadowRoot.querySelector('iframe');

      // Make sure iframe is available
      expect(iframe).to.not.be.null;

      // Check iframe for correct scr URL
      expect(iframe.src).to.equal(
        buildURL('FF5500', '243169232', undefined, true, undefined)
      );
    });

    it('renders playlist', async () => {
      element = html`
        <amp-soundcloud
          data-color="FF5500"
          data-playlistid="151584683"
          data-visual="false"
          width="400"
          height="300"
          layout="responsive"
          sizes="(min-width: 600px) 320px, 100vw"
        ></amp-soundcloud>
      `;

      // Add to Document
      doc.body.appendChild(element);

      // Wait till rendering is finished
      await waitForRender();

      // Extract iframe
      const iframe = element.shadowRoot.querySelector('iframe');

      // Make sure iframe is available
      expect(iframe).to.not.be.null;

      // Check iframe for correct scr URL
      expect(iframe.src).to.equal(
        buildURL('FF5500', undefined, '151584683', false, undefined)
      );
    });

    it('renders secret token', async () => {
      element = html`
        <amp-soundcloud
          data-trackid="243169232"
          data-visual="false"
          data-secret-token="c-af"
        ></amp-soundcloud>
      `;

      // Add to Document
      doc.body.appendChild(element);

      // Wait till rendering is finished
      await waitForRender();

      // Extract iframe
      const iframe = element.shadowRoot.querySelector('iframe');

      // Make sure iframe is available
      expect(iframe).to.not.be.null;

      // Check iframe src for correct secret_token
      expect(iframe.src).to.include(encodeURIComponent('?secret_token=c-af'));
    });

    it('renders without optional params', async () => {
      element = html`
        <amp-soundcloud data-trackid="243169232"></amp-soundcloud>
      `;

      // Add to Document
      doc.body.appendChild(element);

      // Wait till rendering is finished
      await waitForRender();

      // Extract iframe
      const iframe = element.shadowRoot.querySelector('iframe');

      // Make sure iframe is available
      expect(iframe).to.not.be.null;

      // Check iframe for correct scr URL
      expect(iframe.src).not.to.include('&visual=true');
      expect(iframe.src).not.to.include('&color=FF0000');
    });

    it('renders fixed-height', async () => {
      element = html`
        <amp-soundcloud
          data-trackid="243169232"
          layout="fixed-height"
          height="340"
        ></amp-soundcloud>
      `;

      // Add to Document
      doc.body.appendChild(element);

      // Wait till rendering is finished
      await waitForRender();

      // Extract iframe
      const iframe = element.shadowRoot.querySelector('iframe');

      // Make sure iframe is available
      expect(iframe).to.not.be.null;

      // Check element for correct layout class
      expect(element.className).to.match(/i-amphtml-layout-fixed-height/);
    });

    it('renders responsively', async () => {
      element = html`
        <amp-soundcloud
          data-trackid="243169232"
          width="480"
          height="340"
          layout="responsive"
        ></amp-soundcloud>
      `;

      // Add to Document
      doc.body.appendChild(element);

      // Wait till rendering is finished
      await waitForRender();

      // Extract iframe
      const iframe = element.shadowRoot.querySelector('iframe');

      // Make sure iframe is available
      expect(iframe).to.not.be.null;

      // Check element for correct layout class
      expect(element.className).to.match(/i-amphtml-layout-responsive/);
    });

    it('ignores color in visual mode', async () => {
      element = html`
        <amp-soundcloud
          data-trackid="243169232"
          data-visual="true"
          data-color="00FF00"
        >
        </amp-soundcloud>
      `;

      // Add to Document
      doc.body.appendChild(element);

      // Wait till rendering is finished
      await waitForRender();

      // Extract iframe
      const iframe = element.shadowRoot.querySelector('iframe');

      // Make sure iframe is available
      expect(iframe).to.not.be.null;

      // Check iframe scr for correct parameters
      expect(iframe.src).to.include('visual=true');
      expect(iframe.src).not.to.include('color=00FF00');
    });

    it('renders data-trackid', async () => {
      element = html`
        <amp-soundcloud data-trackid="243169232"></amp-soundcloud>
      `;

      // Add to Document
      doc.body.appendChild(element);

      // Wait till rendering is finished
      await waitForRender();

      // Extract iframe
      const iframe = element.shadowRoot.querySelector('iframe');

      // Make sure iframe is available
      expect(iframe).to.not.be.null;

      /** Cannot test as userAssert not available for Preact Component */
      // expect(iframe.src).to.be.rejectedWith(
      //   /data-trackid or data-playlistid is required for <amp-soundcloud>/
      // );
    });
  }
);
