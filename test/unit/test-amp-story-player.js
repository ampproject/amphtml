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

import {
  AmpStoryPlayer,
  IFRAME_IDX,
} from '../../src/amp-story-player/amp-story-player-impl';
import {AmpStoryPlayerManager} from '../../src/amp-story-player/amp-story-player-manager';
import {Messaging} from '@ampproject/viewer-messaging';
import {toArray} from '../../src/types';

describes.realWin('AmpStoryPlayer', {amp: false}, (env) => {
  let win;
  let playerEl;
  let manager;

  const fireHandler = [];
  const DEFAULT_CACHE_URL =
    'https://www-washingtonpost-com.cdn.ampproject.org/v/s/www.washingtonpost.com/graphics/2019/lifestyle/travel/amp-stories/a-locals-guide-to-what-to-eat-and-do-in-new-york-city/';
  const DEFAULT_ORIGIN_URL =
    'https://www.washingtonpost.com/graphics/2019/lifestyle/travel/amp-stories/a-locals-guide-to-what-to-eat-and-do-in-new-york-city/';
  let fakeMessaging;
  let messagingMock;

  const nextTick = () => new Promise((resolve) => win.setTimeout(resolve, 0));

  function buildStoryPlayer(
    numStories = 1,
    url = DEFAULT_CACHE_URL,
    cache = null
  ) {
    playerEl = win.document.createElement('amp-story-player');

    if (cache) {
      playerEl.setAttribute('amp-cache', cache);
    }
    for (let i = 0; i < numStories; i++) {
      const storyAnchor = win.document.createElement('a');
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

  it('should build an iframe for each story', async () => {
    buildStoryPlayer();
    await manager.loadPlayers();

    expect(playerEl.shadowRoot.querySelector('iframe')).to.exist;
  });

  it('should correctly append params at the end of the story url', async () => {
    buildStoryPlayer();
    await manager.loadPlayers();

    const storyIframe = playerEl.shadowRoot.querySelector('iframe');

    expect(storyIframe.getAttribute('src')).to.equals(
      DEFAULT_CACHE_URL +
        '?amp_js_v=0.1#visibilityState=visible&origin=http%3A%2F%2Flocalhost%3A9876' +
        '&showStoryUrlInfo=0&storyPlayer=v0&cap=swipe'
    );
  });

  it('should correctly append params at the end of a story url with existing params', async () => {
    const existingParams = '?testParam=true#myhash=hashValue';
    buildStoryPlayer(1, DEFAULT_CACHE_URL + existingParams);
    await manager.loadPlayers();

    const storyIframe = playerEl.shadowRoot.querySelector('iframe');

    expect(storyIframe.getAttribute('src')).to.equals(
      DEFAULT_CACHE_URL +
        existingParams +
        '&amp_js_v=0.1#visibilityState=visible&origin=http%3A%2F%2Flocalhost%3A9876' +
        '&showStoryUrlInfo=0&storyPlayer=v0&cap=swipe'
    );
  });

  it('should set first story as visible', async () => {
    buildStoryPlayer(3);
    await manager.loadPlayers();

    const storyIframes = playerEl.shadowRoot.querySelectorAll('iframe');
    expect(storyIframes[0].getAttribute('src')).to.include(
      '#visibilityState=visible'
    );
  });

  it('should prerender next stories', async () => {
    buildStoryPlayer(3);
    await manager.loadPlayers();

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
      await manager.loadPlayers();
      await nextTick();

      const stories = toArray(playerEl.querySelectorAll('a'));

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
      await manager.loadPlayers();
      await nextTick();

      const stories = toArray(playerEl.querySelectorAll('a'));

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

  describe('Cache URLs', () => {
    it('should transform origin to cache url when specified by the publisher', async () => {
      buildStoryPlayer(1, DEFAULT_ORIGIN_URL, 'cdn.ampproject.org');
      await manager.loadPlayers();

      await nextTick();

      const storyIframe = playerEl.shadowRoot.querySelector('iframe');

      expect(storyIframe.getAttribute('src')).to.equals(
        DEFAULT_CACHE_URL +
          '?amp_js_v=0.1#visibilityState=visible&origin=http%3A%2F%2Flocalhost%3A9876' +
          '&showStoryUrlInfo=0&storyPlayer=v0&cap=swipe'
      );
    });

    it('should respect original url when there is no amp-cache value', async () => {
      buildStoryPlayer(1, DEFAULT_ORIGIN_URL);
      await manager.loadPlayers();

      await nextTick();

      const storyIframe = playerEl.shadowRoot.querySelector('iframe');

      expect(storyIframe.getAttribute('src')).to.equals(
        DEFAULT_ORIGIN_URL +
          '?amp_js_v=0.1#visibilityState=visible&origin=http%3A%2F%2Flocalhost%3A9876' +
          '&showStoryUrlInfo=0&storyPlayer=v0&cap=swipe'
      );
    });

    it('should throw error when invalid url is provided', async () => {
      buildStoryPlayer(1, DEFAULT_ORIGIN_URL, 'www.invalid.org');

      return expect(() => manager.loadPlayers()).to.throw(
        /Unsupported cache, use one of following: cdn.ampproject.org,www.bing-amp.com/
      );
    });
  });

  describe('Player API', () => {
    function appendStoriesToPlayer(playerEl, numStories) {
      for (let i = 0; i < numStories; i++) {
        const story = win.document.createElement('a');
        story.setAttribute('href', `https://example.com/story${i}.html`);
        playerEl.appendChild(story);
      }
    }

    it('signals when its ready to be interacted with', async () => {
      buildStoryPlayer();
      const readySpy = env.sandbox.spy();
      playerEl.addEventListener('ready', readySpy);
      await manager.loadPlayers();

      expect(readySpy).to.have.been.calledOnce;
    });

    it('does not signal when attaching listener after it was built', async () => {
      buildStoryPlayer();
      const readySpy = env.sandbox.spy();
      await manager.loadPlayers();

      playerEl.addEventListener('ready', readySpy);

      expect(readySpy).to.not.have.been.called;
    });

    it('has isReady property after it is built', async () => {
      buildStoryPlayer();
      await manager.loadPlayers();

      expect(playerEl.isReady).to.be.true;
    });

    it('load callback builds iframe inside the player', async () => {
      const playerEl = win.document.createElement('amp-story-player');
      const story = win.document.createElement('a');
      story.setAttribute('href', DEFAULT_CACHE_URL);
      playerEl.appendChild(story);

      const player = new AmpStoryPlayer(win, playerEl);

      await player.load();

      expect(playerEl.shadowRoot.querySelector('iframe')).to.exist;
    });

    it('show callback builds corresponding adjacent iframes', async () => {
      const playerEl = win.document.createElement('amp-story-player');
      appendStoriesToPlayer(playerEl, 5);

      const player = new AmpStoryPlayer(win, playerEl);

      await player.load();

      await player.show('https://example.com/story3.html');

      const stories = toArray(playerEl.querySelectorAll('a'));

      expect(stories[0][IFRAME_IDX]).to.eql(undefined);
      expect(stories[1][IFRAME_IDX]).to.eql(undefined);
      expect(stories[2][IFRAME_IDX]).to.eql(0);
      expect(stories[3][IFRAME_IDX]).to.eql(1);
      expect(stories[4][IFRAME_IDX]).to.eql(2);
    });

    // TODO(proyectoramirez): delete once add() is implemented.
    it('show callback should throw when story is not found', async () => {
      const playerEl = win.document.createElement('amp-story-player');
      appendStoriesToPlayer(playerEl, 5);

      const player = new AmpStoryPlayer(win, playerEl);

      await player.load();

      return expect(() =>
        player.show('https://example.com/story6.html')
      ).to.throw(
        'Story URL not found in the player: https://example.com/story6.html'
      );
    });
  });
});
