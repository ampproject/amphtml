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

import {AmpStory} from '../amp-story';
import {AmpStoryPage} from '../amp-story-page';
import {LiveStoryManager} from '../live-story-manager';
import {addAttributesToElement} from '../../../../src/dom';

describes.realWin('LiveStoryManager', {amp: true}, env => {
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
    return Array(count).fill(undefined).map((unused, i) => {
      const page = win.document.createElement('amp-story-page');
      page.id = opt_ids && opt_ids[i] ? opt_ids[i] : `-page-${i}`;
      const storyPage = new AmpStoryPage(page);
      page.getImpl = () => Promise.resolve(storyPage);
      sandbox.stub(storyPage, 'mutateElement').callsFake(fn => fn());
      container.appendChild(page);
      return page;
    });
  }

  beforeEach(() => {
    win = env.win;
    storyEl = win.document.createElement('amp-story');
    addAttributesToElement(storyEl,
        {'id': 'testStory', 'dynamic-live-list': 'storyLiveList'});
    ampStory = new AmpStory(storyEl);
    liveStoryManager = new LiveStoryManager(ampStory);
  });

  it('should build a dynamic live-list', () => {
    liveStoryManager.build();

    const liveListEl = ampStory.element.querySelector('amp-live-list');
    expect(liveListEl).to.exist;
  });

  it('live-list id should correspond to attribute dynamic-live-list', () => {
    liveStoryManager.build();
    const storyAttr = ampStory.element.getAttribute('dynamic-live-list');

    const liveListEl = ampStory.element.querySelector('amp-live-list');
    expect(storyAttr).to.equal(liveListEl.id);
  });

  it('should throw if no dynamic-live-list attr is set', () => {
    ampStory.element.setAttribute('dynamic-live-list', '');

    allowConsoleError(() => { expect(() => {
      liveStoryManager.build();
    }).to.throw(/Story must contain dynamic-live-list to build an amp-live-list/); });
  });

  it('should throw if no story id is set', () => {
    ampStory.element.setAttribute('id', '');

    allowConsoleError(() => { expect(() => {
      liveStoryManager.build();
    }).to.throw(/Story must contain id to build an amp-live-list/); });
  });


  it('should append new page from server on update', () => {
    const currentPages = createPages(ampStory.element, 2, ['cover', 'page-1']);
    expect(ampStory.element.children.length).to.equal(2);

    const fromServerStoryEl = win.document.createElement('amp-story');
    const fromServerStory = new AmpStory(fromServerStoryEl);
    const fromServerPages =
      createPages(fromServerStory.element, 2, ['cover', 'page-1', 'page-3']);
    const fromServerLastPage = fromServerPages[fromServerPages.length - 1];
    fromServerLastPage.classList.add('amp-live-list-item-new');

    liveStoryManager.build();
    liveStoryManager.update(fromServerStory.element, currentPages);

    expect(ampStory.element.children.length).to.equal(3);

    const fromClientLastPage =
        ampStory.element.querySelector('amp-story-page:last-of-type');

    expect(fromClientLastPage.id).to.equal(fromServerLastPage.id);
  });
});
