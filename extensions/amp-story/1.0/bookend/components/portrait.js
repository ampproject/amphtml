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
import {isProtocolValid, parseUrl} from '../../../../../src/url';
import {user} from '../../../../../src/log';

/**
 * @typedef {{
 *   type: string,
 *   title: string,
 *   url: string,
 *   image: string
 * }}
 */
export let PortraitComponentDef;

/** @type {string} */
export const TAG = 'amp-story-bookend';

/**
 * Builder class for the article titles used to separate article sets.
 * @implements {BookendComponentInterface}
 */
export class PortraitComponent {
  /** @override */
  assertValidity(articleJson) {
    if (!articleJson['title'] || !articleJson['image'] || !articleJson['url']) {
      user().error(TAG, 'Portrait component must contain `title`, `image`, ' +
      'and `url` fields, skipping invalid.');
    }

    if (!isProtocolValid(articleJson['url'])) {
      user().error(TAG, 'Unsupported protocol for article URL ' +
        `${articleJson['url']}`);
    }

    if (!isProtocolValid(articleJson['image'])) {
      user().error(TAG, 'Unsupported protocol for article image URL' +
      ` ${articleJson['image']}`);
    }
  }

  /**
   * @override
   * @return {!PortraitComponentDef}
   * */
  build(portraitJson) {
    const portrait = {
      type: 'portrait',
      title: portraitJson.title,
      url: portraitJson['url'],
      domainName: parseUrl(portraitJson['url']).hostname,
      image: portraitJson['image'],
    };

    return portrait;
  }

  /** @override */
  buildTemplate(portraitData, doc) {
    const html = htmlFor(doc);
    const template =
        html`
        <a class="i-amphtml-story-bookend-portrait"
          target="_top">
        </a>`;
    addAttributesToElement(template, dict({'href': portraitData.url}));

    const heading =
    html`<h2 class="i-amphtml-story-bookend-portrait-heading"></h2>`;
    heading.textContent = portraitData.title.toUpperCase();
    template.appendChild(heading);

    const ampImg =
        html`
        <amp-img class="i-amphtml-story-bookend-portrait-image"
                width="312"
                height="416">
        </amp-img>`;
    addAttributesToElement(ampImg, dict({'src': portraitData.image}));
    template.appendChild(ampImg);

    const articleMeta =
      html`<div class="i-amphtml-story-bookend-portrait-meta"></div>`;
    articleMeta.textContent = portraitData.domainName;
    template.appendChild(articleMeta);

    return template;
  }
}
