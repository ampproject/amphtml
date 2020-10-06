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
 * Decodes a proto message into field ids.
 *
 * Known messages ids may be passed as an optional messageIds object (recursive
 * structure of more known message ids).
 *
 * @param {!Uint8Array} bytes
 * @param {!JsonObject=} messageIds
 * @return {!Array<string>}
 */
function decodeProtoIds(bytes, messageIds = /** @type {!JsonObject} */ ({})) {
  return decodeProtoInternal(bytes, 0, bytes.length, messageIds, [], '');
}

/**
 * @param {!Uint8Array} bytes
 * @param {number} index
 * @param {number} end
 * @param {!JsonObject} messageIds
 * @param {!Array<string>} ids
 * @param {string} idPrefix
 * @return {!Array<string>}
 */
function decodeProtoInternal(bytes, index, end, messageIds, ids, idPrefix) {
  for (let i = index; i < end; ) {
    const {value, length} = decodeVarInt(bytes, i, end);
    const format = value & 0b111;
    const id = value >>> 3;
    ids.push(`${idPrefix}_${id}`.slice(1));
    i += length;
    i += eatData(format, id, bytes, i, end, messageIds, ids, idPrefix);
  }
  return ids;
}

/**
 * @param {!Uint8Array} bytes
 * @param {number} index
 * @param {number} end
 * @return {{value: number, length: number}}
 */
function decodeVarInt(bytes, index, end) {
  let smi = 0;
  let shift = 0;
  let i = index;
  for (; i < end; i++) {
    const next = bytes[i];
    smi |= (next & 0x7f) << shift;
    // Continue until we find a byte without the 8th bit set.
    if ((next & 0x80) === 0) {
      break;
    }
    shift += 7;
  }
  return {value: smi, length: i - index + 1};
}

/**
 * See https://developers.google.com/protocol-buffers/docs/encoding#structure
 * @param {number} format
 * @param {number} id
 * @param {!Uint8Array} bytes
 * @param {number} index
 * @param {number} end
 * @param {!JsonObject} messageIds
 * @param {!Array<string>} ids
 * @param {string} idPrefix
 * @return {number}
 */
function eatData(format, id, bytes, index, end, messageIds, ids, idPrefix) {
  switch (format) {
    case 0: // Varint
      return decodeVarInt(bytes, index, end).length;

    case 1: // fixed 64-bit
      return 8;
      break;

    case 2: {
      // length delimited
      const {value, length} = decodeVarInt(bytes, index, end);
      index += length;
      if (messageIds[id]) {
        decodeProtoInternal(
          bytes,
          index,
          index + value,
          messageIds[id],
          ids,
          `${idPrefix}_${id}`
        );
      }
      return value + length;
    }

    case 5: // fixed 32-bit
      return 4;

    case 3: // Start group (deprecated)
    case 4: // End group (deprecated)
    default:
      // Don't know how to handle this. Just end.
      return Infinity;
  }
}

// message AmpTransformerParams {
//   extend UnsignedSffeQueryParamProto {
//     optional AmpTransformerParams amp_transformer_params = 156482259;
//   }
//   optional uint64 docid = 1;
//   optional uint32 inject_viewer_padding = 2;
//   optional bool preload_hero_image = 3;
//   optional string smart_display_viewer_js_version = 16;
//   message Foo {
//     optional fixed64 a = 17;
//     optional fixed32 b = 9999;
//   }
//   optional Foo foo = 29;
//   optional bool bar = 2050;
// }

// base64UrlDecodeToBytes('mq331AQ1CJmz5syZs-bMmQEQmbPmzAkYAYIBB3Rlc3RpbmfqARGJAZmZmZkAAAAA_fAEmZmZmZCAAQE')
const bytes = [
  154,
  173,
  247,
  212,
  4,
  53,
  8,
  153,
  179,
  230,
  204,
  153,
  179,
  230,
  204,
  153,
  1,
  16,
  153,
  179,
  230,
  204,
  9,
  24,
  1,
  130,
  1,
  7,
  116,
  101,
  115,
  116,
  105,
  110,
  103,
  234,
  1,
  17,
  137,
  1,
  153,
  153,
  153,
  153,
  0,
  0,
  0,
  0,
  253,
  240,
  4,
  153,
  153,
  153,
  153,
  144,
  128,
  1,
  1,
];
const message = decodeProtoIds(new Uint8Array(bytes), {156482259: {29: {}}});
console.log(message);
