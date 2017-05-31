/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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

 import {dev} from '../../../src/log';
 import {isObject} from '../../../src/types';

 /**
  * Creates an XHR streaming request with expected response format of repeated
  * pairs of JSON object metadata then string HTML delimited by line returns.
  *
  * @param {!../../../src/service/xhr-impl.Xhr} xhr
  * @param {string} url
  * @param {!function(string, !Object<string, *>, boolean)} chunkHandler called
  *    with creative, metadata, and boolean indicating if completed.  Failure to
  *    JSON parse metadata will cause empty object to be given.
  * @param {?../../../src/service/xhr-impl.FetchInitDef=} opt_init
  * @return {!Promise<!../../../src/service/xhr-impl.FetchResponse>} response,
  *    note that accessing body will cause error as its consumed in streaming.
  */
 export function fetchLineDelimitedChunks(xhr, url, chunkHandler, opt_init) {
   return xhr.fetch(url, opt_init)
     .then(response => {
       if (!response.body || !xhr.win.TextDecoder) {
         // TODO(keithwrightbos) - TextDecoder polyfill?
         response.text().then(content =>
           chunkHandleFullResponse(content, chunkHandler));
         return response;
       }
       let metadata;
       let snippet = '';
       const chunkCallback = (chunk, done) => {
         const regex = /([^\n]*)(\n)?/g;
         while ((match = regex.exec(chunk))) {
           snippet += match[1];
           if (match[2]) {
             if (metadata) {
               chunkHandler(unescapeHtml_(snippet), metadata,
                  done && regex.lastIndex === chunk.length);
               metadata = undefined;
             } else {
               metadata = safeJsonParse_(snippet);
             }
             snippet = '';
           }
           if (regex.lastIndex === chunk.length) break;
         }
       };
       handleFetchResponseStream_(
         response.body.getReader(), chunkCallback, new TextDecoder('utf-8'));
       return response;
     });
 }

 /**
  * @param {!ReadableStreamReader} reader The reader of the fetch's
  *  response stream.
  * @param {!function(string, boolean)} chunkHandler
  * @param {!TextDecoder} textDecoder
  * @private
  */
 function handleFetchResponseStream_(reader, chunkHandler, textDecoder) {
   reader.read().then(function chunk(result) {
     if (result.value) {
       chunkHandler(
         textDecoder.decode(
           /** @type {!ArrayBuffer} */(result.value), {'stream': true}),
         result.done);
     }
     if (!result.done) {
       // More chunks to read.
       reader.read().then(chunk);
     }
   });
 }

 /**
  * @param {string} text
  * @param {!function(string, !Object<string, *>, boolean)} chunkHandler
  * @visibleForTesting
  */
 function chunkHandleFullResponse(text, chunkHandler) {
   const lines = text.split('\n');
   for (let i = 1; i < lines.length; i += 2) {
     chunkHandler(
       unescapeHtml_(lines[i]),
       safeJsonParse_(lines[i - 1]),
       i == lines.length - 1);
   }
 }

 /**
  * Unescapes characters that are escaped in line-delimited JSON-HTML.
  * @param {string} html An html snippet.
  * @return {string}
  * @private
  */
 function unescapeHtml_(html) {
   return html ? html.replace(
     /\\(n|r|\\)/g,
     (_, match) => match == 'n' ? '\n' : match == 'r' ? '\r' : '\\') : html;
 }

 /**
  * @param {string} rawString to be parsed
  * @return {!Object<string, *>} JSON parsed string or empty object if invalid.
  * @private
  */
 function safeJsonParse_(rawString) {
   try {
     const result = JSON.parse(rawString);
     dev().assert(isObject(result));
     return /** @type {!Object<string,*>} */(result);
   } catch (err) {
     return {};
   }
 }

 /**
  * Counts the number of trailing backslashes in the given html.
  * @param {string} html The html to be inspected.
  * @param {number} end The last position of html to be read.
  * @return {number}
  */
 const countTrailingSlashes = (html, end) => {
   let slashes = 0;
   while (end >= 0 && html[end--] == '\\') {
     slashes++;
   }
   return slashes;
 };
