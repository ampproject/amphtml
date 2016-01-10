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

import {getIntersectionChangeEntry} from '../../src/intersection-observer';
import {layoutRectLtwh} from '../../src/layout-rect';

describe('getIntersectionChangeEntry', () => {

  it('intersect correctly base', () => {
    const time = 123;
    const rootBounds = layoutRectLtwh(0, 100, 100, 100);
    const layoutBox = layoutRectLtwh(50, 50, 150, 200);
    const change = getIntersectionChangeEntry(time, rootBounds, layoutBox);

    expect(change).to.be.object;
    expect(change.time).to.equal(123);

    expect(change.rootBounds).to.equal(rootBounds);
    expect(change.rootBounds.x).to.equal(0);
    expect(change.rootBounds.y).to.equal(100);
    expect(change.boundingClientRect).to.jsonEqual({
      "left": 50,
      "top": -50,
      "width": 150,
      "height": 200,
      "bottom": 150,
      "right": 200,
      "x": 50,
      "y": -50
    });
    expect(change.intersectionRect.height).to.equal(100);
    expect(change.intersectionRect).to.jsonEqual({
      "left": 50,
      "top": 100,
      "width": 50,
      "height": 100,
      "bottom": 200,
      "right": 100,
      "x": 50,
      "y": 100
    });
  });

  it('intersect correctly 2', () => {
    const time = 111;
    const rootBounds = layoutRectLtwh(0, 100, 100, 100);
    const layoutBox = layoutRectLtwh(50, 199, 150, 200);
    const change = getIntersectionChangeEntry(time, rootBounds, layoutBox);
    expect(change.time).to.equal(111);

    expect(change.intersectionRect.height).to.equal(1);
    expect(change.intersectionRect).to.jsonEqual({
      "left": 50,
      "top": 199,
      "width": 50,
      "height": 1,
      "bottom": 200,
      "right": 100,
      "x": 50,
      "y": 199
    });
  });

  it('intersect correctly 3', () => {
    const rootBounds = layoutRectLtwh(198, 299, 100, 100);
    const layoutBox = layoutRectLtwh(50, 100, 150, 200);
    const change = getIntersectionChangeEntry(111, rootBounds, layoutBox);

    expect(change.intersectionRect.height).to.equal(1);
    expect(change.intersectionRect.width).to.equal(2);
  });

  it('intersect correctly 3', () => {
    const rootBounds = layoutRectLtwh(202, 299, 100, 100);
    const layoutBox = layoutRectLtwh(50, 100, 150, 200);
    const change = getIntersectionChangeEntry(111, rootBounds, layoutBox);

    expect(change.intersectionRect.height).to.equal(0);
    expect(change.intersectionRect.width).to.equal(0);
  });
});
