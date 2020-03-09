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

import {
  Action,
  AmpStoryStoreService,
  StateProperty,
} from '../../../amp-story/1.0/amp-story-store-service';
import {AmpStoryEducation, State} from '../amp-story-education';
import {LocalizationService} from '../../../../src/service/localization';
import {registerServiceBuilder} from '../../../../src/service';

describes.realWin('amp-story-education', {amp: true}, env => {
  let storeService;
  let storyEducation;
  let win;

  beforeEach(() => {
    win = env.win;

    const localizationService = new LocalizationService(win);
    registerServiceBuilder(win, 'localization', function() {
      return localizationService;
    });

    storeService = new AmpStoryStoreService(win);
    registerServiceBuilder(win, 'story-store', function() {
      return storeService;
    });

    const element = win.document.createElement('amp-story-education');
    win.document.body.appendChild(element);
    storyEducation = new AmpStoryEducation(element);

    env.sandbox.stub(storyEducation, 'mutateElement').callsFake(fn => fn());
  });

  it('should render', () => {
    storyEducation.buildCallback();
    expect(storyEducation.containerEl_).to.have.class(
      'i-amphtml-story-education'
    );
  });

  it('should be hidden by default', () => {
    storyEducation.buildCallback();
    expect(storyEducation.containerEl_).to.have.attribute('hidden');
  });

  it('should be visible when rendering an education step', () => {
    storyEducation.buildCallback();
    // TODO(gmajoulet): remove private method call when viewer messaging is
    // introduced.
    storyEducation.setState_(State.NAVIGATION_TAP);
    expect(storyEducation.containerEl_).to.not.have.attribute('hidden');
  });

  it('should propagate the dir attribute', () => {
    storyEducation.buildCallback();
    storeService.dispatch(Action.TOGGLE_RTL, true);
    expect(storyEducation.containerEl_).to.have.attribute('dir', 'rtl');
  });

  describe('amp-story-education paused state', () => {
    it('should not update the paused state when hidden', () => {
      storeService.dispatch(Action.TOGGLE_PAUSED, false);
      storyEducation.buildCallback();

      expect(storeService.get(StateProperty.PAUSED_STATE)).to.be.false;
    });

    it('should pause the story when visible', () => {
      storeService.dispatch(Action.TOGGLE_PAUSED, false);
      storyEducation.buildCallback();

      // TODO(gmajoulet): remove private method call when viewer messaging is
      // introduced.
      storyEducation.setState_(State.NAVIGATION_TAP);

      expect(storeService.get(StateProperty.PAUSED_STATE)).to.be.true;
    });

    it('should unpause the story once the education is dismissed', () => {
      storeService.dispatch(Action.TOGGLE_PAUSED, false);
      storyEducation.buildCallback();

      // TODO(gmajoulet): remove private method call when viewer messaging is
      // introduced.
      storyEducation.setState_(State.NAVIGATION_SWIPE);
      const clickEvent = new MouseEvent('click', {clientX: 100, clientY: 100});
      storyEducation.containerEl_.dispatchEvent(clickEvent);

      expect(storeService.get(StateProperty.PAUSED_STATE)).to.be.false;
    });

    it('should not unpause a story that was already paused', () => {
      storeService.dispatch(Action.TOGGLE_PAUSED, true);
      storyEducation.buildCallback();

      // TODO(gmajoulet): remove private method call when viewer messaging is
      // introduced.
      storyEducation.setState_(State.NAVIGATION_SWIPE);
      const clickEvent = new MouseEvent('click', {clientX: 100, clientY: 100});
      storyEducation.containerEl_.dispatchEvent(clickEvent);

      expect(storeService.get(StateProperty.PAUSED_STATE)).to.be.true;
    });
  });

  describe('amp-story-education navigation', () => {
    it('should render the first navigation education step', () => {
      storyEducation.buildCallback();

      // TODO(gmajoulet): remove private method call when viewer messaging is
      // introduced.
      storyEducation.setState_(State.NAVIGATION_TAP);
      const navigationTapEl = storyEducation.containerEl_.querySelector(
        '[step="tap"]'
      );

      expect(navigationTapEl).to.exist;
    });

    it('should render the second navigation education step', () => {
      storyEducation.buildCallback();

      // TODO(gmajoulet): remove private method call when viewer messaging is
      // introduced.
      storyEducation.setState_(State.NAVIGATION_SWIPE);
      const navigationSwipeEl = storyEducation.containerEl_.querySelector(
        '[step="swipe"]'
      );

      expect(navigationSwipeEl).to.exist;
    });

    it('should navigate to the next step on tap', () => {
      storyEducation.buildCallback();
      // TODO(gmajoulet): remove private method call when viewer messaging is
      // introduced.
      storyEducation.setState_(State.NAVIGATION_TAP);

      const clickEvent = new MouseEvent('click', {clientX: 100, clientY: 100});
      storyEducation.containerEl_.dispatchEvent(clickEvent);

      const navigationSwipeEl = storyEducation.containerEl_.querySelector(
        '[step="swipe"]'
      );
      expect(navigationSwipeEl).to.exist;
    });

    it('should hide the education on last step tap', () => {
      storyEducation.buildCallback();
      // TODO(gmajoulet): remove private method call when viewer messaging is
      // introduced.
      storyEducation.setState_(State.NAVIGATION_SWIPE);

      const clickEvent = new MouseEvent('click', {clientX: 100, clientY: 100});
      storyEducation.containerEl_.dispatchEvent(clickEvent);

      expect(storyEducation.containerEl_).to.have.attribute('hidden');
    });
  });
});
