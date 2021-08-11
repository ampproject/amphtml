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
import { Deferred } from "../../data-structures/promise";

/**
 * Decodes readable stream from response and writes to given writeable stream.
 * Returns a promise that resolves when first bytes are received from the
 * response, or we learn that the response is empty.
 * This function should be replaced with transform stream when well supported.
 * @param {!Window} win
 * @param {!Response} response
 * @param {!./detached.DetachedDomStream} writer
 * @return {!Promise<boolean>} true if response has content, false if
 * the response is empty.
 */
export function streamResponseToWriter(win, response, writer) {
  var hasContentDeferred = new Deferred();

  // Try native streaming first.
  if (win.TextDecoder && win.ReadableStream) {
    var firstRead = true;
    var reader = response.body.getReader();
    var decoder = new TextDecoder();
    reader.read().then(function handleChunk(_ref) {
      var done = _ref.done,
          value = _ref.value;

      if (firstRead) {
        hasContentDeferred.resolve(!done);
        firstRead = false;
      }

      // We need to close and flush the decoder on the last chunk even if
      // we have no more bytes and `decode` will throw if not given an
      // array buffer.
      value = value || new Uint8Array(0);
      var text = decoder.decode(value, {
        stream: !done
      });

      if (text) {
        writer.write(text);
      }

      if (!done) {
        return reader.read().then(handleChunk);
      }

      writer.close();
    });
  } else {
    // Fallback case waits for the complete response before writing.
    response.text().then(function (text) {
      hasContentDeferred.resolve(!!text);
      writer.write(text);
      writer.close();
    });
  }

  return hasContentDeferred.promise;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInJlc3BvbnNlLmpzIl0sIm5hbWVzIjpbIkRlZmVycmVkIiwic3RyZWFtUmVzcG9uc2VUb1dyaXRlciIsIndpbiIsInJlc3BvbnNlIiwid3JpdGVyIiwiaGFzQ29udGVudERlZmVycmVkIiwiVGV4dERlY29kZXIiLCJSZWFkYWJsZVN0cmVhbSIsImZpcnN0UmVhZCIsInJlYWRlciIsImJvZHkiLCJnZXRSZWFkZXIiLCJkZWNvZGVyIiwicmVhZCIsInRoZW4iLCJoYW5kbGVDaHVuayIsImRvbmUiLCJ2YWx1ZSIsInJlc29sdmUiLCJVaW50OEFycmF5IiwidGV4dCIsImRlY29kZSIsInN0cmVhbSIsIndyaXRlIiwiY2xvc2UiLCJwcm9taXNlIl0sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFFQSxTQUFRQSxRQUFSOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPLFNBQVNDLHNCQUFULENBQWdDQyxHQUFoQyxFQUFxQ0MsUUFBckMsRUFBK0NDLE1BQS9DLEVBQXVEO0FBQzVELE1BQU1DLGtCQUFrQixHQUFHLElBQUlMLFFBQUosRUFBM0I7O0FBQ0E7QUFDQSxNQUFJRSxHQUFHLENBQUNJLFdBQUosSUFBbUJKLEdBQUcsQ0FBQ0ssY0FBM0IsRUFBMkM7QUFDekMsUUFBSUMsU0FBUyxHQUFHLElBQWhCO0FBQ0EsUUFBTUMsTUFBTSxHQUFHTixRQUFRLENBQUNPLElBQVQsQ0FBY0MsU0FBZCxFQUFmO0FBQ0EsUUFBTUMsT0FBTyxHQUFHLElBQUlOLFdBQUosRUFBaEI7QUFFQUcsSUFBQUEsTUFBTSxDQUFDSSxJQUFQLEdBQWNDLElBQWQsQ0FBbUIsU0FBU0MsV0FBVCxPQUFvQztBQUFBLFVBQWRDLElBQWMsUUFBZEEsSUFBYztBQUFBLFVBQVJDLEtBQVEsUUFBUkEsS0FBUTs7QUFDckQsVUFBSVQsU0FBSixFQUFlO0FBQ2JILFFBQUFBLGtCQUFrQixDQUFDYSxPQUFuQixDQUEyQixDQUFDRixJQUE1QjtBQUNBUixRQUFBQSxTQUFTLEdBQUcsS0FBWjtBQUNEOztBQUVEO0FBQ0E7QUFDQTtBQUNBUyxNQUFBQSxLQUFLLEdBQUdBLEtBQUssSUFBSSxJQUFJRSxVQUFKLENBQWUsQ0FBZixDQUFqQjtBQUNBLFVBQU1DLElBQUksR0FBR1IsT0FBTyxDQUFDUyxNQUFSLENBQWVKLEtBQWYsRUFBc0I7QUFBQ0ssUUFBQUEsTUFBTSxFQUFFLENBQUNOO0FBQVYsT0FBdEIsQ0FBYjs7QUFFQSxVQUFJSSxJQUFKLEVBQVU7QUFDUmhCLFFBQUFBLE1BQU0sQ0FBQ21CLEtBQVAsQ0FBYUgsSUFBYjtBQUNEOztBQUVELFVBQUksQ0FBQ0osSUFBTCxFQUFXO0FBQ1QsZUFBT1AsTUFBTSxDQUFDSSxJQUFQLEdBQWNDLElBQWQsQ0FBbUJDLFdBQW5CLENBQVA7QUFDRDs7QUFFRFgsTUFBQUEsTUFBTSxDQUFDb0IsS0FBUDtBQUNELEtBckJEO0FBc0JELEdBM0JELE1BMkJPO0FBQ0w7QUFDQXJCLElBQUFBLFFBQVEsQ0FBQ2lCLElBQVQsR0FBZ0JOLElBQWhCLENBQXFCLFVBQUNNLElBQUQsRUFBVTtBQUM3QmYsTUFBQUEsa0JBQWtCLENBQUNhLE9BQW5CLENBQTJCLENBQUMsQ0FBQ0UsSUFBN0I7QUFDQWhCLE1BQUFBLE1BQU0sQ0FBQ21CLEtBQVAsQ0FBYUgsSUFBYjtBQUNBaEIsTUFBQUEsTUFBTSxDQUFDb0IsS0FBUDtBQUNELEtBSkQ7QUFLRDs7QUFFRCxTQUFPbkIsa0JBQWtCLENBQUNvQixPQUExQjtBQUNEIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgMjAyMCBUaGUgQU1QIEhUTUwgQXV0aG9ycy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTLUlTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovXG5cbmltcG9ydCB7RGVmZXJyZWR9IGZyb20gJyNjb3JlL2RhdGEtc3RydWN0dXJlcy9wcm9taXNlJztcblxuLyoqXG4gKiBEZWNvZGVzIHJlYWRhYmxlIHN0cmVhbSBmcm9tIHJlc3BvbnNlIGFuZCB3cml0ZXMgdG8gZ2l2ZW4gd3JpdGVhYmxlIHN0cmVhbS5cbiAqIFJldHVybnMgYSBwcm9taXNlIHRoYXQgcmVzb2x2ZXMgd2hlbiBmaXJzdCBieXRlcyBhcmUgcmVjZWl2ZWQgZnJvbSB0aGVcbiAqIHJlc3BvbnNlLCBvciB3ZSBsZWFybiB0aGF0IHRoZSByZXNwb25zZSBpcyBlbXB0eS5cbiAqIFRoaXMgZnVuY3Rpb24gc2hvdWxkIGJlIHJlcGxhY2VkIHdpdGggdHJhbnNmb3JtIHN0cmVhbSB3aGVuIHdlbGwgc3VwcG9ydGVkLlxuICogQHBhcmFtIHshV2luZG93fSB3aW5cbiAqIEBwYXJhbSB7IVJlc3BvbnNlfSByZXNwb25zZVxuICogQHBhcmFtIHshLi9kZXRhY2hlZC5EZXRhY2hlZERvbVN0cmVhbX0gd3JpdGVyXG4gKiBAcmV0dXJuIHshUHJvbWlzZTxib29sZWFuPn0gdHJ1ZSBpZiByZXNwb25zZSBoYXMgY29udGVudCwgZmFsc2UgaWZcbiAqIHRoZSByZXNwb25zZSBpcyBlbXB0eS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHN0cmVhbVJlc3BvbnNlVG9Xcml0ZXIod2luLCByZXNwb25zZSwgd3JpdGVyKSB7XG4gIGNvbnN0IGhhc0NvbnRlbnREZWZlcnJlZCA9IG5ldyBEZWZlcnJlZCgpO1xuICAvLyBUcnkgbmF0aXZlIHN0cmVhbWluZyBmaXJzdC5cbiAgaWYgKHdpbi5UZXh0RGVjb2RlciAmJiB3aW4uUmVhZGFibGVTdHJlYW0pIHtcbiAgICBsZXQgZmlyc3RSZWFkID0gdHJ1ZTtcbiAgICBjb25zdCByZWFkZXIgPSByZXNwb25zZS5ib2R5LmdldFJlYWRlcigpO1xuICAgIGNvbnN0IGRlY29kZXIgPSBuZXcgVGV4dERlY29kZXIoKTtcblxuICAgIHJlYWRlci5yZWFkKCkudGhlbihmdW5jdGlvbiBoYW5kbGVDaHVuayh7ZG9uZSwgdmFsdWV9KSB7XG4gICAgICBpZiAoZmlyc3RSZWFkKSB7XG4gICAgICAgIGhhc0NvbnRlbnREZWZlcnJlZC5yZXNvbHZlKCFkb25lKTtcbiAgICAgICAgZmlyc3RSZWFkID0gZmFsc2U7XG4gICAgICB9XG5cbiAgICAgIC8vIFdlIG5lZWQgdG8gY2xvc2UgYW5kIGZsdXNoIHRoZSBkZWNvZGVyIG9uIHRoZSBsYXN0IGNodW5rIGV2ZW4gaWZcbiAgICAgIC8vIHdlIGhhdmUgbm8gbW9yZSBieXRlcyBhbmQgYGRlY29kZWAgd2lsbCB0aHJvdyBpZiBub3QgZ2l2ZW4gYW5cbiAgICAgIC8vIGFycmF5IGJ1ZmZlci5cbiAgICAgIHZhbHVlID0gdmFsdWUgfHwgbmV3IFVpbnQ4QXJyYXkoMCk7XG4gICAgICBjb25zdCB0ZXh0ID0gZGVjb2Rlci5kZWNvZGUodmFsdWUsIHtzdHJlYW06ICFkb25lfSk7XG5cbiAgICAgIGlmICh0ZXh0KSB7XG4gICAgICAgIHdyaXRlci53cml0ZSh0ZXh0KTtcbiAgICAgIH1cblxuICAgICAgaWYgKCFkb25lKSB7XG4gICAgICAgIHJldHVybiByZWFkZXIucmVhZCgpLnRoZW4oaGFuZGxlQ2h1bmspO1xuICAgICAgfVxuXG4gICAgICB3cml0ZXIuY2xvc2UoKTtcbiAgICB9KTtcbiAgfSBlbHNlIHtcbiAgICAvLyBGYWxsYmFjayBjYXNlIHdhaXRzIGZvciB0aGUgY29tcGxldGUgcmVzcG9uc2UgYmVmb3JlIHdyaXRpbmcuXG4gICAgcmVzcG9uc2UudGV4dCgpLnRoZW4oKHRleHQpID0+IHtcbiAgICAgIGhhc0NvbnRlbnREZWZlcnJlZC5yZXNvbHZlKCEhdGV4dCk7XG4gICAgICB3cml0ZXIud3JpdGUodGV4dCk7XG4gICAgICB3cml0ZXIuY2xvc2UoKTtcbiAgICB9KTtcbiAgfVxuXG4gIHJldHVybiBoYXNDb250ZW50RGVmZXJyZWQucHJvbWlzZTtcbn1cbiJdfQ==
// /Users/mszylkowski/src/amphtml/src/core/dom/stream/response.js