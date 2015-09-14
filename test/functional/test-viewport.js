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

import {Viewport, ViewportBindingNatural_, ViewportBindingVirtual_} from
    '../../src/viewport';
import * as sinon from 'sinon';


describe('Viewport', () => {
  let sandbox;
  let clock;
  let viewport;
  let binding;
  let viewer;
  let viewerViewportHandler;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    clock = sandbox.useFakeTimers();
    viewerViewportHandler = undefined;
    viewer = {
      getViewportWidth: () => 111,
      getViewportHeight: () => 222,
      getScrollTop: () => 17,
      onViewportEvent: (handler) => {
        viewerViewportHandler = handler;
      }
    };
    binding = new ViewportBindingVirtual_(viewer);
    viewport = new Viewport(binding);
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
    viewerViewportHandler({height: 223});
    expect(changeEvent).to.not.equal(null);
    expect(changeEvent.relayoutAll).to.equal(false);
    expect(changeEvent.velocity).to.equal(0);
  });

  it('should relayout on width resize', () => {
    let changeEvent = null;
    viewport.onChanged((event) => {
      changeEvent = event;
    });
    viewerViewportHandler({width: 112});
    expect(changeEvent).to.not.equal(null);
    expect(changeEvent.relayoutAll).to.equal(true);
    expect(changeEvent.velocity).to.equal(0);
  });

  it('should defer scroll events', () => {
    let changeEvent = null;
    viewport.onChanged((event) => {
      changeEvent = event;
    });
    viewerViewportHandler({scrollTop: 34});
    expect(changeEvent).to.equal(null);

    // Not enough time past.
    clock.tick(100);
    viewerViewportHandler({scrollTop: 35});
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


describe('ViewportBindingVirtual', () => {
  let sandbox;
  let binding;
  let viewer;
  let viewerViewportHandler;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    viewerViewportHandler = undefined;
    viewer = {
      getViewportWidth: () => 111,
      getViewportHeight: () => 222,
      getScrollTop: () => 17,
      onViewportEvent: (handler) => {
        viewerViewportHandler = handler;
      }
    };
    binding = new ViewportBindingVirtual_(viewer);
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

  it('should subscribe to viewer viewport events', () => {
    expect(viewerViewportHandler).to.not.equal(undefined);
  });

  it('should send event on scroll changed', () => {
    let scrollHandler = sinon.spy();
    binding.onScroll(scrollHandler);
    expect(scrollHandler.callCount).to.equal(0);

    // No value.
    viewerViewportHandler({});
    expect(scrollHandler.callCount).to.equal(0);
    expect(binding.getScrollTop()).to.equal(17);

    // Value didn't change.
    viewerViewportHandler({scrollTop: 17});
    expect(scrollHandler.callCount).to.equal(0);
    expect(binding.getScrollTop()).to.equal(17);

    // Value changed.
    viewerViewportHandler({scrollTop: 19});
    expect(scrollHandler.callCount).to.equal(1);
    expect(binding.getScrollTop()).to.equal(19);
  });

  it('should send event on size changed', () => {
    let resizeHandler = sinon.spy();
    binding.onResize(resizeHandler);
    expect(resizeHandler.callCount).to.equal(0);

    // No size.
    viewerViewportHandler({});
    expect(resizeHandler.callCount).to.equal(0);
    expect(binding.getSize().width).to.equal(111);

    // Size didn't change.
    viewerViewportHandler({width: 111, height: 222});
    expect(resizeHandler.callCount).to.equal(0);
    expect(binding.getSize().width).to.equal(111);
    expect(binding.getSize().height).to.equal(222);

    // Width changed.
    viewerViewportHandler({width: 112});
    expect(resizeHandler.callCount).to.equal(1);
    expect(binding.getSize().width).to.equal(112);
    expect(binding.getSize().height).to.equal(222);

    // Height changed.
    viewerViewportHandler({height: 223});
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
