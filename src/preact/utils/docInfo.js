import {urlUtils} from './url';

export const docInfo = {
  /**
   * @param {string} metaName
   * @return {string|null}
   */
  getMetaByName(metaName) {
    const metas = self.document.head.querySelectorAll('meta[name]');
    return (
      Array.from(metas)
        .find(
          (meta) =>
            meta.getAttribute('name') === metaName &&
            meta.getAttribute('content')
        )
        ?.getAttribute('content') || null
    );
  },

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

    const canonicalUrl = rootNode?.AMP?.canonicalUrl;
    if (canonicalUrl) {
      return canonicalUrl;
    }

    /** @type {HTMLLinkElement | null} */
    const canonicalTag = rootNode.querySelector('link[rel=canonical]');
    if (canonicalTag) {
      return urlUtils.parse(canonicalTag.href).href;
    }

    return this.sourceUrl;
  },
};
