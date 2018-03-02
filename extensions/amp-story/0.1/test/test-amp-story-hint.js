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
import {Services} from '../../../../src/services';

const NOOP = () => {};

describes.fakeWin('amp-story hint layer', {}, env => {
  let win;
  let ampStoryHint;

  beforeEach(() => {
    win = env.win;

    sandbox.stub(Services, 'vsyncFor').callsFake(
        () => ({mutate: task => task()}));
    sandbox.stub(Services, 'timerFor').callsFake(
        () => ({delay: NOOP, cancel: NOOP}));

    ampStoryHint = new AmpStoryHint(win);
  });

  it('should build the UI', () => {
    expect(ampStoryHint.buildHintContainer()).to.not.be.null;
  });

  it('should be able to show navigation help overlay', () => {
    const hideAfterTimeoutStub =
        sandbox.stub(ampStoryHint, 'hideAfterTimeout').callsFake(NOOP);

    const hintContainer = ampStoryHint.buildHintContainer();

    ampStoryHint.showNavigationOverlay();

    expect(hintContainer.className).to.contain('show-navigation-overlay');
    expect(hintContainer.className).to.not.contain('show-first-page-overlay');
    expect(hintContainer.className).to.not.contain('i-amphtml-hidden');
    expect(hideAfterTimeoutStub).to.be.calledOnce;
  });

  it('should be able to show no previous page help overlay', () => {
    const hideAfterTimeoutStub =
        sandbox.stub(ampStoryHint, 'hideAfterTimeout').callsFake(NOOP);

    const hintContainer = ampStoryHint.buildHintContainer();

    ampStoryHint.showFirstPageHintOverlay();

    expect(hintContainer.className).to.contain('show-first-page-overlay');
    expect(hintContainer.className).to.not.contain('show-navigation-overlay');
    expect(hintContainer.className).to.not.contain('i-amphtml-hidden');
    expect(hideAfterTimeoutStub).to.be.calledOnce;
  });

  it('should be able to hide shown hint', () => {
    const hintContainer = ampStoryHint.buildHintContainer();

    ampStoryHint.showNavigationOverlay();
    ampStoryHint.hideAllNavigationHint();

    expect(hintContainer.className).to.contain('i-amphtml-hidden');
  });
});

