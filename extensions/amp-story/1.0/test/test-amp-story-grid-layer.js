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

import {Action, AmpStoryStoreService} from '../amp-story-store-service';
import {AmpDocSingle} from '../../../../src/service/ampdoc-impl';
import {AmpStoryGridLayer} from '../amp-story-grid-layer';
import {AmpStoryPage} from '../amp-story-page';
import {MediaType} from '../media-pool';
import {Services} from '../../../../src/services';
import {registerServiceBuilder} from '../../../../src/service';

describes.realWin('amp-story-grid-layer', {amp: true}, (env) => {
  let win;
  let element;
  let gridLayerEl;
  let page;
  let grid;
  let storeService;

  beforeEach(() => {
    win = env.win;

    env.sandbox
      .stub(Services, 'vsyncFor')
      .callsFake(() => ({mutate: (task) => task()}));

    const mediaPoolRoot = {
      getElement: () => win.document.createElement('div'),
      getMaxMediaElementCounts: () => ({
        [MediaType.VIDEO]: 8,
        [MediaType.AUDIO]: 8,
      }),
    };

    storeService = new AmpStoryStoreService(win);
    registerServiceBuilder(win, 'story-store', function () {
      return storeService;
    });

    registerServiceBuilder(win, 'performance', function () {
      return {
        isPerformanceTrackingOn: () => false,
      };
    });

    const story = win.document.createElement('amp-story');
    story.getImpl = () => Promise.resolve(mediaPoolRoot);

    element = win.document.createElement('amp-story-page');
    gridLayerEl = win.document.createElement('amp-story-grid-layer');
    element.getAmpDoc = () => new AmpDocSingle(win);
    element.appendChild(gridLayerEl);
    story.appendChild(element);
    win.document.body.appendChild(story);

    page = new AmpStoryPage(element);
    env.sandbox.stub(page, 'mutateElement').callsFake((fn) => fn());

    grid = new AmpStoryGridLayer(gridLayerEl);
  });

  afterEach(() => {
    element.remove();
  });

  async function buildGridLayer() {
    page.buildCallback();
    await page.layoutCallback();
    grid.buildCallback();
    await grid.layoutCallback();
  }

  it('should set the vertical aspect-ratio', async () => {
    gridLayerEl.setAttribute('aspect-ratio', '9:16');
    await buildGridLayer();

    storeService.dispatch(Action.SET_PAGE_SIZE, {width: 1000, height: 1000});

    expect(gridLayerEl).to.have.class('i-amphtml-story-grid-template-aspect');
    expect(
      parseInt(
        gridLayerEl.style.getPropertyValue('--i-amphtml-story-layer-width'),
        10
      )
    ).to.equal(562);
    expect(
      parseInt(
        gridLayerEl.style.getPropertyValue('--i-amphtml-story-layer-height'),
        10
      )
    ).to.equal(1000);
  });

  it('should set the horizontal aspect-ratio', async () => {
    gridLayerEl.setAttribute('aspect-ratio', '16:9');
    await buildGridLayer();

    storeService.dispatch(Action.SET_PAGE_SIZE, {width: 1000, height: 1000});

    expect(gridLayerEl).to.have.class('i-amphtml-story-grid-template-aspect');
    expect(
      parseInt(
        gridLayerEl.style.getPropertyValue('--i-amphtml-story-layer-width'),
        10
      )
    ).to.equal(1000);
    expect(
      parseInt(
        gridLayerEl.style.getPropertyValue('--i-amphtml-story-layer-height'),
        10
      )
    ).to.equal(562);
  });
});
