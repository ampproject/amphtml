import {CSS} from '#build/bento-video-1.0.css';

import {BentoVideoBaseElement} from '#bento/components/bento-video/1.0/base-element';
import {adoptStyles} from '#bento/util/unit-helpers';

import {dispatchCustomEvent} from '#core/dom';
import {htmlFor} from '#core/dom/static-template';

import {defineBentoElement} from '#preact/bento-ce';

import {waitFor} from '#testing/helpers/service';

describes.realWin(
  'bento-video-v1.0',
  {
    amp: false,
  },
  (env) => {
    let html;
    let element;

    const waitForRender = async () => {
      await element.getApi();
      const shadow = element.shadowRoot;
      await waitFor(() => shadow.querySelector('video'), 'video mounted');
      const video = shadow.querySelector('video');
      dispatchCustomEvent(video, 'canplay', null, {bubbles: false});
    };

    beforeEach(() => {
      html = htmlFor(env.win.document);

      defineBentoElement('bento-video', BentoVideoBaseElement, env.win);
      adoptStyles(env.win, CSS);
    });

    it('renders video element', async () => {
      element = html`
        <bento-video>
          <source src="foo" type="bar/baz" />
        </bento-video>
      `;

      env.win.document.body.appendChild(element);

      await waitForRender();

      const video = element.shadowRoot.querySelector('video');
      expect(video).to.not.be.null;
    });

    it('passes attributes through to <video>', async () => {
      element = html`
        <bento-video src="something.mp4" poster="foo.png" loop></bento-video>
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
        <bento-video>
          <source src="foo" type="bar/baz" />
          <source src="something.mp4" type="application/mp4" />
        </bento-video>
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
