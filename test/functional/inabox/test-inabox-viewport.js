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
import {ViewportBindingInabox} from '../../../src/inabox/inabox-viewport';

describes.fakeWin('inabox-viewport', {amp: {}}, env => {

  let win;
  let binding;
  let element;
  let positionCallback;
  let onScrollCallback;
  let onResizeCallback;
  let measureSpy;

  beforeEach(() => {
    win = env.win;
    win.Math = {
      random() {
        return 0.12345;
      },
    };
    win.innerWidth = 200;
    win.innerHeight = 150;

    binding = new ViewportBindingInabox(win);
    measureSpy = sandbox.spy();
    element = {
      getBoundingClientRect() {
        return layoutRectLtwh(0, 0, 100, 100);
      },
      measure: measureSpy,
    };
    sandbox.stub(resourcesForDoc(win.document), 'get').returns([element]);
    sandbox./*OK*/stub(binding.iframeClient_, 'makeRequest', (req, res, cb) => {
      positionCallback = cb;
    });
    onScrollCallback = sandbox.spy();
    onResizeCallback = sandbox.spy();
    binding.connect();
    binding.onScroll(onScrollCallback);
    binding.onResize(onResizeCallback);
  });

  it('should work', () => {
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
});
