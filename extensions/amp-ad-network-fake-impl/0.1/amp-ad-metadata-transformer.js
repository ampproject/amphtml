import {parseJson} from '#core/types/object/json';

import {user} from '#utils/log';

export class AmpAdMetadataTransformer {
  /** constructor */
  constructor() {
    /** @public {JsonObject} */
    this.metadata = {};
    /** @private {!Array<Object>} */
    this.styles_ = [];
    /** @private {!Array<Object>} */
    this.extensions_ = [];
    /** @private {Element} */
    this.firstRuntimeElement_ = null;
    /** @private {Element} */
    this.lastRuntimeElement_ = null;
    /** @private {string} */
    this.ctaType_ = '';
    /** @private {string} */
    this.ctaUrl_ = '';
    /** @private {!Array<string>} */
    this.jsonMetadata_ = [];
    /** @private {!Array<Object>} */
    this.imgMetadata_ = [];
    /** @private {Element} */
    this.ampAnalytics_ = null;
  }

  /**
   * Creates a JSON metadata in which custom stylesheets, extensions
   * and runtime offsets are recorded. This is used by AMP4ADS at runtime
   * for embedding an ad into an enclosing document.
   * Please note: once runtime offsets are computed the document must not
   * change.
   *
   * @param {Document} doc
   * @return {string}
   */
  generateMetadata(doc) {
    const {head} = doc;
    this.generateHeadMetadata_(head);
    this.generateImageMetadata_(doc);
    this.generateJsonMetadata_(doc);

    // Creating json object from all of the components
    const creative = doc.documentElement./*OK*/ outerHTML;
    this.generateRuntimeOffsets_(creative);
    this.generateJsonOffsets_(creative);
    this.generateAmpAnalyticsOffsets_(doc, creative);
    this.addExtensionsMetadata_();

    if (this.styles_.length > 0) {
      this.metadata['customStyleSheets'] = this.styles_;
    }
    if (this.imgMetadata_.length > 0) {
      this.metadata['images'] = [];
      for (let i = 0; i < this.imgMetadata_.length; i++) {
        const img = this.imgMetadata_[i];
        this.metadata['images'].push(img.src);
      }
    }
    if (this.ctaType_) {
      this.metadata['ctaType'] = this.ctaType_;
    }
    if (this.ctaUrl_) {
      this.metadata['ctaUrl'] = this.ctaUrl_;
    }
    return JSON.stringify(this.metadata);
  }

  /**
   * Generates metadata from document head, including
   * runtime offsets, custom extensions, styles, and CTA
   * @param {Element} head
   */
  generateHeadMetadata_(head) {
    if (head == null) {
      return;
    }
    for (let i = 0; i < head.children.length; i++) {
      const child = head.children.item(i);
      if (child.tagName == 'SCRIPT' && child.hasAttribute('src')) {
        if (this.firstRuntimeElement_ == null) {
          this.firstRuntimeElement_ = child;
        }
        this.lastRuntimeElement_ = child;
        if (child.hasAttribute('custom-element')) {
          this.extensions_.push({
            'custom-element': child.getAttribute('custom-element'),
            'src': child.getAttribute('src'),
          });
        }
        if (child.hasAttribute('custom-template')) {
          this.extensions_.push({
            'custom-template': child.getAttribute('custom-template'),
            'src': child.getAttribute('src'),
          });
        }
      }
      if (
        child.tagName == 'LINK' &&
        child.getAttribute('rel') == 'stylesheet' &&
        child.hasAttribute('href')
      ) {
        this.generateStyleMetadata_(child);
      }
      if (
        child.tagName == 'META' &&
        child.hasAttribute('name') &&
        child.hasAttribute('content')
      ) {
        this.generateCtaMetadata_(child);
      }
    }
  }

  /**
   * Generates custom style metadata
   * @param {Element} element
   */
  generateStyleMetadata_(element) {
    const styleObject = {href: element.getAttribute('href')};
    if (element.hasAttribute('media')) {
      styleObject.media = element.getAttribute('media');
    }
    this.styles_.push(styleObject);
  }

  /**
   * Generates CTA metadata for story ads
   * @param {Element} element
   */
  generateCtaMetadata_(element) {
    if (element.getAttribute('name') == 'amp-cta-type') {
      this.ctaType_ = element.getAttribute('content');
    }
    if (element.getAttribute('name') == 'amp-cta-url') {
      this.ctaUrl_ = element.getAttribute('content');
    }
  }

