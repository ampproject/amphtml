/**
 * A simple utility class for tracking the correct ownerDocument.
 *
 * @example
 * class SomeUtility extends DocumentScopeBase {
 *   static forDoc = DocumentScopeBase.forDoc;
 *   // or, to persist the instance:
 *   static forDoc = DocumentScopeBase.forDocWithCache;
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
   * @protected
   */
  constructor(ownerDocument) {
    /** @protected */
    this.ownerDocument = ownerDocument;
  }

  /**
   * Utility for constructing this class.
   * This is semantically preferred over using 'new', because 'new' implies a performance overhead.
   * @param {Document} ownerDocument
   * @return {new this}
   */
  static forDoc(ownerDocument) {
    const SubClass = this;
    return new SubClass(ownerDocument);
  }
}
