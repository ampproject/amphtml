/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
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

import {FocusHistory} from '../../src/focus-history';
import {installTimerService} from '../../src/service/timer-impl';


describe('FocusHistory', () => {

  let sandbox;
  let clock;
  let testDoc;
  let eventListeners;
  let testWindow;
  let windowEventListeners;
  let focusHistory;

  beforeEach(() => {
    sandbox = sinon.sandbox;
    clock = sandbox.useFakeTimers();

    eventListeners = {};
    testDoc = {
      addEventListener: (eventType, handler, capture) => {
        if (!capture) {
          throw new Error('the focus listener must be capture');
        }
        eventListeners[eventType] = handler;
      },
    };

    windowEventListeners = {};
    testWindow = {
      document: testDoc,
      addEventListener: (eventType, handler) => {
        windowEventListeners[eventType] = handler;
      },
      setTimeout: window.setTimeout,
      clearTimeout: window.clearTimeout,
      Promise: window.Promise,
    };
    installTimerService(testWindow);
    focusHistory = new FocusHistory(testWindow, 10000);
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should subscribe to focus events', () => {
    expect(eventListeners['focus']).to.exist;
    expect(windowEventListeners['blur']).to.exist;
    expect(focusHistory.getLast()).to.be.null;
  });

  it('should push focused elements with timestamp', () => {
    const el1 = document.createElement('div');
    const el2 = document.createElement('div');
    eventListeners['focus']({target: el1});
    clock.tick(100);
    eventListeners['focus']({target: el2});

    expect(focusHistory.getLast()).to.equal(el2);
    expect(focusHistory.history_.length).to.equal(2);
    expect(focusHistory.history_[0]).to.deep.equal({el: el1, time: 0});
    expect(focusHistory.history_[1]).to.deep.equal({el: el1, time: 100});
  });

  it('should push focused elements with timestamp after window.blur', () => {
    windowEventListeners['blur']({});
    expect(focusHistory.history_.length).to.equal(0);

    const el1 = document.createElement('div');
    testDoc.activeElement = el1;
    clock.tick(1000);
    expect(focusHistory.history_.length).to.equal(1);
    expect(focusHistory.history_[0].el).to.deep.equal(el1);
  });

  it('should push and purge', () => {
    const el1 = document.createElement('div');
    const el2 = document.createElement('div');
    eventListeners['focus']({target: el1});
    clock.tick(100000);
    eventListeners['focus']({target: el2});

    expect(focusHistory.getLast()).to.equal(el2);
    expect(focusHistory.history_.length).to.equal(1);
    expect(focusHistory.history_[0]).to.deep.equal({el: el1, time: 100000});
  });

  it('should replace second push with a new timestamp', () => {
    const el1 = document.createElement('div');
    const el2 = document.createElement('div');
    eventListeners['focus']({target: el1});
    clock.tick(100);
    eventListeners['focus']({target: el2});
    expect(focusHistory.history_.length).to.equal(2);

    clock.tick(100);
    eventListeners['focus']({target: el2});
    expect(focusHistory.history_.length).to.equal(2);
    expect(focusHistory.getLast()).to.equal(el2);
    expect(focusHistory.history_[0]).to.deep.equal({el: el1, time: 0});
    expect(focusHistory.history_[1]).to.deep.equal({el: el1, time: 200});
  });

  it('should purge elements before timestamp', () => {
    const el1 = document.createElement('div');
    const el2 = document.createElement('div');
    clock.tick(100);
    eventListeners['focus']({target: el1}); // time=100
    clock.tick(100);
    eventListeners['focus']({target: el2}); // time=200

    focusHistory.purgeBefore(50);
    expect(focusHistory.history_.length).to.equal(2);

    focusHistory.purgeBefore(100);
    expect(focusHistory.history_.length).to.equal(2);

    focusHistory.purgeBefore(101);
    expect(focusHistory.history_.length).to.equal(1);
    expect(focusHistory.history_[0].el).to.equal(el2);

    focusHistory.purgeBefore(201);
    expect(focusHistory.history_.length).to.equal(0);
  });

  it('should return false when nothing matches descendants', () => {
    const el0 = document.createElement('div');
    expect(focusHistory.hasDescendantsOf(el0)).to.be.false;

    eventListeners['focus']({target: document.createElement('div')});
    expect(focusHistory.hasDescendantsOf(el0)).to.be.false;
  });

  it('should check active element for descendants', () => {
    const el0 = document.createElement('div');
    const el01 = document.createElement('div');
    el0.appendChild(el01);

    testDoc.activeElement = el0;
    expect(focusHistory.hasDescendantsOf(el0)).to.be.true;
    expect(focusHistory.hasDescendantsOf(document.createElement('div'))).to
        .be.false;

    testDoc.activeElement = el01;
    expect(focusHistory.hasDescendantsOf(el0)).to.be.true;
  });

  it('should check history descendants', () => {
    const el0 = document.createElement('div');
    const el01 = document.createElement('div');
    el0.appendChild(el01);
    eventListeners['focus']({target: el01});
    expect(focusHistory.hasDescendantsOf(el0)).to.be.true;
    expect(focusHistory.hasDescendantsOf(el01)).to.be.true;
    expect(focusHistory.hasDescendantsOf(document.createElement('div'))).to
        .be.false;
  });
});
