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
import {
  IntersectionObserver,
  getIntersectionChangeEntry,
} from '../../src/intersection-observer';
import {createAmpElementProto} from '../../src/custom-element';
import {layoutRectLtwh} from '../../src/layout-rect';
import * as sinon from 'sinon';


describe('getIntersectionChangeEntry', () => {

  it('intersect correctly base', () => {
    const time = 123;
    const rootBounds = layoutRectLtwh(0, 100, 100, 100);
    const layoutBox = layoutRectLtwh(50, 50, 150, 200);
    const change = getIntersectionChangeEntry(time, rootBounds, layoutBox);

    expect(change).to.be.object;
    expect(change.time).to.equal(123);

    expect(change.rootBounds).to.equal(rootBounds);
    expect(change.rootBounds.x).to.equal(0);
    expect(change.rootBounds.y).to.equal(100);
    expect(change.boundingClientRect).to.jsonEqual({
      'left': 50,
      'top': -50,
      'width': 150,
      'height': 200,
      'bottom': 150,
      'right': 200,
      'x': 50,
      'y': -50,
    });
    expect(change.intersectionRect.height).to.equal(100);
    expect(change.intersectionRect).to.jsonEqual({
      'left': 50,
      'top': 100,
      'width': 50,
      'height': 100,
      'bottom': 200,
      'right': 100,
      'x': 50,
      'y': 100,
    });
  });

  it('intersect correctly 2', () => {
    const time = 111;
    const rootBounds = layoutRectLtwh(0, 100, 100, 100);
    const layoutBox = layoutRectLtwh(50, 199, 150, 200);
    const change = getIntersectionChangeEntry(time, rootBounds, layoutBox);
    expect(change.time).to.equal(111);

    expect(change.intersectionRect.height).to.equal(1);
    expect(change.intersectionRect).to.jsonEqual({
      'left': 50,
      'top': 199,
      'width': 50,
      'height': 1,
      'bottom': 200,
      'right': 100,
      'x': 50,
      'y': 199,
    });
  });

  it('intersect correctly 3', () => {
    const rootBounds = layoutRectLtwh(198, 299, 100, 100);
    const layoutBox = layoutRectLtwh(50, 100, 150, 200);
    const change = getIntersectionChangeEntry(111, rootBounds, layoutBox);

    expect(change.intersectionRect.height).to.equal(1);
    expect(change.intersectionRect.width).to.equal(2);
  });

  it('intersect correctly 3', () => {
    const rootBounds = layoutRectLtwh(202, 299, 100, 100);
    const layoutBox = layoutRectLtwh(50, 100, 150, 200);
    const change = getIntersectionChangeEntry(111, rootBounds, layoutBox);

    expect(change.intersectionRect.height).to.equal(0);
    expect(change.intersectionRect.width).to.equal(0);
  });
});


