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

import {dev, user} from './log';


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
  const srcAttr = user().assert(element.getAttribute('src'),
      'Either non-empty "srcset" or "src" attribute must be specified: %s',
      element);
  return new Srcset([{url: srcAttr, width: undefined, dpr: 1}]);
}


/**
 * Parses the text representation of srcset into Srcset object.
 * See https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img#Attributes.
 * See http://www.w3.org/html/wg/drafts/html/master/semantics.html#attr-img-srcset.
 * @param {string} s
 * @param {!Element=} opt_element
 * @return {!Srcset}
 */
export function parseSrcset(s, opt_element) {
  // General grammar: (URL [NUM[w|x]],)*
  // Example 1: "image1.png 100w, image2.png 50w"
  // Example 2: "image1.png 2x, image2.png"
  // Example 3: "image1,100w.png 100w, image2.png 50w"
  const sSources = s.match(
      /\s*(?:[\S]*)(?:\s+(?:-?(?:\d+(?:\.(?:\d+)?)?|\.\d+)[a-zA-Z]))?(?:\s*,)?/g
  );
  user().assert(sSources.length > 0,
      'srcset has to have at least one source: %s',
      opt_element);
  const sources = [];
  for (let i = 0; i < sSources.length; i++) {
    let sSource = sSources[i].trim();
    if (sSource.substr(-1) == ',') {
      sSource = sSource.substr(0, sSource.length - 1).trim();
    }
    const parts = sSource.split(/\s+/, 2);
    if (parts.length == 0 ||
          parts.length == 1 && !parts[0] ||
          parts.length == 2 && !parts[0] && !parts[1]) {
      continue;
    }
    const url = parts[0];
    if (parts.length == 1 || parts.length == 2 && !parts[1]) {
      // If no "w" or "x" specified, we assume it's "1x".
      sources.push({url, width: undefined, dpr: 1});
    } else {
      const spec = parts[1].toLowerCase();
      const lastChar = spec.substring(spec.length - 1);
      if (lastChar == 'w') {
        sources.push({url, width: parseFloat(spec), dpr: undefined});
      } else if (lastChar == 'x') {
        sources.push({url, width: undefined, dpr: parseFloat(spec)});
      }
    }
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
    user().assert(sources.length > 0, 'Srcset must have at least one source');
    /** @private @const {!Array<!SrcsetSourceDef>} */
    this.sources_ = sources;

    // Only one type of source specified can be used - width or DPR.
    let hasWidth = false;
    let hasDpr = false;
    for (let i = 0; i < this.sources_.length; i++) {
      const source = this.sources_[i];
      user().assert(
          (source.width || source.dpr) && (!source.width || !source.dpr),
          'Either dpr or width must be specified');
      hasWidth = hasWidth || !!source.width;
      hasDpr = hasDpr || !!source.dpr;
    }
    user().assert(!hasWidth || !hasDpr,
        'Srcset cannot have both width and dpr sources');

    // Source and assert duplicates.
    if (hasWidth) {
      this.sources_.sort(sortByWidth);
    } else {
      this.sources_.sort(sortByDpr);
    }

    /** @private @const {boolean} */
    this.widthBased_ = hasWidth;

    /** @private @const {boolean} */
    this.dprBased_ = hasDpr;
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
   * @return {!SrcsetSourceDef}
   */
  select(width, dpr) {
    dev().assert(width, 'width=%s', width);
    dev().assert(dpr, 'dpr=%s', dpr);
    let index = -1;
    if (this.widthBased_) {
      index = this.selectByWidth_(width, dpr);
    } else if (this.dprBased_) {
      index = this.selectByDpr_(width, dpr);
    }
    if (index != -1) {
      return this.sources_[index];
    }
    return this.getLast();
  }

  /**
   * @param {number} width
   * @param {number} dpr
   * @return {number}
   * @private
   */
  selectByWidth_(width, dpr) {
    const length = this.sources_.length;
    let prevWidth = -Infinity;
    for (let i = length - 1; i >= 0; i--) {
      const source = this.sources_[i];
      const sourceWidth = source.width / dpr;
      // First candidate width that's equal or higher than the requested width
      // will stop the search.
      if (sourceWidth >= width) {
        // The right value is now between `i` and `i + 1` - select the one
        // that is closer with a slight preference toward higher numbers.
        const delta = sourceWidth - width;
        const prevDelta = (width - prevWidth) * 1.1;
        // If smaller size is closer, enfore minimum ratio between
        // requested width and prevWidth to ensure image isn't too distorted.
        if (prevDelta < delta && width / prevWidth <= 1.2) {
          return i + 1;
        }
        return i;
      }
      prevWidth = sourceWidth;
    }
    // Use the first (maximum) value.
    return 0;
  }

  /**
   * @param {number} _width
   * @param {number} dpr
   * @return {number}
   * @private
   */
  selectByDpr_(_width, dpr) {
    let minIndex = -1;
    let minScore = 1000000;
    for (let i = 0; i < this.sources_.length; i++) {
      const source = this.sources_[i];
      // Default DPR = 1.
      const sourceDpr = source.dpr || 1;
      const score = Math.abs(sourceDpr - dpr);
      if (score < minScore) {
        minScore = score;
        minIndex = i;
      }
    }
    return minIndex;
  }

  /**
   * Returns the last source in the srcset, which is the default source.
   * @return {!SrcsetSourceDef}
   */
  getLast() {
    return this.sources_[this.sources_.length - 1];
  }

  /**
   * Returns all sources in the srcset.
   * @return {!Array<!SrcsetSourceDef>}
   */
  getSources() {
    return this.sources_;
  }

  /**
   * Reconstructs the string expression for this srcset.
   * @return {string}
   */
  stringify() {
    const res = [];
    for (let i = 0; i < this.sources_.length; i++) {
      const source = this.sources_[i];
      if (source.width) {
        res.push(`${source.url} ${source.width}w`);
      } else if (source.dpr) {
        res.push(`${source.url} ${source.dpr}x`);
      } else {
        res.push(`${source.url}`);
      }
    }
    return res.join(', ');
  }
}

function sortByWidth(s1, s2) {
  user().assert(s1.width != s2.width, 'Duplicate width: %s', s1.width);
  return s2.width - s1.width;
}

function sortByDpr(s1, s2) {
  user().assert(s1.dpr != s2.dpr, 'Duplicate dpr: %s', s1.dpr);
  return s2.dpr - s1.dpr;
}
