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

import {AmpAdNetworkBase} from './amp-ad-network-base';
import {AmpAdTemplates} from '../../amp-a4a/0.1/amp-ad-template-helper';
import {FriendlyFrameRenderer} from './amp-ad-render';
import {Services} from '../../../src/services';
import {Validator, ValidatorResult} from './amp-ad-type-defs';
import {dev} from '../../../src/log';
import {pushIfNotExist} from '../../../src/utils/array';
import {tryParseJson} from '../../../src/json';
import {utf8Decode} from '../../../src/utils/bytes';

/** @const {string} */
export const AMP_TEMPLATED_CREATIVE_HEADER_NAME = 'AMP-template-amp-creative';

/**
 * Validator for Template ads.
 */
export class TemplateValidator extends Validator {

  constructor() {
    super();

    /** @private {?AmpAdTemplates} */
    this.ampAdTemplates_ = null;
  }

  /**
   * @param {string} templateString
   * @param {!./amp-ad-type-defs.AmpTemplateCreativeDef} parsedResponseBody
   * @return {!./amp-ad-type-defs.CreativeMetaDataDef}
   * @private
   */
  getAmpAdMetadata_(templateString, parsedResponseBody) {
    // TODO(levitzky) The following minification is for demo purposes only. Once
    // launched this will either be performed server-side, or will be replaced
    // by more sophisticated logic.
    const minifiedCreative = templateString.replace(
        /<script async.+?<\/script>/g, '');
    const metadata = /** @type {!./amp-ad-type-defs.CreativeMetaDataDef} */ ({
      minifiedCreative,
      customElementExtensions: [],
      extensions: [],
    });
    if (parsedResponseBody.analytics) {
      pushIfNotExist(metadata['customElementExtensions'], 'amp-analytics');
    }
    pushIfNotExist(metadata['customElementExtensions'], 'amp-mustache');
    return metadata;
  }

  /**
   * @param {!./amp-ad-type-defs.CreativeMetaDataDef} metadata
   * @param {!Window} win
   * @private
   */
  processMetadata_(metadata, win) {
    const extensions = Services.extensionsFor(win);
    metadata.customElementExtensions.forEach(
        extensionId => extensions./*OK*/preloadExtension(extensionId));
    // TODO(levitzky) Add preload logic for fonts / images.
  }

  /** @override */
  validate(context, unvalidatedBytes, headers) {
    const creativeData = {};
    const body = utf8Decode(/** @type {!ArrayBuffer} */ (unvalidatedBytes));
    if (!headers ||
        headers.get(AMP_TEMPLATED_CREATIVE_HEADER_NAME) !== 'amp-mustache') {
      creativeData['creative'] = body;
      return Promise.resolve(
          /** @type {!./amp-ad-type-defs.ValidatorOutput} */ ({
            creativeData,
            adResponseType: 'template',
            type: ValidatorResult.NON_AMP,
          }));
    }

    const parsedResponseBody =
        /** @type {!./amp-ad-type-defs.AmpTemplateCreativeDef} */ (
        tryParseJson(body) || {});
    this.ampAdTemplates_ = this.ampAdTemplates_ ||
        new AmpAdTemplates(context.win);
    return this.ampAdTemplates_
        .fetch(parsedResponseBody.templateUrl)
        .then(template => {
          const creativeMetadata =
              this.getAmpAdMetadata_(template, parsedResponseBody);
          this.processMetadata_(creativeMetadata, context.win);
          creativeData.templateData = parsedResponseBody;
          creativeData.creativeMetadata = creativeMetadata;
          return {creativeData, type: ValidatorResult.AMP};
        });
  }
}

/**
 * Render for Template ads.
 */
export class TemplateRenderer extends FriendlyFrameRenderer {

  constructor() {
    super();

    /** @private {?AmpAdTemplates} */
    this.ampAdTemplates_ = null;
  }

  /** @override */
  render(context, containerElement, creativeData) {
    return super.render(
        context, containerElement, creativeData)
        .then(() => {
          dev().assert(creativeData.templateData,
              'Template renderer invoked before template data available!');
          const templateData = creativeData.templateData;
          const templateMacroValues = templateData.data;
          if (this.iframe && templateMacroValues) {
            this.ampAdTemplates_ = this.ampAdTemplates_ ||
                new AmpAdTemplates(context.win);
            this.ampAdTemplates_.render(
                templateMacroValues,
                this.iframe.contentWindow.document.body)
                .then(renderedElement => {
                  const analytics = templateData && templateData.analytics;
                  if (analytics) {
                    this.ampAdTemplates_.insertAnalytics(
                        renderedElement, analytics);
                  }
                  this.iframe.contentWindow.document.body./*OK*/innerHTML =
                    renderedElement./*OK*/innerHTML;
                });
          }
        });
  }
}


// These should be re-used for each instance.
const validator = new TemplateValidator();
const renderer = new TemplateRenderer();

/**
 * @abstract
 */
export class AmpAdTemplateBase extends AmpAdNetworkBase {
  /**
   * @param {!Element} element
   */
  constructor(element) {
    super(element);

    this.registerValidator(validator);
    this.registerRenderer(renderer, ValidatorResult.AMP);

    this.getContext().win = this.win;
    this.getContext().applyFillContent = this.applyFillContent.bind(this);
    this.getContext().isInViewport = this.isInViewport.bind(this);
    this.getContext().ampDoc = this.getAmpDoc();
  }

  /** @override */
  buildCallback() {
    this.getContext().size = {
      width: this.element.getAttribute('width'),
      height: this.element.getAttribute('height'),
      layout: this.element.getAttribute('layout'),
    };
  }
}

