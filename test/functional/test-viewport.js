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
import {getStyle} from '../../src/style';
import {installPlatformService} from '../../src/service/platform-impl';
import {installTimerService} from '../../src/service/timer-impl';
import {installViewerServiceForDoc} from '../../src/service/viewer-impl';
import {loadPromise} from '../../src/event-helper';
import {setParentWindow} from '../../src/service';
import {toggleExperiment} from '../../src/experiments';
import {vsyncFor} from '../../src/vsync';
import * as sinon from 'sinon';

describes.fakeWin('Viewport', {}, env => {
  let clock;
  let viewport;
  let binding;
  let viewer;
  let viewerMock;
  let windowApi;
  let ampdoc;
  let viewerViewportHandler;
  let updatedPaddingTop;
  let viewportSize;
  let vsyncTasks;

  beforeEach(() => {
    clock = sandbox.useFakeTimers();

    windowApi = env.win;
    windowApi.requestAnimationFrame = fn => window.setTimeout(fn, 16);

    viewerViewportHandler = undefined;
    viewer = {
      isEmbedded: () => false,
      isIframed: () => false,
      getPaddingTop: () => 19,
      onViewportEvent: handler => {
        viewerViewportHandler = handler;
      },
      requestFullOverlay: () => {},
      cancelFullOverlay: () => {},
      postScroll: sandbox.spy(),
      isVisible: () => true,
      onVisibilityChanged: () => {},
    };
    viewerMock = sandbox.mock(viewer);
    const ampdocService = installDocService(windowApi, /* isSingleDoc */ true);
    ampdoc = ampdocService.getAmpDoc();
    installTimerService(windowApi);
    installPlatformService(windowApi);
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
      expect(root).to.have.class('-amp-singledoc');
    });

    it('should not set singledoc class', () => {
      sandbox.stub(ampdoc, 'isSingleDoc', () => false);
      new Viewport(ampdoc, binding, viewer);
      expect(root).to.not.have.class('-amp-singledoc');
    });

    it('should set standalone class', () => {
      new Viewport(ampdoc, binding, viewer);
      expect(root).to.have.class('-amp-standalone');
      expect(root).to.not.have.class('-amp-embedded');
    });

    it('should set embedded class', () => {
      sandbox.stub(viewer, 'isEmbedded', () => true);
      new Viewport(ampdoc, binding, viewer);
      expect(root).to.have.class('-amp-embedded');
      expect(root).to.not.have.class('-amp-standalone');
    });

    it('should not set iframed class', () => {
      new Viewport(ampdoc, binding, viewer);
      expect(root).to.not.have.class('-amp-iframed');
    });

    it('should set iframed class', () => {
      sandbox.stub(viewer, 'isIframed', () => true);
      new Viewport(ampdoc, binding, viewer);
      expect(root).to.have.class('-amp-iframed');
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
    viewerMock.expects('requestFullOverlay').once();
    const disableTouchZoomStub = sandbox.stub(viewport, 'disableTouchZoom');
    const hideFixedLayerStub = sandbox.stub(viewport, 'hideFixedLayer');
    const bindingMock = sandbox.mock(binding);
    bindingMock.expects('updateLightboxMode').withArgs(true).once();

    viewport.enterLightboxMode();

    bindingMock.verify();
    expect(disableTouchZoomStub.callCount).to.equal(1);
    expect(hideFixedLayerStub.callCount).to.equal(1);
  });

  it('should update viewport when leaving lightbox mode', () => {
    viewport.vsync_ = {mutate: callback => callback()};
    viewerMock.expects('cancelFullOverlay').once();
    const restoreOriginalTouchZoomStub = sandbox.stub(viewport,
        'restoreOriginalTouchZoom');
    const showFixedLayerStub = sandbox.stub(viewport, 'showFixedLayer');
    const bindingMock = sandbox.mock(binding);
    bindingMock.expects('updateLightboxMode').withArgs(false).once();

    viewport.leaveLightboxMode();

    bindingMock.verify();
    expect(restoreOriginalTouchZoomStub.callCount).to.equal(1);
    expect(showFixedLayerStub.callCount).to.equal(1);
  });

  it('should send scroll events', () => {
    // 0         ->    6     ->      12   ->      16         ->   18
    // scroll-10    scroll-20    scroll-30   2nd anim frame    scroll-40

    // when there's no scroll
    expect(viewport.scrollAnimationFrameThrottled_).to.be.false;
    expect(viewer.postScroll.callCount).to.equal(0);
    // scroll to 10
    viewport.getScrollTop = () => 10;
    viewport.sendScrollMessage_();
    expect(viewport.scrollAnimationFrameThrottled_).to.be.true;
    expect(viewer.postScroll.callCount).to.equal(0);
    // 6 ticks later, still during first animation frame
    clock.tick(6);
    expect(viewport.scrollAnimationFrameThrottled_).to.be.true;
    // scroll to 20
    viewport.getScrollTop = () => 20;
    viewport.sendScrollMessage_();
    expect(viewport.scrollAnimationFrameThrottled_).to.be.true;
    expect(viewer.postScroll.callCount).to.equal(0);
    // 6 ticks later, still during first animation frame
    clock.tick(6);
    expect(viewport.scrollAnimationFrameThrottled_).to.be.true;
    // scroll to 30
    viewport.getScrollTop = () => 30;
    viewport.sendScrollMessage_();
    expect(viewport.scrollAnimationFrameThrottled_).to.be.true;
    expect(viewer.postScroll.callCount).to.equal(0);
    // 6 ticks later, second animation frame starts
    clock.tick(6);
    expect(viewport.scrollAnimationFrameThrottled_).to.be.false;
    expect(viewer.postScroll.callCount).to.equal(1);
    expect(viewer.postScroll.withArgs(30).calledOnce).to.be.true;
    // scroll to 40
    viewport.getScrollTop = () => 40;
    viewport.sendScrollMessage_();
    expect(viewport.scrollAnimationFrameThrottled_).to.be.true;
    expect(viewer.postScroll.callCount).to.equal(1);
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
    // expect(changeEvent).to.equal(null);
    expect(viewer.postScroll.callCount).to.equal(0);
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
    expect(viewer.postScroll.callCount).to.equal(1);
    binding.getScrollTop = () => 35;
    viewport.scroll_();

    clock.tick(16);
    // time 32: scroll to 35
    // call viewer.postScroll, raf for viewer.postScroll
    viewport.scroll_();
    expect(changeEvent).to.equal(null);
    expect(viewport.scrollTracking_).to.be.true;
    expect(viewer.postScroll.callCount).to.equal(2);

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
    expect(viewer.postScroll.callCount).to.equal(3);
    changeEvent = null;

    clock.tick(16);
    // time 64:
    // call viewer.postScroll
    expect(viewer.postScroll.callCount).to.equal(4);

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

  it('should add class to HTML element with make-body-block experiment', () => {
    viewer.isEmbedded = () => true;
    toggleExperiment(windowApi, 'make-body-block', true);
    const docElement = windowApi.document.documentElement;
    const addStub = sandbox.stub(docElement.classList, 'add');
    viewport = new Viewport(ampdoc, binding, viewer);
    expect(addStub).to.be.calledWith('-amp-make-body-block');
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
    let viewerMock;
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
        getPaddingTop: () => 0,
        onViewportEvent: () => {},
        isIframed: () => false,
        isVisible: () => true,
        onVisibilityChanged: () => {},
      };
      viewerMock = sandbox.mock(viewer);

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
      const ampdocService = installDocService(windowApi,
          /* isSingleDoc */ true);
      ampdoc = ampdocService.getAmpDoc();
      installTimerService(windowApi);
      installPlatformService(windowApi);
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
      viewerMock.expects('isIframed').returns(true).atLeast(1);
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
      viewerMock.expects('isIframed').returns(true).atLeast(1);
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
  let documentElement;
  let documentBody;
  let windowEventHandlers;
  let viewer;
  let viewerMock;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    const WindowApi = function() {};
    windowEventHandlers = {};
    WindowApi.prototype.addEventListener = function(eventType, handler) {
      windowEventHandlers[eventType] = handler;
    };
    WindowApi.prototype.removeEventListener = function(eventType, handler) {
      if (windowEventHandlers[eventType] == handler) {
        delete windowEventHandlers[eventType];
      }
    };
    windowApi = new WindowApi();

    documentElement = {
      style: {},
    };
    documentBody = {
      nodeType: 1,
      style: {},
    };
    windowApi.document = {
      documentElement,
      body: documentBody,
      defaultView: windowApi,
    };
    windowApi.navigator = {userAgent: ''};
    windowMock = sandbox.mock(windowApi);
    installPlatformService(windowApi);
    viewer = {
      isEmbedded: () => false,
      getPaddingTop: () => 19,
      onViewportEvent: () => {},
      requestFullOverlay: () => {},
      cancelFullOverlay: () => {},
      postScroll: sandbox.spy(),
    };
    viewerMock = sandbox.mock(viewer);
    binding = new ViewportBindingNatural_(windowApi, viewer);
    binding.connect();
  });

  afterEach(() => {
    windowMock.verify();
    viewerMock.verify();
    sandbox.restore();
    toggleExperiment(windowApi, 'make-body-relative', false);
  });

  it('should configure make-body-relative', () => {
    toggleExperiment(windowApi, 'make-body-relative', true);
    binding = new ViewportBindingNatural_(windowApi, viewer);
    expect(documentBody.style.display).to.be.undefined;
    expect(documentBody.style.position).to.equal('relative');
    // It's important that this experiment does NOT override the previously
    // set `overflow`.
    expect(documentBody.style.overflow).to.equal('visible');
    expect(documentBody.style.overflowY).to.not.be.ok;
    expect(documentBody.style.overflowX).to.not.be.ok;
  });

  it('should setup overflow:visible on body', () => {
    expect(documentBody.style.overflow).to.equal('visible');
  });

  it('should NOT require fixed layer transferring', () => {
    expect(binding.requiresFixedLayerTransfer()).to.be.false;
  });

  it('should subscribe to scroll and resize events', () => {
    expect(windowEventHandlers['scroll']).to.not.equal(undefined);
    expect(windowEventHandlers['resize']).to.not.equal(undefined);
  });

  it('should connect/disconnect events', () => {
    windowEventHandlers = {};
    binding = new ViewportBindingNatural_(windowApi, viewer);
    expect(Object.keys(windowEventHandlers)).to.have.length(0);

    binding.connect();
    expect(windowEventHandlers['scroll']).to.not.equal(undefined);
    expect(windowEventHandlers['resize']).to.not.equal(undefined);

    // After disconnect, there are no more listeners on window.
    binding.disconnect();
    expect(Object.keys(windowEventHandlers)).to.have.length(0);
  });

  it('should update padding', () => {
    windowApi.document = {
      documentElement: {style: {}},
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
        clientWidth: 333,
        clientHeight: 444,
      },
    };
    let size = binding.getSize();
    expect(size.width).to.equal(111);
    expect(size.height).to.equal(222);

    delete windowApi.innerWidth;
    delete windowApi.innerHeight;
    size = binding.getSize();
    expect(size.width).to.equal(333);
    expect(size.height).to.equal(444);
  });

  it('should calculate scrollTop from scrollElement', () => {
    windowApi.pageYOffset = 11;
    windowApi.document = {
      scrollingElement: {
        scrollTop: 17,
      },
    };
    expect(binding.getScrollTop()).to.equal(17);
  });

  it('should calculate scrollWidth from scrollElement', () => {
    windowApi.pageYOffset = 11;
    windowApi.document = {
      scrollingElement: {
        scrollWidth: 117,
      },
    };
    expect(binding.getScrollWidth()).to.equal(117);
  });

  it('should calculate scrollHeight from scrollElement', () => {
    windowApi.pageYOffset = 11;
    windowApi.document = {
      scrollingElement: {
        scrollHeight: 119,
      },
    };
    expect(binding.getScrollHeight()).to.equal(119);
  });

  it('should update scrollTop on scrollElement', () => {
    windowApi.pageYOffset = 11;
    windowApi.document = {
      scrollingElement: {
        scrollTop: 17,
      },
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
      },
    };
    const rect = binding.getLayoutRect(el);
    expect(rect.left).to.equal(112);  // round(100 + 11.5)
    expect(rect.top).to.equal(213);  // round(200 + 12.5)
    expect(rect.width).to.equal(14);  // round(13.5)
    expect(rect.height).to.equal(15);  // round(14.5)
  });

  it('should offset client rect for layout and position passed in', () => {
    windowApi.pageXOffset = 1000;
    windowApi.pageYOffset = 2000;
    windowApi.document = {scrollingElement: {}};
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
      nodeType: /* DOCUMENT */ 9,
      readyState: 'complete',
      documentElement: {style: {}},
      body: {
        nodeType: 1,
        scrollWidth: 777,
        scrollHeight: 999,
        style: {},
        appendChild: child => {
          bodyChildren.push(child);
        },
        addEventListener: (eventType, handler) => {
          bodyEventListeners[eventType] = handler;
        },
      },
      createElement: tagName => {
        return {
          tagName,
          id: '',
          style: {},
          scrollIntoView: sandbox.spy(),
        };
      },
    };
    windowApi.document.defaultView = windowApi;
    windowMock = sandbox.mock(windowApi);
    binding = new ViewportBindingNaturalIosEmbed_(windowApi,
        new AmpDocSingle(windowApi));
    return Promise.resolve();
  });

  afterEach(() => {
    windowMock.verify();
    sandbox.restore();
  });

  it('should require fixed layer transferring', () => {
    expect(binding.requiresFixedLayerTransfer()).to.be.true;
  });

  it('should subscribe to resize events on window, scroll on body', () => {
    expect(windowEventHandlers['resize']).to.not.equal(undefined);
    expect(windowEventHandlers['scroll']).to.equal(undefined);
    expect(bodyEventListeners['scroll']).to.not.equal(undefined);
  });

  it('should always have scrollWidth equal window.innerWidth', () => {
    expect(binding.getScrollWidth()).to.equal(555);
  });

  it('should setup document for embed scrolling', () => {
    const documentElement = windowApi.document.documentElement;
    const body = windowApi.document.body;
    expect(documentElement.style.overflowY).to.equal('auto');
    expect(documentElement.style.webkitOverflowScrolling).to.equal('touch');
    expect(body.style.overflowX).to.equal('hidden');
    expect(body.style.overflowY).to.equal('auto');
    expect(body.style.webkitOverflowScrolling).to.equal('touch');
    expect(body.style.position).to.equal('absolute');
    expect(body.style.top).to.equal(0);
    expect(body.style.left).to.equal(0);
    expect(body.style.right).to.equal(0);
    expect(body.style.bottom).to.equal(0);

    expect(bodyChildren.length).to.equal(3);

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

    expect(bodyChildren[2].id).to.equal('-amp-endpos');
    expect(bodyChildren[2].style.position).to.be.undefined;
    expect(bodyChildren[2].style.top).to.be.undefined;
    expect(bodyChildren[2].style.width).to.equal(0);
    expect(bodyChildren[2].style.height).to.equal(0);
    expect(bodyChildren[2].style.visibility).to.equal('hidden');
  });

  it('should update border on BODY', () => {
    windowApi.document = {
      body: {
        nodeType: 1,
        style: {},
      },
    };
    binding.updatePaddingTop(31);
    expect(windowApi.document.body.style.borderTop).to
        .equal('31px solid transparent');
  });

  it('should update border in lightbox mode', () => {
    windowApi.document = {
      body: {
        nodeType: 1,
        style: {},
      },
    };
    binding.updatePaddingTop(31);
    expect(windowApi.document.body.style.borderTop).to
        .equal('31px solid transparent');
    expect(windowApi.document.body.style.borderTopStyle).to.be.undefined;

    binding.updateLightboxMode(true);
    expect(windowApi.document.body.style.borderTopStyle).to.equal('none');

    binding.updateLightboxMode(false);
    expect(windowApi.document.body.style.borderTopStyle).to.equal('solid');
    expect(windowApi.document.body.style.borderBottomStyle).to.not.equal(
        'solid');
    expect(windowApi.document.body.style.borderLeftStyle).to.not.equal('solid');
    expect(windowApi.document.body.style.borderRightStyle).to.not.equal(
        'solid');
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

  it('should calculate scrollTop from scrollpos element with padding', () => {
    bodyChildren[0].getBoundingClientRect = () => {
      return {top: 0, left: -11};
    };
    binding.updatePaddingTop(10);
    binding.onScrolled_();
    // scrollTop = - BCR.top + paddingTop
    expect(binding.getScrollTop()).to.equal(10);
  });

  it('should calculate scrollHeight from scrollpos/endpos elements', () => {
    bodyChildren[0].getBoundingClientRect = () => {
      return {top: -17, left: -11};
    };
    bodyChildren[2].getBoundingClientRect = () => {
      return {top: 100, left: -11};
    };
    expect(binding.getScrollHeight()).to.equal(117);
  });

  it('should offset client rect for layout', () => {
    bodyChildren[0].getBoundingClientRect = () => {
      return {top: -200, left: -100};
    };
    binding.onScrolled_();
    const el = {
      getBoundingClientRect: () => {
        return {left: 11.5, top: 12.5, width: 13.5, height: 14.5};
      },
    };
    const rect = binding.getLayoutRect(el);
    expect(rect.left).to.equal(112);  // round(100 + 11.5)
    expect(rect.top).to.equal(213);  // round(200 + 12.5)
    expect(rect.width).to.equal(14);  // round(13.5)
    expect(rect.height).to.equal(15);  // round(14.5)
  });

  it('should set scroll position via moving element', () => {
    const moveEl = bodyChildren[1];
    binding.setScrollTop(10);
    expect(getStyle(moveEl, 'transform')).to.equal('translateY(10px)');
    expect(moveEl.scrollIntoView.callCount).to.equal(1);
    expect(moveEl.scrollIntoView.firstCall.args[0]).to.equal(true);
  });

  it('should set scroll position via moving element with padding', () => {
    binding.updatePaddingTop(19);
    const moveEl = bodyChildren[1];
    binding.setScrollTop(10);
    // transform = scrollTop - paddingTop
    expect(getStyle(moveEl, 'transform')).to.equal('translateY(-9px)');
    expect(moveEl.scrollIntoView.callCount).to.equal(1);
    expect(moveEl.scrollIntoView.firstCall.args[0]).to.equal(true);
  });

  it('should adjust scroll position when scrolled to 0', () => {
    const posEl = bodyChildren[0];
    posEl.getBoundingClientRect = () => {return {top: 0, left: 0};};
    const moveEl = bodyChildren[1];
    const event = {preventDefault: sandbox.spy()};
    binding.adjustScrollPos_(event);
    expect(getStyle(moveEl, 'transform')).to.equal('translateY(1px)');
    expect(moveEl.scrollIntoView.callCount).to.equal(1);
    expect(moveEl.scrollIntoView.firstCall.args[0]).to.equal(true);
    expect(event.preventDefault.callCount).to.equal(1);
  });

  it('should adjust scroll position when scrolled to 0 w/padding', () => {
    binding.updatePaddingTop(10);
    const posEl = bodyChildren[0];
    posEl.getBoundingClientRect = () => {return {top: 10, left: 0};};
    const moveEl = bodyChildren[1];
    const event = {preventDefault: sandbox.spy()};
    binding.adjustScrollPos_(event);
    // transform = 1 - updatePadding
    expect(getStyle(moveEl, 'transform')).to.equal('translateY(-9px)');
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
    const event = {preventDefault: sandbox.spy()};
    binding.adjustScrollPos_(event);
    expect(moveEl.scrollIntoView.callCount).to.equal(0);
    expect(event.preventDefault.callCount).to.equal(0);
  });

  it('should NOT adjust scroll position when overscrolled', () => {
    const posEl = bodyChildren[0];
    posEl.getBoundingClientRect = () => {return {top: 10, left: 0};};
    const moveEl = bodyChildren[1];
    const event = {preventDefault: sandbox.spy()};
    binding.adjustScrollPos_(event);
    expect(moveEl.scrollIntoView.callCount).to.equal(0);
    expect(event.preventDefault.callCount).to.equal(0);
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
    win.document.documentElement.className = 'top';
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

  it('should have UI setup', () => {
    expect(binding.setupDone_).to.be.true;
    expect(win.document.documentElement)
        .to.have.class('-amp-ios-embed');
    expect(win.document.body).to.exist;
    expect(win.document.body.parentNode)
        .to.not.equal(win.document.documentElement);
    expect(win.document.body.parentNode)
        .to.equal(binding.wrapper_);
    expect(binding.wrapper_.parentNode)
        .to.equal(win.document.documentElement);
    expect(binding.wrapper_.tagName).to.equal('HTML');
    expect(binding.wrapper_.id).to.equal('i-amp-html-wrapper');
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

    // `<html>` and `<i-amp-html-wrapper>` must be scrollable, but not `body`.
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

    // `body` must have a 1px transparent body for two purposes:
    // (1) to cancel out margin collapse in body's children;
    // (2) to offset scroll adjustment to 1 to avoid scroll freeze problem.
    expect(bodyCss.borderTop.replace('rgba(0, 0, 0, 0)', 'transparent'))
        .to.equal('1px solid transparent');
    expect(bodyCss.margin).to.equal('0px');
  });

  it('should be immediately scrolled to 1 to avoid freeze', () => {
    expect(binding.wrapper_.scrollTop).to.equal(1);
  });

  it('should subscribe to scroll and resize events', () => {
    expect(win.eventListeners.count('resize')).to.equal(1);
    // Note that scroll event is on the wrapper, and NOT on root or body.
    expect(win.eventListeners.count('scroll')).to.equal(0);
    expect(win.document.eventListeners.count('scroll')).to.equal(0);
    expect(win.document.documentElement.eventListeners.count('scroll'))
        .to.equal(0);
    expect(win.document.body.eventListeners.count('scroll'))
        .to.equal(0);
  });

  it('should connect/disconnect events', () => {
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

  it('should calculate scrollTop from scrollElement', () => {
    binding.wrapper_.scrollTop = 17;
    expect(binding.getScrollTop()).to.equal(17);
  });

  it('should calculate scrollWidth from scrollElement', () => {
    expect(binding.getScrollWidth()).to.equal(200);
  });

  it('should calculate scrollHeight from scrollElement', () => {
    expect(binding.getScrollHeight()).to.equal(301); // +1px for border-top.
  });

  it('should update scrollTop on scrollElement', () => {
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
});

describe('createViewport', () => {

  describes.fakeWin('in Android', {win: {navigator: {userAgent: 'Android'}}},
      env => {
        let win;

        beforeEach(() => {
          win = env.win;
          installPlatformService(win);
          installTimerService(win);
        });

        it('should bind to "natural" when not iframed', () => {
          win.parent = win;
          const ampDoc = installDocService(win, true).getAmpDoc();
          installViewerServiceForDoc(ampDoc);
          const viewport = installViewportServiceForDoc(ampDoc);
          expect(viewport.binding_).to.be.instanceof(ViewportBindingNatural_);
        });

        it('should bind to "naturual" when iframed', () => {
          win.parent = {};
          const ampDoc = installDocService(win, true).getAmpDoc();
          installViewerServiceForDoc(ampDoc);
          const viewport = installViewportServiceForDoc(ampDoc);
          expect(viewport.binding_).to.be.instanceof(ViewportBindingNatural_);
        });
      });

  describes.fakeWin('in iOS', {
    win: {navigator: {userAgent: 'iPhone'}},
  }, env => {
    let win;

    beforeEach(() => {
      win = env.win;
      installPlatformService(win);
      installTimerService(win);
    });

    it('should bind to "natural" when not iframed', () => {
      win.parent = win;
      const ampDoc = installDocService(win, true).getAmpDoc();
      installViewerServiceForDoc(ampDoc);
      const viewport = installViewportServiceForDoc(ampDoc);
      expect(viewport.binding_).to.be.instanceof(ViewportBindingNatural_);
    });

    it('should bind to "iOS embed" when iframed', () => {
      win.parent = {};
      const ampDoc = installDocService(win, true).getAmpDoc();
      const viewer = installViewerServiceForDoc(ampDoc);
      sandbox.stub(viewer, 'isIframed', () => true);
      sandbox.stub(viewer, 'isEmbedded', () => true);
      const viewport = installViewportServiceForDoc(ampDoc);
      expect(viewport.binding_).to
          .be.instanceof(ViewportBindingNaturalIosEmbed_);
    });

    it('should NOT bind to "iOS embed" when iframed but not embedded', () => {
      win.parent = {};
      const ampDoc = installDocService(win, true).getAmpDoc();
      const viewer = installViewerServiceForDoc(ampDoc);
      sandbox.stub(viewer, 'isIframed', () => true);
      sandbox.stub(viewer, 'isEmbedded', () => false);
      const viewport = installViewportServiceForDoc(ampDoc);
      expect(viewport.binding_).to
          .be.instanceof(ViewportBindingNatural_);
    });
  });
});
