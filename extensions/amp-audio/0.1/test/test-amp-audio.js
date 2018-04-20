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
import {naturalDimensions_} from '../../../../src/layout';


describes.realWin('amp-audio', {
  amp: {
    extensions: ['amp-audio'],
  },
}, env => {
  let win, doc;
  let ampAudio;

  beforeEach(() => {
    win = env.win;
    doc = win.document;
  });

  function getAmpAudio(attributes, opt_childNodesAttrs) {
    ampAudio = doc.createElement('amp-audio');
    for (const key in attributes) {
      ampAudio.setAttribute(key, attributes[key]);
    }
    if (opt_childNodesAttrs) {
      opt_childNodesAttrs.forEach(childNodeAttrs => {
        let child;
        if (childNodeAttrs.tag === 'text') {
          child = doc.createTextNode(childNodeAttrs.text);
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
    return ampAudio.build().then(() => {
      return ampAudio.layoutCallback();
    }).then(() => ampAudio);
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

  it('should not preload audio', () => {
    return attachAndRun({
      src: 'https://origin.com/audio.mp3',
      preload: 'none',
    }).then(a => {
      const audio = a.querySelector('audio');
      expect(audio.getAttribute('preload')).to.be.equal('none');
    });
  });

  it('should only preload audio metadata', () => {
    return attachAndRun({
      src: 'https://origin.com/audio.mp3',
      preload: 'metadata',
    }).then(a => {
      const audio = a.querySelector('audio');
      expect(audio.getAttribute('preload')).to.be.equal('metadata');
    });
  });

  it('should load audio through sources', () => {
    return attachAndRun({
      width: 503,
      height: 53,
      autoplay: '',
      preload: '',
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
      expect(audio.offsetWidth).to.be.greaterThan(1);
      expect(audio.offsetHeight).to.be.greaterThan(1);
      expect(audio.hasAttribute('controls')).to.be.true;
      expect(audio.hasAttribute('autoplay')).to.be.true;
      expect(audio.hasAttribute('muted')).to.be.true;
      expect(audio.hasAttribute('preload')).to.be.true;
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
    const savedCreateElement = doc.createElement;
    doc.createElement = name => {
      if (name == 'audio') {
        return savedCreateElement.call(doc, 'audio2');
      }
      return savedCreateElement.call(doc, name);
    };
    const element = doc.createElement('div');
    element.toggleFallback = sandbox.spy();
    const audio = new AmpAudio(element);
    const promise = audio.layoutCallback();
    doc.createElement = savedCreateElement;
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
