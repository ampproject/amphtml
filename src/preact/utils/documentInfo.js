import {DocumentScopeBase} from '#preact/utils/documentScopeBase';

import {UrlUtils} from './url';

export class DocumentInfo extends DocumentScopeBase {
  static forDoc = DocumentScopeBase.forDoc;

  /**
   * @param {string} metaName
   * @return {string|null}
   */
  getMetaByName(metaName) {
    const metas = this.ownerDocument.head.querySelectorAll('meta[name]');
    return (
      Array.from(metas)
        .find(
          (meta) =>
            meta.getAttribute('name') === metaName &&
            meta.getAttribute('content')
        )
        ?.getAttribute('content') || null
    );
  }

  /**
   * @return {string}
   */
  get sourceUrl() {
    return this.ownerDocument.location.href;
  }

  /**
   * @return {string}
   */
  get canonicalUrl() {
    const canonicalUrl = this.ownerDocument.AMP?.canonicalUrl;
    if (canonicalUrl) {
      return canonicalUrl;
    }

    const canonicalTag = this.ownerDocument.querySelector(
      'link[rel=canonical]'
    );
    if (canonicalTag) {
      return UrlUtils.forDoc(this.ownerDocument).parse(canonicalTag.href).href;
    }

    return this.sourceUrl;
  }
}
