import {devAssert} from '#utils/log';

import {getAmpAdTemplateHelper} from './amp-ad-template-helper';
import {Renderer} from './amp-ad-type-defs';
import {renderCreativeIntoFriendlyFrame} from './friendly-frame-util';

/**
 * @typedef {{
 *   size: ./amp-ad-type-defs.LayoutInfoDef,
 *   adUrl: string,
 *   creativeMetadata: ./amp-ad-type-defs.CreativeMetaDataDef,
 *   templateData: ./amp-ad-type-defs.AmpTemplateCreativeDef,
 * }}
 */
export let CreativeData;

/**
 * Render AMP creative into FriendlyFrame via templatization.
 */
export class TemplateRenderer extends Renderer {
  /**
   * Constructs a TemplateRenderer instance.
   */
  constructor() {
    super();
  }

  /**
   * Retrieve the content document depending on browser support
   *
   * @param {*} iframe
   *   The iframe to retrieve the document of
   * @return {*}
   */
  getDocument(iframe) {
    return iframe.contentDocument || iframe.contentWindow.document;
  }

  /** @override */
  render(context, element, creativeData) {
    creativeData = /** @type {CreativeData} */ (creativeData);

    const {adUrl, size} = context;
    const {creativeMetadata} = creativeData;

    devAssert(size, 'missing creative size');
    devAssert(adUrl, 'missing ad request url');

    return renderCreativeIntoFriendlyFrame(
      adUrl,
      size,
      element,
      creativeMetadata
    ).then((iframe) => {
      const templateData =
        /** @type {!./amp-ad-type-defs.AmpTemplateCreativeDef} */ (
          creativeData.templateData
        );
      const {data} = templateData;
      if (!data) {
        return Promise.resolve();
      }
      const templateHelper = getAmpAdTemplateHelper(element);
      return templateHelper
        .render(data, this.getDocument(iframe).body)
        .then((renderedElement) => {
          const {analytics} = templateData;
          if (analytics) {
            templateHelper.insertAnalytics(renderedElement, analytics);
          }
          // This element must exist, or #render() would have thrown.
          const templateElement =
            this.getDocument(iframe).querySelector('template');
          templateElement.parentNode.replaceChild(
            renderedElement,
            templateElement
          );
        });
    });
  }
}
