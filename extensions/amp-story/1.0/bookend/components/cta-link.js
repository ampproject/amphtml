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

import {
  AMP_STORY_BOOKEND_COMPONENT_DATA,
  BOOKEND_COMPONENT_TYPES,
  BookendComponentInterface,
} from './bookend-component-interface';
import {addAttributesToElement} from '../../../../../src/dom';
import {dict} from '../../../../../src/utils/object';
import {getSourceUrl, resolveRelativeUrl} from '../../../../../src/url';
import {htmlFor, htmlRefs} from '../../../../../src/static-template';
import {isArray} from '../../../../../src/types';
import {userAssert} from '../../../../../src/log';
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
    const links = /** @type {!Array} */ (ctaLinksJson['links']);
    userAssert(
      links && isArray(links) && links.length > 0,
      'CTA link component must be an array and contain at least one link ' +
        'inside it.'
    );

    links.forEach((ctaLink) => {
      userAssert(
        'text' in ctaLink && 'url' in ctaLink,
        'Links in CTA link component must contain `text` field and a `url`.'
      );

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
    const ctaLinks = {
      type: ctaLinksJson['type'],
      links: ctaLinksJson['links'],
    };

    return ctaLinks;
  }

  /** @override */
  buildElement(ctaLinksData, win, data) {
    const html = htmlFor(win.document);
    const container = html`
      <div
        class="i-amphtml-story-bookend-cta-link-wrapper
          i-amphtml-story-bookend-component"
      ></div>
    `;

    let linkSeed = html`
      <a class="i-amphtml-story-bookend-cta-link" target="_top">
        <div class="i-amphtml-story-bookend-cta-link-text" ref="linkText"></div>
      </a>
    `;
    /** @type {!Array} */ (ctaLinksData['links']).forEach((currentLink) => {
      const el = linkSeed.cloneNode(/* deep */ true);
      addAttributesToElement(
        el,
        dict({
          'href': resolveRelativeUrl(
            currentLink['url'],
            getSourceUrl(win.location)
          ),
        })
      );

      if (currentLink['amphtml'] === true) {
        addAttributesToElement(el, dict({'rel': 'amphtml'}));
      }

      const refs = htmlRefs(el);
      refs['linkText'].textContent = currentLink['text'];

      el[AMP_STORY_BOOKEND_COMPONENT_DATA] = {
        position: data.position,
        type: BOOKEND_COMPONENT_TYPES.CTA_LINK,
      };

      container.appendChild(el);
    });

    linkSeed = null; // GC

    return container;
  }
}
