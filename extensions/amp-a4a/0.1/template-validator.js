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

import {AdResponseType, Validator, ValidatorResult} from './amp-ad-type-defs';
import {
  extensionsHasElement,
  getAmpAdMetadata,
  getExtensionsFromMetadata,
  mergeExtensionsMetadata,
} from './amp-ad-utils';
import {getAmpAdTemplateHelper} from './amp-ad-template-helper';
import {preloadFriendlyIframeEmbedExtensions} from '../../../src/friendly-iframe-embed';
import {tryParseJson} from '../../../src/json';
import {urls} from '../../../src/config';
import {utf8Decode} from '../../../src/utils/bytes';

/** @const {string} */
export const AMP_TEMPLATED_CREATIVE_HEADER_NAME = 'AMP-Ad-Template-Extension';
export const DEPRECATED_AMP_TEMPLATED_CREATIVE_HEADER_NAME =
  'AMP-template-amp-creative';

/**
 * Validator for Template ads.
 */
export class TemplateValidator extends Validator {
  /** @override */
  validate(context, containerElement, unvalidatedBytes, headers) {
    const body = utf8Decode(/** @type {!ArrayBuffer} */ (unvalidatedBytes));
    const parsedResponseBody = /** @type {./amp-ad-type-defs.AmpTemplateCreativeDef} */ (tryParseJson(
      body
    ));

    // If we're missing the relevant header, or headers altogether, we cannot
    // proceed. In this case, we return a NON_AMP response, since we cannot
    // ensure this template will be valid AMP. We will pass the body of the
    // response as the creative, and downstream renderers may attempt to render
    // it as a non-AMP creative within a cross-domain iframe.
    if (
      !parsedResponseBody ||
      !headers ||
      (headers.get(AMP_TEMPLATED_CREATIVE_HEADER_NAME) !== 'amp-mustache' &&
        headers.get(DEPRECATED_AMP_TEMPLATED_CREATIVE_HEADER_NAME) !==
          'amp-mustache')
    ) {
      return Promise.resolve(
        /** @type {!./amp-ad-type-defs.ValidatorOutput} */ ({
          creativeData: {
            creative: body,
          },
          adResponseType: AdResponseType.TEMPLATE,
          type: ValidatorResult.NON_AMP,
        })
      );
    }

    return getAmpAdTemplateHelper(containerElement)
      .fetch(parsedResponseBody.templateUrl)
      .then((template) => {
        const creativeMetadata = getAmpAdMetadata(template);
        creativeMetadata['extensions'] = creativeMetadata['extensions'] || [];
        const extensions = creativeMetadata['extensions'];
        mergeExtensionsMetadata(
          extensions,
          creativeMetadata['customElementExtensions']
        );
        if (
          parsedResponseBody.analytics &&
          !extensionsHasElement(extensions, 'amp-analytics')
        ) {
          extensions.push({
            'custom-element': 'amp-analytics',
            src: `${urls.cdn}/v0/amp-analytics-0.1.js`,
          });
        }
        if (!extensionsHasElement(extensions, 'amp-mustache')) {
          extensions.push({
            'custom-element': 'amp-mustache',
            src: `${urls.cdn}/v0/amp-mustache-latest.js`,
          });
        }

        const extensionsInfo = getExtensionsFromMetadata(creativeMetadata);
        preloadFriendlyIframeEmbedExtensions(context.win, extensionsInfo);

        // TODO(levitzky) Add preload logic for fonts / images.
        return Promise.resolve(
          /** @type {!./amp-ad-type-defs.ValidatorOutput} */ ({
            creativeData: {
              templateData: parsedResponseBody,
              creativeMetadata,
            },
            adResponseType: AdResponseType.TEMPLATE,
            type: ValidatorResult.AMP,
          })
        );
      });
  }
}
