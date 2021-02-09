/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
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

import * as Preact from '../../../src/preact';
import {
  CORNER_MARGIN_MAX,
  CORNER_MARGIN_RATIO,
  CORNER_WIDTH_MIN,
  CORNER_WIDTH_RATIO,
  DirectionX,
  DirectionY,
  DockTargetType,
  PLACEHOLDER_ICON_LARGE_MARGIN,
  PLACEHOLDER_ICON_LARGE_WIDTH,
  PLACEHOLDER_ICON_SMALL_MARGIN,
  PLACEHOLDER_ICON_SMALL_WIDTH,
  REVERT_TO_INLINE_RATIO,
  transform,
} from '../0.1/def';
import {
  calculateLeftJustifiedX,
  calculateRightJustifiedX,
  interpolatedBoxesTransform,
  isSizedRect,
  topCornerRect,
} from '../0.1/math';
import {createContext, useMemo, useState} from '../../../src/preact';
import {dict} from '../../../src/utils/object';
import {once} from '../../../src/utils/function';
import {useStyles} from './dock.jss';
import {Controls} from './controls';
import {Placeholder} from './placeholder';

/**
 * @param {!Element} element
 * @return {!Promise<number>}
 */
const getOffsetTopAsync = (element) =>
  Promise.resolve().then(() => element.offsetTop);

// TODO: i don't like this name
class DockManager {
  /**
   * @param {!Document} doc
   * @param {function(!JsonObject)} setState
   * @param {function(!JsonObject)} setStyles
   */
  constructor(doc, setState, setStyles) {
    this.doc_ = doc;

    /** @private {?{entry: !IntersectionObserverEntry, rect: !LayoutRectDef}} */
    this.current_ = null;

    /** @private @const {function(!JsonObject)} */
    this.setState_ = setState;

    /** @private @const {function(!JsonObject)} */
    this.setStyles_ = setStyles;

    /**
     * TODO: This changes on RTL, and on drag.
     * @private {!DirectionX}
     */
    this.cornerDirectionX_ = DirectionX.RIGHT;

    /**
     * To compare delta for direction
     * @private {!Array<!IntersectionObserverEntry>}
     */
    this.previousEntries_ = [];

    /** @private @const {!function():!IntersectionObserver} */
    this.getObserver_ = once(
      () =>
        new IntersectionObserver(
          (entries) => {
            const direction = this.getDirection_(entries);
            entries.forEach((entry) =>
              this.onIntersectionChange_(entry, direction)
            );
          },
          {
            root: this.doc_,
            threshold: [0, 0.1, 0.2, 0.4, 0.6, 0.8, 0.9, 1],
          }
        )
    );
  }

  /**
   * Determines scrolling direction from previous entries.
   * @param {!Array<!IntersectionObserverEntry>} entries
   * @return {!DirectionY}
   * @private
   */
  getDirection_(entries) {
    const previousEntries = this.previousEntries_;
    this.previousEntries_ = entries;

    for (let i = 0; i < previousEntries.length; i++) {
      for (let j = 0; j < entries.length; j++) {
        const previous = previousEntries[i];
        const current = entries[j];
        if (previous.target === current.target) {
          return current.intersectionRect.y - previous.intersectionRect.y <= 0
            ? DirectionY.TOP
            : DirectionY.BOTTOM;
        }
      }
    }

    return DirectionY.TOP;
  }

  /**
   * @param {!Element} element
   * @param {boolean} docks
   * @param {boolean} playing
   * @return {?UnlistenDef}
   */
  use(element, docks, playing) {
    const observer = this.getObserver_();
    const unobserve = () => {
      if (this.current_?.entry.element !== element) {
        observer.unobserve(element);
      }
    };
    if (docks || playing) {
      observer.observe(element);
      return unobserve;
    }
    unobserve();
  }

  /**
   * @param {!IntersectionObserverEntry} entry
   * @param {!DirectionY} direction
   */
  onIntersectionChange_(entry, direction) {
    if (direction === DirectionY.TOP) {
      const target = this.getTargetFor_(entry);
      if (target) {
        this.dock_(entry, target);
      }
    } else if (this.current_) {
      if (
        this.current_.entry.target === entry.target &&
        entry.intersectionRatio >= REVERT_TO_INLINE_RATIO
      ) {
        this.undock_();
      }
    }
  }

