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
import {htmlFor, htmlRefs} from '../../../../../src/static-template';
import {isArray} from '../../../../../src/types';
import {user} from '../../../../../src/log';
import {userAssertValidProtocol} from '../../utils';

/**
 * @typedef {{
 *   url: string,
 *   text: string,
 * }}
 */
let CtaLinkArrDef;

/**
 * @typedef {{
 *   type: string,
 *   links: !Array<CtaLinkArrDef>,
 * }}
 */
export let CtaLinkDef;

/**
 * Builder class for the call to action link component.
 * @implements {BookendComponentInterface}
 */
export class CtaLinkComponent {
  /**
   * @param {!../bookend-component.BookendComponentDef} ctaLinksJson
   * @override
   * */
  assertValidity(ctaLinksJson, element) {
    const links = ctaLinksJson['links'];
    user().assert(links && isArray(links) && links.length > 0,
        'CTA link component must be an array and contain at least one link ' +
        'inside it.');

    links.forEach(ctaLink => {
      user().assert('text' in ctaLink && 'url' in ctaLink,
          'Links in CTA link component must contain `text` field and a `url`.');

      userAssertValidProtocol(element, ctaLink['url']);
    });
  }

  /**
   * @param {!../bookend-component.BookendComponentDef} ctaLinksJson
   * @param {!Element} unusedElement
   * @return {!CtaLinkDef}
   * @override
   * */
  build(ctaLinksJson, unusedElement) {
    return {
      type: ctaLinksJson['type'],
      links: ctaLinksJson['links'],
    };
  }

  /**
   * @param {!../bookend-component.BookendComponentDef} ctaLinksData
   * @param {!Document} doc
   * @return {!Element}
   * @override
   * */
  buildTemplate(ctaLinksData, doc) {
    const html = htmlFor(doc);
    const container =
        html`<div class="i-amphtml-story-bookend-cta-link-wrapper
          i-amphtml-story-bookend-component">
        </div>`;

    let linkSeed =
        html`<a class="i-amphtml-story-bookend-cta-link" target="_top">
          <div class="i-amphtml-story-bookend-cta-link-text" ref="linkText">
          </div>
        </a>`;
    ctaLinksData['links'].forEach(currentLink => {
      const el = linkSeed.cloneNode(/* deep */ true);
      addAttributesToElement(el, dict({'href': currentLink['url']}));

      const refs = htmlRefs(el);
      refs['linkText'].textContent = currentLink['text'];

      container.appendChild(el);
    });

    linkSeed = null; // GC

    return container;
  }
}
