/**
 * @fileoverview Externs for JSON types and helpers
 * @externs
 */

/**
 * A type for Objects that can be JSON serialized or that come from
 * JSON serialization. Requires the objects fields to be accessed with
 * bracket notation object['name'] to make sure the fields do not get
 * obfuscated.
 *
 * Marking this as a constructor allows other types to extend it.
 * Marking this as a dict tells the compiler to check that properties are only
 * accessed using bracket notation.
 * @constructor
 * @dict
 */
let JsonObject;
