import {urlService} from './url';

/**
 * @param {string} metaName
 * @return {string|null}
 */
export function getMetaByName(metaName) {
  const metas = self.document.head.querySelectorAll('meta[name]');
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

export const docInfo = {
  /**
   * @return {string}
   */
  get sourceUrl() {
    return self.location.href;
  },

  /**
   * @return {string}
   */
  get canonicalUrl() {
    const rootNode = self.document;

    let canonicalUrl = rootNode?.AMP?.canonicalUrl;
    if (!canonicalUrl) {
      const canonicalTag = rootNode.querySelector('link[rel=canonical]');
      canonicalUrl = canonicalTag
        ? urlService.parse(canonicalTag.href).href
        : this.sourceUrl;
    }

    return canonicalUrl;
  },
};
