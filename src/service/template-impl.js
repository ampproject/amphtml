/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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

import {childElementByTag} from '../dom';
import {getService, registerServiceBuilder} from '../service';
import {dev, user} from '../log';


/**
 * @fileoverview
 * For the set of decisions made on templating see:
 * {@link https://docs.google.com/document/d/1q-5MPQHnOHLF_uL7lQsGZdzuBgrPTkCy2PdRP-YCbOw/edit#}
 */


/**
 * @typedef {function(new:BaseTemplate, !Element)}
 */
let TemplateClassDef;

/** @private @const {string} */
const PROP_ = '__AMP_IMPL_';

/** @private @const {string} */
const PROP_PROMISE_ = '__AMP_WAIT_';


/**
 * The interface that is implemented by all templates.
 */
export class BaseTemplate {

  /** @param {!Element} element */
  constructor(element) {
    /** @public @const */
    this.element = element;

    /** @public @const {!Window} */
    this.win = element.ownerDocument.defaultView;

    this.compileCallback();
  }

  /**
   * Override in subclass if the element needs to compile the template.
   * @protected
   */
  compileCallback() {
    // Subclasses may override.
  }

  /**
   * To be implemented by subclasses.
   * @param {!JSONType} unusedData
   * @return {!Element}
   */
  render(unusedData) {
    throw new Error('Not implemented');
  }

  /**
   * Helps the template implementation to unwrap the root element. The root
   * element can be unwrapped only when it contains a single element or a
   * single element surrounded by empty text nodes.
   * @param {!Element} root
   * @return {!Element}
   * @protected @final
   */
  unwrap(root) {
    let singleElement = null;
    for (let n = root.firstChild; n != null; n = n.nextSibling) {
      if (n.nodeType == /* TEXT */ 3) {
        if (n.textContent.trim()) {
          // Non-empty text node - can't unwrap.
          singleElement = null;
          break;
        }
      } else if (n.nodeType == /* COMMENT */ 8) {
        // Ignore comments.
      } else if (n.nodeType == /* ELEMENT */ 1) {
        if (!singleElement) {
          singleElement = dev().assertElement(n);
        } else {
          // This is not the first element - can't unwrap.
          singleElement = null;
          break;
        }
      } else {
        singleElement = null;
      }
    }
    return singleElement || root;
  }
}


/**
 */
export class Templates {
  /** @param {!Window} win */
  constructor(win) {
    /** @private @const {!Window} */
    this.win_ = win;

    /**
     * A map from template type to template's class promise.
     * @private @const {!Object<string, !Promise<!TemplateClassDef>>}
     */
    this.templateClassMap_ = {};

    /**
     * A map from template type to template's class promise. This is a transient
     * storage. As soon as the template class loaded, the entry is removed.
     * @private @const {!Object<string, function(!TemplateClassDef)>}
     */
    this.templateClassResolvers_ = {};

    /** @type {!Object<string, boolean>|undefined} */
    this.declaredTemplates_ = undefined;
  }

  /**
   * Renders the specified template element using the supplied data.
   * @param {!Element} templateElement
   * @param {!JSONType} data
   * @return {!Promise<!Element>}
   */
  renderTemplate(templateElement, data) {
    return this.getImplementation_(templateElement).then(impl => {
      return this.render_(impl, data);
    });
  }

  /**
   * Renders the specified template element using the supplied array of data
   * and returns an array of resulting elements.
   * @param {!Element} templateElement
   * @param {!Array<!JSONType>} array
   * @return {!Promise<!Array<!Element>>}
   */
  renderTemplateArray(templateElement, array) {
    if (array.length == 0) {
      return Promise.resolve([]);
    }
    return this.getImplementation_(templateElement).then(impl => {
      return array.map(item => {
        return this.render_(impl, item);
      });
    });
  }

  /**
   * Discovers the template for the specified parent and renders it using the
   * supplied data. The template can be specified either via "template"
   * attribute  or as a child "template" element. When specified via "template"
   * attribute, the value indicates the ID of the template element.
   * @param {!Element} parent
   * @param {!JSONType} data
   * @return {!Promise<!Element>}
   */
  findAndRenderTemplate(parent, data) {
    return this.renderTemplate(this.findTemplate_(parent), data);
  }

  /**
   * Discovers the template for the specified parent and renders it using the
   * supplied array of data. The template can be specified either via "template"
   * attribute or as a child "template" element. When specified via "template"
   * attribute, the value indicates the ID of the template element. Returns
   * the array of the rendered elements.
   * @param {!Element} parent
   * @param {!Array<!JSONType>} array
   * @return {!Promise<!Array<!Element>>}
   */
  findAndRenderTemplateArray(parent, array) {
    return this.renderTemplateArray(this.findTemplate_(parent), array);
  }

