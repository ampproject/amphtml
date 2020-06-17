/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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

import {AmpDocService} from '../../src/service/ampdoc-impl';
import {
  DEFAULT_THRESHOLD,
  IntersectionObserverHostApi,
  getIntersectionChangeEntry,
  getThresholdSlot,
  intersectionRatio,
} from '../../src/utils/intersection-observer-polyfill';
import {Services} from '../../src/services';
import {installHiddenObserverForDoc} from '../../src/service/hidden-observer-impl';
import {layoutRectLtwh} from '../../src/layout-rect';

const fakeAmpDoc = {
  getRootNode: () => {
    return window.document;
  },
  win: window,
  isSingleDoc: () => {
    return true;
  },
};
installHiddenObserverForDoc(fakeAmpDoc);

describes.sandboxed('IntersectionObserverHostApi', {}, (env) => {
  let testDoc;
  let testEle;
  let baseElement;
  let ioApi;

  const iframeSrc =
    'http://iframe.localhost:' +
    location.port +
    '/test/fixtures/served/iframe-intersection.html';
  let testIframe;

  function getIframe(src) {
    const i = document.createElement('iframe');
    i.src = src;
    return i;
  }

  function insert(iframe) {
    document.body.appendChild(iframe);
  }

  beforeEach(() => {
    testIframe = getIframe(iframeSrc);
    env.sandbox.stub(AmpDocService.prototype, 'getAmpDoc').returns(fakeAmpDoc);
    testDoc = {defaultView: window};
    testEle = {
      isBuilt: () => {
        return true;
      },
      getOwner: () => {
        return null;
      },
      getLayoutBox: () => {
        return layoutRectLtwh(50, 100, 150, 200);
      },
      win: window,
      ownerDocument: testDoc,
      getRootNode: () => testDoc,
      nodeType: 1,
    };

    baseElement = {
      element: testEle,
      getVsync: () => {
        return {
          measure: (func) => {
            func();
          },
        };
      },
    };
    ioApi = new IntersectionObserverHostApi(baseElement, testIframe);
    insert(testIframe);
  });

  afterEach(() => {
    testIframe.parentNode.removeChild(testIframe);
    if (ioApi) {
      ioApi.destroy();
    }
    ioApi = null;
  });

  it('should destroy correctly', () => {
    const subscriptionApiDestroySpy = env.sandbox.spy(
      ioApi.subscriptionApi_,
      'destroy'
    );
    const polyfillDisconnectSpy = env.sandbox.spy(
      ioApi.intersectionObserver_,
      'disconnect'
    );
    ioApi.destroy();
    expect(subscriptionApiDestroySpy).to.be.called;
    expect(polyfillDisconnectSpy).to.be.called;
    expect(ioApi.intersectionObserver_).to.be.null;
    expect(ioApi.subscriptionApi_).to.be.null;
    ioApi = null;
  });
});

describes.sandboxed('getIntersectionChangeEntry', {}, (env) => {
  beforeEach(() => {
    env.sandbox.stub(performance, 'now').callsFake(() => 100);
    env.sandbox.stub(AmpDocService.prototype, 'getAmpDoc').returns(fakeAmpDoc);
  });

  it('without owner', () => {
    expect(
      getIntersectionChangeEntry(
        layoutRectLtwh(0, 100, 50, 50),
        null,
        layoutRectLtwh(0, 100, 100, 100)
      )
    ).to.jsonEqual({
      time: 100,
      rootBounds: layoutRectLtwh(0, 0, 100, 100),
      boundingClientRect: layoutRectLtwh(0, 0, 50, 50),
      intersectionRect: layoutRectLtwh(0, 0, 50, 50),
      intersectionRatio: 1,
    });
    expect(
      getIntersectionChangeEntry(
        layoutRectLtwh(50, 200, 150, 200),
        null,
        layoutRectLtwh(0, 100, 100, 100)
      )
    ).to.jsonEqual({
      time: 100,
      rootBounds: layoutRectLtwh(0, 0, 100, 100),
      boundingClientRect: layoutRectLtwh(50, 100, 150, 200),
      intersectionRect: layoutRectLtwh(50, 100, 50, 0),
      intersectionRatio: 0,
    });
  });
  it('with owner', () => {
    expect(
      getIntersectionChangeEntry(
        layoutRectLtwh(50, 50, 150, 200),
        layoutRectLtwh(0, 50, 100, 100),
        layoutRectLtwh(0, 100, 100, 100)
      )
    ).to.jsonEqual({
      time: 100,
      rootBounds: layoutRectLtwh(0, 0, 100, 100),
      boundingClientRect: layoutRectLtwh(50, -50, 150, 200),
      intersectionRect: layoutRectLtwh(50, 0, 50, 50),
      intersectionRatio: 1 / 12,
    });
  });
});

describe('intersectionRatio', () => {
  let smallRectMock;
  let largeRectMock;
  beforeEach(() => {
    smallRectMock = {
      width: 100,
      height: 100,
    };
    largeRectMock = {
      width: 200,
      height: 200,
    };
  });

  it('should return a valid ratio', () => {
    const ratio = intersectionRatio(smallRectMock, largeRectMock);
    expect(ratio).to.be.equal(0.25);
  });

  it('should not return NaN', () => {
    const notVisibleMock = {
      width: 0,
      height: 0,
    };
    const ratio = intersectionRatio(notVisibleMock, notVisibleMock);
    expect(ratio).to.not.be.equal(NaN);
  });
});
