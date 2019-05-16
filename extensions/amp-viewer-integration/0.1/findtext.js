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
  /**
   * Creates an instance of CircularBuffer.
   * @param {number} max
   */
  constructor(max) {
    this.max_ = max;
    this.buff_ = [];
    this.next_ = 0;
  }

  /**
   * Adds item to buffer.
   *
   * @param {*} item
   */
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
 * TextPosDef is a pointer to a character in a Text node.
 * @typedef {{node: !Text, offset: number}}
 */
let TextPosDef;

/**
 * Returns a char pointed by pos.
 * @param {!TextPosDef} pos
 * @return {string}
 */
export function textPosChar(pos) {
  return pos.node.wholeText[pos.offset];
}

/**
 * TextRangeDef represents a text range.
 * @typedef {{start: !TextPosDef, end: !TextPosDef}}
 */
let TextRangeDef;

const skipCharRe = /[,.\s\u2022()]/;

/**
 * Canonicalizes a char to emulate the canonicalizion applied in backends
 * where texts to highlight are generated.
 * @param {string} c input char to canonicalize.
 * @return {string}
 */
function canonicalizeChar(c) {
  if (c == '\u2019' || c == '\u2018') {
    return "'";
  }
  if (c == '\u201c' || c == '\u201d') {
    return '"';
  }
  return c.toLowerCase();
}

/**
 * Canonicalizes a string to emulate the canonicalizion applied in backends
 * where texts to highlight are generated.
 * @param {string} s input string to canonicalize.
 * @return {string}
 */
export function canonicalizeString(s) {
  const buf = [];
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (skipCharRe.test(c)) {
      continue;
    }
    buf.push(canonicalizeChar(c));
  }
  return buf.join('');
}

/**
 * findSentences find sentences from node and returns a list of TextRangeDef.
 * @param {!Window} win
 * @param {!Node} node
 * @param {!Array<string>} sentences
 * @return {?Array<!TextRangeDef>}
 */
export function findSentences(win, node, sentences) {
  const scanner = new TextScanner(win, node);
  const matches = [];
  for (let senIdx = 0; senIdx < sentences.length; senIdx++) {
    const sen = canonicalizeString(sentences[senIdx]);
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
      if (skipCharRe.test(textPosChar(pos))) {
        continue;
      }
      buf.add(pos);
      index++;
      if (index < nextIndex) {
        continue;
      }
      let ok = true;
      for (let j = 0; j < sen.length; j++) {
        const c = canonicalizeChar(textPosChar(buf.get(sen.length - j - 1)));
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
        matches.push({
          start: buf.get(0),
          end: {node: endPos.node, offset: endPos.offset + 1},
        });
        break;
      }
    }
  }
  return matches.length > 0 ? matches : null;
}

/**
 * @param {!Window} win
 * @param {!Array<!TextRangeDef>} ranges
 * @return {!Array<!Element>} A list of marked nodes.
 */
export function markTextRangeList(win, ranges) {
  ranges = concatContinuousRanges(ranges);
  const marked = [];
  for (let i = 0; i < ranges.length; i++) {
    const r = ranges[i];
    markTextRange(win, r.start, r.end, ranges, i, marked);
  }
  return marked;
}

/**
 * @param {!Array<!TextRangeDef>} ranges
 * @return {!Array<!TextRangeDef>}
 */
function concatContinuousRanges(ranges) {
  const ret = [];
  let prev = null;
  for (let i = 0; i < ranges.length; i++) {
    const r = ranges[i];
    if (
      prev &&
      prev.end.node == r.start.node &&
      prev.end.offset == r.start.offset
    ) {
      prev.end = r.end;
      continue;
    }
    prev = r;
    ret.push(r);
    continue;
  }
  return ret;
}

/**
 * Fixes text ranges that point a text node removed when pos is marked.
 * @param {!TextPosDef} pos
 * @param {!Text} newText
 * @param {number} from
 * @param {!Array<TextRangeDef>} ranges
 */
function fixTextRangesWithRemovedText(pos, newText, from, ranges) {
  for (let i = from; i < ranges.length; i++) {
    const r = ranges[i];
    if (pos.node != r.start.node) {
      return;
    }
    r.start.node = newText;
    r.start.offset -= pos.offset;
    if (pos.node != r.end.node) {
      return;
    }
    r.end.node = newText;
    r.end.offset -= pos.offset;
  }
}

