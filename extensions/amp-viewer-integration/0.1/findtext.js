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
    this.max_ = max;
    this.buff_ = [];
    this.next_ = 0;
  }

  add(item) {
    this.buff_[this.next_] = item;
    this.next_ = (this.next_ + 1) % this.max_;
  }

  /**
   * @param {number} index The index of an element to get.
   */
  get(index) {
    if (this.buff_.length >= this.max_) {
      index = (this.next_ + index) % this.max_;
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
   * @param {number} offset
   */
  constructor(node, offset) {
    this.node = node;
    this.offset = offset;
  }

  /**
   * @return {number}
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
 * @param {string} c input char to normalize.
 * @return {string}
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
 * @param {string} s input string to normalize.
 * @return {string}
 */
export const normalizeString = function(s) {
  const buf = [];
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
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
  const scanner = new TextScanner(node);
  const matches = [];
  for (let senIdx = 0; senIdx < sentences.length; senIdx++) {
    const sen = normalizeString(sentences[senIdx]);
    if (!sen) {
      continue;
    }
    // BM-algorithm with bad-character rules.
    const skipTable = {};
    for (let i = 0; i < sen.length; i++) {
      const c = sen[i];
      skipTable[c] = sen.length - 1 - i;
    }
    const buf = new CircularBuffer(sen.length);
    let index = -1;
    let nextIndex = sen.length - 1;
    while (true) {
      const pos = scanner.next();
      if (pos == null) {
        // mismatch
        return null;
      }
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
        const c = normalizeChar(buf.get(sen.length - j - 1).char);
        if (sen[sen.length - 1 - j] == c) {
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
        const endPos = buf.get(sen.length - 1);
        matches.push(new TextRange(
            buf.get(0), new TextPos(endPos.node, endPos.offset + 1)));
        break;
      }
    }
  }
  return matches.length > 0 ? matches : null;
};

/**
 * @param {!Array<!TextRange>} ranges
 * @return {!Array<!Element>} A list of marked nodes.
 */
export const markTextRangeList = function(ranges) {
  ranges = concatContinuousRanges(ranges);
  const marked = [];
  for (let i = 0; i < ranges.length; i++) {
    const r = ranges[i];
    markTextRange(r.start, r.end, ranges, i, marked);
  }
  return marked;
};

/**
 * @param {!Array<!TextRange>} ranges
 * @return {!Array<!TextRange>}
 */
const concatContinuousRanges = function(ranges) {
  const ret = [];
  let prev = null;
  for (let i = 0; i < ranges.length; i++) {
    const r = ranges[i];
    if (prev && prev.end.node == r.start.node &&
        prev.end.offset == r.start.offset) {
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
 * @param {number} idx
 * @param {!Array<!Element>} marked
 */
const markTextRange = function(start, end, ranges, idx, marked) {
  while (true) {
    if (start.node == end.node) {
      const newText = markSingleTextNode(
          start.node, start.offset, end.offset, marked);
      if (!newText) {
        return;
      }
      for (let i = idx + 1; i < ranges.length; i++) {
        const r = ranges[i];
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
    const next = nextTextNode(start.node);
    markSingleTextNode(
        start.node, start.offset, start.node.wholeText.length, marked);
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
 * @param {number} start
 * @param {number} end
 * @return {?Text}
 * @param {!Array<!Element>} marked
 */
const markSingleTextNode = function(node, start, end, marked) {
  if (start >= end) {
    // Do nothing
    return null;
  }
  const parent = node.parentNode;
  const text = node.wholeText;
  if (start > 0) {
    parent.insertBefore(document.createTextNode(
        text.substring(0, start)), node);
  }
  const span = document.createElement('span');
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
 * nextTextNode finds the next sibling text node or
 *   the next text node in the siblings of the parent.
 * @param {!Text} textNode The node to start to find the next text node.
 * @return {?Text}
 */
const nextTextNode = function(textNode) {
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
      const next = node.nextSibling;
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
 * A special TextPos object to represent a whitespace injected
 *   between two block nodes.
 * @type {!TextPos}
 */
const posDomDelimiter = new TextPos(document.createTextNode(' '), 0);

/**
 * TextScanner visits text nodes under a root node and
 *   returns charcter positions respectively.
 */
export class TextScanner {
  /**
   * @param {!Node} root The root node to visit.
   */
  constructor(root) {
    this.internal_ = new TextScannerInternal(root, false);
    this.next_ = this.internal_.next();
  }

  /**
   * next returns the next TextPos.
   * Returns null when the scanner reaches the end of the text.
   * @return {?TextPos}
   */
  next() {
    const ret = this.next_;
    if (ret == null) {
      return null;
    }
    this.next_ = this.internal_.next();
    if (this.next_ == null && /\s/.test(ret.char)) {
      // Remove the trailing space.
      return null;
    }
    return ret;
  }
}

export class TextScannerInternal {
  /**
   * @param {!Node} node The root node to visit.
   * @param {boolean} needSpace Whether spaces should be output if found.
   */
  constructor(node, needSpace) {
    this.node_ = node;
    this.needSpace_ = needSpace;

    this.textIdx_ = -1;
    this.child_ = null;
    this.putDomDelim_ = false;
    if (node instanceof Text) {
      this.textIdx_ = 0;
    } else if (node instanceof Element) {
      const style = computedStyle(window, node);
      if (style.display == 'none') {
        return;
      }
      if (this.needSpace_ && style.display != 'inline') {
        this.putDomDelim_ = true;
      }
      const child = node.firstChild;
      if (child != null) {
        this.child_ = new TextScannerInternal(child, this.needSpace_);
      }
    }
  }

  /**
   * @return {?TextPos}
   */
  next() {
    if (this.textIdx_ >= 0) {
      return this.nextTextPos_();
    }
    if (this.putDomDelim_) {
      this.putDomDelim_ = false;
      this.needSpace_ = false;
      return posDomDelimiter;
    }
    while (this.child_ != null) {
      const pos = this.child_.next();
      if (pos != null) {
        return pos;
      }
      this.needSpace_ = this.child_.needSpace_;
      const sibling = this.child_.node_.nextSibling;
      this.child_ = null;
      if (sibling != null) {
        this.child_ = new TextScannerInternal(sibling, this.needSpace_);
      }
    }
    return null;
  }

  /**
   * @return {?TextPos}
   */
  nextTextPos_() {
    const text = this.node_.wholeText;
    while (this.textIdx_ < text.length) {
      const idx = this.textIdx_;
      const c = text[idx];
      this.textIdx_++;
      if (/\s/.test(c)) {
        if (!this.needSpace_) {
          // Multiple spaces. Skip this char.
          continue;
        }
        this.needSpace_ = false;
      } else {
        this.needSpace_ = true;
      }
      return new TextPos(/**@type{!Text}*/(this.node_), idx);
    }
    return null;
  }
}
