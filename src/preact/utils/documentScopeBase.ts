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
  // eslint-disable-next-line no-restricted-syntax
  protected ownerDocument: Document;
  constructor(ownerDocument: Document) {
    this.ownerDocument = ownerDocument;
  }

  /**
   * Utility for constructing this class.
   * This is semantically preferred over using 'new', because 'new' implies a performance overhead.
   */
  static forDoc<T extends Instantiable>(
    this: T,
    ownerDocument: Document
  ): InstanceType<T> {
    const SubClass = this;
    return new SubClass(ownerDocument) as InstanceType<T>;
  }
}

type Instantiable = {
  new (ownerDocument: Document): unknown;
};
