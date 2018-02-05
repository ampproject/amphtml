/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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
import {dev} from '../../../src/log';
import {scopedQuerySelector, scopedQuerySelectorAll} from '../../../src/dom';

/**
 * A map of elements to delay showing the page.  The key is a DOM query to find
 * all elements that should wait for the specified event; the value is a factory
 * method that will return a PageElement to define rendering and loading
 * strategies.
 *
 * @const {!Object<string,
 *     !function(!Element, !./amp-story-page.AmpStoryPage): !PageElement>}
 */
const PAGE_ELEMENT_FACTORIES = {
  'amp-audio, amp-video, .i-amphtml-story-background-audio':
      (element, page) => new MediaElement(element, page),
  'amp-img, amp-anim':
      (element, page) => new ImageElement(element, page),
  '.i-amphtml-video-interface':
      (element, page) => new VideoInterfaceElement(element, page),
};


/**
 * CSS class for an element on an amp-story-page.
 * @const {string}
 */
const ELEMENT_CLASS_NAME = 'i-amphtml-story-page-element';


/**
 * CSS class for an element on an amp-story-page that indicates the element is
 * loaded.
 * @const {string}
 */
const ELEMENT_LOADED_CLASS_NAME = 'i-amphtml-story-page-element-loaded';


/**
 * CSS class for an element on an amp-story-page that indicates the element can
 * be shown in the UI.
 * @const {string}
 */
const ELEMENT_SHOW_CLASS_NAME = 'i-amphtml-story-page-element-shown';


/**
 * CSS class for an element on an amp-story-page that indicates the element has
 * failed to load.
 * @const {string}
 */
const ELEMENT_FAILED_CLASS_NAME = 'i-amphtml-story-page-element-failed';


/**
 * CSS class for an element on an amp-story-page that indicates the element was
 * hidden by a media query rule.
 * @const {string}
 */
const HIDDEN_BY_MEDIA_QUERY_CLASS_NAME = 'i-amphtml-hidden-by-media-query';


/**
 * The minimum amount of a media item (by percentage) that must be loaded in
 * order for that element to be considered "loaded".  Note that if the total
 * size cannot be determined, this criteria is simply ignored.
 */
const MINIMUM_MEDIA_BUFFER_PERCENTAGE_FROM_BEGINNING = 0.25;


/**
 * The minimum amount of a media item (in seconds) that must be loaded in order
 * for that element to be considered "loaded".
 */
const MINIMUM_MEDIA_BUFFER_SECONDS_FROM_BEGINNING = 3;



/**
 * Represents a single element on an <amp-story-page> that can affect the system
 * layer (e.g. by blocking loading or requiring an audio indicator).
 */
export class PageElement {
  /**
   * @param {!Element} element The element on the page.
   * @param {!./amp-story-page.AmpStoryPage} page The page that the element is on.
   */
  constructor(element, page) {
    /** @protected @const {!Element} */
    this.element = element;
    this.element.classList.add(ELEMENT_CLASS_NAME);

    /** @protected @const {!./amp-story-page.AmpStoryPage} */
    this.page = page;

    /** @public {boolean} */
    this.isLoaded = false;

    /** @public {boolean} */
    this.canBeShown = false;

    /** @public {boolean} */
    this.hasFailed = false;
  }

  /**
   * @return {boolean} Whether this element can be shown.
   * @protected
   */
  canBeShown_() {
    return false;
  }

  /**
   * @return {boolean} Whether this element is considered loaded.
   * @protected
   */
  isLoaded_() {
    return false;
  }

  /**
   * @return {boolean} Whether this element has failed to load.
   * @protected
   */
  hasFailed_() {
    return false;
  }

  /**
   * Updates the isLoaded, canBeShown, and hasFailed boolean states.
   */
  updateState() {
    if (!this.isLoaded && !this.hasFailed) {
      this.isLoaded = this.isLoaded_();
      this.element.classList
          .toggle(ELEMENT_LOADED_CLASS_NAME, /* force */ this.isLoaded);
    }

    if (!this.hasFailed && !this.isLoaded) {
      this.hasFailed = this.hasFailed_();
      this.element.classList
          .toggle(ELEMENT_FAILED_CLASS_NAME, /* force */ this.hasFailed);
    }

    if (!this.canBeShown) {
      this.canBeShown = this.canBeShown_() || this.isLoaded;
      this.element.classList
          .toggle(ELEMENT_SHOW_CLASS_NAME, /* force */ this.canBeShown);
    }
  }

  /**
   * @return {boolean}
   */
  isHiddenByMediaQuery() {
    return this.element.classList.contains(HIDDEN_BY_MEDIA_QUERY_CLASS_NAME);
  }

  /**
   * Called when the page the element is on becomes active.
   */
  resumeCallback() {}

  /**
   * Called when the page the element is on is no longer active.
   */
  pauseCallback() {}

  /**
   * @return {boolean} Whether this element produces audio.
   */
  hasAudio() {
    return false;
  }

