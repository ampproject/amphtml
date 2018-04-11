/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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

import '../amp-video';
import {Services} from '../../../../src/services';
import {VideoEvents} from '../../../../src/video-interface';
import {VisibilityState} from '../../../../src/visibility-state';
import {listenOncePromise} from '../../../../src/event-helper';
import {mockServiceForDoc} from '../../../../testing/test-helper';


describes.realWin('amp-video', {
  amp: {
    extensions: ['amp-video'],
  },
}, env => {
  let win, doc;
  let timer;

  beforeEach(() => {
    win = env.win;
    doc = win.document;
    timer = Services.timerFor(win);
  });

  function getFooVideoSrc(filetype) {
    return '//someHost/foo.' + filetype.slice(filetype.indexOf('/') + 1); // assumes no optional params
  }

  function getVideo(attributes, children, opt_beforeLayoutCallback) {
    const v = doc.createElement('amp-video');
    for (const key in attributes) {
      v.setAttribute(key, attributes[key]);
    }
    if (children != null) {
      for (const key in children) {
        v.appendChild(children[key]);
      }
    }
    doc.body.appendChild(v);
    return v.build().then(() => {
      if (opt_beforeLayoutCallback) {
        opt_beforeLayoutCallback(v);
      }
      return v.layoutCallback().then(() => v);
    }).catch(e => {
      // Ignore failed to load errors since sources are fake.
      if (e.toString().indexOf('Failed to load') > -1) {
        return v;
      } else {
        throw e;
      }
    });
  }

  it('should load a video', () => {
    return getVideo({
      src: 'video.mp4',
      width: 160,
      height: 90,
    }).then(v => {
      const preloadSpy = sandbox.spy(v.implementation_.preconnect, 'url');
      v.implementation_.preconnectCallback();
      preloadSpy.should.have.been.calledWithExactly('video.mp4',
          undefined);
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
      'crossorigin': '',
      'disableremoteplayback': '',
    }).then(v => {
      const preloadSpy = sandbox.spy(v.implementation_.preconnect, 'url');
      v.implementation_.preconnectCallback();
      preloadSpy.should.have.been.calledWithExactly('video.mp4',
          undefined);
      const video = v.querySelector('video');
      expect(video.tagName).to.equal('VIDEO');
      expect(video.hasAttribute('controls')).to.be.true;
      expect(video.hasAttribute('loop')).to.be.true;
      expect(video.hasAttribute('crossorigin')).to.be.true;
      expect(video.hasAttribute('disableremoteplayback')).to.be.true;
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
      const source = doc.createElement('source');
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
      const preloadSpy = sandbox.spy(v.implementation_.preconnect, 'url');
      v.implementation_.preconnectCallback();
      preloadSpy.should.have.been.calledWithExactly('video.mp4',
          undefined);
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

  it('should load a video with track children', () => {
    const tracks = [];
    const tracktypes = ['captions', 'subtitles', 'descriptions', 'chapters'];
    for (let i = 0; i < tracktypes.length; i++) {
      const tracktype = tracktypes[i];
      const track = doc.createElement('track');
      track.setAttribute('src', getFooVideoSrc(tracktype));
      track.setAttribute('type', tracktype);
      track.setAttribute('srclang', 'en');
      tracks.push(track);
    }
    return getVideo({
      src: 'video.mp4',
      width: 160,
      height: 90,
      'controls': '',
      'autoplay': '',
      'muted': '',
      'loop': '',
    }, tracks).then(v => {
      const preloadSpy = sandbox.spy(v.implementation_.preconnect, 'url');
      v.implementation_.preconnectCallback();
      preloadSpy.should.have.been.calledWithExactly('video.mp4',
          undefined);
      const video = v.querySelector('video');
      // check that the source tags were propogated
      expect(video.children.length).to.equal(tracktypes.length);
      for (let i = 0; i < tracktypes.length; i++) {
        const tracktype = tracktypes[i];
        expect(video.children.item(i).tagName).to.equal('TRACK');
        expect(video.children.item(i).hasAttribute('src')).to.be.true;
        expect(video.children.item(i).getAttribute('src'))
            .to.equal(getFooVideoSrc(tracktype));
        expect(video.children.item(i).getAttribute('type')).to.equal(tracktype);
        expect(video.children.item(i).getAttribute('srclang')).to.equal('en');
      }
    });
  });

  it('should not load a video with http src', () => {
    allowConsoleError(() => { return expect(getVideo({
      src: 'http://example.com/video.mp4',
      width: 160,
      height: 90,
      'controls': '',
      'autoplay': '',
      'muted': '',
      'loop': '',
    })).to.be.rejectedWith(/start with/); });
  });

  it('should not load a video with http source children', () => {
    const sources = [];
    const mediatypes = ['video/ogg', 'video/mp4', 'video/webm'];
    for (let i = 0; i < mediatypes.length; i++) {
      const mediatype = mediatypes[i];
      const source = doc.createElement('source');
      source.setAttribute('src', 'http:' + getFooVideoSrc(mediatype));
      source.setAttribute('type', mediatype);
      sources.push(source);
    }
    allowConsoleError(() => { return expect(getVideo({
      src: 'video.mp4',
      width: 160,
      height: 90,
      'controls': '',
      'autoplay': '',
      'muted': '',
      'loop': '',
    }, sources)).to.be.rejectedWith(/start with/); });
  });

  it('should set poster, controls, controlsList in prerender mode', () => {
    return getVideo({
      src: 'video.mp4',
      width: 160,
      height: 90,
      'poster': 'img.png',
      'controls': '',
      'controlsList': 'nofullscreen nodownload noremoteplayback',
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
      expect(video.getAttribute('controlsList')).to.equal(
          'nofullscreen nodownload noremoteplayback');
    });
  });

  it('should not set src or preload in build', () => {
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
      const source = doc.createElement('source');
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
      expect(impl.toggleFallback).to.have.been.calledWith(true);
    });
  });

  it('play() should not log promise rejections', () => {
    const playPromise = Promise.reject('The play() request was interrupted');
    const catchSpy = sandbox.spy(playPromise, 'catch');
    return getVideo({
      src: 'video.mp4',
      width: 160,
      height: 90,
    }, null, function(element) {
      const impl = element.implementation_;
      sandbox.stub(impl.video_, 'play').returns(playPromise);
      impl.play();
    }).then(() => {
      expect(catchSpy.called).to.be.true;
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

  it('should propagate attribute mutations', () => {
    return getVideo({
      src: 'foo.mp4',
      width: 160,
      height: 90,
      controls: '',
      controlsList: '',
    }).then(v => {
      const mutations = {
        src: 'bar.mp4',
        controls: null,
        controlsList: 'nodownload nofullscreen',
      };
      Object.keys(mutations).forEach(property => {
        const value = mutations[property];
        if (value === null) {
          v.removeAttribute(property);
        } else {
          v.setAttribute(property, value);
        }
      });
      v.mutatedAttributesCallback(mutations);
      const video = v.querySelector('video');
      expect(video.getAttribute('src')).to.equal('bar.mp4');
      expect(video.controls).to.be.false;
      expect(video.getAttribute('controlsList')).to.equal(
          'nodownload nofullscreen');
    });
  });

  it('should forward certain events from video to the amp element', () => {
    return getVideo({
      src: '/examples/av/ForBiggerJoyrides.mp4',
      width: 160,
      height: 90,
    }).then(v => {
      const impl = v.implementation_;
      return Promise.resolve()
          .then(() => {
            impl.mute();
            return listenOncePromise(v, VideoEvents.MUTED);
          })
          .then(() => {
            impl.play();
            return listenOncePromise(v, VideoEvents.PLAYING);
          })
          .then(() => {
            impl.pause();
            return listenOncePromise(v, VideoEvents.PAUSE);
          })
          .then(() => {
            impl.unmute();
            return listenOncePromise(v, VideoEvents.UNMUTED);
          })
          .then(() => {
            // Should not send the unmute event twice if already sent once.
            const p = listenOncePromise(v, VideoEvents.UNMUTED).then(() => {
              assert.fail('Should not have dispatch unmute message twice');
            });
            v.querySelector('video').dispatchEvent(new Event('volumechange'));
            const successTimeout = timer.promise(10);
            return Promise.race([p, successTimeout]);
          }).then(() => {
            const video = v.querySelector('video');
            video.currentTime = video.duration - 0.1;
            impl.play();
            // Make sure pause and end are triggered when video ends.
            const pEnded = listenOncePromise(v, VideoEvents.ENDED);
            const pPause = listenOncePromise(v, VideoEvents.PAUSE);
            return Promise.all([pEnded, pPause]);
          });
    });
  });

  describe('in prerender mode', () => {
    let makeVisible;
    let visiblePromise;
    let video;
    let viewerMock;

    beforeEach(() => {
      viewerMock = mockServiceForDoc(sandbox, env.ampdoc, 'viewer', [
        'getVisibilityState',
        'whenFirstVisible',
      ]);
      viewerMock.getVisibilityState.returns(VisibilityState.PRERENDER);
      visiblePromise = new Promise(resolve => {
        makeVisible = resolve;
      });
      viewerMock.whenFirstVisible.returns(visiblePromise);
    });

    describe('should not prerender if no cached sources', () => {
      it('with just src', () => {
        return new Promise(resolve => {
          getVideo({
            src: 'video.mp4',
            width: 160,
            height: 90,
          }, null, element => {
            expect(element.implementation_.prerenderAllowed()).to.be.false;
            resolve();
          });
        });
      });

      it('with just source', () => {
        return new Promise(resolve => {
          const source = doc.createElement('source');
          source.setAttribute('src', 'video.mp4');
          getVideo({
            width: 160,
            height: 90,
          }, null, element => {
            expect(element.implementation_.prerenderAllowed()).to.be.false;
            resolve();
          });
        });
      });

      it('with both src and source', () => {
        return new Promise(resolve => {
          const source = doc.createElement('source');
          source.setAttribute('src', 'video.mp4');
          getVideo({
            src: 'video.mp4',
            width: 160,
            height: 90,
          }, [source], element => {
            expect(element.implementation_.prerenderAllowed()).to.be.false;
            resolve();
          });
        });
      });
    });

    describe('should prerender cached sources', () => {
      it('with just cached src', () => {
        return new Promise(resolve => {
          getVideo({
            'src': 'https://example-com.cdn.ampproject.org/m/s/video.mp4',
            'amp-orig-src': 'https://example.com/video.mp4',
            width: 160,
            height: 90,
          }, null, element => {
            expect(element.implementation_.prerenderAllowed()).to.be.true;
            resolve();
          });
        });
      });

      it('with just cached source', () => {
        return new Promise(resolve => {
          const source = doc.createElement('source');
          source.setAttribute('src', 'https://example-com.cdn.ampproject.org/m/s/video.mp4');
          source.setAttribute('amp-orig-src', 'https://example.com/video.mp4');
          getVideo({
            width: 160,
            height: 90,
          }, [source], element => {
            expect(element.implementation_.prerenderAllowed()).to.be.true;
            resolve();
          });
        });
      });

      it('with a mix or cached and non-cached', () => {
        return new Promise(resolve => {
          const source = doc.createElement('source');
          source.setAttribute('src', 'video.mp4');

          const cachedSource = doc.createElement('source');
          cachedSource.setAttribute('src', 'https://example-com.cdn.ampproject.org/m/s/video.mp4');
          cachedSource.setAttribute('amp-orig-src', 'https://example.com/video.mp4');

          getVideo({
            src: 'video.mp4',
            width: 160,
            height: 90,
          }, [source, cachedSource], element => {
            expect(element.implementation_.prerenderAllowed()).to.be.true;
            resolve();
          });
        });
      });
    });

    describe('before visible', () => {
      it('should move cached src to source during prerender', () => {
        return getVideo({
          'src': 'https://example-com.cdn.ampproject.org/m/s/video.mp4',
          'type': 'video/mp4',
          'amp-orig-src': 'https://example.com/video.mp4',
        }).then(v => {
          video = v.querySelector('video');
          expect(video.hasAttribute('src')).to.be.false;
          const sources = video.querySelectorAll('source');
          expect(sources.length).to.equal(1);
          const cachedSource = sources[0];
          expect(cachedSource.getAttribute('src')).to.equal('https://example-com.cdn.ampproject.org/m/s/video.mp4');
          expect(cachedSource.getAttribute('type')).to.equal('video/mp4');
        });
      });

      it('should add cached sources to video', () => {
        const s1 = doc.createElement('source');
        s1.setAttribute('src', 'https://example-com.cdn.ampproject.org/m/s/video1.mp4');
        s1.setAttribute('amp-orig-src', 'https://example.com/video1.mp4');
        s1.setAttribute('type', 'video/mp4');

        const s2 = doc.createElement('source');
        s2.setAttribute('src', 'https://example-com.cdn.ampproject.org/m/s/video2.mp4');
        s2.setAttribute('amp-orig-src', 'https://example.com/video2.mp4');

        return getVideo({
        },[s1, s2]).then(v => {
          video = v.querySelector('video');
          expect(video.hasAttribute('src')).to.be.false;
          const sources = video.querySelectorAll('source');
          expect(sources.length).to.equal(2);
          expect(sources[0].getAttribute('src')).to.equal('https://example-com.cdn.ampproject.org/m/s/video1.mp4');
          expect(sources[0].getAttribute('type')).to.equal('video/mp4');
          expect(sources[1].getAttribute('src')).to.equal('https://example-com.cdn.ampproject.org/m/s/video2.mp4');
          expect(sources[1].getAttribute('type')).to.be.null;
          expect(sources[0]).to.equal(s1);
          expect(sources[1]).to.equal(s2);
        });
      });

      it('should NOT add non-cached sources to video', () => {
        const cached = doc.createElement('source');
        cached.setAttribute('src', 'https://example-com.cdn.ampproject.org/m/s/video.mp4');
        cached.setAttribute('amp-orig-src', 'https://example.com/video1.mp4');

        const noncached = doc.createElement('source');
        noncached.setAttribute('src', 'video.mp4');

        return getVideo({
        },[cached, noncached]).then(v => {
          video = v.querySelector('video');
          expect(video.hasAttribute('src')).to.be.false;
          const sources = video.querySelectorAll('source');
          expect(sources.length).to.equal(1);
          expect(sources[0].getAttribute('src')).to.equal('https://example-com.cdn.ampproject.org/m/s/video.mp4');
          expect(sources[0]).to.equal(cached);
        });
      });

      it('preload should be set to auto if not specified', () => {
        return getVideo({
          'src': 'https://example-com.cdn.ampproject.org/m/s/video.mp4',
          'amp-orig-src': 'https://example.com/video.mp4',
        },null).then(v => {
          video = v.querySelector('video');
          expect(video.getAttribute('preload')).to.equal('auto');
        });
      });

      it('preload should not be overwritten if specified', () => {
        return getVideo({
          'src': 'https://example-com.cdn.ampproject.org/m/s/video.mp4',
          'amp-orig-src': 'https://example.com/video.mp4',
          'preload': 'none',
        },null).then(v => {
          video = v.querySelector('video');
          expect(video.getAttribute('preload')).to.equal('none');
        });
      });
    });

    describe('after visible', () => {
      it('should add original source after cache one - single src', () => {
        return getVideo({
          'src': 'https://example-com.cdn.ampproject.org/m/s/video.mp4',
          'amp-orig-src': 'https://example.com/video.mp4',
        }).then(v => {
          video = v.querySelector('video');
          makeVisible();
          return visiblePromise;
        }).then(() => {
          expect(video.hasAttribute('src')).to.be.false;
          const sources = video.querySelectorAll('source');
          expect(sources.length).to.equal(2);
          expect(sources[0].getAttribute('src')).to.equal('https://example-com.cdn.ampproject.org/m/s/video.mp4');
          expect(sources[1].getAttribute('src')).to.equal('https://example.com/video.mp4');
        });
      });

      it('should add original source after cache one - multiple source', () => {
        const s1 = doc.createElement('source');
        s1.setAttribute('src', 'https://example-com.cdn.ampproject.org/m/s/video1.mp4');
        s1.setAttribute('amp-orig-src', 'https://example.com/video1.mp4');

        const s2 = doc.createElement('source');
        s2.setAttribute('src', 'https://example-com.cdn.ampproject.org/m/s/video2.mp4');
        s2.setAttribute('amp-orig-src', 'https://example.com/video2.mp4');

        return getVideo({
        }, [s1, s2]).then(v => {
          video = v.querySelector('video');
          makeVisible();
          return visiblePromise;
        }).then(() => {
          expect(video.hasAttribute('src')).to.be.false;
          const sources = video.querySelectorAll('source');
          expect(sources.length).to.equal(4);
          expect(sources[0].getAttribute('src')).to.equal('https://example-com.cdn.ampproject.org/m/s/video1.mp4');
          expect(sources[1].getAttribute('src')).to.equal('https://example.com/video1.mp4');
          expect(sources[2].getAttribute('src')).to.equal('https://example-com.cdn.ampproject.org/m/s/video2.mp4');
          expect(sources[3].getAttribute('src')).to.equal('https://example.com/video2.mp4');
        });
      });
    });

    describe('isCachedByCDN', () => {
      it('must have amp-orig-src attribute', () => {
        return new Promise(resolve => {
          getVideo({
            'src': 'https://example-com.cdn.ampproject.org/m/s/video.mp4',
            width: 160,
            height: 90,
          }, null, element => {
            expect(element.implementation_.isCachedByCDN_(element)).to.be.false;
            resolve();
          });
        });
      });

      it('must be CDN url', () => {
        return new Promise(resolve => {
          getVideo({
            'src': 'https://example-com.cdn.FAKEampproject.org/m/s/video.mp4',
            'amp-orig-src': 'https://example.com/video.mp4',
            width: 160,
            height: 90,
          }, null, element => {
            expect(element.implementation_.isCachedByCDN_(element)).to.be.false;
            resolve();
          });
        });
      });
    });
  });
});
