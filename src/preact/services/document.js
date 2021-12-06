import { urlService } from "./url";

class DocumentService {
  getMetaByName(metaName) {
    const metas = window.document.head.querySelectorAll('meta[name]');
    for (let i = 0; i < metas.length; i++) {
      const meta = metas[i];
      const name = meta.getAttribute('name');
      if (name === metaName) {
        const content = meta.getAttribute('content');
        if (content !== undefined) {
          return content;
        }
      }
    }
    return null;
  }
}
export const docService = new DocumentService();


class DocumentInfoService{
  get sourceUrl() {
    return window.location.href;
  }
  get canonicalUrl() {
    const rootNode = window.document;

    let canonicalUrl = rootNode?.AMP?.canonicalUrl;
    if (!canonicalUrl) {
      const canonicalTag = rootNode.querySelector('link[rel=canonical]');
      canonicalUrl = canonicalTag
        ? urlService.parse(canonicalTag.href).href
        : this.sourceUrl;
    }

    return canonicalUrl;
  }
}
export const docInfoService = new DocumentInfoService();
