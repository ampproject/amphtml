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
       } else {
         let metaData;
         let snippet = '';
         const chunkCallback = (chunk, done) => {
           let hasDelimiter;
           let pos = 0;
           do {
             const delimIndex = chunk.indexOf('\n', pos);
             hasDelimiter = delimIndex != -1;
             let end = hasDelimiter ? delimIndex : chunk.length;
             snippet += chunk.substr(pos, end - pos);
             pos = hasDelimiter ? delimIndex + 1 : end;
             if (hasDelimiter) {
               if (!metaData) {
                 metaData = safeJsonParse_(snippet);
               } else {
                 // Have metaData/HTML so we can call chunkHandler and reset.
                 chunkHandler(
                   unescapeHtml_(snippet),
                   /** @type {!Object<string, *>} */(metaData),
                   done && end == chunk.length);
                 metaData = undefined;
               }
               snippet = '';
             } else if (countTrailingSlashes(chunk, pos - 1) & 1) {
               // Decrement 'end' to skip the last character of the chunk if it
               // ends with an odd number of slashes, since that implies that
               // the last slash is used to escape a character that we haven't
               // received yet. So we skip the last byte in this iteration and
               // wait for the next chunk to see what is being escaped.
               end--;
             }
             pos = hasDelimiter ? delimIndex + 1 : end;
           } while (hasDelimiter && pos < chunk.length);
         };
         handleFetchResponseStream_(
           response.body.getReader(), chunkCallback, new TextDecoder('utf-8'));
       }
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
   return reader.read().then(result => {
     if (result.value) {
       chunkHandler(
         textDecoder.decode(
           /** @type {!ArrayBuffer} */(result.value), {'stream': true}),
         result.done);
     }
     if (!result.done) {
       // More chunks to read.
       handleFetchResponseStream_.apply(this, arguments);
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
   // Note that its expected for an extra return to existing in the format.
   let linesRemaining = lines.length;
   console.log('chunkHandleFullResponse', text, lines);
   let metaData;
   lines.forEach(line => {
     if (!metaData) {
       metaData = safeJsonParse_(line);
     } else {
       chunkHandler(unescapeHtml_(line),
          /** @type {!Object<string,*>} */(metaData), !(--linesRemaining));
       metaData = undefined;
     }
   });
 }

 /**
  * Unescapes characters that are escaped in line-delimited JSON-HTML.
  * @param {string} html An html snippet.
  * @return {string}
  * @private
  */
 function unescapeHtml_(html) {
   return html.replace(
     /\\(n|r|\\)/g,
     (_, match) => match == 'n' ? '\n' : match == 'r' ? '\r' : '\\');
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
