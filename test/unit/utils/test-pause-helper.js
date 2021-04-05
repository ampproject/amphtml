/**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
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

import {PauseHelper} from '../../../src/utils/pause-helper';
import {installResizeObserverStub} from '../../../testing/resize-observer-stub';

describes.realWin('PauseHelper', {}, (env) => {
  let win, doc;
  let resizeObserverStub;
  let element;
  let helper;

  beforeEach(() => {
    win = env.win;
    doc = win.document;
    resizeObserverStub = installResizeObserverStub(env.sandbox, win);

    element = doc.createElement('amp-test');
    element.pause = () => {};
    env.sandbox.stub(element, 'pause');

    helper = new PauseHelper(element);
  });

  it('should start observing', () => {
    expect(resizeObserverStub.isObserved(element)).to.be.false;
    helper.updatePlaying(true);
    expect(resizeObserverStub.isObserved(element)).to.be.true;

    resizeObserverStub.notifySync({
      target: element,
      borderBoxSize: [{inlineSize: 101, blockSize: 102}],
    });
    expect(element.pause).to.not.be.called;
  });

  it('should pause only after the element receives a non-zero size', () => {
    expect(resizeObserverStub.isObserved(element)).to.be.false;
    helper.updatePlaying(true);
    expect(resizeObserverStub.isObserved(element)).to.be.true;

    // No size, but didn't have size before.
    resizeObserverStub.notifySync({
      target: element,
      borderBoxSize: [{inlineSize: 0, blockSize: 0}],
    });
    expect(element.pause).to.not.be.called;

    // Has size.
    resizeObserverStub.notifySync({
      target: element,
      borderBoxSize: [{inlineSize: 1, blockSize: 2}],
    });
    expect(element.pause).to.not.be.called;

    // No size, and had size before.
    resizeObserverStub.notifySync({
      target: element,
      borderBoxSize: [{inlineSize: 0, blockSize: 0}],
    });
    expect(element.pause).to.be.calledOnce;
  });

  it('should unobserve', () => {
    helper.updatePlaying(true);
    expect(resizeObserverStub.isObserved(element)).to.be.true;

    helper.updatePlaying(false);
    expect(resizeObserverStub.isObserved(element)).to.be.false;
  });
});