/**
 * @param {!Window} win
 * @param {!TextPosDef} start
 * @param {!TextPosDef} end
 * @param {!Array<TextRangeDef>} ranges Other ranges
 * @param {number} idx
 * @param {!Array<!Element>} marked
 */
function markTextRange(win, start, end, ranges, idx, marked) {
  while (true) {
    if (start.node == end.node) {
      const newText = markSingleTextNode(
        win,
        start.node,
        start.offset,
        end.offset,
        marked
      );
      if (newText) {
        fixTextRangesWithRemovedText(end, newText, idx + 1, ranges);
      }
      return;
    }
    const next = nextTextNode(win, start.node);
    markSingleTextNode(
      win,
      start.node,
      start.offset,
      start.node.wholeText.length,
      marked
    );
    if (!next) {
      break;
    }
    start = {node: next, offset: 0};
  }
}

/**
 * Wraps a text range [start, end) in a single text node.
 * Returns a text node for the suffix text if it exists.
 * @param {!Window} win
 * @param {!Text} node
 * @param {number} start
 * @param {number} end
 * @return {?Text}
 * @param {!Array<!Element>} marked
 */
function markSingleTextNode(win, node, start, end, marked) {
  if (start >= end) {
    // Do nothing
    return null;
  }
  const doc = win.document;
  const {parentNode: parent, wholeText: text} = node;
  if (start > 0) {
    parent.insertBefore(doc.createTextNode(text.substring(0, start)), node);
  }
  const span = doc.createElement('span');
  span.appendChild(doc.createTextNode(text.substring(start, end)));
  parent.insertBefore(span, node);
  marked.push(span);

  let endText = null;
  if (end < text.length) {
    endText = doc.createTextNode(text.substring(end));
    parent.insertBefore(endText, node);
  }
  parent.removeChild(node);
  return endText;
}

/**
 * nextTextNode finds the next sibling text node or
 *   the next text node in the siblings of the parent.
 * @param {!Window} win
 * @param {!Text} textNode The node to start to find the next text node.
 * @return {?Text}
 */
function nextTextNode(win, textNode) {
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
    if (node instanceof win.Text) {
      return node;
    }
    if (!node.firstChild) {
      leaving = true;
    } else {
      node = node.firstChild;
    }
  }
}

/**
 * TextScanner visits text nodes under a root node and
 *   returns charcter positions respectively.
 */
export class TextScanner {
  /**
   * @param {!Window} win
   * @param {!Node} node The root node to visit.
   */
  constructor(win, node) {
    /** @const */
    this.win_ = win;
    /** @const */
    this.node_ = node;

    this.textIdx_ = -1;
    this.child_ = null;
    if (node instanceof win.Text) {
      this.textIdx_ = 0;
    } else if (node instanceof win.Element) {
      // Accessing display of computed styles does not force layout/reflow
      // unless media queries that require relayout are used.
      // https://jsfiddle.net/7c7rq2ot/
      //
      // Note this does not eliminate all hidden elements
      // (e.g. visibility:hidden).
      // TODO(yunabe): Support more hidden element patterns if necessary.
      const {display} = computedStyle(win, node);
      if (display == 'none') {
        return;
      }
      const child = node.firstChild;
      if (child != null) {
        this.child_ = new TextScanner(win, child);
      }
    }
  }

  /**
   * Returns the next TextPosDef.
   * Returns null when the scanner reaches the end of the text.
   * @return {?TextPosDef}
   */
  next() {
    if (this.textIdx_ >= 0) {
      return this.nextTextPos_();
    }
    while (this.child_ != null) {
      const pos = this.child_.next();
      if (pos != null) {
        return pos;
      }
      const sibling = this.child_.node_.nextSibling;
      this.child_ =
        sibling != null ? new TextScanner(this.win_, sibling) : null;
    }
    return null;
  }

  /**
   * @return {?TextPosDef}
   */
  nextTextPos_() {
    const text = this.node_.wholeText;
    while (this.textIdx_ < text.length) {
      const idx = this.textIdx_;
      this.textIdx_++;
      return {node: /**@type {!Text}*/ (this.node_), offset: idx};
    }
    return null;
  }
}
