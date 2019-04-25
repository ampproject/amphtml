/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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

import {AmpDocSingle} from '../../../../src/service/ampdoc-impl';
import {AmpStoryPage, PageState} from '../amp-story-page';
import {AmpStoryStoreService} from '../amp-story-store-service';
import {LocalizationService} from '../../../../src/service/localization';
import {MediaType} from '../media-pool';
import {createElementWithAttributes} from '../../../../src/dom';
import {installFriendlyIframeEmbed}
  from '../../../../src/friendly-iframe-embed';
import {registerServiceBuilder} from '../../../../src/service';


describes.realWin('amp-story-page', {amp: true}, env => {
  let win;
  let element;
  let gridLayerEl;
  let page;

  beforeEach(() => {
    win = env.win;

    const mediaPoolRoot = {
      getElement: () => win.document.createElement('div'),
      getMaxMediaElementCounts: () => ({
        [MediaType.VIDEO]: 8,
        [MediaType.AUDIO]: 8,
      }),
    };

    const storeService = new AmpStoryStoreService(win);
    registerServiceBuilder(win, 'story-store', () => storeService);

    const localizationService = new LocalizationService(win);
    registerServiceBuilder(win, 'localization', () => localizationService);

    const story = win.document.createElement('amp-story');
    story.getImpl = () => Promise.resolve(mediaPoolRoot);

    element = win.document.createElement('amp-story-page');
    gridLayerEl = win.document.createElement('amp-story-grid-layer');
    element.getAmpDoc = () => new AmpDocSingle(win);
    element.appendChild(gridLayerEl);
    story.appendChild(element);
    win.document.body.appendChild(story);

    page = new AmpStoryPage(element);
    sandbox.stub(page, 'mutateElement').callsFake(fn => fn());
  });

  afterEach(() => {
    element.remove();
  });

  it('should build a page', () => {
    page.buildCallback();
    return page.layoutCallback();
  });

  it('should not build the animation manager if no element is animated', () => {
    page.buildCallback();
    return page.layoutCallback().then(() => {
      expect(page.animationManager_).to.be.null;
    });
  });

  it('should build the animation manager if an element is animated', () => {
    // Adding an element that has to be animated.
    const animatedEl = win.document.createElement('div');
    animatedEl.setAttribute('animate-in', 'fade-in');
    element.appendChild(animatedEl);
    element.getAmpDoc = () => new AmpDocSingle(win);

    page.buildCallback();
    expect(page.animationManager_).to.exist;
  });

  it('should set an active attribute when state becomes active', () => {
    page.buildCallback();
    return page.layoutCallback().then(() => {
      page.setState(PageState.PLAYING);

      expect(page.element).to.have.attribute('active');
    });
  });

  it('should start the advancement when state becomes active', () => {
    const advancementStartStub = sandbox.stub(page.advancement_, 'start');

    page.buildCallback();
    return page.layoutCallback().then(() => {
      page.setState(PageState.PLAYING);

      expect(advancementStartStub).to.have.been.calledOnce;
    });
  });

  it('should start the animations if needed when state becomes active', () => {
    // Adding an element that has to be animated.
    const animatedEl = win.document.createElement('div');
    animatedEl.setAttribute('animate-in', 'fade-in');
    element.appendChild(animatedEl);

    page.buildCallback();
    return page.layoutCallback().then(() => {
      const animateInStub = sandbox.stub(page.animationManager_, 'animateIn');

      page.setState(PageState.PLAYING);

      expect(animateInStub).to.have.been.calledOnce;
    });
  });

  it('should perform media operations when state becomes active', done => {
    const videoEl = win.document.createElement('video');
    videoEl.setAttribute('src', 'https://example.com/video.mp3');
    gridLayerEl.appendChild(videoEl);

    let mediaPoolMock;

    page.buildCallback();
    page.layoutCallback()
        .then(() => page.mediaPoolPromise_)
        .then(mediaPool => {
          mediaPoolMock = sandbox.mock(mediaPool);
          mediaPoolMock
              .expects('register')
              .withExactArgs(videoEl)
              .once();

          mediaPoolMock
              .expects('preload')
              .withExactArgs(videoEl)
              .returns(Promise.resolve())
              .once();

          mediaPoolMock
              .expects('play')
              .withExactArgs(videoEl)
              .once();

          page.setState(PageState.PLAYING);

          // `setState` runs code that creates subtasks (Promise callbacks).
          // Waits for the next frame to make sure all the subtasks are
          // already executed when we run the assertions.
          win.requestAnimationFrame(() => {
            mediaPoolMock.verify();
            done();
          });
        });
  });

  it('should perform media operations on fie video when active', done => {
    const iframe = win.document.createElement('iframe');
    const fiePromise = installFriendlyIframeEmbed(iframe, gridLayerEl, {
      url: 'https://amp.dev',
      html: '<video src="https://example.com/video.mp3"></video>',
    });

    fiePromise.then(fie => {
      const fieDoc = fie.win.document;
      const videoEl = fieDoc.querySelector('video');

      let mediaPoolMock;

      page.buildCallback();
      page.layoutCallback()
          .then(() => page.mediaPoolPromise_)
          .then(mediaPool => {
            mediaPoolMock = sandbox.mock(mediaPool);
            mediaPoolMock
                .expects('register')
                .withExactArgs(videoEl)
                .once();

            mediaPoolMock
                .expects('preload')
                .withExactArgs(videoEl)
                .returns(Promise.resolve())
                .once();

            mediaPoolMock
                .expects('play')
                .withExactArgs(videoEl)
                .once();

            page.setState(PageState.PLAYING);

            // `setState` runs code that creates subtasks (Promise callbacks).
            // Waits for the next frame to make sure all the subtasks are
            // already executed when we run the assertions.
            win.requestAnimationFrame(() => {
              mediaPoolMock.verify();
              done();
            });
          });
    });
  });

  it('should stop the advancement when state becomes not active', () => {
    const advancementStopStub = sandbox.stub(page.advancement_, 'stop');

    page.buildCallback();
    return page.layoutCallback().then(() => {
      page.setState(PageState.NOT_ACTIVE);

      expect(advancementStopStub).to.have.been.calledOnce;
    });
  });

  it('should stop the animations when state becomes not active', () => {
    // Adding an element that has to be animated.
    const animatedEl = win.document.createElement('div');
    animatedEl.setAttribute('animate-in', 'fade-in');
    element.appendChild(animatedEl);

    page.buildCallback();
    return page.layoutCallback().then(() => {
      const cancelAllStub = sandbox.stub(page.animationManager_, 'cancelAll');

      page.setState(PageState.NOT_ACTIVE);

      expect(cancelAllStub).to.have.been.calledOnce;
    });
  });

  it('should pause/rewind media when state becomes not active', done => {
    const videoEl = win.document.createElement('video');
    videoEl.setAttribute('src', 'https://example.com/video.mp3');
    gridLayerEl.appendChild(videoEl);

    let mediaPoolMock;

    page.buildCallback();
    page.layoutCallback()
        .then(() => page.mediaPoolPromise_)
        .then(mediaPool => {
          mediaPoolMock = sandbox.mock(mediaPool);
          mediaPoolMock
              .expects('pause')
              .withExactArgs(videoEl, true /** rewindToBeginning */)
              .once();

          page.setState(PageState.NOT_ACTIVE);

          // `setState` runs code that creates subtasks (Promise callbacks).
          // Waits for the next frame to make sure all the subtasks are
          // already executed when we run the assertions.
          win.requestAnimationFrame(() => {
            mediaPoolMock.verify();
            done();
          });
        });
  });

  it('should stop the advancement when state becomes paused', () => {
    const advancementStopStub = sandbox.stub(page.advancement_, 'stop');

    page.buildCallback();
    return page.layoutCallback().then(() => {
      page.setState(PageState.PAUSED);

      expect(advancementStopStub).to.have.been.calledOnce;
    });
  });

  it('should pause media when state becomes paused', done => {
    const videoEl = win.document.createElement('video');
    videoEl.setAttribute('src', 'https://example.com/video.mp3');
    gridLayerEl.appendChild(videoEl);

    let mediaPoolMock;

    page.buildCallback();
    page.layoutCallback()
        .then(() => page.mediaPoolPromise_)
        .then(mediaPool => {
          mediaPoolMock = sandbox.mock(mediaPool);
          mediaPoolMock
              .expects('pause')
              .withExactArgs(videoEl, false /** rewindToBeginning */)
              .once();

          page.setState(PageState.PAUSED);

          // `setState` runs code that creates subtasks (Promise callbacks).
          // Waits for the next frame to make sure all the subtasks are
          // already executed when we run the assertions.
          win.requestAnimationFrame(() => {
            mediaPoolMock.verify();
            done();
          });
        });
  });

  it('should find pageIds in a goToPage action', () => {
    const actionButton = createElementWithAttributes(
        win.document,
        'button',
        {'id': 'actionButton',
          'on': 'tap:story.goToPage(id=pageId)'});
    element.appendChild(actionButton);
    page.buildCallback();

    return page.layoutCallback()
        .then(() => {
          const actions = page.actions_();

          expect(actions.length).to.be.equal(1);
          expect(actions[0]).to.be.equal('pageId');
        });
  });

  it('should find pageIds in a goToPage action with multiple actions', () => {
    const multipleActionButton = createElementWithAttributes(
        win.document,
        'button',
        {'id': 'actionButton',
          'on': 'tap:story.goToPage(id=pageId),foo.bar(baz=quux)'});
    element.appendChild(multipleActionButton);
    page.buildCallback();

    return page.layoutCallback()
        .then(() => {
          const actions = page.actions_();

          expect(actions.length).to.be.equal(1);
          expect(actions[0]).to.be.equal('pageId');
        });
  });

  it('should find pageIds in a goToPage action with multiple events', () => {
    const multipleEventsButton = createElementWithAttributes(
        win.document,
        'button',
        {'id': 'actionButton',
          'on':
            'tap:story.goToPage(id=pageId);action:foo.bar(baz=quux'});
    element.appendChild(multipleEventsButton);
    page.buildCallback();

    return page.layoutCallback()
        .then(() => {
          const actions = page.actions_();

          expect(actions.length).to.be.equal(1);
          expect(actions[0]).to.be.equal('pageId');
        });
  });

  it('should not build the open attachment UI if no attachment', () => {
    page.buildCallback();
    return page.layoutCallback().then(() => {
      page.setState(PageState.PLAYING);

      const openAttachmentEl =
          element.querySelector('.i-amphtml-story-page-open-attachment');
      expect(openAttachmentEl).to.not.exist;
    });
  });

  it('should build the open attachment UI if attachment', () => {
    const attachmentEl =
        win.document.createElement('amp-story-page-attachment');
    element.appendChild(attachmentEl);

    page.buildCallback();
    return page.layoutCallback().then(() => {
      page.setState(PageState.PLAYING);

      const openAttachmentEl =
          element.querySelector('.i-amphtml-story-page-open-attachment');
      expect(openAttachmentEl).to.exist;
    });
  });

  it('should build the open attachment UI with custom CTA label', () => {
    const attachmentEl =
        win.document.createElement('amp-story-page-attachment');
    attachmentEl.setAttribute('data-cta-label', 'Custom label');
    element.appendChild(attachmentEl);

    page.buildCallback();
    return page.layoutCallback().then(() => {
      page.setState(PageState.PLAYING);

      const openAttachmentLabelEl =
          element.querySelector('.i-amphtml-story-page-open-attachment-label');
      expect(openAttachmentLabelEl.textContent).to.equal('Custom label');
    });
  });
});
