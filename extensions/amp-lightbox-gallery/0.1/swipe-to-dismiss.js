import {setStyle, setStyles} from '#core/dom/style';

import {listen} from '#utils/event-helper';
import {dev} from '#utils/log';

import {delayAfterDeferringToEventLoop} from './utils';

import {SwipeDef} from '../../../src/gesture-recognizers';

/**
 * The number of pixels of movement to go from the darkest to lightest overlay
 * while doing a swipe to close gesture.
 */
const SWIPE_TO_CLOSE_DISTANCE = 200;
/**
 * The number of pixels needed to close when doing a swipe to close gesture.
 */
const SWIPE_TO_CLOSE_DISTANCE_THRESHOLD = SWIPE_TO_CLOSE_DISTANCE / 4;
/**
 * The number of pixels needed to completely fade out the controls when doing a
 * swipe to close gesture.
 */
const SWIPE_TO_HIDE_OVERLAY_DISTANCE = SWIPE_TO_CLOSE_DISTANCE / 4;
/**
 * The velocity at which to close light box from a swipe, regardless of distance
 * travelled.
 */
const SWIPE_TO_CLOSE_VELOCITY_THRESHOLD = 0.65;
/**
 * The lowest opacity for the background and controls when doing swipe to close
 * gesture.
 */
const SWIPE_TO_CLOSE_MIN_OPACITY = 0.2;
/** The smallest scale possible when doing swipe to close gesture. */
const SWIPE_TO_CLOSE_MIN_SCALE = 0.85;
/**
 * How much distance to cover, based on the velocity, when a user releases a
 * swipe to close gesture.
 */
const SWIPE_TO_CLOSE_VELOCITY_TO_DISTANCE_FACTOR = 22.5;
/**
 * How much time to spend, based on the distance to travel, when moving to the
 * final location of a swipe (after the user has released).
 */
const SWIPE_TO_CLOSE_DISTANCE_TO_TIME_FACTOR = 1;
/**
 * How much time to spend, based on the distance to travel, when snapping back
 * after an cancelled swipe to close gesture.
 */
const SWIPE_TO_CLOSE_SNAP_BACK_TIME_FACTOR = 5;
/**
 * The timing function to use when carrying momentum after releasing a swipe to
 * close gesture. This closely approximates an expontential decay of velocity.
 */
const SWIPE_TO_CLOSE_MOMENTUM_TIMING = 'cubic-bezier(0.15, .55, .3, 0.95)';

/**
 * Calculates the distance between two points in two dimensions.
 * TODO(#21104) Refactor.
 * @param {number} x1 The x coordinate of the first point.
 * @param {number} y1 The y coordinate of the first point.
 * @param {number} x2 The x coordinate of the second point.
 * @param {number} y2 The y coordinate of the second point.
 * @return {number} The distance.
 */
function calculateDistance(x1, y1, x2, y2) {
  return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
}

/**
 * A linear interpolation.
 * TODO(#21104) Refactor.
 * @param {number} start
 * @param {number} end
 * @param {number} percentage
 * @return {number} The value percentage of the way between start and end.
 */
function lerp(start, end, percentage) {
  return start + (end - start) * percentage;
}

/**
 * Maintains state and updates the UI for a swipe to dismiss gesture.
 */
export class SwipeToDismiss {
  /**
   * @param {!Window} win
   * @param {!Element} element
   * @param {function(function())} mutateElement
   * @param {function()} onclose
   */
  constructor(win, element, mutateElement, onclose) {
    /** @private @const */
    this.win_ = win;

    /** @private @const */
    this.element_ = element;

    /** @private @const */
    this.mutateElement_ = mutateElement;

    /** @private @const */
    this.onclose_ = onclose;

    /**
     * The element that is moving with the swipe to dismiss.
     * @private {?Element}
     */
    this.swipeElement_ = null;

    /**
     * The element to hide while doing the swipe.
     * @private {?Element}
     */
    this.hiddenElement_ = null;

    /**
     * A background mask element behind the swipe element.
     * @private {?Element}
     */
    this.mask_ = null;

    /**
     * A container that is overlaying the swipe element.
     * @private {?Element}
     */
    this.overlay_ = null;

    /**
     * A listener is set up to prevent scrolling on the swipe element  when
     * doing  a swipe to dismiss gesture. This is used to clean up the listener
     * when no longer needed.
     * @private {?function()}
     */
    this.preventScrollUnlistener_ = null;

    /**
     * @private {boolean}
     */
    this.isSwiping_ = false;
  }

