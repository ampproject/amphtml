import {urlService} from './url';

class DocumentService {
  /**
   * @param {string} metaName
   * @return {string|null}
   */
  getMetaByName(metaName) {
    const metas = self.window.document.head.querySelectorAll('meta[name]');
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

// eslint-disable-next-line local/no-export-side-effect
export const docService = new DocumentService();

class DocumentInfoService {
  /**
   * @return {string}
   */
  get sourceUrl() {
    return self.window.location.href;
  }

  /**
   * @return {string}
   */
  get canonicalUrl() {
    const rootNode = self.window.document;

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

// eslint-disable-next-line local/no-export-side-effect
export const docInfoService = new DocumentInfoService();
