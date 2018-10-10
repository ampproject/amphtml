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
  AdResponseType,
  Validator,
  ValidatorResult,
} from './amp-ad-type-defs';
import {AmpAdTemplateHelper} from '../../amp-a4a/0.1/amp-ad-template-helper';
import {getAmpAdMetadata} from './amp-ad-utils';
import {preloadExtensions} from '../../../src/friendly-iframe-embed';
import {tryParseJson} from '../../../src/json';
import {urls} from '../../../src/config';
import {utf8Decode} from '../../../src/utils/bytes';

/** @const {string} */
export const AMP_TEMPLATED_CREATIVE_HEADER_NAME = 'AMP-Ad-Template-Extension';
export const DEPRECATED_AMP_TEMPLATED_CREATIVE_HEADER_NAME =
  'AMP-template-amp-creative';

/** @type {?AmpAdTemplateHelper} */
let ampAdTemplateHelper;

/**
 * Returns the global template helper.
 * @param {!Window} win
 * @return {!AmpAdTemplateHelper}
 */
export function getAmpAdTemplateHelper(win) {
  return ampAdTemplateHelper ||
      (ampAdTemplateHelper = new AmpAdTemplateHelper(win));
}

/**
 * Validator for Template ads.
 */
export class TemplateValidator extends Validator {
  /** @override */
  validate(context, unvalidatedBytes, headers) {

    const body = utf8Decode(/** @type {!ArrayBuffer} */ (unvalidatedBytes));
    const parsedResponseBody =
    /** @type {./amp-ad-type-defs.AmpTemplateCreativeDef} */ (
        tryParseJson(body));

    // If we're missing the relevant header, or headers altogether, we cannot
    // proceed. In this case, we return a NON_AMP response, since we cannot
    // ensure this template will be valid AMP. We will pass the body of the
    // response as the creative, and downstream renderers may attempt to render
    // it as a non-AMP creative within a cross-domain iframe.
    if (!parsedResponseBody || !headers ||
        (headers.get(AMP_TEMPLATED_CREATIVE_HEADER_NAME) !== 'amp-mustache' &&
         headers.get(DEPRECATED_AMP_TEMPLATED_CREATIVE_HEADER_NAME) !==
           'amp-mustache')) {
      return Promise.resolve(
          /** @type {!./amp-ad-type-defs.ValidatorOutput} */ ({
            creativeData: {
              creative: body,
            },
            adResponseType: AdResponseType.TEMPLATE,
            type: ValidatorResult.NON_AMP,
          }));
    }

    return getAmpAdTemplateHelper(context.win)
        .fetch(parsedResponseBody.templateUrl)
        .then(template => {
          const creativeMetadata = getAmpAdMetadata(template);
          this.addAnalyticsOrMustacheIfApplicable(
              creativeMetadata, parsedResponseBody);
          preloadExtensions(creativeMetadata, context.win);
          // TODO(levitzky) Add preload logic for fonts / images.
          return Promise.resolve(
              /** @type {!./amp-ad-type-defs.ValidatorOutput} */ ({
                creativeData: {
                  templateData: parsedResponseBody,
                  creativeMetadata,
                },
                adResponseType: AdResponseType.TEMPLATE,
                type: ValidatorResult.AMP,
              }));
        });
  }

  /**
   * Adds the mustache or analytics extensions if not already installed.
   * TODO(alabiaga): If not installed we load the 0.1 versions of the
   * extensions. Should we default to the latest version?
   * @param {?../../../extensions/amp-a4a/0.1/amp-ad-type-defs.CreativeMetaDataDef} creativeMetadata
   * @param {!./amp-ad-type-defs.AmpTemplateCreativeDef} parsedResponseBody
   */
  addAnalyticsOrMustacheIfApplicable(creativeMetadata, parsedResponseBody) {
    if (parsedResponseBody.analytics) {
      this.addExtensionIfApplicable_(
          creativeMetadata,
          'amp-analytics',
          urls.cdn + '/v0/amp-analytics-0.1.js');
    }
    this.addExtensionIfApplicable_(
        creativeMetadata,
        'amp-mustache',
        urls.cdn + '/v0/amp-mustache-0.1.js');
  }

  /**
   * @param {?../../../extensions/amp-a4a/0.1/amp-ad-type-defs.CreativeMetaDataDef} creativeMetadata
   * @param {string} extensionId
   * @param {string} extensionSrc
   */
  addExtensionIfApplicable_(creativeMetadata, extensionId, extensionSrc) {
    if (creativeMetadata) {
      let ext = [];
      const {extensions, customElementExtensions} = creativeMetadata;
      if (extensions && extensions.length) {
        ext = extensions;
      } else if (customElementExtensions && customElementExtensions.length) {
        ext = customElementExtensions;
      }
      if (ext.indexOf(extensionId) == -1) {
        if (extensions) {
          extensions.push({
            'custom-element': extensionId,
            'src': extensionSrc,
          });
        }
        if (customElementExtensions) {
          customElementExtensions.push(extensionId);
        }
      }
    }
  }
}
