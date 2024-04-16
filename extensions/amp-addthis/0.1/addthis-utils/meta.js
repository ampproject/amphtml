/**
 * Returns a NodeList of Meta Elements (not an Array)
 * @param {Document} doc
 * @return {NodeList}
 */
export const getMetaElements = (doc) => doc.head.querySelectorAll('meta');

export const getDetailsForMeta = (meta) => {
  const name = meta.getAttribute('property') || meta.name || '';
  const lowerName = name.toLowerCase();
  const content = meta.content || '';

  return {
    name: lowerName,
    content,
  };
};

export const getOgImage = (doc) => {
  const ogImage = doc.head.querySelector('meta[property="og:image"]');

  if (ogImage) {
    return ogImage.content;
  }
  return '';
};
