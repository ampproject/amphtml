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

import {AmpDocSingle, installDocService} from '../../src/service/ampdoc-impl';
import {ampdocServiceFor} from '../../src/ampdoc';
import {
  installViewportServiceForDoc,
  Viewport,
  ViewportBindingDef,
  ViewportBindingIosEmbedWrapper_,
  ViewportBindingNatural_,
  ViewportBindingNaturalIosEmbed_,
  parseViewportMeta,
  stringifyViewportMeta,
  updateViewportMetaString,
} from '../../src/service/viewport-impl';
import {dev} from '../../src/log';
import {getMode} from '../../src/mode';
import {installPlatformService} from '../../src/service/platform-impl';
import {installTimerService} from '../../src/service/timer-impl';
import {installViewerServiceForDoc} from '../../src/service/viewer-impl';
import {installVsyncService} from '../../src/service/vsync-impl';
import {loadPromise} from '../../src/event-helper';
import {
  platformFor,
  viewerForDoc,
  viewportForDoc,
  vsyncFor,
} from '../../src/services';
import {setParentWindow} from '../../src/service';
import {whenDocumentReady} from '../../src/document-ready';
import * as sinon from 'sinon';


describes.fakeWin('Viewport', {}, env => {
  let clock;
  let viewport;
  let binding;
  let viewer;
  let viewerMock;
  let windowApi;
  let ampdoc;
  let visibilityState;
  let viewerViewportHandler;
  let viewerScrollDocHandler;
  let updatedPaddingTop;
  let viewportSize;
  let vsyncTasks;

  beforeEach(() => {
    clock = sandbox.useFakeTimers();

    windowApi = env.win;
    windowApi.requestAnimationFrame = fn => window.setTimeout(fn, 16);

    viewerViewportHandler = undefined;
    viewerScrollDocHandler = undefined;
    visibilityState = 'visible';
    viewer = {
      isEmbedded: () => false,
      getParam: param => {
        if (param == 'paddingTop') {
          return 19;
        }
        return undefined;
      },
      onMessage: (eventType, handler) => {
        if (eventType == 'viewport') {
          viewerViewportHandler = handler;
        } else if (eventType == 'scroll') {
          viewerScrollDocHandler = handler;
        }
      },
      sendMessage: sandbox.spy(),
      getVisibilityState: () => visibilityState,
      isVisible: () => (visibilityState == 'visible'),
      onVisibilityChanged: () => {},
    };
    viewerMock = sandbox.mock(viewer);
    installTimerService(windowApi);
    installVsyncService(windowApi);
    installPlatformService(windowApi);

    installDocService(windowApi, /* isSingleDoc */ true);
    ampdoc = ampdocServiceFor(windowApi).getAmpDoc();
    installViewerServiceForDoc(ampdoc);

    binding = new ViewportBindingDef();
    viewportSize = {width: 111, height: 222};
    binding.getSize = () => {
      return {width: viewportSize.width, height: viewportSize.height};
    };
    binding.getScrollTop = () => 17;
    binding.getScrollLeft = () => 0;
    binding.connect = sandbox.spy();
    binding.disconnect = sandbox.spy();
    updatedPaddingTop = undefined;
    binding.updatePaddingTop = paddingTop => updatedPaddingTop = paddingTop;
    viewport = new Viewport(ampdoc, binding, viewer);
    viewport.fixedLayer_ = {
      update: () => {
        return {then: callback => callback()};
      },
      updatePaddingTop: () => {},
    };
    viewport.getSize();

    // Use window since Animation by default will use window.
    const vsync = vsyncFor(window);
    vsyncTasks = [];
    sandbox.stub(vsync, 'canAnimate').returns(true);
    sandbox.stub(vsync, 'createAnimTask', (unusedContextNode, task) => {
      return () => {
        vsyncTasks.push(task);
      };
    });
  });

  afterEach(() => {
    expect(vsyncTasks.length).to.equal(0);
    viewerMock.verify();
  });

  function runVsync() {
    const tasks = vsyncTasks.slice(0);
    vsyncTasks = [];
    tasks.forEach(function(task) {
      const state = {};
      if (task.measure) {
        task.measure(state);
      }
      task.mutate(state);
    });
  }

  describe('top-level classes', () => {
    let root;

    beforeEach(() => {
      root = windowApi.document.documentElement;
      root.className = '';
    });

    it('should set singledoc class', () => {
      new Viewport(ampdoc, binding, viewer);
      expect(root).to.have.class('i-amphtml-singledoc');
    });

    it('should not set singledoc class', () => {
      sandbox.stub(ampdoc, 'isSingleDoc', () => false);
      new Viewport(ampdoc, binding, viewer);
      expect(root).to.not.have.class('i-amphtml-singledoc');
    });

    it('should set standalone class', () => {
      new Viewport(ampdoc, binding, viewer);
      expect(root).to.have.class('i-amphtml-standalone');
      expect(root).to.not.have.class('i-amphtml-embedded');
    });

    it('should set embedded class', () => {
      sandbox.stub(viewer, 'isEmbedded', () => true);
      new Viewport(ampdoc, binding, viewer);
      expect(root).to.have.class('i-amphtml-embedded');
      expect(root).to.not.have.class('i-amphtml-standalone');
    });

    it('should not set iframed class', () => {
      new Viewport(ampdoc, binding, viewer);
      expect(root).to.not.have.class('i-amphtml-iframed');
    });

    it('should set iframed class', () => {
      ampdoc.win.parent = {};
      new Viewport(ampdoc, binding, viewer);
      expect(root).to.have.class('i-amphtml-iframed');
    });

    describe('ios-webview', () => {
      let webviewParam;
      let isIos;

      beforeEach(() => {
        webviewParam = '1';
        sandbox.stub(viewer, 'getParam', param => {
          if (param == 'webview') {
            return webviewParam;
          }
          return null;
        });
        const platform = platformFor(ampdoc.win);
        isIos = true;
        sandbox.stub(platform, 'isIos', () => isIos);
      });

      it('should set ios-webview class', () => {
        new Viewport(ampdoc, binding, viewer);
        expect(root).to.have.class('i-amphtml-webview');
      });

      it('should set ios-webview class even when not on iOS', () => {
        isIos = false;
        new Viewport(ampdoc, binding, viewer);
        expect(root).to.have.class('i-amphtml-webview');
      });

      it('should not set ios-webview class w/o webview param', () => {
        webviewParam = null;
        new Viewport(ampdoc, binding, viewer);
        expect(root).to.not.have.class('i-amphtml-webview');
      });
    });
  });

  describe('zero dimensions', () => {
    let errorStub;
    let randomValue;

    beforeEach(() => {
      viewport.size_ = null;
      errorStub = sandbox.stub(dev(), 'error');
      randomValue = 0.009;
      sandbox.stub(Math, 'random', () => randomValue);
    });

    it('should be ok with non-zero dimensions', () => {
      expect(viewport.getSize().width).to.equal(111);
      expect(viewport.getSize().height).to.equal(222);
      expect(errorStub).to.not.be.called;
    });

    it('should report zero width', () => {
      binding.getSize = () => {
        return {width: 0, height: viewportSize.height};
      };
      expect(viewport.getSize().width).to.equal(0);
      expect(viewport.getSize().height).to.equal(222);
      expect(errorStub).to.be.calledOnce;
      expect(errorStub).to.be.calledWith(
          'Viewport', 'viewport has zero dimensions');
    });

    it('should report zero height', () => {
      binding.getSize = () => {
        return {width: viewportSize.width, height: 0};
      };
      expect(viewport.getSize().width).to.equal(111);
      expect(viewport.getSize().height).to.equal(0);
      expect(errorStub).to.be.calledOnce;
      expect(errorStub).to.be.calledWith(
          'Viewport', 'viewport has zero dimensions');
    });

    it('should report both zero width and height', () => {
      binding.getSize = () => {
        return {width: 0, height: 0};
      };
      expect(viewport.getSize().width).to.equal(0);
      expect(viewport.getSize().height).to.equal(0);
      expect(errorStub).to.be.calledOnce;
      expect(errorStub).to.be.calledWith(
          'Viewport', 'viewport has zero dimensions');
    });

    it('should report only 1% of the time', () => {
      binding.getSize = () => {
        return {width: 0, height: 0};
      };
      randomValue = 0.011;
      expect(viewport.getSize().width).to.equal(0);
      expect(viewport.getSize().height).to.equal(0);
      expect(errorStub).to.not.be.called;
    });

    it('should report in prerender state', () => {
      visibilityState = 'prerender';
      binding.getSize = () => {
        return {width: 0, height: 0};
      };
      expect(viewport.getSize().width).to.equal(0);
      expect(viewport.getSize().height).to.equal(0);
      expect(errorStub).to.be.calledOnce;
      expect(errorStub).to.be.calledWith(
          'Viewport', 'viewport has zero dimensions');
    });

    it('should NOT report in hidden state', () => {
      visibilityState = 'hidden';
      binding.getSize = () => {
        return {width: 0, height: 0};
      };
      expect(viewport.getSize().width).to.equal(0);
      expect(viewport.getSize().height).to.equal(0);
      expect(errorStub).to.not.be.called;
    });

    it('should NOT report in inactive state', () => {
      visibilityState = 'inactive';
      binding.getSize = () => {
        return {width: 0, height: 0};
      };
      expect(viewport.getSize().width).to.equal(0);
      expect(viewport.getSize().height).to.equal(0);
      expect(errorStub).to.not.be.called;
    });
  });

  it('should connect binding right away when visible', () => {
    expect(binding.connect).to.be.calledOnce;
    expect(binding.disconnect).to.not.be.called;
  });

  it('should disconnect binding on dispose', () => {
    viewport.dispose();
    expect(binding.disconnect).to.be.calledOnce;
  });

  it('should connect binding later when visibility changes', () => {
    binding.connect = sandbox.spy();
    binding.disconnect = sandbox.spy();
    viewer.isVisible = () => false;
    let onVisibilityHandler;
    viewer.onVisibilityChanged = handler => onVisibilityHandler = handler;
    viewport = new Viewport(ampdoc, binding, viewer);

    // Hasn't been called at first.
    expect(binding.connect).to.not.be.called;
    expect(binding.disconnect).to.not.be.called;
    expect(viewport.size_).to.be.null;

    // When becomes visible - it gets called.
    viewer.isVisible = () => true;
    onVisibilityHandler();
    expect(binding.connect).to.be.calledOnce;
    expect(binding.disconnect).to.not.be.called;

    // Repeat visibility calls do not affect anything.
    onVisibilityHandler();
    expect(binding.connect).to.be.calledOnce;
    expect(binding.disconnect).to.not.be.called;

    // When becomes invisible - it gets disconnected.
    viewer.isVisible = () => false;
    onVisibilityHandler();
    expect(binding.connect).to.be.calledOnce;
    expect(binding.disconnect).to.be.calledOnce;
  });

  it('should resize only after size has been initialed', () => {
    binding.connect = sandbox.spy();
    binding.disconnect = sandbox.spy();
    viewer.isVisible = () => true;
    let onVisibilityHandler;
    viewer.onVisibilityChanged = handler => onVisibilityHandler = handler;
    viewport = new Viewport(ampdoc, binding, viewer);

    // Size has not be initialized yet.
    expect(binding.connect).to.be.calledOnce;
    expect(binding.disconnect).to.not.be.called;
    expect(viewport.size_).to.be.null;

    // Disconnect: ignore resizing.
    viewer.isVisible = () => false;
    onVisibilityHandler();
    expect(binding.connect).to.be.calledOnce;
    expect(binding.disconnect).to.be.calledOnce;
    expect(viewport.size_).to.be.null;

    // Size has been initialized.
    viewport.size_ = {width: 0, height: 0};
    viewer.isVisible = () => true;
    onVisibilityHandler();
    expect(binding.connect).to.be.calledTwice;
    expect(binding.disconnect).to.be.calledOnce;
    expect(viewport.size_).to.deep.equal(viewportSize);
  });

  it('should pass through size and scroll', () => {
    expect(viewport.getPaddingTop()).to.equal(19);
    expect(updatedPaddingTop).to.equal(19);
    expect(viewport.getSize().width).to.equal(111);
    expect(viewport.getSize().height).to.equal(222);
    expect(viewport.getTop()).to.equal(17);
    expect(viewport.getRect().left).to.equal(0);
    expect(viewport.getRect().top).to.equal(17);
    expect(viewport.getRect().width).to.equal(111);
    expect(viewport.getRect().height).to.equal(222);
  });

  it('should cache result for getRect()', () => {
    assert.strictEqual(viewport.getRect(), viewport.getRect());
  });

  it('should invalidate getRect() cache after scroll', () => {
    expect(viewport.getRect().top).to.equal(17);

    // Scroll vertically.
    binding.getScrollTop = () => 44;
    viewport.scroll_();

    expect(viewport.getRect().top).to.equal(44);
  });

  it('should invalidate getRect() cache after resize', () => {
    expect(viewport.getRect().width).to.equal(111);

    // Resize horizontally.
    viewportSize.width = 112;
    viewport.resize_();

    expect(viewport.getRect().width).to.equal(112);
  });

  it('should not relayout on height resize', () => {
    let changeEvent = null;
    viewport.onChanged(event => {
      changeEvent = event;
    });
    viewportSize.height = 223;
    viewport.resize_();
    expect(changeEvent).to.not.equal(null);
    expect(changeEvent.relayoutAll).to.equal(false);
    expect(changeEvent.velocity).to.equal(0);
  });

  it('should relayout on width resize', () => {
    let changeEvent = null;
    viewport.onChanged(event => {
      changeEvent = event;
    });
    viewportSize.width = 112;
    viewport.resize_();
    expect(changeEvent).to.not.equal(null);
    expect(changeEvent.relayoutAll).to.equal(true);
    expect(changeEvent.velocity).to.equal(0);
  });

  it('should defer change event until fixed layer is complete', () => {
    let changeEvent = null;
    viewport.onChanged(event => {
      changeEvent = event;
    });
    let fixedResolver;
    const fixedPromise = new Promise(resolve => fixedResolver = resolve);
    viewport.fixedLayer_ = {update: () => fixedPromise};
    viewportSize.width = 112;
    viewport.resize_();
    expect(changeEvent).to.be.null;
    fixedResolver();
    return fixedPromise.then(() => {
      expect(changeEvent).to.not.be.null;
    });
  });

  it('should not do anything if padding is not changed', () => {
    const bindingMock = sandbox.mock(binding);
    viewerViewportHandler({paddingTop: 19});
    bindingMock.verify();
  });

  it('should update non-transient padding', () => {
    const bindingMock = sandbox.mock(binding);
    const fixedLayerMock = sandbox.mock(viewport.fixedLayer_);
    fixedLayerMock.expects('updatePaddingTop')
        .withExactArgs(/* paddingTop */ 0, /* transient */ undefined)
        .once();
    viewerViewportHandler({paddingTop: 0});
    bindingMock.verify();
    fixedLayerMock.verify();
  });

  it('should update padding when viewer wants to hide header', () => {
    const bindingMock = sandbox.mock(binding);
    const fixedLayerMock = sandbox.mock(viewport.fixedLayer_);
    fixedLayerMock.expects('updatePaddingTop')
        .withExactArgs(/* paddingTop */ 0, /* transient */ true)
        .once();
    bindingMock.expects('hideViewerHeader').withArgs(true, 19).once();
    viewerViewportHandler({paddingTop: 0, duation: 300, curve: 'ease-in',
        transient: true});
    bindingMock.verify();
    fixedLayerMock.verify();
  });

  it('should update padding for fixed layer when viewer wants to ' +
      'hide header', () => {
    viewport.fixedLayer_ = {updatePaddingTop: () => {}};
    const fixedLayerMock = sandbox.mock(viewport.fixedLayer_);
    fixedLayerMock.expects('updatePaddingTop').withArgs(0).once();
    viewerViewportHandler({paddingTop: 0, duation: 300, curve: 'ease-in',
        transient: 'true'});
    fixedLayerMock.verify();
  });

  it('should update viewport when entering lightbox mode', () => {
    viewport.vsync_ = {mutate: callback => callback()};
    const enterOverlayModeStub = sandbox.stub(viewport, 'enterOverlayMode');
    const hideFixedLayerStub = sandbox.stub(viewport, 'hideFixedLayer');
    const bindingMock = sandbox.mock(binding);
    bindingMock.expects('updateLightboxMode').withArgs(true).once();

    viewport.enterLightboxMode();

    bindingMock.verify();
    expect(enterOverlayModeStub).to.be.calledOnce;
    expect(hideFixedLayerStub).to.be.calledOnce;

    expect(viewer.sendMessage).to.have.been.calledOnce;
    expect(viewer.sendMessage).to.have.been.calledWith('requestFullOverlay',
        {}, true);
  });

  it('should update viewport when leaving lightbox mode', () => {
    viewport.vsync_ = {mutate: callback => callback()};
    const leaveOverlayModeStub = sandbox.stub(viewport, 'leaveOverlayMode');
    const showFixedLayerStub = sandbox.stub(viewport, 'showFixedLayer');
    const bindingMock = sandbox.mock(binding);
    bindingMock.expects('updateLightboxMode').withArgs(false).once();

    viewport.leaveLightboxMode();

    bindingMock.verify();
    expect(leaveOverlayModeStub).to.be.calledOnce;
    expect(showFixedLayerStub).to.be.calledOnce;

    expect(viewer.sendMessage).to.have.been.calledOnce;
    expect(viewer.sendMessage).to.have.been.calledWith('cancelFullOverlay',
        {}, true);
  });

  it('should update viewport when entering overlay mode', () => {
    const disableTouchZoomStub = sandbox.stub(viewport, 'disableTouchZoom');
    const disableScrollStub = sandbox.stub(viewport, 'disableScroll');

    viewport.enterOverlayMode();

    expect(disableTouchZoomStub).to.be.calledOnce;
    expect(disableScrollStub).to.be.calledOnce;
  });

  it('should update viewport when leaving overlay mode', () => {
    const restoreOriginalTouchZoomStub = sandbox.stub(viewport,
        'restoreOriginalTouchZoom');
    const resetScrollStub = sandbox.stub(viewport, 'resetScroll');

    viewport.leaveOverlayMode();

    expect(restoreOriginalTouchZoomStub).to.be.calledOnce;
    expect(resetScrollStub).to.be.calledOnce;
  });

  it('should send scroll events', () => {
    // 0         ->    6     ->      12   ->      16         ->   18
    // scroll-10    scroll-20    scroll-30   2nd anim frame    scroll-40

    // when there's no scroll
    expect(viewport.scrollAnimationFrameThrottled_).to.be.false;
    expect(viewer.sendMessage).to.not.have.been.called;
    // scroll to 10
    viewport.getScrollTop = () => 10;
    viewport.sendScrollMessage_();
    expect(viewport.scrollAnimationFrameThrottled_).to.be.true;
    expect(viewer.sendMessage).to.not.have.been.called;
    // 6 ticks later, still during first animation frame
    clock.tick(6);
    expect(viewport.scrollAnimationFrameThrottled_).to.be.true;
    // scroll to 20
    viewport.getScrollTop = () => 20;
    viewport.sendScrollMessage_();
    expect(viewport.scrollAnimationFrameThrottled_).to.be.true;
    expect(viewer.sendMessage).to.not.have.been.called;
    // 6 ticks later, still during first animation frame
    clock.tick(6);
    expect(viewport.scrollAnimationFrameThrottled_).to.be.true;
    // scroll to 30
    viewport.getScrollTop = () => 30;
    viewport.sendScrollMessage_();
    expect(viewport.scrollAnimationFrameThrottled_).to.be.true;
    expect(viewer.sendMessage).to.not.have.been.called;
    // 6 ticks later, second animation frame starts
    clock.tick(6);
    expect(viewport.scrollAnimationFrameThrottled_).to.be.false;
    expect(viewer.sendMessage).to.have.been.calledOnce;
    expect(viewer.sendMessage).to.have.been.calledWith('scroll',
        {scrollTop: 30}, true);
    // scroll to 40
    viewport.getScrollTop = () => 40;
    viewport.sendScrollMessage_();
    expect(viewport.scrollAnimationFrameThrottled_).to.be.true;
    expect(viewer.sendMessage).to.have.been.calledOnce;
  });

  it('should defer scroll events', () => {
    let changeEvent = null;
    let eventCount = 0;
    viewport.onChanged(event => {
      changeEvent = event;
      eventCount++;
    });
    // when there's no scroll
    expect(viewport.scrollTracking_).to.be.false;
    expect(viewer.sendMessage).to.not.have.been.called;

    // time 0: scroll to 34
    // raf for viewer.postScroll, delay 36 ticks till raf for throttledScroll_
    binding.getScrollTop = () => 34;
    viewport.scroll_();
    expect(viewport.scrollTracking_).to.be.true;
    viewport.scroll_();
    viewport.scroll_();
    expect(changeEvent).to.equal(null);
    expect(viewport.scrollTracking_).to.be.true;

    clock.tick(8);
    expect(changeEvent).to.equal(null);
    clock.tick(8);
    // time 16: scroll to 35
    // call viewer.postScroll, raf for viewer.postScroll
    expect(changeEvent).to.equal(null);
    expect(viewer.sendMessage).to.have.callCount(1);
    expect(viewer.sendMessage).to.have.been.calledWith('scroll',
        {scrollTop: 34}, true);
    binding.getScrollTop = () => 35;
    viewport.scroll_();

    clock.tick(16);
    // time 32: scroll to 35
    // call viewer.postScroll, raf for viewer.postScroll
    viewport.scroll_();
    expect(changeEvent).to.equal(null);
    expect(viewport.scrollTracking_).to.be.true;
    expect(viewer.sendMessage).to.have.callCount(2);

    // time 36:
    // raf for throttledScroll_

    clock.tick(16);
    // time 48: scroll to 35
    // call viewer.postScroll, call throttledScroll_
    // raf for viewer.postScroll
    // delay 36 ticks till raf for throttledScroll_
    expect(viewport.scrollTracking_).to.be.false;
    viewport.scroll_();
    expect(changeEvent).to.not.equal(null);
    expect(changeEvent.relayoutAll).to.equal(false);
    expect(changeEvent.velocity).to.be.closeTo(0.020833, 1e-4);
    expect(eventCount).to.equal(1);
    expect(viewport.scrollTracking_).to.be.true;
    expect(viewer.sendMessage).to.have.callCount(3);
    changeEvent = null;

    clock.tick(16);
    // time 64:
    // call viewer.postScroll
    expect(viewer.sendMessage).to.have.callCount(4);

    clock.tick(20);
    // time 84:
    // raf for throttledScroll_

    clock.tick(16);
    // time 100:
    // call throttledScroll_
    expect(changeEvent).to.not.equal(null);
    expect(changeEvent.relayoutAll).to.equal(false);
    expect(viewport.scrollTracking_).to.be.false;
    expect(changeEvent.velocity).to.be.equal(0);
    expect(eventCount).to.equal(2);
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
    bindingMock.verify();
  });

  it('should change scrollTop for animateScrollIntoView and respect ' +
    'padding', () => {
    const element = document.createElement('div');
    const bindingMock = sandbox.mock(binding);
    bindingMock.expects('getLayoutRect').withArgs(element)
        .returns({top: 111}).once();
    bindingMock.expects('setScrollTop').withArgs(111 - /* padding */ 19).once();
    const duration = 1000;
    const promise = viewport.animateScrollIntoView(element, 1000).then(() => {
      bindingMock.verify();
    });
    clock.tick(duration);
    runVsync();
    return promise;
  });

  it('should not change scrollTop for animateScrollIntoView', () => {
    const element = document.createElement('div');
    const bindingMock = sandbox.mock(binding);
    bindingMock.expects('getLayoutRect').withArgs(element)
        .returns({top: 111}).once();
    viewport.paddingTop_ = 0;
    sandbox.stub(viewport, 'getScrollTop').returns(111);
    bindingMock.expects('setScrollTop').withArgs(111).never();
    const duration = 1000;
    const promise = viewport.animateScrollIntoView(element, 1000).then(() => {
      bindingMock.verify();
    });
    clock.tick(duration);
    runVsync();
    return promise;
  });

  it('should send cached scroll pos to getLayoutRect', () => {
    const element = document.createElement('div');
    const bindingMock = sandbox.mock(binding);
    viewport.scrollTop_ = 111;
    viewport.scrollLeft_ = 222;
    bindingMock.expects('getLayoutRect').withArgs(element, 222, 111)
        .returns('sentinel').once();
    expect(viewport.getLayoutRect(element)).to.equal('sentinel');
  });

  it('should deletegate scrollWidth', () => {
    const bindingMock = sandbox.mock(binding);
    bindingMock.expects('getScrollWidth').withArgs().returns(111).once();
    expect(viewport.getScrollWidth()).to.equal(111);
  });

  it('should deletegate scrollHeight', () => {
    const bindingMock = sandbox.mock(binding);
    bindingMock.expects('getScrollHeight').withArgs().returns(117).once();
    expect(viewport.getScrollHeight()).to.equal(117);
  });

  it('should scroll to target position when the viewer sets scrollTop', () => {
    const bindingMock = sandbox.mock(binding);
    bindingMock.expects('setScrollTop').withArgs(117).once();
    viewerScrollDocHandler({scrollTop: 117});
    bindingMock.verify();
  });

  describes.realWin('top-level styles', {amp: 1}, env => {
    let win;
    let root;

    beforeEach(() => {
      win = env.win;
      ampdoc = new AmpDocSingle(win);
      root = win.document.documentElement;
      root.className = '';
    });

    it('should not set pan-y when not embedded', () => {
      viewer.isEmbedded = () => false;
      viewport = new Viewport(ampdoc, binding, viewer);
      expect(win.getComputedStyle(root)['touch-action']).to.equal('auto');
    });

    it('should set pan-y with experiment', () => {
      viewer.isEmbedded = () => true;
      viewport = new Viewport(ampdoc, binding, viewer);
      expect(win.getComputedStyle(root)['touch-action']).to.equal('pan-y');
    });
  });

  describe('for child window', () => {
    let viewport;
    let bindingMock;
    let iframe;
    let iframeWin;
    let ampdoc;

    beforeEach(() => {
      ampdoc = new AmpDocSingle(window);
      viewport = new Viewport(ampdoc, binding, viewer);
      bindingMock = sandbox.mock(binding);
      iframe = document.createElement('iframe');
      const html = '<div id="one"></div>';
      let promise;
      if ('srcdoc' in iframe) {
        iframe.srcdoc = html;
        promise = loadPromise(iframe);
        document.body.appendChild(iframe);
      } else {
        iframe.src = 'about:blank';
        document.body.appendChild(iframe);
        const childDoc = iframe.contentWindow.document;
        childDoc.open();
        childDoc.write(html);
        childDoc.close();
        promise = Promise.resolve();
      }
      return promise.then(() => {
        iframeWin = iframe.contentWindow;
        setParentWindow(iframeWin, window);
      });
    });

    afterEach(() => {
      if (iframe.parentElement) {
        iframe.parentElement.removeChild(iframe);
      }
      bindingMock.verify();
    });

    it('should calculate child window element rect via parent', () => {
      viewport.scrollLeft_ = 0;
      viewport.scrollTop_ = 0;
      const element = iframeWin.document.createElement('div');
      iframeWin.document.body.appendChild(element);
      bindingMock.expects('getLayoutRect')
          .withExactArgs(element, 0, 0)
          .returns({left: 20, top: 10}).once();
      bindingMock.expects('getLayoutRect')
          .withExactArgs(iframe, 0, 0)
          .returns({left: 211, top: 111}).once();

      const rect = viewport.getLayoutRect(element);
      expect(rect.left).to.equal(211 + 20);
      expect(rect.top).to.equal(111 + 10);
    });

    it('should offset child window element with parent scroll pos', () => {
      viewport.scrollLeft_ = 200;
      viewport.scrollTop_ = 100;
      const element = iframeWin.document.createElement('div');
      iframeWin.document.body.appendChild(element);
      bindingMock.expects('getLayoutRect')
          .withExactArgs(element, 0, 0)
          .returns({left: 20, top: 10}).once();
      bindingMock.expects('getLayoutRect')
          .withExactArgs(iframe, 200, 100)
          .returns({left: 211, top: 111}).once();

      const rect = viewport.getLayoutRect(element);
      expect(rect.left).to.equal(211 + 20);
      expect(rect.top).to.equal(111 + 10);
    });
  });
});


