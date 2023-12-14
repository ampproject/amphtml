import {devAssert, userAssert} from '#core/assert';
import {parseDate} from '#core/types/date';

/** @typedef {import('#core/types/date').TimestampDef} TimestampDef */
/** @typedef {function(string): TimestampDef} DateParserDef */

/**
 * Map from attribute names to their parsers.
 * @type {{[key: string]: DateParserDef}}
 */
const dateAttrParsers = {
  'datetime': (datetime) => {
    const d = parseDate(datetime);
    userAssert(d, 'Invalid date: %s', datetime);
    return d;
  },
  'end-date': (datetime) => {
    const d = parseDate(datetime);
    userAssert(d, 'Invalid date: %s', datetime);
    return d;
  },
  'timeleft-ms': (timeleftMs) => Date.now() + Number(timeleftMs),
  'timestamp-ms': (ms) => Number(ms),
  'timestamp-seconds': (timestampSeconds) => 1000 * Number(timestampSeconds),
};

/**
 * @param {Element} element
 * @param {Array<string>} dateAttrs list of attribute names
 * @return {?TimestampDef}
 */
export function parseDateAttrs(element, dateAttrs) {
  const epoch = parseEpoch(element, dateAttrs);
  userAssert(epoch, 'One of attributes [%s] is required', dateAttrs.join(', '));

  const offsetSeconds =
    (Number(element.getAttribute('offset-seconds')) || 0) * 1000;
  return epoch + offsetSeconds;
}

/**
 * Parse epoch from list of possible element attributes, returning the first one
 * that is truthy.
 * @param {Element} element
 * @param {Array<string>} dateAttrs list of attribute names
 * @return {?TimestampDef}
 */
function parseEpoch(element, dateAttrs) {
  // Validate provided dateAttrs outside the loop so it will fail when an
  // invalid attr is provided, even if that attribute isn't present on the
  // element.
  /** @type {Array<DateParserDef>} */
  const parsers = dateAttrs.map((attrName) => {
    devAssert(
      dateAttrParsers[attrName],
      'Invalid date attribute "%s"',
      attrName
    );
    return dateAttrParsers[attrName];
  });

  for (let i = 0; i < dateAttrs.length; ++i) {
    const attrVal = element.getAttribute(dateAttrs[i]);
    if (attrVal) {
      return parsers[i](attrVal);
    }
  }

  return null;
}
