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

import * as iframeHelper from '../../../src/iframe-helper';
import {Observable} from '../../../src/observable';
import {PositionObserver} from '../../../ads/inabox/position-observer';
import {Services} from '../../../src/services';
import {
  ViewportBindingInabox,
  prepareBodyForOverlay,
  resetBodyForOverlay,
} from '../../../src/inabox/inabox-viewport';
import {
  installIframeMessagingClient,
} from '../../../src/inabox/inabox-iframe-messaging-client';
import {installPlatformService} from '../../../src/service/platform-impl';
import {layoutRectLtwh} from '../../../src/layout-rect';
import {toggleExperiment} from '../../../src/experiments';


const NOOP = () => {};

describes.fakeWin('inabox-viewport', {amp: {}}, env => {

  let win;
  let binding;
  let element;
  let positionCallback;
  let onScrollCallback;
  let onResizeCallback;
  let topWindowObservable;
  let measureSpy;

  function stubIframeClientMakeRequest(
    requestType, responseType, callback, opt_sync, opt_once) {
    const methodName = opt_once ? 'requestOnce' : 'makeRequest';

    return sandbox./*OK*/stub(
        binding.iframeClient_, methodName).callsFake((req, res, cb) => {
      expect(req).to.equal(requestType);
      expect(res).to.equal(responseType);

      if (opt_sync) {
        callback(req, res, cb);
      } else {
        setTimeout(() => callback(req, res, cb), 10);
      }

      return NOOP;
    });
  }

  beforeEach(() => {
    win = env.win;
    win.Math = {
      random() {
        return 0.12345;
      },
    };
    win.innerWidth = 200;
    win.innerHeight = 150;
    topWindowObservable = new Observable();
    win.top = {
      addEventListener(event, listener) {
        if (topWindowObservable.getHandlerCount() == 0) {
          topWindowObservable.add(listener);
        }
      },
      document: {scrollingElement: {}},
    };
    const iframeElement = {
      getBoundingClientRect() {
        return layoutRectLtwh(10, 20, 100, 100);
      },
    };
    win.frameElement = iframeElement;

    installIframeMessagingClient(win);
    installPlatformService(win);
    binding = new ViewportBindingInabox(win);
    measureSpy = sandbox.spy();
    element = {
      getBoundingClientRect() {
        return layoutRectLtwh(0, 0, 100, 100);
      },
      measure: measureSpy,
    };
    sandbox.stub(
        Services.resourcesForDoc(win.document), 'get').returns([element]);
    sandbox.stub(Services, 'resourcesPromiseForDoc').returns(
        new Promise(resolve => { resolve(); }));
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('should work for size, layoutRect and position observer', () => {

    let viewportRect;
    let targetRect;

    it('cross domain', () => {
      sandbox./*OK*/stub(iframeHelper, 'canInspectWindow').returns(false);
      stubIframeClientMakeRequest(
          'send-positions',
          'position',
          (req, res, cb) => { positionCallback = cb; },
          /* opt_sync */ true);
      binding.connect();
      testPositionCallback();
    });

    it('same domain', () => {
      sandbox./*OK*/stub(iframeHelper, 'canInspectWindow').returns(true);
      toggleExperiment(win, 'inabox-viewport-friendly', true);
      sandbox.stub(PositionObserver.prototype, 'observe')
          .callsFake((e, callback) => {
            topWindowObservable.add(() => callback({viewportRect, targetRect}));
          });

      positionCallback = data => {
        viewportRect = data.viewportRect;
        targetRect = data.targetRect;
        topWindowObservable.fire();
      };

      return binding.listenForPositionSameDomain().then(() => {
        testPositionCallback();
      });

    });

    function testPositionCallback() {
      onScrollCallback = sandbox.spy();
      onResizeCallback = sandbox.spy();
      binding.onScroll(onScrollCallback);
      binding.onResize(onResizeCallback);

      // Initial state
      expect(binding.getSize()).to.deep.equal({width: 200, height: 150});
      expect(binding.getLayoutRect(element))
          .to.deep.equal(layoutRectLtwh(0, 151, 100, 100));

      // Initial position received
      positionCallback({
        viewportRect: layoutRectLtwh(0, 0, 100, 100),
        targetRect: layoutRectLtwh(10, 20, 50, 50),
      });

      expect(onScrollCallback).to.not.be.called;
      expect(onResizeCallback).to.be.calledOnce;
      expect(measureSpy).to.be.calledOnce;
      expect(binding.getLayoutRect(element))
          .to.deep.equal(layoutRectLtwh(10, 20, 100, 100));
      sandbox.reset();

      // Scroll, viewport position changed
      positionCallback({
        viewportRect: layoutRectLtwh(0, 10, 100, 100),
        targetRect: layoutRectLtwh(10, 10, 50, 50),
      });

      expect(onScrollCallback).to.be.calledOnce;
      expect(onResizeCallback).to.not.be.called;
      expect(measureSpy).to.not.be.called;
      expect(binding.getLayoutRect(element))
          .to.deep.equal(layoutRectLtwh(10, 20, 100, 100));
      sandbox.reset();

      // Resize, viewport size changed
      positionCallback({
        viewportRect: layoutRectLtwh(0, 10, 200, 100),
        targetRect: layoutRectLtwh(10, 10, 50, 50),
      });

      expect(onScrollCallback).to.not.be.called;
      expect(onResizeCallback).to.be.calledOnce;
      expect(measureSpy).to.not.be.called;
      expect(binding.getLayoutRect(element))
          .to.deep.equal(layoutRectLtwh(10, 20, 100, 100));
      sandbox.reset();

      // DOM change, target position changed
      sandbox.restore();
      sandbox.stub(
          Services.resourcesForDoc(win.document), 'get').returns([element]);
      positionCallback({
        viewportRect: layoutRectLtwh(0, 10, 200, 100),
        targetRect: layoutRectLtwh(20, 10, 50, 50),
      });

      expect(onScrollCallback).to.not.be.called;
      expect(onResizeCallback).to.not.be.called;
      expect(measureSpy).to.be.calledOnce;
      expect(binding.getLayoutRect(element))
          .to.deep.equal(layoutRectLtwh(20, 20, 100, 100));
    }
  });

  it('should center content, resize and remeasure on overlay mode', () => {
    const allResourcesMock = Array(5).fill(undefined).map(() => ({
      measure: sandbox.spy(),
    }));

    sandbox.stub(binding, 'getChildResources').callsFake(
        () => allResourcesMock);

    const prepareContainer =
        sandbox.stub(binding, 'prepareBodyForOverlay_')
            .returns(Promise.resolve());

    const makeRequest = stubIframeClientMakeRequest(
        'full-overlay-frame',
        'full-overlay-frame-response',
        (req, res, cb) => cb({
          success: true,
          boxRect: {
            left: 0,
            top: 0,
            right: 1000,
            bottom: 2000,
            width: 1000,
            height: 2000,
          },
        }));

    return binding.updateLightboxMode(true).then(() => {
      expect(prepareContainer).to.be.calledOnce;
      expect(prepareContainer).to.be.calledBefore(makeRequest);

      allResourcesMock.forEach(resource => {
        expect(resource.measure).to.have.been.calledOnce;
      });
    });
  });

  it('should reset content and request resize on leave overlay mode', () => {
    const resetContainer =
        sandbox.stub(binding, 'resetBodyForOverlay_')
            .returns(Promise.resolve());

    const makeRequest = stubIframeClientMakeRequest(
        'cancel-full-overlay-frame',
        'cancel-full-overlay-frame-response',
        (req, res, cb) => cb({success: true}));

    return binding.updateLightboxMode(false).then(() => {
      expect(resetContainer).to.be.calledOnce;
      expect(resetContainer).to.be.calledAfter(makeRequest);
    });
  });

  it('should update box rect when expanding/collapsing', function*() {
    const boxRect = {
      left: 20,
      top: 10,
      bottom: 310,
      right: 420,
      width: 400,
      height: 300,
    };

    const updateBoxRectStub = sandbox.stub(binding, 'updateBoxRect_').callsFake(
        NOOP);

    stubIframeClientMakeRequest(
        'full-overlay-frame',
        'full-overlay-frame-response',
        (req, res, cb) => cb({success: true, boxRect}));

    sandbox.stub(binding, 'prepareBodyForOverlay_').returns(Promise.resolve());

    yield binding.updateLightboxMode(true);

    expect(updateBoxRectStub).to.be.calledWith(boxRect);
  });

  it('should update box rect when collapsing', function*() {
    const boxRect = {
      left: 20,
      top: 10,
      bottom: 310,
      right: 420,
      width: 400,
      height: 300,
    };

    const updateBoxRectStub = sandbox.stub(binding, 'updateBoxRect_').callsFake(
        NOOP);

    stubIframeClientMakeRequest(
        'cancel-full-overlay-frame',
        'cancel-full-overlay-frame-response',
        (req, res, cb) => cb({success: true, boxRect}));

    sandbox.stub(binding, 'resetBodyForOverlay_').returns(Promise.resolve());

    yield binding.updateLightboxMode(false);

    expect(updateBoxRectStub).to.be.calledWith(boxRect);
  });

  // TODO(zhouyx, #12476): Make this test work with sinon 4.0.
  it.skip('should center the fixed container properly', function* () {
    const w = 120;
    const h = 90;

    const el = document.createElement('div');

    sandbox.stub(win, 'innerWidth').callsFake(w);
    sandbox.stub(win, 'innerHeight').callsFake(h);

    yield prepareBodyForOverlay(win, el);

    expect(el.style['position']).to.equal('absolute');
    expect(el.style['left']).to.equal('50%');
    expect(el.style['top']).to.equal('50%');
    expect(el.style['bottom']).to.equal('auto');
    expect(el.style['right']).to.equal('auto');
    expect(el.style['width']).to.equal(`${w}px`);
    expect(el.style['height']).to.equal(`${h}px`);
    expect(el.style['margin-left']).to.equal(`-${w / 2}px`);
    expect(el.style['margin-top']).to.equal(`-${h / 2}px`);
  });

  it('should undo styling when the fixed container is reset', function* () {
    const el = document.createElement('div');

    yield resetBodyForOverlay(win, el);

    expect(el.style['position']).to.be.empty;
    expect(el.style['left']).to.be.empty;
    expect(el.style['top']).to.be.empty;
    expect(el.style['bottom']).to.be.empty;
    expect(el.style['right']).to.be.empty;
    expect(el.style['width']).to.be.empty;
    expect(el.style['height']).to.be.empty;
    expect(el.style['margin-left']).to.be.empty;
    expect(el.style['margin-top']).to.be.empty;
  });

  it('should request the position async from host', () => {
    sandbox./*OK*/stub(iframeHelper, 'canInspectWindow').returns(false);
    const requestSpy = stubIframeClientMakeRequest(
        'send-positions',
        'position',
        (req, res, cb) => cb({
          targetRect: layoutRectLtwh(10, 20, 100, 100),
          viewportRect: layoutRectLtwh(1, 1, 1, 1),
        }), undefined, true);
    return binding.getRootClientRectAsync().then(rect => {
      expect(rect).to.jsonEqual(layoutRectLtwh(10, 20, 100, 100));
      expect(requestSpy).to.be.calledOnce;
    });
  });

  it('should request the position directly from host if friendly', () => {
    // this is implicit but we make it explicit anyway for clarity
    sandbox./*OK*/stub(iframeHelper, 'canInspectWindow').returns(true);
    toggleExperiment(win, 'inabox-viewport-friendly', true);
    sandbox.stub(PositionObserver.prototype, 'getTargetRect')
        .returns(layoutRectLtwh(10, 20, 100, 100));
    return binding.getRootClientRectAsync().then(rect => {
      expect(rect).to.jsonEqual(layoutRectLtwh(10, 20, 100, 100));
    });
  });

  it('should disconnect friendly listener', () => {
    const unobserveFunction = sandbox.spy();
    sandbox.stub(PositionObserver.prototype, 'observe')
        .returns(unobserveFunction);
    sandbox./*OK*/stub(iframeHelper, 'canInspectWindow').returns(true);
    return binding.listenForPositionSameDomain().then(() => {
      expect(unobserveFunction).to.not.be.called;
      binding.disconnect();
      expect(unobserveFunction).to.be.called;
      expect(binding.unobserveFunction_).to.be.null;
    });
  });
});
