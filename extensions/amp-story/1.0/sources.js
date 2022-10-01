import {removeElement} from '#core/dom';
import {toArray} from '#core/types/array';

import {ampMediaElementFor} from './utils';

/**
 * Class handling HTMLMediaElements sources.
 */
export class Sources {
  /**
   * @param {?string=} srcAttr The 'src' attribute of the media element.
   * @param {!Array<!Element>=} srcEls Any child <source> tags of the
   *     media element.
   * @param {!Array<!Element>=} trackEls Any child <track> tags of the
   *     media element.
   */
  constructor(srcAttr = null, srcEls = [], trackEls = []) {
    /** @private @const {?string} */
    this.srcAttr_ = srcAttr;

    /** @private @const {!Array<!Element>} */
    this.srcEls_ = srcEls;

    /** @private @const {!Array<!Element>} */
    this.trackEls_ = trackEls;
  }

  /**
   * Applies track tags to a specified element. This is done in a separate
   * method from the source tags, because we must wait for "loadedmetadata"
   * video event before doing this.
   * @param {!HTMLMediaElement} element The element to adopt the text tracks
   *     represented by this object.
   * @private
   */
  applyTracksToElement_(element) {
    this.trackEls_.forEach((trackEl) => {
      const track = document.createElement('track');
      track.id = trackEl.id;
      track.kind = trackEl.kind;
      track.label = trackEl.label;
      track.srclang = trackEl.srclang;
      track.default = trackEl.default;
      track.src = trackEl.src;
      track.addEventListener('load', () => {
        track.mode = 'showing';
        element.textTracks[0].mode = 'showing';
      });
      element.appendChild(track);
    });
  }

  /**
   * Applies the src attribute and source tags to a specified element.
   * @param {!Window} win
   * @param {!HTMLMediaElement} element The element to adopt the sources
   *     represented by this object.
   */
  applyToElement(win, element) {
    Sources.removeFrom(win, element);

    if (!this.srcAttr_) {
      element.removeAttribute('src');
    } else {
      element.setAttribute('src', this.srcAttr_);
    }

    this.srcEls_.forEach((srcEl) => element.appendChild(srcEl));
    if (element.changedSources) {
      element.changedSources();
    }

    if (this.trackEls_.length > 0) {
      // Wait for "loadedmetadata" before adding tracks.
      // Firefox adds tracks, but does not toggle them on unless video metadata
      // is loaded first.
      if (element.readyState >= 1 /* HAVE_METADATA */) {
        this.applyTracksToElement_(element);
      } else {
        const addTracksHandler = () => {
          element.removeEventListener('loadedmetadata', addTracksHandler);
          this.applyTracksToElement_(element);
        };

        element.addEventListener('loadedmetadata', addTracksHandler);
      }
    }
  }

  /**
   * Removes and returns the sources from a specified element.
   * @param {!Window} win
   * @param {!Element} element The element whose sources should be removed and
   *     returned.
   * @return {!Sources} An object representing the sources of the specified
   *     element.
   */
  static removeFrom(win, element) {
    let elementToUse;
    if (element.tagName === 'VIDEO') {
      // A video element and its amp-video parent can each have different
      // sources. We prefer to remove and return the video's sources because
      // amp-video's sources are primarily those provided by the publisher's
      // whereas the video's sources are added and modified via amp-video JS.
      elementToUse = element;
    } else {
      elementToUse = ampMediaElementFor(element) || element;
    }

    let srcEl = null;
    // If the src attribute is specified, create a source element from it as it
    // prevents race conditions between amp-story and amp-video propagating or
    // removing attributes from amp-video/video elements.
    if (elementToUse.hasAttribute('src')) {
      srcEl = Sources.createSourceElement(win, elementToUse);
      elementToUse.removeAttribute('src');
    }

    const srcEls = toArray(elementToUse.querySelectorAll('source'));
    srcEls.forEach((srcEl) => removeElement(srcEl));

    const trackEls = toArray(elementToUse.querySelectorAll('track'));
    trackEls.forEach((trackEl) => removeElement(trackEl));

    // If the src attribute is present, browsers will follow it and ignore the
    // HTMLSourceElements. To ensure this behavior, drop the sources if the src
    // was specified.
    // cf: https://html.spec.whatwg.org/#concept-media-load-algorithm
    const sourcesToUse = srcEl ? [srcEl] : srcEls;

    return new Sources(null /** srcAttr */, sourcesToUse, trackEls);
  }

  /**
   * Creates a HTMLSourceElement from the element src attribute.
   * @param {!Window} win
   * @param {!Element} element
   * @return {!Element}
   */
  static createSourceElement(win, element) {
    const srcEl = win.document.createElement('source');

    const srcAttr = element.getAttribute('src');
    srcEl.setAttribute('src', srcAttr);

    const origSrcAttr = element.getAttribute('amp-orig-src');
    if (origSrcAttr) {
      srcEl.setAttribute('amp-orig-src', origSrcAttr);
    }

    const typeAttr = element.getAttribute('type');
    if (typeAttr) {
      srcEl.setAttribute('type', typeAttr);
    }

    return srcEl;
  }
}
