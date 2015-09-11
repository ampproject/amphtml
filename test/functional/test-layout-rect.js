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

import * as lr from '../../src/layout-rect';

describe('LayoutRect', () => {

  it('layoutRectLtwh', () => {
    let rect = lr.layoutRectLtwh(1, 2, 3, 4);
    expect(rect.left).to.equal(1);
    expect(rect.top).to.equal(2);
    expect(rect.width).to.equal(3);
    expect(rect.height).to.equal(4);
    expect(rect.bottom).to.equal(6);
    expect(rect.right).to.equal(4);
  });

  it('layoutRectsOverlap', () => {
    let rect1 = lr.layoutRectLtwh(10, 20, 30, 40);
    let rect2 = lr.layoutRectLtwh(40, 60, 10, 10);
    let rect3 = lr.layoutRectLtwh(41, 60, 10, 10);
    expect(lr.layoutRectsOverlap(rect1, rect2)).to.equal(true);
    expect(lr.layoutRectsOverlap(rect1, rect3)).to.equal(false);
    expect(lr.layoutRectsOverlap(rect2, rect3)).to.equal(true);
  });

  it('expandLayoutRect', () => {
    let rect1 = lr.layoutRectLtwh(10, 20, 30, 40);
    let rect2 = lr.expandLayoutRect(rect1, 2, 3);
    expect(rect2.left).to.equal(10 - 30 * 2);
    expect(rect2.right).to.equal(40 + 30 * 2);
    expect(rect2.width).to.equal(30 + 30 * 4);
    expect(rect2.top).to.equal(20 - 40 * 3);
    expect(rect2.bottom).to.equal(60 + 40 * 3);
    expect(rect2.height).to.equal(40 + 40 * 6);
  });

});
