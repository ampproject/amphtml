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
          ViewportBindingVirtual_, parseViewportMeta, stringifyViewportMeta,
          updateViewportMetaString} from '../../src/viewport';
import {getStyle} from '../../src/style';
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
      onViewportEvent: handler => {
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
    viewport = new Viewport(windowApi, binding, viewer);
    viewport.getSize();
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
    expect(windowApi.document.documentElement.style.paddingTop).to
        .equal('19px');
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
    viewport.onChanged(event => {
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
    viewport.onChanged(event => {
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
    const bindingMock = sandbox.mock(binding);
    bindingMock.expects('updateViewerViewport').once();
    viewerViewportHandler();
    bindingMock.verify();
    bindingMock.restore();
  });

  it('should defer scroll events', () => {
    let changeEvent = null;
    viewport.onChanged(event => {
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

  it('should defer scroll events and react to reset of scroll pos', () => {
    let changeEvent = null;
    viewport.onChanged(event => {
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

    // Reset and wait a bit more time.
    viewport./*OK*/scrollTop_ = null;
    clock.tick(750);
    expect(changeEvent).to.not.equal(null);
    expect(changeEvent.relayoutAll).to.equal(false);
    expect(changeEvent.velocity).to.equal(0);
  });

  it('should update scroll pos and reset cache', () => {
    const bindingMock = sandbox.mock(binding);
    bindingMock.expects('setScrollTop').withArgs(117).once();
    viewport.setScrollTop(117);
    expect(viewport./*OK*/scrollTop_).to.be.null;
  });

  it('should change scrollTop for scrollIntoView and respect padding', () => {
    const element = document.createElement('div');
    const bindingMock = sandbox.mock(binding);
    bindingMock.expects('getLayoutRect').withArgs(element)
        .returns({top: 111}).once();
    bindingMock.expects('setScrollTop').withArgs(111 - /* padding */ 19).once();
    viewport.scrollIntoView(element);
  });

  it('should deletegate scrollWidth', () => {
    const bindingMock = sandbox.mock(binding);
    bindingMock.expects('getScrollWidth').withArgs().returns(111).once();
    expect(viewport.getScrollWidth()).to.equal(111);
  });
});


describe('Viewport META', () => {

  describe('parseViewportMeta', () => {
    it('should accept null or empty strings', () => {
      expect(parseViewportMeta(null)).to.be.empty;
    });
    it('should parse single key-value', () => {
      expect(parseViewportMeta('width=device-width')).to.deep.equal({
        'width': 'device-width'
      });
    });
    it('should parse two key-values', () => {
      expect(parseViewportMeta('width=device-width,minimum-scale=1')).to.deep
          .equal({
            'width': 'device-width',
            'minimum-scale': '1'
          });
    });
    it('should parse empty value', () => {
      expect(parseViewportMeta('width=device-width,minimal-ui')).to.deep.equal({
        'width': 'device-width',
        'minimal-ui': ''
      });
      expect(parseViewportMeta('minimal-ui,width=device-width')).to.deep.equal({
        'width': 'device-width',
        'minimal-ui': ''
      });
    });
    it('should return last dupe', () => {
      expect(parseViewportMeta('width=100,width=200')).to.deep.equal({
        'width': '200'
      });
    });
    it('should ignore extra delims', () => {
      expect(parseViewportMeta(',,,width=device-width,,,,minimum-scale=1,,,'))
          .to.deep.equal({
            'width': 'device-width',
            'minimum-scale': '1'
          });
    });
  });

  describe('stringifyViewportMeta', () => {
    it('should stringify empty', () => {
      expect(stringifyViewportMeta({})).to.equal('');
    });
    it('should stringify single key-value', () => {
      expect(stringifyViewportMeta({'width': 'device-width'}))
          .to.equal('width=device-width');
    });
    it('should stringify two key-values', () => {
      const res = stringifyViewportMeta({
        'width': 'device-width',
        'minimum-scale': '1'
      });
      expect(res == 'width=device-width,minimum-scale=1' ||
          res == 'minimum-scale=1,width=device-width')
          .to.be.true;
    });
    it('should stringify empty values', () => {
      const res = stringifyViewportMeta({
        'width': 'device-width',
        'minimal-ui': ''
      });
      expect(res == 'width=device-width,minimal-ui' ||
          res == 'minimal-ui,width=device-width')
          .to.be.true;
    });
  });

  describe('updateViewportMetaString', () => {
    it('should do nothing with empty values', () => {
      expect(updateViewportMetaString(
          '', {})).to.equal('');
      expect(updateViewportMetaString(
          'width=device-width', {})).to.equal('width=device-width');
    });
    it('should add a new value', () => {
      expect(updateViewportMetaString(
          '', {'minimum-scale': '1'})).to.equal('minimum-scale=1');
      expect(parseViewportMeta(updateViewportMetaString(
          'width=device-width', {'minimum-scale': '1'})))
          .to.deep.equal({
            'width': 'device-width',
            'minimum-scale': '1'
          });
    });
    it('should replace the existing value', () => {
      expect(parseViewportMeta(updateViewportMetaString(
          'width=device-width,minimum-scale=2', {'minimum-scale': '1'})))
          .to.deep.equal({
            'width': 'device-width',
            'minimum-scale': '1'
          });
    });
    it('should delete the existing value', () => {
      expect(parseViewportMeta(updateViewportMetaString(
          'width=device-width,minimum-scale=1', {'minimum-scale': undefined})))
          .to.deep.equal({
            'width': 'device-width'
          });
    });
    it('should ignore delete for a non-existing value', () => {
      expect(parseViewportMeta(updateViewportMetaString(
          'width=device-width', {'minimum-scale': undefined})))
          .to.deep.equal({
            'width': 'device-width'
          });
    });
    it('should do nothing if values did not change', () => {
      expect(updateViewportMetaString(
          'width=device-width,minimum-scale=1', {'minimum-scale': '1'}))
          .to.equal('width=device-width,minimum-scale=1');
    });
  });

  describe('TouchZoom', () => {
    let sandbox;
    let clock;
    let viewport;
    let binding;
    let viewer;
    let viewerMock;
    let windowApi;
    let originalViewportMetaString, viewportMetaString;
    let viewportMeta;
    let viewportMetaSetter;

    beforeEach(() => {
      sandbox = sinon.sandbox.create();
      clock = sandbox.useFakeTimers();
      viewer = {
        getViewportWidth: () => 111,
        getViewportHeight: () => 222,
        getScrollTop: () => 0,
        getPaddingTop: () => 0,
        onViewportEvent: () => {},
        isEmbedded: () => false
      };
      viewerMock = sandbox.mock(viewer);

      originalViewportMetaString = 'width=device-width,minimum-scale=1';
      viewportMetaString = originalViewportMetaString;
      viewportMeta = Object.create(null);
      viewportMetaSetter = sinon.spy();
      Object.defineProperty(viewportMeta, 'content', {
        get: () => viewportMetaString,
        set: value => {
          viewportMetaSetter(value);
          viewportMetaString = value;
        }
      });
      windowApi = {
        document: {
          documentElement: {style: {}},
          querySelector: selector => {
            if (selector == 'meta[name=viewport]') {
              return viewportMeta;
            }
            return undefined;
          }
        }
      };

      binding = new ViewportBindingVirtual_(windowApi, viewer);
      viewport = new Viewport(windowApi, binding, viewer);
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

    it('should initialize original viewport meta', () => {
      viewport.getViewportMeta_();
      expect(viewport.originalViewportMetaString_).to.equal(viewportMetaString);
      expect(viewportMetaSetter.callCount).to.equal(0);
    });

    it('should disable TouchZoom', () => {
      viewport.disableTouchZoom();
      expect(viewportMetaSetter.callCount).to.equal(1);
      expect(viewportMetaString).to.have.string('maximum-scale=1');
      expect(viewportMetaString).to.have.string('user-scalable=no');
    });

    it('should ignore disable TouchZoom if already disabled', () => {
      viewportMetaString = 'width=device-width,minimum-scale=1,' +
          'maximum-scale=1,user-scalable=no';
      viewport.disableTouchZoom();
      expect(viewportMetaSetter.callCount).to.equal(0);
    });

    it('should ignore disable TouchZoom if embedded', () => {
      viewerMock.expects('isEmbedded').returns(true).atLeast(1);
      viewport.disableTouchZoom();
      expect(viewportMetaSetter.callCount).to.equal(0);
    });

    it('should restore TouchZoom', () => {
      viewport.disableTouchZoom();
      expect(viewportMetaSetter.callCount).to.equal(1);
      expect(viewportMetaString).to.have.string('maximum-scale=1');
      expect(viewportMetaString).to.have.string('user-scalable=no');

      viewport.restoreOriginalTouchZoom();
      expect(viewportMetaSetter.callCount).to.equal(2);
      expect(viewportMetaString).to.equal(originalViewportMetaString);
    });

    it('should reset TouchZoom; zooming state unknown', () => {
      viewport.resetTouchZoom();
      expect(viewportMetaSetter.callCount).to.equal(1);
      expect(viewportMetaString).to.have.string('maximum-scale=1');
      expect(viewportMetaString).to.have.string('user-scalable=no');

      clock.tick(1000);
      expect(viewportMetaSetter.callCount).to.equal(2);
      expect(viewportMetaString).to.equal(originalViewportMetaString);
    });

    it('should ignore reset TouchZoom if not currently zoomed', () => {
      windowApi.document.documentElement.clientHeight = 500;
      windowApi.innerHeight = 500;
      viewport.resetTouchZoom();
      expect(viewportMetaSetter.callCount).to.equal(0);
    });

    it('should proceed with reset TouchZoom if currently zoomed', () => {
      windowApi.document.documentElement.clientHeight = 500;
      windowApi.innerHeight = 300;
      viewport.resetTouchZoom();
      expect(viewportMetaSetter.callCount).to.equal(1);
    });

    it('should ignore reset TouchZoom if embedded', () => {
      viewerMock.expects('isEmbedded').returns(true).atLeast(1);
      viewport.resetTouchZoom();
      expect(viewportMetaSetter.callCount).to.equal(0);
    });
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
    const WindowApi = function() {};
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
    expect(windowApi.document.documentElement.style.paddingTop).to
        .equal('31px');
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
    const size = binding.getSize();
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

  it('should calculate scrollWidth from scrollElement', () => {
    windowApi.pageYOffset = 11;
    windowApi.document = {
      scrollingElement: {
        scrollWidth: 117
      }
    };
    expect(binding.getScrollWidth()).to.equal(117);
  });

  it('should update scrollTop on scrollElement', () => {
    windowApi.pageYOffset = 11;
    windowApi.document = {
      scrollingElement: {
        scrollTop: 17
      }
    };
    binding.setScrollTop(21);
    expect(windowApi.document.scrollingElement./*OK*/scrollTop).to.equal(21);
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
    const el = {
      getBoundingClientRect: () => {
        return {left: 11.5, top: 12.5, width: 13.5, height: 14.5};
      }
    };
    const rect = binding.getLayoutRect(el);
    expect(rect.left).to.equal(112);  // round(100 + 11.5)
    expect(rect.top).to.equal(213);  // round(200 + 12.5)
    expect(rect.width).to.equal(14);  // round(13.5)
    expect(rect.height).to.equal(15);  // round(14.5)
  });
});


describe('ViewportBindingNaturalIosEmbed', () => {
  let sandbox;
  let clock;
  let windowMock;
  let binding;
  let windowApi;
  let windowEventHandlers;
  let bodyEventListeners;
  let bodyChildren;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    clock = sandbox.useFakeTimers();
    const WindowApi = function() {};
    windowEventHandlers = {};
    bodyEventListeners = {};
    bodyChildren = [];
    WindowApi.prototype.addEventListener = function(eventType, handler) {
      windowEventHandlers[eventType] = handler;
    };
    windowApi = new WindowApi();
    windowApi.innerWidth = 555;
    windowApi.document = {
      readyState: 'complete',
      documentElement: {style: {}},
      body: {
        scrollWidth: 777,
        style: {},
        appendChild: child => {
          bodyChildren.push(child);
        },
        addEventListener: (eventType, handler) => {
          bodyEventListeners[eventType] = handler;
        }
      },
      createElement: tagName => {
        return {
          tagName: tagName,
          id: '',
          style: {},
          scrollIntoView: sinon.spy()
        };
      }
    };
    windowMock = sandbox.mock(windowApi);
    binding = new ViewportBindingNaturalIosEmbed_(windowApi);
    clock.tick(1);
    return Promise.resolve();
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

  it('should pre-calculate scrollWidth', () => {
    expect(binding.scrollWidth_).to.equal(777);
  });

  it('should defer scrollWidth to max of window.innerHeight ' +
        ' and body.scrollWidth', () => {
    binding.scrollWidth_ = 0;
    expect(binding.getScrollWidth()).to.equal(555);

    binding.scrollWidth_ = 1000;
    expect(binding.getScrollWidth()).to.equal(1000);
  });

  it('should setup document for embed scrolling', () => {
    const documentElement = windowApi.document.documentElement;
    const body = windowApi.document.body;
    expect(documentElement.style.overflow).to.equal('auto');
    expect(documentElement.style.webkitOverflowScrolling).to.equal('touch');
    expect(body.style.overflow).to.equal('auto');
    expect(body.style.webkitOverflowScrolling).to.equal('touch');
    expect(body.style.position).to.equal('absolute');
    expect(body.style.top).to.equal(0);
    expect(body.style.left).to.equal(0);
    expect(body.style.right).to.equal(0);
    expect(body.style.bottom).to.equal(0);

    expect(bodyChildren.length).to.equal(2);

    expect(bodyChildren[0].id).to.equal('-amp-scrollpos');
    expect(bodyChildren[0].style.position).to.equal('absolute');
    expect(bodyChildren[0].style.top).to.equal(0);
    expect(bodyChildren[0].style.left).to.equal(0);
    expect(bodyChildren[0].style.width).to.equal(0);
    expect(bodyChildren[0].style.height).to.equal(0);
    expect(bodyChildren[0].style.visibility).to.equal('hidden');

    expect(bodyChildren[1].id).to.equal('-amp-scrollmove');
    expect(bodyChildren[1].style.position).to.equal('absolute');
    expect(bodyChildren[1].style.top).to.equal(0);
    expect(bodyChildren[1].style.left).to.equal(0);
    expect(bodyChildren[1].style.width).to.equal(0);
    expect(bodyChildren[1].style.height).to.equal(0);
    expect(bodyChildren[1].style.visibility).to.equal('hidden');
  });

  it('should update padding on BODY', () => {
    windowApi.document = {
      body: {style: {}}
    };
    binding.updatePaddingTop(31);
    expect(windowApi.document.body.style.paddingTop).to
        .equal('31px');
  });

  it('should calculate size', () => {
    windowApi.innerWidth = 111;
    windowApi.innerHeight = 222;
    const size = binding.getSize();
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

  it('should update scroll position via moving element', () => {
    const moveEl = bodyChildren[1];
    binding.setScrollTop(17);
    expect(getStyle(moveEl, 'transform')).to.equal('translateY(17px)');
    expect(moveEl.scrollIntoView.callCount).to.equal(1);
    expect(moveEl.scrollIntoView.firstCall.args[0]).to.equal(true);
  });

  it('should offset client rect for layout', () => {
    bodyChildren[0].getBoundingClientRect = () => {
      return {top: -200, left: -100};
    };
    binding.onScrolled_();
    const el = {
      getBoundingClientRect: () => {
        return {left: 11.5, top: 12.5, width: 13.5, height: 14.5};
      }
    };
    const rect = binding.getLayoutRect(el);
    expect(rect.left).to.equal(112);  // round(100 + 11.5)
    expect(rect.top).to.equal(213);  // round(200 + 12.5)
    expect(rect.width).to.equal(14);  // round(13.5)
    expect(rect.height).to.equal(15);  // round(14.5)
  });

  it('should set scroll position via moving element', () => {
    const moveEl = bodyChildren[1];
    binding.setScrollPos_(10);
    expect(getStyle(moveEl, 'transform')).to.equal('translateY(10px)');
    expect(moveEl.scrollIntoView.callCount).to.equal(1);
    expect(moveEl.scrollIntoView.firstCall.args[0]).to.equal(true);
  });

  it('should adjust scroll position when scrolled to 0', () => {
    const posEl = bodyChildren[0];
    posEl.getBoundingClientRect = () => {return {top: 0, left: 0};};
    const moveEl = bodyChildren[1];
    const event = {preventDefault: sinon.spy()};
    binding.adjustScrollPos_(event);
    expect(getStyle(moveEl, 'transform')).to.equal('translateY(1px)');
    expect(moveEl.scrollIntoView.callCount).to.equal(1);
    expect(moveEl.scrollIntoView.firstCall.args[0]).to.equal(true);
    expect(event.preventDefault.callCount).to.equal(1);
  });

  it('should adjust scroll position when scrolled to 0; w/o event', () => {
    const posEl = bodyChildren[0];
    posEl.getBoundingClientRect = () => {return {top: 0, left: 0};};
    const moveEl = bodyChildren[1];
    binding.adjustScrollPos_();
    expect(moveEl.scrollIntoView.callCount).to.equal(1);
  });

  it('should NOT adjust scroll position when scrolled away from 0', () => {
    const posEl = bodyChildren[0];
    posEl.getBoundingClientRect = () => {return {top: -10, left: 0};};
    const moveEl = bodyChildren[1];
    const event = {preventDefault: sinon.spy()};
    binding.adjustScrollPos_(event);
    expect(moveEl.scrollIntoView.callCount).to.equal(0);
    expect(event.preventDefault.callCount).to.equal(0);
  });

  it('should NOT adjust scroll position when overscrolled', () => {
    const posEl = bodyChildren[0];
    posEl.getBoundingClientRect = () => {return {top: 10, left: 0};};
    const moveEl = bodyChildren[1];
    const event = {preventDefault: sinon.spy()};
    binding.adjustScrollPos_(event);
    expect(moveEl.scrollIntoView.callCount).to.equal(0);
    expect(event.preventDefault.callCount).to.equal(0);
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
    expect(windowApi.document.documentElement.style.paddingTop).to
        .equal('33px');
  });

  it('should send event on scroll changed', () => {
    const scrollHandler = sinon.spy();
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
    const resizeHandler = sinon.spy();
    binding.onResize(resizeHandler);
    expect(resizeHandler.callCount).to.equal(0);

    // No size.
    binding.updateViewerViewport(viewer);
    expect(resizeHandler.callCount).to.equal(0);
    expect(binding.getSize().width).to.equal(111);

    // Size didn't change.
    viewer.getViewportWidth = () => {return 111;};
    viewer.getViewportHeight = () => {return 222;};
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
    viewer.getViewportHeight = () => {return 223;};
    binding.updateViewerViewport(viewer);
    expect(resizeHandler.callCount).to.equal(2);
    expect(binding.getSize().width).to.equal(112);
    expect(binding.getSize().height).to.equal(223);
  });

  it('should NOT offset client rect for layout', () => {
    const el = {
      getBoundingClientRect: () => {
        return {left: 11.5, top: 12.5, width: 13.5, height: 14.5};
      }
    };
    const rect = binding.getLayoutRect(el);
    expect(rect.left).to.equal(12);  // round(11.5)
    expect(rect.top).to.equal(13);  // round(12.5)
    expect(rect.width).to.equal(14);  // round(13.5)
    expect(rect.height).to.equal(15);  // round(14.5)
  });
});
