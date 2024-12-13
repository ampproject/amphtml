import '../amp-audio';

import {htmlFor} from '#core/dom/static-template';
import {naturalDimensions_} from '#core/static-layout';

import {toggleExperiment} from '#experiments';

import {waitFor} from '#testing/helpers/service';

describes.realWin(
  'amp-audio-v1.0',
  {
    amp: {
      extensions: ['amp-audio:1.0'],
    },
  },
  (env) => {
    let win;
    let doc;
    let html;
    let element;

    beforeEach(async () => {
      win = env.win;
      doc = win.document;
      html = htmlFor(doc);
      naturalDimensions_['AMP-AUDIO'] = {width: '300px', height: '30px'};
      toggleExperiment(win, 'bento-audio', true, true);
    });

    /**
     * Clean up the child elements that are appended
     * in the body in attachAndRun method.
     */
    afterEach(async () => {
      while (doc.body.firstChild) {
        doc.body.removeChild(doc.body.firstChild);
      }
    });

    /**
     * Wait for iframe to be mounted
     */
    const waitForRender = async () => {
      await element.buildInternal();
      const loadPromise = element.layoutCallback();
      const {shadowRoot} = element;
      await waitFor(
        () => shadowRoot.querySelector('audio'),
        'audio tag mounted'
      );
      await loadPromise;
    };

    /**
     * Creates `<amp-audio>`
     * @param {Element} element Element to attach to doc and run
     * @returns Returns `<amp-audio>` with given parameters
     */
    async function attachAndRun(element) {
      expect(element.tagName).to.equal('AMP-AUDIO');
      doc.body.appendChild(element);
      await element.buildInternal();
      try {
        await element.layoutCallback();
      } catch (error) {
        // Ignore failed to load errors since sources are fake.
        if (error.toString().indexOf('Failed to load') < 0) {
          throw error;
        }
      }
      return element;
    }

    it('should load audio through attribute', async () => {
      element = await attachAndRun(
        html`<amp-audio src="audio.mp3"></amp-audio>`
      );

      // Wait till rendering is finished
      await waitForRender();

      // Retrieve
      const {shadowRoot} = element;
      const audio = shadowRoot.querySelector('audio');

      expect(audio.tagName).to.equal('AUDIO');
      expect(audio.getAttribute('src')).to.equal('audio.mp3');
      expect(audio).to.have.attribute('controls');
      expect(element.style.width).to.be.equal('300px');
      expect(element.style.height).to.be.equal('30px');
    });

    it('should not preload audio', async () => {
      element = await attachAndRun(
        html`<amp-audio src="audio.mp3" preload="none"></amp-audio>`
      );

      // Wait till rendering is finished
      await waitForRender();

      // Fetch audio element from shadowRoot
      const {shadowRoot} = element;
      const audio = shadowRoot.querySelector('audio');

      expect(audio.getAttribute('preload')).to.be.equal('none');
    });

    it('should only preload audio metadata', async () => {
      element = await attachAndRun(
        html`<amp-audio src="audio.mp3" preload="metadata"></amp-audio>`
      );

      // Wait till rendering is finished
      await waitForRender();

      // Fetch audio element from shadowRoot
      const {shadowRoot} = element;
      const audio = shadowRoot.querySelector('audio');

      expect(audio.getAttribute('preload')).to.be.equal('metadata');
    });

    it('should attach `<audio>` element and execute relevant actions for layout="nodisplay"', async () => {
      element = await attachAndRun(
        html`<amp-audio
          src="audio.mp3"
          preload="none"
          layoud="nodisplay"
        ></amp-audio>`
      );

      // Wait till rendering is finished
      await waitForRender();

      // Fetch audio element from shadowRoot
      const {shadowRoot} = element;
      const audio = shadowRoot.querySelector('audio');

      expect(audio).to.not.be.null;

      const impl = await element.getImpl();
      impl.executeAction({method: 'play', satisfiesTrust: () => true});
      expect(
        impl.executeAction({method: 'isPlaying', satisfiesTrust: () => true})
      ).to.be.true;

      impl.executeAction({method: 'pause', satisfiesTrust: () => true});
      expect(
        impl.executeAction({method: 'isPlaying', satisfiesTrust: () => true})
      ).to.be.false;
    });

    it('should load audio through sources', async () => {
      element = await attachAndRun(
        html`<amp-audio width="503" height="53" autoplay preload muted loop>
          <source src="audio.mp3" type="audio/mpeg" />
          <source src="audio.ogg" type="audio/ogg" />
          <text>Test</text>
        </amp-audio>`
      );

      // Wait till rendering is finished
      await waitForRender();

      // Fetch audio element from shadowRoot
      const {shadowRoot} = element;
      const audio = shadowRoot.querySelector('audio');

      expect(audio.tagName).to.equal('AUDIO');
      expect(element.getAttribute('width')).to.be.equal('503');
      expect(element.getAttribute('height')).to.be.equal('53');
      expect(element.offsetWidth).to.be.greaterThan(1);
      expect(element.offsetHeight).to.be.greaterThan(1);
      expect(audio).to.have.attribute('controls');
      // TODO(dmanek): Use InOb hook for autoplay.
      // expect(audio).to.have.attribute('autoplay');
      expect(audio.muted).to.be.true;
      expect(audio).to.have.attribute('preload');
      expect(audio).to.have.attribute('loop');
      expect(audio).to.not.have.attribute('src');
      expect(audio.childNodes[0].tagName).to.equal('SOURCE');
      expect(audio.childNodes[0].getAttribute('src')).to.equal('audio.mp3');
      expect(audio.childNodes[1].tagName).to.equal('SOURCE');
      expect(audio.childNodes[1].getAttribute('src')).to.equal('audio.ogg');
      expect(audio.childNodes).to.have.lengthOf(2);
    });

    it('should set its dimensions to the browser natural', async () => {
      element = await attachAndRun(
        html`<amp-audio src="audio.mp3"></amp-audio>`
      );

      // Wait till rendering is finished
      await waitForRender();

      // Fetch audio element from shadowRoot
      const {shadowRoot} = element;
      const audio = shadowRoot.querySelector('audio');

      expect(element.style.width).to.be.equal('300px');
      expect(element.style.height).to.be.equal('30px');
      if (/Safari|Firefox/.test(navigator.userAgent)) {
        // Safari has default sizes for audio tags that cannot
        // be overridden.
        return;
      }
      expect(audio.offsetWidth).to.be.equal(300);
      expect(audio.offsetHeight).to.be.equal(30);
    });

    it('should set its natural dimension only if not specified', async () => {
      element = await attachAndRun(
        html`<amp-audio src="audio.mp3" width="500"></amp-audio>`
      );

      // Wait till rendering is finished
      await waitForRender();

      expect(element.style.width).to.be.equal('500px');
      expect(element.style.height).to.be.equal('30px');
    });

    it('should fallback when not available', async () => {
      element = await attachAndRun(
        html`<amp-audio src="audio.mp3" width="500"></amp-audio>`
      );

      element.toggleFallback = env.sandbox.spy();
      await waitForRender();

      // Fetch audio element from shadowRoot
      const {shadowRoot} = element;
      const audio = shadowRoot.querySelector('audio');
      audio.dispatchEvent(new Event('error'));
      expect(element.toggleFallback).to.be.calledOnce;
    });

    it('should propagate ARIA attributes', async () => {
      element = await attachAndRun(
        html`<amp-audio
          src="audio.mp3"
          aria-label="Hello"
          aria-labelledby="id2"
          aria-describedby="id3"
        ></amp-audio>`
      );

      // Wait till rendering is finished
      await waitForRender();

      // Fetch audio element from shadowRoot
      const {shadowRoot} = element;
      const audio = shadowRoot.querySelector('audio');

      expect(audio.getAttribute('aria-label')).to.equal('Hello');
      expect(audio.getAttribute('aria-labelledby')).to.equal('id2');
      expect(audio.getAttribute('aria-describedby')).to.equal('id3');
    });

    it('should play/pause when `play`/`pause` actions are called', async () => {
      element = await attachAndRun(
        html`<amp-audio src="audio.mp3" width="500"></amp-audio>`
      );

      // Wait till rendering is finished
      await waitForRender();

      // Fetch audio element from shadowRoot
      const {shadowRoot} = element;
      const audio = shadowRoot.querySelector('audio');

      expect(audio).to.not.be.null;

      const impl = await element.getImpl();

      impl.executeAction({method: 'play', satisfiesTrust: () => true});
      expect(
        impl.executeAction({method: 'isPlaying', satisfiesTrust: () => true})
      ).to.be.true;

      impl.executeAction({method: 'pause', satisfiesTrust: () => true});
      expect(
        impl.executeAction({method: 'isPlaying', satisfiesTrust: () => true})
      ).to.be.false;
    });
  }
);
