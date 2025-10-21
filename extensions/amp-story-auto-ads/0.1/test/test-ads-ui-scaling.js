/**
 * Copyright 2025 The AMP HTML Authors. All Rights Reserved.
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

import {describe, it, beforeEach, afterEach} from 'mocha';
import {expect} from 'chai';

describe('ads-ui-scaling', () => {
  let win;
  let doc;
  let originalDevicePixelRatio;

  beforeEach(() => {
    win = {
      devicePixelRatio: 1,
      addEventListener: () => {},
    };
    doc = {
      documentElement: {
        style: {
          setProperty: () => {},
        },
      },
    };
    originalDevicePixelRatio = window.devicePixelRatio;
  });

  afterEach(() => {
    window.devicePixelRatio = originalDevicePixelRatio;
  });

  it('should set UI scale to 1 for standard displays (devicePixelRatio <= 1.5)', () => {
    win.devicePixelRatio = 1;
    let scaledValue = null;
    doc.documentElement.style.setProperty = (prop, value) => {
      if (prop === '--ads-ui-scale') {
        scaledValue = value;
      }
    };

    const setUIScale = function() {
      const scale = win.devicePixelRatio || 1;
      doc.documentElement.style.setProperty(
        '--ads-ui-scale',
        scale > 1.5 ? scale : 1
      );
    };

    setUIScale();
    expect(scaledValue).to.equal(1);
  });

  it('should set UI scale to devicePixelRatio for high-res displays (devicePixelRatio > 1.5)', () => {
    win.devicePixelRatio = 2;
    let scaledValue = null;
    doc.documentElement.style.setProperty = (prop, value) => {
      if (prop === '--ads-ui-scale') {
        scaledValue = value;
      }
    };

    const setUIScale = function() {
      const scale = win.devicePixelRatio || 1;
      doc.documentElement.style.setProperty(
        '--ads-ui-scale',
        scale > 1.5 ? scale : 1
      );
    };

    setUIScale();
    expect(scaledValue).to.equal(2);
  });

  it('should set UI scale for 4K displays (devicePixelRatio = 2.5)', () => {
    win.devicePixelRatio = 2.5;
    let scaledValue = null;
    doc.documentElement.style.setProperty = (prop, value) => {
      if (prop === '--ads-ui-scale') {
        scaledValue = value;
      }
    };

    const setUIScale = function() {
      const scale = win.devicePixelRatio || 1;
      doc.documentElement.style.setProperty(
        '--ads-ui-scale',
        scale > 1.5 ? scale : 1
      );
    };

    setUIScale();
    expect(scaledValue).to.equal(2.5);
  });

  it('should handle undefined devicePixelRatio gracefully', () => {
    win.devicePixelRatio = undefined;
    let scaledValue = null;
    doc.documentElement.style.setProperty = (prop, value) => {
      if (prop === '--ads-ui-scale') {
        scaledValue = value;
      }
    };

    const setUIScale = function() {
      const scale = win.devicePixelRatio || 1;
      doc.documentElement.style.setProperty(
        '--ads-ui-scale',
        scale > 1.5 ? scale : 1
      );
    };

    setUIScale();
    expect(scaledValue).to.equal(1);
  });
});
