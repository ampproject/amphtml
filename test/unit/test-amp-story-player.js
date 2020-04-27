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

import {AmpStoryPlayerManager} from '../../src/amp-story-player/amp-story-player-manager';
import {IFRAME_IDX} from '../../src/amp-story-player/amp-story-player-impl';
import {Messaging} from '@ampproject/viewer-messaging';
import {toArray} from '../../src/types';

describes.realWin('AmpStoryPlayer', {amp: false}, (env) => {
  let win;
  let playerEl;
  let url;
  let manager;
  const fireHandler = [];
  let fakeMessaging;
  let messagingMock;

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

    env.sandbox
      .stub(Messaging, 'waitForHandshakeFromDocument')
      .resolves(fakeMessaging);
  }

  function swipeLeft() {
    const touchStartEvent = {touches: [{screenX: 200, screenY: 100}]};
    fireHandler['touchstart']('touchstart', touchStartEvent);

    const touchMove = {touches: [{screenX: 100, screenY: 100}]};
    fireHandler['touchmove']('touchmove', touchMove);

    const touchEndEvent = {touches: [{screenX: 100, screenY: 100}]};
    fireHandler['touchend']('touchend', touchEndEvent);
  }

  function swipeRight() {
    const touchStartEvent = {touches: [{screenX: 100, screenY: 100}]};
    fireHandler['touchstart']('touchstart', touchStartEvent);

    const touchMove = {touches: [{screenX: 200, screenY: 100}]};
    fireHandler['touchmove']('touchmove', touchMove);

    const touchEndEvent = {touches: [{screenX: 200, screenY: 100}]};
    fireHandler['touchend']('touchend', touchEndEvent);
  }

  beforeEach(() => {
    win = env.win;
    fakeMessaging = {
      setDefaultHandler: () => {},
      sendRequest: () => {},
      unregisterHandler: () => {},
      registerHandler: (event, handler) => {
        fireHandler[event] = handler;
      },
    };
    messagingMock = env.sandbox.mock(fakeMessaging);
  });

  afterEach(() => {
    messagingMock.verify();
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
        '?amp_js_v=0.1#visibilityState=visible&origin=about%3Asrcdoc&showStoryUrlInfo=0&storyPlayer=v0&cap=swipe'
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
        '&amp_js_v=0.1#visibilityState=visible&origin=about%3Asrcdoc&showStoryUrlInfo=0&storyPlayer=v0&cap=swipe'
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
    async () => {
      buildStoryPlayer(4);
      const stories = toArray(playerEl.querySelectorAll('a'));

      await manager.loadPlayers();

      swipeLeft();
      expect(stories[0][IFRAME_IDX]).to.eql(0);
      expect(stories[3][IFRAME_IDX]).to.eql(undefined);

      swipeLeft();
      expect(stories[0][IFRAME_IDX]).to.eql(undefined);
      expect(stories[3][IFRAME_IDX]).to.eql(0);
    }
  );

  it(
    'should remove iframe from a story with distance > 1 from current story ' +
      'and give it to a new story that is distance <= 1 when navigating backwards',
    async () => {
      buildStoryPlayer(4);
      const stories = toArray(playerEl.querySelectorAll('a'));

      await manager.loadPlayers();

      swipeLeft();
      swipeLeft();
      swipeRight();

      expect(stories[0][IFRAME_IDX]).to.eql(0);
      expect(stories[3][IFRAME_IDX]).to.eql(undefined);
    }
  );

  it('should register handlers at build time', async () => {
    buildStoryPlayer();

    messagingMock.expects('registerHandler').withArgs('selectDocument');
    messagingMock.expects('registerHandler').withArgs('touchstart');
    messagingMock.expects('registerHandler').withArgs('touchmove');
    messagingMock.expects('registerHandler').withArgs('touchend');
    messagingMock.expects('setDefaultHandler');

    await manager.loadPlayers();
  });

  it('should navigate to next story when the last page of a story is tapped', async () => {
    buildStoryPlayer(2);

    await manager.loadPlayers();

    const fakeData = {next: true};
    fireHandler['selectDocument']('selectDocument', fakeData);

    win.requestAnimationFrame(() => {
      const iframes = playerEl.shadowRoot.querySelectorAll('iframe');
      expect(iframes[0].getAttribute('i-amphtml-iframe-position')).to.eql('-1');
      expect(iframes[1].getAttribute('i-amphtml-iframe-position')).to.eql('0');
    });
  });

  it('should navigate when swiping', async () => {
    buildStoryPlayer(4);
    await manager.loadPlayers();

    swipeLeft();

    win.requestAnimationFrame(() => {
      const iframes = playerEl.shadowRoot.querySelectorAll('iframe');
      expect(iframes[0].getAttribute('i-amphtml-iframe-position')).to.eql('-1');
      expect(iframes[1].getAttribute('i-amphtml-iframe-position')).to.eql('0');
    });
  });

  it('should not navigate when swiping last story', async () => {
    buildStoryPlayer(2);
    await manager.loadPlayers();

    swipeLeft();
    swipeLeft();
    swipeLeft();

    win.requestAnimationFrame(() => {
      const iframes = playerEl.shadowRoot.querySelectorAll('iframe');
      expect(iframes[0].getAttribute('i-amphtml-iframe-position')).to.eql('-1');
      expect(iframes[1].getAttribute('i-amphtml-iframe-position')).to.eql('0');
    });
  });
});
