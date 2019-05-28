/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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
import {Action} from '../amp-story-store-service';
import {AmpStory} from '../amp-story';
import {AmpStoryPage} from '../amp-story-page';
import {EventType} from '../events';
import {Keys} from '../../../../src/utils/key-codes';
import {LocalizationService} from '../../../../src/service/localization';
import {PaginationButtons} from '../pagination-buttons';
import {registerServiceBuilder} from '../../../../src/service';

const NOOP = () => {};
const IDENTITY_FN = x => x;
// Represents the correct value of KeyboardEvent.which for the Right Arrow
const KEYBOARD_EVENT_WHICH_RIGHT_ARROW = 39;

describes.realWin(
  'amp-story',
  {
    amp: {
      runtimeOn: true,
      extensions: ['amp-story'],
    },
  },
  env => {
    let win;
    let element;
    let story;

    /**
     * @param {!Element} container
     * @param {boolean=} opt_active
     * @return {!Element}
     */
    function appendEmptyPage(container, opt_active) {
      const page = document.createElement('amp-story-page');
      page.id = '-empty-page';
      if (opt_active) {
        page.setAttribute('active', true);
      }
      container.appendChild(page);
      return page;
    }

    /**
     * @param {!Element} container
     * @param {number} count
     * @param {Array<string>=} opt_ids
     * @return {!Array<!Element>}
     */
    function createPages(container, count, opt_ids) {
      return Array(count)
        .fill(undefined)
        .map((unused, i) => {
          const page = win.document.createElement('amp-story-page');
          page.id = opt_ids && opt_ids[i] ? opt_ids[i] : `-page-${i}`;
          page.getImpl = () => Promise.resolve(new AmpStoryPage(page));
          container.appendChild(page);
          return page;
        });
    }

    /**
     * @param {string} eventType
     * @return {!Event}
     */
    function createEvent(eventType) {
      const eventObj = document.createEventObject
        ? document.createEventObject()
        : document.createEvent('Events');
      if (eventObj.initEvent) {
        eventObj.initEvent(eventType, true, true);
      }
      return eventObj;
    }

    beforeEach(() => {
      win = env.win;
      element = win.document.createElement('amp-story');
      win.document.body.appendChild(element);

      const localizationService = new LocalizationService(win);
      registerServiceBuilder(
        win,
        'localization-v01',
        () => localizationService
      );

      AmpStory.isBrowserSupported = () => true;
      story = new AmpStory(element);
      // TODO(alanorozco): Test active page event triggers once the stubbable
      // `Services` module is part of the amphtml-story repo.
      // sandbox.stub(element.implementation_,
      // 'triggerActiveEventForPage_').callsFake(NOOP);
    });

    afterEach(() => {
      sandbox.restore();
      element.remove();
    });

    it('should build with the expected number of pages', () => {
      const pagesCount = 2;
      createPages(story.element, pagesCount, ['cover', 'page-1']);

      return story.layoutCallback().then(() => {
        expect(story.getPageCount()).to.equal(pagesCount);
      });
    });

    it('should activate the first page when built', () => {
      createPages(story.element, 2, ['cover', 'page-1']);

      return story
        .layoutCallback()
        .then(() => {
          // Getting all the AmpStoryPage objets.
          const pageElements = story.element.getElementsByTagName(
            'amp-story-page'
          );
          const pages = Array.from(pageElements).map(el => el.getImpl());

          return Promise.all(pages);
        })
        .then(pages => {
          // Only the first page should be active.
          for (let i = 0; i < pages.length; i++) {
            i === 0
              ? expect(pages[i].isActive()).to.be.true
              : expect(pages[i].isActive()).to.be.false;
          }
        });
    });

    it('should update the navigation state when built', () => {
      const firstPageId = 'cover';
      const pageCount = 2;
      createPages(story.element, pageCount, [firstPageId, 'page-1']);
      const updateActivePageStub = sandbox.stub(
        story.navigationState_,
        'updateActivePage'
      );

      return story.layoutCallback().then(() => {
        expect(updateActivePageStub).to.have.been.calledWith(
          0,
          pageCount,
          firstPageId
        );
      });
    });

    it('should preload the bookend if navigating to the last page', () => {
      createPages(story.element, 1, ['cover']);

      const buildBookendStub = sandbox.stub(story.bookend_, 'build');
      const loadBookendStub = sandbox
        .stub(story.bookend_, 'loadConfig')
        .resolves({});

      return story.layoutCallback().then(() => {
        expect(buildBookendStub).to.have.been.calledOnce;
        expect(loadBookendStub).to.have.been.calledOnce;
      });
    });

    it('should not preload the bookend if not on the last page', () => {
      createPages(story.element, 2, ['cover']);

      const buildBookendStub = sandbox.stub(story.bookend_, 'build');
      const loadBookendStub = sandbox
        .stub(story.bookend_, 'loadConfig')
        .resolves({});

      return story.layoutCallback().then(() => {
        expect(buildBookendStub).to.not.have.been.called;
        expect(loadBookendStub).to.not.have.been.called;
      });
    });

    it('should prerender/load the share menu', () => {
      createPages(story.element, 1, ['cover']);

      sandbox.stub(story.bookend_, 'build');
      const buildShareMenuStub = sandbox.stub(story.shareMenu_, 'build');

      return story.layoutCallback().then(() => {
        expect(buildShareMenuStub).to.have.been.calledOnce;
      });
    });

    it('should not prerender/load the share menu on desktop', () => {
      createPages(story.element, 1, ['cover']);

      story.storeService_.dispatch(Action.TOGGLE_DESKTOP, true);

      sandbox.stub(story.bookend_, 'build');
      const buildShareMenuStub = sandbox.stub(story.shareMenu_, 'build');

      return story.layoutCallback().then(() => {
        expect(buildShareMenuStub).to.not.have.been.called;
      });
    });

    // TODO(#11639): Re-enable this test.
    it.skip('should hide bookend when CLOSE_BOOKEND is triggered', () => {
      const hideBookendStub = sandbox.stub(
        element.implementation_,
        'hideBookend_',
        NOOP
      );

      appendEmptyPage(element);

      element.build();

      element.dispatchEvent(new Event(EventType.CLOSE_BOOKEND));

      expect(hideBookendStub).to.have.been.calledOnce;
    });

    // TODO(#11639): Re-enable this test.
    it.skip('should return a valid page index', () => {
      const count = 5;

      const pages = createPages(element, count);

      pages.forEach((page, i) => {
        expect(element.implementation_.getPageIndex(page)).to.equal(i);
      });
    });

    // TODO(#11639): Re-enable this test.
    it.skip('should update progress bar when switching pages', () => {
      const impl = element.implementation_;
      const count = 10;
      const index = 2;

      const page = win.document.createElement('div');

      const updateProgressBarStub = sandbox
        .stub(impl.systemLayer_, 'updateProgressBar')
        .callsFake(NOOP);

      appendEmptyPage(element, /* opt_active */ true);

      sandbox.stub(impl, 'getPageCount').returns(count);
      sandbox
        .stub(impl, 'getPageIndex')
        .withArgs(page)
        .returns(index);

      impl.switchTo_(page);

      // first page is not counted as part of the progress
      expect(updateProgressBarStub).to.have.been.calledWith(index, count - 1);
    });

    // TODO(#11639): Re-enable this test.
    it.skip('should pause/resume pages when switching pages', () => {
      const impl = element.implementation_;
      const pages = createPages(element, 5);
      impl.schedulePause = sandbox.spy();
      impl.scheduleResume = sandbox.spy();

      const oldPage = pages[0];
      const newPage = pages[1];

      element.build();

      return impl.switchTo_(newPage).then(() => {
        expect(impl.schedulePause).to.have.been.calledWith(oldPage);
        expect(impl.scheduleResume).to.have.been.calledWith(newPage);
      });
    });

    // TODO(#11639): Re-enable this test.
    it.skip('should go to next page on right arrow keydown', () => {
      const pages = createPages(element, 5);

      element.build();

      expect(pages[0].hasAttribute('active')).to.be.true;
      expect(pages[1].hasAttribute('active')).to.be.false;

      // Stubbing because we need to assert synchronously
      sandbox
        .stub(element.implementation_, 'mutateElement')
        .callsFake(mutator => {
          mutator();
          return Promise.resolve();
        });

      const eventObj = createEvent('keydown');
      eventObj.key = Keys.RIGHT_ARROW;
      eventObj.which = KEYBOARD_EVENT_WHICH_RIGHT_ARROW;
      const docEl = win.document.documentElement;
      docEl.dispatchEvent
        ? docEl.dispatchEvent(eventObj)
        : docEl.fireEvent('onkeydown', eventObj);

      expect(pages[0].hasAttribute('active')).to.be.false;
      expect(pages[1].hasAttribute('active')).to.be.true;
    });

    it('lock body when amp-story is initialized', () => {
      story.lockBody_();
      expect(win.document.body.style.getPropertyValue('overflow')).to.be.equal(
        'hidden'
      );
      expect(
        win.document.documentElement.style.getPropertyValue('overflow')
      ).to.be.equal('hidden');
    });

    it('builds and attaches pagination buttons ', () => {
      const paginationButtonsStub = {
        attach: sandbox.spy(),
        onNavigationStateChange: sandbox.spy(),
      };
      sandbox.stub(PaginationButtons, 'create').returns(paginationButtonsStub);
      story.buildPaginationButtonsForTesting();
      expect(paginationButtonsStub.attach).to.have.been.calledWith(
        story.element
      );
    });

    it.skip('toggles `i-amphtml-story-landscape` based on height and width', () => {
      story.element.style.width = '11px';
      story.element.style.height = '10px';
      const isDesktopStub = sandbox.stub(story, 'isDesktop_').returns(false);
      story.vsync_ = {
        run: (task, state) => {
          if (task.measure) {
            task.measure(state);
          }
          if (task.mutate) {
            task.mutate(state);
          }
        },
      };
      story.onResize();
      expect(isDesktopStub).to.be.calledOnce;
      expect(story.element.classList.contains('i-amphtml-story-landscape')).to
        .be.true;
      story.element.style.width = '10px';
      story.element.style.height = '11px';
      story.onResize();
      expect(isDesktopStub).to.be.calledTwice;
      expect(story.element.classList.contains('i-amphtml-story-landscape')).to
        .be.false;
    });

    it('should update page id in store', () => {
      const firstPageId = 'page-one';
      const pageCount = 2;
      createPages(story.element, pageCount, [firstPageId, 'page-1']);
      const dispatchStub = sandbox.stub(story.storeService_, 'dispatch');

      return story.layoutCallback().then(() => {
        expect(dispatchStub).to.have.been.calledWith(Action.CHANGE_PAGE, {
          id: firstPageId,
          index: 0,
        });
      });
    });

    it('should update page id in browser history', () => {
      // Have to stub this because tests run in iframe and you can't write
      // history from another domain (about:srcdoc)
      const replaceStub = sandbox.stub(win.history, 'replaceState');
      const firstPageId = 'page-zero';
      const pageCount = 2;
      createPages(story.element, pageCount, [firstPageId, 'page-1']);

      story.buildCallback();
      return story.layoutCallback().then(() => {
        return expect(replaceStub).to.have.been.calledWith(
          {ampStoryPageId: firstPageId},
          ''
        );
      });
    });

    it('should NOT update page id in browser history if ad', () => {
      // Have to stub this because tests run in iframe and you can't write
      // history from another domain (about:srcdoc)
      const replaceStub = sandbox.stub(win.history, 'replaceState');
      const firstPageId = 'i-amphtml-ad-page-1';
      const pageCount = 2;
      const pages = createPages(story.element, pageCount, [
        firstPageId,
        'page-1',
      ]);
      const firstPage = pages[0];
      firstPage.setAttribute('ad', '');

      story.buildCallback();
      return story.layoutCallback().then(() => {
        return expect(replaceStub).to.not.have.been.called;
      });
    });
  }
);