describe('IntersectionObserver', () => {
  let testElementCreatedCallback;
  let testElementPreconnectCallback;
  let testElementFirstAttachedCallback;
  let testElementBuildCallback;
  let testElementLayoutCallback;
  let testElementFirstLayoutCompleted;
  let testElementViewportCallback;
  const testElementIsReadyToBuild = true;

  class TestElement extends BaseElement {
    isLayoutSupported(unusedLayout) {
      return true;
    }
    createdCallback() {
      testElementCreatedCallback();
    }
    preconnectCallback(onLayout) {
      testElementPreconnectCallback(onLayout);
    }
    firstAttachedCallback() {
      testElementFirstAttachedCallback();
    }
    isReadyToBuild() {
      return testElementIsReadyToBuild;
    }
    buildCallback() {
      testElementBuildCallback();
    }
    layoutCallback() {
      testElementLayoutCallback();
      return Promise.resolve();
    }
    firstLayoutCompleted() {
      testElementFirstLayoutCompleted();
    }
    viewportCallback(inViewport) {
      testElementViewportCallback(inViewport);
    }
    getIntersectionElementLayoutBox() {
      testElementGetInsersectionElementLayoutBox();
      return {top: 10, left: 10, width: 11, height: 1};
    }
  }

  const ElementClass = document.registerElement('amp-int', {
    prototype: createAmpElementProto(window, 'amp-int', TestElement),
  });

  const iframeSrc = 'http://iframe.localhost:' + location.port +
      '/base/test/fixtures/served/iframe-intersection.html';

  let sandbox;
  let testIframe;
  let element;
  let getIntersectionChangeEntrySpy;
  let onScrollSpy;
  let onChangeSpy;
  let clock;

  function getIframe(src) {
    const i = document.createElement('iframe');
    i.src = src;
    document.body.appendChild(i);
    return i;
  }

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    clock = sandbox.useFakeTimers();
    testElementCreatedCallback = sandbox.spy();
    testElementPreconnectCallback = sandbox.spy();
    testElementFirstAttachedCallback = sandbox.spy();
    testElementBuildCallback = sandbox.spy();
    testElementLayoutCallback = sandbox.spy();
    testElementFirstLayoutCompleted = sandbox.spy();
    testElementViewportCallback = sandbox.spy();
    testElementGetInsersectionElementLayoutBox = sandbox.spy();
    getIntersectionChangeEntrySpy = sandbox.spy();
    onScrollSpy = sandbox.spy();
    onChangeSpy = sandbox.spy();
    testIframe = getIframe(iframeSrc);
    element = new ElementClass();
    element.getVsync = function() {
      return {
        measure: function(fn) {
          fn();
        },
      };
    };
    element.getViewport = function() {
      return {
        onScroll: function() {
          onScrollSpy();
          return function() {};
        },
        onChanged: function() {
          onChangeSpy();
          return function() {};
        },
      };
    };
    element.element = {
      getIntersectionChangeEntry: function() {
        getIntersectionChangeEntrySpy();
        const rootBounds = layoutRectLtwh(198, 299, 100, 100);
        const layoutBox = layoutRectLtwh(50, 100, 150, 200);
        return getIntersectionChangeEntry(new Date().getTime(),
            rootBounds, layoutBox);
      },
    };
    element.isInViewport = () => false;
  });

  afterEach(() => {
    sandbox.restore();
    testIframe.parentNode.removeChild(testIframe);
  });

  it('should not send intersection', () => {
    postMessageSpy = sinon/*OK*/.spy(testIframe.contentWindow, 'postMessage');
    const ioInstance = new IntersectionObserver(element, testIframe);
    ioInstance.sendElementIntersection_();
    expect(postMessageSpy.callCount).to.equal(0);
    expect(ioInstance.pendingChanges_).to.have.length(0);
  });

  it('should send intersection', () => {
    const messages = [];
    sandbox.stub(testIframe.contentWindow, 'postMessage', message => {
      // Copy because arg is modified in place.
      messages.push(JSON.parse(JSON.stringify(message)));
    });
    const ioInstance = new IntersectionObserver(element, testIframe);
    clock.tick(33);
    ioInstance.startSendingIntersectionChanges_();
    expect(getIntersectionChangeEntrySpy.callCount).to.equal(1);
    expect(messages).to.have.length(0);
    clock.tick(99);
    expect(ioInstance.pendingChanges_).to.have.length(1);
    expect(messages).to.have.length(0);
    clock.tick(1);
    expect(messages).to.have.length(1);
    expect(ioInstance.pendingChanges_).to.have.length(0);
    expect(messages[0].changes).to.have.length(1);
    expect(messages[0].changes[0].time).to.equal(33);
  });

  it('should send more intersections', () => {
    const messages = [];
    sandbox.stub(testIframe.contentWindow, 'postMessage', message => {
      // Copy because arg is modified in place.
      messages.push(JSON.parse(JSON.stringify(message)));
    });
    const ioInstance = new IntersectionObserver(element, testIframe);
    ioInstance.startSendingIntersectionChanges_();
    expect(getIntersectionChangeEntrySpy.callCount).to.equal(1);
    expect(messages).to.have.length(0);
    clock.tick(99);
    ioInstance.fire();
    ioInstance.fire();  // Same time
    ioInstance.fire();  // Same time
    expect(ioInstance.pendingChanges_).to.have.length(2);
    expect(messages).to.have.length(0);
    clock.tick(1);
    expect(messages).to.have.length(1);
    expect(messages[0].changes).to.have.length(2);
    expect(messages[0].changes[0].time).to.equal(0);
    expect(messages[0].changes[1].time).to.equal(99);
    expect(ioInstance.pendingChanges_).to.have.length(0);
    ioInstance.fire();
    expect(ioInstance.pendingChanges_).to.have.length(1);
    expect(messages).to.have.length(1);
    clock.tick(99);
    expect(ioInstance.pendingChanges_).to.have.length(1);
    expect(messages).to.have.length(1);
    clock.tick(1);
    expect(ioInstance.pendingChanges_).to.have.length(0);
    expect(messages).to.have.length(2);
    expect(messages[1].changes).to.have.length(1);
    expect(messages[1].changes[0].time).to.equal(100);
  });

  it('should init listeners when element is in viewport', () => {
    const fireSpy = sandbox.spy(IntersectionObserver.prototype, 'fire');
    const ioInstance = new IntersectionObserver(element, testIframe);
    ioInstance.onViewportCallback(true);
    expect(fireSpy.callCount).to.equal(1);
    expect(onScrollSpy.callCount).to.equal(1);
    expect(onChangeSpy.callCount).to.equal(1);
    expect(ioInstance.unlistenViewportChanges_).to.not.be.null;
  });

  it('should unlisten listeners when element is out of viewport', () => {
    const fireSpy = sandbox.spy(IntersectionObserver.prototype, 'fire');
    const ioInstance = new IntersectionObserver(element, testIframe);
    ioInstance.onViewportCallback(true);
    ioInstance.onViewportCallback();
    expect(fireSpy.callCount).to.equal(2);
    expect(ioInstance.unlistenViewportChanges_).to.be.null;
  });

  it('should go into in-viewport state for initially visible element', () => {
    element.isInViewport = () => true;
    const ioInstance = new IntersectionObserver(element, testIframe);
    ioInstance.startSendingIntersectionChanges_();
    expect(getIntersectionChangeEntrySpy.callCount).to.equal(2);
    expect(onScrollSpy.callCount).to.equal(1);
    expect(onChangeSpy.callCount).to.equal(1);
    expect(ioInstance.unlistenViewportChanges_).to.not.be.null;
  });
});
