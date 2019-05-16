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

import {Renderer} from './amp-ad-type-defs';
import {devAssert} from '../../../src/log';
import {getAmpAdTemplateHelper} from './template-validator';
import {renderCreativeIntoFriendlyFrame} from './friendly-frame-util';

/**
 * @typedef {{
 *   size: ./amp-ad-type-defs.LayoutInfoDef,
 *   adUrl: string,
 *   creativeMetadata: ./amp-ad-type-defs.CreativeMetaDataDef,
 *   templateData: ./amp-ad-type-defs.AmpTemplateCreativeDef,
 * }}
 */
export let CreativeData;

/**
 * Render AMP creative into FriendlyFrame via templatization.
 */
export class TemplateRenderer extends Renderer {
  /**
   * Constructs a TemplateRenderer instance.
   */
  constructor() {
    super();
  }

  /** @override */
  render(context, element, creativeData) {
    creativeData = /** @type {CreativeData} */ (creativeData);

    const {size, adUrl} = context;
    const {creativeMetadata} = creativeData;

    devAssert(size, 'missing creative size');
    devAssert(adUrl, 'missing ad request url');

    return renderCreativeIntoFriendlyFrame(
      adUrl,
      size,
      element,
      creativeMetadata
    ).then(iframe => {
      const templateData =
        /** @type {!./amp-ad-type-defs.AmpTemplateCreativeDef} */ (creativeData.templateData);
      const {data} = templateData;
      if (!data) {
        return Promise.resolve();
      }
      const templateHelper = getAmpAdTemplateHelper(context.win);
      return templateHelper
        .render(data, iframe.contentWindow.document.body)
        .then(renderedElement => {
          const {analytics} = templateData;
          if (analytics) {
            templateHelper.insertAnalytics(renderedElement, analytics);
          }
          // This element must exist, or #render() would have thrown.
          const templateElement = iframe.contentWindow.document.querySelector(
            'template'
          );
          templateElement.parentNode.replaceChild(
            renderedElement,
            templateElement
          );
        });
    });
  }
}
