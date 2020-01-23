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

import {AmpStoryEmbedManager} from '../../src/amp-story-embed-manager';

describes.realWin('AmpStoryEmbed', {amp: false}, env => {
  let win;
  let embedEl;
  let url;
  let manager;

  function buildStoryEmbed() {
    embedEl = win.document.createElement('amp-story-embed');
    const storyAnchor = win.document.createElement('a');
    url =
      'https://www-washingtonpost-com.cdn.ampproject.org/v/s/www.washingtonpost.com/graphics/2019/lifestyle/travel/amp-stories/a-locals-guide-to-what-to-eat-and-do-in-new-york-city/';
    storyAnchor.setAttribute('href', url);
    embedEl.appendChild(storyAnchor);
    win.document.body.appendChild(embedEl);
    manager = new AmpStoryEmbedManager(win);
  }

  beforeEach(() => {
    win = env.win;
    buildStoryEmbed();
  });

  it('should build an iframe for each story', () => {
    manager.loadEmbeds();

    expect(embedEl.shadowRoot.querySelector('iframe')).to.exist;
  });

  it('should correctly append params at the end of the story url', () => {
    manager.loadEmbeds();
    const storyIframe = embedEl.shadowRoot.querySelector('iframe');

    expect(storyIframe.getAttribute('src')).to.equals(
      url + '?amp_js_v=0.1#visibilityState=inactive&origin=about%3Asrcdoc'
    );
  });

  it('should correctly append params at the end of a story url with existing params', () => {
    url += '?testParam=true#myhash=hashValue';
    embedEl.firstElementChild.setAttribute('href', url);

    manager.loadEmbeds();
    const storyIframe = embedEl.shadowRoot.querySelector('iframe');

    expect(storyIframe.getAttribute('src')).to.equals(
      url + '&amp_js_v=0.1#visibilityState=inactive&origin=about%3Asrcdoc'
    );
  });
});
