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
import {
  fromStructuredCloneable,
  verifyAmpCORSHeaders,
} from './utils/xhr-utils';
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
   * @param {!FetchRequestDef} request The fetch/XHR related data.
   * @param {?SsrTemplateDef=} opt_templates Response templates to pass into
   *     the payload. If provided, finding the template in the passed in
   *     element is not attempted.
   * @param {!Object=} opt_attributes Additional JSON to send to viewer.
   * return {!Promise<{data:{?JsonObject|string|undefined}}>}
   */
  fetchAndRenderTemplate(
    element, request, opt_templates = null, opt_attributes = {}) {
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
    return this.viewer_.sendMessageAwaitResponse(
        'viewerRenderTemplate',
        this.buildPayload_(
            request,
            mustacheTemplate,
            opt_templates,
            opt_attributes
        ));
  }

  /**
   * @param {!FetchRequestDef} request
   * @param {string|undefined} mustacheTemplate
   * @param {?SsrTemplateDef=} opt_templates
   * @param {!Object=} opt_attributes
   * @return {!JsonObject}
   * @private
   */
  buildPayload_(
    request, mustacheTemplate, opt_templates, opt_attributes = {}) {
    const ampComponent = dict({
      'type': this.sourceComponent_,
      'successTemplate': {
        'type': 'amp-mustache',
        'payload': opt_templates
          ? this.xmls_.serializeToString(opt_templates['successTemplate'])
          : mustacheTemplate,
      },
      'errorTemplate': {
        'type': 'amp-mustache',
        'payload': opt_templates
          ? this.xmls_.serializeToString(
              opt_templates['errorTemplate']) : null,
      },
    });
    const data = dict({
      'originalRequest':
          toStructuredCloneable(request.xhrUrl, request.fetchOpt),
      'ampComponent': ampComponent,
    });

    const additionalAttr = opt_attributes && Object.keys(opt_attributes);
    if (additionalAttr) {
      Object.keys(opt_attributes).forEach(key => {
        data[key] = opt_attributes[key];
      });
    }

    return data;
  }

  /**
   * Constructs the fetch response and verifies AMP CORS headers.
   * @param {!Window} win
   * @param {!JsonObject|string|undefined} response
   * @param {!FetchRequestDef|string} request
   */
  verifySsrResponse(win, response, request) {
    verifyAmpCORSHeaders(
        win,
        fromStructuredCloneable(
            response,
            request.fetchOpt.responseType),
        request.fetchOpt);
  }
}