  /**
   * Detect if a template is present inside the parent.
   * @param {!Element} parent
   * @return {boolean}
   */
  hasTemplate(parent) {
    return !!this.maybeFindTemplate_(parent);
  }

  /**
   * Find a specified template inside the parent. Fail if the template is
   * not present.
   * @param {!Element} parent
   * @return {!Element}
   * @private
   */
  findTemplate_(parent) {
    const templateElement = this.maybeFindTemplate_(parent);
    user().assert(templateElement, 'Template not found for %s', parent);
    user().assert(templateElement.tagName == 'TEMPLATE',
        'Template element must be a "template" tag %s', templateElement);
    return templateElement;
  }

  /**
   * Find a specified template inside the parent. Returns null if not present.
   * The template can be specified either via "template" attribute or as a
   * child "template" element. When specified via "template" attribute,
   * the value indicates the ID of the template element.
   * @param {!Element} parent
   * @return {?Element}
   * @private
   */
  maybeFindTemplate_(parent) {
    const templateId = parent.getAttribute('template');
    if (templateId) {
      return parent.ownerDocument.getElementById(templateId);
    } else {
      return childElementByTag(parent, 'template');
    }
  }

  /**
   * Returns the promise that will eventually yield the template implementation
   * for the specified template element.
   * @param {!Element} element
   * @return {!Promise<!BaseTemplate>}
   * @private
   */
  getImplementation_(element) {
    /** @const {!BaseTemplate} */
    const impl = element[PROP_];
    if (impl) {
      return Promise.resolve(impl);
    }

    const type = user().assert(element.getAttribute('type'),
        'Type must be specified: %s', element);

    let promise = element[PROP_PROMISE_];
    if (promise) {
      return promise;
    }

    promise = this.waitForTemplateClass_(element, type).then(templateClass => {
      const impl = element[PROP_] = new templateClass(element);
      delete element[PROP_PROMISE_];
      return impl;
    });
    element[PROP_PROMISE_] = promise;
    return promise;
  }

  /**
   * Returns the promise that will eventually yield the template class. This will
   * wait until the actual template script has been downloaded and parsed.
   * @param {!Element} element
   * @param {string} type
   * @return {!Promise<!TemplateClassDef>}
   * @private
   */
  waitForTemplateClass_(element, type) {
    if (this.templateClassMap_[type]) {
      return this.templateClassMap_[type];
    }

    this.checkTemplateDeclared_(element, type);
    let aResolve;
    const promise = new Promise((resolve, unusedReject) => {
      aResolve = resolve;
    });
    this.templateClassMap_[type] = promise;
    this.templateClassResolvers_[type] = aResolve;
    return promise;
  }


  /**
   * Checks that the template type has actually been declared by a
   * `<script custom-template=$type>` tag in the head.
   * @param {!Element} element
   * @param {string} type
   * @private
   */
  checkTemplateDeclared_(element, type) {
    if (!this.declaredTemplates_) {
      this.declaredTemplates_ = this.win_.Object.create(null);
      const scriptTags = this.win_.document.querySelectorAll(
          'script[custom-template]');
      for (let i = 0; i < scriptTags.length; i++) {
        this.declaredTemplates_[scriptTags[i].getAttribute(
            'custom-template')] = true;
      }
    }
    user().assert(this.declaredTemplates_[type],
        'Template must be declared for %s as <script custom-template=%s>',
        element, type);
  }

  /**
   * Registers an extended template. This function should typically be called
   * through the registerTemplate method on the AMP runtime.
   * @param {string} type
   * @param {!TemplateClassDef} templateClass
   * @private
   */
  registerTemplate_(type, templateClass) {
    if (!this.templateClassMap_[type]) {
      this.templateClassMap_[type] = Promise.resolve(templateClass);
    } else {
      const resolver = this.templateClassResolvers_[type];
      user().assert(resolver, 'Duplicate template type: %s', type);
      delete this.templateClassResolvers_[type];
      resolver(templateClass);
    }
  }

  /**
   * @param {!BaseTemplate} impl
   * @param {!JSONType} data
   * @private
   */
  render_(impl, data) {
    return impl.render(data);
  }
}


/**
 * @param {!Window} win
 */
export function installTemplatesService(win) {
  registerServiceBuilder(win, 'templates', win => new Templates(win));
}

/**
 * Registers an extended template. This function should typically be called
 * through the registerTemplate method on the AMP runtime.
 * @param {!Window} win
 * @param {string} type
 * @param {!TemplateClassDef} templateClass
 * @package
 */
export function registerExtendedTemplate(win, type, templateClass) {
  const templatesService = getService(win, 'templates');
  return templatesService.registerTemplate_(type, templateClass);
}
