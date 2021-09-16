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

import {Action} from '../amp-story-store-service';
import {AmpStory} from '../amp-story';
import {AmpStoryPage} from '../amp-story-page';
import {CommonSignals} from '../../../../src/core/constants/common-signals';
import {LiveStoryManager} from '../live-story-manager';
import {LocalizationService} from '../../../../src/service/localization';
import {Services} from '../../../../src/services';
import {addAttributesToElement} from '../../../../src/dom';
import {registerServiceBuilder} from '../../../../src/service';

describes.realWin(
  'LiveStoryManager',
  {
    amp: {
      runtimeOn: true,
      extensions: ['amp-story:1.0'],
    },
  },
  (env) => {
    let win;
    let liveStoryManager;
    let ampStory;
    let storyEl;

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
          const storyPage = new AmpStoryPage(page);
          env.sandbox.stub(storyPage, 'mutateElement').callsFake((fn) => fn());
          container.appendChild(page);
          return page;
        });
    }

    beforeEach(async () => {
      win = env.win;

      const localizationService = new LocalizationService(win.document.body);
      env.sandbox
        .stub(Services, 'localizationForDoc')
        .returns(localizationService);

      const viewer = Services.viewerForDoc(env.ampdoc);
      env.sandbox.stub(Services, 'viewerForDoc').returns(viewer);
      env.sandbox.stub(win.history, 'replaceState');

      registerServiceBuilder(win, 'performance', function () {
        return {
          isPerformanceTrackingOn: () => false,
        };
      });

      storyEl = win.document.createElement('amp-story');
      win.document.body.appendChild(storyEl);
      addAttributesToElement(storyEl, {
        'id': 'testStory',
        'live-story': '',
      });

      AmpStory.isBrowserSupported = () => true;

      ampStory = await storyEl.getImpl();
    });

    afterEach(() => {
      storyEl.remove();
    });

    it('should build a dynamic live-list', async () => {
      createPages(ampStory.element, 2, ['cover', 'page-1']);
      ampStory.buildCallback();
      liveStoryManager = new LiveStoryManager(ampStory);
      liveStoryManager.build();

      await ampStory.layoutCallback();
      await ampStory.element.signals().signal(CommonSignals.LOAD_END);
      const liveListEl = ampStory.element.querySelector('amp-live-list');
      expect(liveListEl).to.exist;
    });

    it('live-list id should equal story id + dymanic-list combo', async () => {
      createPages(ampStory.element, 2, ['cover', 'page-1']);
      ampStory.buildCallback();
      liveStoryManager = new LiveStoryManager(ampStory);
      liveStoryManager.build();

      await ampStory.layoutCallback();
      await ampStory.element.signals().signal(CommonSignals.LOAD_END);
      const liveListEl = ampStory.element.querySelector('amp-live-list');
      expect(liveListEl.id).to.equal(
        'i-amphtml-' + ampStory.element.id + '-dynamic-list'
      );
    });

    it('should throw if no story id is set', () => {
      createPages(ampStory.element, 2, ['cover', 'page-1']);
      ampStory.buildCallback();
      liveStoryManager = new LiveStoryManager(ampStory);
      ampStory.element.removeAttribute('id');

      allowConsoleError(() => {
        expect(() => {
          liveStoryManager.build();
        }).to.throw(
          /amp-story must contain id to use the live story functionality/
        );
      });
    });

    it('should append new page from server to client in update', async () => {
      createPages(ampStory.element, 2, ['cover', 'page-1']);
      ampStory.buildCallback();
      expect(ampStory.element.children.length).to.equal(2);
      liveStoryManager = new LiveStoryManager(ampStory);
      liveStoryManager.build();

      await ampStory.layoutCallback();
      await ampStory.element.signals().signal(CommonSignals.LOAD_END);
      const dispatchSpy = env.sandbox.spy(ampStory.storeService_, 'dispatch');

      const newPage = win.document.createElement('amp-story-page');
      // This would normally get added by AmpLiveList.
      newPage.classList.add('amp-live-list-item-new');
      newPage.id = 'new-page';
      ampStory.element.appendChild(newPage);
      liveStoryManager.update();
      expect(dispatchSpy).to.have.been.calledWith(Action.SET_PAGE_IDS, [
        'cover',
        'page-1',
        'new-page',
      ]);
    });
  }
);