  /**
   * @param {!IntersectionObserverEntry} entry
   * @param {!DockTargetDef} target
   * @private
   */
  dock_(entry, target) {
    if (this.isInTransition_) {
      return;
    }

    const {x, y, scale, relativeX} = this.getDims_(entry, target /* , step */);
    const transitionDurationMs = 300; // TODO
    const step = 1; // TODO
    this.current_ = {entry, target};

    this.placeAt_(entry, x, y, scale, step, transitionDurationMs, relativeX);
  }

  /**
   * @param {!IntersectionObserverEntry} entry
   * @param {number} x
   * @param {number} y
   * @param {number} scale
   * @param {number} step in [0..1]
   * @param {number} transitionDurationMs
   * @param {DirectionX=} opt_relativeX
   * @param {string=} position
   * @return {!Promise}
   * @private
   */
  placeAt_(
    entry,
    x,
    y,
    scale,
    step,
    transitionDurationMs,
    opt_relativeX,
    position = 'fixed'
  ) {
    const {width, height} = entry.boundingClientRect;

    this.placedAt_ = {x, y, scale};

    const element = entry.target;

    const isPlacementRtl = opt_relativeX == DirectionX.LEFT;

    // TODO:
    // - RTL
    // - placeholder breakpoints
    const isSmallPlaceholderIcon = false;

    const placeholderIconWidth = isSmallPlaceholderIcon
      ? PLACEHOLDER_ICON_SMALL_WIDTH
      : PLACEHOLDER_ICON_LARGE_WIDTH;

    const placeholderIconMargin = isSmallPlaceholderIcon
      ? PLACEHOLDER_ICON_SMALL_MARGIN
      : PLACEHOLDER_ICON_LARGE_MARGIN;

    /**
     * @param {number} containerWidth
     * @param {number} itemWidth
     * @param {number} itemMargin
     * @param {number} step
     * @return {number}
     */
    const iconPlacementFn = isPlacementRtl
      ? calculateLeftJustifiedX
      : calculateRightJustifiedX;

    const placeholderIconX = iconPlacementFn(
      width,
      placeholderIconWidth,
      placeholderIconMargin,
      step
    );

    this.isInTransition_ = true;
    this.setState_({isInTransition: true});

    const transitionTiming = {
      'transition-duration': `${transitionDurationMs}ms`,
      'transition-timing-function': step > 0 ? 'ease-out' : 'ease-in',
    };

    if (step > 0) {
      // An empty non-null state allows helper elements (like the shadow layer)
      // to display immediately so that the browser won't skip their transition.
      this.setStyles_({
        element: entry.target,
      });
    }

    return getOffsetTopAsync(entry.target)
      .then((offsetTop) => {
        const transformToAreaStyle = dict({
          'width': width,
          'height': height,
          'transform': transform(x, y, scale),
          'position': position,
          'top': position === 'absolute' ? offsetTop : 0,
          'left': 0,
          'right': 'auto',
          'bottom': 'auto',
          'padding': 0,
          'min-width': 0,
          'min-height': 0,
          'max-width': 'auto',
          'max-height': 'auto',
          // So (x, y) coordinates can be used in transforms as (top, left):
          'transform-origin': 'left top',
        });

        const fadeStyle = dict({
          'opacity': step,
        });

        this.setStyles_({
          element,
          offsetTop,
          boundingClientRect: entry.boundingClientRect,
          transformToAreaStyle,
          transitionTiming,
          controls: {
            left: x,
            top: y,
            width: width * scale,
            height: height * scale,
          },
          fadeStyle,
          dockedStyle: dict({
            ...transformToAreaStyle,
            ...transitionTiming,
            'transition-property': 'transform',
          }),
          placeholderIcon: dict({
            ...fadeStyle,
            ...transitionTiming,
            'transform': transform(placeholderIconX, 0, 1),
          }),
        });
      })
      .then(
        () =>
          new Promise((resolve) =>
            setTimeout(() => {
              resolve(true);
              this.isInTransition_ = false;
              this.setState_({isInTransition: false});
            }, transitionDurationMs)
          )
      );
  }

  /**
   * @param {!IntersectionObserverEntry} entry
   * @param {!DockTargetDef} target
   * @param {number=} step
   * @return {{x: number, y: number, scale: number, relativeX: !DirectionX}}
   * @private
   */
  getDims_(entry, target, step) {
    return interpolatedBoxesTransform(
      entry.intersectionRect,
      target.rect,
      step
    );
  }

