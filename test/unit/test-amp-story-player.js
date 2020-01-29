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

import {AmpStoryPlayerManager} from '../../src/amp-story-player-manager';

describes.realWin('AmpStoryPlayer', {amp: false}, env => {
  let win;
  let playerEl;
  let url;
  let manager;

  function buildStoryPlayer() {
    playerEl = win.document.createElement('amp-story-player');
    const storyAnchor = win.document.createElement('a');
    url =
      'https://www-washingtonpost-com.cdn.ampproject.org/v/s/www.washingtonpost.com/graphics/2019/lifestyle/travel/amp-stories/a-locals-guide-to-what-to-eat-and-do-in-new-york-city/';
    storyAnchor.setAttribute('href', url);
    playerEl.appendChild(storyAnchor);
    win.document.body.appendChild(playerEl);
    manager = new AmpStoryPlayerManager(win);
  }

  beforeEach(() => {
    win = env.win;
    buildStoryPlayer();
  });

  it('should build an iframe for each story', () => {
    manager.loadPlayers();

    expect(playerEl.shadowRoot.querySelector('iframe')).to.exist;
  });

  it('should correctly append params at the end of the story url', () => {
    manager.loadPlayers();
    const storyIframe = playerEl.shadowRoot.querySelector('iframe');

    expect(storyIframe.getAttribute('src')).to.equals(
      url + '?amp_js_v=0.1#visibilityState=inactive&origin=about%3Asrcdoc'
    );
  });

  it('should correctly append params at the end of a story url with existing params', () => {
    url += '?testParam=true#myhash=hashValue';
    playerEl.firstElementChild.setAttribute('href', url);

    manager.loadPlayers();
    const storyIframe = playerEl.shadowRoot.querySelector('iframe');

    expect(storyIframe.getAttribute('src')).to.equals(
      url + '&amp_js_v=0.1#visibilityState=inactive&origin=about%3Asrcdoc'
    );
  });
});
