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

import {AmpStoryHint} from '../amp-story-hint';
import {renderSimpleTemplate} from './simple-template';

const NOOP = () => {};

describes.fakeWin('amp-story hint layer', {}, env => {
  let win;
  let ampStoryHint;

  beforeEach(() => {
    win = env.win;
    ampStoryHint = new AmpStoryHint(win);
  });

  it('should build the UI', () => {
    expect(ampStoryHint.hintContainer_).to.be.not.null;
  });

  it('should be able to show navigation help overlay', () => {
    ampStoryHint.showNavigationHelp();
    expect(ampStoryHint.hintContainer_.className).to.contain(
        'show-navigation-overlay');
  });

  it('should be able to hide shown hint', () => {
    ampStoryHint.showNavigationHelp();
    ampStoryHint.hideAllNavigationHint();
    expect(ampStoryHint.hintContainer_.className).to.not.contain(
        'show-navigation-overlay');
  });
});

