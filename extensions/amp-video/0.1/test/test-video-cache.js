import {createElementWithAttributes} from '#core/dom';
import * as Preact from '#core/dom/jsx';

import {toggleExperiment} from '#experiments';

import {Services} from '#service';
import {installPerformanceService} from '#service/performance-impl';
import {xhrServiceForTesting} from '#service/xhr-impl';

import {AmpCacheUrlService} from '../../../amp-cache-url/0.1/amp-cache-url';
import {fetchCachedSources} from '../video-cache';

describes.realWin('amp-video cached-sources', {amp: true}, (env) => {
  let cacheUrlService;
  let extensionsService;
  let xhrService;

  beforeEach(() => {
    xhrService = xhrServiceForTesting(env.win);
    env.sandbox.stub(Services, 'xhrFor').returns(xhrService);

    extensionsService = {
      installExtensionForDoc: env.sandbox.spy(() => Promise.resolve()),
    };
    env.sandbox.stub(Services, 'extensionsFor').returns(extensionsService);

    cacheUrlService = new AmpCacheUrlService();
    env.sandbox
      .stub(Services, 'cacheUrlServicePromiseForDoc')
      .resolves(cacheUrlService);
    env.sandbox.stub(Services, 'documentInfoForDoc').returns({
      sourceUrl: 'https://example.com',
      canonicalUrl: 'https://canonical.com',
    });

    installPerformanceService(env.win);
  });

  describe('select sources', () => {
    it('should select the source if there is only one source', async () => {
      const videoEl = createVideo([{src: 'video1.mp4'}]);
      const xhrSpy = env.sandbox.spy(xhrService, 'fetch');

      await fetchCachedSources(videoEl, env.ampdoc);

      expect(xhrSpy).to.have.been.calledWith(
        'https://example-com.cdn.ampproject.org/mbv/s/example.com/video1.mp4?amp_video_host_url=https%3A%2F%2Fcanonical.com&amp_video_require_acao_header=1'
      );
    });

    it('should select the first source if there are similar sources', async () => {
      const videoEl = createVideo([{src: 'video1.mp4'}, {src: 'video2.mp4'}]);
      const xhrSpy = env.sandbox.spy(xhrService, 'fetch');

      await fetchCachedSources(videoEl, env.ampdoc);

      expect(xhrSpy).to.have.been.calledWith(
        'https://example-com.cdn.ampproject.org/mbv/s/example.com/video1.mp4?amp_video_host_url=https%3A%2F%2Fcanonical.com&amp_video_require_acao_header=1'
      );
    });

    it('should select the mp4 source if there are many sources', async () => {
      const videoEl = createVideo([
        {src: 'video1.mp4'},
        {src: 'video2.mp4', type: 'video/mp4'},
      ]);
      const xhrSpy = env.sandbox.spy(xhrService, 'fetch');

      await fetchCachedSources(videoEl, env.ampdoc);

      expect(xhrSpy).to.have.been.calledWith(
        'https://example-com.cdn.ampproject.org/mbv/s/example.com/video2.mp4?amp_video_host_url=https%3A%2F%2Fcanonical.com&amp_video_require_acao_header=1'
      );
    });

    it('should select the video[src] and never the sources children', async () => {
      const videoEl = createVideo([
        {src: 'video2.mp4'},
        {src: 'video3.mp4', type: 'video/mp4'},
      ]);
      videoEl.setAttribute('src', 'video1.mp4');
      const xhrSpy = env.sandbox.spy(xhrService, 'fetch');

      await fetchCachedSources(videoEl, env.ampdoc);

      expect(xhrSpy).to.have.been.calledWith(
        'https://example-com.cdn.ampproject.org/mbv/s/example.com/video1.mp4?amp_video_host_url=https%3A%2F%2Fcanonical.com&amp_video_require_acao_header=1'
      );
    });
  });

  describe('url forming', () => {
    it('should send the request to the correct address if the video has an absolute url', async () => {
      const videoEl = createVideo([{'src': 'https://website.com/video.html'}]);
      const xhrSpy = env.sandbox.spy(xhrService, 'fetch');

      await fetchCachedSources(videoEl, env.ampdoc);

      expect(xhrSpy).to.have.been.calledWith(
        'https://website-com.cdn.ampproject.org/mbv/s/website.com/video.html?amp_video_host_url=https%3A%2F%2Fcanonical.com&amp_video_require_acao_header=1'
      );
    });

    it('should always add the ACAO header', async () => {
      const videoEl = createVideo([{'src': 'https://website.com/video.html'}]);
      const xhrSpy = env.sandbox.spy(xhrService, 'fetch');

      await fetchCachedSources(videoEl, env.ampdoc);

      expect(xhrSpy).to.have.been.calledWith(
        'https://website-com.cdn.ampproject.org/mbv/s/website.com/video.html?amp_video_host_url=https%3A%2F%2Fcanonical.com&amp_video_require_acao_header=1'
      );
    });

    it('should send the request to the correct address if the video has a relative url', async () => {
      const videoEl = createVideo([{'src': 'video.html'}]);
      const xhrSpy = env.sandbox.spy(xhrService, 'fetch');

      await fetchCachedSources(videoEl, env.ampdoc);

      expect(xhrSpy).to.have.been.calledWith(
        'https://example-com.cdn.ampproject.org/mbv/s/example.com/video.html?amp_video_host_url=https%3A%2F%2Fcanonical.com&amp_video_require_acao_header=1'
      );
    });

    it('should send the request to the correct address if the video has a .gif extension', async () => {
      const videoEl = createVideo([{'src': 'https://website.com/video.gif'}]);
      const xhrSpy = env.sandbox.spy(xhrService, 'fetch');

      await fetchCachedSources(videoEl, env.ampdoc);

      expect(xhrSpy).to.have.been.calledWith(
        'https://website-com.cdn.ampproject.org/mbv/s/website.com/video.gif?amp_video_host_url=https%3A%2F%2Fcanonical.com&amp_video_require_acao_header=1'
      );
    });
  });

  describe('add sources', () => {
    it('should set the correct attributes on the source added', async () => {
      env.sandbox.stub(xhrService, 'fetch').resolves({
        json: () =>
          Promise.resolve({
            sources: [
              {
                'url': 'video1.mp4',
                'codec': 'h264',
                'bitrate_kbps': 700,
                type: 'video/mp4',
              },
            ],
          }),
      });

      const videoEl = createVideo([{src: 'video.mp4'}]);
      await fetchCachedSources(videoEl, env.ampdoc);

      const addedSource = videoEl.querySelector('source');
      expect(addedSource.getAttribute('src')).to.equal('video1.mp4');
      expect(addedSource.getAttribute('data-bitrate')).to.equal('700');
      expect(addedSource.getAttribute('type')).to.equal('video/mp4');
    });

    it('should add the sources sorted by codec priority', async () => {
      env.sandbox.stub(xhrService, 'fetch').resolves({
        json: () =>
          Promise.resolve({
            sources: [
              {
                'url': 'video1.mp4',
                'codec': 'vp09.00.30.08',
                'bitrate_kbps': 700,
                type: 'video/mp4',
              },
              {
                'url': 'video2.mp4',
                'codec': 'unknown',
                'bitrate_kbps': 2000,
                type: 'video/mp4',
              },
              {
                'url': 'video3.mp4',
                'codec': 'h264',
                'bitrate_kbps': 1500,
                type: 'video/mp4',
              },
            ],
          }),
      });

      const videoEl = createVideo([{src: 'video.mp4'}]);

      await fetchCachedSources(videoEl, env.ampdoc);

      const addedSources = videoEl.querySelectorAll('source');

      const srcType0 = addedSources[0].getAttribute('type');
      const srcType1 = addedSources[1].getAttribute('type');
      const srcType2 = addedSources[2].getAttribute('type');
      expect(srcType0).to.equal('video/mp4; codecs=vp09.00.30.08');
      expect(srcType1).to.equal('video/mp4');
      expect(srcType2).to.equal('video/mp4; codecs=unknown');
    });

    it('should add the sources sorted by bitrate, for any subset of sources whose codecs have equivalent priority', async () => {
      env.sandbox.stub(xhrService, 'fetch').resolves({
        json: () =>
          Promise.resolve({
            sources: [
              {
                'url': 'video1.mp4',
                'codec': 'vp09.00.30.08',
                'bitrate_kbps': 700,
                type: 'video/mp4',
              },
              {
                'url': 'video2.mp4',
                'codec': 'vp09.00.30.08',
                'bitrate_kbps': 2000,
                type: 'video/mp4',
              },
              {
                'url': 'video3.mp4',
                'codec': 'vp09.00.30.08',
                'bitrate_kbps': 1500,
                type: 'video/mp4',
              },
            ],
          }),
      });

      const videoEl = createVideo([{src: 'video.mp4'}]);

      await fetchCachedSources(videoEl, env.ampdoc);

      const addedSources = videoEl.querySelectorAll('source');
      expect(addedSources[0].getAttribute('data-bitrate')).to.equal('2000');
      expect(addedSources[1].getAttribute('data-bitrate')).to.equal('1500');
      expect(addedSources[2].getAttribute('data-bitrate')).to.equal('700');
    });

    it('should add the sources sorted first by codec priority, and then by bitrate', async () => {
      env.sandbox.stub(xhrService, 'fetch').resolves({
        json: () =>
          Promise.resolve({
            sources: [
              {
                'url': 'video1.mp4',
                'codec': 'h264',
                'bitrate_kbps': 2000,
                type: 'video/mp4',
              },
              {
                'url': 'video2.mp4',
                'codec': 'vp09.00.30.08',
                'bitrate_kbps': 1000,
                type: 'video/mp4',
              },
              {
                'url': 'video3.mp4',
                'codec': 'vp09.00.30.08',
                'bitrate_kbps': 2000,
                type: 'video/mp4',
              },
              {
                'url': 'video4.mp4',
                'codec': 'h264',
                'bitrate_kbps': 3000,
                type: 'video/mp4',
              },
            ],
          }),
      });

      const videoEl = createVideo([{src: 'video.mp4'}]);

      await fetchCachedSources(videoEl, env.ampdoc);

      const addedSources = videoEl.querySelectorAll('source');
      const srcType0 = addedSources[0].getAttribute('type');
      const srcType1 = addedSources[1].getAttribute('type');
      const srcType2 = addedSources[2].getAttribute('type');
      const srcType3 = addedSources[3].getAttribute('type');

      expect(addedSources[0].getAttribute('data-bitrate')).to.equal('2000');
      expect(srcType0).to.equal('video/mp4; codecs=vp09.00.30.08');

      expect(addedSources[1].getAttribute('data-bitrate')).to.equal('1000');
      expect(srcType1).to.equal('video/mp4; codecs=vp09.00.30.08');

      expect(addedSources[2].getAttribute('data-bitrate')).to.equal('3000');
      expect(srcType2).to.equal('video/mp4');

      expect(addedSources[3].getAttribute('data-bitrate')).to.equal('2000');
      expect(srcType3).to.equal('video/mp4');
    });

    it('should add video[src] as the last fallback source', async () => {
      env.sandbox.stub(xhrService, 'fetch').resolves({
        json: () =>
          Promise.resolve({
            sources: [
              {
                'url': 'video1.mp4',
                'codec': 'h264',
                'bitrate_kbps': 700,
                type: 'video/mp4',
              },
              {
                'url': 'video2.mp4',
                'codec': 'h264',
                'bitrate_kbps': 2000,
                type: 'video/mp4',
              },
              {
                'url': 'video3.mp4',
                'codec': 'h264',
                'bitrate_kbps': 1500,
                type: 'video/mp4',
              },
            ],
          }),
      });

      const videoEl = createVideo([{src: 'video.mp4'}]);
      videoEl.setAttribute('src', 'video1.mp4');
      videoEl.setAttribute('type', 'video/mp4');

      await fetchCachedSources(videoEl, env.ampdoc);

      const lastSource = videoEl.querySelector('source:last-of-type');
      expect(lastSource.getAttribute('src')).to.equal('video1.mp4');
      expect(lastSource.getAttribute('type')).to.equal('video/mp4');
    });

    it('should clear the unused sources when video[src]', async () => {
      env.sandbox.stub(xhrService, 'fetch').resolves({
        json: () =>
          Promise.resolve({
            sources: [
              {
                'url': 'video1.mp4',
                'codec': 'h264',
                'bitrate_kbps': 700,
                type: 'video/mp4',
              },
              {
                'url': 'video2.mp4',
                'codec': 'h264',
                'bitrate_kbps': 2000,
                type: 'video/mp4',
              },
              {
                'url': 'video3.mp4',
                'codec': 'h264',
                'bitrate_kbps': 1500,
                type: 'video/mp4',
              },
            ],
          }),
      });

      const videoEl = createVideo([
        {src: 'video.mp4'},
        {src: 'video.mp4'},
        {src: 'video.mp4'},
        {src: 'video.mp4'},
        {src: 'video.mp4'},
      ]);
      videoEl.setAttribute('src', 'video1.mp4');

      await fetchCachedSources(videoEl, env.ampdoc);

      const addedSources = videoEl.querySelectorAll('source');
      expect(addedSources).to.have.lengthOf(4); // 3 from cache + 1 fallback.
    });
  });

  describe('end to end', () => {
    it('should create the sources from the request with the correct attributes', async () => {
      env.sandbox.stub(xhrService, 'fetch').resolves({
        json: () =>
          Promise.resolve({
            sources: [
              {
                'url': 'video.mp4',
                'codec': 'h264',
                'bitrate_kbps': 700,
                'type': 'video/mp4',
              },
            ],
          }),
      });

      const videoEl = createVideo([{src: 'video.mp4'}]);

      await fetchCachedSources(videoEl, env.ampdoc);

      expect(videoEl.querySelector('source[data-bitrate]')).to.not.be.null;
    });

    it('should set the crossorigin attribute to the video', async () => {
      const videoEl = createVideo([{'src': 'video.html'}]);

      await fetchCachedSources(videoEl, env.ampdoc);

      expect(videoEl.hasAttribute('crossorigin')).to.be.true;
    });

    it('should set an attribute on cached video sources', async () => {
      env.sandbox.stub(xhrService, 'fetch').resolves({
        json: () =>
          Promise.resolve({
            sources: [
              {
                'url': 'video.mp4',
                'codec': 'h264',
                'bitrate_kbps': 700,
                'type': 'video/mp4',
              },
            ],
          }),
      });

      const videoEl = createVideo([{src: 'video.mp4'}]);

      await fetchCachedSources(videoEl, env.ampdoc);

      const source = videoEl.querySelector('source[data-bitrate]');
      expect(source).to.exist;
      expect(source).to.have.attribute('i-amphtml-video-cached-source');
    });

    it('should not set an attribute on non cached video sources', async () => {
      env.sandbox.stub(xhrService, 'fetch').resolves({
        json: () =>
          Promise.resolve({
            sources: [
              {
                'url': 'video.mp4',
                'codec': 'h264',
                'bitrate_kbps': 700,
                'type': 'video/mp4',
              },
            ],
          }),
      });

      const videoEl = createVideo([{src: 'video.mp4'}]);

      await fetchCachedSources(videoEl, env.ampdoc);

      const source = videoEl.querySelector('source:not(source[data-bitrate])');
      expect(source).to.exist;
      expect(source).to.not.have.attribute('i-amphtml-video-cached-source');
    });
  });

  describe('has_audio field', async () => {
    beforeEach(() => {
      toggleExperiment(env.win, 'story-video-cache-apply-audio', true);
    });

    afterEach(() => {
      toggleExperiment(env.win, 'story-video-cache-apply-audio', false);
    });
    it('should set noaudio if the cache responds with has_audio: false', async () => {
      env.sandbox.stub(xhrService, 'fetch').resolves({
        json: () =>
          Promise.resolve({
            'has_audio': false,
            'sources': [
              {'url': 'video.mp4', 'bitrate_kbps': 700, 'type': 'video/mp4'},
            ],
          }),
      });
      const videoEl = createVideo([{src: 'video.mp4'}]);
      await fetchCachedSources(videoEl, env.ampdoc);

      expect(videoEl).to.have.attribute('noaudio');
    });

    it('should not set noaudio if the cache responds with has_audio: true', async () => {
      env.sandbox.stub(xhrService, 'fetch').resolves({
        json: () =>
          Promise.resolve({
            'has_audio': true,
            'sources': [
              {'url': 'video.mp4', 'bitrate_kbps': 700, 'type': 'video/mp4'},
            ],
          }),
      });
      const videoEl = createVideo([{src: 'video.mp4'}]);
      await fetchCachedSources(videoEl, env.ampdoc);

      expect(videoEl).to.not.have.attribute('noaudio');
    });

    it('should not set noaudio if the cache responds without has_audio', async () => {
      env.sandbox.stub(xhrService, 'fetch').resolves({
        json: () =>
          Promise.resolve({
            'sources': [
              {'url': 'video.mp4', 'bitrate_kbps': 700, 'type': 'video/mp4'},
            ],
          }),
      });
      const videoEl = createVideo([{src: 'video.mp4'}]);
      await fetchCachedSources(videoEl, env.ampdoc);

      expect(videoEl).to.not.have.attribute('noaudio');
    });
  });

  function stubSourcesWithCapionsRequest() {
    env.sandbox.stub(xhrService, 'fetch').resolves({
      json: () =>
        Promise.resolve({
          'captions': {
            'src': 'captions_src_response.vtt',
            'srclang': 'en-us',
          },
          'sources': [
            {'url': 'video.mp4', 'bitrate_kbps': 700, 'type': 'video/mp4'},
          ],
        }),
    });
  }
  describe('captions field', async () => {
    it('should append track element if the cache responds with captions', async () => {
      stubSourcesWithCapionsRequest();
      const videoEl = createVideo([{src: 'video.mp4'}]);
      await fetchCachedSources(videoEl, env.ampdoc);

      const trackEl = videoEl.querySelector('track');
      expect(trackEl).to.exist;
    });
    it('should append story-captions element if the cache responds with captions', async () => {
      stubSourcesWithCapionsRequest();
      const videoEl = createVideo([{src: 'video.mp4'}]);
      await fetchCachedSources(videoEl, env.ampdoc);

      const captionsEl = videoEl.querySelector('amp-story-captions');
      expect(captionsEl).to.exist;
    });
    it('should not append track element if video already has a track child', async () => {
      stubSourcesWithCapionsRequest();
      const videoEl = createVideo([{src: 'video.mp4'}]);
      videoEl.appendChild(<track />);
      await fetchCachedSources(videoEl, env.ampdoc);

      const trackEl = videoEl.querySelector(
        'track[src="captions_src_response.vtt"]'
      );
      expect(trackEl).to.not.exist;
    });
    it('should not append track element if captions does not exist', async () => {
      env.sandbox.stub(xhrService, 'fetch').resolves({
        json: () =>
          Promise.resolve({
            'sources': [
              {'url': 'video.mp4', 'bitrate_kbps': 700, 'type': 'video/mp4'},
            ],
          }),
      });
      const videoEl = createVideo([{src: 'video.mp4'}]);
      await fetchCachedSources(videoEl, env.ampdoc);

      const trackEl = videoEl.querySelector('track');
      expect(trackEl).to.not.exist;
    });
  });

  describe('web stories: inlined video', async () => {
    it('should use the inlined source for the first video in the story instead of sending an XHR request', async () => {
      // Set up an inlined source response for the first video in the story
      const storyEl = createStoryForInlineVideoTesting();
      env.win.document.body.appendChild(storyEl);
      setUpInlinedVideoResponse();

      const xhrSpy = env.sandbox.spy(xhrService, 'fetch');

      // Fetch the sources for the first video in the story
      const videoEl = storyEl.querySelectorAll('amp-video')[0];
      await fetchCachedSources(videoEl, env.ampdoc);

      expect(xhrSpy).to.have.not.been.called;
      const inlinedSources = videoEl.querySelectorAll(
        'source[src="inlined_video_response.mp4"]'
      );
      expect(inlinedSources).to.have.lengthOf(1);
    });

    it('should send an XHR request for any video that is not the very first one within the story', async () => {
      // Set up an inlined source response for the first video in the story
      const storyEl = createStoryForInlineVideoTesting();
      env.win.document.body.appendChild(storyEl);
      setUpInlinedVideoResponse();

      const xhrSpy = env.sandbox.spy(xhrService, 'fetch');

      // Fetch the sources for video #2: the 2nd video on the first story page
      const videoEl2 = storyEl.querySelectorAll('amp-video')[1];
      await fetchCachedSources(videoEl2, env.ampdoc);

      // Fetch the sources for video #3: the 1st video on the 2nd story page
      const videoEl3 = storyEl.querySelectorAll('amp-video')[2];
      await fetchCachedSources(videoEl3, env.ampdoc);

      expect(xhrSpy).to.have.been.calledWith(
        'https://example-com.cdn.ampproject.org/mbv/s/example.com/video2.mp4?amp_video_host_url=https%3A%2F%2Fcanonical.com&amp_video_require_acao_header=1'
      );
      expect(xhrSpy).to.have.been.calledWith(
        'https://example-com.cdn.ampproject.org/mbv/s/example.com/video3.mp4?amp_video_host_url=https%3A%2F%2Fcanonical.com&amp_video_require_acao_header=1'
      );
    });

    it('should send XHR request if inline config not provided', async () => {
      // Create story without setting an inlined source response
      const storyEl = createStoryForInlineVideoTesting();
      env.win.document.body.appendChild(storyEl);

      const xhrSpy = env.sandbox.spy(xhrService, 'fetch');

      // Fetch the sources for the first video in the story
      const videoEl = storyEl.querySelectorAll('amp-video')[0];
      await fetchCachedSources(videoEl, env.ampdoc);

      expect(xhrSpy).to.have.been.calledWith(
        'https://example-com.cdn.ampproject.org/mbv/s/example.com/video1.mp4?amp_video_host_url=https%3A%2F%2Fcanonical.com&amp_video_require_acao_header=1'
      );
    });

    it('should send XHR request if inlined video response fails to parse', async () => {
      // Set up an improperly configured response for the first video in the story
      const storyEl = createStoryForInlineVideoTesting();
      env.win.document.body.appendChild(storyEl);
      const scriptEl = createElementWithAttributes(env.win.document, 'script', {
        'id': 'amp-google-video-cache-response',
        'type': 'application/json',
      });
      scriptEl.textContent = '{"faulty": [{}]}';

      const xhrSpy = env.sandbox.spy(xhrService, 'fetch');

      // Fetch the sources for the first video in the story
      const videoEl = storyEl.querySelectorAll('amp-video')[0];
      await fetchCachedSources(videoEl, env.ampdoc);

      expect(xhrSpy).to.have.been.calledWith(
        'https://example-com.cdn.ampproject.org/mbv/s/example.com/video1.mp4?amp_video_host_url=https%3A%2F%2Fcanonical.com&amp_video_require_acao_header=1'
      );
    });
  });

  function createVideo(children) {
    const videoEl = createElementWithAttributes(env.win.document, 'amp-video', {
      'cache': 'google',
      'layout': 'fill',
    });
    children.forEach((childJson) => {
      const sourceEl = createElementWithAttributes(
        env.win.document,
        'source',
        childJson
      );
      videoEl.appendChild(sourceEl);
    });
    env.win.document.body.appendChild(videoEl);
    return videoEl;
  }

  function createStoryForInlineVideoTesting() {
    const storyEl = env.win.document.createElement('amp-story');
    const storyPageEl1 = env.win.document.createElement('amp-story-page');
    const storyPageEl2 = env.win.document.createElement('amp-story-page');
    storyEl.appendChild(storyPageEl1);
    storyEl.appendChild(storyPageEl2);

    // Place two videos on the first page. video #1 is nested more deeply than
    // video #2, but it should still be considered the first video on the page.
    const gridLayerEl = env.win.document.createElement('amp-story-grid-layer');
    const videoEl1 = createVideo([{src: 'video1.mp4'}]);
    gridLayerEl.appendChild(videoEl1);
    storyPageEl1.appendChild(gridLayerEl);

    // Place video #2 on the first page.
    const videoEl2 = createVideo([{src: 'video2.mp4'}]);
    storyPageEl1.appendChild(videoEl2);

    // Place video #3 on the second page.
    const videoEl3 = createVideo([{src: 'video3.mp4'}]);
    storyPageEl2.appendChild(videoEl3);

    return storyEl;
  }

  function setUpInlinedVideoResponse() {
    const scriptEl = createElementWithAttributes(env.win.document, 'script', {
      'id': 'amp-google-video-cache-response',
      'type': 'application/json',
    });
    scriptEl.textContent = `
      {
        "sources": [
          {
            "url": "inlined_video_response.mp4",
            "codec": "h264",
            "type": "video/mp4",
            "bitrate_kbps": 400
          }
        ],
        "has_audio": false
      }`;
    env.win.document.head.appendChild(scriptEl);
  }
});
