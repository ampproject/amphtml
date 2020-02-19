/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
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

import {AmpStoryPlayer, IFRAME_IDX} from '../../src/amp-story-player';
import {AmpStoryPlayerManager} from '../../src/amp-story-player-manager';
import {toArray} from '../../src/types';

describes.realWin('AmpStoryPlayer', {amp: false}, env => {
  let win;
  let playerEl;
  let url;
  let manager;

  function buildStoryPlayer(numStories = 1) {
    playerEl = win.document.createElement('amp-story-player');
    for (let i = 0; i < numStories; i++) {
      const storyAnchor = win.document.createElement('a');
      url =
        'https://www-washingtonpost-com.cdn.ampproject.org/v/s/www.washingtonpost.com/graphics/2019/lifestyle/travel/amp-stories/a-locals-guide-to-what-to-eat-and-do-in-new-york-city/';
      storyAnchor.setAttribute('href', url);
      playerEl.appendChild(storyAnchor);
    }
    win.document.body.appendChild(playerEl);
    manager = new AmpStoryPlayerManager(win);
  }

  beforeEach(() => {
    win = env.win;
  });

  it('should build an iframe for each story', () => {
    buildStoryPlayer();
    manager.loadPlayers();

    expect(playerEl.shadowRoot.querySelector('iframe')).to.exist;
  });

  it('should correctly append params at the end of the story url', () => {
    buildStoryPlayer();
    manager.loadPlayers();
    const storyIframe = playerEl.shadowRoot.querySelector('iframe');

    expect(storyIframe.getAttribute('src')).to.equals(
      url +
        '?amp_js_v=0.1#visibilityState=visible&origin=about%3Asrcdoc&showStoryUrlInfo=0&storyPlayer=v0'
    );
  });

  it('should correctly append params at the end of a story url with existing params', () => {
    buildStoryPlayer();
    url += '?testParam=true#myhash=hashValue';
    playerEl.firstElementChild.setAttribute('href', url);

    manager.loadPlayers();
    const storyIframe = playerEl.shadowRoot.querySelector('iframe');

    expect(storyIframe.getAttribute('src')).to.equals(
      url +
        '&amp_js_v=0.1#visibilityState=visible&origin=about%3Asrcdoc&showStoryUrlInfo=0&storyPlayer=v0'
    );
  });

  it('should set first story as visible', () => {
    buildStoryPlayer(3);
    manager.loadPlayers();

    const storyIframes = playerEl.shadowRoot.querySelectorAll('iframe');
    expect(storyIframes[0].getAttribute('src')).to.include(
      '#visibilityState=visible'
    );
  });

  it('should prerender next stories', () => {
    buildStoryPlayer(3);
    manager.loadPlayers();

    const storyIframes = playerEl.shadowRoot.querySelectorAll('iframe');
    expect(storyIframes[1].getAttribute('src')).to.include(
      '#visibilityState=prerender'
    );
  });

  it(
    'should remove iframe from a story with distance > 1 from current story ' +
      'and give it to a new story that is distance <= 1 when navigating',
    () => {
      buildStoryPlayer(4);
      const stories = toArray(playerEl.querySelectorAll('a'));

      // TODO(#26308): Replace with manager.loadPlayers() when swipe is enabled.
      const player = new AmpStoryPlayer(win, playerEl);
      player.buildCallback();
      player.layoutCallback();

      // TODO(#26308): replace next_() with swipe.
      player.next_();
      expect(stories[0][IFRAME_IDX]).to.eql(0);
      expect(stories[3][IFRAME_IDX]).to.eql(undefined);

      // TODO(#26308): replace next_() with swipe.
      player.next_();
      expect(stories[0][IFRAME_IDX]).to.eql(undefined);
      expect(stories[3][IFRAME_IDX]).to.eql(0);
    }
  );

  it(
    'should remove iframe from a story with distance > 1 from current story ' +
      'and give it to a new story that is distance <= 1 when navigating backwards',
    () => {
      buildStoryPlayer(4);
      const stories = toArray(playerEl.querySelectorAll('a'));

      // TODO(#26308): Replace with manager.loadPlayers() when swipe is enabled.
      const player = new AmpStoryPlayer(win, playerEl);
      player.buildCallback();
      player.layoutCallback();

      // TODO(#26308): replace next_() & previous_() with swipe.
      player.next_();
      player.next_();
      player.previous_();

      expect(stories[0][IFRAME_IDX]).to.eql(0);
      expect(stories[3][IFRAME_IDX]).to.eql(undefined);
    }
  );
});
