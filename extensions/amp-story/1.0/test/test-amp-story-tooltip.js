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

import {Action, AmpStoryStoreService} from '../amp-story-store-service';
import {AmpStoryEmbeddedComponent} from '../amp-story-embedded-component';
import {EventType} from '../events';
import {Services} from '../../../../src/services';
import {addAttributesToElement} from '../../../../src/dom';
import {registerServiceBuilder} from '../../../../src/service';

describes.realWin('amp-story-embedded-component', {amp: true}, env => {
  let tooltip;
  let win;
  let parentEl;
  let storeService;
  let fakePage;
  let clickableEl;
  let fakeCover;

  beforeEach(() => {
    win = env.win;
    storeService = new AmpStoryStoreService(win);
    registerServiceBuilder(win, 'story-store', () => storeService);
    clickableEl = win.document.createElement('a');

    // Making sure resource tasks run synchronously.
    sandbox.stub(Services, 'resourcesForDoc').returns({
      mutateElement: (element, callback) => {
        callback();
        return Promise.resolve();
      },
      measureMutateElement: (measure, mutate) => {
        return Promise.resolve().then(measure).then(mutate);
      },
    });

    parentEl = win.document.createElement('div');
    win.document.body.appendChild(parentEl);

    fakeCover = win.document.createElement('amp-story-page');
    fakePage = win.document.createElement('amp-story-page');
    addAttributesToElement(fakePage, {'active': ''});

    parentEl.appendChild(fakeCover);
    parentEl.appendChild(fakePage);

    tooltip = new AmpStoryEmbeddedComponent(win, parentEl);
  });

  it('should build the tooltip', () => {
    tooltip.build_();
    expect(tooltip.isBuilt_).to.be.true;
    expect(tooltip.focusedStateOverlay_).to.exist;
  });

  it('should append the tooltip to the parentEl when clicking a clickable ' +
    'element', () => {
    fakePage.appendChild(clickableEl);

    storeService.dispatch(Action.TOGGLE_EMBEDDED_COMPONENT, clickableEl);

    // Children in parentEl: fakeCover, fakePage, and tooltip overlay.
    expect(parentEl.childElementCount).to.equal(3);
  });

  it('should show the tooltip on store property update', () => {
    fakePage.appendChild(clickableEl);

    storeService.dispatch(Action.TOGGLE_EMBEDDED_COMPONENT, clickableEl);

    expect(tooltip.focusedStateOverlay_).to.not.have.class('i-amphtml-hidden');
  });

  it('should hide the tooltip on store property update', () => {
    fakePage.appendChild(clickableEl);

    storeService.dispatch(Action.TOGGLE_EMBEDDED_COMPONENT, clickableEl);
    storeService.dispatch(Action.TOGGLE_EMBEDDED_COMPONENT, null);

    expect(tooltip.focusedStateOverlay_).to.have.class('i-amphtml-hidden');
  });

  it('should hide the tooltip when switching page', () => {
    fakePage.appendChild(clickableEl);
    storeService.dispatch(Action.TOGGLE_EMBEDDED_COMPONENT, clickableEl);

    storeService.dispatch(Action.CHANGE_PAGE, {id: 'newPageId'});

    expect(tooltip.focusedStateOverlay_).to.have.class('i-amphtml-hidden');
  });

  it('should hide the tooltip when clicking outside of it', () => {
    fakePage.appendChild(clickableEl);
    storeService.dispatch(Action.TOGGLE_EMBEDDED_COMPONENT, clickableEl);

    tooltip.focusedStateOverlay_.dispatchEvent(new Event('click'));

    expect(tooltip.focusedStateOverlay_).to.have.class('i-amphtml-hidden');
  });

  it('should navigate when tooltip is open and user clicks on arrow', () => {
    fakePage.appendChild(clickableEl);
    storeService.dispatch(Action.TOGGLE_EMBEDDED_COMPONENT, clickableEl);

    const nextPageSpy = sandbox.spy();
    parentEl.addEventListener(EventType.NEXT_PAGE, nextPageSpy);

    const rightButton = tooltip.focusedStateOverlay_
        .querySelector('.i-amphtml-story-focused-state-layer-nav-button' +
          '.i-amphtml-story-tooltip-nav-button-right');

    rightButton.dispatchEvent(new Event('click'));

    expect(nextPageSpy).to.have.been.calledOnce;
  });

  it('should navigate to previous page when clicked on right arrow and ' +
    'story is RTL', () => {
    fakePage.appendChild(clickableEl);
    storeService.dispatch(Action.TOGGLE_RTL, true);
    storeService.dispatch(Action.TOGGLE_EMBEDDED_COMPONENT, clickableEl);

    const previousPageSpy = sandbox.spy();
    parentEl.addEventListener(EventType.PREVIOUS_PAGE, previousPageSpy);

    const rightButton = tooltip.focusedStateOverlay_
        .querySelector('.i-amphtml-story-focused-state-layer-nav-button' +
          '.i-amphtml-story-tooltip-nav-button-right');

    rightButton.dispatchEvent(new Event('click'));

    expect(previousPageSpy).to.have.been.calledOnce;
  });

  it('should append icon when icon attribute is present', () => {
    addAttributesToElement(clickableEl, {'data-tooltip-icon': '/my-icon'});
    fakePage.appendChild(clickableEl);
    storeService.dispatch(Action.TOGGLE_EMBEDDED_COMPONENT, clickableEl);

    const tooltipIconEl = tooltip.focusedStateOverlay_
        .querySelector('.i-amphtml-story-tooltip-icon').firstElementChild;

    expect(tooltipIconEl).to.have.attribute('src');
    expect(tooltipIconEl.getAttribute('src'))
        .to.equal('http://localhost:9876/my-icon');
  });

  it('should find invalid urls', () => {
    addAttributesToElement(clickableEl,
        {'data-tooltip-icon':
        /*eslint no-script-url: 0*/ 'javascript:alert("evil!")'});
    fakePage.appendChild(clickableEl);
    expectAsyncConsoleError(
        '[amp-story-embedded-component] The tooltip icon url is invalid');

    storeService.dispatch(Action.TOGGLE_EMBEDDED_COMPONENT, clickableEl);
    const tooltipIconEl = tooltip.focusedStateOverlay_
        .querySelector('.i-amphtml-story-tooltip-icon').firstElementChild;
    expect(tooltipIconEl).to.not.have.attribute('src');
  });

  it('should append text when text attribute is present', () => {
    addAttributesToElement(clickableEl, {'data-tooltip-text': 'my cool text'});
    fakePage.appendChild(clickableEl);
    storeService.dispatch(Action.TOGGLE_EMBEDDED_COMPONENT, clickableEl);

    const tooltipTextEl = tooltip.focusedStateOverlay_
        .querySelector('.i-amphtml-tooltip-text');

    expect(tooltipTextEl.textContent).to.equal('my cool text');
  });

  it('should append local url when text attribute is not present', () => {
    fakePage.appendChild(clickableEl);
    storeService.dispatch(Action.TOGGLE_EMBEDDED_COMPONENT, clickableEl);

    const tooltipTextEl = tooltip.focusedStateOverlay_
        .querySelector('.i-amphtml-tooltip-text');

    expect(tooltipTextEl.textContent).to.equal('localhost');
  });
});
