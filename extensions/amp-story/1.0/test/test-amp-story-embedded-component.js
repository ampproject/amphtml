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

import * as analyticsApi from '../../../../src/analytics';
import {
  Action,
  EmbeddedComponentState,
  getStoreService,
} from '../amp-story-store-service';
import {AmpStoryEmbeddedComponent} from '../amp-story-embedded-component';
import {EventType} from '../events';
import {LocalizationService} from '../../../../src/service/localization';
import {Services} from '../../../../src/services';
import {StoryAnalyticsEvent} from '../story-analytics';
import {addAttributesToElement} from '../../../../src/dom';
import {registerServiceBuilder} from '../../../../src/service';

describes.realWin('amp-story-embedded-component', {amp: true}, env => {
  let component;
  let win;
  let parentEl;
  let storeService;
  let fakePage;
  let clickableEl;
  let fakeCover;
  let fakeComponent;
  let analyticsTriggerStub;

  beforeEach(() => {
    win = env.win;

    // Making sure mutator tasks run synchronously.
    env.sandbox.stub(Services, 'mutatorForDoc').returns({
      mutateElement: (element, callback) => {
        callback();
        return Promise.resolve();
      },
      measureMutateElement: (measure, mutate) => {
        return Promise.resolve()
          .then(measure)
          .then(mutate);
      },
    });

    const localizationService = new LocalizationService(win);
    registerServiceBuilder(win, 'localization', () => localizationService);

    parentEl = win.document.createElement('div');
    win.document.body.appendChild(parentEl);

    fakeCover = win.document.createElement('amp-story-page');
    fakePage = win.document.createElement('amp-story-page');
    addAttributesToElement(fakePage, {'active': ''});

    parentEl.appendChild(fakeCover);
    parentEl.appendChild(fakePage);

    clickableEl = win.document.createElement('a');
    addAttributesToElement(clickableEl, {'href': 'https://google.com'});

    component = new AmpStoryEmbeddedComponent(win, parentEl);
    fakeComponent = {
      element: clickableEl,
      state: EmbeddedComponentState.FOCUSED,
      clientX: 50,
      clientY: 50,
    };

    analyticsTriggerStub = env.sandbox.stub(
      analyticsApi,
      'triggerAnalyticsEvent'
    );
    storeService = getStoreService(win);
    registerServiceBuilder(win, 'story-store', () => storeService);
  });

  it('should build the tooltip', () => {
    component.buildFocusedState_();
    expect(component.focusedStateOverlay_).to.exist;
  });

  it(
    'should append the tooltip to the parentEl when clicking a clickable ' +
      'element',
    () => {
      fakePage.appendChild(clickableEl);

      storeService.dispatch(Action.TOGGLE_INTERACTIVE_COMPONENT, fakeComponent);

      // Children in parentEl: fakeCover, fakePage, and tooltip overlay.
      expect(parentEl.childElementCount).to.equal(3);
    }
  );

  it('should show the tooltip on store property update', async () => {
    fakePage.appendChild(clickableEl);

    storeService.dispatch(Action.TOGGLE_INTERACTIVE_COMPONENT, fakeComponent);

    // Wait for TOOLTIP_CLOSE_ANIMATION_MS is finished before showing tooltip.
    await timeout(150);
    expect(component.focusedStateOverlay_).to.not.have.class(
      'i-amphtml-hidden'
    );
  });

  it('should hide the tooltip when switching page', () => {
    fakePage.appendChild(clickableEl);
    storeService.dispatch(Action.TOGGLE_INTERACTIVE_COMPONENT, fakeComponent);

    storeService.dispatch(Action.CHANGE_PAGE, {id: 'newPageId'});

    expect(component.focusedStateOverlay_).to.have.class('i-amphtml-hidden');
  });

  it('should hide the tooltip when clicking outside of it', () => {
    fakePage.appendChild(clickableEl);
    storeService.dispatch(Action.TOGGLE_INTERACTIVE_COMPONENT, fakeComponent);

    component.focusedStateOverlay_.dispatchEvent(new Event('click'));

    expect(component.focusedStateOverlay_).to.have.class('i-amphtml-hidden');
  });

  it('should navigate when tooltip is open and user clicks on arrow', () => {
    fakePage.appendChild(clickableEl);
    storeService.dispatch(Action.TOGGLE_INTERACTIVE_COMPONENT, fakeComponent);

    const nextPageSpy = env.sandbox.spy();
    parentEl.addEventListener(EventType.NEXT_PAGE, nextPageSpy);

    const rightButton = component.focusedStateOverlay_.querySelector(
      '.i-amphtml-story-focused-state-layer-nav-button' +
        '.i-amphtml-story-tooltip-nav-button-right'
    );

    rightButton.dispatchEvent(new Event('click'));

    expect(nextPageSpy).to.have.been.calledOnce;
  });

  it(
    'should navigate to previous page when clicked on right arrow and ' +
      'story is RTL',
    () => {
      fakePage.appendChild(clickableEl);
      storeService.dispatch(Action.TOGGLE_RTL, true);
      storeService.dispatch(Action.TOGGLE_INTERACTIVE_COMPONENT, fakeComponent);

      const previousPageSpy = env.sandbox.spy();
      parentEl.addEventListener(EventType.PREVIOUS_PAGE, previousPageSpy);

      const rightButton = component.focusedStateOverlay_.querySelector(
        '.i-amphtml-story-focused-state-layer-nav-button' +
          '.i-amphtml-story-tooltip-nav-button-right'
      );

      rightButton.dispatchEvent(new Event('click'));

      expect(previousPageSpy).to.have.been.calledOnce;
    }
  );

  it('should append icon when icon attribute is present', async () => {
    addAttributesToElement(clickableEl, {'data-tooltip-icon': '/my-icon'});
    fakePage.appendChild(clickableEl);
    storeService.dispatch(Action.TOGGLE_INTERACTIVE_COMPONENT, fakeComponent);

    const tooltipIconEl = component.focusedStateOverlay_.querySelector(
      '.i-amphtml-story-tooltip-custom-icon'
    );

    // Wait for TOOLTIP_CLOSE_ANIMATION_MS is finished before building tooltip.
    await timeout(150);
    expect(tooltipIconEl.style['background-image']).to.equal(
      'url("http://localhost:9876/my-icon")'
    );
  });

  it('should find invalid urls', () => {
    addAttributesToElement(clickableEl, {
      'data-tooltip-icon':
        /*eslint no-script-url: 0*/ 'javascript:alert("evil!")',
    });
    fakePage.appendChild(clickableEl);
    expectAsyncConsoleError(
      '[amp-story-embedded-component] The tooltip icon url is invalid'
    );

    storeService.dispatch(Action.TOGGLE_INTERACTIVE_COMPONENT, fakeComponent);
    const tooltipIconEl = component.focusedStateOverlay_.querySelector(
      '.i-amphtml-story-tooltip-custom-icon'
    );

    expect(tooltipIconEl.style['background-image']).to.equal('');
  });

  it('should append text when text attribute is present', async () => {
    addAttributesToElement(clickableEl, {'data-tooltip-text': 'my cool text'});
    fakePage.appendChild(clickableEl);
    storeService.dispatch(Action.TOGGLE_INTERACTIVE_COMPONENT, fakeComponent);

    const tooltipTextEl = component.focusedStateOverlay_.querySelector(
      '.i-amphtml-tooltip-text'
    );

    // Wait for TOOLTIP_CLOSE_ANIMATION_MS is finished before building tooltip.
    await timeout(150);
    expect(tooltipTextEl.textContent).to.equal('my cool text');
  });

  it('should append href url when text attribute is not present', async () => {
    fakePage.appendChild(clickableEl);
    storeService.dispatch(Action.TOGGLE_INTERACTIVE_COMPONENT, fakeComponent);

    const tooltipTextEl = component.focusedStateOverlay_.querySelector(
      '.i-amphtml-tooltip-text'
    );

    // Wait for TOOLTIP_CLOSE_ANIMATION_MS is finished before building tooltip.
    await timeout(150);
    expect(tooltipTextEl.textContent).to.equal('google.com');
  });

  it('should fire analytics event when entering a tooltip', () => {
    fakePage.appendChild(clickableEl);
    storeService.dispatch(Action.TOGGLE_INTERACTIVE_COMPONENT, {
      element: clickableEl,
      state: EmbeddedComponentState.FOCUSED,
    });

    expect(analyticsTriggerStub).to.be.calledWith(
      parentEl,
      StoryAnalyticsEvent.FOCUS
    );
  });

  it('should send data-var specified by publisher in analytics event', () => {
    addAttributesToElement(clickableEl, {
      'data-vars-tooltip-id': '1234',
    });
    fakePage.appendChild(clickableEl);

    storeService.dispatch(Action.TOGGLE_INTERACTIVE_COMPONENT, {
      element: clickableEl,
      state: EmbeddedComponentState.FOCUSED,
    });

    expect(analyticsTriggerStub).to.be.calledWithMatch(
      parentEl,
      StoryAnalyticsEvent.FOCUS,
      {
        tooltipId: '1234',
      }
    );
  });

  it('should fire analytics event when clicking on the tooltip of a link', () => {
    fakePage.appendChild(clickableEl);
    storeService.dispatch(Action.TOGGLE_INTERACTIVE_COMPONENT, {
      element: clickableEl,
      state: EmbeddedComponentState.FOCUSED,
    });

    const tooltip = component
      .getShadowRootForTesting()
      .querySelector('a.i-amphtml-story-tooltip');
    tooltip.onclick = e => {
      e.preventDefault(); // Make the test not actually navigate.
    };

    tooltip.click();

    expect(analyticsTriggerStub).to.be.calledWith(
      parentEl,
      StoryAnalyticsEvent.CLICK_THROUGH
    );
  });

  it('should fire analytics event when clicking on the tooltip of a tweet', () => {
    clickableEl = win.document.createElement('amp-twitter');
    addAttributesToElement(clickableEl, {
      'data-tweetid': '1166723359696130049',
    });
    fakePage.appendChild(clickableEl);

    storeService.dispatch(Action.TOGGLE_INTERACTIVE_COMPONENT, {
      element: clickableEl,
      state: EmbeddedComponentState.FOCUSED,
    });

    const tooltip = component
      .getShadowRootForTesting()
      .querySelector('a.i-amphtml-story-tooltip');
    tooltip.onclick = e => {
      e.preventDefault(); // Make the test not actually navigate.
    };

    tooltip.click();

    expect(analyticsTriggerStub).to.be.calledWith(
      parentEl,
      StoryAnalyticsEvent.FOCUS
    );
  });
});

/**
 * @param {number} ms
 * @return {!Promise}
 */
function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