  /**
   * Handles the start of a swipe.
   * @param {{
   *   swipeElement: !Element,
   *   hiddenElement: !Element,
   *   mask: !Element,
   *   overlay: !Element,
   * }} config
   */
  startSwipe(config) {
    const {hiddenElement, mask, overlay, swipeElement} = config;
    this.swipeElement_ = swipeElement;
    this.hiddenElement_ = hiddenElement;
    this.mask_ = mask;
    this.overlay_ = overlay;
    this.isSwiping_ = true;

    this.mutateElement_(() => {
      this.startSwipeToDismiss_();
    });
  }

  /**
   * Carries momentum for the swipe forwards to a final destination, with the
   * duration depending on the velocity.
   * @param {number} scale The current scale.
   * @param {number} deltaX How far in the x direction we should keep moving.
   * @param {number} deltaY How far in the y direction we should keep moving.
   * @param {number} velocity The current velocity.
   * @return {Promise} A Promise that resolves once the momentum based movement
   *    based movement has ended.
   * @private
   */
  carrySwipeMomentum_(scale, deltaX, deltaY, velocity) {
    const duration = velocity * SWIPE_TO_CLOSE_DISTANCE_TO_TIME_FACTOR;

    setStyles(dev().assertElement(this.swipeElement_), {
      transform: `scale(${scale}) translate(${deltaX}px, ${deltaY}px)`,
      transition: `${duration}ms transform ${SWIPE_TO_CLOSE_MOMENTUM_TIMING}`,
    });

    return delayAfterDeferringToEventLoop(this.win_, duration);
  }

  /**
   * Snaps back to the starting point, with the duration based on the distance
   * that needs to be travelled.
   * @param {number} finalDistance
   * @return {Promise} A Promise that resolves once the snapping has completed.
   * @private
   */
  snapBackFromSwipe_(finalDistance) {
    const duration = finalDistance * SWIPE_TO_CLOSE_SNAP_BACK_TIME_FACTOR;

    return this.mutateElement_(() => {
      setStyles(dev().assertElement(this.swipeElement_), {
        transform: '',
        transition: `${duration}ms transform ease-out`,
      });
      setStyles(dev().assertElement(this.mask_), {
        opacity: '',
        transition: `${duration}ms opacity ease-out`,
      });
      setStyles(dev().assertElement(this.overlay_), {
        opacity: '',
        transition: `${duration}ms opacity ease-out`,
      });
    }).then(() => {
      return delayAfterDeferringToEventLoop(this.win_, duration);
    });
  }

  /**
   * Adjusts the UI elements for the current swipe position in a swipe to
   * dismiss gesture. This should be called in a mutate context.
   * @param {string} swipeElementTransform How to transform the swiping
   *    element.
   * @param {number|string} maskOpacity The opacity for the mask element.
   * @param {number|string} overlayOpacity The opacity for the controls
   *    container.
   * @private
   */
  adjustForSwipePosition_(
    swipeElementTransform = '',
    maskOpacity = '',
    overlayOpacity = ''
  ) {
    setStyles(dev().assertElement(this.swipeElement_), {
      transform: swipeElementTransform,
      transition: '',
    });
    setStyles(dev().assertElement(this.mask_), {
      opacity: maskOpacity,
      transition: '',
    });
    setStyles(dev().assertElement(this.overlay_), {
      opacity: overlayOpacity,
      transition: '',
    });
  }

