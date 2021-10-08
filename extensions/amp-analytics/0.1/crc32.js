import {utf8Encode} from '#core/types/string/bytes';

/**
 * Standard key for CRC32
 * https://en.wikipedia.org/wiki/Cyclic_redundancy_check#Polynomial_representations_of_cyclic_redundancy_checks
 * @const {number}
 */
const CRC32_KEY = 0xedb88320;

/** @private {?Array<number>} */
let crcTable = null;

/**
 * Returns CRC32 checksum for provided string.
 * @param {string} str
 * @return {number}
 */
export function crc32(str) {
  if (!crcTable) {
    crcTable = makeCrcTable();
  }

  const bytes = utf8Encode(str);

  // Shrink to 32 bits.
  let crc = -1 >>> 0;
  for (let i = 0; i < bytes.length; i++) {
    const lookupIndex = (crc ^ bytes[i]) & 0xff;
    crc = (crc >>> 8) ^ crcTable[lookupIndex];
  }
  return (crc ^ -1) >>> 0;
}

/**
 * Generates CRC lookup table.
 * @return {!Array<number>}
 */
function makeCrcTable() {
  const crcTable = new Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) {
      if (c & 1) {
        c = (c >>> 1) ^ CRC32_KEY;
      } else {
        c = c >>> 1;
      }
    }
    crcTable[i] = c;
  }
  return crcTable;
}
