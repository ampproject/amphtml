import {DocumentScopeBase} from '#preact/utils/documentScopeBase';

import {UrlUtils} from './url';

export class DocumentInfo extends DocumentScopeBase {
  static forDoc = DocumentScopeBase.forDoc;

  /**
   * Returns the contents of a meta tag with a matching name
   *
   * @param metaName
   */
  getMetaByName(metaName: string): string | null {
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
   * Gets the URL of the document
   */
  get sourceUrl(): string {
    return this.ownerDocument.location.href;
  }

  /**
   * Gets the canonical URL of the current document
   */
  get canonicalUrl() {
    const canonicalUrl = (this.ownerDocument as any).AMP?.canonicalUrl;
    if (canonicalUrl) {
      return canonicalUrl;
    }

    const canonicalTag: HTMLLinkElement | null =
      this.ownerDocument.querySelector('link[rel=canonical]');
    if (canonicalTag) {
      return UrlUtils.forDoc(this.ownerDocument).parse(canonicalTag.href).href;
    }

    return this.sourceUrl;
  }
}
