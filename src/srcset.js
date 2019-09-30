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

import {devAssert, userAssert} from './log';

/**
 * A single source within a srcset. Only one: width or DPR can be specified at
 * a time.
 * @typedef {{
 *   url: string,
 *   width: (number|undefined),
 *   dpr: (number|undefined)
 * }}
 */
let SrcsetSourceDef;

/**
 * General grammar: (URL [NUM[w|x]],)*
 * Example 1: "image1.png 100w, image2.png 50w"
 * Example 2: "image1.png 2x, image2.png"
 * Example 3: "image1,100w.png 100w, image2.png 50w"
 */
const srcsetRegex = /(\S+)(?:\s+(?:(-?\d+(?:\.\d+)?)([a-zA-Z]*)))?\s*(?:,|$)/g;

/**
 * Extracts `srcset` and fallbacks to `src` if not available.
 * @param {!Element} element
 * @return {!Srcset}
 */
export function srcsetFromElement(element) {
  const srcsetAttr = element.getAttribute('srcset');
  if (srcsetAttr) {
    return parseSrcset(srcsetAttr);
  }
  // We can't push `src` via `parseSrcset` because URLs in `src` are not always
  // RFC compliant and can't be easily parsed as an `srcset`. For instance,
  // they sometimes contain space characters.
  const srcAttr = userAssert(
    element.getAttribute('src'),
    'Either non-empty "srcset" or "src" attribute must be specified: %s',
    element
  );
  return srcsetFromSrc(srcAttr);
}

/**
 * Creates a Srcset from a `src` attribute value.
 * @param {string} src
 * @return {!Srcset}
 */
export function srcsetFromSrc(src) {
  return new Srcset([{url: src, width: undefined, dpr: 1}]);
}

/**
 * Parses the text representation of srcset into Srcset object.
 * See https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img#Attributes.
 * See http://www.w3.org/html/wg/drafts/html/master/semantics.html#attr-img-srcset.
 * @param {string} s
 * @return {!Srcset}
 */
export function parseSrcset(s) {
  const sources = [];
  let match;
  while ((match = srcsetRegex.exec(s))) {
    const url = match[1];
    let width, dpr;
    if (match[2]) {
      const type = match[3].toLowerCase();
      if (type == 'w') {
        width = parseInt(match[2], 10);
      } else if (type == 'x') {
        dpr = parseFloat(match[2]);
      } else {
        continue;
      }
    } else {
      // If no "w" or "x" specified, we assume it's "1x".
      dpr = 1;
    }
    sources.push({url, width, dpr});
  }
  return new Srcset(sources);
}

/**
 * A srcset object contains one or more sources.
 *
 * There are two types of sources: width-based and DPR-based. Only one type
 * of sources allowed to be specified within a single srcset. Depending on a
 * usecase, the components are free to choose any source that best corresponds
 * to the required rendering quality and network and CPU conditions. See
 * "select" method for details on how this selection is performed.
 *
 * See https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img#Attributes
 */
export class Srcset {
  /**
   * @param {!Array<!SrcsetSourceDef>} sources
   */
  constructor(sources) {
    userAssert(sources.length > 0, 'Srcset must have at least one source');
    /** @private @const {!Array<!SrcsetSourceDef>} */
    this.sources_ = sources;

    // Only one type of source specified can be used - width or DPR.
    let hasWidth = false;
    let hasDpr = false;
    for (let i = 0; i < sources.length; i++) {
      const source = sources[i];
      hasWidth = hasWidth || !!source.width;
      hasDpr = hasDpr || !!source.dpr;
    }
    userAssert(
      !!(hasWidth ^ hasDpr),
      'Srcset must have width or dpr sources, but not both'
    );

    // Source and assert duplicates.
    sources.sort(hasWidth ? sortByWidth : sortByDpr);

    /** @private @const {boolean} */
    this.widthBased_ = hasWidth;
  }

