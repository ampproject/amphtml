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

import {computedStyle} from '../../../src/style';

/**
 * Simple implementation of CircularBuffer.
 * Exported for test only.
 */
export class CircularBuffer {
  constructor(max) {
    this.max_ = max
    this.buff_ = [];
    this.next_ = 0;
  }

  add(item) {
    this.buff_[this.next_] = item;
    this.next_ = (this.next_+1)%this.max_;
  }

  /**
   * @param {!number} index The index of an element to get.
   */
  get(index) {
    if (this.buff_.length >= this.max_) {
      index = (this.next_ + index)%this.max_;
    }
    return this.buff_[index];
  }
}

/**
 * TextPos is a pointer to a character in a Text node.
 * Exported for test only.
 */
export class TextPos {
  /**
   * @param {!Text} node
   * @param {!number} offset
   */
  constructor(node, offset) {
    this.node = node;
    this.offset = offset;
  }

  /**
   * @return {!number}
   */
  get char() {
    return this.node.wholeText[this.offset];
  }
}

/**
 * TextRange represents a text range.
 * Exported for test only.
 */
export class TextRange {
  /**
   * @param {!TextPos} start
   * @param {!TextPos} end
   */
  constructor(start, end) {
    this.start = start;
    this.end = end;
  }
}

const skipCharRe = /[,.\s\u2022()]/;

/**
 * @param {!string} c input char to normalize.
 * @return {!string}
 */
const normalizeChar = function(c) {
  if (c == '\u2019' || c == '\u2018') {
    return '\'';
  }
  if (c == '\u201c' || c == '\u201d') {
    return '"';
  }
  return c.toLowerCase();
};

/**
 * @param {!string} s input string to normalize.
 * @return {!string}
 */
export const normalizeString = function(s) {
  let buf = [];
  for (let c of s) {
    if (skipCharRe.test(c)) {
      continue;
    }
    buf.push(normalizeChar(c));
  }
  return buf.join('');
};

/**
 * findSentences find sentences from node and returns a list of TextRange.
 * @param {!Node} node
 * @param {!Array<string>} sentences
 * @return {?Array<!TextRange>}
 */
export const findSentences = function(node, sentences) {
  let scanner = scanText(node);
  let matches = [];
  for (let senIdx = 0; senIdx < sentences.length; senIdx++) {
    let sen = normalizeString(sentences[senIdx]);
    if (!sen) {
      continue;
    }
    // BM-algorithm with bad-character rules.
    let skipTable = {};
    for (let i = 0; i < sen.length; i++) {
      let c = sen[i];
      skipTable[c] = sen.length -1 - i;
    }
    let buf = new CircularBuffer(sen.length);
    let index = -1;
    let nextIndex = sen.length - 1;
    while (true) {
      let next = scanner.next();
      if (next.done) {
        // mismatch
        return null;
      }
      let pos = next.value;
      if (pos == posDomDelimiter || skipCharRe.test(pos.char)) {
        continue;
      }
      buf.add(pos);
      index++;
      if (index < nextIndex) {
        continue;
      }
      let ok = true;
      for (let j = 0; j < sen.length; j++) {
        let c = normalizeChar(buf.get(sen.length-j-1).char);
        if (sen[sen.length-1-j]==c) {
          continue;
        }
        ok = false;
        let skip = skipTable[c];
        if (skip == null) {
          skip = sen.length;
        }
        skip -= j;
        if (skip < 1) {
          skip = 1;
        }
        nextIndex += skip;
        break;
      }
      if (ok) {
        let endPos = buf.get(sen.length-1);
        matches.push(new TextRange(buf.get(0), new TextPos(endPos.node, endPos.offset+1)));
        break;
      }
    }
  }
  return matches.length > 0 ? matches : null;
};

/**
 * @params {!Array<!TextRange>} ranges
 * @return {!Array<!Element>} A list of marked nodes.
 */
export const markTextRangeList = function(ranges) {
  ranges = concatContinuousRanges(ranges);
  let marked = [];
  for (let i = 0; i < ranges.length; i++) {
    let r = ranges[i];
    markTextRange(r.start, r.end, ranges, i, marked);
  }
  return marked;
};

/**
 * @params {!Array<!TextRange>} ranges
 * @return {!Array<!TextRange>}
 */
const concatContinuousRanges = function(ranges) {
  let ret = [];
  let prev = null;
  for (let r of ranges) {
    if (prev && prev.end.node == r.start.node && prev.end.offset == r.start.offset) {
      prev.end = r.end;
      continue;
    }
    prev = r;
    ret.push(r);
    continue;
  }
  return ret;
};

