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

import * as sinon from 'sinon';
import {BaseElement} from '../../src/base-element';
import {
  IntersectionObserver,
  getIntersectionChangeEntry,
} from '../../src/intersection-observer';
import {createAmpElementProtoForTesting} from '../../src/custom-element';
import {layoutRectLtwh} from '../../src/layout-rect';


describe('getIntersectionChangeEntry', () => {
  let sandbox;
  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    sandbox.useFakeTimers();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('intersect correctly base', () => {
    const rootBounds = layoutRectLtwh(0, 100, 100, 100);
    const layoutBox = layoutRectLtwh(50, 50, 150, 200);
    const change = getIntersectionChangeEntry(layoutBox, null, rootBounds);

    expect(change).to.be.an('object');
    expect(change.time).to.equal(Date.now());

    expect(change.rootBounds).to.deep.equal({
      'left': 0,
      'top': 0,
      'width': 100,
      'height': 100,
      'bottom': 100,
      'right': 100,
      'x': 0,
      'y': 0,
    });
    expect(change.boundingClientRect).to.deep.equal({
      'left': 50,
      'top': -50,
      'width': 150,
      'height': 200,
      'bottom': 150,
      'right': 200,
      'x': 50,
      'y': -50,
    });
    expect(change.intersectionRect).to.deep.equal({
      'left': 50,
      'top': 0,
      'width': 50,
      'height': 100,
      'bottom': 100,
      'right': 100,
      'x': 50,
      'y': 0,
    });
    expect(change.intersectionRatio).to.be.closeTo(0.1666666, .0001);
  });

  it('intersects on the edge', () => {
    const rootBounds = layoutRectLtwh(0, 100, 100, 100);
    const layoutBox = layoutRectLtwh(50, 200, 150, 200);
    const change = getIntersectionChangeEntry(layoutBox, null, rootBounds);

    expect(change).to.be.an('object');
    expect(change.time).to.equal(Date.now());

    expect(change.rootBounds).to.deep.equal({
      'left': 0,
      'top': 0,
      'width': 100,
      'height': 100,
      'bottom': 100,
      'right': 100,
      'x': 0,
      'y': 0,
    });
    expect(change.boundingClientRect).to.deep.equal({
      'left': 50,
      'top': 100,
      'width': 150,
      'height': 200,
      'bottom': 300,
      'right': 200,
      'x': 50,
      'y': 100,
    });
    expect(change.intersectionRect).to.deep.equal({
      'left': 50,
      'top': 100,
      'width': 50,
      'height': 0,
      'bottom': 100,
      'right': 100,
      'x': 50,
      'y': 100,
    });
    expect(change.intersectionRatio).to.equal(0);
  });

  it('intersect correctly 2', () => {
    const rootBounds = layoutRectLtwh(0, 100, 100, 100);
    const layoutBox = layoutRectLtwh(50, 199, 150, 200);
    const change = getIntersectionChangeEntry(layoutBox, null, rootBounds);

    expect(change.intersectionRect).to.deep.equal({
      'left': 50,
      'top': 99,
      'width': 50,
      'height': 1,
      'bottom': 100,
      'right': 100,
      'x': 50,
      'y': 99,
    });
  });

  it('intersect correctly 3', () => {
    const rootBounds = layoutRectLtwh(198, 299, 100, 100);
    const layoutBox = layoutRectLtwh(50, 100, 150, 200);
    const change = getIntersectionChangeEntry(layoutBox, null, rootBounds);

    expect(change.intersectionRect.height).to.equal(1);
    expect(change.intersectionRect.width).to.equal(2);
  });

  it('intersect correctly 3', () => {
    const rootBounds = layoutRectLtwh(202, 299, 100, 100);
    const layoutBox = layoutRectLtwh(50, 100, 150, 200);
    const change = getIntersectionChangeEntry(layoutBox, null, rootBounds);

    expect(change.intersectionRect.height).to.equal(0);
    expect(change.intersectionRect.width).to.equal(0);
  });

  it('intersects with an owner element', () => {
    const rootBounds = layoutRectLtwh(0, 100, 100, 100);
    const ownerBounds = layoutRectLtwh(40, 110, 20, 20);
    const layoutBox = layoutRectLtwh(50, 50, 150, 200);
    const change = getIntersectionChangeEntry(layoutBox, ownerBounds,
        rootBounds);

    expect(change).to.be.an('object');
    expect(change.time).to.equal(Date.now());

    expect(change.rootBounds).to.deep.equal({
      'left': 0,
      'top': 0,
      'width': 100,
      'height': 100,
      'bottom': 100,
      'right': 100,
      'x': 0,
      'y': 0,
    });
    expect(change.boundingClientRect).to.deep.equal({
      'left': 50,
      'top': -50,
      'width': 150,
      'height': 200,
      'bottom': 150,
      'right': 200,
      'x': 50,
      'y': -50,
    });
    expect(change.intersectionRect).to.deep.equal({
      'left': 50,
      'top': 10,
      'width': 10,
      'height': 20,
      'bottom': 30,
      'right': 60,
      'x': 50,
      'y': 10,
    });
    expect(change.intersectionRatio).to.be.closeTo(0.0066666, .0001);
  });

  it('does not intersect with an elements out of viewport', () => {
    const rootBounds = layoutRectLtwh(0, 100, 100, 100);
    const ownerBounds = layoutRectLtwh(0, 200, 100, 100);
    const layoutBox = layoutRectLtwh(50, 225, 100, 100);
    const change = getIntersectionChangeEntry(layoutBox, ownerBounds,
        rootBounds);

    expect(change).to.be.an('object');
    expect(change.time).to.equal(Date.now());

    expect(change.rootBounds).to.deep.equal({
      'left': 0,
      'top': 0,
      'width': 100,
      'height': 100,
      'bottom': 100,
      'right': 100,
      'x': 0,
      'y': 0,
    });
    expect(change.boundingClientRect).to.deep.equal({
      'left': 50,
      'top': 125,
      'width': 100,
      'height': 100,
      'bottom': 225,
      'right': 150,
      'x': 50,
      'y': 125,
    });
    expect(change.intersectionRect).to.deep.equal({
      'left': 0,
      'top': 0,
      'width': 0,
      'height': 0,
      'bottom': 0,
      'right': 0,
      'x': 0,
      'y': 0,
    });
    expect(change.intersectionRatio).to.equal(0);
  });

  it('does not intersect with an element out of viewport', () => {
    const rootBounds = layoutRectLtwh(0, 100, 100, 100);
    const ownerBounds = layoutRectLtwh(0, 100, 100, 100);
    const layoutBox = layoutRectLtwh(50, 225, 100, 100);
    const change = getIntersectionChangeEntry(layoutBox, ownerBounds,
        rootBounds);

    expect(change).to.be.an('object');
    expect(change.time).to.equal(Date.now());

    expect(change.rootBounds).to.deep.equal({
      'left': 0,
      'top': 0,
      'width': 100,
      'height': 100,
      'bottom': 100,
      'right': 100,
      'x': 0,
      'y': 0,
    });
    expect(change.boundingClientRect).to.deep.equal({
      'left': 50,
      'top': 125,
      'width': 100,
      'height': 100,
      'bottom': 225,
      'right': 150,
      'x': 50,
      'y': 125,
    });
    expect(change.intersectionRect).to.deep.equal({
      'left': 0,
      'top': 0,
      'width': 0,
      'height': 0,
      'bottom': 0,
      'right': 0,
      'x': 0,
      'y': 0,
    });
    expect(change.intersectionRatio).to.equal(0);
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
    prototype: createAmpElementProtoForTesting(window, 'amp-int', TestElement),
  });

  const iframeSrc = 'http://iframe.localhost:' + location.port +
      '/test/fixtures/served/iframe-intersection.html';

  let sandbox;
  let testIframe;
  let element;
  let getIntersectionChangeEntrySpy;
  let onScrollSpy;
  let onChangeSpy;
  let clock;
  let testElementGetInsersectionElementLayoutBox;

  function getIframe(src) {
    const i = document.createElement('iframe');
    i.src = src;
    return i;
  }

  function insert(iframe) {
    document.body.appendChild(iframe);
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
    element.win = window;
    element.getVsync = function() {
      return {
        measure(fn) {
          fn();
        },
      };
    };
    element.getViewport = function() {
      return {
        onScroll() {
          onScrollSpy();
          return function() {};
        },
        onChanged() {
          onChangeSpy();
          return function() {};
        },
      };
    };
    element.element = {
      getIntersectionChangeEntry() {
        getIntersectionChangeEntrySpy();
        const rootBounds = layoutRectLtwh(198, 299, 100, 100);
        const layoutBox = layoutRectLtwh(50, 100, 150, 200);
        return getIntersectionChangeEntry(layoutBox, null, rootBounds);
      },
    };
    element.isInViewport = () => false;
  });

  afterEach(() => {
    sandbox.restore();
    testIframe.parentNode.removeChild(testIframe);
  });

  it('should not send intersection', () => {
    const ioInstance = new IntersectionObserver(element, testIframe);
    insert(testIframe);
    const postMessageSpy = sinon/*OK*/.spy(testIframe.contentWindow,
        'postMessage');
    ioInstance.sendElementIntersection_();
    expect(postMessageSpy).to.have.not.been.called;
    expect(ioInstance.pendingChanges_).to.have.length(0);
  });

  it('should send intersection', () => {
    const messages = [];
    const ioInstance = new IntersectionObserver(element, testIframe);
    insert(testIframe);
    testIframe.contentWindow.postMessage = message => {
      // Copy because arg is modified in place.
      messages.push(JSON.parse(JSON.stringify(message)));
    };
    clock.tick(33);
    ioInstance.postMessageApi_.clientWindows_ =
        [{win: testIframe.contentWindow, origin: '*'}];
    ioInstance.startSendingIntersectionChanges_();
    expect(getIntersectionChangeEntrySpy).to.be.calledOnce;
    expect(messages).to.have.length(1);
    expect(ioInstance.pendingChanges_).to.have.length(0);
    expect(messages[0].changes).to.have.length(1);
    expect(messages[0].changes[0].time).to.equal(33);
  });

  it('should send more intersections', () => {
    const messages = [];
    const ioInstance = new IntersectionObserver(element, testIframe);
    insert(testIframe);
    testIframe.contentWindow.postMessage = message => {
      // Copy because arg is modified in place.
      messages.push(JSON.parse(JSON.stringify(message)));
    };
    ioInstance.postMessageApi_.clientWindows_ =
        [{win: testIframe.contentWindow, origin: '*'}];
    ioInstance.startSendingIntersectionChanges_();
    expect(getIntersectionChangeEntrySpy).to.be.calledOnce;
    expect(messages).to.have.length(1);
    expect(messages[0].changes).to.have.length(1);
    expect(messages[0].changes[0].time).to.equal(0);
    clock.tick(98);
    ioInstance.fire();
    clock.tick(1);
    ioInstance.fire();
    ioInstance.fire(); // Same time
    ioInstance.fire(); // Same time
    expect(ioInstance.pendingChanges_).to.have.length(2);
    expect(messages).to.have.length(1);
    clock.tick(1);
    expect(messages).to.have.length(2);
    expect(messages[1].changes).to.have.length(2);
    expect(messages[1].changes[0].time).to.equal(98);
    expect(messages[1].changes[1].time).to.equal(99);
    expect(ioInstance.pendingChanges_).to.have.length(0);
    ioInstance.fire();
    expect(ioInstance.pendingChanges_).to.have.length(0);
    expect(messages).to.have.length(3);
    clock.tick(99);
    ioInstance.fire();
    expect(ioInstance.pendingChanges_).to.have.length(1);
    expect(messages).to.have.length(3);
    clock.tick(1);
    expect(ioInstance.pendingChanges_).to.have.length(0);
    expect(messages).to.have.length(4);
    expect(messages[2].changes).to.have.length(1);
    expect(messages[2].changes[0].time).to.equal(100);
    expect(messages[3].changes).to.have.length(1);
    expect(messages[3].changes[0].time).to.equal(199);
  });

  it('should init listeners when element is in viewport', () => {
    const fireSpy = sandbox.spy(IntersectionObserver.prototype, 'fire');
    const ioInstance = new IntersectionObserver(element, testIframe);
    insert(testIframe);
    ioInstance.onViewportCallback(true);
    expect(fireSpy).to.be.calledOnce;
    expect(onScrollSpy).to.be.calledOnce;
    expect(onChangeSpy).to.be.calledOnce;
    expect(ioInstance.unlistenViewportChanges_).to.not.be.null;
  });

  it('should unlisten listeners when element is out of viewport', () => {
    const fireSpy = sandbox.spy(IntersectionObserver.prototype, 'fire');
    const ioInstance = new IntersectionObserver(element, testIframe);
    insert(testIframe);
    ioInstance.onViewportCallback(true);
    ioInstance.onViewportCallback();
    expect(fireSpy).to.have.callCount(2);
    expect(ioInstance.unlistenViewportChanges_).to.be.null;
  });

  it('should go into in-viewport state for initially visible element', () => {
    element.isInViewport = () => true;
    const ioInstance = new IntersectionObserver(element, testIframe);
    insert(testIframe);
    ioInstance.startSendingIntersectionChanges_();
    expect(getIntersectionChangeEntrySpy).to.have.callCount(2);
    expect(onScrollSpy).to.be.calledOnce;
    expect(onChangeSpy).to.be.calledOnce;
    expect(ioInstance.unlistenViewportChanges_).to.not.be.null;
  });

  it('should not send intersection after destroy is called', () => {
    const messages = [];
    const ioInstance = new IntersectionObserver(element, testIframe);
    insert(testIframe);
    ioInstance.onViewportCallback(true);
    testIframe.contentWindow.postMessage = message => {
      // Copy because arg is modified in place.
      messages.push(JSON.parse(JSON.stringify(message)));
    };
    ioInstance.postMessageApi_.clientWindows_ =
        [{win: testIframe.contentWindow, origin: '*'}];
    ioInstance.startSendingIntersectionChanges_();
    expect(messages).to.have.length(1);
    ioInstance.fire();
    clock.tick(50);
    ioInstance.destroy();
    clock.tick(50);
    expect(messages).to.have.length(1);
    expect(ioInstance.unlistenViewportChanges_).to.be.null;
  });
});
