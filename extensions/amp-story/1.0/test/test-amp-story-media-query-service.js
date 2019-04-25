/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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

import {AmpStoryMediaQueryService} from '../amp-story-media-query-service';
import {poll} from '../../../../testing/iframe';

describes.realWin('amp-story-media-query-service', {amp: true}, env => {
  let mediaQueryService;
  let storyEl;
  let styleEl;
  let win;

  function setMatcherSize(width, height) {
    styleEl.textContent = `
        .i-amphtml-story-media-query-matcher {
          position: absolute;
          height: ${height}px;
          width: ${width}px;
          border: none;
        }`;
  }

  function waitForClassName(element, className) {
    return poll(`className ${className} on ${element.tagName}`, () => {
      return element.classList.contains(className);
    }, undefined /** opt_onError */, 300 /** opt_timeout */);
  }

  beforeEach(() => {
    win = env.win;

    storyEl = win.document.createElement('amp-story');
    storyEl.setAttribute('foo', 'bar');
    win.document.body.appendChild(storyEl);

    styleEl = win.document.createElement('style');
    setMatcherSize(200, 100);
    storyEl.appendChild(styleEl);

    return new Promise(resolve => {
      requestAnimationFrame(() => {
        mediaQueryService = new AmpStoryMediaQueryService(win);
        resolve();
      });
    });
  });

  afterEach(() => {
    storyEl.remove();
    mediaQueryService.matcher_.remove();
  });

  it('should add the attribute if the media query matches', () => {
    const spy = sandbox.spy();
    return mediaQueryService
        .onMediaQueryMatch('(orientation: landscape)', spy)
        .then(() => {
          expect(spy).to.have.been.calledOnceWith(true);
        });
  });

  it('should not add the attribute if the media query does not match', () => {
    const spy = sandbox.spy();
    return mediaQueryService
        .onMediaQueryMatch('(orientation: portrait)', spy)
        .then(() => {
          expect(spy).to.have.been.calledOnceWith(false);
        });
  });

  it('should handle multiple media queries', () => {
    const spy1 = sandbox.spy();
    const p1 = mediaQueryService
        .onMediaQueryMatch('(orientation: landscape)', spy1);
    const spy2 = sandbox.spy();
    const p2 = mediaQueryService
        .onMediaQueryMatch('(min-width: 600px)', spy2);
    return Promise.all([p1, p2])
        .then(() => {
          expect(spy1).to.have.been.calledOnceWith(true);
          expect(spy2).to.have.been.calledOnceWith(false);
        });
  });

  it('should add the className if the media query matches on resize', () => {
    return mediaQueryService
        .onMediaQueryMatch('(orientation: portrait)', matches => {
          storyEl.classList.toggle('portrait', matches);
        })
        .then(() => {
          setMatcherSize(100, 300);
          return waitForClassName(storyEl, 'portrait');
        });
  });
});
