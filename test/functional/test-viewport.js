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

import {Viewport, ViewportBindingNatural_, ViewportBindingNaturalIosEmbed_,
          ViewportBindingVirtual_} from '../../src/viewport';
import * as sinon from 'sinon';


describe('Viewport', () => {
  let sandbox;
  let clock;
  let viewport;
  let binding;
  let viewer;
  let viewerMock;
  let windowApi;
  let viewerViewportHandler;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    clock = sandbox.useFakeTimers();
    viewerViewportHandler = undefined;
    viewer = {
      getViewportWidth: () => 111,
      getViewportHeight: () => 222,
      getScrollTop: () => 17,
      getPaddingTop: () => 19,
      onViewportEvent: (handler) => {
        viewerViewportHandler = handler;
      }
    };
    viewerMock = sandbox.mock(viewer);
    windowApi = {
      document: {
        documentElement: {style: {}}
      }
    };
    binding = new ViewportBindingVirtual_(windowApi, viewer);
    viewport = new Viewport(binding, viewer);
  });

  afterEach(() => {
    viewport = null;
    binding = null;
    viewer = null;
    clock.restore();
    clock = null;
    sandbox.restore();
    sandbox = null;
  });

  it('should pass through size and scroll', () => {
    expect(viewport.getPaddingTop()).to.equal(19);
    expect(windowApi.document.documentElement.style.paddingTop).to.
        equal('19px');
    expect(viewport.getSize().width).to.equal(111);
    expect(viewport.getSize().height).to.equal(222);
    expect(viewport.getTop()).to.equal(17);
    expect(viewport.getRect().left).to.equal(0);
    expect(viewport.getRect().top).to.equal(17);
    expect(viewport.getRect().width).to.equal(111);
    expect(viewport.getRect().height).to.equal(222);
  });

  it('should not relayout on height resize', () => {
    let changeEvent = null;
    viewport.onChanged((event) => {
      changeEvent = event;
    });
    viewerMock.expects('getViewportHeight').returns(223).atLeast(1);
    viewerViewportHandler();
    expect(changeEvent).to.not.equal(null);
    expect(changeEvent.relayoutAll).to.equal(false);
    expect(changeEvent.velocity).to.equal(0);
  });

  it('should relayout on width resize', () => {
    let changeEvent = null;
    viewport.onChanged((event) => {
      changeEvent = event;
    });
    viewerMock.expects('getViewportWidth').returns(112).atLeast(1);
    viewerViewportHandler();
    expect(changeEvent).to.not.equal(null);
    expect(changeEvent.relayoutAll).to.equal(true);
    expect(changeEvent.velocity).to.equal(0);
  });

  it('should update padding when changed only', () => {
    // Shouldn't call updatePaddingTop since it hasn't changed.
    let bindingMock = sandbox.mock(binding);
    bindingMock.expects('updatePaddingTop').never();
    viewerViewportHandler();
    bindingMock.verify();
    bindingMock.restore();

    // Should call updatePaddingTop.
    bindingMock = sandbox.mock(binding);
    viewerMock.expects('getPaddingTop').returns(21).atLeast(1);
    bindingMock.expects('updatePaddingTop').withArgs(21).once();
    viewerViewportHandler();
    bindingMock.verify();
    bindingMock.restore();
  });

  it('should call binding.updateViewerViewport', () => {
    let bindingMock = sandbox.mock(binding);
    bindingMock.expects('updateViewerViewport').once();
    viewerViewportHandler();
    bindingMock.verify();
    bindingMock.restore();
  });

  it('should defer scroll events', () => {
    let changeEvent = null;
    viewport.onChanged((event) => {
      changeEvent = event;
    });
    viewer.getScrollTop = () => {return 34;};
    viewerViewportHandler();
    expect(changeEvent).to.equal(null);

    // Not enough time past.
    clock.tick(100);
    viewer.getScrollTop = () => {return 35;};
    viewerViewportHandler();
    expect(changeEvent).to.equal(null);

    // A bit more time.
    clock.tick(750);
    expect(changeEvent).to.not.equal(null);
    expect(changeEvent.relayoutAll).to.equal(false);
    expect(changeEvent.velocity).to.be.closeTo(0.002, 1e-4);
  });
});


