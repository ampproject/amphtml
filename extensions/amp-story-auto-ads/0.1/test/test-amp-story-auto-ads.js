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

import {AmpStoryAutoAds} from '../amp-story-auto-ads';

describes.realWin('amp-story-auto-ads', {
  amp: {
    extensions: ['amp-story-auto-ads'],
  },
}, env => {

  let win;
  let element;
  let storyElement;
  let ASAAImpl;

  beforeEach(() => {
    win = env.win;
    element = win.document.createElement('amp-story-auto-ads');
    storyElement = win.document.createElement('amp-story');
    win.document.body.appendChild(storyElement);
    storyElement.appendChild(element);
    ASAAImpl = new AmpStoryAutoAds(element);
    ASAAImpl.config_ = {
      'ad-attributes': {
        type: 'doubleclick',
        'data-slot': '/30497360/samfrank_native_v2_a4a',
      },
    };
  });

  describe('glass pane', () => {
    let page;
    let pane;

    beforeEach(() => {
      page = ASAAImpl.createAdPage_();
      pane = page.querySelector('.i-amphtml-glass-pane');
    });

    it('should create glassPane', () => {
      expect(pane).to.exist;
    });

    it('glass pane should have full viewport grid parent', () => {
      const parent = pane.parentElement;
      expect(parent.tagName).to.equal('AMP-STORY-GRID-LAYER');
      expect(parent.getAttribute('template')).to.equal('fill');
    });
  });
});
