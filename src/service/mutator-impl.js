import {areMarginsChanged} from '#core/dom/layout/rect';
import {closest} from '#core/dom/query';
import {computedStyle} from '#core/dom/style';

import {isExperimentOn} from '#experiments';

import {Services} from '#service';

import {dev} from '#utils/log';

import {MutatorInterface} from './mutator-interface';
import {Resource} from './resource';

import {FocusHistory} from '../focus-history';
import {registerServiceBuilderForDoc} from '../service-helpers';

const FOUR_FRAME_DELAY_ = 70;
const FOCUS_HISTORY_TIMEOUT_ = 1000 * 60; // 1min
const TAG_ = 'Mutator';

/**
 * @implements {MutatorInterface}
 */
export class MutatorImpl {
  /**
   * @param {!./ampdoc-impl.AmpDoc} ampdoc
   */
  constructor(ampdoc) {
    /** @const {!./ampdoc-impl.AmpDoc} */
    this.ampdoc = ampdoc;

    /** @const {!Window} */
    this.win = ampdoc.win;

    /** @private @const {!./resources-interface.ResourcesInterface} */
    this.resources_ = Services.resourcesForDoc(ampdoc);

    /** @private @const {!./viewport/viewport-interface.ViewportInterface} */
    this.viewport_ = Services.viewportForDoc(this.ampdoc);

    /** @private @const {!./vsync-impl.Vsync} */
    this.vsync_ = Services./*OK*/ vsyncFor(this.win);

    /** @private @const {!FocusHistory} */
    this.activeHistory_ = new FocusHistory(this.win, FOCUS_HISTORY_TIMEOUT_);

    this.activeHistory_.onFocus((element) => {
      this.checkPendingChangeSize_(element);
    });
  }

  /** @override */
  forceChangeSize(element, newHeight, newWidth, opt_callback, opt_newMargins) {
    this.scheduleChangeSize_(
      Resource.forElement(element),
      newHeight,
      newWidth,
      opt_newMargins,
      /* event */ undefined,
      /* force */ true,
      opt_callback
    );
  }

  /** @override */
  requestChangeSize(element, newHeight, newWidth, opt_newMargins, opt_event) {
    return new Promise((resolve, reject) => {
      this.scheduleChangeSize_(
        Resource.forElement(element),
        newHeight,
        newWidth,
        opt_newMargins,
        opt_event,
        /* force */ false,
        (success) => {
          if (success) {
            resolve();
          } else {
            reject(new Error('changeSize attempt denied'));
          }
        }
      );
    });
  }

  /** @override */
  expandElement(element) {
    const resource = Resource.forElement(element);
    resource.completeExpand();
    this.resources_.schedulePass(FOUR_FRAME_DELAY_);
  }

  /** @override */
  attemptCollapse(element) {
    return new Promise((resolve, reject) => {
      this.scheduleChangeSize_(
        Resource.forElement(element),
        0,
        0,
        /* newMargin */ undefined,
        /* event */ undefined,
        /* force */ false,
        (success) => {
          if (success) {
            const resource = Resource.forElement(element);
            resource.completeCollapse();
            resolve();
          } else {
            reject(dev().createExpectedError('collapse attempt denied'));
          }
        }
      );
    });
  }

  /** @override */
  collapseElement(element) {
    const box = this.viewport_.getLayoutRect(element);
    if (box.width != 0 && box.height != 0) {
      if (isExperimentOn(this.win, 'dirty-collapse-element')) {
        this.dirtyElement(element);
      } else {
        this.resources_.setRelayoutTop(box.top);
      }
    }

    const resource = Resource.forElement(element);
    resource.completeCollapse();

    // Unlike completeExpand(), there's no requestMeasure() call here that
    // requires another pass (with IntersectionObserver).
    this.resources_.schedulePass(FOUR_FRAME_DELAY_);
  }

  /** @override */
  measureElement(measurer) {
    return this.vsync_.measurePromise(measurer);
  }

