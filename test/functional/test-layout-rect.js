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
    const rect = lr.layoutRectLtwh(1, 2, 3, 4);
    expect(rect.left).to.equal(1);
    expect(rect.top).to.equal(2);
    expect(rect.width).to.equal(3);
    expect(rect.height).to.equal(4);
    expect(rect.bottom).to.equal(6);
    expect(rect.right).to.equal(4);
  });

  it('layoutRectsOverlap', () => {
    const rect1 = lr.layoutRectLtwh(10, 20, 30, 40);
    const rect2 = lr.layoutRectLtwh(40, 60, 10, 10);
    const rect3 = lr.layoutRectLtwh(41, 60, 10, 10);
    expect(lr.layoutRectsOverlap(rect1, rect2)).to.equal(true);
    expect(lr.layoutRectsOverlap(rect1, rect3)).to.equal(false);
    expect(lr.layoutRectsOverlap(rect2, rect3)).to.equal(true);
  });

  it('expandLayoutRect', () => {
    const rect1 = lr.layoutRectLtwh(10, 20, 30, 40);
    const rect2 = lr.expandLayoutRect(rect1, 2, 3);
    expect(rect2.left).to.equal(10 - 30 * 2);
    expect(rect2.right).to.equal(40 + 30 * 2);
    expect(rect2.width).to.equal(30 + 30 * 4);
    expect(rect2.top).to.equal(20 - 40 * 3);
    expect(rect2.bottom).to.equal(60 + 40 * 3);
    expect(rect2.height).to.equal(40 + 40 * 6);
  });

  it('moveLayoutRect', () => {
    const rect1 = lr.layoutRectLtwh(10, 20, 30, 40);
    const rect2 = lr.moveLayoutRect(rect1, 2, 3);
    expect(rect2.left).to.equal(rect1.left + 2);
    expect(rect2.right).to.equal(rect1.right + 2);
    expect(rect2.width).to.equal(rect1.width);
    expect(rect2.top).to.equal(rect1.top + 3);
    expect(rect2.bottom).to.equal(rect1.bottom + 3);
    expect(rect2.height).to.equal(rect1.height);
  });

  it('layoutRectFromDomRect', () => {
    const rect = lr.layoutRectFromDomRect({top: 11, left: 12, width: 111,
      height: 222});
    expect(rect.top).to.equal(11);
    expect(rect.left).to.equal(12);
    expect(rect.width).to.equal(111);
    expect(rect.height).to.equal(222);
    expect(rect.bottom).to.equal(11 + 222);
    expect(rect.right).to.equal(12 + 111);
  });

  it('rectIntersection', () => {
    const rect1 = lr.layoutRectLtwh(10, 20, 40, 50);
    const rect2 = lr.layoutRectLtwh(40, 60, 10, 10);
    const rect3 = lr.layoutRectLtwh(1000, 60, 10, 10);
    const rect4 = lr.layoutRectLtwh(45, 65, 10, 10);
    // the LayoutRect array can deal with speical array
    expect(lr.rectIntersection(null, undefined)).to.be.null;
    expect(lr.rectIntersection()).to.be.null;
    expect(lr.rectIntersection(rect1)).to.jsonEqual(rect1);
    expect(lr.rectIntersection(rect1, rect2)).to.jsonEqual({
      'left': 40,
      'top': 60,
      'width': 10,
      'height': 10,
      'bottom': 70,
      'right': 50,
      'x': 40,
      'y': 60,
    });
    // the layoutRect array can deal with null/undefined input
    expect(lr.rectIntersection(null, rect1, undefined, rect2)).to.jsonEqual({
      'left': 40,
      'top': 60,
      'width': 10,
      'height': 10,
      'bottom': 70,
      'right': 50,
      'x': 40,
      'y': 60,
    });
    expect(lr.rectIntersection(rect1, rect3)).to.be.null;
    expect(lr.rectIntersection(rect2, rect3)).to.be.null;
    expect(lr.rectIntersection(rect1, rect2, rect4)).to.jsonEqual({
      'left': 45,
      'top': 65,
      'width': 5,
      'height': 5,
      'bottom': 70,
      'right': 50,
      'x': 45,
      'y': 65,
    });
    expect(lr.rectIntersection(rect1, rect2, rect3, rect4)).to.be.null;
  });
});

describe('areMarginsChanged', () => {
  it('should find margins are not changed when values the same', () => {
    const margins = {
      top: 1,
      right: 2,
      bottom: 3,
      left: 4,
    };
    const changes = {
      top: 1,
      right: 2,
      bottom: 3,
      left: 4,
    };
    expect(lr.areMarginsChanged(margins, changes)).to.be.false;
  });

  it('should find margins are not changed when all changes undefined', () => {
    const margins = {
      top: 1,
      right: 2,
      bottom: 3,
      left: 4,
    };
    const changes = {};
    expect(lr.areMarginsChanged(margins, changes)).to.be.false;
  });

  it('should find margins to be changed when top different', () => {
    const margins = {
      top: 1,
      right: 2,
      bottom: 3,
      left: 4,
    };
    const changes = {
      top: 5,
    };
    expect(lr.areMarginsChanged(margins, changes)).to.be.true;
  });

  it('should find margins to be changed when right different', () => {
    const margins = {
      top: 1,
      right: 2,
      bottom: 3,
      left: 4,
    };
    const changes = {
      right: 5,
    };
    expect(lr.areMarginsChanged(margins, changes)).to.be.true;
  });

  it('should find margins to be changed when bottom different', () => {
    const margins = {
      top: 1,
      right: 2,
      bottom: 3,
      left: 4,
    };
    const changes = {
      bottom: 5,
    };
    expect(lr.areMarginsChanged(margins, changes)).to.be.true;
  });

  it('should find margins to be changed when left different', () => {
    const margins = {
      top: 1,
      right: 2,
      bottom: 3,
      left: 4,
    };
    const changes = {
      left: 5,
    };
    expect(lr.areMarginsChanged(margins, changes)).to.be.true;
  });
});
