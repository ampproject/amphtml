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

import {adopt} from '../../../../src/runtime';
import {naturalDimensions_} from '../../../../src/layout';
import {createIframe} from '../../../../testing/iframe';
require('../amp-audio');

adopt(window);

describe('amp-audio', () => {
  var iframe;
  var ampAudio;

  naturalDimensions_['audio'] = {width: 300, height: 30};

  beforeEach(() => {
    iframe = createIframe();
    ampAudio = iframe.doc.createElement('amp-audio');
  });

  function setAudioAttrs(attributes, opt_childNodesAttrs) {
    for (var key in attributes) {
      ampAudio.setAttribute(key, attributes[key]);
    }
    if (opt_childNodesAttrs) {
      opt_childNodesAttrs.forEach(childNodeAttrs => {
        let child;
        if (childNodeAttrs.tag === 'text') {
          child = iframe.doc.createTextNode(childNodeAttrs.text);
        } else {
          child = iframe.doc.createElement(childNodeAttrs.tag);
          for (let key in childNodeAttrs) {
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

  function attachAndRun(element) {
    iframe.doc.body.appendChild(element);
    ampAudio.implementation_.firstAttachedCallback();
    ampAudio.implementation_.layoutCallback();
    return element;
  }

  it('should load audio through attribute', () => {
    var a = attachAndRun(setAudioAttrs({
      layout: 'natural',
      src: 'https://origin.com/audio.mp3'
    }));
    var audio = a.querySelector('audio');
    expect(audio).to.be.an.instanceof(Element);
    expect(audio.tagName).to.equal('AUDIO');
    expect(audio.getAttribute('src')).to.equal('https://origin.com/audio.mp3');
    expect(audio.hasAttribute('controls')).to.be.true;
    expect(a.hasAttribute('width')).to.be.true;
    expect(a.hasAttribute('height')).to.be.true;
    expect(audio.offsetWidth).to.be.greaterThan('1');
    expect(audio.offsetHeight).to.be.greaterThan('1');
  });

  it('should load audio through sources', () => {
    var a = attachAndRun(setAudioAttrs({
      width: 503,
      height: 53,
      autoplay: '',
      muted: '',
      loop: ''
    }, [
        {tag: 'source', src: 'https://origin.com/audio.mp3', type: 'audio/mpeg'},
        {tag: 'source', src: 'https://origin.com/audio.ogg', type: 'audio/ogg'},
        {tag: 'text', text: 'Unsupported.'},
    ]));
    var audio = a.querySelector('audio');
    expect(audio).to.be.an.instanceof(Element);
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

  it('should set its dimensions to the browser natural', () => {
    var a = attachAndRun(setAudioAttrs({
      'layout': 'natural'
    }));
    var audio = a.querySelector('audio');
    expect(a.style.width).to.be.equal('300px');
    expect(a.style.height).to.be.equal('30px');
    expect(audio.offsetWidth).to.be.equal(300);
    expect(audio.offsetHeight).to.be.equal(30);
  });

  it('should set have a flex width if layout fill or container', () => {
    var a = setAudioAttrs({
      'layout': 'container',
      'height': 'natural'
    });
    a.style.display = 'inline-block'; // -amp-element default.
    var container = iframe.doc.createElement('div');
    container.style.width = '600px';
    container.appendChild(a);
    attachAndRun(container);
    expect(a.style.width).to.be.equal('100%');
    expect(a.style.height).to.be.equal('30px');
    expect(a.offsetHeight).to.be.equal(30);
    expect(a.offsetWidth).to.be.equal(600);
  });

});