describe('ViewportBindingNatural', () => {
  let sandbox;
  let windowMock;
  let binding;
  let windowApi;
  let windowEventHandlers;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    var WindowApi = function() {};
    windowEventHandlers = {};
    WindowApi.prototype.addEventListener = function(eventType, handler) {
      windowEventHandlers[eventType] = handler;
    };
    windowApi = new WindowApi();
    windowMock = sandbox.mock(windowApi);
    binding = new ViewportBindingNatural_(windowApi);
  });

  afterEach(() => {
    binding = null;
    windowMock.verify();
    windowMock = null;
    sandbox.restore();
    sandbox = null;
  });

  it('should subscribe to scroll and resize events', () => {
    expect(windowEventHandlers['scroll']).to.not.equal(undefined);
    expect(windowEventHandlers['resize']).to.not.equal(undefined);
  });

  it('should update padding', () => {
    windowApi.document = {
      documentElement: {style: {}}
    };
    binding.updatePaddingTop(31);
    expect(windowApi.document.documentElement.style.paddingTop).to.
        equal('31px');
  });

  it('should calculate size', () => {
    windowApi.innerWidth = 111;
    windowApi.innerHeight = 222;
    windowApi.document = {
      documentElement: {
        clientWidth: 111,
        clientHeight: 222
      }
    };
    let size = binding.getSize();
    expect(size.width).to.equal(111);
    expect(size.height).to.equal(222);
  });

  it('should calculate scrollTop from scrollElement', () => {
    windowApi.pageYOffset = 11;
    windowApi.document = {
      scrollingElement: {
        scrollTop: 17
      }
    };
    expect(binding.getScrollTop()).to.equal(17);
  });

  it('should fallback scrollTop to pageYOffset', () => {
    windowApi.pageYOffset = 11;
    windowApi.document = {scrollingElement: {}};
    expect(binding.getScrollTop()).to.equal(11);
  });

  it('should offset client rect for layout', () => {
    windowApi.pageXOffset = 100;
    windowApi.pageYOffset = 200;
    windowApi.document = {scrollingElement: {}};
    let el = {
      getBoundingClientRect: () => {
        return {left: 11.5, top: 12.5, width: 13.5, height: 14.5};
      }
    };
    let rect = binding.getLayoutRect(el);
    expect(rect.left).to.equal(112);  // round(100 + 11.5)
    expect(rect.top).to.equal(213);  // round(200 + 12.5)
    expect(rect.width).to.equal(14);  // round(13.5)
    expect(rect.height).to.equal(15);  // round(14.5)
  });
});


describe('ViewportBindingNaturalIosEmbed', () => {
  let sandbox;
  let windowMock;
  let binding;
  let windowApi;
  let windowEventHandlers;
  let bodyEventListeners;
  let bodyChildren;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    var WindowApi = function() {};
    windowEventHandlers = {};
    bodyEventListeners = {};
    bodyChildren = [];
    WindowApi.prototype.addEventListener = function(eventType, handler) {
      windowEventHandlers[eventType] = handler;
    };
    windowApi = new WindowApi();
    windowApi.document = {
      readyState: 'complete',
      documentElement: {style: {}},
      body: {
        style: {},
        appendChild: (child) => {
          bodyChildren.push(child);
        },
        addEventListener: (eventType, handler) => {
          bodyEventListeners[eventType] = handler;
        }
      },
      createElement: (tagName) => {
        return {
          tagName: tagName,
          id: '',
          style: {}
        };
      }
    };
    windowMock = sandbox.mock(windowApi);
    binding = new ViewportBindingNaturalIosEmbed_(windowApi);
  });

  afterEach(() => {
    binding = null;
    windowMock.verify();
    windowMock = null;
    sandbox.restore();
    sandbox = null;
  });

  it('should subscribe to resize events on window, scroll on body', () => {
    expect(windowEventHandlers['resize']).to.not.equal(undefined);
    expect(windowEventHandlers['scroll']).to.equal(undefined);
    expect(bodyEventListeners['scroll']).to.not.equal(undefined);
  });

  it('should setup document for embed scrolling', () => {
    let documentElement = windowApi.document.documentElement;
    let body = windowApi.document.body;
    expect(documentElement.style.overflow).to.equal('auto');
    expect(documentElement.style.webkitOverflowScrolling).to.equal('touch');
    expect(body.style.overflow).to.equal('auto');
    expect(body.style.webkitOverflowScrolling).to.equal('touch');
    expect(body.style.position).to.equal('absolute');
    expect(body.style.top).to.equal(0);
    expect(body.style.left).to.equal(0);
    expect(body.style.right).to.equal(0);
    expect(body.style.bottom).to.equal(0);

    expect(bodyChildren.length).to.equal(1);
    expect(bodyChildren[0].id).to.equal('-amp-scrollpos');
    expect(bodyChildren[0].style.position).to.equal('absolute');
    expect(bodyChildren[0].style.top).to.equal(0);
    expect(bodyChildren[0].style.left).to.equal(0);
    expect(bodyChildren[0].style.width).to.equal(0);
    expect(bodyChildren[0].style.height).to.equal(0);
    expect(bodyChildren[0].style.visibility).to.equal('hidden');
  });

  it('should update padding on BODY', () => {
    windowApi.document = {
      body: {style: {}}
    };
    binding.updatePaddingTop(31);
    expect(windowApi.document.body.style.paddingTop).to.
        equal('31px');
  });

  it('should calculate size', () => {
    windowApi.innerWidth = 111;
    windowApi.innerHeight = 222;
    let size = binding.getSize();
    expect(size.width).to.equal(111);
    expect(size.height).to.equal(222);
  });

  it('should calculate scrollTop from scrollpos element', () => {
    bodyChildren[0].getBoundingClientRect = () => {
      return {top: -17, left: -11};
    };
    binding.onScrolled_();
    expect(binding.getScrollTop()).to.equal(17);
  });

  it('should offset client rect for layout', () => {
    bodyChildren[0].getBoundingClientRect = () => {
      return {top: -200, left: -100};
    };
    binding.onScrolled_();
    let el = {
      getBoundingClientRect: () => {
        return {left: 11.5, top: 12.5, width: 13.5, height: 14.5};
      }
    };
    let rect = binding.getLayoutRect(el);
    expect(rect.left).to.equal(112);  // round(100 + 11.5)
    expect(rect.top).to.equal(213);  // round(200 + 12.5)
    expect(rect.width).to.equal(14);  // round(13.5)
    expect(rect.height).to.equal(15);  // round(14.5)
  });
});


