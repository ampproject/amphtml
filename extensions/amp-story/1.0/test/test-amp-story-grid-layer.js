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

import {AmpDocSingle} from '../../../../src/service/ampdoc-impl';
import {AmpStoryGridLayer} from '../amp-story-grid-layer';

describes.realWin('amp-story-grid-layer', {amp: true}, env => {
  let win;
  let element;
  let gridLayer;
  let gridLayerEl;

  beforeEach(() => {
    win = env.win;
    const story = win.document.createElement('amp-story');

    element = win.document.createElement('amp-story-page');
    gridLayerEl = win.document.createElement('amp-story-grid-layer');
    element.getAmpDoc = () => new AmpDocSingle(win);
    element.appendChild(gridLayerEl);
    story.appendChild(element);
    win.document.body.appendChild(story);

    gridLayer = new AmpStoryGridLayer(gridLayerEl);
    sandbox.stub(gridLayer, 'mutateElement').callsFake(fn => fn());
  });

  afterEach(() => {
    element.remove();
  });

  it('should style the text if text-background-color', () => {
    const textEl = win.document.createElement('h1');
    textEl.setAttribute('text-background-color', 'lavender');
    gridLayerEl.appendChild(textEl);

    gridLayer.buildCallback();
    return gridLayer.layoutCallback().then(async() => {
      const spanEl =
          gridLayerEl.querySelector('[text-background-color] > span');
      expect(spanEl).to.exist;
      expect(spanEl.style.backgroundColor).to.equal('lavender');
    });
  });
});
