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

import {BookendComponentInterface} from './bookend-component-interface';
import {addAttributesToElement} from '../../../../../src/dom';
import {dict} from '../../../../../src/utils/object';
import {htmlFor} from '../../../../../src/static-template';
import {isProtocolValid} from '../../../../../src/url';
import {user} from '../../../../../src/log';

/**
 * @typedef {{
 *   type: string,
 *   text1: string,
 *   url1: string,
 *   text2: string,
 *   url2: string
 * }}
 */
export let CtaLinkPairDef;

const TAG = 'amp-story-bookend';

/**
 * Builder class for the call to action button pair.
 * @implements {BookendComponentInterface}
 */
export class CtaLinkPairComponent {
  /** @override */
  assertValidity(ctaLinksJson) {
    if (!ctaLinksJson['text1'] || !ctaLinksJson['url1'] ||
      !ctaLinksJson['text2'] || !ctaLinksJson['url2']) {
      user().error(TAG, 'CTA button pair must contain `text1`, `url1`, ' +
      '`text2`, and `url2` fields, skipping invalid.');
    }

    if (!isProtocolValid(ctaLinksJson['url1']) ||
       !isProtocolValid(ctaLinksJson['url2'])) {
      user().error(TAG, 'Unsupported protocol for CTA button pair URL ' +
        `${ctaLinksJson['url1']} or ${ctaLinksJson['url1']}`);
    }
  }

  /**
   * @override
   * @return {!CtaLinkPairDef}
   * */
  build(ctaLinksJson) {
    const ctaButtons = {
      type: ctaLinksJson['type'],
      text1: ctaLinksJson['text1'],
      url1: ctaLinksJson['url1'],
      text2: ctaLinksJson['text2'],
      url2: ctaLinksJson['url2'],
    };
    return ctaButtons;
  }

  /** @override */
  buildTemplate(ctaLinksData, doc) {
    const html = htmlFor(doc);
    const containerTemplate =
        html`
        <div class="i-amphtml-story-bookend-cta-link-pair">
        </div>`;

    const ctaLinkTemplate =
        html`<a class="i-amphtml-story-bookend-cta-link" target="_top"></a>`;
    addAttributesToElement(ctaLinkTemplate,
        dict({'href': ctaLinksData['url1']}));
    const ctaLinkTextTemplate =
      html`<div class="i-amphtml-story-bookend-cta-link-text"></div>`;
    ctaLinkTextTemplate.textContent = ctaLinksData['text1'];
    ctaLinkTemplate.appendChild(ctaLinkTextTemplate);

    containerTemplate.appendChild(ctaLinkTemplate);

    const ctaLinkTemplate2 =
        html`<a class="i-amphtml-story-bookend-cta-link" target="_top"></a>`;
    addAttributesToElement(ctaLinkTemplate2,
        dict({'href': ctaLinksData['url2']}));
    const ctaLinkTextTemplate2 =
      html`<div class="i-amphtml-story-bookend-cta-link-text"></div>`;
    ctaLinkTextTemplate2.textContent = ctaLinksData['text2'];
    ctaLinkTemplate2.appendChild(ctaLinkTextTemplate2);

    containerTemplate.appendChild(ctaLinkTemplate2);

    return containerTemplate;
  }
}
