import {isArray} from '#core/types';

import {userAssert} from '#utils/log';

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
   * @param {!./service/viewer-interface.ViewerInterface} viewer
   * @param {!./service/template-impl.Templates} templates
   */
  constructor(sourceComponent, viewer, templates) {
    /** @private @const */
    this.viewer_ = viewer;

    /** @private @const */
    this.templates_ = templates;

    /** @private @const */
    this.sourceComponent_ = sourceComponent;
  }

  /**
   * Whether the viewer should render templates. A doc-level opt in as
   * trusted viewers must set this capability explicitly, as a security
   * measure for potential abuse of feature.
   * @return {boolean}
   */
  isEnabled() {
    const ampdoc = this.viewer_.getAmpDoc();
    if (ampdoc.isSingleDoc()) {
      const htmlElement = ampdoc.getRootNode().documentElement;
      if (htmlElement.hasAttribute('allow-viewer-render-template')) {
        return this.viewer_.hasCapability('viewerRenderTemplate');
      }
    }
    return false;
  }

  /**
   * Asserts that the viewer is from a trusted origin.
   *
   * @param {!Element} element
   * @return {!Promise}
   */
  assertTrustedViewer(element) {
    return this.viewer_.isTrustedViewer().then((trusted) => {
      userAssert(
        trusted,
        'Refused to attempt SSR in untrusted viewer: ',
        element
      );
    });
  }

  /**
   * Proxies xhr and template rendering to the viewer.
   * Returns the renderable response, for use with applySsrOrCsrTemplate.
   * @param {!Element} element
   * @param {!FetchRequestDef} request The fetch/XHR related data.
   * @param {?SsrTemplateDef=} opt_templates Response templates to pass into
   *     the payload. If provided, finding the template in the passed in
   *     element is not attempted.
   * @param {!Object=} opt_attributes Additional JSON to send to viewer.
   * @return {!Promise<?JsonObject|string|undefined>}
   */
  ssr(element, request, opt_templates = null, opt_attributes = {}) {
    let mustacheTemplate;
    if (!opt_templates) {
      mustacheTemplate = this.templates_.maybeFindTemplate(element);
    }
    return this.assertTrustedViewer(element).then(() => {
      return this.viewer_.sendMessageAwaitResponse(
        'viewerRenderTemplate',
        this.buildPayload_(
          request,
          mustacheTemplate,
          opt_templates,
          opt_attributes
        )
      );
    });
  }

  /**
   * Render provided data for the template in the given element.
   * If SSR is supported, data is assumed to be from ssr() above.
   * @param {!Element} element
   * @param {(?JsonObject|string|undefined|!Array)} data
   * @return {!Promise<(!Element|!Array<!Element>)>}
   */
  applySsrOrCsrTemplate(element, data) {
    let renderTemplatePromise;
    if (this.isEnabled()) {
      userAssert(
        typeof data['html'] === 'string',
        'Skipping template rendering due to failed fetch'
      );
      renderTemplatePromise = this.assertTrustedViewer(element).then(() => {
        return this.templates_.findAndSetHtmlForTemplate(
          element,
          /** @type {string} */ (data['html'])
        );
      });
    } else if (isArray(data)) {
      renderTemplatePromise = this.templates_.findAndRenderTemplateArray(
        element,
        /** @type {!Array} */ (data)
      );
    } else {
      renderTemplatePromise = this.templates_.findAndRenderTemplate(
        element,
        /** @type {!JsonObject} */ (data)
      );
    }

    return renderTemplatePromise;
  }

  /**
   * @param {!FetchRequestDef} request
   * @param {?Element|undefined} mustacheTemplate
   * @param {?SsrTemplateDef=} opt_templates
   * @param {!Object=} opt_attributes
   * @return {!JsonObject}
   * @private
   */
  buildPayload_(request, mustacheTemplate, opt_templates, opt_attributes = {}) {
    const ampComponent = {'type': this.sourceComponent_};

    const successTemplateKey = 'successTemplate';
    const successTemplate =
      opt_templates && opt_templates[successTemplateKey]
        ? opt_templates[successTemplateKey]
        : mustacheTemplate;
    if (successTemplate) {
      ampComponent[successTemplateKey] = {
        'type': 'amp-mustache',
        'payload': successTemplate./*REVIEW*/ innerHTML,
      };
    }

    const errorTemplateKey = 'errorTemplate';
    const errorTemplate =
      opt_templates && opt_templates[errorTemplateKey]
        ? opt_templates[errorTemplateKey]
        : null;
    if (errorTemplate) {
      ampComponent[errorTemplateKey] = {
        'type': 'amp-mustache',
        'payload': errorTemplate./*REVIEW*/ innerHTML,
      };
    }

    if (opt_attributes) {
      Object.assign(ampComponent, opt_attributes);
    }

    const data = {
      'originalRequest': toStructuredCloneable(
        request.xhrUrl,
        request.fetchOpt
      ),
      'ampComponent': ampComponent,
    };

    return data;
  }
}
