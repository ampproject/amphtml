/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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
import { utf8Encode } from "../../../src/core/types/string/bytes";

/**
 * Standard key for CRC32
 * https://en.wikipedia.org/wiki/Cyclic_redundancy_check#Polynomial_representations_of_cyclic_redundancy_checks
 * @const {number}
 */
var CRC32_KEY = 0xedb88320;

/** @private {?Array<number>} */
var crcTable = null;

/**
 * Returns CRC32 checksum for provided string.
 * @param {string} str
 * @return {number}
 */
export function crc32(str) {
  if (!crcTable) {
    crcTable = makeCrcTable();
  }

  var bytes = utf8Encode(str);
  // Shrink to 32 bits.
  var crc = -1 >>> 0;

  for (var i = 0; i < bytes.length; i++) {
    var lookupIndex = (crc ^ bytes[i]) & 0xff;
    crc = crc >>> 8 ^ crcTable[lookupIndex];
  }

  return (crc ^ -1) >>> 0;
}

/**
 * Generates CRC lookup table.
 * @return {!Array<number>}
 */
function makeCrcTable() {
  var crcTable = new Array(256);

  for (var i = 0; i < 256; i++) {
    var c = i;

    for (var j = 0; j < 8; j++) {
      if (c & 1) {
        c = c >>> 1 ^ CRC32_KEY;
      } else {
        c = c >>> 1;
      }
    }

    crcTable[i] = c;
  }

  return crcTable;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNyYzMyLmpzIl0sIm5hbWVzIjpbInV0ZjhFbmNvZGUiLCJDUkMzMl9LRVkiLCJjcmNUYWJsZSIsImNyYzMyIiwic3RyIiwibWFrZUNyY1RhYmxlIiwiYnl0ZXMiLCJjcmMiLCJpIiwibGVuZ3RoIiwibG9va3VwSW5kZXgiLCJBcnJheSIsImMiLCJqIl0sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFFQSxTQUFRQSxVQUFSOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFNQyxTQUFTLEdBQUcsVUFBbEI7O0FBRUE7QUFDQSxJQUFJQyxRQUFRLEdBQUcsSUFBZjs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTyxTQUFTQyxLQUFULENBQWVDLEdBQWYsRUFBb0I7QUFDekIsTUFBSSxDQUFDRixRQUFMLEVBQWU7QUFDYkEsSUFBQUEsUUFBUSxHQUFHRyxZQUFZLEVBQXZCO0FBQ0Q7O0FBRUQsTUFBTUMsS0FBSyxHQUFHTixVQUFVLENBQUNJLEdBQUQsQ0FBeEI7QUFFQTtBQUNBLE1BQUlHLEdBQUcsR0FBRyxDQUFDLENBQUQsS0FBTyxDQUFqQjs7QUFDQSxPQUFLLElBQUlDLENBQUMsR0FBRyxDQUFiLEVBQWdCQSxDQUFDLEdBQUdGLEtBQUssQ0FBQ0csTUFBMUIsRUFBa0NELENBQUMsRUFBbkMsRUFBdUM7QUFDckMsUUFBTUUsV0FBVyxHQUFHLENBQUNILEdBQUcsR0FBR0QsS0FBSyxDQUFDRSxDQUFELENBQVosSUFBbUIsSUFBdkM7QUFDQUQsSUFBQUEsR0FBRyxHQUFJQSxHQUFHLEtBQUssQ0FBVCxHQUFjTCxRQUFRLENBQUNRLFdBQUQsQ0FBNUI7QUFDRDs7QUFDRCxTQUFPLENBQUNILEdBQUcsR0FBRyxDQUFDLENBQVIsTUFBZSxDQUF0QjtBQUNEOztBQUVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBU0YsWUFBVCxHQUF3QjtBQUN0QixNQUFNSCxRQUFRLEdBQUcsSUFBSVMsS0FBSixDQUFVLEdBQVYsQ0FBakI7O0FBQ0EsT0FBSyxJQUFJSCxDQUFDLEdBQUcsQ0FBYixFQUFnQkEsQ0FBQyxHQUFHLEdBQXBCLEVBQXlCQSxDQUFDLEVBQTFCLEVBQThCO0FBQzVCLFFBQUlJLENBQUMsR0FBR0osQ0FBUjs7QUFDQSxTQUFLLElBQUlLLENBQUMsR0FBRyxDQUFiLEVBQWdCQSxDQUFDLEdBQUcsQ0FBcEIsRUFBdUJBLENBQUMsRUFBeEIsRUFBNEI7QUFDMUIsVUFBSUQsQ0FBQyxHQUFHLENBQVIsRUFBVztBQUNUQSxRQUFBQSxDQUFDLEdBQUlBLENBQUMsS0FBSyxDQUFQLEdBQVlYLFNBQWhCO0FBQ0QsT0FGRCxNQUVPO0FBQ0xXLFFBQUFBLENBQUMsR0FBR0EsQ0FBQyxLQUFLLENBQVY7QUFDRDtBQUNGOztBQUNEVixJQUFBQSxRQUFRLENBQUNNLENBQUQsQ0FBUixHQUFjSSxDQUFkO0FBQ0Q7O0FBQ0QsU0FBT1YsUUFBUDtBQUNEIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgMjAxOCBUaGUgQU1QIEhUTUwgQXV0aG9ycy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTLUlTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovXG5cbmltcG9ydCB7dXRmOEVuY29kZX0gZnJvbSAnI2NvcmUvdHlwZXMvc3RyaW5nL2J5dGVzJztcblxuLyoqXG4gKiBTdGFuZGFyZCBrZXkgZm9yIENSQzMyXG4gKiBodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9DeWNsaWNfcmVkdW5kYW5jeV9jaGVjayNQb2x5bm9taWFsX3JlcHJlc2VudGF0aW9uc19vZl9jeWNsaWNfcmVkdW5kYW5jeV9jaGVja3NcbiAqIEBjb25zdCB7bnVtYmVyfVxuICovXG5jb25zdCBDUkMzMl9LRVkgPSAweGVkYjg4MzIwO1xuXG4vKiogQHByaXZhdGUgez9BcnJheTxudW1iZXI+fSAqL1xubGV0IGNyY1RhYmxlID0gbnVsbDtcblxuLyoqXG4gKiBSZXR1cm5zIENSQzMyIGNoZWNrc3VtIGZvciBwcm92aWRlZCBzdHJpbmcuXG4gKiBAcGFyYW0ge3N0cmluZ30gc3RyXG4gKiBAcmV0dXJuIHtudW1iZXJ9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmMzMihzdHIpIHtcbiAgaWYgKCFjcmNUYWJsZSkge1xuICAgIGNyY1RhYmxlID0gbWFrZUNyY1RhYmxlKCk7XG4gIH1cblxuICBjb25zdCBieXRlcyA9IHV0ZjhFbmNvZGUoc3RyKTtcblxuICAvLyBTaHJpbmsgdG8gMzIgYml0cy5cbiAgbGV0IGNyYyA9IC0xID4+PiAwO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IGJ5dGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgY29uc3QgbG9va3VwSW5kZXggPSAoY3JjIF4gYnl0ZXNbaV0pICYgMHhmZjtcbiAgICBjcmMgPSAoY3JjID4+PiA4KSBeIGNyY1RhYmxlW2xvb2t1cEluZGV4XTtcbiAgfVxuICByZXR1cm4gKGNyYyBeIC0xKSA+Pj4gMDtcbn1cblxuLyoqXG4gKiBHZW5lcmF0ZXMgQ1JDIGxvb2t1cCB0YWJsZS5cbiAqIEByZXR1cm4geyFBcnJheTxudW1iZXI+fVxuICovXG5mdW5jdGlvbiBtYWtlQ3JjVGFibGUoKSB7XG4gIGNvbnN0IGNyY1RhYmxlID0gbmV3IEFycmF5KDI1Nik7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgMjU2OyBpKyspIHtcbiAgICBsZXQgYyA9IGk7XG4gICAgZm9yIChsZXQgaiA9IDA7IGogPCA4OyBqKyspIHtcbiAgICAgIGlmIChjICYgMSkge1xuICAgICAgICBjID0gKGMgPj4+IDEpIF4gQ1JDMzJfS0VZO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYyA9IGMgPj4+IDE7XG4gICAgICB9XG4gICAgfVxuICAgIGNyY1RhYmxlW2ldID0gYztcbiAgfVxuICByZXR1cm4gY3JjVGFibGU7XG59XG4iXX0=
// /Users/mszylkowski/src/amphtml/extensions/amp-analytics/0.1/crc32.js