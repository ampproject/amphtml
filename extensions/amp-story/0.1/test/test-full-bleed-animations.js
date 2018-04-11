import {AmpStory} from '../amp-story';
import {AmpStoryGridLayer} from '../amp-story-grid-layer';
import {AmpStoryPage} from '../amp-story-page';

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

/**
 * @fileoverview Tests full-bleed animations like panning and zooming.
 */

describes.realWin('amp-story-full-bleed-animations', {
  amp: {
    runtimeOn: true,
    extensions: ['amp-story'],
  },
}, env => {
  let win;

  beforeEach(() => {
    win = env.win;
  });

  function createPages(container, count, opt_ids) {
    return Array(count).fill(undefined).map((unused, i) => {
      const page = win.document.createElement('amp-story-page');
      page.id = opt_ids && opt_ids[i] ? opt_ids[i] : `-page-${i}`;

      const img = win.document.createElement('amp-img');
      const gridLayer = win.document.createElement('amp-story-grid-layer');
      img.setAttribute('animate-in', 'pan-down');
      gridLayer.setAttribute('template', 'fill');
      gridLayer.appendChild(img);
      page.appendChild(gridLayer);


      page.getImpl = () => Promise.resolve(new AmpStoryPage(page));
      container.appendChild(page);
      return page;
    });
  }

  it('should add corresponding css class after the grid layer is built', () => {
    const storyElem = win.document.createElement('amp-story');
    win.document.body.appendChild(storyElem);
    AmpStory.isBrowserSupported = () => true;
    const story = new AmpStory(storyElem);

    createPages(story.element, 2, ['cover', 'page-1']);
    return story.layoutCallback()
        .then(() => {
          // Get pages.
          const pageElements =
              story.element.getElementsByTagName('amp-story-page');
          const pages = Array.from(pageElements).map(el => el.getImpl());

          return Promise.all(pages);
        })
        .then(pages => {
          pages[0].layoutCallback().then(() => {
            const imgEls = pages[0].element.getElementsByTagName('amp-img');
            expect(imgEls[0]).to.have.class(
                'i-amphtml-story-grid-template-with-full-bleed-animation');
          });
        });
  });
});
