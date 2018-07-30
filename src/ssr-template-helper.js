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

import {Capability} from './service/viewer-impl';
import {FormDataWrapper} from './form-data-wrapper';
import {addParamsToUrl} from './url';
import {deepMerge, dict, map} from './utils/object';
import {iterateCursor} from './dom';
import {toStructuredCloneable} from './service/xhr-impl';

/** The attributes we allow to be sent to the viewer. */
const ATTRS_TO_SEND_TO_VIEWER = {
  'amp-list': ['src', 'single-item', 'max-items'],
  'amp-form': ['action-xhr'],
};

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
    return this.viewer_.canRenderTemplates();
  }

  /**
   * Proxies xhr and template rendering to the viewer and renders the response.
   * @param {!Element} element
   * @param {!./service/xhr-impl.FetchData} fetchData
   * @param {?SsrTemplateDef=} opt_templates Response templates to pass into
   *     the payload. If provided, finding the template in the passed in
   *     element is not attempted.
   * return {!Promise<{data:{?JsonObject|string|undefined}}>}
   */
  fetchAndRenderTemplate(element, fetchData, opt_templates = null) {
    const inputsAsJson = this.getElementInputsAsJson_(element);
    const elementAttrsAsJson =
        this.getElementAttributesAsJson_(element);
    elementAttrsAsJson['inputData'] = inputsAsJson;
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
      'data': elementAttrsAsJson,
      'sourceAmpComponent': this.sourceComponent_,
    });
    data['successTemplate'] = opt_templates
      ? this.xmls_.serializeToString(opt_templates['successTemplate'])
      : mustacheTemplate;
    data['errorTemplate'] = opt_templates
      ? this.xmls_.serializeToString(opt_templates['errorTemplate'])
      : null;

    return this.viewer_.sendMessageAwaitResponse(
        Capability.VIEWER_RENDER_TEMPLATE, data);
  }

  /**
   * Returns the element's contained inputs and values in json format.
   * @param {!Element} element
   * @return {!JsonObject}
   */
  getElementInputsAsJson_(element) {
    const inputs = element.querySelectorAll('input');
    const inputsAsJson = map();
    iterateCursor(inputs, input => {
      inputsAsJson[input.name] = input.value;
    });
    return inputsAsJson;
  }

  /**
   * Returns the element's whitelisted attributes in json format.
   * @param {!Element} element
   * @return {!JsonObject}
   */
  getElementAttributesAsJson_(element) {
    const attrsAsJson = map();
    if (element.attributes.length > 0) {
      /** {!Array} */
      const whiteList = ATTRS_TO_SEND_TO_VIEWER[this.sourceComponent_];
      whiteList.forEach(attribute => {
        if (element.hasAttribute(attribute)) {
          attrsAsJson[attribute.name] = attribute.value;
        }
      });
    }
    return attrsAsJson;
  }
}
