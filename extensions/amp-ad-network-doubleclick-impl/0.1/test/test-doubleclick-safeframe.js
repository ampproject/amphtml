/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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

// Need the following side-effect import because in actual production code,
// Fast Fetch impls are always loaded via an AmpAd tag, which means AmpAd is
// always available for them. However, when we test an impl in isolation,
// AmpAd is not loaded already, so we need to load it separately.
import '../../../amp-ad/0.1/amp-ad';
import {AmpAdNetworkDoubleclickImpl} from '../amp-ad-network-doubleclick-impl';
import {createElementWithAttributes} from '../../../../src/dom';

/**
 * We're allowing external resources because otherwise using realWin causes
 * strange behavior with iframes, as it doesn't load resources that we
 * normally load in prod.
 * We're turning on ampAdCss because using realWin means that we don't
 * inherit that CSS from the parent page anymore.
 */
const realWinConfig = {
  amp: {
    extensions: ['amp-ad-network-doubleclick-impl'],
  },
  ampAdCss: true,
  allowExternalResources: true,
};


describes.realWin('DoubleClick Fast Fetch - Safeframe', realWinConfig, env => {
  let impl;
  let multiSizeImpl;
  let element;
  let multiSizeElement;
  let sandbox;

  beforeEach(() => {});

  it('should register Safeframe listener on creation', () => {});

  describe('getSafeframeNameAttr', () => {
    it('should return properly formatted name attribute', () => {});
    it('', () => {});

  });

  describe('getCurrentGeometry', () => {
    it('should get current geometry when safeframe fills amp-ad', () => {});
    it('should get current geometry when safeframe does not fill amp-ad', () => {});
  });

  describe('registerSafeframeHost', () => {
    it('should create listener if needed', () => {});
  });

  describe('connectMessagingChannel', () => {
    it('should be called for channel setup', () => {});
  });

  describe('geometry updates', () => {
    it('should be sent when geometry changes occur', () => {});
  });

  describe('formatGeom', () => {
    it('should convert an intersection change entry to SF format', () => {});
  });

  describe('expand_request', () => {
    it('should succeed if expanding within amp-ad bounds', () => {});
    it('should succeed if expanding past amp-ad bounds and does not create reflow', () => {});
    it('should fail if expanding past amp-ad bounds and would create reflow', () => {});
  });

  describe('collapse_request', () => {
    it('should collapse just safeframe', () => {});
    it('should collapse safeframe and amp-ad', () => {});
  });
});