  /**
   * Generates image metadata
   * @param {Document} doc
   */
  generateImageMetadata_(doc) {
    const imgs = doc.querySelectorAll('amp-img[src]');
    for (let i = 0; i < imgs.length; i++) {
      const img = imgs[i];
      let width;
      let height;
      let area = -1;
      if (img.hasAttribute('width')) {
        width = img.getAttribute('width');
      }
      if (img.hasAttribute('height')) {
        height = img.getAttribute('height');
      }
      if (height && width) {
        area = height * width;
      }
      this.imgMetadata_.push({
        src: img.getAttribute('src'),
        area,
      });
    }
  }

  /**
   * Finds all <script type=application/json> tags and parses
   * existing <amp-ad-metadata> script, if it exists
   * @param {Document} doc
   */
  generateJsonMetadata_(doc) {
    const json = doc.querySelectorAll('script[type]');
    for (let i = 0; i < json.length; i++) {
      const script = json[i];
      const type = script.getAttribute('type');
      if (type != 'application/json') {
        user().warn('SCRIPT', 'Type is invalid, must be `application/json`');
        continue;
      }
      if (script.hasAttribute('amp-ad-metadata')) {
        const parsed = parseJson(script.textContent);
        for (const attribute in parsed) {
          this.metadata[attribute] = parsed[attribute];
        }
      }
      if (
        script.hasAttribute('id') &&
        !this.jsonMetadata_.includes(script.getAttribute('id'))
      ) {
        this.jsonMetadata_.push(script.getAttribute('id'));
      }
    }
  }

  /**
   * Generates start and end of all runtime scripts,
   * so they can be extracted by amp-a4a.js
   * @param {string} creative
   */
  generateRuntimeOffsets_(creative) {
    let start = 0;
    let end = 0;
    if (this.firstRuntimeElement_ != null) {
      const firstRuntimeElementString =
        this.firstRuntimeElement_./*OK*/ outerHTML;
      const lastRuntimeElementString =
        this.lastRuntimeElement_./*OK*/ outerHTML;
      start = creative.indexOf(firstRuntimeElementString);
      end =
        creative.indexOf(lastRuntimeElementString) +
        lastRuntimeElementString.length;
    }
    this.metadata['ampRuntimeUtf16CharOffsets'] = [start, end];
  }

  /**
   * Generates start and end of all json scripts,
   * not including <amp-analytics> json
   * @param {string} creative
   */
  generateJsonOffsets_(creative) {
    if (this.jsonMetadata_.length > 0) {
      this.metadata['jsonUtf16CharOffsets'] = {};
      for (let i = 0; i < this.jsonMetadata_.length; i++) {
        const name = this.jsonMetadata_[i];
        const nameElementString = this.ampAnalytics_./*OK*/ innerHTML;
        const jsonStart = creative.indexOf(nameElementString);
        const jsonEnd = jsonStart + nameElementString.length;
        this.metadata['jsonUtf16CharOffsets'][name] = [jsonStart, jsonEnd];
      }
    }
  }
  /**
   * Generates start and end of all json scripts
   * within <amp-analytics> tags
   * @param {Document} doc
   * @param {string} creative
   */
  generateAmpAnalyticsOffsets_(doc, creative) {
    const ampAnalytics = doc.querySelectorAll('amp-analytics');
    if (ampAnalytics.length > 0) {
      if (!this.metadata['jsonUtf16CharOffsets']) {
        this.metadata['jsonUtf16CharOffsets'] = {};
      }
      this.metadata['jsonUtf16CharOffsets']['amp-analytics'] = [];
      for (let i = 0; i < ampAnalytics.length; i++) {
        const element = ampAnalytics[i];
        const nameElementString = element./*OK*/ innerHTML;
        const jsonStart = creative.indexOf(nameElementString);
        const jsonEnd = jsonStart + nameElementString.length;
        this.metadata['jsonUtf16CharOffsets']['amp-analytics'].push(jsonStart);
        this.metadata['jsonUtf16CharOffsets']['amp-analytics'].push(jsonEnd);
      }
    }
  }
  /**
   * Adds "customElementExtensions" and "extensions" objects to metadata
   */
  addExtensionsMetadata_() {
    if (this.extensions_.length > 0) {
      this.metadata['customElementExtensions'] = [];
      this.metadata['extensions'] = [];
      for (let i = 0; i < this.extensions_.length; i++) {
        const extension = this.extensions_[i];
        let custom;
        if (extension['custom-element'] != null) {
          custom = extension['custom-element'];
        } else {
          custom = extension['custom-template'];
        }
        if (this.metadata['customElementExtensions'].indexOf(custom) == -1) {
          this.metadata['customElementExtensions'].push(custom);
          this.metadata['extensions'].push({
            'custom-element': custom,
            'src': extension['src'],
          });
        }
      }
    }
  }
}
