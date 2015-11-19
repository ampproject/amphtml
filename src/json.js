/**
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
 * limitations under the License.
 */

/**
 * @fileoverview This module declares JSON types as defined in the
 * {@link http://json.org/}.
 */


/**
 * JSON scalar. It's either string, number or boolean.
 * @typedef {string|number|boolean}
 */
let JSONScalar;


/**
 * JSON object. It's a map with string keys and JSON values.
 * @typedef {!Object<string, ?JSONValue>}
 */
let JSONObject;


/**
 * JSON array. It's an array with JSON values.
 * @typedef {!Array<?JSONValue>}
 */
let JSONArray;


/**
 * JSON value. It's either a scalar, an object or an array.
 * @typedef {!JSONScalar|!JSONObject|!JSONArray}
 */
let JSONValue;
