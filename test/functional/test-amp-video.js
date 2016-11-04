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
import {installVideoManagerForDoc} from '../../src/service/video-manager-impl';
import * as sinon from 'sinon';

describe('amp-video', () => {

  let sandbox;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
  });

  afterEach(() => {
    sandbox.restore();
  });

  function getFooVideoSrc(mediatype) {
    return '//someHost/foo.' + mediatype.slice(mediatype.indexOf('/') + 1); // assumes no optional params
  }

  function getVideo(attributes, children, opt_beforeLayoutCallback) {
    return createIframePromise(
        true, opt_beforeLayoutCallback).then(iframe => {
          installVideoManagerForDoc(iframe.win.document);
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
      height: 90,
    }).then(v => {
      const video = v.querySelector('video');
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
      'muted': '',
      'loop': '',
    }).then(v => {
      const video = v.querySelector('video');
      expect(video.tagName).to.equal('VIDEO');
      expect(video.hasAttribute('controls')).to.be.true;
      expect(video.hasAttribute('loop')).to.be.true;
      // autoplay is never propagated to the video element
      expect(video.hasAttribute('autoplay')).to.be.false;
      // muted is a deprecated attribute
      expect(video.hasAttribute('muted')).to.be.false;
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
      'loop': '',
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
      'loop': '',
    }, sources)).to.be.rejectedWith(/start with/);
  });

  it('should set poster and controls in prerender mode', () => {
    return getVideo({
      src: 'video.mp4',
      width: 160,
      height: 90,
      'poster': 'img.png',
      'controls': '',
    }, null, function(element) {
      // Should set appropriate attributes in buildCallback
      const video = element.querySelector('video');
      expect(video.getAttribute('poster')).to.equal('img.png');
      expect(video.getAttribute('controls')).to.exist;
      expect(video.getAttribute('playsinline')).to.exist;
      expect(video.getAttribute('webkit-playsinline')).to.exist;
    }).then(v => {
      // Same attributes should still be present in layoutCallback.
      const video = v.querySelector('video');
      expect(video.tagName).to.equal('VIDEO');
      expect(video.getAttribute('poster')).to.equal('img.png');
      expect(video.getAttribute('controls')).to.exist;
    });
  });

  it('should not set src or preload in prerender mode', () => {
    return getVideo({
      src: 'video.mp4',
      width: 160,
      height: 90,
      'preload': 'auto',
      'poster': 'img.png',
    }, null, function(element) {
      const video = element.querySelector('video');
      expect(video.getAttribute('preload')).to.equal('none');
      expect(video.hasAttribute('src')).to.be.false;
    }).then(v => {
      // Should set appropriate attributes in layoutCallback.
      const video = v.querySelector('video');
      expect(video.tagName).to.equal('VIDEO');
      expect(video.getAttribute('preload')).to.equal('auto');
    });
  });

  it('should remove preload attribute when not provided', () => {
    return getVideo({
      src: 'video.mp4',
      width: 160,
      height: 90,
      'poster': 'img.png',
    }, null, function(element) {
      const video = element.querySelector('video');
      expect(video.getAttribute('preload')).to.equal('none');
      expect(video.getAttribute('poster')).to.equal('img.png');
      expect(video.hasAttribute('src')).to.be.false;
    }).then(v => {
      // Should set appropriate attributes in layoutCallback.
      const video = v.querySelector('video');
      expect(video.tagName).to.equal('VIDEO');
      expect(video.hasAttribute('preload')).to.be.false;
      expect(video.getAttribute('poster')).to.equal('img.png');
    });
  });

  it('should not load a video with source children in prerender mode', () => {
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
      'loop': '',
    }, sources, function(element) {
      const video = element.querySelector('video');
      expect(video.children.length).to.equal(0);
    }).then(v => {
      // Should add attributes and source children in layoutCallback.
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

  it('should set src and preload in non-prerender mode', () => {
    return getVideo({
      src: 'video.mp4',
      width: 160,
      height: 90,
      'preload': 'auto',
      'poster': 'img.png',
    }, null, function(element) {
      const video = element.querySelector('video');
      expect(video.getAttribute('preload')).to.equal('none');
      expect(video.getAttribute('poster')).to.equal('img.png');
      expect(video.hasAttribute('src')).to.be.false;
    }).then(v => {
      const video = v.querySelector('video');
      expect(video.tagName).to.equal('VIDEO');
      expect(video.getAttribute('preload')).to.equal('auto');
      expect(video.getAttribute('poster')).to.equal('img.png');
    });
  });

  it('should pause the video when document inactive', () => {
    return getVideo({
      src: 'video.mp4',
      width: 160,
      height: 90,
    }).then(v => {
      const impl = v.implementation_;
      const video = v.querySelector('video');
      sandbox.spy(video, 'pause');
      impl.pauseCallback();
      expect(video.pause.called).to.be.true;
    });
  });

  it('should fallback if video element is not supported', () => {
    return getVideo({
      src: 'video.mp4',
      width: 160,
      height: 90,
    }, null, function(element) {
      const impl = element.implementation_;
      sandbox.stub(impl, 'isVideoSupported_').returns(false);
      sandbox.spy(impl, 'toggleFallback');
    }).then(v => {
      const impl = v.implementation_;
      expect(impl.toggleFallback.called).to.be.true;
      expect(impl.toggleFallback.calledWith(true)).to.be.true;
    });
  });

  it('should propagate ARIA attributes', () => {
    return getVideo({
      src: 'video.mp4',
      width: 160,
      height: 90,
      'aria-label': 'Hello',
      'aria-labelledby': 'id2',
      'aria-describedby': 'id3',
    }).then(v => {
      const video = v.querySelector('video');
      expect(video.getAttribute('aria-label')).to.equal('Hello');
      expect(video.getAttribute('aria-labelledby')).to.equal('id2');
      expect(video.getAttribute('aria-describedby')).to.equal('id3');
    });
  });
});
