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

import {AmpCacheUrlService} from '../../../amp-cache-url/0.1/amp-cache-url';
import {Services} from '../../../../src/services';
import {createElementWithAttributes} from '../../../../src/dom';
import {createExtensionScript} from '../../../../src/service/extension-script';
import {fetchCachedSources} from '../video-cache';
import {xhrServiceForTesting} from '../../../../src/service/xhr-impl';

describes.realWin('amp-video cached-sources', {amp: true}, (env) => {
  let xhrService;
  let cacheUrlService;

  beforeEach(() => {
    xhrService = xhrServiceForTesting(env.win);
    env.sandbox.stub(Services, 'xhrFor').returns(xhrService);

    cacheUrlService = new AmpCacheUrlService();
    env.sandbox
      .stub(Services, 'cacheUrlServicePromiseForDoc')
      .resolves(cacheUrlService);
    env.win.document.head.appendChild(
      createExtensionScript(env.win, 'amp-cache-url', '0.1')
    );
    env.sandbox.stub(Services, 'documentInfoForDoc').returns({
      sourceUrl: 'https://example.com',
      canonicalUrl: 'https://canonical.com',
    });
  });

  describe('select sources', () => {
    it('should select the source if there is only one source', async () => {
      const videoEl = createVideo([{src: 'video1.mp4'}]);
      const xhrSpy = env.sandbox.spy(xhrService, 'fetch');

      await fetchCachedSources(videoEl, env.win);

      expect(xhrSpy).to.have.been.calledWith(
        'https://example-com.cdn.ampproject.org/mbv/s/example.com/video1.mp4?amp_video_host_url=https%3A%2F%2Fcanonical.com'
      );
    });

    it('should select the first source if there are similar sources', async () => {
      const videoEl = createVideo([{src: 'video1.mp4'}, {src: 'video2.mp4'}]);
      const xhrSpy = env.sandbox.spy(xhrService, 'fetch');

      await fetchCachedSources(videoEl, env.win);

      expect(xhrSpy).to.have.been.calledWith(
        'https://example-com.cdn.ampproject.org/mbv/s/example.com/video1.mp4?amp_video_host_url=https%3A%2F%2Fcanonical.com'
      );
    });

    it('should select the mp4 source if there are many sources', async () => {
      const videoEl = createVideo([
        {src: 'video1.mp4'},
        {src: 'video2.mp4', type: 'video/mp4'},
      ]);
      const xhrSpy = env.sandbox.spy(xhrService, 'fetch');

      await fetchCachedSources(videoEl, env.win);

      expect(xhrSpy).to.have.been.calledWith(
        'https://example-com.cdn.ampproject.org/mbv/s/example.com/video2.mp4?amp_video_host_url=https%3A%2F%2Fcanonical.com'
      );
    });

    it('should select the video[src] and never the sources children', async () => {
      const videoEl = createVideo([
        {src: 'video2.mp4'},
        {src: 'video3.mp4', type: 'video/mp4'},
      ]);
      videoEl.setAttribute('src', 'video1.mp4');
      const xhrSpy = env.sandbox.spy(xhrService, 'fetch');

      await fetchCachedSources(videoEl, env.win);

      expect(xhrSpy).to.have.been.calledWith(
        'https://example-com.cdn.ampproject.org/mbv/s/example.com/video1.mp4?amp_video_host_url=https%3A%2F%2Fcanonical.com'
      );
    });
  });

  describe('url forming', () => {
    it('should send the request to the correct address if the video has an absolute url', async () => {
      const videoEl = createVideo([{'src': 'https://website.com/video.html'}]);
      const xhrSpy = env.sandbox.spy(xhrService, 'fetch');

      await fetchCachedSources(videoEl, env.win);

      expect(xhrSpy).to.have.been.calledWith(
        'https://website-com.cdn.ampproject.org/mbv/s/website.com/video.html?amp_video_host_url=https%3A%2F%2Fcanonical.com'
      );
    });

    it('should send the request to the correct address if the video has a relative url', async () => {
      const videoEl = createVideo([{'src': 'video.html'}]);
      const xhrSpy = env.sandbox.spy(xhrService, 'fetch');

      await fetchCachedSources(videoEl, env.win);

      expect(xhrSpy).to.have.been.calledWith(
        'https://example-com.cdn.ampproject.org/mbv/s/example.com/video.html?amp_video_host_url=https%3A%2F%2Fcanonical.com'
      );
    });
  });

  describe('add sources', () => {
    it('should set the correct attributes on the source added', async () => {
      env.sandbox.stub(xhrService, 'fetch').resolves({
        json: () =>
          Promise.resolve({
            sources: [
              {'url': 'video1.mp4', 'bitrate_kbps': 700, type: 'video/mp4'},
            ],
          }),
      });

      const videoEl = createVideo([{src: 'video.mp4'}]);
      await fetchCachedSources(videoEl, env.win);

      const addedSource = videoEl.querySelector('source');
      expect(addedSource.getAttribute('src')).to.equal('video1.mp4');
      expect(addedSource.getAttribute('data-bitrate')).to.equal('700');
      expect(addedSource.getAttribute('type')).to.equal('video/mp4');
    });

    it('should add the sources sorted by bitrate', async () => {
      env.sandbox.stub(xhrService, 'fetch').resolves({
        json: () =>
          Promise.resolve({
            sources: [
              {'url': 'video1.mp4', 'bitrate_kbps': 700, type: 'video/mp4'},
              {'url': 'video2.mp4', 'bitrate_kbps': 2000, type: 'video/mp4'},
              {'url': 'video3.mp4', 'bitrate_kbps': 1500, type: 'video/mp4'},
            ],
          }),
      });

      const videoEl = createVideo([{src: 'video.mp4'}]);

      await fetchCachedSources(videoEl, env.win);

      const addedSources = videoEl.querySelectorAll('source');
      expect(addedSources[0].getAttribute('data-bitrate')).to.equal('2000');
      expect(addedSources[1].getAttribute('data-bitrate')).to.equal('1500');
      expect(addedSources[2].getAttribute('data-bitrate')).to.equal('700');
    });

    it('should add video[src] as the last fallback source', async () => {
      env.sandbox.stub(xhrService, 'fetch').resolves({
        json: () =>
          Promise.resolve({
            sources: [
              {'url': 'video1.mp4', 'bitrate_kbps': 700, type: 'video/mp4'},
              {'url': 'video2.mp4', 'bitrate_kbps': 2000, type: 'video/mp4'},
              {'url': 'video3.mp4', 'bitrate_kbps': 1500, type: 'video/mp4'},
            ],
          }),
      });

      const videoEl = createVideo([{src: 'video.mp4'}]);
      videoEl.setAttribute('src', 'video1.mp4');
      videoEl.setAttribute('type', 'video/mp4');

      await fetchCachedSources(videoEl, env.win);

      const lastSource = videoEl.querySelector('source:last-of-type');
      expect(lastSource.getAttribute('src')).to.equal('video1.mp4');
      expect(lastSource.getAttribute('type')).to.equal('video/mp4');
    });

    it('should clear the unused sources when video[src]', async () => {
      env.sandbox.stub(xhrService, 'fetch').resolves({
        json: () =>
          Promise.resolve({
            sources: [
              {'url': 'video1.mp4', 'bitrate_kbps': 700, type: 'video/mp4'},
              {'url': 'video2.mp4', 'bitrate_kbps': 2000, type: 'video/mp4'},
              {'url': 'video3.mp4', 'bitrate_kbps': 1500, type: 'video/mp4'},
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

      await fetchCachedSources(videoEl, env.win);

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
              {'url': 'video.mp4', 'bitrate_kbps': 700, 'type': 'video/mp4'},
            ],
          }),
      });

      const videoEl = createVideo([{src: 'video.mp4'}]);

      await fetchCachedSources(videoEl, env.win);

      expect(videoEl.querySelector('source[data-bitrate]')).to.not.be.null;
    });
    it('should not create the sources if there is amp-orig-src attribute', async () => {
      const videoEl = createVideo([{'src': 'video.mp4', 'amp-orig-src': ''}]);
      await fetchCachedSources(videoEl, env.win);

      expect(videoEl.querySelector('source[data-bitrate]')).to.be.null;
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
});
