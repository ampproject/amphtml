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

import {BaseElement} from '../../src/base-element';
import {Resource} from '../../src/service/resource';
import {Services} from '../../src/services';
import {createAmpElementProtoForTesting} from '../../src/custom-element';
import {layoutRectLtwh} from '../../src/layout-rect';
import {listenOncePromise} from '../../src/event-helper';
import {toggleExperiment} from '../../src/experiments';


describes.realWin('BaseElement', {amp: true}, env => {
  let win, doc;
  let customElement;
  let element;

  beforeEach(() => {
    win = env.win;
    doc = win.document;
    doc.registerElement('amp-test-element', {
      prototype: createAmpElementProtoForTesting(win,
          'amp-test-element', BaseElement),
    });
    customElement = doc.createElement('amp-test-element');
    element = new BaseElement(customElement);
  });

  it('should delegate update priority to resources', () => {
    const resources = win.services.resources.obj;
    customElement.getResources = () => resources;
    const updateLayoutPriorityStub = sandbox.stub(
        resources, 'updateLayoutPriority');
    element.updateLayoutPriority(1);
    expect(updateLayoutPriorityStub).to.be.calledOnce;
  });

  it('propagateAttributes - niente', () => {
    const target = doc.createElement('div');
    expect(target.hasAttributes()).to.be.false;

    element.propagateAttributes(['data-test1'], target);
    expect(target.hasAttributes()).to.be.false;

    element.propagateAttributes(['data-test2', 'data-test3'], target);
    expect(target.hasAttributes()).to.be.false;
  });

  it('propagateAttributes', () => {
    const target = doc.createElement('div');
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
    expect(element.actionMap_['method1']).to.not.be.null;
  });

  it('should fail execution of unregistered action', () => {
    expect(() => {
      element.executeAction({method: 'method1'}, false);
    }).to.throw(/Method not found/);
  });

  it('`this` context of handler should not be the holder', () => {
    const handler = () => {
      const holder = element.actionMap_['foo'];
      expect(this).to.not.equal(holder);
    };
    element.registerAction('foo', handler);
    const invocation = {method: 'foo', satisfiesTrust: () => true};
    element.executeAction(invocation, false);
  });

  it('should execute registered action', () => {
    const handler = sandbox.spy();
    element.registerAction('method1', handler);
    const invocation = {method: 'method1', satisfiesTrust: () => true};
    element.executeAction(invocation, false);
    expect(handler).to.be.calledOnce;
  });

  it('should execute "activate" action without registration', () => {
    const handler = sandbox.spy();
    element.activate = handler;
    const invocation = {method: 'activate', satisfiesTrust: () => true};
    element.executeAction(invocation, false);
    expect(handler).to.be.calledOnce;
  });

  it('should check trust before invocation', () => {
    const handler = sandbox.spy();
    const minTrust = 123;
    element.registerAction('foo', handler, minTrust);
    const activate = sandbox.stub(element, 'activate');

    // Registered action.
    element.executeAction({method: 'foo', satisfiesTrust: () => false}, false);
    expect(handler).to.not.be.called;
    element.executeAction({
      method: 'foo',
      satisfiesTrust: t => (t == minTrust),
    }, false);
    expect(handler).to.be.calledOnce;

    // Unregistered action (activate).
    element.executeAction({
      method: 'activate',
      satisfiesTrust: () => false,
    }, false);
    expect(activate).to.not.be.called;
    element.executeAction({
      method: 'activate',
      satisfiesTrust: t => (t <= element.activationTrust()),
    }, false);
    expect(activate).to.be.calledOnce;
  });

  it('should return correct layoutBox', () => {
    const resources = win.services.resources.obj;
    customElement.getResources = () => resources;
    const resource = new Resource(1, customElement, resources);
    sandbox.stub(resources, 'getResourceForElement')
        .withArgs(customElement)
        .returns(resource);
    const layoutBox = layoutRectLtwh(0, 50, 100, 200);
    const pageLayoutBox = layoutRectLtwh(0, 0, 100, 200);
    sandbox.stub(resource, 'getLayoutBox').callsFake(() => layoutBox);
    sandbox.stub(resource, 'getPageLayoutBox').callsFake(() => pageLayoutBox);
    expect(element.getLayoutBox()).to.eql(layoutBox);
    expect(customElement.getLayoutBox()).to.eql(layoutBox);
    expect(element.getPageLayoutBox()).to.eql(pageLayoutBox);
    expect(customElement.getPageLayoutBox()).to.eql(pageLayoutBox);
  });

  it('should return true for inabox experiment renderOutsideViewport', () => {
    expect(element.renderOutsideViewport()).to.eql(3);
    // Still 3 if inabox w/o experiment.
    env.win.AMP_MODE.runtime = 'inabox';
    expect(element.renderOutsideViewport()).to.eql(3);
    // Enable experiment and now should be true.
    toggleExperiment(env.win, 'inabox-rov', true);
    expect(element.renderOutsideViewport()).to.be.true;
  });

  describe('forwardEvents', () => {
    const TIMEOUT = 1000;
    let target;
    let event1;
    let event2;
    let event1Promise;
    let event2Promise;

    beforeEach(() => {
      const timer = Services.timerFor(element.win);
      target = doc.createElement('div');

      event1 = doc.createEvent('Event');
      event1.initEvent('event1', false, true);

      event2 = doc.createEvent('Event');
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