/**
 * @param {!TextPos} start
 * @param {!TextPos} end
 * @param {!Array<TextRange>} ranges Other ranges
 * @param {!number} idx
 * @param {!Array<!Element>} marked
 */
const markTextRange = function(start, end, ranges, idx, marked) {
  while (true) {
    if (start.node == end.node) {
      let newText = markSingleTextNode(start.node, start.offset, end.offset, marked);
      if (!newText) {
        return;
      }
      for (let i = idx + 1; i < ranges.length; i++) {
        let r = ranges[i];
        if (end.node == r.start.node) {
          r.start.node = newText;
          r.start.offset -= end.offset;
        } else {
          break;
        }
        if (end.node == r.end.node) {
          r.end.node = newText;
          r.end.offset -= end.offset;
        } else {
          break;
        }
      }
      return;
    }
    let next = nextTextNode(start.node);
    markSingleTextNode(start.node, start.offset, start.node.wholeText.length, marked);
    if (!next) {
      break;
    }
    start = new TextPos(next, 0);
  }
};

/**
 * Wraps a text range [start, end) in a single text node.
 * Returns a text node for the suffix text if it exists.
 * @param {!Text} node
 * @param {!number} start
 * @param {!number} end
 * @return {?Text}
 * @param {!Array<!Element>} marked
 */
var markSingleTextNode = function(node, start, end, marked) {
  if (start >= end) {
    // Do nothing
    return null;
  }
  let parent = node.parentNode;
  let text = node.wholeText;
  if (start > 0) {
    parent.insertBefore(document.createTextNode(text.substring(0, start)), node);
  }
  let span = document.createElement('span');
  span.appendChild(document.createTextNode(text.substring(start, end)));
  parent.insertBefore(span, node);
  marked.push(span);

  let endText = null;
  if (end < text.length) {
    endText = document.createTextNode(text.substring(end));
    parent.insertBefore(endText, node);
  }
  parent.removeChild(node);
  return endText;
};


/**
 * nextTextNode finds the next sibling text node or the next text node in the siblings of the parent.
 * @param {!Text} textNode The node to start to find the next text node.
 * @return {?Text}
 */
let nextTextNode = function(textNode) {
  // If leaving is true, find the next node from siblings or the parent.
  // If leaving is false, find the next node from childrens.
  let leaving = true;
  /** @type {Node} */
  let node = textNode;
  while (true) {
    if (node == null) {
      // No more parent.
      return null;
    }
    if (leaving) {
      let next = node.nextSibling;
      if (next) {
        node = next;
        // visits childrens of node.
        leaving = false;
      } else {
        // back to the parent.
        node = node.parentNode;
      }
      continue;
    }
    if (node instanceof Text) {
      return node;
    }
    if (!node.firstChild) {
      leaving = true;
    } else {
      node = node.firstChild;
    }
  }
};


/**
 * A special TextPos object to represent a whitespace injected between two block nodes.
 * @type {!TextPos}
 * Exported for test only.
 */
export let posDomDelimiter = new TextPos(document.createTextNode(" "), 0);

/**
 * scanText visits DOM nodes under root and returns a generator to interate chars in all text nodes.
 *
 * @param {!Node} root The root node to visit.
 * @return {!Generator<!TextPos>}
 */
export const scanText = function*(root) {
  // Omit the last char if it's a space.
  let prev = null;
  for (let pos of scanTextInternal_(root, /*needSpace*/ false)) {
    if (prev) {
      yield prev;
    }
    prev = pos;
  }
  if (prev != posDomDelimiter && !/\s/.test(prev.char)) {
    yield prev;
  }
};

/**
 * @param {!Node} root The root node to visit.
 * @param {!boolean} needSpace Whether a whitespace should be emitted when it is found.
 * @return {!Generator<!TextPos>}
 */
let scanTextInternal_ = function*(node, needSpace) {
  if (node instanceof Text) {
    let text = node.wholeText;
    for (let i = 0; i < text.length; i++) {
      let c = text[i];
      if (/\s/.test(c)) {
        if (!needSpace) {
          // Multiple spaces.
          continue;
        }
        needSpace = false;
      } else {
        needSpace = true;
      }
      yield new TextPos(node, i);
    }
    return needSpace;
  }
  let style = computedStyle(window, node);
  if (style.display == 'none') {
    return needSpace;
  }
  let isInline = style.display == 'inline';
  if (needSpace && !isInline) {
    yield posDomDelimiter;
    needSpace = false;
  }
  let child = node.firstChild;
  while (child) {
    needSpace = yield* scanTextInternal_(child, needSpace);
    child = child.nextSibling;
  }
  if (needSpace && !isInline) {
    yield posDomDelimiter;
    needSpace = false;
  }
  return needSpace;
};
