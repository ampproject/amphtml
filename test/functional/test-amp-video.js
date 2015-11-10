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

import {createIframePromise} from '../../testing/iframe';
import {installVideo} from '../../builtins/amp-video';

describe('amp-video', () => {

  function getFooVideoSrc(mediatype) {
    return '//someHost/foo.' + mediatype.slice(mediatype.indexOf('/') + 1); // assumes no optional params
  }

  function getVideo(attributes, children) {
    return createIframePromise().then(iframe => {
      installVideo(iframe.win);
      const v = iframe.doc.createElement('amp-video');
      for (const key in attributes) {
        v.setAttribute(key, attributes[key]);
      }
      if (children != null) {
        for (const key in children) {
          v.appendChild(children[key]);
        }
      }
      return iframe.addElement(v);
    });
  }

  it('should load a video', () => {
    return getVideo({
      src: 'video.mp4',
      width: 160,
      height: 90
    }).then(v => {
      const video = v.querySelector('video');
      expect(video).to.be.an.instanceof(Element);
      expect(video.tagName).to.equal('VIDEO');
      expect(video.getAttribute('src')).to.equal('video.mp4');
      expect(video.hasAttribute('controls')).to.be.false;
    });
  });

  it('should load a video', () => {
    return getVideo({
      src: 'video.mp4',
      width: 160,
      height: 90,
      'controls': '',
      'autoplay': '',
      'muted': '',
      'loop': ''
    }).then(v => {
      const video = v.querySelector('video');
      expect(video).to.be.an.instanceof(Element);
      expect(video.tagName).to.equal('VIDEO');
      expect(video.hasAttribute('controls')).to.be.true;
      expect(video.hasAttribute('autoplay')).to.be.true;
      expect(video.hasAttribute('muted')).to.be.true;
      expect(video.hasAttribute('loop')).to.be.true;
    });
  });

  it('should load a video with source children', () => {
    const sources = [];
    const mediatypes = ['video/ogg', 'video/mp4', 'video/webm'];
    for (let i = 0; i < mediatypes.length; i++) {
      const mediatype = mediatypes[i];
      const source = document.createElement('source');
      source.setAttribute('src', getFooVideoSrc(mediatype));
      source.setAttribute('type', mediatype);
      sources.push(source);
    }
    return getVideo({
      src: 'video.mp4',
      width: 160,
      height: 90,
      'controls': '',
      'autoplay': '',
      'muted': '',
      'loop': ''
    }, sources).then(v => {
      const video = v.querySelector('video');
      // check that the source tags were propogated
      expect(video.children.length).to.equal(mediatypes.length);
      for (let i = 0; i < mediatypes.length; i++) {
        const mediatype = mediatypes[i];
        expect(video.children.item(i).tagName).to.equal('SOURCE');
        expect(video.children.item(i).hasAttribute('src')).to.be.true;
        expect(video.children.item(i).getAttribute('src'))
            .to.equal(getFooVideoSrc(mediatype));
        expect(video.children.item(i).getAttribute('type')).to.equal(mediatype);
      }
    });
  });

  it('should not load a video with http source children', () => {
    const sources = [];
    const mediatypes = ['video/ogg', 'video/mp4', 'video/webm'];
    for (let i = 0; i < mediatypes.length; i++) {
      const mediatype = mediatypes[i];
      const source = document.createElement('source');
      source.setAttribute('src', 'http:' + getFooVideoSrc(mediatype));
      source.setAttribute('type', mediatype);
      sources.push(source);
    }
    return expect(getVideo({
      src: 'video.mp4',
      width: 160,
      height: 90,
      'controls': '',
      'autoplay': '',
      'muted': '',
      'loop': ''
    }, sources)).to.be.rejectedWith(/start with/);
  });

});
