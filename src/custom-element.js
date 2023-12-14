import {AmpEvents_Enum} from '#core/constants/amp-events';
import {CommonSignals_Enum} from '#core/constants/common-signals';
import {ReadyState_Enum} from '#core/constants/ready-state';
import {tryResolve} from '#core/data-structures/promise';
import {Signals} from '#core/data-structures/signals';
import * as dom from '#core/dom';
import {
  UPGRADE_TO_CUSTOMELEMENT_PROMISE,
  UPGRADE_TO_CUSTOMELEMENT_RESOLVER,
} from '#core/dom/amp-element-helpers';
import {
  LayoutPriority_Enum,
  Layout_Enum,
  isLoadingAllowed,
} from '#core/dom/layout';
import {MediaQueryProps} from '#core/dom/media-query-props';
import * as query from '#core/dom/query';
import {setStyle} from '#core/dom/style';
import {rethrowAsync} from '#core/error';
import {applyStaticLayout} from '#core/static-layout';
import {getWin} from '#core/window';

import {Services} from '#service';
import {ResourceState_Enum} from '#service/resource';
import {getSchedulerForDoc} from '#service/scheduler';

import {dev, devAssert, user, userAssert} from '#utils/log';

import {startupChunk} from './chunk';
import {shouldBlockOnConsentByMeta} from './consent';
import {ElementStub} from './element-stub';
import {
  blockedByConsentError,
  cancellation,
  isBlockedByConsent,
  isCancellation,
  reportError,
} from './error-reporting';
import {getMode} from './mode';
import {getIntersectionChangeEntry} from './utils/intersection-observer-3p-host';

const TAG = 'CustomElement';

/**
 * @enum {number}
 */
const UpgradeState_Enum = {
  NOT_UPGRADED: 1,
  UPGRADED: 2,
  UPGRADE_FAILED: 3,
  UPGRADE_IN_PROGRESS: 4,
};

const NO_BUBBLES = {bubbles: false};
const RETURN_TRUE = () => true;

/**
 * Caches whether the template tag is supported to avoid memory allocations.
 * @type {boolean|undefined}
 */
let templateTagSupported;

/** @type {!Array<AmpElement>} */
export const stubbedElements = [];

/**
 * Extensions which have failed to load, making their elements unresolvable.
 * If null, then any remaining elements which don't immediately have their
 * implClass available are marked unresolvable.
 * @type {Set<string>}
 */
const unresolvableExtensions = new Set();

/**
 * Whether this platform supports template tags.
 * @return {boolean}
 */
function isTemplateTagSupported() {
  if (templateTagSupported === undefined) {
    const template = self.document.createElement('template');
    templateTagSupported = 'content' in template;
  }
  return templateTagSupported;
}

/**
 * Creates a named custom element class.
 *
 * @param {!Window} win The window in which to register the custom element.
 * @param {function(!./service/ampdoc-impl.AmpDoc, !AmpElement, ?(typeof BaseElement))} elementConnectedCallback
 * @return {typeof AmpElement} The custom element class.
 */
export function createCustomElementClass(win, elementConnectedCallback) {
  const BaseCustomElement = /** @type {typeof HTMLElement} */ (
    createBaseCustomElementClass(win, elementConnectedCallback)
  );
  // It's necessary to create a subclass, because the same "base" class cannot
  // be registered to multiple custom elements.
  class CustomAmpElement extends BaseCustomElement {
    /**
     * adoptedCallback is only called when using a Native implementation of Custom Elements V1.
     * Our polyfill does not call this method.
     */
    adoptedCallback() {
      // Work around an issue with Firefox changing the prototype of our
      // already constructed element to the new document's HTMLElement.
      if (Object.getPrototypeOf(this) !== customAmpElementProto) {
        Object.setPrototypeOf(this, customAmpElementProto);
      }
    }
  }
  const customAmpElementProto = CustomAmpElement.prototype;
  return /** @type {typeof AmpElement} */ (CustomAmpElement);
}

/**
 * Creates a base custom element class.
 *
 * @param {!Window} win The window in which to register the custom element.
 * @param {function(!./service/ampdoc-impl.AmpDoc, !AmpElement, ?(typeof BaseElement))} elementConnectedCallback
 * @return {typeof HTMLElement}
 */
