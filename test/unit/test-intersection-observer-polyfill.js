import {layoutRectLtwh} from '#core/dom/layout/rect';

import {AmpDocService} from '#service/ampdoc-impl';
import {installHiddenObserverForDoc} from '#service/hidden-observer-impl';

import {
  IntersectionObserver3pHost,
  getIntersectionChangeEntry,
  intersectionRatio,
} from '#utils/intersection-observer-3p-host';

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

describes.sandboxed('IntersectionObserver3pHost', {}, (env) => {
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
    ioApi = new IntersectionObserver3pHost(baseElement, testIframe);
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

describes.sandboxed('intersectionRatio', {}, () => {
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
