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
export let CtaLinkDef;

const TAG = 'amp-story-bookend';

/**
 * Builder class for the call to action button pair.
 * @implements {BookendComponentInterface}
 */
export class CtaLinkComponent {
  /** @override */
  assertValidity(ctaLinksJson) {
    if (!ctaLinksJson['links'] && !ctaLinksJson['links'].length > 0) {
      user().error(TAG, 'CTA link component must contain at least one link.');
    } else {
      ctaLinksJson['links'].forEach(ctaLink => {
        if (!ctaLink['text'] || !ctaLink['url']) {
          user().error(TAG, 'All links in CTA link component must contain' +
            'a `text` field and a `url`.');
        }

        if (!isProtocolValid(ctaLink['url'])) {
          user().error(TAG, 'Unsupported protocol for CTA link URL ' +
            `${ctaLink['url']}`);
        }
      });
    }
  }

  /**
   * @override
   * @return {!CtaLinkDef}
   * */
  build(ctaLinksJson) {
    const ctaLinkDef = {
      type: ctaLinksJson['type'],
      links: ctaLinksJson['links'],
    };
    return ctaLinkDef;
  }

  /** @override */
  buildTemplate(ctaLinksData, doc) {
    const html = htmlFor(doc);
    const containerTemplate =
        html`
        <div class="i-amphtml-story-bookend-cta-link-wrapper">
        </div>`;

    ctaLinksData['links'].forEach(currentLink => {
      const ctaLinkTemplate =
        html`<a class="i-amphtml-story-bookend-cta-link" target="_top"></a>`;
      addAttributesToElement(ctaLinkTemplate,
          dict({'href': currentLink['url']}));
      const ctaLinkTextTemplate =
        html`<div class="i-amphtml-story-bookend-cta-link-text"></div>`;
      ctaLinkTextTemplate.textContent = currentLink['text'];
      ctaLinkTemplate.appendChild(ctaLinkTextTemplate);

      containerTemplate.appendChild(ctaLinkTemplate);
    });

    return containerTemplate;
  }
}