  /** @private */
  undock_() {
    if (!this.current_ || this.isInTransition_) {
      return;
    }
    const step = 0;
    const {entry, target} = this.current_;
    const {x, y, scale, relativeX} = this.getDims_(entry, target, step);

    // Do not animate transition if video is out-of-view. Chrome glitches
    // when pausing an out-of-view video, so we need to show controls and
    // transition after. If we animate the transition, we would see native
    // controls during, which looks a bit funky.
    // const transitionDurationMs = isMostlyInView
    //   ? this.calculateTransitionDuration_(step)
    //   : 0;
    // TODO(alanorozco): Unconfirmed on Preact version.

    const transitionDurationMs = 300;

    return this.placeAt_(
      entry,
      x,
      y,
      scale,
      step,
      transitionDurationMs,
      relativeX,
      'absolute'
    ).then(() => {
      this.current_ = null;
      this.setStyles_(null);
    });
  }

  /**
   * Returns the area's target when a video should be docked.
   * @param {!IntersectionObserverEntry} entry
   * @return {?DockTargetDef}
   * @private
   */
  getTargetFor_(entry) {
    if (
      this.current_
      // this.isDragging_ ||
      // !this.isValidSize_(video) ||
      // this.ignoreBecauseAnotherDocked_(video) ||
      // this.ignoreDueToNotPlayingManually_(video)
    ) {
      return null;
    }

    const {intersectionRect} = entry;
    if (!isSizedRect(intersectionRect)) {
      return null;
    }
    if (intersectionRect.top > this.getTopBoundary_()) {
      return null;
    }
    return this.getUsableTarget_(entry);
  }

  /**
   * @return {number}
   * @private
   */
  getTopBoundary_() {
    // TODO: Not supporting slot yet.
    // const slot = this.getSlot_();
    // if (slot) {
    //   // Match slot's top edge to tie transition to element.
    //   return slot.getPageLayoutBox().top;
    // }
    return 0;
  }

  /**
   * Returns usable target. If it can dock to a `slot` element that's larger
   * than zero width/height, it calculates a letterboxed rectangle that matches
   * the aspect ratio of the `video` but is contained within the slot's box.
   * Otherwise returns a rectangle calculated relative to viewport and sticking
   * to the horizontal `directionX`.
   * @param {!IntersectionObserverEntry} entry
   * @return {!DockTargetDef}
   * @private
   */
  getUsableTarget_(entry) {
    // TODO(alanorozco): Select slot.
    return {
      type: DockTargetType.CORNER,
      rect: topCornerRect(
        entry.boundingClientRect,
        entry.rootBounds,
        this.cornerDirectionX_,
        CORNER_WIDTH_RATIO,
        CORNER_WIDTH_MIN,
        CORNER_MARGIN_RATIO,
        CORNER_MARGIN_MAX
      ),
      // Bookkeep horizontal edge for drag-and-snap.
      directionX: this.cornerDirectionX_,
    };
  }

  dismissOnTap() {
    // TODO
  }

  scrollBack() {
    // TODO
  }
}

export const DockContext = createContext({});

const ShadowLayer = ({styles}) => {
  const classes = useStyles();
  return (
    <div
      className={`amp-video-docked-shadow ${classes.shadowLayer}`}
      style={{
        ...styles?.dockedStyle,
        'transition-property': 'transform, opacity',
      }}
      hidden={!styles}
    ></div>
  );
};

/**
 * @param {*} props
 * @return {!PreactDef.Renderable}
 */
export function Dock({children}) {
  const [handle, setHandle] = useState(null);
  const [state, setState] = useState(null);
  const [styles, setStyles] = useState(null);
  const manager = useMemo(
    () => new DockManager(document, setState, setStyles),
    [setStyles]
  );

  return (
    <DockContext.Provider
      value={{
        state,
        styles,
        setHandle,
        use: manager.use.bind(manager),
      }}
    >
      {children}
      <Placeholder styles={styles} state={state} />
      <ShadowLayer styles={styles} state={state} />
      <Controls
        styles={styles}
        state={state}
        handle={handle}
        dismissOnTap={() => {
          manager.dismissOnTap();
        }}
        scrollBack={() => {
          manager.scrollBack();
        }}
      />
    </DockContext.Provider>
  );
}
