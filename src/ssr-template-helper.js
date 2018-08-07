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

import {dict} from './utils/object';
import {toStructuredCloneable} from './utils/xhr-utils';

/**
 * @typedef {{
 *   successTemplate: ?(Element|JsonObject|undefined),
 *   errorTemplate: ?(Element|JsonObject|undefined)
 * }}
 */
export let SsrTemplateDef;

/**
 * Helper, that manages the proxying of template rendering to the viewer.
 */
export class SsrTemplateHelper {

  /**
   * @param {string} sourceComponent
   * @param {!./service/viewer-impl.Viewer} viewer
   * @param {!./service/template-impl.Templates} templates
   */
  constructor(sourceComponent, viewer, templates) {

    /** @private @const */
    this.viewer_ = viewer;

    /** @private @const */
    this.templates_ = templates;

    /** @private @const {!XMLSerializer} */
    this.xmls_ = new XMLSerializer();

    /** @private @const */
    this.sourceComponent_ = sourceComponent;
  }

  /**
   * Whether the viewer can render templates.
   * @return {boolean}
   */
  isSupported() {
    return this.viewer_.hasCapability('viewerRenderTemplate');
  }

  /**
   * Proxies xhr and template rendering to the viewer and renders the response.
   * @param {!Element} element
   * @param {!./service/xhr-impl.FetchData} fetchData The fetch/XHR related data.
   * @param {?SsrTemplateDef=} opt_templates Response templates to pass into
   *     the payload. If provided, finding the template in the passed in
   *     element is not attempted.
   * return {!Promise<{data:{?JsonObject|string|undefined}}>}
   */
  fetchAndRenderTemplate(element, fetchData, opt_templates = null) {
    let mustacheTemplate;
    if (!opt_templates) {
      const template = this.templates_.maybeFindTemplate(element);
      if (template) {
        // The document fragment can't be used in the message channel API thus
        // serializeToString for a string representation of the dom tree.
        mustacheTemplate = this.xmls_.serializeToString(
            this.templates_.findTemplate(element));
      }
    }
    const data = dict({
      'originalRequest':
          toStructuredCloneable(fetchData.xhrUrl, fetchData.fetchOpt),
      'sourceAmpComponent': this.sourceComponent_,
    });
    data['successTemplate'] = opt_templates
      ? this.xmls_.serializeToString(opt_templates['successTemplate'])
      : mustacheTemplate;
    data['errorTemplate'] = opt_templates
      ? this.xmls_.serializeToString(opt_templates['errorTemplate'])
      : null;

    return this.viewer_.sendMessageAwaitResponse(
        'viewerRenderTemplate', data);
  }
}