  /**
   * Releases the user's swipe to dismiss gesture. This carries the momentum
   * forwards and either closes the lightbox or snaps back based on the speed
   * and distance. This should be called in a mutate context.
   * @param {number} scale The scale when releasing the swipe. We do not change
   *    the scale as we carry forward any momentum.
   * @param {number} velocityX The X velocity when the swipe was released.
   * @param {number} velocityY The Y velocity when the swipe was released.
   * @param {number} deltaX The x distance when the swipe was released.
   * @param {number} deltaY The y distance when the swipe was released.
   * @return {!Promise} A Promise that resolves once the release is completed,
   *    either snapping back to the start or closing the carousel.
   * @private
   */
  releaseSwipe_(scale, velocityX, velocityY, deltaX, deltaY) {
    const velocity = calculateDistance(0, 0, velocityX, velocityY);
    const distanceX = velocityX * SWIPE_TO_CLOSE_VELOCITY_TO_DISTANCE_FACTOR;
    const distanceY = velocityY * SWIPE_TO_CLOSE_VELOCITY_TO_DISTANCE_FACTOR;
    const finalDeltaX = distanceX + deltaX;
    const finalDeltaY = distanceY + deltaY;
    // We want to figure out the final distance we will rest at if the user
    // flicked the lightbox and use that to determine we should animate to. We
    // will then use that resting position to determine if we should snap back
    // or close.
    const finalDistance = calculateDistance(0, 0, finalDeltaX, finalDeltaY);

    // We always want to carry momentum from the swipe forward, and then use
    // the resting point to decide if we should snap back or close.
    return this.carrySwipeMomentum_(
      scale,
      finalDeltaX,
      finalDeltaY,
      velocity
    ).then(() => {
      if (
        finalDistance < SWIPE_TO_CLOSE_DISTANCE_THRESHOLD &&
        velocity < SWIPE_TO_CLOSE_VELOCITY_THRESHOLD
      ) {
        return this.snapBackFromSwipe_(finalDistance);
      }

      return this.onclose_();
    });
  }

  /**
   * Handles the start of a swipe to dimiss gesture:
   *  - Prevents a scroll event from the carousel during the swipe.
   *  - Hides the source element on the page.
   * This should be called in a mutate context.
   * @private
   */
  startSwipeToDismiss_() {
    this.hiddenElement_.classList.add('i-amphtml-ghost');
    // We do not want the user dragging around to make the carousel think that
    // a scroll happened.
    this.preventScrollUnlistener_ = listen(
      dev().assertElement(this.swipeElement_),
      'scroll',
      (event) => {
        event.stopPropagation();
      },
      {
        capture: true,
      }
    );
    // TODO(sparhami) #19259 Tracks a more generic way to do this. Remove once
    // we have something better.
    this.element_.setAttribute('i-amphtml-scale-animation', '');
    // Need to clear this so that we can control the opacity as the user drags.
    setStyle(this.overlay_, 'animationFillMode', 'none');
  }

  /**
   * Ends a drag swipe, cleaning up the effects from `startSwipeToDismiss_`.
   * This should be called in a mutate context.
   * @private
   */
  endSwipeToDismiss_() {
    this.hiddenElement_.classList.remove('i-amphtml-ghost');
    this.preventScrollUnlistener_();
    this.element_.removeAttribute('i-amphtml-scale-animation');
    setStyle(this.overlay_, 'animationFillMode', '');
  }

  /**
   * @param {!SwipeDef} data The data for the swipe.
   */
  swipeMove(data) {
    const {deltaX, deltaY, last, velocityX, velocityY} = data;
    const wasSwiping = this.isSwiping_;
    if (last) {
      this.isSwiping_ = false;
    }

    // Need to capture these as they will no longer be available after closing.
    const distance = calculateDistance(0, 0, deltaX, deltaY);
    const releasePercentage = Math.min(distance / SWIPE_TO_CLOSE_DISTANCE, 1);
    const hideOverlayPercentage = Math.min(
      distance / SWIPE_TO_HIDE_OVERLAY_DISTANCE,
      1
    );
    const scale = lerp(1, SWIPE_TO_CLOSE_MIN_SCALE, releasePercentage);
    const maskOpacity = lerp(1, SWIPE_TO_CLOSE_MIN_OPACITY, releasePercentage);
    const overlayOpacity = lerp(1, 0, hideOverlayPercentage);

    this.mutateElement_(() => {
      if (data.last && wasSwiping) {
        this.releaseSwipe_(scale, velocityX, velocityY, deltaX, deltaY).then(
          () => {
            // TODO(sparhami) These should be called in a `mutateElement`,
            // but we are already in an animationFrame, and waiting for the
            // next one will cause the UI to flicker.
            this.adjustForSwipePosition_();
            this.endSwipeToDismiss_();
          }
        );
        return;
      }

      if (this.isSwiping_) {
        this.adjustForSwipePosition_(
          `scale(${scale}) translate(${deltaX}px, ${deltaY}px)`,
          maskOpacity,
          overlayOpacity
        );
      }
    });
  }
}
