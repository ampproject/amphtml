import {Deferred} from '#core/data-structures/promise';
import {rootNodeFor} from '#core/dom';
import {scopedQuerySelector} from '#core/dom/query';

import {userAssert} from '#utils/log';

import {
  getServiceForDoc,
  registerServiceBuilderForDoc,
} from '../service-helpers';

/**
 * @fileoverview
 * For the set of decisions made on templating see:
 * {@link https://docs.google.com/document/d/1q-5MPQHnOHLF_uL7lQsGZdzuBgrPTkCy2PdRP-YCbOw/edit#}
 */

/** @private @const {string} */
const PROP_ = '__AMP_IMPL_';

/** @private @const {string} */
const PROP_PROMISE_ = '__AMP_WAIT_';

/** @private @const {function()} */
const EMPTY_FUNC = () => {};

/**
 */
export class Templates {
  /** @param {!./ampdoc-impl.AmpDoc} ampdoc */
  constructor(ampdoc) {
    /** @private @const */
    this.ampdoc_ = ampdoc;

    /**
     * A map from template type to template's class promise.
     * @private @const {!{[key: string]: !Promise<typeof ../base-template.BaseTemplate>}}
     */
    this.templateClassMap_ = {};

    /**
     * A map from template type to template's class promise. This is a transient
     * storage. As soon as the template class loaded, the entry is removed.
     * @private @const {!{[key: string]: function(typeof ../base-template.BaseTemplate)}}
     */
    this.templateClassResolvers_ = {};
  }

  /**
   * Waits for template to be fully initialized.
   * @param {!Element} templateElement
   * @return {!Promise}
   */
  whenReady(templateElement) {
    return this.getImplementation_(templateElement).then(EMPTY_FUNC);
  }

  /**
   * Inserts the specified template element.
   * @param {!Element} templateElement
   * @param {string} html
   * @return {!Promise<(!Element|!Array<!Element>)>}
   */
  setHtmlForTemplate(templateElement, html) {
    return this.getImplementation_(templateElement).then((impl) => {
      return this.setHtml_(impl, html);
    });
  }

  /**
   * Renders the specified template element using the supplied data.
   * @param {!Element} templateElement
   * @param {!JsonObject} data
   * @return {!Promise<!Element>}
   */
  renderTemplate(templateElement, data) {
    return this.getImplementation_(templateElement).then((impl) => {
      return this.render_(impl, data);
    });
  }

  /**
   * Renders the specified template element using the supplied data.
   * @param {!Element} templateElement
   * @param {!JsonObject} data
   * @return {!Promise<!Element>}
   */
  renderTemplateAsString(templateElement, data) {
    return this.getImplementation_(templateElement).then((impl) => {
      return impl.renderAsString(data);
    });
  }

  /**
   * Resolves to a reusable template renderer.
   *
   * @param {!Element} templateElement
   * @return {Promise<{
   *   renderAsString: function(*=): string
   * }>}
   */
  getTemplateRenderer(templateElement) {
    return this.getImplementation_(templateElement).then((impl) => {
      const renderer = {
        renderAsString: (data) => impl.renderAsString(data),
      };
      return renderer;
    });
  }