  /** @override */
  mutateElement(element, mutator, skipRemeasure) {
    return this.measureMutateElementResources_(
      element,
      null,
      mutator,
      skipRemeasure
    );
  }

  /** @override */
  measureMutateElement(element, measurer, mutator) {
    return this.measureMutateElementResources_(element, measurer, mutator);
  }

  /**
   * Returns the layout margins for the resource.
   * @param {!Resource} resource
   * @return {!../layout-rect.LayoutMarginsDef}
   * @private
   */
  getLayoutMargins_(resource) {
    const style = computedStyle(this.win, resource.element);
    return {
      top: parseInt(style.marginTop, 10) || 0,
      right: parseInt(style.marginRight, 10) || 0,
      bottom: parseInt(style.marginBottom, 10) || 0,
      left: parseInt(style.marginLeft, 10) || 0,
    };
  }

  /**
   * Handles element mutation (and measurement) APIs in the Resources system.
   *
   * @param {!Element} element
   * @param {?function()} measurer
   * @param {function()} mutator
   * @param {boolean} skipRemeasure
   * @return {!Promise}
   */
  measureMutateElementResources_(
    element,
    measurer,
    mutator,
    skipRemeasure = false
  ) {
    const calcRelayoutTop = () => {
      const box = this.viewport_.getLayoutRect(element);
      if (box.width != 0 && box.height != 0) {
        return box.top;
      }
      return -1;
    };
    let relayoutTop = -1;
    // TODO(jridgewell): support state
    return this.vsync_.runPromise({
      measure: () => {
        if (measurer) {
          measurer();
        }

        if (!skipRemeasure) {
          relayoutTop = calcRelayoutTop();
        }
      },
      mutate: () => {
        mutator();

        // `skipRemeasure` is set by callers when we know that `mutator`
        // cannot cause a change in size/position e.g. toggleLoading().
        if (skipRemeasure) {
          return;
        }

        if (element.classList.contains('i-amphtml-element')) {
          const r = Resource.forElement(element);
          r.requestMeasure();
        }
        const ampElements = element.getElementsByClassName('i-amphtml-element');
        for (let i = 0; i < ampElements.length; i++) {
          const r = Resource.forElement(ampElements[i]);
          r.requestMeasure();
        }
        this.resources_.schedulePass(FOUR_FRAME_DELAY_);

        if (relayoutTop != -1) {
          this.resources_.setRelayoutTop(relayoutTop);
        }
        // Need to measure again in case the element has become visible or
        // shifted.
        this.vsync_.measure(() => {
          const updatedRelayoutTop = calcRelayoutTop();
          if (updatedRelayoutTop != -1 && updatedRelayoutTop != relayoutTop) {
            this.resources_.setRelayoutTop(updatedRelayoutTop);
            this.resources_.schedulePass(FOUR_FRAME_DELAY_);
          }
          this.resources_.maybeHeightChanged();
        });
      },
    });
  }

  /**
   * Dirties the cached element measurements after a mutation occurs.
   *
   * TODO(jridgewell): This API needs to be audited. Common practice is
   * to pass the amp-element in as the root even though we are only
   * mutating children. If the amp-element is passed, we invalidate
   * everything in the parent layer above it, where only invalidating the
   * amp-element was necessary (only children were mutated, only
   * amp-element's scroll box is affected).
   *
   * @param {!Element} element
   */
  dirtyElement(element) {
    let relayoutAll = false;
    const isAmpElement = element.classList.contains('i-amphtml-element');
    if (isAmpElement) {
      const r = Resource.forElement(element);
      this.resources_.setRelayoutTop(r.getLayoutBox().top);
    } else {
      relayoutAll = true;
    }
    this.resources_.schedulePass(FOUR_FRAME_DELAY_, relayoutAll);
  }

