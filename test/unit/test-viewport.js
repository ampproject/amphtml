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
import {Services} from '../../src/services';
import {
  Viewport,
  installViewportServiceForDoc,
  parseViewportMeta,
  stringifyViewportMeta,
  updateViewportMetaString,
} from '../../src/service/viewport/viewport-impl';
import {ViewportBindingDef} from '../../src/service/viewport/viewport-binding-def';
import {ViewportBindingIosEmbedShadowRoot_} from '../../src/service/viewport/viewport-binding-ios-embed-sd';
import {ViewportBindingIosEmbedWrapper_} from '../../src/service/viewport/viewport-binding-ios-embed-wrapper';

import {ViewportBindingNatural_} from '../../src/service/viewport/viewport-binding-natural';
import {dev} from '../../src/log';
import {getMode} from '../../src/mode';
import {installGlobalDocumentStateService} from '../../src/service/document-state';
import {installPlatformService} from '../../src/service/platform-impl';
import {installTimerService} from '../../src/service/timer-impl';
import {installViewerServiceForDoc} from '../../src/service/viewer-impl';
import {installVsyncService} from '../../src/service/vsync-impl';
import {layoutRectLtwh} from '../../src/layout-rect';
import {loadPromise} from '../../src/event-helper';
import {setParentWindow} from '../../src/service';
import {toggleExperiment} from '../../src/experiments';