describes.realWin(
  'amp-story origin whitelist',
  {
    amp: {
      extensions: ['amp-story'],
    },
  },
  env => {
    let win;
    let element;
    let story;

    beforeEach(() => {
      win = env.win;
      element = win.document.createElement('amp-story');
      win.document.body.appendChild(element);

      story = new AmpStory(element);
      story.hashOrigin_ = IDENTITY_FN;
    });

    it('should allow exact whitelisted origin with https scheme', () => {
      story.originWhitelist_ = ['example.com'];
      expect(story.isOriginWhitelisted_('https://example.com')).to.be.true;
    });

    it('should allow exact whitelisted origin with http scheme', () => {
      story.originWhitelist_ = ['example.com'];
      expect(story.isOriginWhitelisted_('http://example.com')).to.be.true;
    });

    it('should allow www subdomain of origin', () => {
      story.originWhitelist_ = ['example.com'];
      expect(story.isOriginWhitelisted_('https://www.example.com')).to.be.true;
    });

    it('should allow subdomain of origin', () => {
      story.originWhitelist_ = ['example.com'];
      expect(story.isOriginWhitelisted_('https://foobar.example.com')).to.be
        .true;
    });

    it('should not allow exact whitelisted domain under different tld', () => {
      story.originWhitelist_ = ['example.com'];
      expect(story.isOriginWhitelisted_('https://example.co.uk')).to.be.false;
    });

    it('should not allow exact whitelisted domain infixed in another tld', () => {
      story.originWhitelist_ = ['example.co.uk'];
      expect(story.isOriginWhitelisted_('https://example.co')).to.be.false;
    });

    it('should not allow domain that contains whitelisted domain', () => {
      story.originWhitelist_ = ['example.co'];
      expect(story.isOriginWhitelisted_('https://example.co.uk')).to.be.false;
    });
  }
);