  /**
   * Reschedules change size request when an overflown element is activated.
   * @param {!Element} element
   * @private
   */
  checkPendingChangeSize_(element) {
    const resourceElement = closest(
      element,
      (el) => !!Resource.forElementOptional(el)
    );
    if (!resourceElement) {
      return;
    }
    const resource = Resource.forElement(resourceElement);
    const pendingChangeSize = resource.getPendingChangeSize();
    if (pendingChangeSize !== undefined) {
      this.scheduleChangeSize_(
        resource,
        pendingChangeSize.height,
        pendingChangeSize.width,
        pendingChangeSize.margins,
        /* event */ undefined,
        /* force */ true
      );
    }
  }

  /**
   * Schedules change of the element's height.
   * @param {!Resource} resource
   * @param {number|undefined} newHeight
   * @param {number|undefined} newWidth
   * @param {!../layout-rect.LayoutMarginsChangeDef|undefined} newMargins
   * @param {?Event|undefined} event
   * @param {boolean} force
   * @param {function(boolean)=} opt_callback A callback function
   * @private
   */
  scheduleChangeSize_(
    resource,
    newHeight,
    newWidth,
    newMargins,
    event,
    force,
    opt_callback
  ) {
    if (resource.hasBeenMeasured() && !newMargins) {
      this.completeScheduleChangeSize_(
        resource,
        newHeight,
        newWidth,
        undefined,
        event,
        force,
        opt_callback
      );
    } else {
      // This is a rare case since most of times the element itself schedules
      // resize requests. However, this case is possible when another element
      // requests resize of a controlled element. This also happens when a
      // margin size change is requested, since existing margins have to be
      // measured in this instance.
      this.vsync_.measure(() => {
        if (!resource.hasBeenMeasured()) {
          resource.measure();
        }
        const marginChange = newMargins
          ? {
              newMargins,
              currentMargins: this.getLayoutMargins_(resource),
            }
          : undefined;
        this.completeScheduleChangeSize_(
          resource,
          newHeight,
          newWidth,
          marginChange,
          event,
          force,
          opt_callback
        );
      });
    }
  }

  /**
   * @param {!Resource} resource
   * @param {number|undefined} newHeight
   * @param {number|undefined} newWidth
   * @param {!./resources-interface.MarginChangeDef|undefined} marginChange
   * @param {?Event|undefined} event
   * @param {boolean} force
   * @param {function(boolean)=} opt_callback A callback function
   * @private
   */
  completeScheduleChangeSize_(
    resource,
    newHeight,
    newWidth,
    marginChange,
    event,
    force,
    opt_callback
  ) {
    resource.resetPendingChangeSize();
    const layoutSize = resource.getLayoutSize();
    if (
      (newHeight === undefined || newHeight == layoutSize.height) &&
      (newWidth === undefined || newWidth == layoutSize.width) &&
      (marginChange === undefined ||
        !areMarginsChanged(
          marginChange.currentMargins,
          marginChange.newMargins
        ))
    ) {
      if (
        newHeight === undefined &&
        newWidth === undefined &&
        marginChange === undefined
      ) {
        dev().error(
          TAG_,
          'attempting to change size with undefined dimensions',
          resource.debugid
        );
      }
      // Nothing to do.
      if (opt_callback) {
        opt_callback(/* success */ true);
      }
      return;
    }

    this.resources_.updateOrEnqueueMutateTask(
      resource,
      /** {!ChangeSizeRequestDef} */ {
        resource,
        newHeight,
        newWidth,
        marginChange,
        event,
        force,
        callback: opt_callback,
      }
    );
    // With IntersectionObserver, we still want to schedule a pass to execute
    // the requested measures of the newly resized element(s).
    this.resources_.schedulePassVsync();
  }
}

/**
 * @param {!./ampdoc-impl.AmpDoc} ampdoc
 */
export function installMutatorServiceForDoc(ampdoc) {
  registerServiceBuilderForDoc(ampdoc, 'mutator', MutatorImpl);
}
