import {CommonSignals_Enum} from '#core/constants/common-signals';
import {whenUpgradedToCustomElement} from '#core/dom/amp-element-helpers';
import {Layout_Enum} from '#core/dom/layout';
import {prefersReducedMotion} from '#core/dom/media-query-props';
import {closest} from '#core/dom/query';
import {setImportantStyles} from '#core/dom/style';
import {deepEquals} from '#core/types/object/json';

import {Services} from '#service';

import {dev, user} from '#utils/log';

import {CSS} from '../../../build/amp-story-panning-media-0.1.css';
import {
  Action,
  StateProperty,
} from '../../amp-story/1.0/amp-story-store-service';

/** @const {string} */
const TAG = 'AMP_STORY_PANNING_MEDIA';

/** @const {string}  */
const DURATION_MS = 1000;

/** @const {number}  */
const DISTANCE_TO_CENTER_EDGE_PERCENT = 50;

/** @const {number}  */
const NEXT_PAGE_DISTANCE = 1;

/**
 * A small number used to calculate zooming out to 0.
 * @const {number}
 */
const MIN_INTEGER = -100000;

/**
 * Position values used to animate between components.
 * x: (optional) Percentage between [-50; 50]
 * y: (optional) Percentage between [-50; 50]
 * zoom: 0 is not visible. 1 fills the viewport vertically.
 * @typedef {{
 *   x: float,
 *   y: float,
 *   zoom: float,
 * }}
 */
export let panningMediaPositionDef;

/**
 * Max distances to keep image in viewport.
 * horizontal: Percentage between [-50; 50]
 * vertical: Percentage between [-50; 50]
 * @typedef {{
 *   horizontal: float,
 *   vertical: float,
 * }}
 */
export let panningMediaMaxBoundsPercentDef;

