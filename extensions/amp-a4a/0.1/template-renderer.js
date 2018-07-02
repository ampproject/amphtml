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

import {FriendlyFrameRenderer} from './friendly-frame-renderer';
import {getAmpAdTemplateHelper} from './template-validator';

/**
 * Render AMP creative into FriendlyFrame via templatization.
 */
export class TemplateRenderer extends FriendlyFrameRenderer {
  /** @override */
  render(context, element, validatorData) {
    const {creativeData} = validatorData;
    return super.render(context, element, creativeData).then(() => {
      const templateHelper = getAmpAdTemplateHelper(context.win);
      return templateHelper
          .render(
              creativeData.templateData.data,
              this.iframe.contentWindow.document.body)
          .then(renderedElement => {
            const {analyticsConfig} = creativeData.templateData;
            if (analyticsConfig) {
              templateHelper.insertAnalytics(renderedElement, analyticsConfig);
            }
            this.iframe.contentWindow.document.body./*OK*/innerHTML =
                renderedElement./*OK*/outerHTML;
          });
    });
  }
}
