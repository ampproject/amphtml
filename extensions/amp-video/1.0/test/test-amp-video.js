import '../amp-video';
import {dispatchCustomEvent} from '#core/dom';
import {htmlFor} from '#core/dom/static-template';

import {toggleExperiment} from '#experiments';

import {waitFor} from '#testing/helpers/service';

describes.realWin(
  'amp-video-v1.0',
  {
    amp: {
      extensions: ['amp-video:1.0'],
      canonicalUrl: 'https://canonicalexample.com/',
    },
  },
  (env) => {
    let html;
    let element;

    const waitForRender = async () => {
      await element.buildInternal();
      const loadPromise = element.layoutCallback();
      const shadow = element.shadowRoot;
      await waitFor(() => shadow.querySelector('video'), 'video mounted');
      const video = shadow.querySelector('video');
      dispatchCustomEvent(video, 'canplay', null, {bubbles: false});
      await loadPromise;
    };

    beforeEach(() => {
      html = htmlFor(env.win.document);
      toggleExperiment(env.win, 'bento-video', true, true);
    });

    it('renders video element', async () => {
      element = html`
        <amp-video layout="responsive" width="16" height="9">
          <source src="foo" type="bar/baz" />
        </amp-video>
      `;

      env.win.document.body.appendChild(element);

      await waitForRender();

      const video = element.shadowRoot.querySelector('video');
      expect(video).to.not.be.null;
    });

    it('passes attributes through to <video>', async () => {
      element = html`
        <amp-video
          layout="responsive"
          width="16"
          height="9"
          src="something.mp4"
          poster="foo.png"
          loop
        ></amp-video>
      `;

      env.win.document.body.appendChild(element);

      await waitForRender();

      const video = element.shadowRoot.querySelector('video');
      expect(video.getAttribute('src')).to.equal(element.getAttribute('src'));
      expect(video.getAttribute('poster')).to.equal(
        element.getAttribute('poster')
      );
      expect(video.getAttribute('loop')).to.equal(element.getAttribute('loop'));
    });

    it('clones <source> elements', async () => {
      element = html`
        <amp-video layout="responsive" width="16" height="9">
          <source src="foo" type="bar/baz" />
          <source src="something.mp4" type="application/mp4" />
        </amp-video>
      `;

      env.win.document.body.appendChild(element);

      const inputSources = element.querySelectorAll('source');

      await waitForRender();

      const outputSources = element.shadowRoot.querySelectorAll('source');

      for (let i = 0; i < inputSources.length; i++) {
        expect(outputSources[i]).to.not.be.null;
        expect(outputSources[i].getAttribute('src')).to.eql(
          inputSources[i].getAttribute('src')
        );
        expect(outputSources[i].getAttribute('type')).to.eql(
          inputSources[i].getAttribute('type')
        );
      }
    });
  }
);
