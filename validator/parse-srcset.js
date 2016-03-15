/**
 * @license
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
 *
 * Credits:
 *   Original version of this file was derived from
 *   https://github.com/ampproject/amphtml/blob/master/src/srcset.js
 */
goog.provide('parse_srcset.Srcset');
goog.provide('parse_srcset.SrcsetSourceDef');
goog.provide('parse_srcset.parseSrcset');

/**
 * A single source within a srcset. Only one: width or DPR can be specified at
 * a time.
 * @typedef {{
 *   url: string,
 *   width: (number|undefined),
 *   dpr: (number|undefined)
 * }}
 */
parse_srcset.SrcsetSourceDef;

/**
 * Parses the text representation of srcset into Srcset object.
 * See https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img#Attributes.
 * See http://www.w3.org/html/wg/drafts/html/master/semantics.html#attr-img-srcset.
 * @param {string} srcset
 * @return {!parse_srcset.Srcset}
 * @export
 */
parse_srcset.parseSrcset = function(srcset) {
  // General grammar: (URL [NUM[w|x]],)*
  // Example 1: "image1.png 100w, image2.png 50w"
  // Example 2: "image1.png 2x, image2.png"
  // Example 3: "image1,100w.png 100w, image2.png 50w"
  const sSources = srcset.match(
      /\s*([^\s]*)(\s+(-?(\d+(\.(\d+)?)?|\.\d+)[a-zA-Z]))?(\s*,)?/g);
  // srcset has to have at least one source
  if (sSources.length == 0) return new parse_srcset.Srcset([]);
  const sources = [];
  sSources.forEach(sSource => {
    sSource = sSource.trim();
    if (sSource.substr(-1) == ',') {
      sSource = sSource.substr(0, sSource.length - 1).trim();
    }
    const parts = sSource.split(/\s+/, 2);
    if (parts.length == 0 ||
          parts.length == 1 && !parts[0] ||
          parts.length == 2 && !parts[0] && !parts[1]) {
      return;
    }
    const url = parts[0].trim();
    if (parts.length == 1 || parts.length == 2 && !parts[1]) {
      // If no "w" or "x" specified, we assume it's "1x".
      sources.push({url: url, dpr: 1});
    } else {
      const spec = parts[1].trim().toLowerCase();
      const lastChar = spec.substring(spec.length - 1);
      if (lastChar == 'w') {
        sources.push({url: url, width: parseFloat(spec)});
      } else if (lastChar == 'x') {
        sources.push({url: url, dpr: parseFloat(spec)});
      }
    }
  });
  return new parse_srcset.Srcset(sources);
};


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
parse_srcset.Srcset = class {
  /**
   * @param {!Array<!parse_srcset.SrcsetSourceDef>} sources
   */
  constructor(sources) {
    this.is_successful_ = true;
    // Srcset must have at least one source
    if (sources.length == 0 ) {
      this.is_successful_ = false;
      return;
    }
    /** @private @const {!Array<!parse_srcset.SrcsetSourceDef>} */
    this.sources_ = sources;

    // Only one type of source specified can be used - width or DPR.
    let hasWidth = false;
    let hasDpr = false;
    this.sources_.forEach(source => {
      // Either dpr or width must be specified
      if ((source.width && source.dpr) || (!source.width && !source.dpr)) {
        this.is_successful_ = false;
      }
      hasWidth = hasWidth || !!source.width;
      hasDpr = hasDpr || !!source.dpr;
    });
    if (!this.is_successful_) return;

    // Srcset cannot have both width and dpr sources
    if (hasWidth && hasDpr) {
      this.is_successful_ = false;
      return;
    }

    // Source and assert duplicates.
    let hasDuplicate = false;
    if (hasWidth) {
      this.sources_.sort((s1, s2) => {
        // Duplicate width
        if (s1.width == s2.width) hasDuplicate = true;
        return s2.width - s1.width;
      });
    } else {
      this.sources_.sort((s1, s2) => {
        // Duplicate dpr
        if (s1.dpr == s2.dpr) hasDuplicate = true;
        return s2.dpr - s1.dpr;
      });
    }
    if (hasDuplicate) {
      this.is_succesful_ = false;
      return;
    }

    /** @private @const {boolean} */
    this.widthBased_ = hasWidth;

    /** @private @const {boolean} */
    this.dprBased_ = hasDpr;
  }

  /**
   * Returns whether parsing sources was successful.
   * @return {!boolean}
   */
  isSuccessful() {
    return this.is_successful_;
  }

  /**
   * Returns all sources in the srcset.
   * @return {!Array<!parse_srcset.SrcsetSourceDef>}
   */
  getSources() {
    return this.sources_;
  }
}