describe('Viewport META', () => {

  describe('parseViewportMeta', () => {
    it('should accept null or empty strings', () => {
      expect(parseViewportMeta(null)).to.be.empty;
    });
    it('should parse single key-value', () => {
      expect(parseViewportMeta('width=device-width')).to.deep.equal({
        'width': 'device-width',
      });
    });
    it('should parse two key-values', () => {
      expect(parseViewportMeta('width=device-width,minimum-scale=1')).to.deep
          .equal({
            'width': 'device-width',
            'minimum-scale': '1',
          });
    });
    it('should parse empty value', () => {
      expect(parseViewportMeta('width=device-width,minimal-ui')).to.deep.equal({
        'width': 'device-width',
        'minimal-ui': '',
      });
      expect(parseViewportMeta('minimal-ui,width=device-width')).to.deep.equal({
        'width': 'device-width',
        'minimal-ui': '',
      });
    });
    it('should return last dupe', () => {
      expect(parseViewportMeta('width=100,width=200')).to.deep.equal({
        'width': '200',
      });
    });
    it('should ignore extra delims', () => {
      expect(parseViewportMeta(',,,width=device-width,,,,minimum-scale=1,,,'))
          .to.deep.equal({
            'width': 'device-width',
            'minimum-scale': '1',
          });
    });
    it('should support semicolon', () => {
      expect(parseViewportMeta('width=device-width;minimum-scale=1'))
          .to.deep.equal({
            'width': 'device-width',
            'minimum-scale': '1',
          });
    });
    it('should support mix of comma and semicolon', () => {
      expect(parseViewportMeta('width=device-width,minimum-scale=1;test=3;'))
          .to.deep.equal({
            'width': 'device-width',
            'minimum-scale': '1',
            'test': '3',
          });
    });
    it('should ignore extra mix delims', () => {
      expect(parseViewportMeta(',,;;,width=device-width;;,minimum-scale=1,,;'))
          .to.deep.equal({
            'width': 'device-width',
            'minimum-scale': '1',
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
        'minimum-scale': '1',
      });
      expect(res == 'width=device-width,minimum-scale=1' ||
          res == 'minimum-scale=1,width=device-width')
          .to.be.true;
    });
    it('should stringify empty values', () => {
      const res = stringifyViewportMeta({
        'width': 'device-width',
        'minimal-ui': '',
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
            'minimum-scale': '1',
          });
    });
    it('should replace the existing value', () => {
      expect(parseViewportMeta(updateViewportMetaString(
          'width=device-width,minimum-scale=2', {'minimum-scale': '1'})))
          .to.deep.equal({
            'width': 'device-width',
            'minimum-scale': '1',
          });
    });
    it('should delete the existing value', () => {
      expect(parseViewportMeta(updateViewportMetaString(
          'width=device-width,minimum-scale=1', {'minimum-scale': undefined})))
          .to.deep.equal({
            'width': 'device-width',
          });
    });
    it('should ignore delete for a non-existing value', () => {
      expect(parseViewportMeta(updateViewportMetaString(
          'width=device-width', {'minimum-scale': undefined})))
          .to.deep.equal({
            'width': 'device-width',
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
    let windowApi;
    let ampdoc;
    let originalViewportMetaString, viewportMetaString;
    let viewportMeta;
    let viewportMetaSetter;

    beforeEach(() => {
      sandbox = sinon.sandbox.create();
      clock = sandbox.useFakeTimers();
      viewer = {
        isEmbedded: () => false,
        getParam: param => {
          if (param == 'paddingTop') {
            return 0;
          }
          return undefined;
        },
        onMessage: () => {},
        isVisible: () => true,
        onVisibilityChanged: () => {},
      };

      originalViewportMetaString = 'width=device-width,minimum-scale=1';
      viewportMetaString = originalViewportMetaString;
      viewportMeta = Object.create(null);
      viewportMetaSetter = sandbox.spy();
      Object.defineProperty(viewportMeta, 'content', {
        get: () => viewportMetaString,
        set: value => {
          viewportMetaSetter(value);
          viewportMetaString = value;
        },
      });
      windowApi = {
        document: {
          documentElement: {
            style: {},
            classList: {
              add: function() {},
            },
          },
          querySelector: selector => {
            if (selector == 'meta[name=viewport]') {
              return viewportMeta;
            }
            return undefined;
          },
        },
        navigator: window.navigator,
        setTimeout: window.setTimeout,
        clearTimeout: window.clearTimeout,
        location: {},
      };
      installTimerService(windowApi);
      installVsyncService(windowApi);
      installPlatformService(windowApi);
      installDocService(windowApi, /* isSingleDoc */ true);
      ampdoc = ampdocServiceFor(windowApi).getAmpDoc();
      installViewerServiceForDoc(ampdoc);
      binding = new ViewportBindingDef();
      viewport = new Viewport(ampdoc, binding, viewer);
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('should initialize original viewport meta', () => {
      viewport.getViewportMeta_();
      expect(viewport.originalViewportMetaString_).to.equal(viewportMetaString);
      expect(viewportMetaSetter).to.have.not.been.called;
    });

    it('should disable TouchZoom', () => {
      viewport.disableTouchZoom();
      expect(viewportMetaSetter).to.be.calledOnce;
      expect(viewportMetaString).to.have.string('maximum-scale=1');
      expect(viewportMetaString).to.have.string('user-scalable=no');
    });

    it('should ignore disable TouchZoom if already disabled', () => {
      viewportMetaString = 'width=device-width,minimum-scale=1,' +
          'maximum-scale=1,user-scalable=no';
      viewport.disableTouchZoom();
      expect(viewportMetaSetter).to.have.not.been.called;
    });

    it('should ignore disable TouchZoom if embedded', () => {
      windowApi.parent = {};
      viewport.disableTouchZoom();
      expect(viewportMetaSetter).to.have.not.been.called;
    });

    it('should restore TouchZoom', () => {
      viewport.disableTouchZoom();
      expect(viewportMetaSetter).to.be.calledOnce;
      expect(viewportMetaString).to.have.string('maximum-scale=1');
      expect(viewportMetaString).to.have.string('user-scalable=no');

      viewport.restoreOriginalTouchZoom();
      expect(viewportMetaSetter).to.have.callCount(2);
      expect(viewportMetaString).to.equal(originalViewportMetaString);
    });

    it('should reset TouchZoom; zooming state unknown', () => {
      viewport.resetTouchZoom();
      expect(viewportMetaSetter).to.be.calledOnce;
      expect(viewportMetaString).to.have.string('maximum-scale=1');
      expect(viewportMetaString).to.have.string('user-scalable=no');

      clock.tick(1000);
      expect(viewportMetaSetter).to.have.callCount(2);
      expect(viewportMetaString).to.equal(originalViewportMetaString);
    });

    it('should ignore reset TouchZoom if not currently zoomed', () => {
      windowApi.document.documentElement.clientHeight = 500;
      windowApi.innerHeight = 500;
      viewport.resetTouchZoom();
      expect(viewportMetaSetter).to.have.not.been.called;
    });

    it('should proceed with reset TouchZoom if currently zoomed', () => {
      windowApi.document.documentElement.clientHeight = 500;
      windowApi.innerHeight = 300;
      viewport.resetTouchZoom();
      expect(viewportMetaSetter).to.be.calledOnce;
    });

    it('should ignore reset TouchZoom if embedded', () => {
      windowApi.parent = {};
      viewport.resetTouchZoom();
      expect(viewportMetaSetter).to.have.not.been.called;
    });
  });
});


describes.realWin('ViewportBindingNatural', {ampCss: true}, env => {
  let binding;
  let win;
  let ampdoc;
  let viewer;

  beforeEach(() => {
    env.iframe.style.width = '100px';
    env.iframe.style.height = '200px';
    win = env.win;
    win.document.documentElement.classList.add('i-amphtml-singledoc');

    const child = win.document.createElement('div');
    child.style.width = '200px';
    child.style.height = '300px';
    win.document.body.appendChild(child);

    viewer = {};

    installPlatformService(win);
    installVsyncService(win);
    installDocService(win, /* isSingleDoc */ true);
    ampdoc = ampdocServiceFor(win).getAmpDoc();
    binding = new ViewportBindingNatural_(ampdoc, viewer);
    binding.connect();
  });

  it('should setup overflow:visible on body', () => {
    expect(win.getComputedStyle(win.document.body).overflow)
        .to.equal('visible');
  });

  it('should configure body as relative', () => {
    binding = new ViewportBindingNatural_(ampdoc, viewer);
    expect(win.document.body.style.display).to.not.be.ok;
    const bodyStyles = win.getComputedStyle(win.document.body);
    expect(bodyStyles.position).to.equal('relative');
    // It's important that this experiment does NOT override the previously
    // set `overflow`.
    expect(bodyStyles.overflow).to.equal('visible');
  });

  it('should override body overflow for iOS webview', () => {
    win.document.documentElement.classList.add('i-amphtml-webview');
    binding = new ViewportBindingNatural_(ampdoc, viewer);
    const bodyStyles = win.getComputedStyle(win.document.body);
    expect(bodyStyles.position).to.equal('relative');
    expect(bodyStyles.overflowX).to.equal('hidden');
    expect(bodyStyles.overflowY).to.not.equal('hidden');
  });

  it('should NOT require fixed layer transferring', () => {
    expect(binding.requiresFixedLayerTransfer()).to.be.false;
  });

  it('should connect events: subscribe to scroll and resize events', () => {
    expect(win.eventListeners.count('resize')).to.equal(1);
    expect(win.eventListeners.count('scroll')).to.equal(1);
  });

  it('should disconnect events', () => {
    // After disconnect, there are no more listeners on window.
    binding.disconnect();
    expect(win.eventListeners.count('resize')).to.equal(0);
    expect(win.eventListeners.count('scroll')).to.equal(0);
  });

  it('should update padding', () => {
    binding.updatePaddingTop(31);
    expect(win.document.documentElement.style.paddingTop).to.equal('31px');
  });

  it('should calculate size', () => {
    const size = binding.getSize();
    expect(size.width).to.equal(100);
    expect(size.height).to.equal(200);
  });

  it('should calculate scrollTop from scrollElement', () => {
    win.pageYOffset = 11;
    win.document.scrollingElement.scrollTop = 17;
    expect(binding.getScrollTop()).to.equal(17);
  });

  it('should calculate scrollWidth from scrollElement', () => {
    expect(binding.getScrollWidth()).to.equal(200);
  });

  it('should calculate scrollHeight from scrollElement', () => {
    expect(binding.getScrollHeight()).to.equal(300);
  });

  it('should update scrollTop on scrollElement', () => {
    win.pageYOffset = 11;
    win.document.scrollingElement.scrollTop = 17;
    binding.setScrollTop(21);
    expect(win.document.scrollingElement./*OK*/scrollTop).to.equal(21);
  });

  it('should fallback scrollTop to pageYOffset', () => {
    win.pageYOffset = 11;
    delete win.document.scrollingElement.scrollTop;
    expect(binding.getScrollTop()).to.equal(11);
  });

  it('should offset client rect for layout', () => {
    win.pageXOffset = 0;
    win.pageYOffset = 200;
    delete win.document.scrollingElement;
    const el = {
      getBoundingClientRect: () => {
        return {left: 11.5, top: 12.5, width: 13.5, height: 14.5};
      },
    };
    const rect = binding.getLayoutRect(el);
    expect(rect.left).to.equal(12);  // round(0 + 11.5)
    expect(rect.top).to.equal(213);  // round(200 + 12.5)
    expect(rect.width).to.equal(14);  // round(13.5)
    expect(rect.height).to.equal(15);  // round(14.5)
  });

  it('should offset client rect for layout and position passed in', () => {
    win.pageXOffset = 0;
    win.pageYOffset = 2000;
    delete win.document.scrollingElement;
    const el = {
      getBoundingClientRect: () => {
        return {left: 11.5, top: 12.5, width: 13.5, height: 14.5};
      },
    };
    const rect = binding.getLayoutRect(el, 100, 200);
    expect(rect.left).to.equal(112);  // round(100 + 11.5)
    expect(rect.top).to.equal(213);  // round(200 + 12.5)
    expect(rect.width).to.equal(14);  // round(13.5)
    expect(rect.height).to.equal(15);  // round(14.5)
  });


  it('should disable scroll temporarily and reset scroll', () => {
    let htmlCss = win.getComputedStyle(win.document.documentElement);
    expect(htmlCss.overflowX).to.equal('hidden');
    expect(htmlCss.overflowY).to.equal('auto');

    binding.disableScroll();

    expect(win.document.documentElement).to.have.class(
        'i-amphtml-scroll-disabled');
    htmlCss = win.getComputedStyle(win.document.documentElement);
    expect(htmlCss.overflowX).to.equal('hidden');
    expect(htmlCss.overflowY).to.equal('hidden');

    binding.resetScroll();

    expect(win.document.documentElement).to.not.have.class(
        'i-amphtml-scroll-disabled');
    htmlCss = win.getComputedStyle(win.document.documentElement);
    expect(htmlCss.overflowX).to.equal('hidden');
    expect(htmlCss.overflowY).to.equal('auto');
  });
});

describes.realWin('ViewportBindingNaturalIosEmbed', {ampCss: true}, env => {
  let binding;
  let win;

  beforeEach(() => {
    env.iframe.style.width = '100px';
    env.iframe.style.height = '200px';
    win = env.win;
    const child = win.document.createElement('div');
    child.id = 'child';
    child.style.width = '200px';
    child.style.height = '300px';
    win.document.body.appendChild(child);
    installDocService(win, /* isSingleDoc */ true);
    installVsyncService(win);
    const ampdoc = ampdocServiceFor(win).getAmpDoc();
    installPlatformService(win);
    installViewerServiceForDoc(ampdoc);

    win.document.documentElement.classList.add('i-amphtml-singledoc');
    binding = new ViewportBindingNaturalIosEmbed_(win, ampdoc);
    return Promise.resolve();
  });

  it('should require fixed layer transferring', () => {
    expect(binding.requiresFixedLayerTransfer()).to.be.true;
  });

  it('should subscribe to resize events on window, scroll on body', () => {
    expect(win.eventListeners.count('resize')).to.equal(1);
    expect(win.eventListeners.count('scroll')).to.equal(0);
    expect(win.document.body.eventListeners.count('scroll')).to.equal(1);
  });

  it('should setup document for embed scrolling', () => {
    const documentElement = win.document.documentElement;
    const body = win.document.body;
    expect(documentElement.style.overflowY).to.equal('auto');
    expect(documentElement.style.webkitOverflowScrolling).to.equal('touch');
    expect(win.getComputedStyle(documentElement).overflowY).to.equal('auto');

    // Assigned styles.
    expect(body.style.overflowX).to.equal('hidden');
    expect(body.style.overflowY).to.equal('auto');
    expect(body.style.webkitOverflowScrolling).to.equal('touch');
    expect(body.style.position).to.equal('absolute');
    expect(body.style.top).to.equal('0px');
    expect(body.style.left).to.equal('0px');
    expect(body.style.right).to.equal('0px');
    expect(body.style.bottom).to.equal('0px');

    // Resolved styles.
    const resolvedBodyStyle = win.getComputedStyle(body);
    expect(resolvedBodyStyle.overflowX).to.equal('hidden');
    expect(resolvedBodyStyle.overflowY).to.equal('auto');
    expect(resolvedBodyStyle.position).to.equal('absolute');
    expect(resolvedBodyStyle.top).to.equal('0px');
    expect(resolvedBodyStyle.left).to.equal('0px');
    expect(resolvedBodyStyle.right).to.equal('0px');
    expect(resolvedBodyStyle.bottom).to.equal('0px');

    const scrollpos = body.querySelector('#i-amphtml-scrollpos');
    expect(scrollpos).to.be.ok;
    expect(scrollpos.style.position).to.equal('absolute');
    expect(scrollpos.style.top).to.equal('0px');
    expect(scrollpos.style.left).to.equal('0px');
    expect(scrollpos.style.width).to.equal('0px');
    expect(scrollpos.style.height).to.equal('0px');
    expect(scrollpos.style.visibility).to.equal('hidden');

    const scrollmove = body.querySelector('#i-amphtml-scrollmove');
    expect(scrollmove).to.be.ok;
    expect(scrollmove.style.position).to.equal('absolute');
    expect(scrollmove.style.top).to.equal('0px');
    expect(scrollmove.style.left).to.equal('0px');
    expect(scrollmove.style.width).to.equal('0px');
    expect(scrollmove.style.height).to.equal('0px');
    expect(scrollmove.style.visibility).to.equal('hidden');

    const endpos = body.querySelector('#i-amphtml-endpos');
    expect(endpos).to.be.ok;
    expect(endpos.style.position).to.not.be.ok;
    expect(endpos.style.top).to.not.be.ok;
    expect(endpos.style.width).to.equal('0px');
    expect(endpos.style.height).to.equal('0px');
    expect(endpos.style.visibility).to.equal('hidden');
    expect(endpos.getBoundingClientRect().top).to.equal(300);
  });

  it('should always have scrollWidth equal window.innerWidth', () => {
    expect(binding.getScrollWidth()).to.equal(100);
  });

  it('should update border on BODY when updatePaddingTop', () => {
    binding.updatePaddingTop(31);
    expect(win.document.body.style.borderTop).to
        .equal('31px solid transparent');
    expect(win.document.body.style.paddingTop).to.not.be.ok;
  });

  it('should update border in lightbox mode when updateLightboxMode', () => {
    binding.updatePaddingTop(31);
    expect(win.document.body.style.borderTop).to
        .equal('31px solid transparent');
    expect(win.document.body.style.borderTopStyle).to.equal('solid');

    return binding.updateLightboxMode(true).then(() => {
      expect(win.document.body.style.borderTopStyle).to.equal('none');

      return binding.updateLightboxMode(false);
    }).then(() => {
      expect(win.document.body.style.borderTopStyle).to.equal('solid');
      expect(win.document.body.style.borderBottomStyle).to.not.equal('solid');
      expect(win.document.body.style.borderLeftStyle).to.not.equal('solid');
      expect(win.document.body.style.borderRightStyle).to.not.equal('solid');
    });
  });

  it('should calculate size', () => {
    const size = binding.getSize();
    expect(size.width).to.equal(100);
    expect(size.height).to.equal(200);
  });

  it('should calculate scrollTop from scrollpos element', () => {
    binding.setScrollTop(17);
    const scrollpos = win.document.body.querySelector('#i-amphtml-scrollpos');
    expect(scrollpos.getBoundingClientRect().top).to.equal(-17);
    binding.onScrolled_();
    expect(binding.getScrollTop()).to.equal(17);
  });

  it('should calculate scrollTop from scrollpos element with padding', () => {
    binding.setScrollTop(17);
    const scrollpos = win.document.body.querySelector('#i-amphtml-scrollpos');
    expect(scrollpos.getBoundingClientRect().top).to.equal(-17);
    binding.updatePaddingTop(10);
    binding.onScrolled_();
    // scrollTop = - BCR.top + paddingTop
    expect(binding.getScrollTop()).to.equal(27);
  });

  it('should calculate scrollHeight from scrollpos/endpos elements', () => {
    binding.setScrollTop(17);
    const scrollpos = win.document.body.querySelector('#i-amphtml-scrollpos');
    expect(scrollpos.getBoundingClientRect().top).to.equal(-17);
    const endpos = win.document.body.querySelector('#i-amphtml-endpos');
    expect(endpos.getBoundingClientRect().top).to.equal(283);  // 300 - 17
    expect(binding.getScrollHeight()).to.equal(300);  // 283 - (-17)
  });


  it('should offset client rect for layout', () => {
    binding.setScrollTop(100);
    const scrollpos = win.document.body.querySelector('#i-amphtml-scrollpos');
    expect(scrollpos.getBoundingClientRect().top).to.equal(-100);
    expect(scrollpos.getBoundingClientRect().left).to.equal(0);
    binding.onScrolled_();
    const el = {
      getBoundingClientRect: () => {
        return {left: 11.5, top: 12.5, width: 13.5, height: 14.5};
      },
    };
    const rect = binding.getLayoutRect(el);
    expect(rect.left).to.equal(12);  // round(0 + 11.5)
    expect(rect.top).to.equal(113);  // round(100 + 12.5)
    expect(rect.width).to.equal(14);  // round(13.5)
    expect(rect.height).to.equal(15);  // round(14.5)
  });

  it('should set scroll position via moving element', () => {
    binding.setScrollTop(10);
    const scrollmove = win.document.body.querySelector('#i-amphtml-scrollmove');
    expect(scrollmove.style.transform).to.equal('translateY(10px)');
  });

  it('should set scroll position via moving element with padding', () => {
    binding.updatePaddingTop(19);
    binding.setScrollTop(10);
    const scrollmove = win.document.body.querySelector('#i-amphtml-scrollmove');
    // transform = scrollTop - paddingTop
    expect(scrollmove.style.transform).to.equal('translateY(-9px)');
  });

  it('should adjust scroll position when scrolled to 0', () => {
    const scrollpos = win.document.body.querySelector('#i-amphtml-scrollpos');
    expect(scrollpos.getBoundingClientRect().top).to.equal(0);
    const scrollmove = win.document.body.querySelector('#i-amphtml-scrollmove');
    const event = {preventDefault: sandbox.spy()};
    binding.adjustScrollPos_(event);
    expect(scrollmove.style.transform).to.equal('translateY(1px)');
    expect(scrollpos.getBoundingClientRect().top).to.equal(-1);
    expect(event.preventDefault).to.be.calledOnce;
  });

  it('should adjust scroll position when scrolled to 0 w/padding', () => {
    binding.updatePaddingTop(10);
    const scrollpos = win.document.body.querySelector('#i-amphtml-scrollpos');
    expect(scrollpos.getBoundingClientRect().top).to.equal(10);
    const scrollmove = win.document.body.querySelector('#i-amphtml-scrollmove');
    const event = {preventDefault: sandbox.spy()};
    binding.adjustScrollPos_(event);
    // transform = 1 - updatePadding
    expect(scrollmove.style.transform).to.equal('translateY(-9px)');
    // scroll pos should not change
    expect(scrollpos.getBoundingClientRect().top).to.equal(10);
    expect(event.preventDefault).to.be.calledOnce;
  });

  it('should adjust scroll position when scrolled to 0; w/o event', () => {
    const scrollpos = win.document.body.querySelector('#i-amphtml-scrollpos');
    expect(scrollpos.getBoundingClientRect().top).to.equal(0);
    const scrollmove = win.document.body.querySelector('#i-amphtml-scrollmove');
    binding.adjustScrollPos_();
    expect(scrollmove.style.transform).to.equal('translateY(1px)');
    expect(scrollpos.getBoundingClientRect().top).to.equal(-1);
  });

  it('should NOT adjust scroll position when scrolled away from 0', () => {
    binding.setScrollTop(10);
    const scrollpos = win.document.body.querySelector('#i-amphtml-scrollpos');
    expect(scrollpos.getBoundingClientRect().top).to.equal(-10);
    const event = {preventDefault: sandbox.spy()};
    binding.adjustScrollPos_(event);
    expect(scrollpos.getBoundingClientRect().top).to.equal(-10);
    expect(event.preventDefault).to.have.not.been.called;
  });

  it('should NOT adjust scroll position when overscrolled', () => {
    binding.setScrollTop(310);
    const event = {preventDefault: sandbox.spy()};
    binding.adjustScrollPos_(event);
    expect(event.preventDefault).to.have.not.been.called;
  });
});


describes.realWin('ViewportBindingIosEmbedWrapper', {ampCss: true}, env => {
  let win;
  let binding;
  let child;

  beforeEach(() => {
    env.iframe.style.width = '100px';
    env.iframe.style.height = '100px';
    win = env.win;
    win.document.documentElement.className = 'top i-amphtml-singledoc';
    child = win.document.createElement('div');
    child.style.width = '200px';
    child.style.height = '300px';
    child.textContent = 'test';
    win.document.body.appendChild(child);
    binding = new ViewportBindingIosEmbedWrapper_(win);
    binding.connect();
  });

  it('should NOT require fixed layer transferring', () => {
    expect(binding.requiresFixedLayerTransfer()).to.be.true;
  });

  it('should start w/o overscroll and set it on doc ready', () => {
    const root = win.document.documentElement;
    expect(root).to.not.have.class('i-amphtml-ios-overscroll');
    expect(root.style.webkitOverflowScrolling).to.not.equal('touch');
    expect(binding.wrapper_.style.webkitOverflowScrolling).to.not
        .equal('touch');
    return whenDocumentReady(win.document).then(() => {
      expect(root).to.have.class('i-amphtml-ios-overscroll');
    });
  });

  it('should have UI setup', () => {
    expect(binding.setupDone_).to.be.true;
    expect(win.document.documentElement)
        .to.have.class('i-amphtml-ios-embed');
    expect(win.document.body).to.exist;
    expect(win.document.body.parentNode)
        .to.not.equal(win.document.documentElement);
    expect(win.document.body.parentNode)
        .to.equal(binding.wrapper_);
    expect(binding.wrapper_.parentNode)
        .to.equal(win.document.documentElement);
    expect(binding.wrapper_.tagName).to.equal('HTML');
    expect(binding.wrapper_.id).to.equal('i-amphtml-wrapper');
    expect(win.document.body.contains(child)).to.be.true;
    expect(binding.wrapper_.contains(child)).to.be.true;
    expect(win.document.contains(child)).to.be.true;
    expect(child.textContent).to.equal('test');

    // Top-level classes moved to the wrapper element.
    expect(win.document.documentElement).to.not.have.class('top');
    expect(binding.wrapper_).to.have.class('top');
  });

  it('should have CSS setup', () => {
    win.document.body.style.display = 'table';
    const htmlCss = win.getComputedStyle(win.document.documentElement);
    const wrapperCss = win.getComputedStyle(binding.wrapper_);
    const bodyCss = win.getComputedStyle(win.document.body);

    // `<html>` must have `position: static` or layout is broken.
    expect(htmlCss.position).to.equal('static');

    // `<html>` and `<i-amphtml-wrapper>` must be scrollable, but not `body`.
    // Unfortunately, we can't test here `-webkit-overflow-scrolling`.
    expect(htmlCss.overflowY).to.equal('auto');
    expect(htmlCss.overflowX).to.equal('hidden');
    expect(wrapperCss.overflowY).to.equal('auto');
    expect(wrapperCss.overflowX).to.equal('hidden');
    expect(bodyCss.overflowY).to.equal('visible');
    expect(bodyCss.overflowX).to.equal('visible');

    // Wrapper must be a block and positioned absolute at 0/0/0/0.
    expect(wrapperCss.display).to.equal('block');
    expect(wrapperCss.position).to.equal('absolute');
    expect(wrapperCss.top).to.equal('0px');
    expect(wrapperCss.left).to.equal('0px');
    expect(wrapperCss.right).to.equal('0px');
    expect(wrapperCss.bottom).to.equal('0px');
    expect(wrapperCss.margin).to.equal('0px');

    // `body` must have `relative` positioning and `block` display.
    expect(bodyCss.position).to.equal('relative');
    // Preserve the customized `display` value.
    expect(bodyCss.display).to.equal('table');

    // `body` must have a 1px transparent border for two purposes:
    // (1) to cancel out margin collapse in body's children;
    // (2) to offset scroll adjustment to 1 to avoid scroll freeze problem.
    expect(bodyCss.borderTop.replace('rgba(0, 0, 0, 0)', 'transparent'))
        .to.equal('1px solid transparent');
    expect(bodyCss.margin).to.equal('0px');
  });

  it('should be immediately scrolled to 1 to avoid freeze', () => {
    expect(binding.wrapper_.scrollTop).to.equal(1);
  });

  it('should connect events: subscribe to scroll and resize events', () => {
    expect(win.eventListeners.count('resize')).to.equal(1);
    // Note that scroll event is on the wrapper, and NOT on root or body.
    expect(win.eventListeners.count('scroll')).to.equal(0);
    expect(win.document.eventListeners.count('scroll')).to.equal(0);
    expect(win.document.documentElement.eventListeners.count('scroll'))
        .to.equal(0);
    expect(win.document.body.eventListeners.count('scroll'))
        .to.equal(0);
  });

  it('should disconnect events', () => {
    // After disconnect, there are no more listeners on window.
    binding.disconnect();
    expect(win.eventListeners.count('resize')).to.equal(0);
  });

  it('should update padding', () => {
    binding.updatePaddingTop(31);
    expect(binding.wrapper_.style.paddingTop).to.equal('31px');
    // Notice, root is not touched.
    expect(win.document.documentElement.style.paddingTop).to.equal('');
  });

  it('should calculate size', () => {
    const size = binding.getSize();
    expect(size.width).to.equal(100);
    expect(size.height).to.equal(100);
  });

  it('should calculate scrollTop from wrapper', () => {
    binding.wrapper_.scrollTop = 17;
    expect(binding.getScrollTop()).to.equal(17);
  });

  it('should calculate scrollWidth from wrapper', () => {
    expect(binding.getScrollWidth()).to.equal(200);
  });

  it('should calculate scrollHeight from wrapper', () => {
    expect(binding.getScrollHeight()).to.equal(301); // +1px for border-top.
  });

  it('should update scrollTop on wrapper', () => {
    binding.setScrollTop(21);
    expect(binding.wrapper_.scrollTop).to.equal(21);
  });

  it('should adjust scrollTop to avoid scroll freeze', () => {
    binding.setScrollTop(21);
    expect(binding.wrapper_.scrollTop).to.equal(21);

    // `scrollTop=0` is normally not allowed.
    binding.setScrollTop(0);
    expect(binding.wrapper_.scrollTop).to.equal(1);
  });

  it('should offset client rect for layout', () => {
    binding.wrapper_.scrollTop = 200;
    const el = {
      getBoundingClientRect: () => {
        return {left: 11.5, top: 12.5, width: 13.5, height: 14.5};
      },
    };
    const rect = binding.getLayoutRect(el);
    expect(rect.top).to.equal(213);  // round(200 + 12.5)
    expect(rect.width).to.equal(14);  // round(13.5)
    expect(rect.height).to.equal(15);  // round(14.5)
  });

  it('should offset client rect for layout and position passed in', () => {
    binding.wrapper_.scrollTop = 10;
    const el = {
      getBoundingClientRect: () => {
        return {left: 11.5, top: 12.5, width: 13.5, height: 14.5};
      },
    };
    const rect = binding.getLayoutRect(el, 100, 200);
    expect(rect.left).to.equal(112);  // round(100 + 11.5)
    expect(rect.top).to.equal(213);  // round(200 + 12.5)
    expect(rect.width).to.equal(14);  // round(13.5)
    expect(rect.height).to.equal(15);  // round(14.5)
  });

  it('should call scroll event', () => {
    return new Promise(resolve => {
      binding.onScroll(resolve);
      binding.wrapper_.scrollTop = 11;
    }).then(() => {
      expect(binding.getScrollTop()).to.equal(11);
    });
  });

  it('should disable scroll temporarily and reset scroll', () => {
    let wrapperCss = win.getComputedStyle(binding.wrapper_);
    expect(wrapperCss.overflowX).to.equal('hidden');
    expect(wrapperCss.overflowY).to.equal('auto');

    binding.disableScroll();

    expect(binding.wrapper_).to.have.class('i-amphtml-scroll-disabled');
    wrapperCss = win.getComputedStyle(binding.wrapper_);
    expect(wrapperCss.overflowX).to.equal('hidden');
    expect(wrapperCss.overflowY).to.equal('hidden');

    binding.resetScroll();

    expect(binding.wrapper_).to.not.have.class(
        'i-amphtml-scroll-disabled');
    wrapperCss = win.getComputedStyle(binding.wrapper_);
    expect(wrapperCss.overflowX).to.equal('hidden');
    expect(wrapperCss.overflowY).to.equal('auto');
  });
});

describe('createViewport', () => {

  describes.fakeWin('in Android', {
    win: {navigator: {userAgent: 'Android'}},
  }, env => {
    let win;

    beforeEach(() => {
      win = env.win;
      installPlatformService(win);
      installTimerService(win);
      installVsyncService(win);
    });

    it('should bind to "natural" when not iframed', () => {
      win.parent = win;
      installDocService(win, /* isSingleDoc */ true);
      const ampDoc = ampdocServiceFor(win).getAmpDoc();
      installViewerServiceForDoc(ampDoc);
      installViewportServiceForDoc(ampDoc);
      const viewport = viewportForDoc(ampDoc);
      expect(viewport.binding_).to.be.instanceof(ViewportBindingNatural_);
    });

    it('should bind to "naturual" when iframed', () => {
      win.parent = {};
      installDocService(win, /* isSingleDoc */ true);
      const ampDoc = ampdocServiceFor(win).getAmpDoc();
      installViewerServiceForDoc(ampDoc);
      installViewportServiceForDoc(ampDoc);
      const viewport = viewportForDoc(ampDoc);
      expect(viewport.binding_).to.be.instanceof(ViewportBindingNatural_);
    });
  });

  describes.fakeWin('in iOS', {
    win: {navigator: {userAgent: 'iPhone'}},
  }, env => {
    let win;
    let ampDoc;
    let viewer;

    beforeEach(() => {
      win = env.win;
      installPlatformService(win);
      installTimerService(win);
      installVsyncService(win);
      installDocService(win, /* isSingleDoc */ true);
      ampDoc = ampdocServiceFor(win).getAmpDoc();
      installViewerServiceForDoc(ampDoc);
      viewer = viewerForDoc(ampDoc);
    });

    it('should bind to "natural" when not iframed', () => {
      win.parent = win;
      installViewportServiceForDoc(ampDoc);
      const viewport = viewportForDoc(ampDoc);
      expect(viewport.binding_).to.be.instanceof(ViewportBindingNatural_);
    });

    it('should bind to "iOS embed" when iframed', () => {
      win.parent = {};
      sandbox.stub(viewer, 'isEmbedded', () => true);
      installViewportServiceForDoc(ampDoc);
      const viewport = viewportForDoc(ampDoc);
      expect(viewport.binding_).to
          .be.instanceof(ViewportBindingNaturalIosEmbed_);
    });

    it('should NOT bind to "iOS embed" when iframed but not embedded', () => {
      win.parent = {};
      sandbox.stub(viewer, 'isEmbedded', () => false);
      installViewportServiceForDoc(ampDoc);
      const viewport = viewportForDoc(ampDoc);
      expect(viewport.binding_).to
          .be.instanceof(ViewportBindingNatural_);
    });

    it('should bind to "iOS embed" when not iframed but in dev mode', () => {
      getMode(win).development = true;
      sandbox.stub(viewer, 'isEmbedded', () => false);
      installViewportServiceForDoc(ampDoc);
      const viewport = viewportForDoc(ampDoc);
      expect(viewport.binding_).to
          .be.instanceof(ViewportBindingNaturalIosEmbed_);
    });

    it('should bind to "iOS embed" when iframed but in test mode', () => {
      win.parent = {};
      getMode(win).test = true;
      sandbox.stub(viewer, 'isEmbedded', () => false);
      installViewportServiceForDoc(ampDoc);
      const viewport = viewportForDoc(ampDoc);
      expect(viewport.binding_).to
          .be.instanceof(ViewportBindingNaturalIosEmbed_);
    });

    it('should NOT bind to "iOS embed" when in dev mode, but iframed', () => {
      win.parent = {};
      getMode(win).development = true;
      sandbox.stub(viewer, 'isEmbedded', () => false);
      installViewportServiceForDoc(ampDoc);
      const viewport = viewportForDoc(ampDoc);
      expect(viewport.binding_).to
          .be.instanceof(ViewportBindingNatural_);
    });
  });
});
