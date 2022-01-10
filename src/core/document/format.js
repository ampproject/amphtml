/**
 * Checks that the document is of an AMP format type.
 * @param {Array<string>} formats
 * @param {Document} doc
 * @return {boolean}
 */
function isAmpFormatType(formats, doc) {
  const html = doc.documentElement;
  const isFormatType = formats.some((format) => html.hasAttribute(format));
  return isFormatType;
}

/**
 * @param {Document} doc
 * @return {boolean}
 */
export function isAmp4Email(doc) {
  return isAmpFormatType(['⚡4email', 'amp4email'], doc);
}

/**
 * @param {Document} doc
 * @return {boolean}
 */
export function isAmphtml(doc) {
  return isAmpFormatType(['⚡', 'amp'], doc);
}
