/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
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

import {ButtonTextFitter} from '../../extensions/amp-story-auto-ads/0.1/story-ad-button-text-fitter';
import {
  createCta,
  getStoryAdMetadataFromDoc,
  maybeCreateAttribution,
  validateCtaMetadata,
} from '../../extensions/amp-story-auto-ads/0.1/story-ad-ui';
import {createElementWithAttributes} from '../dom';
import {CSS as inaboxCSS} from '../../build/amp-story-auto-ads-inabox-0.1.css';
import {installStylesForDoc} from '../style-installer';
import {CSS as sharedCSS} from '../../build/amp-story-auto-ads-shared-0.1.css';

/**
 * If story ad metatags exist, render this creative as a story ad.
 * @param {!../service/ampdoc-impl.AmpDoc} ampdoc
 */
export function maybeRenderInaboxAsStoryAd(ampdoc) {
  const {win} = ampdoc;
  const doc = win.document;
  const storyAdMetadata = getStoryAdMetadataFromDoc(doc);
  if (!validateCtaMetadata(storyAdMetadata)) {
    return;
  }
  installStylesForDoc(ampdoc, sharedCSS + inaboxCSS);
  maybeCreateAttribution(win, storyAdMetadata, doc.body);

  const buttonFitter = new ButtonTextFitter(ampdoc);
  const ctaContainer = createElementWithAttributes(doc, 'div');
  createCta(doc, buttonFitter, ctaContainer, storyAdMetadata);
  doc.body.appendChild(ctaContainer);

  if (win.parent) {
    win.parent./*OK*/ postMessage('amp-story-ad-load', '*');
  }
}
