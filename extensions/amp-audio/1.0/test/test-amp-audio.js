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

import {AmpAudio} from '../amp-audio';
// import {htmlFor} from '#core/dom/static-template';
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
    // let html;
    let element;
    let ampAudio;

    beforeEach(async () => {
      win = env.win;
      doc = win.document;
      // html = htmlFor(doc);
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

    function getAmpAudio(attributes, opt_childNodesAttrs) {
      ampAudio = doc.createElement('amp-audio');
      for (const key in attributes) {
        ampAudio.setAttribute(key, attributes[key]);
      }
      if (opt_childNodesAttrs) {
        opt_childNodesAttrs.forEach((childNodeAttrs) => {
          let child;
          if (childNodeAttrs.tag === 'text') {
            child = doc.createElement('p');
          } else {
            child = doc.createElement(childNodeAttrs.tag);
            for (const key in childNodeAttrs) {
              if (key !== 'tag') {
                child.setAttribute(key, childNodeAttrs[key]);
              }
            }
          }
          ampAudio.appendChild(child);
        });
      }
      doc.body.appendChild(ampAudio);
      return ampAudio;
    }

    function attachAndRun(attributes, opt_childNodesAttrs) {
      naturalDimensions_['AMP-AUDIO'] = {width: '300px', height: '30px'};
      const ampAudio = getAmpAudio(attributes, opt_childNodesAttrs);
      return ampAudio;
      //   .buildInternal()
      //   .then(() => ampAudio.layoutCallback())
      //   .then(() => ampAudio)
      //   .catch((error) => {
      //     // Ignore failed to load errors since sources are fake.
      //     if (error.toString().indexOf('Failed to load') > -1) {
      //       return ampAudio;
      //     } else {
      //       throw error;
      //     }
      //   });
    }

    function attachToAmpStoryAndRun(attributes) {
      naturalDimensions_['AMP-AUDIO'] = {width: '300px', height: '30px'};
      const ampAudio = doc.createElement('amp-audio');
      const ampStory = doc.createElement('amp-story');
      for (const key in attributes) {
        ampAudio.setAttribute(key, attributes[key]);
      }
      ampStory.appendChild(ampAudio);
      doc.body.appendChild(ampStory);

      return ampAudio;
      // .buildInternal()
      // .then(() => ampAudio.layoutCallback())
      // .then(() => ampAudio)
      // .catch((error) => {
      //   // Ignore failed to load errors since sources are fake.
      //   if (error.toString().indexOf('Failed to load') > -1) {
      //     return ampAudio;
      //   } else {
      //     throw error;
      //   }
      // });
    }

    it('should load audio through attribute', async () => {
      element = attachAndRun({
        src: 'audio.mp3',
      });

      // Wait till rendering is finished
      await waitForRender();

      // Retrive
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

    it(
      'should attach `<audio>` element and execute relevant actions for ' +
        'layout="nodisplay"',
      async () => {
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
      }
    );

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
      expect(audio.offsetWidth).to.be.greaterThan(1);
      expect(audio.offsetHeight).to.be.greaterThan(1);
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

      /**
       * This will not be defined once we have sources prop defined in base-element.js
       * Instead assert expect(audio.childNodes).to.have.lengthOf(2) since the third
       * child is disregarded due to being not a <source> tag.
       *
       *   expect(audio.childNodes[2].nodeType).to.equal(Node.TEXT_NODE);
       *   expect(audio.childNodes[2].textContent).to.equal('Unsupported.');
       */
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

    it(
      'should not play/pause when `amp-audio` is a direct descendant ' +
        'of `amp-story`',
      async () => {
        element = await attachToAmpStoryAndRun({
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
        ).to.be.false;

        impl.executeAction({method: 'pause', satisfiesTrust: () => true});
        expect(
          impl.executeAction({method: 'isPlaying', satisfiesTrust: () => true})
        ).to.be.false;
      }
    );
  }
);
