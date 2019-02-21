
/**
 * We use this function to query for elements with XPath because the standard
 * XPath implementation that ships with the browser is unable to do
 * the following:
 * 1. Query elements beyond the ShadowDOM boundary
 * 2. Query elements inside a document that is not the main document
 * To pass the ShadowDOM boundary, we clone the ShadowDOM tree into a detached
 * document and run the XPath query against this document. Before cloning the
 * original tree, every node is assigned a unique ID which is used to match
 * the results of the XPath query in the cloned tree to nodes in the original
 * document's tree.
 *
 * This function runs in the document under test, and has no access to
 * variables except what is passed in and what is on the global object
 * in the test page.
 *
 * This returns null instead of an empty list when there are not yet any
 * results because Selenium uses the null value to determine that it should
 * continue waiting.
 *
 * Precondition: wgxpath has been installed on the window object
 * @param {string} xpathString
 * @param {!Element} context
 * @return {?Array<!Element>}
 */
function queryXpath(xpathString, context) {
  // Install https://github.com/google/wicked-good-xpath
  // Its implementation is capable of evaluating xpath from detached
  // documents.
  const {wgxpath} = window;
  const fakeWindow = {document: {}};
  wgxpath.install(fakeWindow);

  const toggleData = (node, value) => {
    node.dataset['iAmphtmlTestId'] = value;
  };
  const removeData = node => delete node.dataset['iAmphtmlTestId'];
  const getIt =
      () => document.createNodeIterator(context, NodeFilter.SHOW_ELEMENT);

  // Add an ID to every element in the tree so we can reference them later.
  // This allows us to correlate nodes from the cloned tree to the
  // original tree.
  for (let it = getIt(), i = 0, node; Boolean(node = it.nextNode()); i++) {
    toggleData(node, i);
  }

  const fakeDocument = document.implementation.createDocument(
      'http://www.w3.org/1999/xhtml', 'html', null);
  try {
    fakeDocument.documentElement.appendChild(
        context.cloneNode(/* deep */ true));
  } catch (e) {
    // Appending the AMP `CustomElement`s to the new document throws errors
    // because the implementations expect the AmpDoc to be present and it
    // is not.
    // It's ok to ignore this error since we just need the DOM structure.
  }

  const xIt = fakeWindow.document.evaluate(
      xpathString, fakeDocument, null, fakeWindow.XPathResult.ANY_TYPE);
  const ids = [];
  let result;
  while (Boolean(result = xIt.iterateNext())) {
    const id = result.dataset['iAmphtmlTestId'];
    if (id) {
      ids.push(id);
    }
  }

  const elements = ids.map(id => {
    const selector = `[data-i-amphtml-test-id="${id}"]`;
    return context./*OK*/querySelector(selector);
  });

  // Restore the DOM to the original state without the id in the dataset.
  for (let it = getIt(), i = 0, node; Boolean(node = it.nextNode()); i++) {
    removeData(node, i);
  }

  return elements.length ? elements : null;
}

module.exports = {
  queryXpath,
};
