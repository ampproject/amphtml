import {ReadyState_Enum} from '#core/constants/ready-state';

/**
 * Whether the document is ready.
 * @param {Document} doc
 * @return {boolean}
 */
export function isDocumentReady(doc) {
  return (
    doc.readyState != ReadyState_Enum.LOADING &&
    // IE11-only
    /** @type {string} */ (doc.readyState) != 'uninitialized'
  );
}

/**
 * Whether the document has loaded all the css and sub-resources.
 * @param {Document} doc
 * @return {boolean}
 */
function isDocumentComplete(doc) {
  return doc.readyState == ReadyState_Enum.COMPLETE;
}

/**
 * Calls the callback when document is ready.
 * @param {Document} doc
 * @param {function(Document):void} callback
 */
export function onDocumentReady(doc, callback) {
  onDocumentState(doc, isDocumentReady, callback);
}

/**
 * Calls the callback when document's state satisfies the stateFn.
 * @param {Document} doc
 * @param {function(Document):boolean} stateFn
 * @param {function(Document):void} callback
 */
function onDocumentState(doc, stateFn, callback) {
  let ready = stateFn(doc);
  if (ready) {
    callback(doc);
  } else {
    const readyListener = () => {
      if (stateFn(doc)) {
        if (!ready) {
          ready = true;
          callback(doc);
        }
        doc.removeEventListener('readystatechange', readyListener);
      }
    };
    doc.addEventListener('readystatechange', readyListener);
  }
}

/**
 * Returns a promise that is resolved when document is ready.
 * @param {Document} doc
 * @return {Promise<Document>}
 */
export function whenDocumentReady(doc) {
  return new Promise((resolve) => {
    onDocumentReady(doc, resolve);
  });
}

/**
 * Returns a promise that is resolved when document is complete.
 * @param {Document} doc
 * @return {Promise<Document>}
 */
export function whenDocumentComplete(doc) {
  return new Promise((resolve) => {
    onDocumentState(doc, isDocumentComplete, resolve);
  });
}
