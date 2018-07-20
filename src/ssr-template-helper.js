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
import {dict, map} from './utils/object';
import {iterateCursor} from './dom';

/** The attributes we allow to be sent to the viewer. */
const ATTRS_TO_SEND_TO_VIEWER = {
  'amp-list': ['src', 'single-item', 'max-items'],
  'amp-form': ['action-xhr'],
};

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
   * Proxies xhr and template rendering to the viewer and renders
   * the response.
   * @param {!Element} element
   * return {!Promise<{data:{?JsonObject|string|undefined}}>}
   */
  fetchAndRenderTemplate(element) {
    const inputsAsJson = this.getElementInputsAsJson_(element);
    const elementAttrsAsJson =
        this.getElementAttributesAsJson_(element);
    elementAttrsAsJson['inputData'] = inputsAsJson;
    const template = this.templates_.maybeFindTemplate(element);
    let mustacheTemplate;
    if (template) {
      // The document fragment can't be used in the message channel API thus
      // serializeToString for a string representation of the dom tree.
      mustacheTemplate = this.xmls_.serializeToString(
          this.templates_.findTemplate(element));
    }
    const data = dict({
      'data': elementAttrsAsJson,
      'mustacheTemplate': mustacheTemplate,
      'sourceAmpComponent': this.sourceComponent_,
    });
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
   * Returns the element's attributes in json format.
   * @param {!Element} element
   * @return {!JsonObject}
   */
  getElementAttributesAsJson_(element) {
    const attrsAsJson = map();
    if (element.attributes.length > 0) {
      const {attributes} = element;
      /** {!Array} */
      const whiteList = ATTRS_TO_SEND_TO_VIEWER[this.sourceComponent_];
      iterateCursor(attributes, attribute => {
        if (whiteList.indexOf(attribute.name) != -1) {
          attrsAsJson[attribute.name] = attribute.value;
        }
      });
    }
    return attrsAsJson;
  }

}
