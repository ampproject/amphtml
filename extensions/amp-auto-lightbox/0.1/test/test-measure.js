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

import {installIntersectionObserverStub} from '../../../../testing/intersection-observer-stub';
import {measure} from '../measure';

describes.realWin('amp-auto-lightbox:measure', {amp: true}, (env) => {
  let win, doc, ampdoc;
  let intersectionObserverStub;
  let element;

  beforeEach(() => {
    win = env.win;
    doc = win.document;
    ampdoc = env.ampdoc;
    intersectionObserverStub = installIntersectionObserverStub(
      env.sandbox,
      win
    );
    element = doc.createElement('div');
  });

  it('should measure an element via IntersectionObserver', async () => {
    expect(intersectionObserverStub.isObserved(element)).to.be.false;

    const promise = measure(ampdoc, element);
    expect(
      intersectionObserverStub.isObserved(element, {root: null, threshold: 0})
    ).to.be.true;

    intersectionObserverStub.notifySync(
      {
        target: element,
        boundingClientRect: {width: 101, height: 102},
      },
      {
        root: null,
        threshold: 0,
      }
    );

    const {width, height} = await promise;
    expect(width).to.equal(101);
    expect(height).to.equal(102);
    expect(intersectionObserverStub.isObserved(element)).to.be.false;
  });

  it('should only measure once at a time', async () => {
    const promise1 = measure(ampdoc, element);
    const promise2 = measure(ampdoc, element);

    intersectionObserverStub.notifySync(
      {
        target: element,
        boundingClientRect: {width: 101, height: 102},
      },
      {
        root: null,
        threshold: 0,
      }
    );

    expect(await promise1).to.deep.equal({width: 101, height: 102});
    expect(await promise2).to.deep.equal({width: 101, height: 102});
    expect(intersectionObserverStub.isObserved(element)).to.be.false;
  });
});
