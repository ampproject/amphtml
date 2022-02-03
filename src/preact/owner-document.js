import {createContext, useContext} from '#preact';

// Defaults to the global document
const OwnerDocumentContext = createContext(self.document);

export const OwnerDocumentProvider = OwnerDocumentContext.Provider;

/**
 * Returns the document that owns the component.  Use this instead of the global document.
 *
 * When a component is inside a Friendly Iframe Embed, this document will be different than the global document.
 * @return {Document}
 */
export function useOwnerDocument() {
  return useContext(OwnerDocumentContext);
}
