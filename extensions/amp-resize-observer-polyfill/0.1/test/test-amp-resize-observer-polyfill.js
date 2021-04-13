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

import {
  ResizeObserverStub,
  installStub,
} from '../../../../src/polyfillstub/resize-observer-stub';
import {upgradeResizeObserverPolyfill} from '../amp-resize-observer-polyfill';

describes.realWin('amp-resize-observer-polyfill', {amp: false}, (env) => {
  let win;

  beforeEach(() => {
    win = env.win;
    delete win.ResizeObserver;
    installStub(win);
  });

  it('should install ResizeObserver polyfill', () => {
    expect(win.ResizeObserver).to.equal(ResizeObserverStub);
    upgradeResizeObserverPolyfill(win);
    expect(win.ResizeObserver).to.exist;
    expect(win.ResizeObserver).to.not.equal(ResizeObserverStub);
  });
});
