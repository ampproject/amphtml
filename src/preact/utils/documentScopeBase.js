/**
 * A simple utility class for tracking the correct ownerDocument.
 *
 * @example
 * class SomeUtility extends DocumentScopeBase {
 *   static forDoc = DocumentScopeBase.forDoc;
 *
 *   findMeta(name) {
 *     return this.doc_.head.querySelector(`meta[name=${name}]`);
 *   }
 * }
 *
 * // Example Usage:
 * const ownerDocument = useOwnerDocument();
 * SomeUtility.forDoc(ownerDocument).findMeta('name');
 */
export class DocumentScopeBase {
  /**
   * @param {Document} ownerDocument
   */
  constructor(ownerDocument) {
    /** @protected */
    this.doc_ = ownerDocument;
  }

  /**
   * Utility for constructing this class.
   * This is semantically preferred over using 'new', because 'new' implies a performance overhead.
   * @param {Document} ownerDocument
   * @return {new this}
   */
  static forDoc(ownerDocument) {
    return new this(ownerDocument);
  }
}
