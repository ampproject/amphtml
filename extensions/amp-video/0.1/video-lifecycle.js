import {assertHttpsUrl} from '../../../src/url';
import {
  createElementWithAttributes,
  scopedQuerySelector,
  childElementsByTag,
  scopedQuerySelectorAll,
  removeElement,
} from '../../../src/dom';
import {
  setImportantStyles,
} from '../../../src/style';
import {Services} from '../../../src/services';
import {
  isCachedByCdn,
  createSourceElement,
} from './utils';
import {getMode} from '../../../src/mode';
import {dev, user} from '../../../src/log';
import {isLayoutSizeDefined} from '../../../src/layout';
import {EMPTY_METADATA} from '../../../src/mediasession-helper';
import {VisibilityState} from '../../../src/visibility-state';
import {listen, listenOnce, listenOncePromise} from '../../../src/event-helper';
import {toArray} from '../../../src/types';
import {MediaType} from '../../../src/service/media-pool-impl';
import {VideoEvents} from '../../../src/video-interface';


/** @private {!Array<string>} */
const ATTRS_TO_PROPAGATE_ON_BUILD = [
  'aria-describedby',
  'aria-label',
  'aria-labelledby',
  'controls',
  'crossorigin',
  'disableremoteplayback',
  'poster',
  'controlsList',
];

/**
 * @note Do not propagate `autoplay`. Autoplay behaviour is managed by
 *       video manager since amp-video implements the VideoInterface.
 * @private {!Array<string>}
 */
const ATTRS_TO_PROPAGATE_ON_LAYOUT = ['loop', 'preload'];


export class VideoProperties {
  /**
   * @param {!AmpVideoDef} component
   * @param {?function(!Element):boolean} isValidSourceFn Optional predicate for
   *    filtering all source elements.
   */
  constructor(component, isValidSourceFn = null) {
    /** @private @const {!AmpVideoDef>} */
    this.component_ = component;

    /** @private @const {!Element} */
    this.element_ = component.element;

    /** @private @const {!function(!Element):boolean} */
    this.isValidSource_ = isValidSourceFn || (unused => true);

    /** @private @const {?Array<!Element>} */
    this.allChildren_ = null;

    /** @private @const {?Array<!Element>} */
    this.cachedSources_ = null;

    /** @private {boolean} */
    this.movedCachedSrcToSource_ = false;
  }

  lifecycleFor(video) {
    return new VideoLifecycle(this, this.element_, video);
  }

  /**
   * Propagates attributes and children on layout.
   * Only cached sources will be added on prerender. Once the document becomes
   * visible,
   * @param {!HTMLMediaElement} video
   * @param {function():boolean} isSuspendedFn Callback that determines whether
   *   usage of this <video> has been suspended for this media.
   */
  propagateOnLayout(video, isSuspendedFn) {
    const viewer = Services.viewerForDoc(this.element_);

    this.component_.propagateAttributes(ATTRS_TO_PROPAGATE_ON_LAYOUT, video,
        /* opt_removeMissingAttrs */ true);

    this.getCachedSources_().forEach(source => video.appendChild(source));

    // If we are in prerender mode, only propagate cached sources and then
    // when document becomes visible propagate origin sources and other children
    // If not in prerender mode, propagate everything.
    if (viewer.getVisibilityState() == VisibilityState.PRERENDER) {
      if (!this.element_.hasAttribute('preload')) {
        video.setAttribute('preload', 'auto');
      }
      viewer.whenFirstVisible().then(() => {
        if (!isSuspendedFn()) {
          this.propagateAll_(video);
        }
      });
      return;
    }
    if (!isSuspendedFn()) {
      this.propagateAll_(video);
    }
  }

  /**
   * Propagates attributes and children on build time.
   * @param {!HTMLMediaElement} video
   */
  propagateOnBuild(video) {
    const poster = this.element_.getAttribute('poster');
    if (!poster && getMode().development) {
      console/*OK*/.error(
          'No "poster" attribute has been provided for amp-video.');
    }
    // Enable inline play for iOS.
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', '');
    // Disable video preload in prerender mode.
    video.setAttribute('preload', 'none');
    video.removeAttribute('src');
    this.component_.propagateAttributes(ATTRS_TO_PROPAGATE_ON_BUILD, video,
        /* opt_removeMissingAttrs */ true);
  }

  /**
   * Gets all children to be added to a <video> on visible.
   * @return {!Array<!Element>}
   */
  getAllChildren_() {
    if (this.allChildren_ === null) {
      this.allChildren_ = this.getCachedSourcesWithFallbacks_()
          .concat(this.getOriginSources_())
          .concat(this.getTracks_());
    }
    return this.allChildren_;
  }

  getCachedSourcesWithFallbacks_() {
    const doc = this.element_.ownerDocument;
    return [].concat.apply([], this.getCachedSources_().map(source => {
      const origSrc = source.getAttribute('amp-orig-src');
      const origType = source.getAttribute('type');
      return [source, createSourceElement(doc, origSrc, origType)];
    }));
  }

