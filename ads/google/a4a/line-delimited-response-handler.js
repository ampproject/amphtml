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

 import {tryParseJson} from '../../../src/json';

 /**
  * Handles an XHR response by calling lineCallback for each line delineation.
  * Uses streaming where possible otherwise falls back to text.
  * @param {!Window} win
  * @param {!../../../src/service/xhr-impl.FetchResponse} response
  * @param {!function(string, boolean)} lineCallback
  * @private
  */
 export function lineDelimitedStreamer(win, response, lineCallback) {
   let line = '';
   function streamer(text, done) {
     const regex = /([^\n]*)(\n)?/g;
     let match;
     while ((match = regex.exec(text))) {
       line += match[1];
       if (match[2]) {
         lineCallback(line, done && regex.lastIndex === text.length);
         line = '';
       }
       if (regex.lastIndex === text.length) {
         break;
       }
     }
   }
   if (!response.body || !win.TextDecoder) {
     response.text().then(text => streamer(text, true));
     return;
   }

   const decoder = new TextDecoder('utf-8');
   const reader = response.body.getReader();
   reader.read().then(function chunk(result) {
     if (result.value) {
       streamer(
           decoder.decode(
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
  * Given each line, groups such that the first is JSON parsed and second
  * html unescaped.
  * @param {!function(string, !Object<string, *>, boolean)} callback
  * @private
  */
 export function metaJsonCreativeGrouper(callback) {
   let first;
   return function(line, done) {
     if (first) {
       callback(
           unescapeLineDelimitedHtml_(line),
         /** @type {!Object<string, *>} */(tryParseJson(first) || {}),
           done);
       first = null;
     } else {
       first = line;
     }
   };
 }

 /**
  * Unescapes characters that are escaped in line-delimited JSON-HTML.
  * @param {string} html An html snippet.
  * @return {string}
  * @private
  */
 function unescapeLineDelimitedHtml_(html) {
   return html.replace(
       /\\(n|r|\\)/g,
       (_, match) => match == 'n' ? '\n' : match == 'r' ? '\r' : '\\');
 }