  /**
   * Performs selection for specified width and DPR. Here, width is the width
   * in screen pixels and DPR is the device-pixel-ratio or pixel density of
   * the device. Depending on the circumstances, such as low network conditions,
   * it's possible to manipulate the result of this method by passing a lower
   * DPR value.
   *
   * The source selection depends on whether this is width-based or DPR-based
   * srcset.
   *
   * In a width-based source, the source's width is the physical width of a
   * resource (e.g. an image). Depending on the provided DPR, this width is
   * converted to the screen pixels as following:
   *   pixelWidth = sourceWidth / DPR
   *
   * Then, the source closest to the requested "width" is selected using
   * the "pixelWidth". The slight preference is given to the bigger sources to
   * ensure the most optimal quality.
   *
   * In a DPR-based source, the source's DPR is used to return the source that
   * is closest to the requested DPR.
   *
   * Based on
   * http://www.w3.org/html/wg/drafts/html/master/semantics.html#attr-img-srcset.
   * @param {number} width
   * @param {number} dpr
   * @return {string}
   */
  select(width, dpr) {
    devAssert(width, 'width=%s', width);
    devAssert(dpr, 'dpr=%s', dpr);
    let index = 0;
    if (this.widthBased_) {
      index = this.selectByWidth_(width * dpr);
    } else {
      index = this.selectByDpr_(dpr);
    }
    return this.sources_[index].url;
  }

  /**
   * @param {number} width
   * @return {number}
   * @private
   */
  selectByWidth_(width) {
    const sources = this.sources_;
    let minIndex = 0;
    let minScore = Infinity;
    let minWidth = Infinity;

    for (let i = 0; i < sources.length; i++) {
      const sWidth = sources[i].width;
      const score = Math.abs(sWidth - width);

      // Select the one that is closer with a slight preference toward larger
      // widths. If smaller size is closer, enforce minimum ratio to ensure
      // image isn't too distorted.
      if (score <= minScore * 1.1 || width / minWidth > 1.2) {
        minIndex = i;
        minScore = score;
        minWidth = sWidth;
      } else {
        break;
      }
    }
    return minIndex;
  }

  /**
   * @param {number} dpr
   * @return {number}
   * @private
   */
  selectByDpr_(dpr) {
    const sources = this.sources_;
    let minIndex = 0;
    let minScore = Infinity;

    for (let i = 0; i < sources.length; i++) {
      const score = Math.abs(sources[i].dpr - dpr);
      if (score <= minScore) {
        minIndex = i;
        minScore = score;
      } else {
        break;
      }
    }
    return minIndex;
  }

  /**
   * Returns all URLs in the srcset.
   * @return {!Array<string>}
   */
  getUrls() {
    return this.sources_.map(s => s.url);
  }

  /**
   * Reconstructs the string expression for this srcset.
   * @param {function(string):string=} opt_mapper
   * @return {string}
   */
  stringify(opt_mapper) {
    const res = [];
    const sources = this.sources_;
    for (let i = 0; i < sources.length; i++) {
      const source = sources[i];
      let src = source.url;
      if (opt_mapper) {
        src = opt_mapper(src);
      }
      if (this.widthBased_) {
        src += ` ${source.width}w`;
      } else {
        src += ` ${source.dpr}x`;
      }
      res.push(src);
    }
    return res.join(', ');
  }
}

/**
 * Sorts by width
 *
 * @param {number} s1
 * @param {number} s2
 * @return {number}
 */
function sortByWidth(s1, s2) {
  userAssert(s1.width != s2.width, 'Duplicate width: %s', s1.width);
  return s1.width - s2.width;
}

/**
 * Sorts by dpr
 *
 * @param {!Object} s1
 * @param {!Object} s2
 * @return {number}
 */
function sortByDpr(s1, s2) {
  userAssert(s1.dpr != s2.dpr, 'Duplicate dpr: %s', s1.dpr);
  return s1.dpr - s2.dpr;
}