  /**
   * Renders the specified template element using the supplied array of data
   * and returns an array of resulting elements.
   * @param {!Element} templateElement
   * @param {!Array<!JsonObject>} array
   * @return {!Promise<!Array<!Element>>}
   */
  renderTemplateArray(templateElement, array) {
    if (array.length == 0) {
      return Promise.resolve([]);
    }
    return this.getImplementation_(templateElement).then((impl) => {
      return array.map((item) => {
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
   * @param {!JsonObject} data
   * @param {string=} opt_querySelector
   * @return {!Promise<!Element>}
   */
  findAndRenderTemplate(parent, data, opt_querySelector) {
    return this.renderTemplate(
      this.findTemplate(parent, opt_querySelector),
      data
    );
  }

  /**
   * Discovers the already rendered template for the specified parent and
   * inserts it in the DOM. The template can be specified either via "template"
   * attribute  or as a child "template" element. When specified via "template"
   * attribute, the value indicates the ID of the template element.
   * @param {!Element} parent
   * @param {string} html
   * @param {string=} opt_querySelector
   * @return {!Promise<(!Element|!Array<!Element>)>}
   */
  findAndSetHtmlForTemplate(parent, html, opt_querySelector) {
    return this.setHtmlForTemplate(
      this.findTemplate(parent, opt_querySelector),
      html
    );
  }

  /**
   * Discovers the template for the specified parent and renders it using the
   * supplied array of data. The template can be specified either via "template"
   * attribute or as a child "template" element. When specified via "template"
   * attribute, the value indicates the ID of the template element. Returns
   * the array of the rendered elements.
   * @param {!Element} parent
   * @param {!Array<!JsonObject>} array
   * @param {string=} opt_querySelector
   * @return {!Promise<!Array<!Element>>}
   */
  findAndRenderTemplateArray(parent, array, opt_querySelector) {
    return this.renderTemplateArray(
      this.findTemplate(parent, opt_querySelector),
      array
    );
  }

  /**
   * Detect if a template is present inside the parent.
   * @param {!Element} parent
   * @param {string=} opt_querySelector
   * @return {boolean}
   */
  hasTemplate(parent, opt_querySelector) {
    return !!this.maybeFindTemplate(parent, opt_querySelector);
  }

  /**
   * Find a specified template inside the parent. Fail if the template is
   * not present.
   * @param {!Element} parent
   * @param {string=} opt_querySelector
   * @return {!Element}
   */
  findTemplate(parent, opt_querySelector) {
    const templateElement = this.maybeFindTemplate(parent, opt_querySelector);
    userAssert(templateElement, 'Template not found for %s', parent);
    const templateTagName = templateElement.tagName;
    userAssert(
      templateTagName == 'TEMPLATE' ||
        (templateTagName == 'SCRIPT' &&
          templateElement.getAttribute('type') === 'text/plain'),
      'Template must be defined in a <template> or ' +
        '<script type="text/plain"> tag'
    );
    return templateElement;
  }

  /**
   * Find a specified template inside the parent. Returns null if not present.
   * The template can be specified either via "template" attribute or as a
   * child "template" element. When specified via "template" attribute,
   * the value indicates the ID of the template element. The template
   * can be defined either via the <template> or <script> tag.
   * @param {!Element} parent
   * @param {string=} opt_querySelector
   * @return {?Element}
   */
  maybeFindTemplate(parent, opt_querySelector) {
    const templateId = parent.getAttribute('template');
    if (templateId) {
      const rootNode = /** @type {!Document|!ShadowRoot} */ (
        rootNodeFor(parent)
      );
      return rootNode.getElementById(templateId);
    } else if (opt_querySelector) {
      return scopedQuerySelector(parent, opt_querySelector);
    } else {
      return parent.querySelector('template[type], script[type="text/plain"]');
    }
  }

  /**
   * Returns the promise that will eventually yield the template implementation
   * for the specified template element.
   * @param {!Element} element
   * @return {!Promise<!../base-template.BaseTemplate>}
   * @private
   */
  getImplementation_(element) {
    /** @const {!../base-template.BaseTemplate} */
    const impl = element[PROP_];
    if (impl) {
      return Promise.resolve(impl);
    }

    let type = '';
    const {tagName} = element;
    if (tagName == 'TEMPLATE') {
      type = element.getAttribute('type');
    } else if (tagName == 'SCRIPT') {
      type = element.getAttribute('template');
    }
    userAssert(type, 'Type must be specified: %s', element);

    let promise = element[PROP_PROMISE_];
    if (promise) {
      return promise;
    }

    promise = this.waitForTemplateClass_(element, type).then(
      (templateClass) => {
        // This is ugly workaround for https://github.com/google/closure-compiler/issues/2630.
        const Constr = /** @type {function(new:Object, !Element, !Window)} */ (
          templateClass
        );
        const impl = (element[PROP_] = new Constr(element, this.ampdoc_.win));
        delete element[PROP_PROMISE_];
        return impl;
      }
    );
    element[PROP_PROMISE_] = promise;
    return promise;
  }

  /**
   * Returns the promise that will eventually yield the template class. This
   * will wait until the actual template script has been downloaded and parsed.
   * @param {!Element} element
   * @param {string} type
   * @return {!Promise<typeof ../base-template.BaseTemplate>}
   * @private
   */
  waitForTemplateClass_(element, type) {
    if (this.templateClassMap_[type]) {
      return this.templateClassMap_[type];
    }

    const deferred = new Deferred();
    const {promise, resolve} = deferred;

    this.templateClassMap_[type] = promise;
    this.templateClassResolvers_[type] = resolve;
    return promise;
  }

  /**
   * Registers an extended template. This function should typically be called
   * through the registerTemplate method on the AMP runtime.
   * @param {string} type
   * @param {typeof ../base-template.BaseTemplate} templateClass
   * @private
   * @restricted
   */
  registerTemplate_(type, templateClass) {
    if (!this.templateClassMap_[type]) {
      this.templateClassMap_[type] = Promise.resolve(templateClass);
    } else {
      const resolver = this.templateClassResolvers_[type];
      userAssert(resolver, 'Duplicate template type: %s', type);
      delete this.templateClassResolvers_[type];
      resolver(templateClass);
    }
  }

  /**
   * @param {!../base-template.BaseTemplate} impl
   * @param {!JsonObject} data
   * @return {!Element}
   * @private
   */
  render_(impl, data) {
    return impl.render(data);
  }

  /**
   * @param {!../base-template.BaseTemplate} impl
   * @param {string} html
   * @return {!Element|!Array<!Element>}
   * @private
   */
  setHtml_(impl, html) {
    return impl.setHtml(html);
  }
}

/**
 * @param {!./ampdoc-impl.AmpDoc} ampdoc
 */
export function installTemplatesServiceForDoc(ampdoc) {
  registerServiceBuilderForDoc(ampdoc, 'templates', Templates);
}

/**
 * Registers an extended template. This function should typically be called
 * through the registerTemplate method on the AMP runtime.
 * @param {!./ampdoc-impl.AmpDoc} ampdoc
 * @param {string} type
 * @param {typeof ../base-template.BaseTemplate} templateClass
 * @return {undefined}
 */
export function registerExtendedTemplateForDoc(ampdoc, type, templateClass) {
  const templatesService = getServiceForDoc(ampdoc, 'templates');
  return templatesService.registerTemplate_(type, templateClass);
}

/**
 * @param {!Templates} templates
 * @param {string} type
 * @return {!Promise<typeof ../base-template.BaseTemplate>|undefined}
 * @visibleForTesting
 */
export function getTemplateClassForTesting(templates, type) {
  return templates.templateClassMap_[type];
}