describe('ViewportBindingVirtual', () => {
  let sandbox;
  let binding;
  let windowApi;
  let viewer;
  let viewerMock;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    viewer = {
      getViewportWidth: () => 111,
      getViewportHeight: () => 222,
      getScrollTop: () => 17,
      getPaddingTop: () => 19
    };
    viewerMock = sandbox.mock(viewer);
    windowApi = {
      document: {
        documentElement: {style: {}}
      }
    };
    binding = new ViewportBindingVirtual_(windowApi, viewer);
  });

  afterEach(() => {
    binding = null;
    viewer = null;
    sandbox.restore();
    sandbox = null;
  });

  it('should configure viewport parameters', () => {
    expect(binding.getSize().width).to.equal(111);
    expect(binding.getSize().height).to.equal(222);
    expect(binding.getScrollTop()).to.equal(17);
  });

  it('should update padding', () => {
    windowApi.document = {
      documentElement: {style: {}}
    };
    binding.updatePaddingTop(33);
    expect(windowApi.document.documentElement.style.paddingTop).to.
        equal('33px');
  });

  it('should send event on scroll changed', () => {
    let scrollHandler = sinon.spy();
    binding.onScroll(scrollHandler);
    expect(scrollHandler.callCount).to.equal(0);

    // No value.
    binding.updateViewerViewport(viewer);
    expect(scrollHandler.callCount).to.equal(0);
    expect(binding.getScrollTop()).to.equal(17);

    // Value didn't change.
    viewer.getScrollTop = () => {return 17;};
    binding.updateViewerViewport(viewer);
    expect(scrollHandler.callCount).to.equal(0);
    expect(binding.getScrollTop()).to.equal(17);

    // Value changed.
    viewer.getScrollTop = () => {return 19;};
    binding.updateViewerViewport(viewer);
    expect(scrollHandler.callCount).to.equal(1);
    expect(binding.getScrollTop()).to.equal(19);
  });

  it('should send event on size changed', () => {
    let resizeHandler = sinon.spy();
    binding.onResize(resizeHandler);
    expect(resizeHandler.callCount).to.equal(0);

    // No size.
    binding.updateViewerViewport(viewer);
    expect(resizeHandler.callCount).to.equal(0);
    expect(binding.getSize().width).to.equal(111);

    // Size didn't change.
    viewer.getViewportWidth = () => {return 111;};
    viewer.getViewportHeight = () => {return 222;}
    binding.updateViewerViewport(viewer);
    expect(resizeHandler.callCount).to.equal(0);
    expect(binding.getSize().width).to.equal(111);
    expect(binding.getSize().height).to.equal(222);

    // Width changed.
    viewer.getViewportWidth = () => {return 112;};
    binding.updateViewerViewport(viewer);
    expect(resizeHandler.callCount).to.equal(1);
    expect(binding.getSize().width).to.equal(112);
    expect(binding.getSize().height).to.equal(222);

    // Height changed.
    viewer.getViewportHeight = () => {return 223;}
    binding.updateViewerViewport(viewer);
    expect(resizeHandler.callCount).to.equal(2);
    expect(binding.getSize().width).to.equal(112);
    expect(binding.getSize().height).to.equal(223);
  });

  it('should NOT offset client rect for layout', () => {
    let el = {
      getBoundingClientRect: () => {
        return {left: 11.5, top: 12.5, width: 13.5, height: 14.5};
      }
    };
    let rect = binding.getLayoutRect(el);
    expect(rect.left).to.equal(12);  // round(11.5)
    expect(rect.top).to.equal(13);  // round(12.5)
    expect(rect.width).to.equal(14);  // round(13.5)
    expect(rect.height).to.equal(15);  // round(14.5)
  });
});