  getOriginSources_() {
    const sources = toArray(childElementsByTag(this.element_, 'source'));
    return sources.filter(source => {
      if (this.isValidSource_(source)) {
        // Cached sources should have been moved from <amp-video> to <video>
        dev().assert(!isCachedByCdn(source));
        assertHttpsUrl(source.getAttribute('src'), source);
        return true;
      }
      this.element_.removeChild(source);
      return false;
    });
  }

  getCachedSources_() {
    if (this.cachedSources_ === null) {
      const sources = toArray(childElementsByTag(this.element_, 'source'));
      const sourceFromAttrOptional = this.maybeCreateSourceFromAttr_();
      const allSources = [sourceFromAttrOptional].concat(sources);

      this.cachedSources_ = allSources.filter(source =>
          source && isCachedByCdn(source) && this.isValidSource_(source));
    }
    return this.cachedSources_;
  }

  maybeCreateSourceFromAttr_() {
    if (!this.element_.hasAttribute('src') || !isCachedByCdn(this.element_)) {
      return null;
    }
    const doc = this.element_.ownerDocument;
    const src = this.element_.getAttribute('src');
    const type = this.element_.getAttribute('type');
    const ampOrigSrc = this.element_.getAttribute('amp-orig-src');
    const srcSource = createSourceElement(doc, src, type);
    srcSource.setAttribute('amp-orig-src', ampOrigSrc);
    this.movedCachedSrcToSource_ = true;
    return srcSource;
  }

  getTracks_() {
    return toArray(scopedQuerySelectorAll(this.element_, 'track'));
  }

  /**
   * Propagates all children into video.
   * @private
   */
  propagateAll_(video) {
    // If the `src` of `amp-video` itself is NOT cached, set it on video
    if (this.element_.hasAttribute('src') && !isCachedByCdn(this.element_)) {
      assertHttpsUrl(this.element_.getAttribute('src'), this.element);
      this.component_.propagateAttributes(['src'], video);
    } else {
      video.removeAttribute('src');
    }

    this.getAllChildren_().forEach(el => video.appendChild(el));
  }

  forwardEvents(video) {
    return this.component_.forwardEvents(
        [VideoEvents.PLAYING, VideoEvents.PAUSE, VideoEvents.ENDED], video);
  }

  /**
   * Removes all properties from a video.
   * @param {!HTMLMediaElement} video
   */
  removeFrom(video) {
    video.removeAttribute('src');
    this.getAllChildren_().forEach(el => {
      if (el.parentNode == video) {
        video.removeChild(el);
      }
    });
  }
}


/**
 * @typedef {{./amp-video.AmpVideo|!./media-pool-amp-video.MediaPoolAmpVideo}}
 */
let AmpVideoDef;


export class VideoLifecycle {
  /**
   * @param {!VideoProperties} properties;
   * @param {!Element} container
   * @param {!HTMLMediaElement} video;
   */
  constructor(properties, container, video) {
    /** @private @const {!VideoProperties} */
    this.properties_ = properties;

    /** @private @const {!HTMLMediaElemnet} */
    this.video_ = video;

    /** @private @const {!Element} */
    this.element_ = container;

    /** @private {boolean} */
    this.muted_ = video.muted;

    /** @private @const {!Array<!UnlistenDef>} */
    this.unlisteners_ = [];

    /** @private {?Promise} */
    this.loadPromise_ = null;

    /** @private {boolean} */
    this.isSuspended_ = false;
  }

  /**
   * Builds video element.
   */
  build() {
    this.properties_.propagateOnBuild(this.video_);
    this.installEventHandlers_();
  }

  /**
   * Lays out video element.
   * @return {!Promise}
   */
  layout() {
    if (!this.loadPromise_) {
      this.properties_.propagateOnLayout(this.video_,
          /* isSuspendedFn */ () => this.isSuspended_);

      this.createLoadPromise_();

      // Resets sources in case of change.
      this.video_.load();
    }
    return this.loadPromise_;
  }

  isLaidOut() {
    return !!this.loadPromise_;
  }

  /** @private */
  createLoadPromise_() {
    this.loadPromise_ = new Promise((resolve, reject) => {
      this.listenOnce('loadstart', resolve);
      this.listenOnce('error', reject);
    }).then(() => {
      this.element_.dispatchCustomEvent(VideoEvents.LOAD);
    });
  }

  /** @private */
  installEventHandlers_() {
    this.unlisteners_.push(this.properties_.forwardEvents(this.video_));
    this.unlisteners_.push(listen(this.video_, 'volumechange', () => {
      if (this.muted_ == this.video_.muted) {
        return;
      }
      const evt = this.video_.muted ? VideoEvents.MUTED : VideoEvents.UNMUTED;
      this.muted_ = this.video_.muted;
      console.error(this.muted_, this.video_.muted, evt);
      this.element_.dispatchCustomEvent(evt);
    }));
  }

  /** @private */
  uninstallEventHandlers_() {
    while (this.unlisteners_.length) {
      this.unlisteners_.pop().call();
    }
  }

  listenOnce(event, callback) {
    this.unlisteners_.push(listenOnce(this.video_, event, callback));
  }

  /** Ends lifecycle for this <video> so its resource can be freed. */
  suspend() {
    this.isSuspended_ = true;
    this.uninstallEventHandlers_();
    this.properties_.removeFrom(this.video_)
  }
}
