/**
 * @license DEDUPE_ON_MINIFY
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
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
 * limitations under the license.
 */
goog.provide('json_testutil.defaultCmpFn');
goog.provide('json_testutil.makeJsonKeyCmpFn');
goog.provide('json_testutil.renderJSON');
goog.require('goog.asserts');

/**
 * Helper function for renderJSON below.
 * Serializes a json object into a json string segments.
 * This is done by traversing the object recursively, calling toJSON
 * on anything encountered, and then mapping the objects, arrays,
 * and primitive types (string, number, boolean) to string segments.
 * This code is partially lifted from goog.json.Serializer,
 * but simpler (falls back to JSON.stringify for primitive types) and
 * sorts keys alphabetically, to avoid having brittle unittests. It
 * also emits single quotes instead of double quotes, technically
 * violating json.org but complying with our style guide.
 * @param {*} obj json object to serialize.
 * @param {!Array<string>} out accumulates the output, to be later joined.
 * @param {function(string, string):number=} cmpFn comparator for json keys
 */
function objToJsonSegments(obj, out, cmpFn) {
  if (obj === null) {
    out.push('null');
    return;
  }
  if (obj === undefined) {
    out.push('undefined');
    return;
  }
  if (obj.toJSON) {
    obj = obj.toJSON();
  }
  if (typeof obj === 'object') {
    if (goog.isArray(obj)) {
      out.push('[');
      for (let i = 0; i < obj.length; i++) {
        if (i > 0) {
          out.push(',');
        }
        objToJsonSegments(obj[i], out, cmpFn);
      }
      out.push(']');
      return;
    } else if (
        obj instanceof String || obj instanceof Number ||
        obj instanceof Boolean) {
      obj = obj.valueOf();
      // Fall through to switch below.
    } else {
      out.push('{');
      const keys = [];
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(
                /** @type {Object}*/ (obj), key)) {
          keys.push(key);
        }
      }
      // We sort the keys, to make the behavior deterministic.
      if (cmpFn !== undefined) {
        keys.sort(cmpFn);
      } else {
        keys.sort();
      }
      for (let i = 0; i < keys.length; i++) {
        if (i > 0) {
          out.push(',');
        }
        objToJsonSegments(keys[i], out, cmpFn);
        out.push(':');
        objToJsonSegments(obj[keys[i]], out, cmpFn);
      }
      out.push('}');
      return;
    }
  }
  switch (typeof obj) {
    case 'string':
    case 'number':
    case 'boolean': {
      const candidate = JSON.stringify(obj, null, '');
      if (startsWithChar(candidate, '"')) {
        // We hack the non-standard "'" into place here because the
        // Javascript style guide prefers them (and git5 lint reports
        // double quotes as errors).
        out.push('\'' + candidate.slice(1, -1).replace('\'', '\\\'') + '\'');
      } else {
        out.push(candidate);
      }
      return;
    }
    default:
      goog.asserts.fail('Unknown type: ' + typeof obj);
  }
}

/**
 * Default key comparator for ordering the json output.
 * @param {string} a
 * @param {string} b
 * @return {number} */
json_testutil.defaultCmpFn = function(a, b) {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
};


/**
 * Given an order for the json keys, creates a function which
 * lets us sort the keys in json output. This can improve the
 * rendered json output that's used in assertions in a unittest.
 *
 * @param {!Array<string>} keyOrder
 * @return {function(string, string): number}
 */
json_testutil.makeJsonKeyCmpFn = function(keyOrder) {
  /** @type {!Object<string, number>} */
  const keyPriority = {};
  for (var ii = 0; ii < keyOrder.length; ++ii) {
    keyPriority[keyOrder[ii]] = ii;
  }

  return function(a, b) {
    // Handle cases where only only one of the two keys is recognized.
    // Unrecognized keys go last.
    if (keyPriority.hasOwnProperty(a) && !keyPriority.hasOwnProperty(b)) {
      return -1;
    }
    if (keyPriority.hasOwnProperty(b) && !keyPriority.hasOwnProperty(a)) {
      return 1;
    }

    // Handle case where both keys are recognized.
    if (keyPriority.hasOwnProperty(b) && keyPriority.hasOwnProperty(a)) {
      return keyPriority[a] - keyPriority[b];
    }

    return json_testutil.defaultCmpFn(a, b);
  };
};


/**
 * Determines whether the provided string starts with a particular character.
 * Note: In ES6, there's string::startsWith but we want to make this work
 * for some interpreters < ES6.
 * @param {string} str
 * @param {string} ch
 * @return {boolean}
 */
function startsWithChar(str, ch) {
  return str.length > 0 && str.charAt(0) === ch;
}

/**
 * Determines whether the provided string ends with a particular character.
 * Note: In ES6, there's string::endsWith but we want to make this work
 * for some interpreters < ES6.
 * @param {string} str
 * @param {string} ch
 * @return {boolean}
 */
function endsWithChar(str, ch) {
  return str.length > 0 && str.charAt(str.length - 1) === ch;
}

/**
 * Emits JSON output which is formatted for inclusion in a unittest.
 * This includes line breaks and emitting the non-standard quotes. It
 * uses objToJsonSegments rather than something else, to sort all fields in
 * objects by cmpFn. The output is stable for running emacs
 * indent-region over it, or using knock off features in lesser
 * editors. Usually, minor tweaking is sufficient to fit the output
 * onto our 80 column IBM 5081 punch cards.
 * @param {!Object} obj
 * @param {function(string, string):number=} [cmpFn=json_testutil.defaultCmpFn]
 * json key comparator
 * @param {number=} [offset=0] Offset number of characters.
 * @return {string}
 */
json_testutil.renderJSON = function(obj, cmpFn, offset) {
  if (cmpFn === undefined) cmpFn = json_testutil.defaultCmpFn;
  if (offset === undefined) offset = 0;
  // First, let objToJsonSegments emit the json into
  // segments. Conveniently, special characters such as '{', ',',
  // etc. are - unless inside a string - emitted as individual strings
  // - much like tokens coming from a tokenizer.
  const segments = [];
  objToJsonSegments(obj, segments, cmpFn);

  const lines = [];
  let current = '';      // current line
  let nesting = offset;  // Keep track of how deep inside {[]} etc.

  // Walk over the segments emitted by objToJsonSegments.
  for (const segment of segments) {
    // Start a new line, either if the current one ends with , or : and
    // we're past 60 chars, or if the segment to process starts
    // with an opening block character (but keep multiple opening blocks
    // together).
    if (current.length > 60 &&
            (endsWithChar(current, ',') || endsWithChar(current, ':')) ||
        (segment === '{' || segment === '[') && !endsWithChar(current, '{') &&
            !endsWithChar(current, '[')) {
      lines.push(current);
      current = '';
      for (let i = 0; i < nesting; i++) {  // Emit indentation.
        current += ' ';
      }
    }
    // If the ',' or ':' didn't cause a line break, add a space after them
    // to comply with the style guide.
    if (endsWithChar(current, ',') || endsWithChar(current, ':')) {
      current += ' ';
    }
    // Keep track of how deep we're inside {} [] for indentation.
    if (segment === '{' || segment === '[') {
      nesting++;
    } else if (segment === '}' || segment === ']') {
      nesting--;
    }
    // Now add the segment.
    current += segment;
  }
  // Process leftovers.
  if (current.length > 0) {
    lines.push(current);
  }
  // Note that the return value starts and ends with a newline. That's
  // handy for cutting / pasting a region of lines.
  return lines.join('\n') + '\n';
};
