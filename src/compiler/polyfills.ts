/**
 * Polyfills for the compiler.js binary.
 * It is meant to run in a barebones v8 environment.
 * That means no builtins provided by either Node.js or Browsers.
 * This includes: setTimeout, Node, self, etc.
 *
 * @fileoverview
 */

globalThis.self = globalThis as any;

globalThis.Node = {
  ELEMENT_NODE: 1,
  ATTRIBUTE_NODE: 2,
  TEXT_NODE: 3,
  CDATA_SECTION_NODE: 4,
  PROCESSING_INSTRUCTION_NODE: 7,
  COMMENT_NODE: 8,
  DOCUMENT_NODE: 9,
  DOCUMENT_TYPE_NODE: 10,
  DOCUMENT_FRAGMENT_NODE: 11,
} as any;

export {};
