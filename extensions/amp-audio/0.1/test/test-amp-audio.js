import {htmlFor} from '#core/dom/static-template';
import {naturalDimensions_} from '#core/static-layout';

import {AmpAudio} from '../amp-audio';

describes.realWin(
  'amp-audio',
  {
    amp: {
      extensions: ['amp-audio'],
    },
  },
  (env) => {
    let win, doc;
    let html;

    beforeEach(() => {
      win = env.win;
      doc = win.document;
      html = htmlFor(doc);
      naturalDimensions_['AMP-AUDIO'] = {width: '300px', height: '30px'};
    });

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
      const element = await attachAndRun(
        html`<amp-audio src="audio.mp3"></amp-audio>`
      );
      const audio = element.querySelector('audio');
      expect(audio.tagName).to.equal('AUDIO');
      expect(audio.getAttribute('src')).to.equal('audio.mp3');
      expect(audio.hasAttribute('controls')).to.be.true;
      expect(element.style.width).to.be.equal('300px');
      expect(element.style.height).to.be.equal('30px');
    });

    it('should load audio with container layout', async () => {
      const element = await attachAndRun(
        html`<amp-audio src="audio.mp3" loop muted layout="container"><audio controls></amp-audio>`
      );
      const audio = element.querySelector('audio');
      expect(audio.tagName).to.equal('AUDIO');
      expect(audio.getAttribute('src')).to.equal('audio.mp3');
      expect(audio.hasAttribute('controls')).to.be.true;
      expect(audio).to.have.attribute('controls');
      expect(audio).to.have.attribute('muted');
      expect(audio).to.have.attribute('loop');
      expect(element.style.width).to.be.equal('');
      expect(element.style.height).to.be.equal('');
    });

    it('should not preload audio', async () => {
      const element = await attachAndRun(
        html`<amp-audio src="audio.mp3" preload="none"></amp-audio>`
      );
      const audio = element.querySelector('audio');
      expect(audio.getAttribute('preload')).to.be.equal('none');
    });

    it('should only preload audio metadata', async () => {
      const element = await attachAndRun(
        html`<amp-audio src="audio.mp3" preload="metadata"></amp-audio>`
      );
      const audio = element.querySelector('audio');
      expect(audio.getAttribute('preload')).to.be.equal('metadata');
    });

    it('should attach `<audio>` element and execute relevant actions for layout="nodisplay"', async () => {
      const element = await attachAndRun(html`
        <amp-audio
          src="audio.mp3"
          preload="none"
          layout="nodisplay"
        ></amp-audio>
      `);
      const impl = await element.getImpl();

      const audio = element.querySelector('audio');
      expect(audio).to.not.be.null;

      impl.executeAction({method: 'play', satisfiesTrust: () => true});
      expect(impl.isPlaying).to.be.true;

      impl.executeAction({method: 'pause', satisfiesTrust: () => true});
      expect(impl.isPlaying).to.be.false;
    });

    it('should load audio through sources', async () => {
      const element = await attachAndRun(
        html`
        <amp-audio width="503" height="53" autoplay preload muted loop>
          <source src="audio.mp3" type="audio/mpeg"></source>
          <source src="audio.ogg" type="audio/ogg"></source>
          Unsupported.
        </amp-audio>
        `
      );
      const audio = element.querySelector('audio');
      expect(element.getAttribute('width')).to.be.equal('503');
      expect(element.getAttribute('height')).to.be.equal('53');
      expect(audio.offsetWidth).to.be.greaterThan(1);
      expect(audio.offsetHeight).to.be.greaterThan(1);
      expect(audio).to.have.attribute('controls');
      expect(audio).to.have.attribute('autoplay');
      expect(audio).to.have.attribute('muted');
      expect(audio).to.have.attribute('preload');
      expect(audio).to.have.attribute('loop');
      expect(audio).to.not.have.attribute('src');
      expect(audio.children[0].tagName).to.equal('SOURCE');
      expect(audio.children[0].getAttribute('src')).to.equal('audio.mp3');
      expect(audio.children[1].tagName).to.equal('SOURCE');
      expect(audio.children[1].getAttribute('src')).to.equal('audio.ogg');
      const lastNode = audio.childNodes[audio.childNodes.length - 1];
      expect(lastNode.nodeType).to.equal(Node.TEXT_NODE);
      expect(lastNode.textContent).to.match(/Unsupported/);
    });

    it('should set its dimensions to the browser natural', async () => {
      const element = await attachAndRun(
        html`<amp-audio src="audio.mp3" preload="metadata"></amp-audio>`
      );
      const audio = element.querySelector('audio');
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
      const element = await attachAndRun(html`
        <amp-audio width="500" src="audio.mp3"></amp-audio>
      `);
      expect(element.style.width).to.be.equal('500px');
      expect(element.style.height).to.be.equal('30px');
    });

    it('should fallback when not available', () => {
      // For this single test, cause audio elements that are
      // created to lack the necessary feature set, which should trigger
      // fallback behavior.
      const {createElement} = doc;
      doc.createElement = (name) => {
        if (name === 'audio') {
          name = 'busted-audio';
        }
        return createElement.call(doc, name);
      };

      const element = doc.createElement('div');
      element.toggleFallback = env.sandbox.spy();
      const audio = new AmpAudio(element);
      audio.buildAudioElement();
      expect(element.toggleFallback).to.be.calledOnce;
    });

    it('should propagate ARIA attributes', async () => {
      const element = await attachAndRun(html`
        <amp-audio
          src="audio.mp3"
          aria-label="Hello"
          aria-labelledby="id2"
          aria-describedby="id3"
        ></amp-audio>
      `);
      const audio = element.querySelector('audio');
      expect(audio.getAttribute('aria-label')).to.equal('Hello');
      expect(audio.getAttribute('aria-labelledby')).to.equal('id2');
      expect(audio.getAttribute('aria-describedby')).to.equal('id3');
    });

    it('should play/pause when `play`/`pause` actions are called', async () => {
      const element = await attachAndRun(
        html`<amp-audio src="audio.mp3"></amp-audio>`
      );
      const impl = await element.getImpl();

      impl.executeAction({method: 'play', satisfiesTrust: () => true});
      expect(impl.isPlaying).to.be.true;

      impl.executeAction({method: 'pause', satisfiesTrust: () => true});
      expect(impl.isPlaying).to.be.false;
    });
  }
);
