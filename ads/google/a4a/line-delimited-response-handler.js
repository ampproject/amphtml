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
  * @param {string} input
  * @param {!function(string, !Object<string, *>, boolean)} chunkHandler called
  *    with creative, metadata, and boolean indicating if completed.  Failure to
  *    JSON parse metadata will cause empty object to be given.
  * @param {?../../../src/service/xhr-impl.FetchInitDef=} opt_init
  * @return {!Promise<!../../../src/service/xhr-impl.FetchResponse>} response,
  *    note that accessing body will cause error as its consumed in streaming.
  */
 export function fetchLineDelimitedChunks(xhr, input, chunkHandler, opt_init) {
   return xhr.fetch(input, opt_init)
     .then(response => {
       const reader = response.reader();
       if (!reader || !xhr.win.TextDecoder) {
         // TODO(keithwrightbos) - TextDecoder polyfill?
         response.text().then(content =>
           chunkHandleFullResponse(content, chunkHandler));
       } else {
         let metaData;
         let snippet = '';
         const chunkCallback = (chunk, done) => {
           let pos = 0;
           let hasDelimiter;
           do {
             const delimIndex = chunk.indexOf('\n', pos);
             hasDelimiter = delimIndex != -1;
             const end = hasDelimiter ? delimIndex : chunk.length;
             snippet += chunk.substr(pos, end - pos);
             pos = hasDelimiter ? delimIndex + 1 : end;
             if (hasDelimiter) {
               if (!metaData) {
                 metaData = safeJsonParse_(snippet);
               } else {
                 // Have metaData and HTML so we can call chunkHandler and reset.
                 chunkHandler(
                   unescapeHtml_(snippet),
                   /** @type {!Object<string, *>} */(metaData),
                   done && end == chunk.length);
                 snippet = '';
                 metaData = undefined;
               }
             }
           } while (hasDelimiter && pos < chunk.length);
         };
         handleFetchResponseStream_(reader, chunkCallback, new TextDecoder());
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
   dev().assert(lines.length % 2 == 0);
   let linesRemaining = lines.length;
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
