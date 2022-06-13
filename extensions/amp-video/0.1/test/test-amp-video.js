import {VisibilityState_Enum} from '#core/constants/visibility-state';
import {dispatchCustomEvent} from '#core/dom';

import {toggleExperiment} from '#experiments';

import {Services} from '#service';
import {installPerformanceService} from '#service/performance-impl';
import {xhrServiceForTesting} from '#service/xhr-impl';

import {listenOncePromise} from '#utils/event-helper';

import {installResizeObserverStub} from '#testing/resize-observer-stub';

import {VideoEvents_Enum} from '../../../../src/video-interface';
import {AmpCacheUrlService} from '../../../amp-cache-url/0.1/amp-cache-url';
import {AmpVideo, isCachedByCdn} from '../amp-video';

describes.realWin(
  'amp-video',
  {
    amp: {
      extensions: ['amp-video'],
    },
  },
  (env) => {
    let win, doc;
    let timer;
    let resizeObserverStub;

    beforeEach(() => {
      win = env.win;
      doc = win.document;
      timer = Services.timerFor(win);

      installPerformanceService(win);
      resizeObserverStub = installResizeObserverStub(env.sandbox, win);
    });

    function getFooVideoSrc(filetype) {
      return '//someHost/foo.' + filetype.slice(filetype.indexOf('/') + 1); // assumes no optional params
    }

    async function getVideo(
      attributes,
      children,
      opt_beforeLayoutCallback,
      opt_noLayout
    ) {
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
      await v.buildInternal();
      const impl = await v.getImpl(false);

      if (opt_noLayout) {
        return v;
      }
      if (opt_beforeLayoutCallback) {
        opt_beforeLayoutCallback(v, impl);
      }
      try {
        await v.layoutCallback();
        return v;
      } catch (e) {
        // Ignore failed to load errors since sources are fake.
        if (e.toString().indexOf('Failed to load') > -1) {
          return v;
        } else {
          throw e;
        }
      }
    }

    it('should preconnect', async () => {
      const v = await getVideo({
        src: 'video.mp4',
        width: 160,
        height: 90,
      });
      const impl = await v.getImpl(false);
      const preconnect = Services.preconnectFor(win);
      env.sandbox.spy(preconnect, 'url');
      impl.preconnectCallback();
      expect(preconnect.url).to.have.been.calledWithExactly(
        env.sandbox.match.object, // AmpDoc
        'video.mp4',
        undefined
      );
    });

    it('should load a video', async () => {
      const v = await getVideo({
        src: 'video.mp4',
        width: 160,
        height: 90,
      });
      const video = v.querySelector('video');
      expect(video.tagName).to.equal('VIDEO');
      expect(video.getAttribute('src')).to.equal('video.mp4');
      expect(video.hasAttribute('controls')).to.be.false;
    });

    it('should load a cached video', async () => {
      const v = await getVideo({
        src: 'https://example-com.cdn.ampproject.org/m/s/video.mp4',
        'amp-orig-src': 'https://example.com/video.mp4',
        width: 160,
        height: 90,
      });
      const video = v.querySelector('video');
      expect(video.getAttribute('src')).to.be.null;
      const sources = video.querySelectorAll('source');
      expect(sources.length).to.equal(4);
      expect(sources[0].getAttribute('src')).to.equal(
        'https://example-com.cdn.ampproject.org/m/s/video.mp4?amp_video_quality=high'
      );
      expect(sources[1].getAttribute('src')).to.equal(
        'https://example-com.cdn.ampproject.org/m/s/video.mp4?amp_video_quality=medium'
      );
      expect(sources[2].getAttribute('src')).to.equal(
        'https://example-com.cdn.ampproject.org/m/s/video.mp4?amp_video_quality=low'
      );
      expect(sources[3].getAttribute('src')).to.equal(
        'https://example.com/video.mp4'
      );
    });

    it('should load a cached video and bitrate', async () => {
      const source = doc.createElement('source');
      source.setAttribute(
        'src',
        'https://example-com.cdn.ampproject.org/m/s/video.mp4'
      );
      source.setAttribute('amp-orig-src', 'https://example.com/video.mp4');
      source.setAttribute('data-bitrate', '1000');
      const v = await getVideo(
        {
          width: 160,
          height: 90,
        },
        [source]
      );
      const video = v.querySelector('video');
      expect(video.getAttribute('src')).to.be.null;
      const sources = video.querySelectorAll('source');
      expect(sources.length).to.equal(4);
      expect(sources[0].getAttribute('data-bitrate')).to.equal('2000');
      expect(sources[1].getAttribute('data-bitrate')).to.equal('720');
      expect(sources[2].getAttribute('data-bitrate')).to.equal('400');
      expect(sources[3].hasAttribute('data-bitrate')).to.be.false;
      expect(sources[3].getAttribute('src')).to.equal(
        'https://example.com/video.mp4'
      );
    });

    it('should set an attribute on cached video sources', async () => {
      const source = doc.createElement('source');
      source.setAttribute(
        'src',
        'https://example-com.cdn.ampproject.org/m/s/video.mp4'
      );
      source.setAttribute('amp-orig-src', 'https://example.com/video.mp4');
      source.setAttribute('data-bitrate', '1000');
      const v = await getVideo(
        {
          width: 160,
          height: 90,
        },
        [source]
      );
      const sources = v.querySelectorAll('source');
      expect(sources[0]).to.have.attribute('i-amphtml-video-cached-source');
      expect(sources[1]).to.have.attribute('i-amphtml-video-cached-source');
      expect(sources[2]).to.have.attribute('i-amphtml-video-cached-source');
    });

    it('should not set an attribute on non cached video sources', async () => {
      const source = doc.createElement('source');
      source.setAttribute(
        'src',
        'https://example-com.cdn.ampproject.org/m/s/video.mp4'
      );
      source.setAttribute('amp-orig-src', 'https://example.com/video.mp4');
      source.setAttribute('data-bitrate', '1000');
      const v = await getVideo(
        {
          width: 160,
          height: 90,
        },
        [source]
      );
      const sources = v.querySelectorAll('source');
      expect(sources[3]).to.not.have.attribute('i-amphtml-video-cached-source');
    });

    it('should load a video', async () => {
      const v = await getVideo({
        src: 'video.mp4',
        width: 160,
        height: 90,
        'controls': '',
        'muted': '',
        'loop': '',
        'crossorigin': '',
        'disableremoteplayback': '',
      });
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

    it('should load a video with source children', async () => {
      const sources = [];
      const mediatypes = ['video/ogg', 'video/mp4', 'video/webm'];
      for (let i = 0; i < mediatypes.length; i++) {
        const mediatype = mediatypes[i];
        const source = doc.createElement('source');
        source.setAttribute('src', getFooVideoSrc(mediatype));
        source.setAttribute('type', mediatype);
        sources.push(source);
      }
      const v = await getVideo(
        {
          src: 'video.mp4',
          width: 160,
          height: 90,
          'controls': '',
          'autoplay': '',
          'muted': '',
          'loop': '',
        },
        sources
      );
      const video = v.querySelector('video');
      // check that the source tags were propogated
      expect(video.children.length).to.equal(mediatypes.length);
      for (let i = 0; i < mediatypes.length; i++) {
        const mediatype = mediatypes[i];
        expect(video.children.item(i).tagName).to.equal('SOURCE');
        expect(video.children.item(i).hasAttribute('src')).to.be.true;
        expect(video.children.item(i).getAttribute('src')).to.equal(
          getFooVideoSrc(mediatype)
        );
        expect(video.children.item(i).getAttribute('type')).to.equal(mediatype);
      }
    });

    it('should load a video with track children', async () => {
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
      const v = await getVideo(
        {
          src: 'video.mp4',
          width: 160,
          height: 90,
          'controls': '',
          'autoplay': '',
          'muted': '',
          'loop': '',
        },
        tracks
      );
      const video = v.querySelector('video');
      // check that the source tags were propogated
      expect(video.children.length).to.equal(tracktypes.length);
      for (let i = 0; i < tracktypes.length; i++) {
        const tracktype = tracktypes[i];
        expect(video.children.item(i).tagName).to.equal('TRACK');
        expect(video.children.item(i).hasAttribute('src')).to.be.true;
        expect(video.children.item(i).getAttribute('src')).to.equal(
          getFooVideoSrc(tracktype)
        );
        expect(video.children.item(i).getAttribute('type')).to.equal(tracktype);
        expect(video.children.item(i).getAttribute('srclang')).to.equal('en');
      }
    });

    it('should not load a video with http src', () => {
      // Both "preconnectCallback" and "propagateLayoutChildren_" will trigger
      // this error message.
      expectAsyncConsoleError(/start with/, 2);
      return expect(
        getVideo({
          src: 'http://example.com/video.mp4',
          width: 160,
          height: 90,
          'controls': '',
          'autoplay': '',
          'muted': '',
          'loop': '',
        }).catch(async (e) => {
          const v = doc.querySelector('amp-video');
          const impl = await v.getImpl(false);
          // preconnectCallback could get called again after this test is done, and
          // trigger an other "start with https://" error that would crash mocha.
          env.sandbox.stub(impl, 'preconnectCallback');
          throw e;
        })
      ).to.be.rejectedWith(/start with/);
    });

    it('should not load a video with http source children', () => {
      expectAsyncConsoleError(/start with/);
      const sources = [];
      const mediatypes = ['video/ogg', 'video/mp4', 'video/webm'];
      for (let i = 0; i < mediatypes.length; i++) {
        const mediatype = mediatypes[i];
        const source = doc.createElement('source');
        source.setAttribute('src', 'http:' + getFooVideoSrc(mediatype));
        source.setAttribute('type', mediatype);
        sources.push(source);
      }
      return expect(
        getVideo(
          {
            src: 'video.mp4',
            width: 160,
            height: 90,
            'controls': '',
            'autoplay': '',
            'muted': '',
            'loop': '',
          },
          sources
        )
      ).to.be.rejectedWith(/start with/);
    });

    it('should set poster, controls, controlsList in prerender mode', async () => {
      const v = await getVideo(
        {
          src: 'video.mp4',
          width: 160,
          height: 90,
          'poster': 'img.png',
          'controls': '',
          'controlsList': 'nofullscreen nodownload noremoteplayback',
        },
        null,
        function (element) {
          // Should set appropriate attributes in buildCallback
          const video = element.querySelector('video');
          expect(video.getAttribute('controls')).to.exist;
          expect(video.getAttribute('playsinline')).to.exist;
          expect(video.getAttribute('webkit-playsinline')).to.exist;
        }
      );
      // Same attributes should still be present in layoutCallback.
      const video = v.querySelector('video');
      expect(video.tagName).to.equal('VIDEO');
      expect(video.getAttribute('poster')).to.equal('img.png');
      expect(video.getAttribute('controls')).to.exist;
      expect(video.getAttribute('controlsList')).to.equal(
        'nofullscreen nodownload noremoteplayback'
      );
    });

    it('should not set poster, src, or preload in build', async () => {
      const v = await getVideo(
        {
          src: 'video.mp4',
          width: 160,
          height: 90,
          'preload': 'auto',
          'poster': 'img.png',
        },
        null,
        function (element) {
          const video = element.querySelector('video');
          expect(video.getAttribute('preload')).to.equal('none');
          expect(video.hasAttribute('poster')).to.be.false;
          expect(video.hasAttribute('src')).to.be.false;
        }
      );
      // Should set appropriate attributes in layoutCallback.
      const video = v.querySelector('video');
      expect(video.tagName).to.equal('VIDEO');
      expect(video.getAttribute('preload')).to.equal('auto');
      expect(video.getAttribute('poster')).to.equal('img.png');
    });

    it('should remove preload attribute when not provided', async () => {
      const v = await getVideo(
        {
          src: 'video.mp4',
          width: 160,
          height: 90,
          'poster': 'img.png',
        },
        null,
        function (element) {
          const video = element.querySelector('video');
          expect(video.getAttribute('preload')).to.equal('none');
          expect(video.hasAttribute('poster')).to.be.false;
          expect(video.hasAttribute('src')).to.be.false;
        }
      );
      // Should set appropriate attributes in layoutCallback.
      const video = v.querySelector('video');
      expect(video.tagName).to.equal('VIDEO');
      expect(video.hasAttribute('preload')).to.be.false;
      expect(video.getAttribute('poster')).to.equal('img.png');
    });

    it('should not load a video with source children in prerender mode', async () => {
      const sources = [];
      const mediatypes = ['video/ogg', 'video/mp4', 'video/webm'];
      for (let i = 0; i < mediatypes.length; i++) {
        const mediatype = mediatypes[i];
        const source = doc.createElement('source');
        source.setAttribute('src', getFooVideoSrc(mediatype));
        source.setAttribute('type', mediatype);
        sources.push(source);
      }
      const v = await getVideo(
        {
          src: 'video.mp4',
          width: 160,
          height: 90,
          'controls': '',
          'autoplay': '',
          'muted': '',
          'loop': '',
        },
        sources,
        function (element) {
          const video = element.querySelector('video');
          expect(video.children.length).to.equal(0);
        }
      );
      // Should add attributes and source children in layoutCallback.
      const video = v.querySelector('video');
      // check that the source tags were propogated
      expect(video.children.length).to.equal(mediatypes.length);
      for (let i = 0; i < mediatypes.length; i++) {
        const mediatype = mediatypes[i];
        expect(video.children.item(i).tagName).to.equal('SOURCE');
        expect(video.children.item(i).hasAttribute('src')).to.be.true;
        expect(video.children.item(i).getAttribute('src')).to.equal(
          getFooVideoSrc(mediatype)
        );
        expect(video.children.item(i).getAttribute('type')).to.equal(mediatype);
      }
    });

    it('should set src and preload in non-prerender mode', async () => {
      const v = await getVideo(
        {
          src: 'video.mp4',
          width: 160,
          height: 90,
          'preload': 'auto',
          'poster': 'img.png',
        },
        null,
        function (element) {
          const video = element.querySelector('video');
          expect(video.getAttribute('preload')).to.equal('none');
          expect(video.hasAttribute('poster')).to.be.false;
          expect(video.hasAttribute('src')).to.be.false;
        }
      );
      const video = v.querySelector('video');
      expect(video.tagName).to.equal('VIDEO');
      expect(video.getAttribute('preload')).to.equal('auto');
      expect(video.getAttribute('poster')).to.equal('img.png');
    });

    it('should auto-pause the video', async () => {
      const v = await getVideo({
        src: 'video.mp4',
        width: 160,
        height: 90,
      });
      const video = v.querySelector('video');
      env.sandbox.spy(video, 'pause');
      // The auto-pause only happens on when the video is actually playing.
      dispatchCustomEvent(video, 'play');
      // First send "size" event and then "no size".
      resizeObserverStub.notifySync({
        target: v,
        borderBoxSize: [{inlineSize: 10, blockSize: 10}],
      });
      resizeObserverStub.notifySync({
        target: v,
        borderBoxSize: [{inlineSize: 0, blockSize: 0}],
      });
      expect(video.pause.called).to.be.true;
    });

    it('should fallback if video element is not supported', async () => {
      const v = await getVideo(
        {
          src: 'video.mp4',
          width: 160,
          height: 90,
        },
        null,
        function (element, impl) {
          env.sandbox.stub(impl, 'isVideoSupported_').returns(false);
          env.sandbox.spy(impl, 'toggleFallback');
        }
      );
      const impl = await v.getImpl(false);
      expect(impl.toggleFallback.called).to.be.true;
      expect(impl.toggleFallback).to.have.been.calledWith(true);
    });

    it('decode error retries the next source', async () => {
      const s0 = doc.createElement('source');
      s0.setAttribute('src', './0.mp4');
      const s1 = doc.createElement('source');
      s1.setAttribute('src', 'https://example.com/1.mp4');
      const video = await getVideo(
        {
          width: 160,
          height: 90,
        },
        [s0, s1]
      );
      const impl = await video.getImpl(false);
      const ele = impl.video_;
      ele.play = env.sandbox.stub();
      ele.load = env.sandbox.stub();
      Object.defineProperty(ele, 'error', {
        value: {
          code: MediaError.MEDIA_ERR_DECODE,
        },
      });
      const secondErrorHandler = env.sandbox.stub();
      ele.addEventListener('error', secondErrorHandler);
      expect(ele.childElementCount).to.equal(2);
      ele.dispatchEvent(new ErrorEvent('error'));
      expect(ele.childElementCount).to.equal(1);
      expect(ele.load).to.have.been.called;
      expect(ele.play).to.have.been.called;
      expect(secondErrorHandler).to.not.have.been.called;
    });

    it('non-decode error has no side effect', async () => {
      const s0 = doc.createElement('source');
      s0.setAttribute('src', 'https://example.com/0.mp4');
      const s1 = doc.createElement('source');
      s1.setAttribute('src', 'https://example.com/1.mp4');
      const video = await getVideo(
        {
          width: 160,
          height: 90,
        },
        [s0, s1]
      );
      const impl = await video.getImpl(false);
      const ele = impl.video_;
      ele.play = env.sandbox.stub();
      ele.load = env.sandbox.stub();
      Object.defineProperty(ele, 'error', {
        value: {
          code: MediaError.MEDIA_ERR_ABORTED,
        },
      });
      const secondErrorHandler = env.sandbox.stub();
      ele.addEventListener('error', secondErrorHandler);
      expect(ele.childElementCount).to.equal(2);
      ele.dispatchEvent(new ErrorEvent('error'));
      expect(ele.childElementCount).to.equal(2);
      expect(secondErrorHandler).to.have.been.called;
    });

    it('should propagate ARIA attributes', async () => {
      const v = await getVideo({
        src: 'video.mp4',
        width: 160,
        height: 90,
        'aria-label': 'Hello',
        'aria-labelledby': 'id2',
        'aria-describedby': 'id3',
      });
      const video = v.querySelector('video');
      expect(video.getAttribute('aria-label')).to.equal('Hello');
      expect(video.getAttribute('aria-labelledby')).to.equal('id2');
      expect(video.getAttribute('aria-describedby')).to.equal('id3');
    });

    it('should propagate attribute mutations', async () => {
      const v = await getVideo({
        src: 'foo.mp4',
        width: 160,
        height: 90,
        controls: '',
        controlsList: '',
      });
      const mutations = {
        src: 'bar.mp4',
        controls: null,
        controlsList: 'nodownload nofullscreen',
      };
      Object.keys(mutations).forEach((property) => {
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
        'nodownload nofullscreen'
      );
    });

    it('should propagate the object-fit attribute', async () => {
      const v = await getVideo({
        src: 'video.mp4',
        'object-fit': 'cover',
        layout: 'responsive',
      });
      const video = v.querySelector('video');
      expect(video.style.objectFit).to.equal('cover');
    });

    it('should not propagate the object-fit attribute if invalid', async () => {
      const v = await getVideo({
        src: 'video.mp4',
        'object-fit': 'foo 80%',
        layout: 'responsive',
      });
      const video = v.querySelector('video');
      expect(video.style.objectFit).to.be.empty;
    });

    it('should propagate the object-position attribute', async () => {
      const v = await getVideo({
        src: 'video.mp4',
        'object-position': '20% 80%',
        layout: 'responsive',
      });
      const video = v.querySelector('video');
      expect(video.style.objectPosition).to.equal('20% 80%');
    });

    it('should not propagate the object-position attribute if invalid', async () => {
      const v = await getVideo({
        src: 'video.mp4',
        'object-position': 'url("example.com")',
        layout: 'responsive',
      });
      const video = v.querySelector('video');
      expect(video.style.objectPosition).to.be.empty;
    });

    // TODO: unskip the tests in this file #19664
    it.skip('should forward certain events from video to the amp element', async () => {
      const v = await getVideo({
        src: '/examples/av/ForBiggerJoyrides.mp4',
        width: 160,
        height: 90,
      });
      const impl = await v.getImpl(false);
      await Promise.resolve();
      impl.mute();
      await listenOncePromise(v, VideoEvents_Enum.MUTED);
      impl.play();
      const playPromise = listenOncePromise(v, VideoEvents_Enum.PLAY);
      await listenOncePromise(v, VideoEvents_Enum.PLAYING);
      await playPromise;
      impl.pause();
      await listenOncePromise(v, VideoEvents_Enum.PAUSE);
      impl.unmute();
      await listenOncePromise(v, VideoEvents_Enum.UNMUTED);
      // Should not send the unmute event twice if already sent once.
      const p = listenOncePromise(v, VideoEvents_Enum.UNMUTED).then(() => {
        assert.fail('Should not have dispatch unmute message twice');
      });
      v.querySelector('video').dispatchEvent(new Event('volumechange'));
      const successTimeout = timer.promise(10);
      await Promise.race([p, successTimeout]);
      const video = v.querySelector('video');
      video.currentTime = video.duration - 0.1;
      impl.play();
      // Make sure pause and end are triggered when video ends.
      const pEnded = listenOncePromise(v, VideoEvents_Enum.ENDED);
      const pPause = listenOncePromise(v, VideoEvents_Enum.PAUSE);
      return Promise.all([pEnded, pPause]);
    });

    describe('remote video cache (amp-video[cache=*])', () => {
      let remoteSources;
      beforeEach(() => {
        const cacheUrlService = new AmpCacheUrlService();
        env.sandbox
          .stub(Services, 'cacheUrlServicePromiseForDoc')
          .resolves(cacheUrlService);

        const extensionsService = {
          installExtensionForDoc: env.sandbox.spy(() => Promise.resolve()),
        };
        env.sandbox.stub(Services, 'extensionsFor').returns(extensionsService);

        const xhrService = xhrServiceForTesting(env.win);
        env.sandbox.stub(Services, 'xhrFor').returns(xhrService);
        remoteSources = [];
        env.sandbox.stub(xhrService, 'fetch').resolves({
          json: () => Promise.resolve({sources: remoteSources}),
        });
      });

      it('should play a source fetched from video caching', async () => {
        remoteSources.push({
          url: 'https://example.com/cached-video.mp4',
          type: 'video/mp4',
        });
        const v = await getVideo({
          src: 'https://example-com.cdn.ampproject.org/m/s/video.mp4',
          type: 'video/mp4',
          'amp-orig-src': 'https://example.com/video.mp4',
          cache: 'google',
          layout: 'responsive',
          height: '100px',
          width: '100px',
        });
        const sources = v.querySelectorAll('source');
        expect(sources.length).to.equal(2);
        expect(v.querySelector('video')).to.not.have.attribute('src');
        expect(sources[0].getAttribute('src')).to.equal(
          'https://example.com/cached-video.mp4'
        );
        expect(sources[1].getAttribute('src')).to.equal(
          'https://example.com/video.mp4'
        );
      });

      it('should remove AMP Cache video caching on video[src] if remote video caching is provided', async () => {
        const origSrc = 'https://example.com/video.mp4';
        const v = await getVideo({
          src: 'https://example-com.cdn.ampproject.org/m/s/video.mp4',
          type: 'video/mp4',
          'amp-orig-src': origSrc,
          cache: 'google',
          layout: 'responsive',
          height: '100px',
          width: '100px',
        });
        const sources = v.querySelectorAll('source');
        expect(sources.length).to.equal(1);
        expect(sources[0].getAttribute('src')).to.equal(origSrc);
      });

      it('should remove AMP Cache video caching on source elements if remote video caching is provided', async () => {
        const origSrc = 'https://example.com/video.mp4';
        const cachedSource = doc.createElement('source');
        cachedSource.setAttribute(
          'src',
          'https://example-com.cdn.ampproject.org/m/s/video.mp4'
        );
        cachedSource.setAttribute('amp-orig-src', origSrc);
        const v = await getVideo(
          {
            type: 'video/mp4',
            cache: 'google',
            layout: 'responsive',
            height: '100px',
            width: '100px',
          },
          [cachedSource]
        );
        const sources = v.querySelectorAll('source');
        expect(sources.length).to.equal(1);
        expect(sources[0].getAttribute('src')).to.equal(origSrc);
      });

      describe('prerendering', () => {
        let makeVisible;
        let visibilityStubs;

        beforeEach(() => {
          visibilityStubs = {
            getVisibilityState: env.sandbox.stub(
              env.ampdoc,
              'getVisibilityState'
            ),
            whenFirstVisible: env.sandbox.stub(env.ampdoc, 'whenFirstVisible'),
          };
          visibilityStubs.getVisibilityState.returns(
            VisibilityState_Enum.PRERENDER
          );
          const visiblePromise = new Promise((resolve) => {
            makeVisible = resolve;
          });
          visibilityStubs.whenFirstVisible.returns(visiblePromise);
        });

        it('should propagate cached sources in prerendering', async () => {
          remoteSources.push({
            url: 'https://example.com/cached-video.mp4',
            type: 'video/mp4',
          });
          const source = doc.createElement('source');
          source.setAttribute('src', 'https://example.com/video.mp4');
          const v = await getVideo(
            {
              type: 'video/mp4',
              cache: 'google',
              layout: 'responsive',
              height: '100px',
              width: '100px',
            },
            [source],
            null,
            /* opt_noLayout */ true
          );
          v.layoutCallback();
          const sources = v.querySelectorAll('video source');
          // Only one source, and the cached one.
          expect(sources.length).to.equal(1);
          expect(sources[0].getAttribute('src')).to.equal(
            'https://example.com/cached-video.mp4'
          );
        });

        it('should have all sources when visible after prerendering', async () => {
          remoteSources.push({
            url: 'https://example.com/cached-video.mp4',
            type: 'video/mp4',
          });
          const source = doc.createElement('source');
          source.setAttribute('src', 'https://example.com/video.mp4');
          const v = await getVideo(
            {
              type: 'video/mp4',
              cache: 'google',
              layout: 'responsive',
              height: '100px',
              width: '100px',
            },
            [source],
            null,
            /* opt_noLayout */ true
          );
          v.layoutCallback();
          makeVisible();
          await Promise.resolve();
          const sources = v.querySelectorAll('video source');
          // Cached + non cached source and in the right order.
          expect(sources.length).to.equal(2);
          expect(sources[0].getAttribute('src')).to.equal(
            'https://example.com/cached-video.mp4'
          );
          expect(sources[1].getAttribute('src')).to.equal(
            'https://example.com/video.mp4'
          );
        });
      });

      describe('max bitrate', () => {
        beforeEach(() => {
          toggleExperiment(env.win, 'amp-story-first-page-max-bitrate', true);
        });

        afterEach(() => {
          toggleExperiment(env.win, 'amp-story-first-page-max-bitrate', false);
        });

        it('should apply a max bitrate on first story page', async () => {
          remoteSources.push({
            url: 'https://example.com/cached-video-2000.mp4',
            type: 'video/mp4',
            'bitrate_kbps': 2000,
          });
          remoteSources.push({
            url: 'https://example.com/cached-video-720.mp4',
            type: 'video/mp4',
            'bitrate_kbps': 720,
          });
          const attrs = {
            src: 'https://example-com.cdn.ampproject.org/m/s/video.mp4',
            type: 'video/mp4',
            'amp-orig-src': 'https://example.com/video.mp4',
            cache: 'google',
            layout: 'responsive',
            height: '100px',
            width: '100px',
          };
          const storyEl = doc.createElement('amp-story');
          const storyPageEl = doc.createElement('amp-story-page');
          const v = doc.createElement('amp-video');
          for (const key in attrs) {
            v.setAttribute(key, attrs[key]);
          }
          storyEl.appendChild(storyPageEl);
          storyPageEl.appendChild(v);
          doc.body.appendChild(storyEl);
          await v.buildInternal();
          await v.getImpl(false);

          try {
            await v.layoutCallback();
          } catch (e) {}

          const sources = v.querySelectorAll('source');
          expect(sources[0].getAttribute('src')).to.equal(
            'https://example.com/cached-video-720.mp4'
          );
        });

        it('should not apply a max bitrate on second story page', async () => {
          remoteSources.push({
            url: 'https://example.com/cached-video-2000.mp4',
            type: 'video/mp4',
            'bitrate_kbps': 2000,
          });
          remoteSources.push({
            url: 'https://example.com/cached-video-720.mp4',
            type: 'video/mp4',
            'bitrate_kbps': 720,
          });
          const attrs = {
            src: 'https://example-com.cdn.ampproject.org/m/s/video.mp4',
            type: 'video/mp4',
            'amp-orig-src': 'https://example.com/video.mp4',
            cache: 'google',
            layout: 'responsive',
            height: '100px',
            width: '100px',
          };
          const storyEl = doc.createElement('amp-story');
          const storyPageEl = doc.createElement('amp-story-page');
          const storyPageEl2 = doc.createElement('amp-story-page');
          const v = doc.createElement('amp-video');
          for (const key in attrs) {
            v.setAttribute(key, attrs[key]);
          }
          storyEl.appendChild(storyPageEl);
          storyEl.appendChild(storyPageEl2);
          storyPageEl2.appendChild(v);
          doc.body.appendChild(storyEl);
          await v.buildInternal();
          await v.getImpl(false);

          try {
            await v.layoutCallback();
          } catch (e) {}

          const sources = v.querySelectorAll('source');
          expect(sources[0].getAttribute('src')).to.equal(
            'https://example.com/cached-video-2000.mp4'
          );
        });

        it('should apply a max bitrate on first story page with legacy caching', async () => {
          const attrs = {
            src: 'https://example-com.cdn.ampproject.org/m/s/video.mp4',
            type: 'video/mp4',
            'amp-orig-src': 'https://example.com/video.mp4',
            layout: 'responsive',
            height: '100px',
            width: '100px',
          };
          const storyEl = doc.createElement('amp-story');
          const storyPageEl = doc.createElement('amp-story-page');
          const v = doc.createElement('amp-video');
          for (const key in attrs) {
            v.setAttribute(key, attrs[key]);
          }
          storyEl.appendChild(storyPageEl);
          storyPageEl.appendChild(v);
          doc.body.appendChild(storyEl);
          await v.buildInternal();
          await v.getImpl(false);

          try {
            await v.layoutCallback();
          } catch (e) {}

          const sources = v.querySelectorAll('source');
          expect(sources[0].getAttribute('src')).to.equal(
            'https://example-com.cdn.ampproject.org/m/s/video.mp4?amp_video_quality=medium'
          );
          expect(sources[0].getAttribute('data-bitrate')).to.equal('720');
        });
      });
    });

    describe('blurred image placeholder', () => {
      /**
       * Creates an amp-video with an image child that could potentially be a
       * blurry placeholder.
       * @param {boolean} addPlaceholder Whether the child should have a
       *     placeholder attribute.
       * @param {boolean} addBlurClass Whether the child should have the
       *     class that allows it to be a blurred placeholder.
       * @return {!Promise<AmpImg>} An amp-video potentially with a blurry placeholder
       */
      async function getVideoWithBlur(addPlaceholder, addBlurClass) {
        const v = doc.createElement('amp-video');
        v.setAttribute('layout', 'fixed');
        v.setAttribute('width', '300px');
        v.setAttribute('height', '250px');
        const img = doc.createElement('img');
        if (addPlaceholder) {
          img.setAttribute('placeholder', '');
          v.getPlaceholder = () => img;
        } else {
          v.getPlaceholder = env.sandbox.stub();
        }
        if (addBlurClass) {
          img.classList.add('i-amphtml-blurry-placeholder');
        }
        v.setAttribute('poster', 'img.png');
        doc.body.appendChild(v);
        v.appendChild(img);
        v.buildInternal();
        const impl = await v.getImpl(false);
        impl.togglePlaceholder = env.sandbox.stub();
        return impl;
      }

      it('should only fade out blurry image placeholders', async () => {
        let impl = await getVideoWithBlur(true, true);
        impl.buildCallback();
        impl.layoutCallback();
        impl.firstLayoutCompleted();
        let el = impl.element;
        let img = el.firstChild;
        expect(img.style.opacity).to.equal('0');
        expect(impl.togglePlaceholder).to.not.be.called;

        impl = await getVideoWithBlur(true, false);
        impl.buildCallback();
        impl.layoutCallback();
        impl.firstLayoutCompleted();
        el = impl.element;
        img = el.firstChild;
        expect(img.style.opacity).to.be.equal('');
        expect(impl.togglePlaceholder).to.have.been.calledWith(false);

        impl = await getVideoWithBlur(false, true);
        impl.buildCallback();
        impl.layoutCallback();
        impl.firstLayoutCompleted();
        el = impl.element;
        img = el.firstChild;
        expect(img.style.opacity).to.be.equal('');
        expect(impl.togglePlaceholder).to.have.been.calledWith(false);

        impl = await getVideoWithBlur(false, false);
        impl.buildCallback();
        impl.layoutCallback();
        impl.firstLayoutCompleted();
        el = impl.element;
        img = el.firstChild;
        expect(impl.togglePlaceholder).to.have.been.calledWith(false);
      });

      it('should fade out the blurry image placeholder on video load', async () => {
        const impl = await getVideoWithBlur(true, true);
        impl.buildCallback();
        impl.layoutCallback();
        impl.firstLayoutCompleted();
        const el = impl.element;
        const img = el.firstChild;
        expect(img.style.opacity).to.equal('0');
        expect(impl.togglePlaceholder).to.not.be.called;
      });

      it('should fade out the blurry image placeholder on poster load', async () => {
        const impl = await getVideoWithBlur(true, true);
        impl.buildCallback();
        impl.layoutCallback();
        const el = impl.element;
        const img = el.firstChild;
        impl.posterDummyImageForTesting_.onload();
        expect(img.style.opacity).to.equal('0');
        expect(impl.togglePlaceholder).to.not.be.called;
      });
    });

    describe('in prerender mode', () => {
      let makeVisible;
      let visiblePromise;
      let video;
      let visibilityStubs;

      beforeEach(() => {
        visibilityStubs = {
          getVisibilityState: env.sandbox.stub(
            env.ampdoc,
            'getVisibilityState'
          ),
          whenFirstVisible: env.sandbox.stub(env.ampdoc, 'whenFirstVisible'),
        };
        visibilityStubs.getVisibilityState.returns(
          VisibilityState_Enum.PRERENDER
        );
        visiblePromise = new Promise((resolve) => {
          makeVisible = resolve;
        });
        visibilityStubs.whenFirstVisible.returns(visiblePromise);

        video = doc.createElement('amp-video');
        video.setAttribute('layout', 'nodisplay');
        doc.body.appendChild(video);
      });

      describe('should not prerender if no cached sources', () => {
        it('with just src', () => {
          video.setAttribute('src', 'video.mp4');
          expect(AmpVideo.prerenderAllowed(video)).to.be.false;
          expect(AmpVideo.previewAllowed(video)).to.be.false;
        });

        it('with just source', () => {
          const source = doc.createElement('source');
          source.setAttribute('src', 'video.mp4');
          video.appendChild(source);
          expect(AmpVideo.prerenderAllowed(video)).to.be.false;
          expect(AmpVideo.previewAllowed(video)).to.be.false;
        });

        it('with both src and source', () => {
          video.setAttribute('src', 'video.mp4');
          const source = doc.createElement('source');
          source.setAttribute('src', 'video.mp4');
          video.appendChild(source);
          expect(AmpVideo.prerenderAllowed(video)).to.be.false;
          expect(AmpVideo.previewAllowed(video)).to.be.false;
        });
      });

      describe('should prerender cached sources', () => {
        it('with just cached src', () => {
          video.setAttribute(
            'src',
            'https://example-com.cdn.ampproject.org/m/s/video.mp4'
          );
          video.setAttribute('amp-orig-src', 'https://example.com/video.mp4');
          expect(AmpVideo.prerenderAllowed(video)).to.be.true;
          expect(AmpVideo.previewAllowed(video)).to.be.true;
        });

        it('with just cached source', () => {
          const source = doc.createElement('source');
          source.setAttribute(
            'src',
            'https://example-com.cdn.ampproject.org/m/s/video.mp4'
          );
          source.setAttribute('amp-orig-src', 'https://example.com/video.mp4');
          video.appendChild(source);
          expect(AmpVideo.prerenderAllowed(video)).to.be.true;
          expect(AmpVideo.previewAllowed(video)).to.be.true;
        });

        it('with a mix or cached and non-cached', () => {
          const source = doc.createElement('source');
          source.setAttribute('src', 'video.mp4');
          video.appendChild(source);

          const cachedSource = doc.createElement('source');
          cachedSource.setAttribute(
            'src',
            'https://example-com.cdn.ampproject.org/m/s/video.mp4'
          );
          cachedSource.setAttribute(
            'amp-orig-src',
            'https://example.com/video.mp4'
          );
          video.appendChild(cachedSource);

          expect(AmpVideo.prerenderAllowed(video)).to.be.true;
          expect(AmpVideo.previewAllowed(video)).to.be.true;
        });
      });

      describe('should prerender poster image', () => {
        it('with just cached src', () => {
          video.setAttribute('src', 'https://example.com/video.mp4');
          video.setAttribute('poster', 'https://example.com/poster.jpg');
          expect(AmpVideo.prerenderAllowed(video)).to.be.true;
          expect(AmpVideo.previewAllowed(video)).to.be.true;
        });
      });

      describe('should prerender remote video cache', () => {
        it('with cache="*"', () => {
          video.setAttribute('src', 'https://example.com/video.mp4');
          video.setAttribute('cache', 'google');
          expect(AmpVideo.prerenderAllowed(video)).to.be.true;
          expect(AmpVideo.previewAllowed(video)).to.be.true;
        });
      });

      describe('should preconnect to all sources', () => {
        let preconnect;

        beforeEach(() => {
          preconnect = {url: env.sandbox.stub()};
          env.sandbox.stub(Services, 'preconnectFor').returns(preconnect);
        });

        it('no cached source', async () => {
          await getVideo(
            {
              src: 'https://example.com/video.mp4',
              poster: 'https://example.com/poster.jpg',
              width: 160,
              height: 90,
            },
            null,
            null,
            /* opt_noLayout */ true
          );

          expect(preconnect.url).to.have.been.calledOnce;
          expect(preconnect.url.getCall(0)).to.have.been.calledWith(
            env.sandbox.match.object, // AmpDoc
            'https://example.com/video.mp4'
          );
        });

        it('cached source', async () => {
          const cachedSource = doc.createElement('source');
          cachedSource.setAttribute(
            'src',
            'https://example-com.cdn.ampproject.org/m/s/video.mp4'
          );
          cachedSource.setAttribute(
            'amp-orig-src',
            'https://example.com/video.mp4'
          );

          await getVideo(
            {
              poster: 'https://example.com/poster.jpg',
              width: 160,
              height: 90,
            },
            [cachedSource],
            null,
            /* opt_noLayout */ true
          );

          expect(preconnect.url).to.have.been.calledTwice;
          expect(preconnect.url.getCall(0)).to.have.been.calledWith(
            env.sandbox.match.object, // AmpDoc
            'https://example-com.cdn.ampproject.org/m/s/video.mp4'
          );
          expect(preconnect.url.getCall(1)).to.have.been.calledWith(
            env.sandbox.match.object, // AmpDoc
            'https://example.com/video.mp4'
          );
        });

        it('mixed sources', async () => {
          const source = doc.createElement('source');
          source.setAttribute('src', 'https://example.com/video.mp4');

          const cachedSource = doc.createElement('source');
          cachedSource.setAttribute(
            'src',
            'https://example-com.cdn.ampproject.org/m/s/video.mp4'
          );
          cachedSource.setAttribute(
            'amp-orig-src',
            'https://example.com/video.mp4'
          );
          await getVideo(
            {
              poster: 'https://example.com/poster.jpg',
              width: 160,
              height: 90,
            },
            [source, cachedSource],
            null,
            /* opt_noLayout */ true
          );
          expect(preconnect.url).to.have.been.calledThrice;
          expect(preconnect.url.getCall(0)).to.have.been.calledWith(
            env.sandbox.match.object, // AmpDoc
            'https://example.com/video.mp4'
          );
          expect(preconnect.url.getCall(1)).to.have.been.calledWith(
            env.sandbox.match.object, // AmpDoc
            'https://example-com.cdn.ampproject.org/m/s/video.mp4'
          );
          expect(preconnect.url.getCall(2)).to.have.been.calledWith(
            env.sandbox.match.object, // AmpDoc
            'https://example.com/video.mp4'
          );
        });
      });

      describe.skip('before visible', () => {
        it('should move cached src to source during prerender', async () => {
          const v = await getVideo({
            'src': 'https://example-com.cdn.ampproject.org/m/s/video.mp4',
            'type': 'video/mp4',
            'amp-orig-src': 'https://example.com/video.mp4',
          });
          video = v.querySelector('video');
          expect(video.hasAttribute('src')).to.be.false;
          // also make sure removed from amp-video since Stories media-pool
          // may copy it back from amp-video.
          expect(v.hasAttribute('src')).to.be.false;
          expect(v.hasAttribute('type')).to.be.false;
          const sources = video.querySelectorAll('source');
          expect(sources.length).to.equal(1);
          const cachedSource = sources[0];
          expect(cachedSource.getAttribute('src')).to.equal(
            'https://example-com.cdn.ampproject.org/m/s/video.mp4'
          );
          expect(cachedSource.getAttribute('type')).to.equal('video/mp4');
        });

        it('should add cached sources to video', async () => {
          const s1 = doc.createElement('source');
          s1.setAttribute(
            'src',
            'https://example-com.cdn.ampproject.org/m/s/video1.mp4'
          );
          s1.setAttribute('amp-orig-src', 'https://example.com/video1.mp4');
          s1.setAttribute('type', 'video/mp4');

          const s2 = doc.createElement('source');
          s2.setAttribute(
            'src',
            'https://example-com.cdn.ampproject.org/m/s/video2.mp4'
          );
          s2.setAttribute('amp-orig-src', 'https://example.com/video2.mp4');

          const v = await getVideo({}, [s1, s2]);
          video = v.querySelector('video');
          expect(video.hasAttribute('src')).to.be.false;
          const sources = video.querySelectorAll('source');
          expect(sources.length).to.equal(2);
          expect(sources[0].getAttribute('src')).to.equal(
            'https://example-com.cdn.ampproject.org/m/s/video1.mp4'
          );
          expect(sources[0].getAttribute('type')).to.equal('video/mp4');
          expect(sources[1].getAttribute('src')).to.equal(
            'https://example-com.cdn.ampproject.org/m/s/video2.mp4'
          );
          expect(sources[1].getAttribute('type')).to.be.null;
          expect(sources[0]).to.equal(s1);
          expect(sources[1]).to.equal(s2);
        });

        it('should NOT add non-cached sources to video', async () => {
          const cached = doc.createElement('source');
          cached.setAttribute(
            'src',
            'https://example-com.cdn.ampproject.org/m/s/video.mp4'
          );
          cached.setAttribute('amp-orig-src', 'https://example.com/video1.mp4');

          const noncached = doc.createElement('source');
          noncached.setAttribute('src', 'video.mp4');

          const v = await getVideo({}, [cached, noncached]);
          video = v.querySelector('video');
          expect(video.hasAttribute('src')).to.be.false;
          const sources = video.querySelectorAll('source');
          expect(sources.length).to.equal(1);
          expect(sources[0].getAttribute('src')).to.equal(
            'https://example-com.cdn.ampproject.org/m/s/video.mp4'
          );
          expect(sources[0]).to.equal(cached);
        });

        it('preload should be set to auto if not specified', async () => {
          const v = await getVideo(
            {
              'src': 'https://example-com.cdn.ampproject.org/m/s/video.mp4',
              'amp-orig-src': 'https://example.com/video.mp4',
            },
            null
          );
          video = v.querySelector('video');
          expect(video.getAttribute('preload')).to.equal('auto');
        });

        it('preload should not be overwritten if specified', async () => {
          const v = await getVideo(
            {
              'src': 'https://example-com.cdn.ampproject.org/m/s/video.mp4',
              'amp-orig-src': 'https://example.com/video.mp4',
              'preload': 'none',
            },
            null
          );
          video = v.querySelector('video');
          expect(video.getAttribute('preload')).to.equal('none');
        });
      });

      describe.skip('after visible', () => {
        it('should add original source after cache one - single src', async () => {
          const v = await getVideo({
            'src': 'https://example-com.cdn.ampproject.org/m/s/video.mp4',
            'amp-orig-src': 'https://example.com/video.mp4',
          });
          const ampVideoElement = v;
          video = v.querySelector('video');
          makeVisible();
          visiblePromise;
          expect(video.hasAttribute('src')).to.be.false;
          // also make sure removed from amp-video since Stories media-pool
          // may copy it back from amp-video.
          expect(ampVideoElement.hasAttribute('src')).to.be.false;
          expect(ampVideoElement.hasAttribute('type')).to.be.false;
          const sources = video.querySelectorAll('source');
          expect(sources.length).to.equal(2);
          expect(sources[0].getAttribute('src')).to.equal(
            'https://example-com.cdn.ampproject.org/m/s/video.mp4'
          );
          expect(sources[1].getAttribute('src')).to.equal(
            'https://example.com/video.mp4'
          );
        });

        it('should add original source after cache one - multiple source', async () => {
          const s1 = doc.createElement('source');
          s1.setAttribute(
            'src',
            'https://example-com.cdn.ampproject.org/m/s/video1.mp4'
          );
          s1.setAttribute('amp-orig-src', 'https://example.com/video1.mp4');

          const s2 = doc.createElement('source');
          s2.setAttribute(
            'src',
            'https://example-com.cdn.ampproject.org/m/s/video2.mp4'
          );
          s2.setAttribute('amp-orig-src', 'https://example.com/video2.mp4');

          const v = await getVideo({}, [s1, s2]);
          video = v.querySelector('video');
          makeVisible();
          visiblePromise;
          expect(video.hasAttribute('src')).to.be.false;
          const sources = video.querySelectorAll('source');
          expect(sources.length).to.equal(4);
          expect(sources[0].getAttribute('src')).to.equal(
            'https://example-com.cdn.ampproject.org/m/s/video1.mp4'
          );
          expect(sources[1].getAttribute('src')).to.equal(
            'https://example.com/video1.mp4'
          );
          expect(sources[2].getAttribute('src')).to.equal(
            'https://example-com.cdn.ampproject.org/m/s/video2.mp4'
          );
          expect(sources[3].getAttribute('src')).to.equal(
            'https://example.com/video2.mp4'
          );
        });
      });

      describe('isCachedByCDN', () => {
        it('must have amp-orig-src attribute', () => {
          return new Promise((resolve) => {
            getVideo(
              {
                'src': 'https://example-com.cdn.ampproject.org/m/s/video.mp4',
                width: 160,
                height: 90,
              },
              null,
              (element) => {
                expect(isCachedByCdn(element)).to.be.false;
                resolve();
              }
            );
          });
        });

        it('must be CDN url', () => {
          return new Promise((resolve) => {
            getVideo(
              {
                'src':
                  'https://example-com.cdn.FAKEampproject.org/m/s/video.mp4',
                'amp-orig-src': 'https://example.com/video.mp4',
                width: 160,
                height: 90,
              },
              null,
              (element) => {
                expect(isCachedByCdn(element)).to.be.false;
                resolve();
              }
            );
          });
        });
      });
    });

    describe('seekTo', () => {
      it('changes `currentTime`', () =>
        new Promise((resolve) => {
          getVideo(
            {
              'src': 'https://example-com.cdn.FAKEampproject.org/m/s/video.mp4',
              width: 160,
              height: 90,
            },
            /* children */ null,
            (element, impl) => {
              const {video_} = impl;

              expect(video_.currentTime).to.equal(0);

              [20, 100, 0, 50, 22].forEach((timeSeconds) => {
                impl.seekTo(timeSeconds);
                expect(video_.currentTime).to.equal(timeSeconds);
              });

              resolve();
            }
          );
        }));
    });

    describe('bitrate manager', () => {
      it('should manage bitrate of replaced video from mediapool', async () => {
        toggleExperiment(env.win, 'flexible-bitrate', true);
        const v = await getVideo(
          {
            src: 'video.mp4',
            width: 160,
            height: 90,
          },
          null,
          null
        );
        const impl = await v.getImpl(false);
        impl.hasBitrateSources_ = true;
        impl.resetOnDomChange();

        expect(impl.video_.changedSources).to.not.be.undefined;
      });
    });
  }
);