  /**
   * @param {!./amp-story-page.AmpStoryPage} page
   * @return {!Array<!PageElement>}
   */
  static getElementsFromPage(page) {
    const pageElements = [];

    Object.keys(PAGE_ELEMENT_FACTORIES).forEach(query => {
      const elements = scopedQuerySelectorAll(page.element, query);
      const factory = PAGE_ELEMENT_FACTORIES[query];
      Array.prototype.forEach.call(elements, element => {
        const pageElement = factory(element, page);
        pageElements.push(pageElement);
      });
    });

    return pageElements;
  }
}

class MediaElement extends PageElement {
  constructor(element, page) {
    super(element, page);

    /** @private {?HTMLMediaElement} */
    this.mediaElement_ = null;

    /** @private {boolean} */
    this.manualLoadInitiatedOnBuild_ = false;
  }

  /**
   * @return {?HTMLMediaElement}
   * @private
   */
  getMediaElement_() {
    if (this.element instanceof HTMLMediaElement) {
      this.mediaElement_ = this.element;
    } else if (!this.mediaElement_) {
      const el = scopedQuerySelector(this.element, 'audio, video');
      if (el instanceof HTMLMediaElement) {
        this.mediaElement_ = /** @type {!HTMLMediaElement} */ (el);
      }
    }
    return this.mediaElement_;
  }

  /** @override */
  canBeShown_() {
    const mediaElement = this.getMediaElement_();
    if (!mediaElement) {
      return false;
    }

    return mediaElement.readyState >= 2 || mediaElement.hasAttribute('poster');
  }

  /** @override */
  resumeCallback() {
    this.maybeManuallyForceLoading_();
  }

  /** @private */
  maybeManuallyForceLoading_() {
    const mediaElement = this.getMediaElement_();
    if (!mediaElement ||
        (mediaElement.buffered && mediaElement.buffered.length > 0)) {
      return;
    }

    mediaElement.load();
  }

  /** @override */
  isLoaded_() {
    const mediaElement = this.getMediaElement_();
    const firstTimeRangeOrNull = this.getFirstTimeRange_();

    if (!mediaElement) {
      return false;
    }

    if (!mediaElement.buffered || mediaElement.buffered.length === 0) {
      if (!this.manualLoadInitiatedOnBuild_) {
        this.maybeManuallyForceLoading_();
        this.manualLoadInitiatedOnBuild_ = true;
      }
      return false;
    }

    const firstTimeRange = dev().assertNumber(firstTimeRangeOrNull,
        'No first time range was found, despite media element existing.');
    const bufferedSeconds = mediaElement.buffered.end(firstTimeRange);
    const bufferedPercentage =
        (mediaElement.buffered.end(firstTimeRange) / mediaElement.duration);

    return bufferedSeconds >= MINIMUM_MEDIA_BUFFER_SECONDS_FROM_BEGINNING ||
        bufferedPercentage >= MINIMUM_MEDIA_BUFFER_PERCENTAGE_FROM_BEGINNING;
  }

  /** @override */
  hasFailed_() {
    const mediaElement = this.getMediaElement_();
    return !!mediaElement.error;
  }

  /**
   * @return {?number} The numbered index of the first buffered time range in
   *     this media element.
   */
  getFirstTimeRange_() {
    const mediaElement = this.getMediaElement_();
    if (mediaElement) {
      for (let i = 0; i < mediaElement.buffered.length; i++) {
        if (mediaElement.buffered.start(i) === 0) {
          return i;
        }
      }
    }

    return null;
  }

  /** @override */
  hasAudio() {
    return true;
  }
}

class ImageElement extends PageElement {
  constructor(element, page) {
    super(element, page);

    /**
     * @private {?HTMLImageElement}
     */
    this.imageElement_ = null;
  }

  /**
   * @return {?HTMLImageElement}
   * @private
   */
  getImageElement_() {
    if (this.element instanceof HTMLImageElement) {
      this.imageElement_ = this.element;
    } else if (!this.imageElement_) {
      const el = scopedQuerySelector(this.element, 'img');
      if (el instanceof HTMLImageElement) {
        this.imageElement_ = /** @type {!HTMLImageElement} */ (el);
      }
    }
    return this.imageElement_;
  }

  /** @override */
  isLoaded_() {
    const imageElement = this.getImageElement_();
    return Boolean(imageElement && imageElement.complete &&
        imageElement.naturalWidth && imageElement.naturalHeight);
  }

  /** @override */
  hasFailed_() {
    const imageElement = this.getImageElement_();
    return Boolean(imageElement && imageElement.complete &&
        (imageElement.naturalWidth === 0 || imageElement.naturalHeight === 0));
  }

  /** @override */
  hasAudio() {
    return false;
  }
}

class VideoInterfaceElement extends PageElement {
  /** @private */
  isLaidOut_() {
    return this.element.hasAttribute('i-amphtml-layout');
  }

  /** @override */
  isLoaded_() {
    return this.isLaidOut_();
  }

  /** @override */
  hasFailed_() {
    return !this.isLaidOut_();
  }

  /** @override */
  hasAudio() {
    return true;
  }
}
