/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const TEST_ID_PROPERTY = 'iAmphtmlXpathTestId';

const TEST_ID_ATTRIBUTE = 'data-i-amphtml-xpath-test-id';

/**
 * We use this function to query for elements with XPath because the standard
 * XPath implementation that ships with the browser is unable to do
 * the following:
 * 1. Query elements beyond a ShadowDOM boundary
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

  const {XPathResult} = fakeWindow;
  const {evaluate} = fakeWindow.document;

  // Add an ID to every element in the tree so we can reference them later.
  // This allows us to correlate nodes from the cloned tree to the
  // original tree.
  for (const {item, index} of
    createIndexedInterator(createElementIterator(context))) {
    setData(item, index);
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

  // Map the xpath results from the fake tree to the corresponding nodes in
  // the test document tree.
  const xpathIterator = createXpathIterator(
      evaluate(xpathString, fakeDocument, null, XPathResult.ANY_TYPE));
  const elements = [...xpathIterator].map(node => {
    const testId = getData(node);
    const selector = `[${TEST_ID_ATTRIBUTE}="${testId}"]`;
    return context./*OK*/querySelector(selector);
  });

  // Restore the DOM to the original state without the ID in the dataset.
  for (const node of createElementIterator(context)) {
    removeData(node);
  }

  return elements.length ? elements : null;
}

/**
 * Get the xpath test id data param
 * @param {!Element} node
 * @return {string}
 */
function getData(node) {
  return node.dataset[TEST_ID_PROPERTY];
}

/**
 * Set the xpath test id data param
 * @param {!Element} node
 * @param {number} value
 */
function setData(node, value) {
  node.dataset[TEST_ID_PROPERTY] = value;
}

/**
 * Remove the xpath test id data param.
 * @param {!Element} node
 */
function removeData(node) {
  delete node.dataset[TEST_ID_PROPERTY];
}

/**
 * Create an iterator over the subtree of the given element.
 * @param {!Element} element
 * @return {!Iterable<!Element>}
 */
function createElementIterator(element) {
  const document = element.ownerDocument;
  return createCommonIterator(
      document.createNodeIterator(element, NodeFilter.SHOW_ELEMENT),
      'nextNode');
}

/**
 * Create an iterator from an XPathResult instance.
 * @param {!XPathResult} xpathResult
 * @return {!Iterable<!Element>}
 */
function createXpathIterator(xpathResult) {
  return createCommonIterator(xpathResult, 'iterateNext');
}

/**
 * Create an iterator from an object with iterator-like behavior but a
 * different API name for the iteration method.
 * @param {!NodeIterator|!XPathResult} iterator
 * @param {string} nextProperty
 * @return {!Iterable<T>}
 */
function* createCommonIterator(iterator, nextProperty) {
  let item;
  while (Boolean(item = iterator[nextProperty]())) {
    yield item;
  }
}

/**
 * Create an iterator from an existing iterator, which nests the original
 * value under the `item` property in the iteration object value and adds an
 * `index` property.
 * @param {!Iterable<T>} iter
 * @return {!Iterable<{{item: T, index: number}}>}
 */
function* createIndexedInterator(iter) {
  let index = 0;
  for (const item of iter) {
    yield {item, index};
    index++;
  }
}


window.queryXpath = queryXpath;
