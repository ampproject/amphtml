import '../amp-audio';
import {createElementWithAttributes} from '#core/dom';

import {toggleExperiment} from '#experiments';

import {waitFor} from '#testing/test-helper';

import {naturalDimensions_} from '../../../../src/static-layout';

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
    let element;
    let ampAudio;

    beforeEach(async () => {
      win = env.win;
      doc = win.document;
      toggleExperiment(win, 'bento-audio', true, true);
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
     * Create `<amp-audio>` with provided attributes
     * @param {*} attributes Attributes to be add
     * @param {*} opt_childNodesAttrs Child nodes to be add
     * @returns Return `<amp-audio>` with given parameters
     */
    function getAmpAudio(attributes, opt_childNodesAttrs) {
      ampAudio = createElementWithAttributes(doc, 'amp-audio', attributes);
      if (opt_childNodesAttrs) {
        opt_childNodesAttrs.forEach((childNodeAttrs) => {
          let child;
          if (childNodeAttrs.tag === 'text') {
            child = doc.createElement('p');
          } else {
            child = createElementWithAttributes(
              doc,
              childNodeAttrs.tag,
              childNodeAttrs
            );
          }
          ampAudio.appendChild(child);
        });
      }
      doc.body.appendChild(ampAudio);
      return ampAudio;
    }

    /**
     * Creates `<amp-audio>`
     * @param {`*`} attributes Attributes to be add
     * @param {*} opt_childNodesAttrs Child nodes to be add
     * @returns Returns `<amp-audio>` with given parameters
     */
    function attachAndRun(attributes, opt_childNodesAttrs) {
      naturalDimensions_['AMP-AUDIO'] = {width: '300px', height: '30px'};
      const ampAudio = getAmpAudio(attributes, opt_childNodesAttrs);
      return ampAudio;
    }

    it('should load audio through attribute', async () => {
      element = attachAndRun({
        src: 'audio.mp3',
      });

      // Wait till rendering is finished
      await waitForRender();

      // Retrieve
      const {shadowRoot} = element;
      const audio = shadowRoot.querySelector('audio');

      expect(audio.tagName).to.equal('AUDIO');
      expect(audio.getAttribute('src')).to.equal('audio.mp3');
      expect(audio.hasAttribute('controls')).to.be.true;
      expect(element.style.width).to.be.equal('300px');
      expect(element.style.height).to.be.equal('30px');
    });

    it('should not preload audio', async () => {
      element = attachAndRun({
        src: 'audio.mp3',
        preload: 'none',
      });

      // Wait till rendering is finished
      await waitForRender();

      // Fetch audio element from shadowRoot
      const {shadowRoot} = element;
      const audio = shadowRoot.querySelector('audio');

      expect(audio.getAttribute('preload')).to.be.equal('none');
    });

    it('should only preload audio metadata', async () => {
      element = attachAndRun({
        src: 'audio.mp3',
        preload: 'metadata',
      });

      // Wait till rendering is finished
      await waitForRender();

      // Fetch audio element from shadowRoot
      const {shadowRoot} = element;
      const audio = shadowRoot.querySelector('audio');

      expect(audio.getAttribute('preload')).to.be.equal('metadata');
    });

    it('should attach `<audio>` element and execute relevant actions for layout="nodisplay"', async () => {
      element = await attachAndRun({
        src: 'audio.mp3',
        preload: 'none',
        layout: 'nodisplay',
      });

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
      element = attachAndRun(
        {
          width: 503,
          height: 53,
          autoplay: '',
          preload: '',
          muted: '',
          loop: '',
        },
        [
          {tag: 'source', src: 'audio.mp3', type: 'audio/mpeg'},
          {tag: 'source', src: 'audio.ogg', type: 'audio/ogg'},
          {tag: 'text', text: 'Unsupported.'},
        ]
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
      expect(audio.hasAttribute('controls')).to.be.true;
      expect(audio.hasAttribute('autoplay')).to.be.true;
      expect(audio.muted).to.be.true;
      expect(audio.hasAttribute('preload')).to.be.true;
      expect(audio.hasAttribute('loop')).to.be.true;
      expect(audio.hasAttribute('src')).to.be.false;
      expect(audio.childNodes[0].tagName).to.equal('SOURCE');
      expect(audio.childNodes[0].getAttribute('src')).to.equal('audio.mp3');
      expect(audio.childNodes[1].tagName).to.equal('SOURCE');
      expect(audio.childNodes[1].getAttribute('src')).to.equal('audio.ogg');
      expect(audio.childNodes).to.have.lengthOf(2);
    });

    it('should set its dimensions to the browser natural', async () => {
      element = attachAndRun({
        src: 'audio.mp3',
      });

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
      element = attachAndRun({
        'width': '500',
        src: 'audio.mp3',
      });

      // Wait till rendering is finished
      await waitForRender();

      expect(element.style.width).to.be.equal('500px');
      expect(element.style.height).to.be.equal('30px');
    });

    it('should fallback when not available', async () => {
      element = attachAndRun({
        'width': '500',
        src: 'audio.mp3',
      });
      element.toggleFallback = env.sandbox.spy();
      await waitForRender();

      // Fetch audio element from shadowRoot
      const {shadowRoot} = element;
      const audio = shadowRoot.querySelector('audio');
      audio.dispatchEvent(new Event('error'));
      expect(element.toggleFallback).to.be.calledOnce;
    });

    it('should propagate ARIA attributes', async () => {
      element = attachAndRun({
        src: 'audio.mp3',
        'aria-label': 'Hello',
        'aria-labelledby': 'id2',
        'aria-describedby': 'id3',
      });
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
      element = ampAudio = await attachAndRun({
        'width': '500',
        src: 'audio.mp3',
      });

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
