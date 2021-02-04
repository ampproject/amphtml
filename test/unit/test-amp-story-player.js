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

import {AmpStoryComponentManager} from '../../src/amp-story-player/amp-story-component-manager';
import {AmpStoryPlayer} from '../../src/amp-story-player/amp-story-player-impl';
import {Messaging} from '@ampproject/viewer-messaging';

describes.realWin('AmpStoryPlayer', {amp: false}, (env) => {
  let win;
  let playerEl;
  let manager;
  let fakeResponse;
  const TAG = 'amp-story-player';

  const fireHandler = [];
  const DEFAULT_CACHE_URL =
    'https://www-washingtonpost-com.cdn.ampproject.org/v/s/www.washingtonpost.com/graphics/2019/lifestyle/travel/amp-stories/a-locals-guide-to-what-to-eat-and-do-in-new-york-city/';
  const DEFAULT_ORIGIN_URL =
    'https://www.washingtonpost.com/graphics/2019/lifestyle/travel/amp-stories/a-locals-guide-to-what-to-eat-and-do-in-new-york-city/';
  let fakeMessaging;

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
    manager = new AmpStoryComponentManager(win);
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

  function openPageAttachment() {
    const openEvent = {state: 'PAGE_ATTACHMENT_STATE', value: true};
    fireHandler['documentStateUpdate']('documentStateUpdate', openEvent);
  }

  function closePageAttachment() {
    const closeEvent = {state: 'PAGE_ATTACHMENT_STATE', value: false};
    fireHandler['documentStateUpdate']('documentStateUpdate', closeEvent);
  }

  function buildCircularWrappingConfig() {
    const configEl = document.createElement('script');
    configEl.textContent = JSON.stringify({
      'behavior': {
        'on': 'end',
        'action': 'circular-wrapping',
      },
    });
    configEl.setAttribute('type', 'application/json');
    return configEl;
  }

  beforeEach(() => {
    win = env.win;
    fakeMessaging = {
      setDefaultHandler: () => {},
      sendRequest: () => Promise.resolve(fakeResponse),
      unregisterHandler: () => {},
      registerHandler: (event, handler) => {
        fireHandler[event] = handler;
      },
    };

    env.sandbox
      .stub(Messaging, 'waitForHandshakeFromDocument')
      .resolves(fakeMessaging);
  });

  afterEach(() => {
    console.error.restore();
  });

  it('should build an iframe for each story', async () => {
    buildStoryPlayer();
    await manager.loadPlayers();

    expect(playerEl.querySelector('iframe')).to.exist;
  });

  it('should correctly append params at the end of the story url', async () => {
    buildStoryPlayer();
    await manager.loadPlayers();
    await nextTick();

    const storyIframe = playerEl.querySelector('iframe');

    expect(storyIframe.getAttribute('src')).to.equals(
      DEFAULT_CACHE_URL +
        '?amp_js_v=0.1#visibilityState=prerender&origin=http%3A%2F%2Flocalhost%3A9876' +
        '&showStoryUrlInfo=0&storyPlayer=v0&cap=swipe'
    );
  });

  it('should correctly append params at the end of a story url with existing params', async () => {
    const existingQuery = '?testParam=true';
    const existingHash = '#myhash=hashValue';
    buildStoryPlayer(1, DEFAULT_CACHE_URL + existingQuery + existingHash);

    await manager.loadPlayers();
    await nextTick();

    const storyIframe = playerEl.querySelector('iframe');

    expect(storyIframe.getAttribute('src')).to.equals(
      DEFAULT_CACHE_URL +
        existingQuery +
        '&amp_js_v=0.1' +
        existingHash +
        '&visibilityState=prerender&origin=http%3A%2F%2Flocalhost%3A9876' +
        '&showStoryUrlInfo=0&storyPlayer=v0&cap=swipe'
    );
  });

  it('should set first story as visible', async () => {
    const sendRequestSpy = env.sandbox.spy(fakeMessaging, 'sendRequest');

    buildStoryPlayer(3);
    await manager.loadPlayers();
    await nextTick();

    expect(sendRequestSpy).to.have.been.calledWith('visibilitychange', {
      'state': 'visible',
    });
  });

  it('should prerender next story after first one is loaded', async () => {
    buildStoryPlayer(3);
    await manager.loadPlayers();
    await nextTick();

    fireHandler['storyContentLoaded']('storyContentLoaded', {});
    await nextTick();

    const storyIframes = playerEl.querySelectorAll('iframe');
    expect(storyIframes[1].getAttribute('src')).to.include(
      '#visibilityState=prerender'
    );
  });

  it('should not load next story if first one has not finished loading', async () => {
    buildStoryPlayer(3);
    await manager.loadPlayers();
    await nextTick();

    const storyIframes = playerEl.querySelectorAll('iframe');

    expect(storyIframes[1].getAttribute('src')).to.not.exist;
  });

  it('should load new story if user navigated before first finished loading', async () => {
    buildStoryPlayer(3);
    await manager.loadPlayers();
    await nextTick();

    // Swiping without waiting for story loaded event.
    swipeLeft();
    await nextTick();

    const storyIframes = playerEl.querySelectorAll('iframe');
    expect(storyIframes[1].getAttribute('src')).to.exist;
  });

  it(
    'should remove iframe from a story with distance > 1 from the DOM ' +
      'and append a new story to the DOM that is distance <= 1 when navigating',
    async () => {
      buildStoryPlayer(4);
      await manager.loadPlayers();
      await nextTick();

      const stories = playerEl.getStories();

      swipeLeft();

      expect(playerEl.contains(stories[0].iframe)).to.be.true;
      expect(playerEl.contains(stories[3].iframe)).to.be.false;

      swipeLeft();

      expect(playerEl.contains(stories[0].iframe)).to.be.false;
      expect(playerEl.contains(stories[3].iframe)).to.be.true;
    }
  );

  it(
    'should remove iframe from a story with distance > 1 from DOM ' +
      'and append new story to the DOM which distance <= 1 when navigating backwards',
    async () => {
      buildStoryPlayer(4);
      await manager.loadPlayers();
      await nextTick();

      const stories = playerEl.getStories();

      swipeLeft();
      swipeLeft();
      swipeRight();

      expect(playerEl.contains(stories[0].iframe)).to.be.true;
      expect(playerEl.contains(stories[3].iframe)).to.be.false;
    }
  );

  it('should register handlers at build time', async () => {
    const registerHandlerSpy = env.sandbox.spy(
      fakeMessaging,
      'registerHandler'
    );

    buildStoryPlayer();
    await manager.loadPlayers();
    await nextTick();

    expect(registerHandlerSpy).to.have.been.calledWith('touchstart');
    expect(registerHandlerSpy).to.have.been.calledWith('touchmove');
    expect(registerHandlerSpy).to.have.been.calledWith('touchend');
    expect(registerHandlerSpy).to.have.been.calledWith('selectDocument');
    expect(registerHandlerSpy).to.have.been.calledWith('documentStateUpdate');
  });

  it('should set up onDocumentState listeners at at build time', async () => {
    const sendRequestSpy = env.sandbox.spy(fakeMessaging, 'sendRequest');

    buildStoryPlayer();
    await manager.loadPlayers();
    await nextTick();

    expect(sendRequestSpy).to.have.been.calledWith('onDocumentState', {
      'state': 'PAGE_ATTACHMENT_STATE',
    });
    expect(sendRequestSpy).to.have.been.calledWith('onDocumentState', {
      'state': 'CURRENT_PAGE_ID',
    });
  });

  it('should navigate to next story when the last page of a story is tapped', async () => {
    buildStoryPlayer(2);

    await manager.loadPlayers();
    await nextTick();

    const navigationSpy = env.sandbox.spy();
    playerEl.addEventListener('navigation', navigationSpy);

    const fakeData = {next: true};
    fireHandler['selectDocument']('selectDocument', fakeData);

    expect(navigationSpy).to.have.been.calledWithMatch({
      type: 'navigation',
      detail: {
        index: 1,
        remaining: 0,
      },
    });
  });

  it('should dispatch noNextStory when in last story', async () => {
    buildStoryPlayer(1);

    await manager.loadPlayers();
    await nextTick();

    const noNextSpy = env.sandbox.spy();
    playerEl.addEventListener('noNextStory', noNextSpy);

    fireHandler['selectDocument']('selectDocument', {next: true});

    expect(noNextSpy).to.have.been.called;
  });

  it('should not dispatch noNextStory when not in last story', async () => {
    buildStoryPlayer(2);

    await manager.loadPlayers();
    await nextTick();

    const noNextSpy = env.sandbox.spy();
    playerEl.addEventListener('noNextStory', noNextSpy);

    fireHandler['selectDocument']('selectDocument', {next: true});

    expect(noNextSpy).to.not.have.been.called;
  });

  it('should not dispatch noNextStory when circular wrapping is enabled', async () => {
    buildStoryPlayer(1);
    playerEl.appendChild(buildCircularWrappingConfig());

    await manager.loadPlayers();
    await nextTick();

    const noNextSpy = env.sandbox.spy();
    playerEl.addEventListener('noNextStory', noNextSpy);

    fireHandler['selectDocument']('selectDocument', {next: true});

    expect(noNextSpy).to.not.have.been.called;
  });

  it('should dispatch noPreviousStory when in first story', async () => {
    buildStoryPlayer(1);

    await manager.loadPlayers();
    await nextTick();

    const noPreviousSpy = env.sandbox.spy();
    playerEl.addEventListener('noPreviousStory', noPreviousSpy);

    fireHandler['selectDocument']('selectDocument', {previous: true});

    expect(noPreviousSpy).to.have.been.called;
  });

  it('should not dispatch noPreviousStory when not in first story', async () => {
    buildStoryPlayer(2);

    await manager.loadPlayers();
    await nextTick();

    const noPreviousSpy = env.sandbox.spy();
    playerEl.addEventListener('noPreviousStory', noPreviousSpy);

    fireHandler['selectDocument']('selectDocument', {next: true});
    fireHandler['selectDocument']('selectDocument', {previous: true});

    expect(noPreviousSpy).to.not.have.been.called;
  });

  it('should not dispatch noPreviousStory when circular wrapping is enabled', async () => {
    buildStoryPlayer(2);
    playerEl.appendChild(buildCircularWrappingConfig());

    await manager.loadPlayers();
    await nextTick();

    const noPreviousSpy = env.sandbox.spy();
    playerEl.addEventListener('noPreviousStory', noPreviousSpy);

    fireHandler['selectDocument']('selectDocument', {previous: true});

    expect(noPreviousSpy).to.not.have.been.called;
  });

  it('should navigate when swiping', async () => {
    buildStoryPlayer(4);
    await manager.loadPlayers();
    await nextTick();

    const navigationSpy = env.sandbox.spy();
    playerEl.addEventListener('navigation', navigationSpy);

    swipeLeft();

    expect(navigationSpy).to.have.been.calledWithMatch({
      type: 'navigation',
      detail: {
        index: 1,
        remaining: 2,
      },
    });
  });

  it('should not navigate when swiping last story', async () => {
    buildStoryPlayer(2);
    await manager.loadPlayers();
    await nextTick();

    const navigationSpy = env.sandbox.spy();
    playerEl.addEventListener('navigation', navigationSpy);

    swipeLeft();
    swipeLeft();
    swipeLeft();

    expect(navigationSpy).to.have.been.calledOnce;
  });

  describe('Cache URLs', () => {
    it('should transform origin to cache url when specified by the publisher', async () => {
      buildStoryPlayer(1, DEFAULT_ORIGIN_URL, 'cdn.ampproject.org');
      await manager.loadPlayers();

      await nextTick();

      const storyIframe = playerEl.querySelector('iframe');

      expect(storyIframe.getAttribute('src')).to.equals(
        DEFAULT_CACHE_URL +
          '?amp_js_v=0.1#visibilityState=prerender&origin=http%3A%2F%2Flocalhost%3A9876' +
          '&showStoryUrlInfo=0&storyPlayer=v0&cap=swipe'
      );
    });

    it('should respect original url when there is no amp-cache value', async () => {
      buildStoryPlayer(1, DEFAULT_ORIGIN_URL);
      await manager.loadPlayers();

      await nextTick();

      const storyIframe = playerEl.querySelector('iframe');

      expect(storyIframe.getAttribute('src')).to.equals(
        DEFAULT_ORIGIN_URL +
          '#visibilityState=prerender&origin=http%3A%2F%2Flocalhost%3A9876' +
          '&showStoryUrlInfo=0&storyPlayer=v0&cap=swipe'
      );
    });

    it('should throw error when invalid url is provided', async () => {
      console.error.restore();
      env.sandbox.spy(console, 'error');

      buildStoryPlayer(1, DEFAULT_ORIGIN_URL, 'www.tacos.org');

      await manager.loadPlayers();
      await nextTick();

      expect(console.error).to.be.calledWithMatch(
        /\[amp-story-player\]/,
        /Unsupported cache specified, use one of following: cdn.ampproject.org,www.bing-amp.com/
      );
    });
  });

  describe('Player API', () => {
    function attachPlayerWithStories(playerEl, numStories) {
      for (let i = 0; i < numStories; i++) {
        const story = win.document.createElement('a');
        story.setAttribute('href', `https://example.com/story${i}.html`);
        playerEl.appendChild(story);
      }
      win.document.body.appendChild(playerEl);
    }

    // Creates an array of story objects with a unique random URL.
    function createStoryObjects(numberOfStories) {
      const stories = [];
      for (let i = 0; i < numberOfStories; i++) {
        stories.push({
          href: DEFAULT_ORIGIN_URL + Math.floor(Math.random() * 1000),
        });
      }
      return stories;
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

    it('load callback throws if player is not appended to the DOM', async () => {
      const playerEl = win.document.createElement('amp-story-player');
      const story = win.document.createElement('a');
      story.setAttribute('href', DEFAULT_CACHE_URL);
      playerEl.appendChild(story);

      const player = new AmpStoryPlayer(win, playerEl);

      return expect(() => player.load()).to.throw(
        `[${TAG}] element must be connected to the DOM before calling load().`
      );
    });

    it('load callback builds iframe inside the player', async () => {
      const playerEl = win.document.createElement('amp-story-player');
      attachPlayerWithStories(playerEl, 1);

      const player = new AmpStoryPlayer(win, playerEl);

      await player.load();

      expect(playerEl.querySelector('iframe')).to.exist;
    });

    it('show callback builds corresponding adjacent iframes', async () => {
      const playerEl = win.document.createElement('amp-story-player');
      attachPlayerWithStories(playerEl, 5);

      const player = new AmpStoryPlayer(win, playerEl);

      await player.load();

      player.show('https://example.com/story3.html');
      await nextTick();

      fireHandler['storyContentLoaded']('storyContentLoaded', {});
      await nextTick();

      const stories = playerEl.getStories();

      expect(playerEl.contains(stories[0].iframe)).to.be.false;
      expect(playerEl.contains(stories[1].iframe)).to.be.false;
      expect(playerEl.contains(stories[2].iframe)).to.be.true;
      expect(playerEl.contains(stories[3].iframe)).to.be.true;
      expect(playerEl.contains(stories[4].iframe)).to.be.true;
    });

    it('show() callback should prerender next story after current one is loaded', async () => {
      const playerEl = win.document.createElement('amp-story-player');
      attachPlayerWithStories(playerEl, 5);

      const player = new AmpStoryPlayer(win, playerEl);

      await player.load();

      player.show('https://example.com/story3.html');
      await nextTick();

      fireHandler['storyContentLoaded']('storyContentLoaded', {});
      await nextTick();

      const storyIframes = playerEl.querySelectorAll('iframe');

      expect(storyIframes[0].getAttribute('src')).to.include(
        'https://example.com/story3.html#visibilityState=prerender'
      );
      expect(storyIframes[1].getAttribute('src')).to.include(
        'https://example.com/story4.html#visibilityState=prerender'
      );
      expect(storyIframes[2].getAttribute('src')).to.include(
        'https://example.com/story2.html#visibilityState=prerender'
      );
    });

    // TODO(proyectoramirez): delete once add() is implemented.
    it('show callback should throw when story is not found', async () => {
      const playerEl = win.document.createElement('amp-story-player');
      attachPlayerWithStories(playerEl, 5);

      const player = new AmpStoryPlayer(win, playerEl);

      await player.load();

      return expect(() =>
        player.show('https://example.com/story6.html')
      ).to.throw(
        'Story URL not found in the player: https://example.com/story6.html'
      );
    });

    it('adds stories programmatically', async () => {
      buildStoryPlayer(3);
      await manager.loadPlayers();

      const storyObjects = createStoryObjects(1);
      playerEl.add(storyObjects);

      const stories = playerEl.getStories();

      expect(stories.length).to.eql(4);
    });

    it('throws an error if the add method is not passed an array', async () => {
      buildStoryPlayer();
      await manager.loadPlayers();

      return expect(() => playerEl.add(7)).to.throw(
        '"stories" parameter has the wrong structure'
      );
    });

    it('throws an error if the add method is passed an array with incorrectly structured story objects', async () => {
      buildStoryPlayer();
      await manager.loadPlayers();

      const wrongStoryObjects = [{notHref: true}];

      return expect(() => playerEl.add(wrongStoryObjects)).to.throw(
        '"stories" parameter has the wrong structure'
      );
    });

    it('adds no stories when sending an empty array of new stories', async () => {
      buildStoryPlayer(3);
      await manager.loadPlayers();

      const storyObjects = createStoryObjects(0);
      playerEl.add(storyObjects);

      const stories = playerEl.getStories();

      expect(stories.length).to.eql(3);
    });

    it(
      'creates and assigns iframes to added stories when they have a ' +
        'distance of 1',
      async () => {
        buildStoryPlayer();
        await manager.loadPlayers();

        const storyObjects = createStoryObjects(2);
        playerEl.add(storyObjects);

        const stories = playerEl.getStories();

        expect(playerEl.contains(stories[0].iframe)).to.be.true;
        expect(playerEl.contains(stories[1].iframe)).to.be.true;
      }
    );

    it(
      'assigns an existing iframe to the first added story when the current ' +
        'story is the last one, and the new story has a distance of 1',
      async () => {
        buildStoryPlayer(3);
        await manager.loadPlayers();
        await nextTick();

        swipeLeft();
        swipeLeft();

        const storyObjects = createStoryObjects(2);
        playerEl.add(storyObjects);

        const stories = playerEl.getStories();

        expect(playerEl.contains(stories[3].iframe)).to.be.true;
        expect(playerEl.contains(stories[4].iframe)).to.be.false;
      }
    );

    it('pauses programmatically', async () => {
      const spy = env.sandbox.spy(fakeMessaging, 'sendRequest');
      buildStoryPlayer();
      await manager.loadPlayers();

      playerEl.pause();
      await nextTick();

      expect(spy).to.have.been.calledWith('visibilitychange', {
        state: 'paused',
      });
    });

    it('plays programmatically', async () => {
      const spy = env.sandbox.spy(fakeMessaging, 'sendRequest');
      buildStoryPlayer();
      await manager.loadPlayers();

      playerEl.play();
      await nextTick();

      expect(spy).to.have.been.calledWith('visibilitychange', {
        state: 'visible',
      });
    });

    it('calling mute should set story muted state to true', async () => {
      const spy = env.sandbox.spy(fakeMessaging, 'sendRequest');
      buildStoryPlayer();
      await manager.loadPlayers();

      await playerEl.mute();
      await nextTick();

      expect(spy).to.have.been.calledWith('setDocumentState', {
        state: 'MUTED_STATE',
        value: true,
      });
    });

    it('calling unmute should set the story muted state to false', async () => {
      const spy = env.sandbox.spy(fakeMessaging, 'sendRequest');
      buildStoryPlayer();
      await manager.loadPlayers();

      await playerEl.unmute();
      await nextTick();

      expect(spy).to.have.been.calledWith('setDocumentState', {
        state: 'MUTED_STATE',
        value: false,
      });
    });

    it('back button should be created and close button should not', async () => {
      const playerEl = win.document.createElement('amp-story-player');
      playerEl.setAttribute('exit-control', 'back-button');
      attachPlayerWithStories(playerEl, 5);

      const player = new AmpStoryPlayer(win, playerEl);

      await player.load();

      expect(playerEl.querySelector('button.amp-story-player-back-button')).to
        .exist;
      expect(playerEl.querySelector('button.amp-story-player-close-button')).to
        .not.exist;
    });

    it('close button should be created and back button should not', async () => {
      const playerEl = win.document.createElement('amp-story-player');
      playerEl.setAttribute('exit-control', 'close-button');
      attachPlayerWithStories(playerEl, 5);

      const player = new AmpStoryPlayer(win, playerEl);

      await player.load();
      expect(playerEl.querySelector('button.amp-story-player-close-button')).to
        .exist;
      expect(playerEl.querySelector('button.amp-story-player-back-button')).to
        .not.exist;
    });

    it('no button should be created', async () => {
      const playerEl = win.document.createElement('amp-story-player');
      playerEl.setAttribute('exit-control', 'brokenattribute');
      attachPlayerWithStories(playerEl, 5);

      const player = new AmpStoryPlayer(win, playerEl);

      await player.load();

      expect(playerEl.querySelector('button.amp-story-player-close-button')).to
        .not.exist;
      expect(playerEl.querySelector('button.amp-story-player-back-button')).to
        .not.exist;
    });

    it('back button should fire back event once', async () => {
      const playerEl = win.document.createElement('amp-story-player');
      playerEl.setAttribute('exit-control', 'back-button');
      attachPlayerWithStories(playerEl, 5);

      const player = new AmpStoryPlayer(win, playerEl);

      await player.load();

      const readySpy = env.sandbox.spy();
      playerEl.addEventListener('amp-story-player-back', readySpy);

      playerEl.querySelector('button.amp-story-player-back-button').click();

      expect(readySpy).to.have.been.calledOnce;
    });

    it('close button should fire close event once', async () => {
      const playerEl = win.document.createElement('amp-story-player');
      playerEl.setAttribute('exit-control', 'close-button');
      attachPlayerWithStories(playerEl, 5);

      const player = new AmpStoryPlayer(win, playerEl);
      await player.load();

      const readySpy = env.sandbox.spy();
      playerEl.addEventListener('amp-story-player-close', readySpy);

      playerEl.querySelector('button.amp-story-player-close-button').click();

      expect(readySpy).to.have.been.calledOnce;
    });

    it('get page attachment state should send message', async () => {
      const sendRequestSpy = env.sandbox.spy(fakeMessaging, 'sendRequest');
      buildStoryPlayer();
      await manager.loadPlayers();

      fakeResponse = {value: true};
      await playerEl.getStoryState('page-attachment');

      await nextTick();

      expect(sendRequestSpy).to.have.been.calledWith('getDocumentState', {
        'state': 'PAGE_ATTACHMENT_STATE',
      });
    });

    it('should display button when page attachment is closed', async () => {
      const playerEl = win.document.createElement('amp-story-player');
      playerEl.setAttribute('exit-control', 'back-button');
      attachPlayerWithStories(playerEl, 1);

      const player = new AmpStoryPlayer(win, playerEl);
      await player.load();

      expect(playerEl.querySelector('button.amp-story-player-hide-button')).to
        .not.exist;
    });

    it('should hide button when page attachment is open', async () => {
      buildStoryPlayer();
      playerEl.setAttribute('exit-control', 'back-button');
      await manager.loadPlayers();
      await nextTick();

      openPageAttachment();

      expect(playerEl.querySelector('button.amp-story-player-hide-button')).to
        .exist;
    });

    it('should fire page attachment open event once', async () => {
      buildStoryPlayer();
      await manager.loadPlayers();
      await nextTick();

      const pageAttachmentSpy = env.sandbox.spy();
      playerEl.addEventListener('page-attachment-open', pageAttachmentSpy);

      openPageAttachment();

      expect(pageAttachmentSpy).to.have.been.calledOnce;
    });

    it('should fire page attachment close event once', async () => {
      buildStoryPlayer();
      await manager.loadPlayers();
      await nextTick();

      const pageAttachmentSpy = env.sandbox.spy();
      playerEl.addEventListener('page-attachment-close', pageAttachmentSpy);

      closePageAttachment();

      expect(pageAttachmentSpy).to.have.been.calledOnce;
    });

    it('navigate forward given a positive number in range', async () => {
      const playerEl = win.document.createElement('amp-story-player');
      attachPlayerWithStories(playerEl, 5);

      const player = new AmpStoryPlayer(win, playerEl);

      await player.load();
      await nextTick();

      const navigationSpy = env.sandbox.spy();
      playerEl.addEventListener('navigation', navigationSpy);

      player.go(2);

      expect(navigationSpy).to.have.been.calledWithMatch({
        type: 'navigation',
        detail: {
          index: 2,
          remaining: 2,
        },
      });
    });

    it('navigate backward given a negative number in range', async () => {
      const playerEl = win.document.createElement('amp-story-player');
      attachPlayerWithStories(playerEl, 5);

      const player = new AmpStoryPlayer(win, playerEl);

      await player.load();
      await nextTick();

      const navigationSpy = env.sandbox.spy();
      playerEl.addEventListener('navigation', navigationSpy);

      player.go(3);
      player.go(-1);

      expect(navigationSpy).to.have.been.calledWithMatch({
        type: 'navigation',
        detail: {
          index: 2,
          remaining: 2,
        },
      });
    });

    it('not navigate given zero', async () => {
      const playerEl = win.document.createElement('amp-story-player');
      attachPlayerWithStories(playerEl, 5);

      const player = new AmpStoryPlayer(win, playerEl);

      await player.load();
      await nextTick();

      const navigationSpy = env.sandbox.spy();
      playerEl.addEventListener('navigation', navigationSpy);
      player.go(0);
      expect(navigationSpy).to.have.not.been.called;
    });

    it('go should throw when positive number is out of story range', async () => {
      const playerEl = win.document.createElement('amp-story-player');
      attachPlayerWithStories(playerEl, 5);

      const player = new AmpStoryPlayer(win, playerEl);

      await player.load();

      return expect(() => player.go(6)).to.throw('Out of Story range.');
    });

    it('go should throw when negative number is out of story range', async () => {
      const playerEl = win.document.createElement('amp-story-player');
      attachPlayerWithStories(playerEl, 5);

      const player = new AmpStoryPlayer(win, playerEl);

      await player.load();

      return expect(() => player.go(-1)).to.throw('Out of Story range.');
    });

    it('go with page delta should change current story page', async () => {
      const playerEl = win.document.createElement('amp-story-player');
      attachPlayerWithStories(playerEl, 1);

      const player = new AmpStoryPlayer(win, playerEl);

      await player.load();
      await nextTick();

      const sendRequestSpy = env.sandbox.spy(fakeMessaging, 'sendRequest');
      player.go(0, 4);
      await nextTick();

      expect(sendRequestSpy).to.have.been.calledWith('selectPage', {
        'delta': 4,
      });
    });

    it('navigate to id when calling gotToPageId', async () => {
      const playerEl = win.document.createElement('amp-story-player');
      attachPlayerWithStories(playerEl, 1);

      const player = new AmpStoryPlayer(win, playerEl);

      await player.load();
      await nextTick();

      const sendRequestSpy = env.sandbox.spy(fakeMessaging, 'sendRequest');

      player.show('', 'page-2');

      await nextTick();

      expect(sendRequestSpy).to.have.been.calledWith('selectPage', {
        'id': 'page-2',
      });
    });

    it('takes to first story when swiping on the last one with circular wrapping', async () => {
      const playerEl = win.document.createElement('amp-story-player');
      attachPlayerWithStories(playerEl, 5);
      playerEl.appendChild(buildCircularWrappingConfig());

      const player = new AmpStoryPlayer(win, playerEl);

      await player.load();
      await nextTick();

      const navigationSpy = env.sandbox.spy();
      playerEl.addEventListener('navigation', navigationSpy);

      player.go(4);
      swipeLeft();

      expect(navigationSpy).to.have.been.calledWithMatch({
        type: 'navigation',
        detail: {
          index: 0,
          remaining: 4,
        },
      });
    });

    it('takes to last story when swiping on the first one with circular wrapping', async () => {
      const playerEl = win.document.createElement('amp-story-player');
      attachPlayerWithStories(playerEl, 5);
      playerEl.appendChild(buildCircularWrappingConfig());

      const player = new AmpStoryPlayer(win, playerEl);

      await player.load();
      await nextTick();

      const navigationSpy = env.sandbox.spy();
      playerEl.addEventListener('navigation', navigationSpy);

      swipeRight();

      expect(navigationSpy).to.have.been.calledWithMatch({
        type: 'navigation',
        detail: {
          index: 4,
          remaining: 0,
        },
      });
    });

    it('navigate to first story when last story is finished', async () => {
      const playerEl = win.document.createElement('amp-story-player');
      attachPlayerWithStories(playerEl, 5);
      playerEl.appendChild(buildCircularWrappingConfig());

      const player = new AmpStoryPlayer(win, playerEl);

      await player.load();
      await nextTick();

      const navigationSpy = env.sandbox.spy();
      playerEl.addEventListener('navigation', navigationSpy);

      player.go(4);
      player.go(1);

      expect(navigationSpy).to.have.been.calledWithMatch({
        type: 'navigation',
        detail: {
          index: 0,
          remaining: 4,
        },
      });
    });

    it('navigate to last story when first story is requested to go back', async () => {
      const playerEl = win.document.createElement('amp-story-player');
      attachPlayerWithStories(playerEl, 5);
      playerEl.appendChild(buildCircularWrappingConfig());

      const player = new AmpStoryPlayer(win, playerEl);

      await player.load();
      await nextTick();

      const navigationSpy = env.sandbox.spy();
      playerEl.addEventListener('navigation', navigationSpy);

      player.go(-1);

      expect(navigationSpy).to.have.been.calledWithMatch({
        type: 'navigation',
        detail: {
          index: 4,
          remaining: 0,
        },
      });
    });

    it('should react to CURRENT_PAGE_ID events', async () => {
      const playerEl = win.document.createElement('amp-story-player');
      attachPlayerWithStories(playerEl, 1);

      const player = new AmpStoryPlayer(win, playerEl);

      await player.load();
      await nextTick();

      const navigationSpy = env.sandbox.spy();
      playerEl.addEventListener('storyNavigation', navigationSpy);

      fakeResponse = {value: 0.12};
      const fakeData = {state: 'CURRENT_PAGE_ID', value: 'page-2'};
      fireHandler['documentStateUpdate']('documentStateUpdate', fakeData);

      await nextTick();

      expect(navigationSpy).to.have.been.calledWithMatch({
        type: 'storyNavigation',
        detail: {
          pageId: 'page-2',
          progress: 0.12,
        },
      });
    });
  });
});