function createBaseCustomElementClass(win, elementConnectedCallback) {
  if (win.__AMP_BASE_CE_CLASS) {
    return win.__AMP_BASE_CE_CLASS;
  }
  const htmlElement = /** @type {typeof HTMLElement} */ (win.HTMLElement);

  /**
   * @abstract @extends {HTMLElement}
   */
  class BaseCustomElement extends htmlElement {
    /** */
    constructor() {
      super();
      this.createdCallback();
    }

    /**
     * Called when elements is created. Sets instance vars since there is no
     * constructor.
     * @final
     */
    createdCallback() {
      // Flag "notbuilt" is removed by Resource manager when the resource is
      // considered to be built. See "setBuilt" method.
      /** @private {boolean} */
      this.built_ = false;

      /**
       * Several APIs require the element to be connected to the DOM tree, but
       * the CustomElement lifecycle APIs are async. This lead to subtle bugs
       * that require state tracking. See #12849, https://crbug.com/821195, and
       * https://bugs.webkit.org/show_bug.cgi?id=180940.
       * @private {boolean}
       */
      this.isConnected_ = false;

      /** @private {?Promise} */
      this.buildingPromise_ = null;

      /**
       * Indicates that the `mountCallback()` has been called and it hasn't
       * been reversed with an `unmountCallback()` call.
       * @private {boolean}
       */
      this.mounted_ = false;

      /** @private {?Promise} */
      this.mountPromise_ = null;

      /** @private {?AbortController} */
      this.mountAbortController_ = null;

      /** @private {!ReadyState_Enum} */
      this.readyState_ = ReadyState_Enum.UPGRADING;

      /** @type {boolean} */
      this.everAttached = false;

      /**
       * Ampdoc can only be looked up when an element is attached.
       * @private {?./service/ampdoc-impl.AmpDoc}
       */
      this.ampdoc_ = null;

      /**
       * Resources can only be looked up when an element is attached.
       * @private {?./service/resources-interface.ResourcesInterface}
       */
      this.resources_ = null;

      /** @private {!Layout_Enum} */
      this.layout_ = Layout_Enum.NODISPLAY;

      /** @private {number} */
      this.layoutCount_ = 0;

      /** @private {boolean} */
      this.isFirstLayoutCompleted_ = false;

      /** @public {boolean} */
      this.warnOnMissingOverflow = true;

      /**
       * This element can be assigned by the {@link applyStaticLayout} to a
       * child element that will be used to size this element.
       * @package {?Element|undefined}
       */
      this.sizerElement = undefined;

      /** @private {?Element|undefined} */
      this.overflowElement_ = undefined;

      /**
       * The time at which this element was scheduled for layout relative to
       * the epoch. This value will be set to 0 until the this element has been
       * scheduled.
       * Note that this value may change over time if the element is enqueued,
       * then dequeued and re-enqueued by the scheduler.
       * @type {number|undefined}
       */
      this.layoutScheduleTime = undefined;

      // Closure compiler appears to mark HTMLElement as @struct which
      // disables bracket access. Force this with a type coercion.
      const nonStructThis = /** @type {!Object} */ (this);

      // `opt_implementationClass` is only used for tests.
      /** @type {?(typeof ../base-element.BaseElement)} */
      let Ctor =
        win.__AMP_EXTENDED_ELEMENTS &&
        win.__AMP_EXTENDED_ELEMENTS[this.localName];
      if (getMode().test && nonStructThis['implementationClassForTesting']) {
        Ctor = nonStructThis['implementationClassForTesting'];
      }

      /** @private {?(typeof ../base-element.BaseElement)} */
      this.implClass_ = Ctor === ElementStub ? null : Ctor || null;

      if (!this.implClass_) {
        stubbedElements.push(this);
      }

      /** @private {?./base-element.BaseElement} */
      this.impl_ = null;

      /**
       * An element always starts in a unupgraded state until it's added to DOM
       * for the first time in which case it can be upgraded immediately or wait
       * for script download or `upgradeCallback`.
       * @private {!UpgradeState_Enum}
       */
      this.upgradeState_ = UpgradeState_Enum.NOT_UPGRADED;

      /**
       * Time delay imposed by baseElement upgradeCallback.  If no
       * upgradeCallback specified or not yet executed, delay is 0.
       * @private {number}
       */
      this.upgradeDelayMs_ = 0;

      /**
       * Action queue is initially created and kept around until the element
       * is ready to send actions directly to the implementation.
       * - undefined initially
       * - array if used
       * - null after unspun
       * @private {?Array<!./service/action-impl.ActionInvocation>|undefined}
       */
      this.actionQueue_ = undefined;

      /**
       * Whether the element is in the template.
       * @private {boolean|undefined}
       */
      this.isInTemplate_ = undefined;

      /** @private @const */
      this.signals_ = new Signals();

      if (this.implClass_) {
        this.signals_.signal(CommonSignals_Enum.READY_TO_UPGRADE);
      }

      const perf = Services.performanceForOrNull(win);
      /** @private {boolean} */
      this.perfOn_ = perf && perf.isPerformanceTrackingOn();

      /** @private {?MediaQueryProps} */
      this.mediaQueryProps_ = null;

      if (nonStructThis[UPGRADE_TO_CUSTOMELEMENT_RESOLVER]) {
        nonStructThis[UPGRADE_TO_CUSTOMELEMENT_RESOLVER](nonStructThis);
        delete nonStructThis[UPGRADE_TO_CUSTOMELEMENT_RESOLVER];
        delete nonStructThis[UPGRADE_TO_CUSTOMELEMENT_PROMISE];
      }
    }

    /** @return {!ReadyState_Enum} */
    get readyState() {
      return this.readyState_;
    }

    /** @return {!Signals} */
    signals() {
      return this.signals_;
    }

    /**
     * Returns the associated ampdoc. Only available after attachment. It throws
     * exception before the element is attached.
     * @return {!./service/ampdoc-impl.AmpDoc}
     * @final
     * @package
     */
    getAmpDoc() {
      devAssert(this.ampdoc_, 'no ampdoc yet, since element is not attached');
      return /** @type {!./service/ampdoc-impl.AmpDoc} */ (this.ampdoc_);
    }

    /**
     * Returns Resources manager. Only available after attachment. It throws
     * exception before the element is attached.
     * @return {!./service/resources-interface.ResourcesInterface}
     * @final
     * @package
     */
    getResources() {
      devAssert(
        this.resources_,
        'no resources yet, since element is not attached'
      );
      return /** @type {!./service/resources-interface.ResourcesInterface} */ (
        this.resources_
      );
    }

    /**
     * Whether the element has been upgraded yet. Always returns false when
     * the element has not yet been added to DOM. After the element has been
     * added to DOM, the value depends on the `BaseElement` implementation and
     * its `upgradeElement` callback.
     * @return {boolean}
     * @final
     */
    isUpgraded() {
      return this.upgradeState_ == UpgradeState_Enum.UPGRADED;
    }

    /** @return {!Promise} */
    whenUpgraded() {
      return this.signals_.whenSignal(CommonSignals_Enum.UPGRADED);
    }

    /**
     * Upgrades the element to the provided new implementation. If element
     * has already been attached, it's layout validation and attachment flows
     * are repeated for the new implementation.
     * @param {typeof ./base-element.BaseElement} newImplClass
     * @final @package
     */
    upgrade(newImplClass) {
      if (this.isInTemplate_) {
        return;
      }
      if (this.upgradeState_ != UpgradeState_Enum.NOT_UPGRADED) {
        // Already upgraded or in progress or failed.
        return;
      }

      this.implClass_ = newImplClass;
      this.signals_.signal(CommonSignals_Enum.READY_TO_UPGRADE);
      if (this.everAttached) {
        // Usually, we do an implementation upgrade when the element is
        // attached to the DOM. But, if it hadn't yet upgraded from
        // ElementStub, we couldn't. Now that it's upgraded from a stub, go
        // ahead and do the full upgrade.
        this.upgradeOrSchedule_();
      }
    }

    /**
     * When the document is ready (meaning all external resources are loaded or
     * failed), we mark any stubbed elements as unresolved. If they haven't
     * been upgraded yet (or pending upgrade or deferredBuild elements), then
     * the extension failed to load.
     */
    markUnresolved() {
      if (!this.implClass_) {
        this.classList.add('amp-unresolved', 'i-amphtml-unresolved');
      }
    }

    /**
     * Time delay imposed by baseElement upgradeCallback.  If no
     * upgradeCallback specified or not yet executed, delay is 0.
     * @return {number}
     */
    getUpgradeDelayMs() {
      return this.upgradeDelayMs_;
    }

    /**
     * Completes the upgrade of the element with the provided implementation.
     * @param {!./base-element.BaseElement} newImpl
     * @param {number} upgradeStartTime
     * @final @private
     */
    completeUpgrade_(newImpl, upgradeStartTime) {
      this.impl_ = newImpl;
      this.upgradeDelayMs_ = win.Date.now() - upgradeStartTime;
      this.upgradeState_ = UpgradeState_Enum.UPGRADED;
      this.setReadyStateInternal(ReadyState_Enum.BUILDING);
      this.classList.remove('amp-unresolved', 'i-amphtml-unresolved');
      this.assertLayout_();
      this.dispatchCustomEventForTesting(AmpEvents_Enum.ATTACHED);
      if (!this.R1()) {
        this.getResources().upgraded(this);
      }
      this.signals_.signal(CommonSignals_Enum.UPGRADED);
    }

    /** @private */
    assertLayout_() {
      if (
        this.layout_ != Layout_Enum.NODISPLAY &&
        this.impl_ &&
        !this.impl_.isLayoutSupported(this.layout_)
      ) {
        userAssert(
          this.getAttribute('layout'),
          'The element did not specify a layout attribute. ' +
            'Check https://amp.dev/documentation/guides-and-tutorials/' +
            'develop/style_and_layout/control_layout and the respective ' +
            'element documentation for details.'
        );
        userAssert(false, `Layout not supported: ${this.layout_}`);
      }
    }

    /**
     * Get the priority to build the element.
     * @return {number}
     */
    getBuildPriority() {
      return this.implClass_
        ? this.implClass_.getBuildPriority(this)
        : LayoutPriority_Enum.BACKGROUND;
    }

    /**
     * Get the priority to load the element.
     * @return {number}
     * TODO(#31915): remove once R1 migration is complete.
     */
    getLayoutPriority() {
      return this.impl_
        ? this.impl_.getLayoutPriority()
        : LayoutPriority_Enum.BACKGROUND;
    }

    /**
     * Get the default action alias.
     * @return {?string}
     */
    getDefaultActionAlias() {
      devAssert(
        this.isUpgraded(),
        'Cannot get default action alias of unupgraded element'
      );
      return this.impl_.getDefaultActionAlias();
    }

    /** @return {boolean} */
    isBuilding() {
      return !!this.buildingPromise_;
    }

    /**
     * Whether the element has been built. A built element had its
     * {@link buildCallback} method successfully invoked.
     * @return {boolean}
     * @final
     */
    isBuilt() {
      return this.built_;
    }

    /**
     * Returns the promise that's resolved when the element has been built. If
     * the build fails, the resulting promise is rejected.
     * @return {!Promise}
     */
    whenBuilt() {
      return this.signals_.whenSignal(CommonSignals_Enum.BUILT);
    }

    /**
     * Requests or requires the element to be built. The build is done by
     * invoking {@link BaseElement.buildCallback} method.
     *
     * Can only be called on a upgraded element. May only be called from
     * resource.js to ensure an element and its resource are in sync.
     *
     * @return {?Promise}
     * @final
     * @restricted
     */
    buildInternal() {
      assertNotTemplate(this);
      devAssert(this.implClass_, 'Cannot build unupgraded element');
      if (this.buildingPromise_) {
        return this.buildingPromise_;
      }

      this.setReadyStateInternal(ReadyState_Enum.BUILDING);

      // Create the instance.
      const implPromise = this.createImpl_();
      this.getSizer_();

      // Wait for consent.
      const consentPromise = implPromise.then(() => {
        const policyId = this.getConsentPolicy_();
        const purposeConsents = !policyId ? this.getPurposesConsent_() : null;
        if (!policyId && !purposeConsents) {
          return;
        }
        // Must have policyId or granularExp w/ purposeConsents
        return Services.consentPolicyServiceForDocOrNull(this)
          .then((policy) => {
            if (!policy) {
              return true;
            }
            return policyId
              ? policy.whenPolicyUnblock(policyId)
              : policy.whenPurposesUnblock(purposeConsents);
          })
          .then((shouldUnblock) => {
            if (!shouldUnblock) {
              throw blockedByConsentError();
            }
          });
      });

      // Build callback.
      const buildPromise = consentPromise.then(() =>
        devAssert(this.impl_).buildCallback()
      );

      // Build the element.
      return (this.buildingPromise_ = buildPromise.then(
        () => {
          this.built_ = true;
          this.classList.add('i-amphtml-built');
          this.classList.remove('i-amphtml-notbuilt', 'amp-notbuilt');
          this.signals_.signal(CommonSignals_Enum.BUILT);

          if (this.R1()) {
            this.setReadyStateInternal(
              this.readyState_ != ReadyState_Enum.BUILDING
                ? this.readyState_
                : ReadyState_Enum.MOUNTING
            );
          } else {
            this.setReadyStateInternal(ReadyState_Enum.LOADING);
            this.preconnect(/* onLayout */ false);
          }

          if (this.isConnected_) {
            this.connected_();
          }

          if (this.actionQueue_) {
            // Only schedule when the queue is not empty, which should be
            // the case 99% of the time.
            Services.timerFor(getWin(this)).delay(
              this.dequeueActions_.bind(this),
              1
            );
          }
          if (!this.getPlaceholder()) {
            const placeholder = this.createPlaceholder();
            if (placeholder) {
              this.appendChild(placeholder);
            }
          }
        },
        (reason) => {
          this.signals_.rejectSignal(
            CommonSignals_Enum.BUILT,
            /** @type {!Error} */ (reason)
          );

          if (this.R1()) {
            this.setReadyStateInternal(ReadyState_Enum.ERROR, reason);
          }

          if (!isBlockedByConsent(reason)) {
            reportError(reason, this);
          }
          throw reason;
        }
      ));
    }

    /**
     * @return {!Promise}
     */
    build() {
      if (this.buildingPromise_) {
        return this.buildingPromise_;
      }

      const readyPromise = this.signals_.whenSignal(
        CommonSignals_Enum.READY_TO_UPGRADE
      );
      return readyPromise.then(() => {
        if (this.R1()) {
          const scheduler = getSchedulerForDoc(this.getAmpDoc());
          scheduler.scheduleAsap(this);
        }
        return this.whenBuilt();
      });
    }

    /**
     * Mounts the element by calling the `BaseElement.mountCallback` method.
     *
     * Can only be called on a upgraded element. May only be called from
     * scheduler.js.
     *
     * @return {!Promise}
     * @final
     * @restricted
     */
    mountInternal() {
      if (this.mountPromise_) {
        return this.mountPromise_;
      }
      this.mountAbortController_ =
        this.mountAbortController_ || new AbortController();
      const {signal} = this.mountAbortController_;
      return (this.mountPromise_ = this.buildInternal()
        .then(() => {
          devAssert(this.R1());
          if (signal.aborted) {
            // Mounting has been canceled.
            return;
          }
          this.setReadyStateInternal(
            this.readyState_ != ReadyState_Enum.MOUNTING
              ? this.readyState_
              : this.implClass_.usesLoading(this)
                ? ReadyState_Enum.LOADING
                : ReadyState_Enum.MOUNTING
          );
          this.mounted_ = true;
          const result = this.impl_.mountCallback(signal);
          // The promise supports the V0 format for easy migration. If the
          // `mountCallback` returns a promise, the assumption is that the
          // element has finished loading when the promise completes.
          return result ? result.then(RETURN_TRUE) : false;
        })
        .then((hasLoaded) => {
          this.mountAbortController_ = null;
          if (signal.aborted) {
            throw cancellation();
          }
          this.signals_.signal(CommonSignals_Enum.MOUNTED);
          if (!this.implClass_.usesLoading(this) || hasLoaded) {
            this.setReadyStateInternal(ReadyState_Enum.COMPLETE);
          }
        })
        .catch((reason) => {
          this.mountAbortController_ = null;
          if (isCancellation(reason)) {
            this.mountPromise_ = null;
          } else {
            this.signals_.rejectSignal(
              CommonSignals_Enum.MOUNTED,
              /** @type {!Error} */ (reason)
            );
            this.setReadyStateInternal(ReadyState_Enum.ERROR, reason);
          }
          throw reason;
        }));
    }

    /**
     * Requests the element to be mounted as soon as possible.
     * @return {!Promise}
     * @final
     */
    mount() {
      if (this.mountPromise_) {
        return this.mountPromise_;
      }

      // Create the abort controller right away to ensure that we the unmount
      // will properly cancel this operation.
      this.mountAbortController_ =
        this.mountAbortController_ || new AbortController();
      const {signal} = this.mountAbortController_;

      const readyPromise = this.signals_.whenSignal(
        CommonSignals_Enum.READY_TO_UPGRADE
      );
      return readyPromise.then(() => {
        if (!this.R1()) {
          return this.whenBuilt();
        }
        if (signal.aborted) {
          throw cancellation();
        }
        const scheduler = getSchedulerForDoc(this.getAmpDoc());
        scheduler.scheduleAsap(this);
        return this.whenMounted();
      });
    }

    /**
     * Unmounts the element and makes it ready for the next mounting
     * operation.
     * @final
     */
    unmount() {
      // Ensure that the element is paused.
      if (this.isConnected_) {
        this.pause();
      }

      // Legacy R0 elements simply unlayout.
      if (!this.R1()) {
        this.unlayout_();
        return;
      }

      // Cancel the currently mounting operation.
      if (this.mountAbortController_) {
        this.mountAbortController_.abort();
        this.mountAbortController_ = null;
      }

      // Unschedule a currently pending mount request.
      const scheduler = getSchedulerForDoc(this.getAmpDoc());
      scheduler.unschedule(this);

      // Try to unmount if the element has been built already.
      if (this.mounted_) {
        this.impl_.unmountCallback();
      }

      // Complete unmount and reset the state.
      this.mounted_ = false;
      this.mountPromise_ = null;
      this.reset_();

      // Prepare for the next mount if the element is connected.
      if (this.isConnected_) {
        this.upgradeOrSchedule_(/* opt_disablePreload */ true);
      }
    }

    /**
     * Returns the promise that's resolved when the element has been mounted. If
     * the mount fails, the resulting promise is rejected.
     * @return {!Promise}
     */
    whenMounted() {
      return this.signals_.whenSignal(CommonSignals_Enum.MOUNTED);
    }

    /**
     * @return {!Promise}
     * @final
     */
    whenLoaded() {
      return this.signals_.whenSignal(CommonSignals_Enum.LOAD_END);
    }

    /**
     * Ensure that the element is eagerly loaded.
     *
     * @param {number=} opt_parentPriority
     * @return {!Promise}
     * @final
     */
    ensureLoaded(opt_parentPriority) {
      return this.mount().then(() => {
        if (this.R1()) {
          if (this.implClass_.usesLoading(this)) {
            this.impl_.ensureLoaded();
          }
          return this.whenLoaded();
        }

        // Very ugly! The "built" signal must be resolved from the Resource
        // and not the element itself because the Resource has not correctly
        // set its state for the downstream to process it correctly.
        const resource = this.getResource_();
        return resource.whenBuilt().then(() => {
          if (resource.getState() == ResourceState_Enum.LAYOUT_COMPLETE) {
            return;
          }
          if (
            resource.getState() != ResourceState_Enum.LAYOUT_SCHEDULED ||
            resource.isMeasureRequested()
          ) {
            resource.measure();
          }
          if (!resource.isDisplayed()) {
            return;
          }
          this.getResources().scheduleLayoutOrPreload(
            resource,
            /* layout */ true,
            opt_parentPriority,
            /* forceOutsideViewport */ true
          );
          return this.whenLoaded();
        });
      });
    }

    /**
     * See `BaseElement.setAsContainer`.
     *
     * @param {!Element=} opt_scroller A child of the container that should be
     * monitored. Typically a scrollable element.
     * @restricted
     * @final
     */
    setAsContainerInternal(opt_scroller) {
      const builder = getSchedulerForDoc(this.getAmpDoc());
      builder.setContainer(this, opt_scroller);
    }

    /**
     * See `BaseElement.removeAsContainer`.
     * @restricted
     * @final
     */
    removeAsContainerInternal() {
      const builder = getSchedulerForDoc(this.getAmpDoc());
      builder.removeContainer(this);
    }

    /**
     * Update the internal ready state.
     *
     * @param {!ReadyState_Enum} state
     * @param {*=} opt_failure
     * @protected
     * @final
     */
    setReadyStateInternal(state, opt_failure) {
      if (state === this.readyState_) {
        return;
      }

      this.readyState_ = state;

      if (!this.R1()) {
        return;
      }

      switch (state) {
        case ReadyState_Enum.LOADING:
          this.signals_.signal(CommonSignals_Enum.LOAD_START);
          this.signals_.reset(CommonSignals_Enum.UNLOAD);
          this.signals_.reset(CommonSignals_Enum.LOAD_END);
          this.classList.add('i-amphtml-layout');
          // Potentially start the loading indicator.
          this.toggleLoading(true);
          this.dispatchCustomEventForTesting(AmpEvents_Enum.LOAD_START);
          return;
        case ReadyState_Enum.COMPLETE:
          // LOAD_START is set just in case. It won't be overwritten if
          // it had been set before.
          this.signals_.signal(CommonSignals_Enum.LOAD_START);
          this.signals_.signal(CommonSignals_Enum.LOAD_END);
          this.signals_.reset(CommonSignals_Enum.UNLOAD);
          this.classList.add('i-amphtml-layout');
          this.toggleLoading(false);
          dom.dispatchCustomEvent(this, 'load', null, NO_BUBBLES);
          this.dispatchCustomEventForTesting(AmpEvents_Enum.LOAD_END);
          return;
        case ReadyState_Enum.ERROR:
          this.signals_.rejectSignal(
            CommonSignals_Enum.LOAD_END,
            /** @type {!Error} */ (opt_failure)
          );
          this.toggleLoading(false);
          dom.dispatchCustomEvent(this, 'error', opt_failure, NO_BUBBLES);
          return;
      }
    }

    /**
     * Called to instruct the element to preconnect to hosts it uses during
     * layout.
     * @param {boolean} onLayout Whether this was called after a layout.
     * TODO(#31915): remove once R1 migration is complete.
     */
    preconnect(onLayout) {
      devAssert(this.isUpgraded());
      if (onLayout) {
        this.impl_.preconnectCallback(onLayout);
      } else {
        // If we do early preconnects we delay them a bit. This is kind of
        // an unfortunate trade off, but it seems faster, because the DOM
        // operations themselves are not free and might delay
        startupChunk(this.getAmpDoc(), () => {
          if (!this.ownerDocument || !this.ownerDocument.defaultView) {
            return;
          }
          this.impl_.preconnectCallback(onLayout);
        });
      }
    }

    /**
     * See `BaseElement.R1()`.
     *
     * @return {boolean}
     * @final
     */
    R1() {
      return this.implClass_ ? this.implClass_.R1() : false;
    }

    /**
     * See `BaseElement.deferredMount()`.
     *
     * @return {boolean}
     * @final
     */
    deferredMount() {
      return this.implClass_ ? this.implClass_.deferredMount(this) : false;
    }

    /**
     * Whether the custom element declares that it has to be fixed.
     * @return {boolean}
     */
    isAlwaysFixed() {
      return this.impl_ ? this.impl_.isAlwaysFixed() : false;
    }

    /**
     * Updates the layout box of the element.
     * Should only be called by Resources.
     * @param {!./layout-rect.LayoutRectDef} layoutBox
     * @param {boolean} sizeChanged
     */
    updateLayoutBox(layoutBox, sizeChanged = false) {
      if (this.isBuilt()) {
        this.onMeasure(sizeChanged);
      }
    }

    /**
     * Calls onLayoutMeasure() on the BaseElement implementation.
     * Should only be called by Resources.
     */
    onMeasure() {
      devAssert(this.isBuilt());
      try {
        this.impl_.onLayoutMeasure();
      } catch (e) {
        reportError(e, this);
      }
    }

    /**
     * @return {?Element}
     * @private
     */
    getSizer_() {
      if (
        this.sizerElement === undefined &&
        (this.layout_ === Layout_Enum.RESPONSIVE ||
          this.layout_ === Layout_Enum.INTRINSIC)
      ) {
        // Expect sizer to exist, just not yet discovered.
        this.sizerElement = this.querySelector('i-amphtml-sizer');
        this.sizerElement?.setAttribute('slot', 'i-amphtml-svc');
      }
      return this.sizerElement || null;
    }

    /**
     * @param {Element} sizer
     * @private
     */
    resetSizer_(sizer) {
      if (this.layout_ === Layout_Enum.RESPONSIVE) {
        setStyle(sizer, 'paddingTop', '0');
        return;
      }
      if (this.layout_ === Layout_Enum.INTRINSIC) {
        const intrinsicSizerImg = sizer.querySelector(
          '.i-amphtml-intrinsic-sizer'
        );
        if (!intrinsicSizerImg) {
          return;
        }
        intrinsicSizerImg.setAttribute('src', '');
        return;
      }
    }

    /** @private */
    initMediaAttrs_() {
      const hasMediaAttrs =
        this.hasAttribute('media') ||
        (this.hasAttribute('sizes') &&
          !this.hasAttribute('disable-inline-width')) ||
        this.hasAttribute('heights');
      const hadMediaAttrs = !!this.mediaQueryProps_;
      const win = this.ownerDocument.defaultView;
      if (hasMediaAttrs != hadMediaAttrs && win) {
        if (hasMediaAttrs) {
          this.mediaQueryProps_ = new MediaQueryProps(win, () =>
            this.applyMediaAttrs_()
          );
          this.applyMediaAttrs_();
        } else {
          this.disposeMediaAttrs_();
        }
      }
    }

    /** @private */
    disposeMediaAttrs_() {
      if (this.mediaQueryProps_) {
        this.mediaQueryProps_.dispose();
        this.mediaQueryProps_ = null;
      }
    }

    /** @private */
    applyMediaAttrs_() {
      const props = this.mediaQueryProps_;
      if (!props) {
        return;
      }

      props.start();

      // Media query.
      const mediaAttr = this.getAttribute('media') || null;
      const matchesMedia = mediaAttr
        ? props.resolveMatchQuery(mediaAttr)
        : true;
      this.classList.toggle('i-amphtml-hidden-by-media-query', !matchesMedia);

      // Sizes.
      const sizesAttr = this.hasAttribute('disable-inline-width')
        ? null
        : this.getAttribute('sizes');
      if (sizesAttr) {
        setStyle(this, 'width', props.resolveListQuery(sizesAttr));
      }

      // Heights.
      const heightsAttr =
        this.layout_ === Layout_Enum.RESPONSIVE
          ? this.getAttribute('heights')
          : null;
      if (heightsAttr) {
        const sizer = this.getSizer_();
        if (sizer) {
          setStyle(sizer, 'paddingTop', props.resolveListQuery(heightsAttr));
        }
      }

      props.complete();
      this.getResource_().requestMeasure();
    }

    /**
     * Applies a size change to the element.
     *
     * This method is called by Resources and shouldn't be called by anyone
     * else. This method must always be called in the mutation context.
     *
     * @param {number|undefined} newHeight
     * @param {number|undefined} newWidth
     * @param {!./layout-rect.LayoutMarginsDef=} opt_newMargins
     * @final
     * @package
     */
    applySize(newHeight, newWidth, opt_newMargins) {
      const sizer = this.getSizer_();
      if (sizer) {
        // From the moment height is changed the element becomes fully
        // responsible for managing its height. Aspect ratio is no longer
        // preserved.
        this.sizerElement = null;
        this.resetSizer_(sizer);
        this.mutateOrInvoke_(() => {
          if (sizer) {
            dom.removeElement(sizer);
          }
        });
      }
      if (newHeight !== undefined) {
        setStyle(this, 'height', newHeight, 'px');
      }
      if (newWidth !== undefined) {
        setStyle(this, 'width', newWidth, 'px');
      }
      if (opt_newMargins) {
        if (opt_newMargins.top != null) {
          setStyle(this, 'marginTop', opt_newMargins.top, 'px');
        }
        if (opt_newMargins.right != null) {
          setStyle(this, 'marginRight', opt_newMargins.right, 'px');
        }
        if (opt_newMargins.bottom != null) {
          setStyle(this, 'marginBottom', opt_newMargins.bottom, 'px');
        }
        if (opt_newMargins.left != null) {
          setStyle(this, 'marginLeft', opt_newMargins.left, 'px');
        }
      }
      if (this.isAwaitingSize_()) {
        this.sizeProvided_();
      }
      dom.dispatchCustomEvent(this, AmpEvents_Enum.SIZE_CHANGED);
    }

    /**
     * Called when the element is first connected to the DOM.
     *
     * This callback is guarded by checks to see if the element is still
     * connected.  Chrome and Safari can trigger connectedCallback even when
     * the node is disconnected. See #12849, https://crbug.com/821195, and
     * https://bugs.webkit.org/show_bug.cgi?id=180940. Thankfully,
     * connectedCallback will later be called when the disconnected root is
     * connected to the document tree.
     *
     * @final
     */
    connectedCallback() {
      if (!isTemplateTagSupported() && this.isInTemplate_ === undefined) {
        this.isInTemplate_ = !!query.closestAncestorElementBySelector(
          this,
          'template'
        );
      }
      if (this.isInTemplate_) {
        return;
      }

      if (this.isConnected_ || !dom.isConnectedNode(this)) {
        return;
      }
      this.isConnected_ = true;

      if (!this.everAttached) {
        this.classList.add(
          'i-amphtml-element',
          'i-amphtml-notbuilt',
          'amp-notbuilt'
        );
      }

      if (!this.ampdoc_) {
        // Ampdoc can now be initialized.
        const win = getWin(this);
        const ampdocService = Services.ampdocServiceFor(win);
        const ampdoc = ampdocService.getAmpDoc(this);
        this.ampdoc_ = ampdoc;
        elementConnectedCallback(ampdoc, this, this.implClass_);
      }
      if (!this.resources_) {
        // Resources can now be initialized since the ampdoc is now available.
        this.resources_ = Services.resourcesForDoc(this.ampdoc_);
      }
      this.getResources().add(this);

      if (this.everAttached) {
        const reconstruct = this.reconstructWhenReparented();
        if (reconstruct) {
          this.reset_();
        }
        if (this.isUpgraded()) {
          if (reconstruct && !this.R1()) {
            this.getResources().upgraded(this);
          }
          this.connected_();
          this.dispatchCustomEventForTesting(AmpEvents_Enum.ATTACHED);
        }
        if (this.implClass_ && this.R1()) {
          this.upgradeOrSchedule_();
        }
      } else {
        this.everAttached = true;

        try {
          this.layout_ = applyStaticLayout(this);
          this.initMediaAttrs_();
        } catch (e) {
          reportError(e, this);
        }

        if (this.implClass_) {
          this.upgradeOrSchedule_();
        } else if (
          unresolvableExtensions.has('*') ||
          unresolvableExtensions.has(this.tagName.toLowerCase())
        ) {
          this.markUnresolved();
        }

        if (!this.isUpgraded()) {
          this.dispatchCustomEventForTesting(AmpEvents_Enum.STUBBED);
        }
      }

      this.toggleLoading(true);
    }

    /**
     * @return {boolean}
     * @private
     */
    isAwaitingSize_() {
      return this.classList.contains('i-amphtml-layout-awaiting-size');
    }

    /**
     * @private
     */
    sizeProvided_() {
      this.classList.remove('i-amphtml-layout-awaiting-size');
    }

    /**
     * Upgrade or schedule element based on R1.
     * @param {boolean=} opt_disablePreload
     * @private @final
     */
    upgradeOrSchedule_(opt_disablePreload) {
      if (!this.R1()) {
        this.tryUpgrade_();
        return;
      }

      if (this.mountPromise_) {
        // Already mounting.
        return;
      }

      // Schedule build and mount.
      const scheduler = getSchedulerForDoc(this.getAmpDoc());
      scheduler.schedule(this);
      this.classList.remove('amp-unresolved', 'i-amphtml-unresolved');

      if (this.buildingPromise_) {
        // Already built or building: just needs to be mounted.
        this.setReadyStateInternal(
          this.implClass_ && this.implClass_.usesLoading(this)
            ? ReadyState_Enum.LOADING
            : ReadyState_Enum.MOUNTING
        );
      } else {
        // Not built yet: execute prebuild steps.
        this.setReadyStateInternal(ReadyState_Enum.BUILDING);

        // Schedule preconnects.
        if (!opt_disablePreload) {
          const urls = this.implClass_.getPreconnects(this);
          if (urls && urls.length > 0) {
            // If we do early preconnects we delay them a bit. This is kind of
            // an unfortunate trade off, but it seems faster, because the DOM
            // operations themselves are not free and might delay
            const ampdoc = this.getAmpDoc();
            startupChunk(ampdoc, () => {
              const {win} = ampdoc;
              if (!win) {
                return;
              }
              const preconnect = Services.preconnectFor(win);
              urls.forEach((url) =>
                preconnect.url(ampdoc, url, /* alsoConnecting */ false)
              );
            });
          }
        }
      }
    }

    /**
     * Try to upgrade the element with the provided implementation.
     * @return {!Promise|undefined}
     * @private @final
     */
    tryUpgrade_() {
      if (this.isInTemplate_) {
        return;
      }
      if (this.upgradeState_ != UpgradeState_Enum.NOT_UPGRADED) {
        // Already upgraded or in progress or failed.
        return;
      }

      const Ctor = devAssert(
        this.implClass_,
        'Implementation must not be a stub'
      );

      const impl = new Ctor(this);

      // The `upgradeCallback` only allows redirect once for the top-level
      // non-stub class. We may allow nested upgrades later, but they will
      // certainly be bad for performance.
      this.upgradeState_ = UpgradeState_Enum.UPGRADE_IN_PROGRESS;
      const startTime = win.Date.now();
      const res = impl.upgradeCallback();
      if (!res) {
        // Nothing returned: the current object is the upgraded version.
        this.completeUpgrade_(impl, startTime);
      } else if (typeof res.then == 'function') {
        // It's a promise: wait until it's done.
        return res
          .then((upgrade) => {
            this.completeUpgrade_(upgrade || impl, startTime);
          })
          .catch((reason) => {
            this.upgradeState_ = UpgradeState_Enum.UPGRADE_FAILED;
            rethrowAsync(reason);
          });
      } else {
        // It's an actual instance: upgrade immediately.
        this.completeUpgrade_(
          /** @type {!./base-element.BaseElement} */ (res),
          startTime
        );
      }
    }

    /**
     * Called when the element is disconnected from the DOM.
     *
     * @final
     */
    disconnectedCallback() {
      this.disconnect(/* pretendDisconnected */ false);
    }

    /** @private */
    connected_() {
      if (this.built_) {
        this.impl_.attachedCallback();
      }
    }

    /**
     * Called when an element is disconnected from DOM, or when an ampDoc is
     * being disconnected (the element itself may still be connected to ampDoc).
     *
     * This callback is guarded by checks to see if the element is still
     * connected. See #12849, https://crbug.com/821195, and
     * https://bugs.webkit.org/show_bug.cgi?id=180940.
     * If the element is still connected to the document, you'll need to pass
     * opt_pretendDisconnected.
     *
     * @param {boolean} pretendDisconnected Forces disconnection regardless
     *     of DOM isConnected.
     */
    disconnect(pretendDisconnected) {
      if (this.isInTemplate_ || !this.isConnected_) {
        return;
      }
      if (!pretendDisconnected && dom.isConnectedNode(this)) {
        return;
      }

      // This path only comes from Resource#disconnect, which deletes the
      // Resource instance tied to this element. Therefore, it is no longer
      // an AMP Element. But, DOM queries for i-amphtml-element assume that
      // the element is tied to a Resource.
      if (pretendDisconnected) {
        this.classList.remove('i-amphtml-element');
      }

      this.isConnected_ = false;
      this.getResources().remove(this);
      if (this.impl_) {
        this.impl_.detachedCallback();
      }
      if (this.R1()) {
        this.unmount();
      }
      this.toggleLoading(false);
      this.disposeMediaAttrs_();
    }

    /**
     * Dispatches a custom event only in testing environment.
     *
     * @param {string} name
     * @param {!Object=} opt_data Event data.
     * @final
     */
    dispatchCustomEventForTesting(name, opt_data) {
      if (!getMode().test) {
        return;
      }
      dom.dispatchCustomEvent(this, name, opt_data);
    }

    /**
     * Whether the element can pre-render.
     * @return {boolean}
     * @final
     */
    prerenderAllowed() {
      if (this.hasAttribute('noprerender')) {
        return false;
      }
      return this.implClass_ ? this.implClass_.prerenderAllowed(this) : false;
    }

    /**
     * Whether the element can preview.
     * @return {boolean}
     * @final
     */
    previewAllowed() {
      return this.implClass_ ? this.implClass_.previewAllowed(this) : false;
    }

    /**
     * Whether the element has render-blocking service.
     * @return {boolean}
     * @final
     */
    isBuildRenderBlocking() {
      return this.impl_ ? this.impl_.isBuildRenderBlocking() : false;
    }

    /**
     * Creates a placeholder for the element.
     * @return {?Element}
     * @final
     */
    createPlaceholder() {
      return this.impl_ ? this.impl_.createPlaceholderCallback() : null;
    }

    /**
     * Creates a loader logo.
     * @return {{
     *  content: (!Element|undefined),
     *  color: (string|undefined),
     * }}
     * @final
     */
    createLoaderLogo() {
      return this.implClass_
        ? this.implClass_.createLoaderLogoCallback(this)
        : {};
    }

    /**
     * Whether the element should ever render when it is not in viewport.
     * @return {boolean|number}
     * @final
     */
    renderOutsideViewport() {
      return this.impl_ ? this.impl_.renderOutsideViewport() : false;
    }

    /**
     * Whether the element should render outside of renderOutsideViewport when
     * the scheduler is idle.
     * @return {boolean|number}
     * @final
     */
    idleRenderOutsideViewport() {
      return this.impl_ ? this.impl_.idleRenderOutsideViewport() : false;
    }

    /**
     * Returns a previously measured layout box adjusted to the viewport. This
     * mainly affects fixed-position elements that are adjusted to be always
     * relative to the document position in the viewport.
     * @return {!./layout-rect.LayoutRectDef}
     * @final
     */
    getLayoutBox() {
      return this.getResource_().getLayoutBox();
    }

    /**
     * Returns a previously measured layout size.
     * @return {!./layout-rect.LayoutSizeDef}
     * @final
     */
    getLayoutSize() {
      return this.getResource_().getLayoutSize();
    }

    /**
     * @return {?Element}
     * @final
     */
    getOwner() {
      return this.getResource_().getOwner();
    }

    /**
     * Returns a change entry for that should be compatible with
     * IntersectionObserverEntry.
     * @return {?IntersectionObserverEntry} A change entry.
     * @final
     */
    getIntersectionChangeEntry() {
      const box = this.impl_
        ? this.impl_.getIntersectionElementLayoutBox()
        : this.getLayoutBox();
      const owner = this.getOwner();
      const viewport = Services.viewportForDoc(this.getAmpDoc());
      const viewportBox = viewport.getRect();
      // TODO(jridgewell, #4826): We may need to make this recursive.
      const ownerBox = owner && owner.getLayoutBox();
      return getIntersectionChangeEntry(box, ownerBox, viewportBox);
    }

    /**
     * Returns the resource of the element.
     * @return {!./service/resource.Resource}
     * @private
     */
    getResource_() {
      return this.getResources().getResourceForElement(this);
    }

    /**
     * Returns the resource ID of the element.
     * @return {number}
     */
    getResourceId() {
      return this.getResource_().getId();
    }

    /**
     * The runtime calls this method to determine if {@link layoutCallback}
     * should be called again when layout changes.
     * @return {boolean}
     * @package @final
     * TODO(#31915): remove once R1 migration is complete.
     */
    isRelayoutNeeded() {
      return this.impl_ ? this.impl_.isRelayoutNeeded() : false;
    }

    /**
     * Returns reference to upgraded implementation.
     * @param {boolean} waitForBuild If true, waits for element to be built before
     *   resolving the returned Promise. Default is true.
     * @return {!Promise<!./base-element.BaseElement>}
     */
    getImpl(waitForBuild = true) {
      const waitFor = waitForBuild ? this.build() : this.createImpl_();
      return waitFor.then(() => this.impl_);
    }

    /**
     * @return {!Promise<!./base-element.BaseElement>}
     * @private
     */
    createImpl_() {
      return this.signals_
        .whenSignal(CommonSignals_Enum.READY_TO_UPGRADE)
        .then(() => {
          this.tryUpgrade_();
          return this.whenUpgraded();
        });
    }

    /**
     * Returns the object which holds the API surface (the thing we add the
     * custom methods/properties onto). In Bento, this is the imperative API
     * object. In AMP, this is the BaseElement instance.
     *
     * @return {!Promise<!Object>}
     */
    getApi() {
      return this.getImpl().then((impl) => impl.getApi());
    }

    /**
     * Returns the layout of the element.
     * @return {!Layout_Enum}
     */
    getLayout() {
      return this.layout_;
    }

    /**
     * Instructs the element to layout its content and load its resources if
     * necessary by calling the {@link BaseElement.layoutCallback} method that
     * should be implemented by BaseElement subclasses. Must return a promise
     * that will yield when the layout and associated loadings are complete.
     *
     * This method is always called for the first layout, but for subsequent
     * layouts the runtime consults {@link isRelayoutNeeded} method.
     *
     * Can only be called on a upgraded and built element.
     *
     * @param {!AbortSignal} signal
     * @return {!Promise}
     * @package @final
     * TODO(#31915): remove once R1 migration is complete.
     */
    layoutCallback(signal) {
      assertNotTemplate(this);
      devAssert(this.isBuilt(), 'Must be built to receive viewport events');
      // A lot of tests call layoutCallback manually, and don't pass a signal.
      if ((!getMode().test || signal) && signal.aborted) {
        return Promise.reject(cancellation());
      }

      this.dispatchCustomEventForTesting(AmpEvents_Enum.LOAD_START);
      const isLoadEvent = this.layoutCount_ == 0; // First layout is "load".
      this.signals_.reset(CommonSignals_Enum.UNLOAD);
      if (isLoadEvent) {
        this.signals_.signal(CommonSignals_Enum.LOAD_START);
      }

      // Potentially start the loading indicator.
      this.toggleLoading(true);

      const promise = tryResolve(() => this.impl_.layoutCallback());
      this.preconnect(/* onLayout */ true);
      this.classList.add('i-amphtml-layout');

      return promise.then(
        () => {
          if ((!getMode().test || signal) && signal.aborted) {
            throw cancellation();
          }
          if (isLoadEvent) {
            this.signals_.signal(CommonSignals_Enum.LOAD_END);
          }
          this.setReadyStateInternal(ReadyState_Enum.COMPLETE);
          this.layoutCount_++;
          this.toggleLoading(false);
          // Check if this is the first success layout that needs
          // to call firstLayoutCompleted.
          if (!this.isFirstLayoutCompleted_) {
            this.impl_.firstLayoutCompleted();
            this.isFirstLayoutCompleted_ = true;
            this.dispatchCustomEventForTesting(AmpEvents_Enum.LOAD_END);
          }
        },
        (reason) => {
          if ((!getMode().test || signal) && signal.aborted) {
            throw cancellation();
          }
          // add layoutCount_ by 1 despite load fails or not
          if (isLoadEvent) {
            this.signals_.rejectSignal(
              CommonSignals_Enum.LOAD_END,
              /** @type {!Error} */ (reason)
            );
          }
          this.setReadyStateInternal(ReadyState_Enum.ERROR, reason);
          this.layoutCount_++;
          this.toggleLoading(false);
          throw reason;
        }
      );
    }

    /**
     * Pauses the element.
     *
     * @package @final
     */
    pause() {
      if (!this.isBuilt()) {
        // Not built yet.
        return;
      }

      this.impl_.pauseCallback();

      // Legacy unlayoutOnPause support.
      if (!this.R1() && this.impl_.unlayoutOnPause()) {
        this.unlayout_();
      }
    }

    /**
     * Requests the resource to resume its activity when the document returns
     * from an inactive state. The scope is up to the actual component. Among
     * other things the active playback of video or audio content may be
     * resumed.
     *
     * @package @final
     */
    resume() {
      if (!this.isBuilt()) {
        return;
      }
      this.impl_.resumeCallback();
    }

    /**
     * Requests the element to unload any expensive resources when the element
     * goes into non-visible state. The scope is up to the actual component.
     *
     * Calling this method on unbuilt or unupgraded element has no effect.
     *
     * @return {boolean}
     * @package @final
     * TODO(#31915): remove once R1 migration is complete.
     */
    unlayoutCallback() {
      assertNotTemplate(this);
      if (!this.isBuilt()) {
        return false;
      }
      this.signals_.signal(CommonSignals_Enum.UNLOAD);
      const isReLayoutNeeded = this.impl_.unlayoutCallback();
      if (isReLayoutNeeded) {
        this.reset_();
      }
      this.dispatchCustomEventForTesting(AmpEvents_Enum.UNLOAD);
      return isReLayoutNeeded;
    }

    /** @private */
    unlayout_() {
      this.getResource_().unlayout();
      if (this.isConnected_ && this.resources_) {
        this.resources_./*OK*/ schedulePass();
      }
    }

    /** @private */
    reset_() {
      this.layoutCount_ = 0;
      this.isFirstLayoutCompleted_ = false;
      this.signals_.reset(CommonSignals_Enum.MOUNTED);
      this.signals_.reset(CommonSignals_Enum.RENDER_START);
      this.signals_.reset(CommonSignals_Enum.LOAD_START);
      this.signals_.reset(CommonSignals_Enum.LOAD_END);
      this.signals_.reset(CommonSignals_Enum.INI_LOAD);
    }

    /**
     * Whether the element needs to be reconstructed after it has been
     * re-parented. Many elements cannot survive fully the reparenting and
     * are better to be reconstructed from scratch.
     *
     * @return {boolean}
     * @package @final
     */
    reconstructWhenReparented() {
      return this.impl_ ? this.impl_.reconstructWhenReparented() : false;
    }

    /**
     * Collapses the element, and notifies its owner (if there is one) that the
     * element is no longer present.
     */
    collapse() {
      if (this.impl_) {
        this.impl_./*OK*/ collapse();
      }
    }

    /**
     * Called every time an owned AmpElement collapses itself.
     * @param {!AmpElement} element
     */
    collapsedCallback(element) {
      if (this.impl_) {
        this.impl_.collapsedCallback(element);
      }
    }

    /**
     * Expands the element, and notifies its owner (if there is one) that the
     * element is now present.
     */
    expand() {
      if (this.impl_) {
        this.impl_./*OK*/ expand();
      }
    }

    /**
     * Called when one or more attributes are mutated.
     * Note: Must be called inside a mutate context.
     * Note: Boolean attributes have a value of `true` and `false` when
     *     present and missing, respectively.
     * @param {!JsonObject<string, (null|boolean|string|number|Array|Object)>} mutations
     */
    mutatedAttributesCallback(mutations) {
      if (this.impl_) {
        this.impl_.mutatedAttributesCallback(mutations);
      } else if (this.R1()) {
        // If amp-bind is trying to mutate an uninitialized BaseElement, it is probably about time
        // to initialize it.
        const scheduler = getSchedulerForDoc(this);
        scheduler.scheduleAsap(this);
      }
    }

    /**
     * Enqueues the action with the element. If element has been upgraded and
     * built, the action is dispatched to the implementation right away.
     * Otherwise the invocation is enqueued until the implementation is ready
     * to receive actions.
     * @param {!./service/action-impl.ActionInvocation} invocation
     * @final
     */
    enqueAction(invocation) {
      assertNotTemplate(this);
      if (!this.isBuilt()) {
        if (this.actionQueue_ === undefined) {
          this.actionQueue_ = [];
        }
        devAssert(this.actionQueue_).push(invocation);
        // Schedule build sooner.
        this.build();
      } else {
        this.executionAction_(invocation, false);
      }
    }

    /**
     * Dequeues events from the queue and dispatches them to the implementation
     * with "deferred" flag.
     * @private
     */
    dequeueActions_() {
      if (!this.actionQueue_) {
        return;
      }

      const actionQueue = devAssert(this.actionQueue_);
      this.actionQueue_ = null;

      // Notice, the actions are currently not de-duped.
      actionQueue.forEach((invocation) => {
        this.executionAction_(invocation, true);
      });
    }

    /**
     * Executes the action immediately. All errors are consumed and reported.
     * @param {!./service/action-impl.ActionInvocation} invocation
     * @param {boolean} deferred
     * @final
     * @private
     */
    executionAction_(invocation, deferred) {
      try {
        this.impl_.executeAction(invocation, deferred);
      } catch (e) {
        rethrowAsync(
          'Action execution failed:',
          e,
          invocation.node.tagName,
          invocation.method
        );
      }
    }

    /**
     * Get the consent policy to follow.
     * @return {?string}
     */
    getConsentPolicy_() {
      let policyId = this.getAttribute('data-block-on-consent');
      if (policyId === null) {
        if (shouldBlockOnConsentByMeta(this)) {
          policyId = 'default';
          this.setAttribute('data-block-on-consent', policyId);
        } else {
          // data-block-on-consent attribute not set
          return null;
        }
      }
      if (policyId == '' || policyId == 'default') {
        // data-block-on-consent value not set, up to individual element
        // Note: data-block-on-consent and data-block-on-consent='default' is
        // treated exactly the same
        return devAssert(this.impl_).getConsentPolicy();
      }
      return policyId;
    }

    /**
     * Get the purpose consents that should be granted.
     * @return {Array<string>|undefined}
     */
    getPurposesConsent_() {
      const purposes =
        this.getAttribute('data-block-on-consent-purposes') || null;
      return purposes?.replace(/\s+/g, '')?.split(',');
    }

    /**
     * Returns an optional placeholder element for this custom element.
     * @return {?Element}
     * @package @final
     */
    getPlaceholder() {
      return query.lastChildElement(this, (el) => {
        return (
          el.hasAttribute('placeholder') &&
          // Denylist elements that has a native placeholder property
          // like input and textarea. These are not allowed to be AMP
          // placeholders.
          !isInputPlaceholder(el)
        );
      });
    }

    /**
     * Hides or shows the placeholder, if available.
     * @param {boolean} show
     * @package @final
     */
    togglePlaceholder(show) {
      assertNotTemplate(this);
      if (show) {
        const placeholder = this.getPlaceholder();
        if (placeholder) {
          dev().assertElement(placeholder).classList.remove('amp-hidden');
        }
      } else {
        const placeholders = query.childElementsByAttr(this, 'placeholder');
        for (let i = 0; i < placeholders.length; i++) {
          // Don't toggle elements with a native placeholder property
          // e.g. input, textarea
          if (isInputPlaceholder(placeholders[i])) {
            continue;
          }
          placeholders[i].classList.add('amp-hidden');
        }
      }
    }

    /**
     * Returns an optional fallback element for this custom element.
     * @return {?Element}
     * @package @final
     */
    getFallback() {
      return query.childElementByAttr(this, 'fallback');
    }

    /**
     * Hides or shows the fallback, if available. This function must only
     * be called inside a mutate context.
     * @param {boolean} show
     * @package @final
     */
    toggleFallback(show) {
      assertNotTemplate(this);
      const resourceState = this.getResource_().getState();
      // Do not show fallback before layout
      if (
        !this.R1() &&
        show &&
        (resourceState == ResourceState_Enum.NOT_BUILT ||
          resourceState == ResourceState_Enum.NOT_LAID_OUT ||
          resourceState == ResourceState_Enum.READY_FOR_LAYOUT)
      ) {
        return;
      }
      // This implementation is notably less efficient then placeholder
      // toggling. The reasons for this are: (a) "not supported" is the state of
      // the whole element, (b) some relayout is expected and (c) fallback
      // condition would be rare.
      this.classList.toggle('amp-notsupported', show);
      if (show == true) {
        const fallbackElement = this.getFallback();
        if (fallbackElement) {
          Services.ownersForDoc(this.getAmpDoc()).scheduleLayout(
            this,
            fallbackElement
          );
        }
      }
    }

    /**
     * An implementation can call this method to signal to the element that
     * it has started rendering.
     * @package @final
     */
    renderStarted() {
      this.signals_.signal(CommonSignals_Enum.RENDER_START);
      this.togglePlaceholder(false);
      this.toggleLoading(false);
    }

    /**
     * Whether the loading can be shown for this element.
     * @param {boolean} force
     * @return {boolean}
     * @private
     */
    isLoadingEnabled_(force) {
      // No loading indicator will be shown if either one of these conditions
      // true:
      // 1. The document is A4A.
      // 2. `noloading` attribute is specified;
      // 3. The element has already been laid out, and does not support reshowing the indicator (include having loading
      //    error);
      // 4. The element is too small or has not yet been measured;
      // 5. The element has not been allowlisted;
      // 6. The element is an internal node (e.g. `placeholder` or `fallback`);
      // 7. The element's layout is not nodisplay.

      const laidOut =
        this.layoutCount_ > 0 ||
        this.signals_.get(CommonSignals_Enum.RENDER_START);
      if (
        this.layout_ == Layout_Enum.NODISPLAY ||
        this.hasAttribute('noloading') ||
        (laidOut && !force) ||
        !isLoadingAllowed(this) ||
        query.isInternalOrServiceNode(this)
      ) {
        return false;
      }

      return true;
    }

    /**
     * Turns the loading indicator on or off.
     * @param {boolean} state
     * @param {boolean=} force
     * @public @final
     */
    toggleLoading(state, force = false) {
      // TODO(dvoytenko, #9177): cleanup `this.ownerDocument.defaultView`
      // once investigation is complete. It appears that we get a lot of
      // errors here once the iframe is destroyed due to timer.
      if (!this.ownerDocument || !this.ownerDocument.defaultView) {
        return;
      }

      const loadingIndicator = Services.loadingIndicatorOrNull(
        this.getAmpDoc()
      );
      if (loadingIndicator) {
        state = state && this.isLoadingEnabled_(force);
        if (state) {
          loadingIndicator.track(this);
        } else {
          loadingIndicator.untrack(this);
        }
      }
    }

    /**
     * Returns an optional overflow element for this custom element.
     * @return {?Element}
     */
    getOverflowElement() {
      if (this.overflowElement_ === undefined) {
        this.overflowElement_ = query.childElementByAttr(this, 'overflow');
        if (this.overflowElement_) {
          if (!this.overflowElement_.hasAttribute('tabindex')) {
            this.overflowElement_.setAttribute('tabindex', '0');
          }
          if (!this.overflowElement_.hasAttribute('role')) {
            this.overflowElement_.setAttribute('role', 'button');
          }
        }
      }
      return this.overflowElement_;
    }

    /**
     * Hides or shows the overflow, if available. This function must only
     * be called inside a mutate context.
     * @param {boolean} overflown
     * @param {number|undefined} requestedHeight
     * @param {number|undefined} requestedWidth
     * @package @final
     */
    overflowCallback(overflown, requestedHeight, requestedWidth) {
      this.getOverflowElement();
      if (!this.overflowElement_) {
        if (overflown && this.warnOnMissingOverflow) {
          user().warn(
            TAG,
            'Cannot resize element and overflow is not available',
            this
          );
        }
      } else {
        this.overflowElement_.classList.toggle('amp-visible', overflown);

        if (overflown) {
          this.overflowElement_.onclick = () => {
            const mutator = Services.mutatorForDoc(this.getAmpDoc());
            mutator.forceChangeSize(this, requestedHeight, requestedWidth);
            mutator.mutateElement(this, () => {
              this.overflowCallback(
                /* overflown */ false,
                requestedHeight,
                requestedWidth
              );
            });
          };
        } else {
          this.overflowElement_.onclick = null;
        }
      }
    }

    /**
     * Mutates the element using resources if available.
     *
     * @param {function()} mutator
     * @param {?Element=} opt_element
     * @param {boolean=} opt_skipRemeasure
     */
    mutateOrInvoke_(mutator, opt_element, opt_skipRemeasure = false) {
      if (this.ampdoc_) {
        Services.mutatorForDoc(this.getAmpDoc()).mutateElement(
          opt_element || this,
          mutator,
          opt_skipRemeasure
        );
      } else {
        mutator();
      }
    }
  }
  win.__AMP_BASE_CE_CLASS = BaseCustomElement;
  return /** @type {typeof HTMLElement} */ (win.__AMP_BASE_CE_CLASS);
}

