/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
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
 * Decodes readable stream from response and writes to given writeable stream.
 * This function should be replaced with transform stream when well supported.
 * @param {!Window} win
 * @param {!Response} response
 * @param {!./detached-dom-stream.DetachedDomStream} writer
 * @return {!Promise}
 */
export function streamResponseToWriter(win, response, writer) {
  // Try native streaming first.
  if (win.TextDecoder && win.ReadableStream) {
    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    return reader.read().then(function handleChunk({value, done}) {
      // We need to close and flush the decoder on the last chunk even if
      // we have no more bytes and `decode` will throw if not given an
      // array buffer.
      value = value || new Uint8Array(0);
      const text = decoder.decode(value, {stream: !done});

      if (text) {
        writer.write(text);
      }

      if (!done) {
        return reader.read().then(handleChunk);
      }

      writer.close();
    });
  }

  // Fallback case waits for the complete response before writing.
  return response.text().then((text) => {
    writer.write(text);
    writer.close();
  });
}