const NOOP = () => {};

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
  let viewerDisableScrollHandler;
  let updatedPaddingTop;
  let viewportSize;
  let vsyncTasks;

  beforeEach(() => {
    clock = sandbox.useFakeTimers();

    windowApi = env.win;
    windowApi.requestAnimationFrame = fn => window.setTimeout(fn, 16);
    windowApi.scrollY = windowApi.pageYOffset = 17;

    viewerViewportHandler = undefined;
    viewerScrollDocHandler = undefined;
    viewerDisableScrollHandler = undefined;
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
        } else if (eventType == 'disableScroll') {
          viewerDisableScrollHandler = handler;
        }
      },
      sendMessage: sandbox.spy(),
      getVisibilityState: () => visibilityState,
      isVisible: () => visibilityState == 'visible',
      onVisibilityChanged: () => {},
    };
    viewerMock = sandbox.mock(viewer);
    installTimerService(windowApi);
    installVsyncService(windowApi);
    installPlatformService(windowApi);
    installDocService(windowApi, /* isSingleDoc */ true);
    installGlobalDocumentStateService(windowApi);
    ampdoc = Services.ampdocServiceFor(windowApi).getAmpDoc();
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
    binding.updatePaddingTop = paddingTop => (updatedPaddingTop = paddingTop);
    viewport = new Viewport(ampdoc, binding, viewer);
    viewport.fixedLayer_ = {
      enterLightbox: () => {},
      leaveLightbox: () => {},
      update: () => {
        return {then: callback => callback()};
      },
      updatePaddingTop: () => {},
    };
    viewport.getSize();

    // Use window since Animation by default will use window.
    const vsync = Services.vsyncFor(window);
    vsyncTasks = [];
    sandbox.stub(vsync, 'canAnimate').returns(true);
    sandbox
      .stub(vsync, 'createAnimTask')
      .callsFake((unusedContextNode, task) => {
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

  function stubVsyncMeasure() {
    sandbox
      .stub(viewport.vsync_, 'measurePromise')
      .callsFake(cb => Promise.resolve(cb()));
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
      sandbox.stub(ampdoc, 'isSingleDoc').callsFake(() => false);
      new Viewport(ampdoc, binding, viewer);
      expect(root).to.not.have.class('i-amphtml-singledoc');
    });

    it('should set standalone class', () => {
      new Viewport(ampdoc, binding, viewer);
      expect(root).to.have.class('i-amphtml-standalone');
      expect(root).to.not.have.class('i-amphtml-embedded');
    });

    it('should set embedded class', () => {
      sandbox.stub(viewer, 'isEmbedded').callsFake(() => true);
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

    describe('experiments', () => {
      afterEach(() => {
        toggleExperiment(windowApi, 'inabox-remove-height-auto', false);
      });

      it(
        'should set ' +
          '.i-amphtml-inabox-preserve-height-auto ' +
          'without an experiment',
        () => {
          ampdoc.win.parent = {};
          new Viewport(ampdoc, binding, viewer);
          expect(root).to.have.class('i-amphtml-inabox-preserve-height-auto');
        }
      );

      it(
        'should NOT set ' +
          '.i-amphtml-inabox-preserve-height-auto ' +
          'with the experiment',
        () => {
          toggleExperiment(windowApi, 'inabox-remove-height-auto', true);
          ampdoc.win.parent = {};
          new Viewport(ampdoc, binding, viewer);
          expect(root).to.not.have.class(
            'i-amphtml-inabox-preserve-height-auto'
          );
        }
      );
    });

    describe('ios-webview', () => {
      let webviewParam;
      let isIos;

      beforeEach(() => {
        webviewParam = '1';
        sandbox.stub(viewer, 'getParam').callsFake(param => {
          if (param == 'webview') {
            return webviewParam;
          }
          return null;
        });
        const platform = Services.platformFor(ampdoc.win);
        isIos = true;
        sandbox.stub(platform, 'isIos').callsFake(() => isIos);
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
      sandbox.stub(Math, 'random').callsFake(() => randomValue);
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
        'Viewport',
        'viewport has zero dimensions'
      );
    });

    it('should report zero height', () => {
      binding.getSize = () => {
        return {width: viewportSize.width, height: 0};
      };
      expect(viewport.getSize().width).to.equal(111);
      expect(viewport.getSize().height).to.equal(0);
      expect(errorStub).to.be.calledOnce;
      expect(errorStub).to.be.calledWith(
        'Viewport',
        'viewport has zero dimensions'
      );
    });

    it('should report both zero width and height', () => {
      binding.getSize = () => {
        return {width: 0, height: 0};
      };
      expect(viewport.getSize().width).to.equal(0);
      expect(viewport.getSize().height).to.equal(0);
      expect(errorStub).to.be.calledOnce;
      expect(errorStub).to.be.calledWith(
        'Viewport',
        'viewport has zero dimensions'
      );
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
        'Viewport',
        'viewport has zero dimensions'
      );
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
    viewer.onVisibilityChanged = handler => (onVisibilityHandler = handler);
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
    viewer.onVisibilityChanged = handler => (onVisibilityHandler = handler);
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
    const fixedPromise = new Promise(resolve => (fixedResolver = resolve));
    viewport.fixedLayer_ = {update: () => fixedPromise};
    viewportSize.width = 112;
    viewport.resize_();
    expect(changeEvent).to.be.null;
    fixedResolver();
    return fixedPromise.then(() => {
      expect(changeEvent).to.not.be.null;
    });
  });

  it('should dispatch onResize on width resize', () => {
    let resizeEvent = null;
    viewport.onResize(event => {
      resizeEvent = event;
    });
    viewportSize.width = 112;
    viewport.resize_();
    expect(resizeEvent).to.not.equal(null);
    expect(resizeEvent.height).to.equal(viewportSize.height);
    expect(resizeEvent.width).to.equal(viewportSize.width);
    // Width changed, relayoutAll should be true
    expect(resizeEvent.relayoutAll).to.be.true;
  });

  it('should dispatch onResize on height resize', () => {
    let resizeEvent = null;
    viewport.onResize(event => {
      resizeEvent = event;
    });
    viewportSize.height = 223;
    viewport.resize_();
    expect(resizeEvent).to.not.equal(null);
    expect(resizeEvent.height).to.equal(viewportSize.height);
    expect(resizeEvent.width).to.equal(viewportSize.width);
    // Only height changed, relayoutAll should be false
    expect(resizeEvent.relayoutAll).to.be.false;
  });

  it('should not dispatch onResize if size does not actually change', () => {
    let resizeEvent = null;
    viewport.onResize(event => {
      resizeEvent = event;
    });
    viewport.size_ = {width: 200, height: 200};
    viewportSize.width = 200;
    viewportSize.height = 200;
    viewport.resize_();
    expect(resizeEvent).to.equal(null);
  });

  it('should not do anything if padding is not changed', () => {
    const bindingMock = sandbox.mock(binding);
    viewerViewportHandler({paddingTop: 19});
    bindingMock.verify();
  });

  it('should update non-transient padding', () => {
    const bindingMock = sandbox.mock(binding);
    const fixedLayerMock = sandbox.mock(viewport.fixedLayer_);
    fixedLayerMock
      .expects('updatePaddingTop')
      .withExactArgs(/* paddingTop */ 0, /* transient */ undefined)
      .once();
    viewerViewportHandler({paddingTop: 0});
    bindingMock.verify();
    fixedLayerMock.verify();
  });

  it('should update padding when viewer wants to hide header', () => {
    const bindingMock = sandbox.mock(binding);
    const fixedLayerMock = sandbox.mock(viewport.fixedLayer_);
    fixedLayerMock
      .expects('updatePaddingTop')
      .withExactArgs(/* paddingTop */ 0, /* transient */ true)
      .once();
    bindingMock
      .expects('hideViewerHeader')
      .withArgs(true, 19)
      .once();
    viewerViewportHandler({
      paddingTop: 0,
      duation: 300,
      curve: 'ease-in',
      transient: true,
    });
    bindingMock.verify();
    fixedLayerMock.verify();
  });

  it(
    'should update padding for fixed layer when viewer wants to ' +
      'hide header',
    () => {
      viewport.fixedLayer_ = {updatePaddingTop: () => {}};
      const fixedLayerMock = sandbox.mock(viewport.fixedLayer_);
      fixedLayerMock
        .expects('updatePaddingTop')
        .withArgs(0)
        .once();
      viewerViewportHandler({
        paddingTop: 0,
        duation: 300,
        curve: 'ease-in',
        transient: 'true',
      });
      fixedLayerMock.verify();
    }
  );

  it('should update viewport when entering lightbox mode', () => {
    const requestingEl = document.createElement('div');

    viewport.vsync_ = {mutate: callback => callback()};
    sandbox.stub(viewport, 'enterOverlayMode');
    sandbox.stub(viewport, 'maybeEnterFieLightboxMode').callsFake(NOOP);
    sandbox.stub(viewport.fixedLayer_, 'enterLightbox');
    const bindingMock = sandbox.mock(binding);
    bindingMock
      .expects('updateLightboxMode')
      .withArgs(true)
      .once();

    viewport.enterLightboxMode(requestingEl);

    bindingMock.verify();
    expect(viewport.enterOverlayMode).to.be.calledOnce;
    expect(viewport.maybeEnterFieLightboxMode).to.be.calledOnce;
    expect(viewport.fixedLayer_.enterLightbox).to.be.calledOnce;

    expect(viewer.sendMessage).to.have.been.calledOnce;
    expect(viewer.sendMessage).to.have.been.calledWith(
      'requestFullOverlay',
      {},
      true
    );
  });

  it('should update viewport when leaving lightbox mode', () => {
    const requestingEl = document.createElement('div');

    viewport.vsync_ = {mutate: callback => callback()};
    sandbox.stub(viewport, 'leaveOverlayMode');
    sandbox.stub(viewport, 'maybeLeaveFieLightboxMode').callsFake(NOOP);
    sandbox.stub(viewport.fixedLayer_, 'leaveLightbox');
    const bindingMock = sandbox.mock(binding);
    bindingMock
      .expects('updateLightboxMode')
      .withArgs(false)
      .once();

    viewport.leaveLightboxMode(requestingEl);

    bindingMock.verify();
    expect(viewport.leaveOverlayMode).to.be.calledOnce;
    expect(viewport.maybeLeaveFieLightboxMode).to.be.calledOnce;
    expect(viewport.fixedLayer_.leaveLightbox).to.be.calledOnce;

    expect(viewer.sendMessage).to.have.been.calledOnce;
    expect(viewer.sendMessage).to.have.been.calledWith(
      'cancelFullOverlay',
      {},
      true
    );
  });

  it('should enter full overlay on FIE when entering lightbox mode', () => {
    const requestingElement = {};
    const fieMock = {
      enterFullOverlayMode: sandbox.spy(),
    };

    sandbox.stub(viewport, 'isLightboxExperimentOn').callsFake(() => true);

    sandbox.stub(viewport, 'getFriendlyIframeEmbed_').callsFake(el => {
      expect(el).to.equal(requestingElement);
      return fieMock;
    });

    viewport.maybeEnterFieLightboxMode(requestingElement);

    expect(fieMock.enterFullOverlayMode).to.be.calledOnce;
  });

  it('should leave full overlay on FIE when leaving lightbox mode', () => {
    const requestingElement = {};
    const fieMock = {
      leaveFullOverlayMode: sandbox.spy(),
    };

    sandbox.stub(viewport, 'getFriendlyIframeEmbed_').callsFake(el => {
      expect(el).to.equal(requestingElement);
      return fieMock;
    });

    viewport.maybeLeaveFieLightboxMode(requestingElement);

    expect(fieMock.leaveFullOverlayMode).to.be.calledOnce;
  });

  it('should update viewport when entering overlay mode', () => {
    const disableTouchZoomStub = sandbox.stub(viewport, 'disableTouchZoom');
    const disableScrollStub = sandbox.stub(viewport, 'disableScroll');

    viewport.enterOverlayMode();

    expect(disableTouchZoomStub).to.be.calledOnce;
    expect(disableScrollStub).to.be.calledOnce;
  });

  it('should update viewport when leaving overlay mode', () => {
    const restoreOriginalTouchZoomStub = sandbox.stub(
      viewport,
      'restoreOriginalTouchZoom'
    );
    const resetScrollStub = sandbox.stub(viewport, 'resetScroll');

    viewport.leaveOverlayMode();

    expect(restoreOriginalTouchZoomStub).to.be.calledOnce;
    expect(resetScrollStub).to.be.calledOnce;
  });

  it('should disable scrolling based on requests', () => {
    const disableScrollStub = sandbox.stub(viewport, 'disableScroll');

    viewerDisableScrollHandler(true);

    expect(disableScrollStub).to.be.calledOnce;
  });

  it('should reset scrolling based on requests', () => {
    const resetScrollStub = sandbox.stub(viewport, 'resetScroll');

    viewerDisableScrollHandler(false);

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
    expect(viewer.sendMessage.lastCall.args[0]).to.equal('scroll');
    expect(viewer.sendMessage.lastCall.args[1].scrollTop).to.equal(30);
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
    expect(viewer.sendMessage.lastCall.args[0]).to.equal('scroll');
    expect(viewer.sendMessage.lastCall.args[1].scrollTop).to.equal(34);
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
    bindingMock
      .expects('setScrollTop')
      .withArgs(117)
      .once();
    viewport.setScrollTop(117);
    expect(viewport./*OK*/ scrollTop_).to.be.null;
  });

  it('scrolls with scrollIntoView respecting padding', function*() {
    const element = document.createElement('div');

    // scrollIntoView traverses up the DOM tree, so it needs the node to
    // be attached.
    document.body.appendChild(element);

    const bindingMock = sandbox.mock(binding);

    bindingMock
      .expects('getScrollingElement')
      .returns(document.body)
      .atLeast(1);

    const top = 111;

    bindingMock
      .expects('getLayoutRect')
      .withArgs(element)
      .returns({top})
      .once();

    bindingMock
      .expects('setScrollTop')
      .withArgs(top - /* padding */ 19)
      .once();

    stubVsyncMeasure();

    yield viewport.scrollIntoView(element);

    bindingMock.verify();
  });

  it('scrolls with animateScrollIntoView respecting padding', async () => {
    const element = document.createElement('div');

    // animateScrollIntoView traverses up the DOM tree, so it needs the node to
    // be attached.
    document.body.appendChild(element);

    const bindingMock = sandbox.mock(binding);

    bindingMock
      .expects('getScrollingElement')
      .returns(document.body)
      .atLeast(1);

    const top = 111;

    bindingMock
      .expects('getLayoutRect')
      .withArgs(element)
      .returns({top})
      .once();

    const interpolateScrollIntoView = sandbox.stub(
      viewport,
      'interpolateScrollIntoView_'
    );

    stubVsyncMeasure();

    const duration = 1000;
    const pos = 'top';
    const promise = viewport.animateScrollIntoView(element, pos, duration);

    clock.tick(duration);

    runVsync();

    await promise;

    bindingMock.verify();

    expect(
      interpolateScrollIntoView.withArgs(
        /* parent       */ sinon.match.any,
        /* curScrollTop */ sinon.match.any,
        /* newScrollTop */ top - /* padding */ 19,
        /* duration     */ sinon.match.any,
        /* curve        */ sinon.match.any
      )
    ).to.be.calledOnce;
  });

  it('should not change scrollTop for animateScrollIntoView', () => {
    const element = document.createElement('div');
    const bindingMock = sandbox.mock(binding);
    bindingMock
      .expects('getLayoutRect')
      .withArgs(element)
      .returns({top: 111})
      .once();
    viewport.paddingTop_ = 0;
    sandbox.stub(viewport, 'getScrollTop').returns(111);
    bindingMock
      .expects('setScrollTop')
      .withArgs(111)
      .never();
    const duration = 1000;
    const pos = 'top';
    const promise = viewport.animateScrollIntoView(element, pos, 1000);
    promise.then(() => {
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
    bindingMock
      .expects('getLayoutRect')
      .withArgs(element, 222, 111)
      .returns('sentinel')
      .once();
    expect(viewport.getLayoutRect(element)).to.equal('sentinel');
  });

  it('should calculate client rect w/o global client rect', () => {
    const bindingMock = sandbox.mock(binding);
    bindingMock
      .expects('getRootClientRectAsync')
      .returns(Promise.resolve(null));
    const el = document.createElement('div');
    el.getBoundingClientRect = () => layoutRectLtwh(1, 2, 3, 4);
    stubVsyncMeasure();
    return viewport.getClientRectAsync(el).then(res => {
      expect(res).to.deep.equal(layoutRectLtwh(1, 2, 3, 4));
    });
  });

  it('should calculate client rect w/ global client rect when ', () => {
    const bindingMock = sandbox.mock(binding);
    bindingMock
      .expects('getRootClientRectAsync')
      .returns(Promise.resolve(layoutRectLtwh(5, 5, 5, 5)))
      .twice();
    const el = document.createElement('div');
    el.getBoundingClientRect = () => layoutRectLtwh(1, 2, 3, 4);
    stubVsyncMeasure();
    return viewport.getClientRectAsync(el).then(res => {
      expect(res).to.deep.equal(layoutRectLtwh(6, 7, 3, 4));
    });
  });

  it('should deletegate scrollWidth', () => {
    const bindingMock = sandbox.mock(binding);
    bindingMock
      .expects('getScrollWidth')
      .withArgs()
      .returns(111)
      .once();
    expect(viewport.getScrollWidth()).to.equal(111);
  });

  it('should deletegate scrollHeight', () => {
    const bindingMock = sandbox.mock(binding);
    bindingMock
      .expects('getScrollHeight')
      .withArgs()
      .returns(117)
      .once();
    expect(viewport.getScrollHeight()).to.equal(117);
  });

  it('should delegate contentHeight', () => {
    const bindingMock = sandbox.mock(binding);
    bindingMock
      .expects('getContentHeight')
      .withArgs()
      .returns(117)
      .once();
    expect(viewport.getContentHeight()).to.equal(117);
    bindingMock.verify();
  });

  it('should delegate contentHeightChanged', () => {
    const bindingMock = sandbox.mock(binding);
    bindingMock.expects('contentHeightChanged').once();
    viewport.contentHeightChanged();
    bindingMock.verify();
  });

  it('should scroll to target position when the viewer sets scrollTop', () => {
    const bindingMock = sandbox.mock(binding);
    bindingMock
      .expects('setScrollTop')
      .withArgs(117)
      .once();
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

    // TODO(zhouyx, #11827): Make this test work on Safari.
    it.configure()
      .skipSafari()
      .run('should not set pan-y when not embedded', () => {
        viewer.isEmbedded = () => false;
        viewport = new Viewport(ampdoc, binding, viewer);
        expect(win.getComputedStyle(root)['touch-action']).to.equal('auto');
      });

    // TODO(zhouyx, #11827): Make this test work on Safari.
    it.configure()
      .skipSafari()
      .run('should set pan-y with experiment', () => {
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
      bindingMock
        .expects('getLayoutRect')
        .withExactArgs(element, 0, 0)
        .returns({left: 20, top: 10})
        .once();
      bindingMock
        .expects('getLayoutRect')
        .withExactArgs(iframe, 0, 0)
        .returns({left: 211, top: 111})
        .once();

      const rect = viewport.getLayoutRect(element);
      expect(rect.left).to.equal(211 + 20);
      expect(rect.top).to.equal(111 + 10);
    });

    it('should offset child window element with parent scroll pos', () => {
      viewport.scrollLeft_ = 200;
      viewport.scrollTop_ = 100;
      const element = iframeWin.document.createElement('div');
      iframeWin.document.body.appendChild(element);
      bindingMock
        .expects('getLayoutRect')
        .withExactArgs(element, 0, 0)
        .returns({left: 20, top: 10})
        .once();
      bindingMock
        .expects('getLayoutRect')
        .withExactArgs(iframe, 200, 100)
        .returns({left: 211, top: 111})
        .once();

      const rect = viewport.getLayoutRect(element);
      expect(rect.left).to.equal(211 + 20);
      expect(rect.top).to.equal(111 + 10);
    });
  });

  describe('overrideGlobalScrollTo', () => {
    const originalScrollTo = function() {};

    beforeEach(() => {
      windowApi.scrollTo = originalScrollTo;
    });

    it('should not override scrollTo/pageYOffset if not requested', () => {
      new Viewport(ampdoc, binding, viewer);
      expect(windowApi.scrollTo).to.equal(originalScrollTo);
      expect(windowApi.scrollY).to.equal(17);
      expect(windowApi.pageYOffset).to.equal(17);
    });

    it('should override scrollTo when requested', () => {
      sandbox.stub(binding, 'overrideGlobalScrollTo').callsFake(() => true);
      viewport = new Viewport(ampdoc, binding, viewer);
      const setScrollTopStub = sandbox.stub(viewport, 'setScrollTop');
      expect(windowApi.scrollTo).to.not.equal(originalScrollTo);
      windowApi.scrollTo(0, 11);
      expect(setScrollTopStub).to.be.calledOnce.calledWith(11);
    });

    it('should override scrollY/pageYOffset when requested', () => {
      sandbox.stub(binding, 'overrideGlobalScrollTo').callsFake(() => true);
      viewport = new Viewport(ampdoc, binding, viewer);
      const stub = sandbox.stub(viewport, 'getScrollTop').callsFake(() => 19);
      expect(windowApi.scrollY).to.equal(19);
      expect(windowApi.pageYOffset).to.equal(19);
      expect(stub).to.be.calledTwice;
    });

    it('should tolerate scrollTo override failures', () => {
      Object.defineProperty(windowApi, 'scrollTo', {
        value: originalScrollTo,
        writable: false,
        configurable: false,
      });
      sandbox.stub(binding, 'overrideGlobalScrollTo').callsFake(() => true);
      new Viewport(ampdoc, binding, viewer);
      expect(windowApi.scrollTo).to.equal(originalScrollTo);
    });

    it('should tolerate scrollY override failures', () => {
      Object.defineProperty(windowApi, 'scrollY', {
        value: 21,
        writable: false,
        configurable: false,
      });
      sandbox.stub(binding, 'overrideGlobalScrollTo').callsFake(() => true);
      new Viewport(ampdoc, binding, viewer);
      expect(windowApi.scrollY).to.equal(21);
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
      expect(
        parseViewportMeta('width=device-width,minimum-scale=1')
      ).to.deep.equal({
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
      expect(
        parseViewportMeta(',,,width=device-width,,,,minimum-scale=1,,,')
      ).to.deep.equal({
        'width': 'device-width',
        'minimum-scale': '1',
      });
    });
    it('should support semicolon', () => {
      expect(
        parseViewportMeta('width=device-width;minimum-scale=1')
      ).to.deep.equal({
        'width': 'device-width',
        'minimum-scale': '1',
      });
    });
    it('should support mix of comma and semicolon', () => {
      expect(
        parseViewportMeta('width=device-width,minimum-scale=1;test=3;')
      ).to.deep.equal({
        'width': 'device-width',
        'minimum-scale': '1',
        'test': '3',
      });
    });
    it('should ignore extra mix delims', () => {
      expect(
        parseViewportMeta(',,;;,width=device-width;;,minimum-scale=1,,;')
      ).to.deep.equal({
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
      expect(stringifyViewportMeta({'width': 'device-width'})).to.equal(
        'width=device-width'
      );
    });
    it('should stringify two key-values', () => {
      const res = stringifyViewportMeta({
        'width': 'device-width',
        'minimum-scale': '1',
      });
      expect(
        res == 'width=device-width,minimum-scale=1' ||
          res == 'minimum-scale=1,width=device-width'
      ).to.be.true;
    });
    it('should stringify empty values', () => {
      const res = stringifyViewportMeta({
        'width': 'device-width',
        'minimal-ui': '',
      });
      expect(
        res == 'width=device-width,minimal-ui' ||
          res == 'minimal-ui,width=device-width'
      ).to.be.true;
    });
  });

  describe('updateViewportMetaString', () => {
    it('should do nothing with empty values', () => {
      expect(updateViewportMetaString('', {})).to.equal('');
      expect(updateViewportMetaString('width=device-width', {})).to.equal(
        'width=device-width'
      );
    });
    it('should add a new value', () => {
      expect(updateViewportMetaString('', {'minimum-scale': '1'})).to.equal(
        'minimum-scale=1'
      );
      expect(
        parseViewportMeta(
          updateViewportMetaString('width=device-width', {'minimum-scale': '1'})
        )
      ).to.deep.equal({
        'width': 'device-width',
        'minimum-scale': '1',
      });
    });
    it('should replace the existing value', () => {
      expect(
        parseViewportMeta(
          updateViewportMetaString('width=device-width,minimum-scale=2', {
            'minimum-scale': '1',
          })
        )
      ).to.deep.equal({
        'width': 'device-width',
        'minimum-scale': '1',
      });
    });
    it('should delete the existing value', () => {
      expect(
        parseViewportMeta(
          updateViewportMetaString('width=device-width,minimum-scale=1', {
            'minimum-scale': undefined,
          })
        )
      ).to.deep.equal({
        'width': 'device-width',
      });
    });
    it('should ignore delete for a non-existing value', () => {
      expect(
        parseViewportMeta(
          updateViewportMetaString('width=device-width', {
            'minimum-scale': undefined,
          })
        )
      ).to.deep.equal({
        'width': 'device-width',
      });
    });
    it('should do nothing if values did not change', () => {
      expect(
        updateViewportMetaString('width=device-width,minimum-scale=1', {
          'minimum-scale': '1',
        })
      ).to.equal('width=device-width,minimum-scale=1');
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
      sandbox = sinon.sandbox;
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
              add() {},
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
        Promise: window.Promise,
      };
      installTimerService(windowApi);
      installVsyncService(windowApi);
      installPlatformService(windowApi);
      installDocService(windowApi, /* isSingleDoc */ true);
      installGlobalDocumentStateService(windowApi);
      ampdoc = Services.ampdocServiceFor(windowApi).getAmpDoc();
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
      viewportMetaString =
        'width=device-width,minimum-scale=1,' +
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

describe('createViewport', () => {
  describes.fakeWin(
    'in Android',
    {
      win: {navigator: {userAgent: 'Android'}},
    },
    env => {
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
        installGlobalDocumentStateService(win);
        const ampDoc = Services.ampdocServiceFor(win).getAmpDoc();
        installViewerServiceForDoc(ampDoc);
        installViewportServiceForDoc(ampDoc);
        const viewport = Services.viewportForDoc(ampDoc);
        expect(viewport.binding_).to.be.instanceof(ViewportBindingNatural_);
      });

      it('should bind to "naturual" when iframed', () => {
        win.parent = {};
        installDocService(win, /* isSingleDoc */ true);
        installGlobalDocumentStateService(win);
        const ampDoc = Services.ampdocServiceFor(win).getAmpDoc();
        installViewerServiceForDoc(ampDoc);
        installViewportServiceForDoc(ampDoc);
        const viewport = Services.viewportForDoc(ampDoc);
        expect(viewport.binding_).to.be.instanceof(ViewportBindingNatural_);
      });
    }
  );

  describes.fakeWin(
    'in iOS',
    {
      win: {navigator: {userAgent: 'iPhone'}},
    },
    env => {
      let win;
      let ampDoc;
      let viewer;

      beforeEach(() => {
        win = env.win;
        installPlatformService(win);
        installTimerService(win);
        installVsyncService(win);
        installDocService(win, /* isSingleDoc */ true);
        installGlobalDocumentStateService(win);
        ampDoc = Services.ampdocServiceFor(win).getAmpDoc();
        installViewerServiceForDoc(ampDoc);
        viewer = Services.viewerForDoc(ampDoc);
        win.getComputedStyle = () => ({});
      });

      it('should bind to "natural" when not iframed', () => {
        win.parent = win;
        installViewportServiceForDoc(ampDoc);
        const viewport = Services.viewportForDoc(ampDoc);
        expect(viewport.binding_).to.be.instanceof(ViewportBindingNatural_);
      });

      it('should bind to "iOS embed" when iframed', () => {
        win.parent = {};
        sandbox.stub(viewer, 'isEmbedded').callsFake(() => true);
        installViewportServiceForDoc(ampDoc);
        const viewport = Services.viewportForDoc(ampDoc);
        expect(viewport.binding_).to.be.instanceof(
          ViewportBindingIosEmbedWrapper_
        );
      });

      it('should NOT bind to "iOS embed" when iframed but not embedded', () => {
        win.parent = {};
        sandbox.stub(viewer, 'isEmbedded').callsFake(() => false);
        installViewportServiceForDoc(ampDoc);
        const viewport = Services.viewportForDoc(ampDoc);
        expect(viewport.binding_).to.be.instanceof(ViewportBindingNatural_);
      });

      it('should bind to "iOS embed" when not iframed but in dev mode', () => {
        getMode(win).development = true;
        sandbox.stub(viewer, 'isEmbedded').callsFake(() => false);
        installViewportServiceForDoc(ampDoc);
        const viewport = Services.viewportForDoc(ampDoc);
        expect(viewport.binding_).to.be.instanceof(
          ViewportBindingIosEmbedWrapper_
        );
      });

      it('should bind to "iOS embed" when iframed but in test mode', () => {
        win.parent = {};
        getMode(win).test = true;
        sandbox.stub(viewer, 'isEmbedded').callsFake(() => false);
        installViewportServiceForDoc(ampDoc);
        const viewport = Services.viewportForDoc(ampDoc);
        expect(viewport.binding_).to.be.instanceof(
          ViewportBindingIosEmbedWrapper_
        );
      });

      it('should NOT bind to "iOS embed" when in dev mode, but iframed', () => {
        win.parent = {};
        getMode(win).development = true;
        sandbox.stub(viewer, 'isEmbedded').callsFake(() => false);
        installViewportServiceForDoc(ampDoc);
        const viewport = Services.viewportForDoc(ampDoc);
        expect(viewport.binding_).to.be.instanceof(ViewportBindingNatural_);
      });

      it('should bind to "iOS embed SD" when the experiment is on', () => {
        sandbox
          .stub(Services.platformFor(win), 'getIosVersionString')
          .callsFake(() => '12.2');
        toggleExperiment(win, 'ios-embed-sd', true);
        win.parent = {};
        sandbox.stub(viewer, 'isEmbedded').callsFake(() => true);
        installViewportServiceForDoc(ampDoc);
        const viewport = Services.viewportForDoc(ampDoc);
        expect(viewport.binding_).to.be.instanceof(
          ViewportBindingIosEmbedShadowRoot_
        );
      });

      it('should bind to "iOS embed SD" in future Safari', () => {
        sandbox
          .stub(Services.platformFor(win), 'getIosVersionString')
          .callsFake(() => '12.2');
        toggleExperiment(win, 'ios-embed-sd', true);
        win.parent = {};
        sandbox.stub(viewer, 'isEmbedded').callsFake(() => true);
        installViewportServiceForDoc(ampDoc);
        const viewport = Services.viewportForDoc(ampDoc);
        expect(viewport.binding_).to.be.instanceof(
          ViewportBindingIosEmbedShadowRoot_
        );
      });

      it('should NOT bind to "iOS embed SD" in Safari before 12.2', () => {
        // This is due to some scrolling, position:fixed and SD bugs.
        sandbox
          .stub(Services.platformFor(win), 'getMajorVersion')
          .callsFake(() => '12.1');
        toggleExperiment(win, 'ios-embed-sd', true);
        win.parent = {};
        sandbox.stub(viewer, 'isEmbedded').callsFake(() => true);
        installViewportServiceForDoc(ampDoc);
        const viewport = Services.viewportForDoc(ampDoc);
        expect(viewport.binding_).to.be.instanceof(
          ViewportBindingIosEmbedWrapper_
        );
      });

      it('should only bind to "iOS embed SD" when SD is supported', () => {
        // Reset SD support.
        Object.defineProperty(win.Element.prototype, 'attachShadow', {
          value: null,
        });
        sandbox
          .stub(Services.platformFor(win), 'getMajorVersion')
          .callsFake(() => '12.2');
        toggleExperiment(win, 'ios-embed-sd', true);
        win.parent = {};
        sandbox.stub(viewer, 'isEmbedded').callsFake(() => true);
        installViewportServiceForDoc(ampDoc);
        const viewport = Services.viewportForDoc(ampDoc);
        expect(viewport.binding_).to.be.instanceof(
          ViewportBindingIosEmbedWrapper_
        );
      });
    }
  );
});