/**
 * @param {!Element} element
 * @return {boolean}
 */
function isInputPlaceholder(element) {
  return 'placeholder' in element;
}

/** @param {!Element} element */
function assertNotTemplate(element) {
  devAssert(!element.isInTemplate_, 'Must never be called in template');
}

/**
 * Creates a new custom element class prototype.
 *
 * @param {!Window} win The window in which to register the custom element.
 * @param {(typeof ./base-element.BaseElement)=} opt_implementationClass For testing only.
 * @param {function(!./service/ampdoc-impl.AmpDoc, !AmpElement, ?(typeof BaseElement))=} opt_elementConnectedCallback
 * @return {!Object} Prototype of element.
 * @visibleForTesting
 */
export function createAmpElementForTesting(
  win,
  opt_implementationClass,
  opt_elementConnectedCallback
) {
  const Element = createCustomElementClass(
    win,
    opt_elementConnectedCallback || (() => {})
  );
  if (getMode().test && opt_implementationClass) {
    Element.prototype.implementationClassForTesting = opt_implementationClass;
  }
  return Element;
}

/**
 * @visibleForTesting
 */
export function resetStubsForTesting() {
  stubbedElements.length = 0;
}

/**
 * @param {!AmpElement} element
 * @return {?(typeof BaseElement)}
 * @visibleForTesting
 */
export function getImplClassSyncForTesting(element) {
  return element.implClass_;
}

/**
 * @param {!AmpElement} element
 * @return {!BaseElement}
 * @visibleForTesting
 */
export function getImplSyncForTesting(element) {
  return element.impl_;
}

/**
 * @param {!AmpElement} element
 * @return {?Array<!./service/action-impl.ActionInvocation>|undefined}
 * @visibleForTesting
 */
export function getActionQueueForTesting(element) {
  return element.actionQueue_;
}

/**
 * Marks each element that still stubbed as unresolved.
 * @param {string=} opt_extension
 */
export function markUnresolvedElements(opt_extension) {
  unresolvableExtensions.add(opt_extension || '*');
  for (const el of stubbedElements) {
    if (opt_extension == null || el.tagName.toLowerCase() === opt_extension) {
      el.markUnresolved();
    }
  }
}

/** */
export function resetUnresolvedElementsForTesting() {
  unresolvableExtensions.clear();
}
