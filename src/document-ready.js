/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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


/**
 * Whether the document is ready.
 * @param {!Document} doc
 * @return {boolean}
 */
export function isDocumentReady(doc) {
  return doc.readyState != 'loading';
}


/**
 * Calls the callback when document is ready.
 * @param {!Document} doc
 * @param {function(!Document)} callback
 */
export function onDocumentReady(doc, callback) {
  let ready = isDocumentReady(doc);
  if (ready) {
    callback(doc);
  } else {
    const readyListener = () => {
      if (isDocumentReady(doc)) {
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
 * @param {!Document} doc
 * @return {!Promise<!Document>}
 */
export function whenDocumentReady(doc) {
  return new Promise(resolve => {
    onDocumentReady(doc, resolve);
  });
}
