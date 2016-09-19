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

import {listenOncePromise} from '../../src/event-helper';
import {BaseElement} from '../../src/base-element';
import {createAmpElementProto} from '../../src/custom-element';
import {timerFor} from '../../src/timer';
import * as sinon from 'sinon';

describe('BaseElement', () => {

  let sandbox;
  let customElement;
  let element;
  document.registerElement('amp-test-element', {
    prototype: createAmpElementProto(window, 'amp-test-element', BaseElement),
  });
  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    customElement = document.createElement('amp-test-element');
    element = new BaseElement(customElement);
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('propagateAttributes - niente', () => {
    const target = document.createElement('div');
    expect(target.hasAttributes()).to.be.false;

    element.propagateAttributes(['data-test1'], target);
    expect(target.hasAttributes()).to.be.false;

    element.propagateAttributes(['data-test2', 'data-test3'], target);
    expect(target.hasAttributes()).to.be.false;
  });

  it('propagateAttributes', () => {
    const target = document.createElement('div');
    expect(target.hasAttributes()).to.be.false;

    customElement.setAttribute('data-test1', 'abc');
    customElement.setAttribute('data-test2', 'xyz');
    customElement.setAttribute('data-test3', '123');

    element.propagateAttributes('data-test1', target);
    expect(target.hasAttributes()).to.be.true;

    expect(target.getAttribute('data-test1')).to.equal('abc');
    expect(target.getAttribute('data-test2')).to.be.null;
    expect(target.getAttribute('data-test3')).to.be.null;

    element.propagateAttributes(['data-test2', 'data-test3'], target);
    expect(target.getAttribute('data-test2')).to.equal('xyz');
    expect(target.getAttribute('data-test3')).to.equal('123');
  });

  it('should register action', () => {
    const handler = () => {};
    element.registerAction('method1', handler);
    expect(element.actionMap_['method1']).to.equal(handler);
  });

  it('should fail execution of unregistered action', () => {
    expect(() => {
      element.executeAction({method: 'method1'}, false);
    }).to.throw(/Method not found/);
  });

  it('should execute registered action', () => {
    const handler = sandbox.spy();
    element.registerAction('method1', handler);
    element.executeAction({method: 'method1'}, false);
    expect(handler.callCount).to.equal(1);
  });

  it('should execute "activate" action without registration', () => {
    const handler = sandbox.spy();
    element.activate = handler;
    element.executeAction({method: 'activate'}, false);
    expect(handler.callCount).to.equal(1);
  });

  describe('forwardEvents', () => {
    const TIMEOUT = 1000;
    let target;
    let event1;
    let event2;
    let event1Promise;
    let event2Promise;

    beforeEach(() => {
      const timer = timerFor(element.win);
      target = document.createElement('div');

      event1 = document.createEvent('Event');
      event1.initEvent('event1', false, true);

      event2 = document.createEvent('Event');
      event2.initEvent('event2', false, true);

      event1Promise = listenOncePromise(element.element, 'event1');
      event1Promise = timer.timeoutPromise(TIMEOUT, event1Promise);

      event2Promise = listenOncePromise(element.element, 'event2');
      event2Promise = timer.timeoutPromise(TIMEOUT, event2Promise);
    });

    it('forwards single event', () => {
      element.forwardEvents('event1', target);
      target.dispatchEvent(event1);
      target.dispatchEvent(event2);

      return Promise.all([
        event1Promise,
        event2Promise
        .then(() => { assert.fail('Blur should not have been forwarded'); })
        .catch(() => { /* timed-out, all good */ }),
      ]);
    });

    it('forwards multiple events', () => {
      element.forwardEvents(['event1', 'event2'], target);
      target.dispatchEvent(event1);
      target.dispatchEvent(event2);

      return Promise.all([
        event1Promise,
        event2Promise,
      ]);
    });
  });

});