export class AmpStoryPanningMedia extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?Element} The element that is transitioned. */
    this.ampImgEl_ = null;

    /** @private {?panningMediaPositionDef} Position to animate to. */
    this.animateTo_ = {};

    /** @private {?{width: number, height: number}} */
    this.elementSize_ = null;

    /** @private {?panningMediaPositionDef} Current animation state. */
    this.animationState_ = {};

    /** @private {?../../../extensions/amp-story/1.0/amp-story-store-service.AmpStoryStoreService} */
    this.storeService_ = null;

    /** @private {?string} */
    this.pageId_ = null;

    /** @private {boolean} */
    this.isOnActivePage_ = false;

    /** @private {?number} Distance from active page. */
    this.pageDistance_ = null;

    /** @private {?string} */
    this.groupId_ = null;
  }

  /** @override */
  buildCallback() {
    return Services.storyStoreServiceForOrNull(this.win).then(
      (storeService) => (this.storeService_ = storeService)
    );
  }

  /** @override */
  layoutCallback() {
    this.ampImgEl_ = dev().assertElement(this.element.querySelector('amp-img'));

    this.groupId_ =
      this.element.getAttribute('group-id') ||
      this.ampImgEl_.getAttribute('src');

    this.initializeListeners_();

    return whenUpgradedToCustomElement(this.ampImgEl_)
      .then(() =>
        this.ampImgEl_.signals().whenSignal(CommonSignals_Enum.LOAD_END)
      )
      .then(() => {
        const imgEl = dev().assertElement(this.element.querySelector('img'));
        // Remove layout="fill" classes so image is not clipped.
        imgEl.classList = '';
        this.setImageCenteringStyles_();
      })
      .catch(() => user().error(TAG, 'Failed to load the amp-img.'));
  }

  /** @private */
  initializeListeners_() {
    this.storeService_.subscribe(
      StateProperty.PAGE_SIZE,
      () => {
        this.elementSize_ = {
          width: this.element./*OK*/ offsetWidth,
          height: this.element./*OK*/ offsetHeight,
        };
        this.setImageCenteringStyles_();
        this.setAnimateTo_();
        this.animate_();
      },
      true /** callToInitialize */
    );
    this.storeService_.subscribe(
      StateProperty.CURRENT_PAGE_ID,
      (currPageId) => {
        this.isOnActivePage_ = currPageId === this.getPageId_();
        this.animate_();
      },
      true /** callToInitialize */
    );
    this.storeService_.subscribe(
      StateProperty.PANNING_MEDIA_STATE,
      (panningMediaState) => this.onPanningMediaStateChange_(panningMediaState),
      true /** callToInitialize */
    );
    // Mutation observer for distance attribute
    const config = {attributes: true, attributeFilter: ['distance']};
    const callback = (mutationsList) =>
      (this.pageDistance_ = parseInt(
        mutationsList[0].target.getAttribute('distance'),
        10
      ));
    const observer = new MutationObserver(callback);
    this.getPage_() && observer.observe(this.getPage_(), config);
  }

  /** @private */
  setAnimateTo_() {
    const x = parseFloat(this.element.getAttribute('data-x') || 0);
    const y = parseFloat(this.element.getAttribute('data-y') || 0);
    const zoom = parseFloat(this.element.getAttribute('data-zoom') || 1);
    const lockBounds = this.element.hasAttribute('lock-bounds');

    if (lockBounds) {
      // Zoom must be set to calculate maxBounds.
      this.animateTo_.zoom = zoom < 1 ? 1 : zoom;
      const {horizontal, vertical} = this.getMaxBounds_();
      this.animateTo_.x = Math.max(-horizontal, Math.min(x, horizontal));
      this.animateTo_.y = Math.max(-vertical, Math.min(y, vertical));
    } else {
      this.animateTo_ = {x, y, zoom};
    }
  }

  /**
   * Calculates max distances to keep image in viewport.
   * @private
   * @return {panningMediaMaxBoundsPercentDef}
   */
  getMaxBounds_() {
    // Calculations to clamp image to edge of container.
    const {height, width} = this.elementSize_;

    const ampImgWidth = this.ampImgEl_.getAttribute('width');
    const ampImgHeight = this.ampImgEl_.getAttribute('height');
    if (!ampImgWidth || !ampImgHeight) {
      user().error(
        TAG,
        '"lock-bounds" requires "width" and "height" to be set on the amp-img child.'
      );
    }

    const containerRatio = width / height;
    const imageRatio = ampImgWidth / ampImgHeight;
    const percentScaledToFitViewport =
      containerRatio < imageRatio ? height / ampImgHeight : width / ampImgWidth;

    const scaledImageWidth = percentScaledToFitViewport * ampImgWidth;
    const scaledImageHeight = percentScaledToFitViewport * ampImgHeight;

    const widthFraction = 1 - width / (scaledImageWidth * this.animateTo_.zoom);
    const heightFraction =
      1 - height / (scaledImageHeight * this.animateTo_.zoom);

    return {
      horizontal: DISTANCE_TO_CENTER_EDGE_PERCENT * widthFraction,
      vertical: DISTANCE_TO_CENTER_EDGE_PERCENT * heightFraction,
    };
  }

  /**
   * Animates from current position to active components position.
   * @private
   */
  animate_() {
    if (!this.isOnActivePage_) {
      return;
    }
    const startPos = this.storeService_.get(StateProperty.PANNING_MEDIA_STATE)[
      this.groupId_
    ];

    // Don't animate if first instance of group or prefers-reduced-motion.
    if (!startPos || prefersReducedMotion(this.win)) {
      this.storeService_.dispatch(Action.ADD_PANNING_MEDIA_STATE, {
        [this.groupId_]: this.animateTo_,
      });
      return;
    }

    const easeInOutQuad = (val) =>
      val < 0.5 ? 2 * val * val : 1 - Math.pow(-2 * val + 2, 2) / 2;

    let startTime;
    const nextFrame = (currTime) => {
      if (!startTime) {
        startTime = currTime;
      }
      const elapsedTime = currTime - startTime;
      if (elapsedTime < DURATION_MS) {
        const {x, y, zoom} = this.animateTo_;
        const easing = easeInOutQuad(elapsedTime / DURATION_MS);
        this.storeService_.dispatch(Action.ADD_PANNING_MEDIA_STATE, {
          [this.groupId_]: {
            x: startPos.x + (x - startPos.x) * easing,
            y: startPos.y + (y - startPos.y) * easing,
            zoom: startPos.zoom + (zoom - startPos.zoom) * easing,
          },
        });
        // Only call loop again if on active page.
        if (this.isOnActivePage_) {
          requestAnimationFrame(nextFrame);
        }
      } else {
        this.storeService_.dispatch(Action.ADD_PANNING_MEDIA_STATE, {
          [this.groupId_]: this.animateTo_,
        });
      }
    };
    requestAnimationFrame(nextFrame);
  }

  /**
   * Centers the amp-img horizontally or vertically based on aspect ratio.
   * The img element does not load if this is done in CSS.
   * @private
   */
  setImageCenteringStyles_() {
    const imgEl = this.element.querySelector('img');
    if (!imgEl) {
      return;
    }
    const {height, width} = this.elementSize_;
    const containerRatio = width / height;
    const ampImgWidth = this.ampImgEl_.getAttribute('width');
    const ampImgHeight = this.ampImgEl_.getAttribute('height');
    const imageRatio = ampImgWidth / ampImgHeight;

    this.mutateElement(() => {
      if (containerRatio < imageRatio) {
        setImportantStyles(this.ampImgEl_, {
          left: 'auto',
          right: 'auto',
          top: '0',
          bottom: '0',
          width: 'auto',
          height: '100%',
        });
        setImportantStyles(imgEl, {
          width: 'auto',
          height: '100%',
        });
      } else {
        setImportantStyles(this.ampImgEl_, {
          left: '0',
          right: '0',
          top: 'auto',
          bottom: 'auto',
          width: '100%',
          height: 'auto',
        });
        setImportantStyles(imgEl, {
          width: '100%',
          height: 'auto',
        });
      }
    });
  }

  /**
   * @private
   * @param {!{[key: string]: string}} panningMediaState
   */
  onPanningMediaStateChange_(panningMediaState) {
    if (
      this.pageDistance_ <= NEXT_PAGE_DISTANCE &&
      panningMediaState[this.groupId_] &&
      // Prevent update if value is same as previous value.
      // This happens when 2 or more components are on the same page.
      !deepEquals(this.animationState_, panningMediaState[this.groupId_])
    ) {
      this.animationState_ = panningMediaState[this.groupId_];
      this.updateTransform_();
    }
  }

  /**
   * @private
   * @return {!Promise}
   */
  updateTransform_() {
    const {x, y, zoom} = this.animationState_;
    return this.mutateElement(() => {
      setImportantStyles(this.ampImgEl_, {
        transform: `translate3d(${x}%, ${y}%, ${this.calculateZoom_(zoom)}px)`,
      });
    });
  }

  /**
   * Calculates zoom for translate3d and ensures the number is finite.
   * @private
   * @param {number} zoom
   * @return {number}
   */
  calculateZoom_(zoom) {
    const calculatedZoom = (zoom - 1) / zoom;
    return isFinite(calculatedZoom) ? calculatedZoom : MIN_INTEGER;
  }

  /**
   * @private
   * @return {string} the page id
   */
  getPageId_() {
    if (this.pageId_ == null) {
      this.pageId_ = this.getPage_().getAttribute('id');
    }
    return this.pageId_;
  }

  /**
   * @private
   * @return {?Element} the parent amp-story-page
   */
  getPage_() {
    return closest(
      dev().assertElement(this.element),
      (el) => el.tagName.toLowerCase() === 'amp-story-page'
    );
  }

  /** @override */
  isLayoutSupported(layout) {
    return layout == Layout_Enum.FILL;
  }
}

AMP.extension('amp-story-panning-media', '0.1', (AMP) => {
  AMP.registerElement('amp-story-panning-media', AmpStoryPanningMedia, CSS);
});
