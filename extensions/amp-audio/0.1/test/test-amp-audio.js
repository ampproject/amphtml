/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
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
import {adopt} from '../../../../src/runtime';
import {naturalDimensions_} from '../../../../src/layout';
import {createIframePromise} from '../../../../testing/iframe';
import * as sinon from 'sinon';
import '../amp-audio';

adopt(window);

describe('amp-audio', () => {
  let iframe;
  let ampAudio;
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    return createIframePromise(/* runtimeOff */ true).then(i => {
      iframe = i;
    });
  });

  afterEach(() => {
    sandbox.restore();
    document.body.removeChild(iframe.iframe);
  });

  function getAmpAudio(attributes, opt_childNodesAttrs) {
    ampAudio = iframe.doc.createElement('amp-audio');
    for (const key in attributes) {
      ampAudio.setAttribute(key, attributes[key]);
    }
    if (opt_childNodesAttrs) {
      opt_childNodesAttrs.forEach(childNodeAttrs => {
        let child;
        if (childNodeAttrs.tag === 'text') {
          child = iframe.doc.createTextNode(childNodeAttrs.text);
        } else {
          child = iframe.doc.createElement(childNodeAttrs.tag);
          for (const key in childNodeAttrs) {
            if (key !== 'tag') {
              child.setAttribute(key, childNodeAttrs[key]);
            }
          }
        }
        ampAudio.appendChild(child);
      });
    }
    return ampAudio;
  }

  function attachAndRun(attributes, opt_childNodesAttrs) {
    const ampAudio = getAmpAudio(attributes, opt_childNodesAttrs);
    naturalDimensions_['AMP-AUDIO'] = {width: '300px', height: '30px'};
    return iframe.addElement(ampAudio);
  }

  it('should load audio through attribute', () => {
    return attachAndRun({
      src: 'https://origin.com/audio.mp3',
    }).then(a => {
      const audio = a.querySelector('audio');
      expect(audio.tagName).to.equal('AUDIO');
      expect(audio.getAttribute('src'))
          .to.equal('https://origin.com/audio.mp3');
      expect(audio.hasAttribute('controls')).to.be.true;
      expect(a.style.width).to.be.equal('300px');
      expect(a.style.height).to.be.equal('30px');
    });
  });

  it('should load audio through sources', () => {
    return attachAndRun({
      width: 503,
      height: 53,
      autoplay: '',
      muted: '',
      loop: '',
    }, [
      {tag: 'source', src: 'https://origin.com/audio.mp3',
        type: 'audio/mpeg'},
        {tag: 'source', src: 'https://origin.com/audio.ogg', type: 'audio/ogg'},
        {tag: 'text', text: 'Unsupported.'},
    ]).then(a => {
      const audio = a.querySelector('audio');
      expect(audio.tagName).to.equal('AUDIO');
      expect(a.getAttribute('width')).to.be.equal('503');
      expect(a.getAttribute('height')).to.be.equal('53');
      expect(audio.offsetWidth).to.be.greaterThan('1');
      expect(audio.offsetHeight).to.be.greaterThan('1');
      expect(audio.hasAttribute('controls')).to.be.true;
      expect(audio.hasAttribute('autoplay')).to.be.true;
      expect(audio.hasAttribute('muted')).to.be.true;
      expect(audio.hasAttribute('loop')).to.be.true;
      expect(audio.hasAttribute('src')).to.be.false;
      expect(audio.childNodes[0].tagName).to.equal('SOURCE');
      expect(audio.childNodes[0].getAttribute('src'))
          .to.equal('https://origin.com/audio.mp3');
      expect(audio.childNodes[1].tagName).to.equal('SOURCE');
      expect(audio.childNodes[1].getAttribute('src'))
          .to.equal('https://origin.com/audio.ogg');
      expect(audio.childNodes[2].nodeType).to.equal(Node.TEXT_NODE);
      expect(audio.childNodes[2].textContent).to.equal('Unsupported.');
    });
  });

  it('should set its dimensions to the browser natural', () => {
    return attachAndRun({
      src: 'https://origin.com/audio.mp3',
    }).then(a => {
      const audio = a.querySelector('audio');
      expect(a.style.width).to.be.equal('300px');
      expect(a.style.height).to.be.equal('30px');
      if (/Safari|Firefox/.test(navigator.userAgent)) {
        // Safari has default sizes for audio tags that cannot
        // be overridden.
        return;
      }
      expect(audio.offsetWidth).to.be.equal(300);
      expect(audio.offsetHeight).to.be.equal(30);
    });
  });

  it('should set its natural dimension only if not specified', () => {
    return attachAndRun({
      'width': '500',
      src: 'https://origin.com/audio.mp3',
    }).then(a => {
      expect(a.style.width).to.be.equal('500px');
      expect(a.style.height).to.be.equal('30px');
    });
  });

  it('should fallback when not available', () => {
    const savedCreateElement = document.createElement;
    document.createElement = name => {
      if (name == 'audio') {
        return savedCreateElement.call(document, 'audio2');
      }
      return savedCreateElement.call(document, name);
    };
    const element = document.createElement('div');
    element.toggleFallback = sandbox.spy();
    const audio = new AmpAudio(element);
    const promise = audio.layoutCallback();
    document.createElement = savedCreateElement;
    return promise.then(() => {
      expect(element.toggleFallback).to.be.calledOnce;
    });
  });

  it('should propagate ARIA attributes', () => {
    return attachAndRun({
      src: 'https://origin.com/audio.mp3',
      'aria-label': 'Hello',
      'aria-labelledby': 'id2',
      'aria-describedby': 'id3',
    }).then(a => {
      const audio = a.querySelector('audio');
      expect(audio.getAttribute('aria-label')).to.equal('Hello');
      expect(audio.getAttribute('aria-labelledby')).to.equal('id2');
      expect(audio.getAttribute('aria-describedby')).to.equal('id3');
    });
  });
});
