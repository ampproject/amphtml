/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
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

import {assert} from './asserts';
import {childElementByTag} from './dom';

/**
 * For the set of decisions made on templating see:
 * {@link https://docs.google.com/document/d/1q-5MPQHnOHLF_uL7lQsGZdzuBgrPTkCy2PdRP-YCbOw/edit#}
 */


/**
 * @typedef {function(new:!BaseTemplate, !Element)}
 */
const TemplateClass = {};

/**
 * A map from template type to template's class promise.
 * @const {!Object<string, !Promise<!TemplateClass>>}
 */
const templateClassMap = {};

/**
 * A map from template type to template's class promise. This is a transient
 * storage. As soon as the template class loaded, the entry is removed.
 * @const {!Object<string, function(!TemplateClass)>}
 */
const templateClassResolvers = {};

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

    this.compileCallback();
  }

  /** @protected @return {!Window} */
  getWin() {
    return this.element.ownerDocument.defaultView;
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
   * @param {!Object<string, *>} data
   * @return {!Element|!Promise<!Element>}
   */
  render(data) {
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
          singleElement = /** @type {!Element} */ (n);
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
 * Renders the specified element template using the supplied data.
 * @param {!Element} templateElement
 * @param {!Object<string, *>} data
 * @return {!Promise<!Element>}
 */
export function renderTemplate(templateElement, data) {
  return getImplementation(templateElement).then(impl => {
    return impl.render(data);
  });
}


/**
 * Discovers the template for the specified parent and renders it using the
 * supplied data. The template can be specified either via "template" attribute
 * or as a child "template" element. When specified via "template" attribute,
 * the value indicates the ID of the template element.
 * @param {!Element} parent
 * @param {!Object<string, *>} data
 * @return {!Promise<!Element>}
 */
export function findAndRenderTemplate(parent, data) {
  let templateElement = null;
  const templateId = parent.getAttribute('template');
  if (templateId) {
    templateElement = parent.ownerDocument.getElementById(templateId);
  } else {
    templateElement = childElementByTag(parent, 'template');
  }
  assert(templateElement, 'Template not found for %s', parent);
  assert(templateElement.tagName == 'TEMPLATE',
      'Template element must be a "template" tag %s', templateElement);
  return renderTemplate(templateElement, data);
}


/**
 * Returns the promise that will eventually yield the template implementation
 * for the specified template element.
 * @param {!Element} element
 * @return {!Promise<!BaseTemplate>}
 */
function getImplementation(element) {
  const impl = element[PROP_];
  if (impl) {
    return Promise.resolve(impl);
  }

  const type = assert(element.getAttribute('type'),
      'Type must be specified: %s', element);

  let promise = element[PROP_PROMISE_];
  if (promise) {
    return promise;
  }

  promise = waitForTemplateClass(element, type).then(templateClass => {
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
 * @return {!Promise<!TemplateClass>}
 */
function waitForTemplateClass(element, type) {
  if (templateClassMap[type]) {
    return templateClassMap[type];
  }

  checkTemplateDeclared(element, type);
  let aResolve;
  const promise = new Promise((resolve, reject) => {
    aResolve = resolve;
  });
  templateClassMap[type] = promise;
  templateClassResolvers[type] = aResolve;
  return promise;
}


/**
 * Checks that the template type has actually been declared by a
 * `<script custom-template=$type>` tag in the head.
 * @param {!Element} element
 * @param {string} type
 */
function checkTemplateDeclared(element, type) {
  const win = element.ownerDocument.defaultView;
  const scriptTags = win.document.querySelectorAll('script[custom-template]');
  let found = false;
  for (let i = 0; i < scriptTags.length; i++) {
    if (scriptTags[i].getAttribute('custom-template') == type) {
      found = true;
      break;
    }
  }
  assert(found,
      'Template must be declared for %s as <script custom-template=%s src=...>',
      element, type);
}


/**
 * Registers an extended template. This function should typically be called
 * through the registerTemplate method on the AMP runtime.
 * @param {!Window} win
 * @param {string} type
 * @param {!TemplateClass} templateClass
 * @package
 */
export function registerExtendedTemplate(win, type, templateClass) {
  if (!templateClassMap[type]) {
    templateClassMap[type] = Promise.resolve(templateClass);
  } else {
    const resolver = templateClassResolvers[type];
    assert(resolver, 'Duplicate template type: %s', type);
    delete templateClassResolvers[type];
    resolver(templateClass);
  }
}
