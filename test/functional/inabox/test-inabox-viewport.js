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

import {layoutRectLtwh} from '../../../src/layout-rect';
import {resourcesForDoc} from '../../../src/services';
import {
  prepareFixedContainer,
  resetFixedContainer,
  ViewportBindingInabox,
} from '../../../src/inabox/inabox-viewport';
import {
  installIframeMessagingClient,
} from '../../../src/inabox/inabox-iframe-messaging-client';


const NOOP = () => {};

describes.fakeWin('inabox-viewport', {amp: {}}, env => {

  let win;
  let binding;
  let element;
  let positionCallback;
  let onScrollCallback;
  let onResizeCallback;
  let measureSpy;

  function stubIframeClientMakeRequest(
      requestType, responseType, callback, opt_sync) {

    return sandbox./*OK*/stub(
        binding.iframeClient_, 'makeRequest', (req, res, cb) => {
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

    installIframeMessagingClient(win);
    binding = new ViewportBindingInabox(win);
    measureSpy = sandbox.spy();
    element = {
      getBoundingClientRect() {
        return layoutRectLtwh(0, 0, 100, 100);
      },
      measure: measureSpy,
    };
    sandbox.stub(resourcesForDoc(win.document), 'get').returns([element]);
  });

  afterEach(() => {
    sandbox.reset();
  });

  it('should work for size, layoutRect and position observer', () => {
    stubIframeClientMakeRequest(
        'send-positions',
        'position',
        (req, res, cb) => { positionCallback = cb; },
        /* opt_sync */ true);

    onScrollCallback = sandbox.spy();
    onResizeCallback = sandbox.spy();
    binding.connect();
    binding.onScroll(onScrollCallback);
    binding.onResize(onResizeCallback);

    // Initial state
    expect(binding.getSize()).to.deep.equal({width: 200, height: 150});
    expect(binding.getLayoutRect(element))
        .to.deep.equal(layoutRectLtwh(0, 151, 100, 100));

    // Initial position received
    positionCallback({
      viewport: layoutRectLtwh(0, 0, 100, 100),
      target: layoutRectLtwh(10, 20, 50, 50),
    });

    expect(onScrollCallback).to.not.be.called;
    expect(onResizeCallback).to.be.calledOnce;
    expect(measureSpy).to.be.calledOnce;
    expect(binding.getLayoutRect(element))
        .to.deep.equal(layoutRectLtwh(10, 20, 100, 100));
    sandbox.reset();

    // Scroll, viewport position changed
    positionCallback({
      viewport: layoutRectLtwh(0, 10, 100, 100),
      target: layoutRectLtwh(10, 20, 50, 50),
    });

    expect(onScrollCallback).to.be.calledOnce;
    expect(onResizeCallback).to.not.be.called;
    expect(measureSpy).to.not.be.called;
    expect(binding.getLayoutRect(element))
        .to.deep.equal(layoutRectLtwh(10, 20, 100, 100));
    sandbox.reset();

    // Resize, viewport size changed
    positionCallback({
      viewport: layoutRectLtwh(0, 10, 200, 100),
      target: layoutRectLtwh(10, 20, 50, 50),
    });

    expect(onScrollCallback).to.not.be.called;
    expect(onResizeCallback).to.be.calledOnce;
    expect(measureSpy).to.not.be.called;
    expect(binding.getLayoutRect(element))
        .to.deep.equal(layoutRectLtwh(10, 20, 100, 100));
    sandbox.reset();

    // DOM change, target position changed
    positionCallback({
      viewport: layoutRectLtwh(0, 10, 200, 100),
      target: layoutRectLtwh(20, 20, 50, 50),
    });

    expect(onScrollCallback).to.not.be.called;
    expect(onResizeCallback).to.not.be.called;
    expect(measureSpy).to.be.calledOnce;
    expect(binding.getLayoutRect(element))
        .to.deep.equal(layoutRectLtwh(20, 20, 100, 100));
  });

  it('should center content, resize and remeasure on overlay mode', () => {
    const allResourcesMock = Array(5).fill(undefined).map(() => ({
      measure: sandbox.spy(),
    }));

    sandbox.stub(binding, 'getChildResources', () => allResourcesMock);

    const prepareContainer =
        sandbox.stub(binding, 'prepareFixedContainer_')
            .returns(Promise.resolve());

    const makeRequest = stubIframeClientMakeRequest(
        'full-overlay-frame',
        'full-overlay-frame-response',
        (req, res, cb) => cb({
          success: true,
          expandedRect: {
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
        sandbox.stub(binding, 'resetFixedContainer_')
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
    const collapsedRect = {
      left: 20,
      top: 10,
      bottom: 310,
      right: 420,
      width: 400,
      height: 300,
    };

    const expandedRect = {
      left: 20,
      top: 10,
      bottom: 310,
      right: 420,
      width: 400,
      height: 300,
    };

    const updateBoxRectStub = sandbox.stub(binding, 'updateBoxRect_', NOOP);

    const overlayRequestStub = stubIframeClientMakeRequest(
        'full-overlay-frame',
        'full-overlay-frame-response',
        (req, res, cb) => cb({success: true, expandedRect, collapsedRect}));

    sandbox.stub(binding, 'prepareFixedContainer_').returns(Promise.resolve());
    sandbox.stub(binding, 'resetFixedContainer_').returns(Promise.resolve());

    yield binding.updateLightboxMode(true);

    expect(updateBoxRectStub).to.be.calledWith(expandedRect);

    overlayRequestStub./*OK*/restore(); // need to re-stub
    updateBoxRectStub.reset();

    stubIframeClientMakeRequest(
        'cancel-full-overlay-frame',
        'cancel-full-overlay-frame-response',
        (req, res, cb) => cb({success: true}));

    yield binding.updateLightboxMode(false);

    expect(updateBoxRectStub).to.be.calledWith(collapsedRect);
  });

  it('should wait for remeasure if viewport changed', function*() {
    const collapsedRect = {
      left: 20,
      top: 10,
      bottom: 310,
      right: 420,
      width: 400,
      height: 300,
    };

    const positionRequestStub = stubIframeClientMakeRequest(
        'send-positions',
        'position',
        (req, res, cb) => { positionCallback = cb; },
        /* opt_sync */ true);

    const updateBoxRectStub = sandbox.stub(binding, 'updateBoxRect_', NOOP);

    sandbox.stub(binding, 'resetFixedContainer_').returns(Promise.resolve());

    // connecting to keep track of `position` listener
    binding.connect();
    positionRequestStub./*OK*/restore(); // need to re-stub

    // Execute position callback in full overlay mode to invalidate collapsed
    // rect.
    binding.inFullOverlayMode = true;

    positionCallback({
      viewport: {
        left: 1111,
        top: 2222,
        myValuesDontReallyMatterHere: 123,
      },
    });

    updateBoxRectStub.reset();

    stubIframeClientMakeRequest(
        'cancel-full-overlay-frame',
        'cancel-full-overlay-frame-response',
        (req, res, cb) => cb({success: true}));

    // Execute collapse
    yield binding.updateLightboxMode(false);

    // Shouldn't have been called as our current collapsed viewport is stale
    expect(updateBoxRectStub).to.not.have.been.called;

    // Send remeasure message
    binding.handleCollapseOverlayRemeasure(collapsedRect);

    expect(updateBoxRectStub).to.be.calledWith(collapsedRect);
  });

  it('should center the fixed container properly', done => {
    const w = 120;
    const h = 90;

    const el = {
      getBoundingClientRect() {
        return layoutRectLtwh(123, 456, w, h);
      },
      style: {},
    };

    prepareFixedContainer(win, el).then(() => {
      expect(el.style['position']).to.equal('absolute');
      expect(el.style['left']).to.equal('50%');
      expect(el.style['top']).to.equal('50%');
      expect(el.style['bottom']).to.equal('auto');
      expect(el.style['right']).to.equal('auto');
      expect(el.style['width']).to.equal(`${w}px`);
      expect(el.style['height']).to.equal(`${h}px`);
      expect(el.style['margin-left']).to.equal(`-${w / 2}px`);
      expect(el.style['margin-top']).to.equal(`-${h / 2}px`);

      done();
    });
  });

  it('should undo styling when the fixed container is reset', done => {
    const w = 120;
    const h = 90;

    const el = {
      getBoundingClientRect() {
        return layoutRectLtwh(123, 456, w, h);
      },
      style: {},
    };

    resetFixedContainer(win, el).then(() => {
      expect(el.style['position']).to.be.null;
      expect(el.style['left']).to.be.null;
      expect(el.style['top']).to.be.null;
      expect(el.style['bottom']).to.be.null;
      expect(el.style['right']).to.be.null;
      expect(el.style['width']).to.be.null;
      expect(el.style['height']).to.be.null;
      expect(el.style['margin-left']).to.be.null;
      expect(el.style['margin-top']).to.be.null;

      done();
    });
  });

});
