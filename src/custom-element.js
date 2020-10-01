/**
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
 */

import * as dom from './dom';
import {AmpEvents} from './amp-events';
import {CommonSignals} from './common-signals';
import {ElementStub} from './element-stub';
import {
  Layout,
  applyStaticLayout,
  isInternalElement,
  isLoadingAllowed,
} from './layout';
import {LayoutDelayMeter} from './layout-delay-meter';
import {ResourceState} from './service/resource';
import {Services} from './services';
import {Signals} from './utils/signals';
import {blockedByConsentError, isBlockedByConsent, reportError} from './error';
import {createLoaderElement} from '../src/loader.js';
import {dev, devAssert, rethrowAsync, user, userAssert} from './log';
import {getIntersectionChangeEntry} from './utils/intersection-observer-3p-host';
import {getMode} from './mode';
import {htmlFor} from './static-template';
import {parseSizeList} from './size-list';
import {setStyle} from './style';
import {shouldBlockOnConsentByMeta} from '../src/consent';
import {startupChunk} from './chunk';
import {toWin} from './types';
import {tryResolve} from '../src/utils/promise';

const TAG = 'CustomElement';

/**
 * @enum {number}
 */
const UpgradeState = {
  NOT_UPGRADED: 1,
  UPGRADED: 2,
  UPGRADE_FAILED: 3,
  UPGRADE_IN_PROGRESS: 4,
};

/**
 * Caches whether the template tag is supported to avoid memory allocations.
 * @type {boolean|undefined}
 */
let templateTagSupported;

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
 * @return {typeof AmpElement} The custom element class.
 */
export function createCustomElementClass(win) {
  const BaseCustomElement = /** @type {typeof HTMLElement} */ (createBaseCustomElementClass(
    win
  ));
  // It's necessary to create a subclass, because the same "base" class cannot
  // be registered to multiple custom elements.
  class CustomAmpElement extends BaseCustomElement {}
  return /** @type {typeof AmpElement} */ (CustomAmpElement);
}

/**
 * Creates a base custom element class.
 *
 * @param {!Window} win The window in which to register the custom element.
 * @return {typeof HTMLElement}
 */
function createBaseCustomElementClass(win) {
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

      /** @type {string} */
      this.readyState = 'loading';

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

      /** @private {!Layout} */
      this.layout_ = Layout.NODISPLAY;

      /** @private {number} */
      this.layoutWidth_ = -1;

      /** @private {number} */
      this.layoutHeight_ = -1;

      /** @private {number} */
      this.layoutCount_ = 0;

      /** @private {boolean} */
      this.isFirstLayoutCompleted_ = false;

      /** @private {boolean} */
      this.isInViewport_ = false;

      /** @private {boolean} */
      this.paused_ = false;

      /** @private {string|null|undefined} */
      this.mediaQuery_ = undefined;

      /** @private {!./size-list.SizeList|null|undefined} */
      this.sizeList_ = undefined;

      /** @private {!./size-list.SizeList|null|undefined} */
      this.heightsList_ = undefined;

      /** @public {boolean} */
      this.warnOnMissingOverflow = true;

      /**
       * This element can be assigned by the {@link applyStaticLayout} to a
       * child element that will be used to size this element.
       * @package {?Element|undefined}
       */
      this.sizerElement = undefined;

      /** @private {boolean|undefined} */
      this.loadingDisabled_ = undefined;

      /** @private {boolean|undefined} */
      this.loadingState_ = undefined;

      /** @private {?Element} */
      this.loadingContainer_ = null;

      /** @private {?Element} */
      this.loadingElement_ = null;

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
      let Ctor =
        win.__AMP_EXTENDED_ELEMENTS &&
        win.__AMP_EXTENDED_ELEMENTS[this.localName];
      if (getMode().test && nonStructThis['implementationClassForTesting']) {
        Ctor = nonStructThis['implementationClassForTesting'];
      }
      devAssert(Ctor);
      /** @private {!./base-element.BaseElement} */
      this.implementation_ = new Ctor(this);

      /**
       * An element always starts in a unupgraded state until it's added to DOM
       * for the first time in which case it can be upgraded immediately or wait
       * for script download or `upgradeCallback`.
       * @private {!UpgradeState}
       */
      this.upgradeState_ = UpgradeState.NOT_UPGRADED;

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

      const perf = Services.performanceForOrNull(win);
      /** @private {boolean} */
      this.perfOn_ = perf && perf.isPerformanceTrackingOn();

      /** @private {?./layout-delay-meter.LayoutDelayMeter} */
      this.layoutDelayMeter_ = null;

      if (nonStructThis[dom.UPGRADE_TO_CUSTOMELEMENT_RESOLVER]) {
        nonStructThis[dom.UPGRADE_TO_CUSTOMELEMENT_RESOLVER](nonStructThis);
        delete nonStructThis[dom.UPGRADE_TO_CUSTOMELEMENT_RESOLVER];
        delete nonStructThis[dom.UPGRADE_TO_CUSTOMELEMENT_PROMISE];
      }
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
      return /** @type {!./service/resources-interface.ResourcesInterface} */ (this
        .resources_);
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
      return this.upgradeState_ == UpgradeState.UPGRADED;
    }

    /** @return {!Promise} */
    whenUpgraded() {
      return this.signals_.whenSignal(CommonSignals.UPGRADED);
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
      if (this.upgradeState_ != UpgradeState.NOT_UPGRADED) {
        // Already upgraded or in progress or failed.
        return;
      }
      this.implementation_ = new newImplClass(this);
      if (this.everAttached) {
        // Usually, we do an implementation upgrade when the element is
        // attached to the DOM. But, if it hadn't yet upgraded from
        // ElementStub, we couldn't. Now that it's upgraded from a stub, go
        // ahead and do the full upgrade.
        this.tryUpgrade_();
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
      this.upgradeDelayMs_ = win.Date.now() - upgradeStartTime;
      this.upgradeState_ = UpgradeState.UPGRADED;
      this.implementation_ = newImpl;
      this.classList.remove('amp-unresolved');
      this.classList.remove('i-amphtml-unresolved');
      this.assertLayout_();
      // TODO(wg-runtime): Don't set BaseElement ivars externally.
      this.implementation_.layout_ = this.layout_;
      this.dispatchCustomEventForTesting(AmpEvents.ATTACHED);
      this.getResources().upgraded(this);
      this.signals_.signal(CommonSignals.UPGRADED);
    }

    /** @private */
    assertLayout_() {
      if (
        this.layout_ != Layout.NODISPLAY &&
        !this.implementation_.isLayoutSupported(this.layout_)
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
      return this.signals_.whenSignal(CommonSignals.BUILT);
    }

    /**
     * Get the priority to load the element.
     * @return {number}
     */
    getLayoutPriority() {
      devAssert(this.isUpgraded(), 'Cannot get priority of unupgraded element');
      return this.implementation_.getLayoutPriority();
    }

    /**
     * TODO(wg-runtime, #25824): Make Resource.getLayoutBox() the source of truth.
     * @return {number}
     * @deprecated
     */
    getLayoutWidth() {
      return this.layoutWidth_;
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
      return this.implementation_.getDefaultActionAlias();
    }

    /** @return {boolean} */
    isBuilding() {
      return !!this.buildingPromise_;
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
     */
    build() {
      assertNotTemplate(this);
      devAssert(this.isUpgraded(), 'Cannot build unupgraded element');
      if (this.buildingPromise_) {
        return this.buildingPromise_;
      }
      return (this.buildingPromise_ = new Promise((resolve, reject) => {
        const policyId = this.getConsentPolicy_();
        if (!policyId) {
          resolve(this.implementation_.buildCallback());
        } else {
          Services.consentPolicyServiceForDocOrNull(this)
            .then((policy) => {
              if (!policy) {
                return true;
              }
              return policy.whenPolicyUnblock(/** @type {string} */ (policyId));
            })
            .then((shouldUnblock) => {
              if (shouldUnblock) {
                resolve(this.implementation_.buildCallback());
              } else {
                reject(blockedByConsentError());
              }
            });
        }
      }).then(
        () => {
          this.preconnect(/* onLayout */ false);
          this.built_ = true;
          this.classList.remove('i-amphtml-notbuilt');
          this.classList.remove('amp-notbuilt');
          this.signals_.signal(CommonSignals.BUILT);
          if (this.isInViewport_) {
            this.updateInViewport_(true);
          }
          if (this.actionQueue_) {
            // Only schedule when the queue is not empty, which should be
            // the case 99% of the time.
            Services.timerFor(toWin(this.ownerDocument.defaultView)).delay(
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
            CommonSignals.BUILT,
            /** @type {!Error} */ (reason)
          );
          if (!isBlockedByConsent(reason)) {
            reportError(reason, this);
          }
          throw reason;
        }
      ));
    }

    /**
     * Called to instruct the element to preconnect to hosts it uses during
     * layout.
     * @param {boolean} onLayout Whether this was called after a layout.
     */
    preconnect(onLayout) {
      if (onLayout) {
        this.implementation_.preconnectCallback(onLayout);
      } else {
        // If we do early preconnects we delay them a bit. This is kind of
        // an unfortunate trade off, but it seems faster, because the DOM
        // operations themselves are not free and might delay
        startupChunk(this.getAmpDoc(), () => {
          const TAG = this.tagName;
          if (!this.ownerDocument) {
            dev().error(TAG, 'preconnect without ownerDocument');
            return;
          } else if (!this.ownerDocument.defaultView) {
            dev().error(TAG, 'preconnect without defaultView');
            return;
          }
          this.implementation_.preconnectCallback(onLayout);
        });
      }
    }

    /**
     * Whether the custom element declares that it has to be fixed.
     * @return {boolean}
     */
    isAlwaysFixed() {
      return this.implementation_.isAlwaysFixed();
    }

    /**
     * Updates the layout box of the element.
     * Should only be called by Resources.
     * @param {!./layout-rect.LayoutRectDef} layoutBox
     * @param {boolean} sizeChanged
     */
    updateLayoutBox(layoutBox, sizeChanged = false) {
      this.layoutWidth_ = layoutBox.width;
      this.layoutHeight_ = layoutBox.height;
      if (this.isBuilt()) {
        this.onMeasure(sizeChanged);
      }
    }

    /**
     * Calls onLayoutMeasure() (and onMeasureChanged() if size changed)
     * on the BaseElement implementation.
     * Should only be called by Resources.
     * @param {boolean} sizeChanged
     */
    onMeasure(sizeChanged = false) {
      devAssert(this.isBuilt());
      try {
        this.implementation_.onLayoutMeasure();
        if (sizeChanged) {
          this.implementation_.onMeasureChanged();
        }
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
        (this.layout_ === Layout.RESPONSIVE ||
          this.layout_ === Layout.INTRINSIC)
      ) {
        // Expect sizer to exist, just not yet discovered.
        this.sizerElement = this.querySelector('i-amphtml-sizer');
      }
      return this.sizerElement || null;
    }

    /**
     * @param {Element} sizer
     * @private
     */
    resetSizer_(sizer) {
      if (this.layout_ === Layout.RESPONSIVE) {
        setStyle(sizer, 'paddingTop', '0');
        return;
      }
      if (this.layout_ === Layout.INTRINSIC) {
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

    /**
     * If the element has a media attribute, evaluates the value as a media
     * query and based on the result adds or removes the class
     * `i-amphtml-hidden-by-media-query`. The class adds display:none to the
     * element which in turn prevents any of the resource loading to happen for
     * the element.
     *
     * This method is called by Resources and shouldn't be called by anyone
     * else.
     *
     * @final
     * @package
     */
    applySizesAndMediaQuery() {
      assertNotTemplate(this);

      // Media query.
      if (this.mediaQuery_ === undefined) {
        this.mediaQuery_ = this.getAttribute('media') || null;
      }
      if (this.mediaQuery_) {
        const {defaultView} = this.ownerDocument;
        this.classList.toggle(
          'i-amphtml-hidden-by-media-query',
          !defaultView.matchMedia(this.mediaQuery_).matches
        );
      }

      // Sizes.
      if (this.sizeList_ === undefined) {
        const sizesAttr = this.getAttribute('sizes');
        const isDisabled = this.hasAttribute('disable-inline-width');
        this.sizeList_ =
          !isDisabled && sizesAttr ? parseSizeList(sizesAttr) : null;
      }
      if (this.sizeList_) {
        setStyle(
          this,
          'width',
          this.sizeList_.select(toWin(this.ownerDocument.defaultView))
        );
      }
      // Heights.
      if (
        this.heightsList_ === undefined &&
        this.layout_ === Layout.RESPONSIVE
      ) {
        const heightsAttr = this.getAttribute('heights');
        this.heightsList_ = heightsAttr
          ? parseSizeList(heightsAttr, /* allowPercent */ true)
          : null;
      }
      if (this.heightsList_) {
        const sizer = this.getSizer_();
        if (sizer) {
          setStyle(
            sizer,
            'paddingTop',
            this.heightsList_.select(toWin(this.ownerDocument.defaultView))
          );
        }
      }
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
      this.dispatchCustomEvent(AmpEvents.SIZE_CHANGED);
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
        this.isInTemplate_ = !!dom.closestAncestorElementBySelector(
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
        this.classList.add('i-amphtml-element');
        this.classList.add('i-amphtml-notbuilt');
        this.classList.add('amp-notbuilt');
      }

      if (!this.ampdoc_) {
        // Ampdoc can now be initialized.
        const win = toWin(this.ownerDocument.defaultView);
        const ampdocService = Services.ampdocServiceFor(win);
        const ampdoc = ampdocService.getAmpDoc(this);
        this.ampdoc_ = ampdoc;
        // Load the pre-stubbed extension if needed.
        const extensionId = this.tagName.toLowerCase();
        if (
          isStub(this.implementation_) &&
          !ampdoc.declaresExtension(extensionId)
        ) {
          Services.extensionsFor(win).installExtensionForDoc(
            ampdoc,
            extensionId
          );
        }
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
          if (reconstruct) {
            this.getResources().upgraded(this);
          }
          this.dispatchCustomEventForTesting(AmpEvents.ATTACHED);
        }
      } else {
        this.everAttached = true;

        try {
          this.layout_ = applyStaticLayout(
            this,
            Services.platformFor(toWin(this.ownerDocument.defaultView)).isIe()
          );
        } catch (e) {
          reportError(e, this);
        }
        if (!isStub(this.implementation_)) {
          this.tryUpgrade_();
        }
        if (!this.isUpgraded()) {
          this.classList.add('amp-unresolved');
          this.classList.add('i-amphtml-unresolved');
          // amp:attached is dispatched from the ElementStub class when it
          // replayed the firstAttachedCallback call.
          this.dispatchCustomEventForTesting(AmpEvents.STUBBED);
        }
        // Classically, sizes/media queries are applied just before
        // Resource.measure. With IntersectionObserver, observe() is the
        // equivalent which happens above in Resources.add(). Applying here
        // also avoids unnecessary reinvocation during reparenting.
        if (this.getResources().isIntersectionExperimentOn()) {
          this.applySizesAndMediaQuery();
        }
      }
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

    /** The Custom Elements V0 sibling to `connectedCallback`. */
    attachedCallback() {
      this.connectedCallback();
    }

    /**
     * Try to upgrade the element with the provided implementation.
     * @private @final
     */
    tryUpgrade_() {
      const impl = this.implementation_;
      devAssert(!isStub(impl), 'Implementation must not be a stub');
      if (this.upgradeState_ != UpgradeState.NOT_UPGRADED) {
        // Already upgraded or in progress or failed.
        return;
      }

      // The `upgradeCallback` only allows redirect once for the top-level
      // non-stub class. We may allow nested upgrades later, but they will
      // certainly be bad for performance.
      this.upgradeState_ = UpgradeState.UPGRADE_IN_PROGRESS;
      const startTime = win.Date.now();
      const res = impl.upgradeCallback();
      if (!res) {
        // Nothing returned: the current object is the upgraded version.
        this.completeUpgrade_(impl, startTime);
      } else if (typeof res.then == 'function') {
        // It's a promise: wait until it's done.
        res
          .then((upgrade) => {
            this.completeUpgrade_(upgrade || impl, startTime);
          })
          .catch((reason) => {
            this.upgradeState_ = UpgradeState.UPGRADE_FAILED;
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

    /** The Custom Elements V0 sibling to `disconnectedCallback`. */
    detachedCallback() {
      this.disconnectedCallback();
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
      this.implementation_.detachedCallback();
    }

    /**
     * Dispatches a custom event.
     *
     * @param {string} name
     * @param {!Object=} opt_data Event data.
     * @final
     */
    dispatchCustomEvent(name, opt_data) {
      const data = opt_data || {};
      // Constructors of events need to come from the correct window. Sigh.
      const event = this.ownerDocument.createEvent('Event');
      event.data = data;
      event.initEvent(name, /* bubbles */ true, /* cancelable */ true);
      this.dispatchEvent(event);
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
      this.dispatchCustomEvent(name, opt_data);
    }

    /**
     * Whether the element can pre-render.
     * @return {boolean}
     * @final
     */
    prerenderAllowed() {
      return this.implementation_.prerenderAllowed();
    }

    /**
     * Whether the element has render-blocking service.
     * @return {boolean}
     * @final
     */
    isBuildRenderBlocking() {
      return this.implementation_.isBuildRenderBlocking();
    }

    /**
     * Creates a placeholder for the element.
     * @return {?Element}
     * @final
     */
    createPlaceholder() {
      return this.implementation_.createPlaceholderCallback();
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
      return this.implementation_.createLoaderLogoCallback();
    }

    /**
     * Whether the element should ever render when it is not in viewport.
     * @return {boolean|number}
     * @final
     */
    renderOutsideViewport() {
      return this.implementation_.renderOutsideViewport();
    }

    /**
     * Whether the element should render outside of renderOutsideViewport when
     * the scheduler is idle.
     * @return {boolean|number}
     * @final
     */
    idleRenderOutsideViewport() {
      return this.implementation_.idleRenderOutsideViewport();
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
     * Returns a previously measured layout box relative to the page. The
     * fixed-position elements are relative to the top of the document.
     * @return {!./layout-rect.LayoutRectDef}
     * @final
     */
    getPageLayoutBox() {
      return this.getResource_().getPageLayoutBox();
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
     * @return {!IntersectionObserverEntry} A change entry.
     * @final
     */
    getIntersectionChangeEntry() {
      const box = this.implementation_.getIntersectionElementLayoutBox();
      const owner = this.getOwner();
      const viewportBox = this.implementation_.getViewport().getRect();
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
     */
    isRelayoutNeeded() {
      return this.implementation_.isRelayoutNeeded();
    }

    /**
     * Returns reference to upgraded implementation.
     * @param {boolean} waitForBuild If true, waits for element to be built before
     *   resolving the returned Promise. Default is true.
     * @return {!Promise<!./base-element.BaseElement>}
     */
    getImpl(waitForBuild = true) {
      const waitFor = waitForBuild ? this.whenBuilt() : this.whenUpgraded();
      return waitFor.then(() => this.implementation_);
    }

    /**
     * Returns the layout of the element.
     * @return {!Layout}
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
     * @return {!Promise}
     * @package @final
     */
    layoutCallback() {
      assertNotTemplate(this);
      devAssert(this.isBuilt(), 'Must be built to receive viewport events');
      this.dispatchCustomEventForTesting(AmpEvents.LOAD_START);
      const isLoadEvent = this.layoutCount_ == 0; // First layout is "load".
      this.signals_.reset(CommonSignals.UNLOAD);
      if (isLoadEvent) {
        this.signals_.signal(CommonSignals.LOAD_START);
      }
      if (this.perfOn_) {
        this.getLayoutDelayMeter_().startLayout();
      }

      const promise = tryResolve(() => this.implementation_.layoutCallback());
      this.preconnect(/* onLayout */ true);
      this.classList.add('i-amphtml-layout');

      return promise.then(
        () => {
          if (isLoadEvent) {
            this.signals_.signal(CommonSignals.LOAD_END);
          }
          this.readyState = 'complete';
          this.layoutCount_++;
          this.toggleLoading(false, {cleanup: true});
          // Check if this is the first success layout that needs
          // to call firstLayoutCompleted.
          if (!this.isFirstLayoutCompleted_) {
            this.implementation_.firstLayoutCompleted();
            this.isFirstLayoutCompleted_ = true;
            this.dispatchCustomEventForTesting(AmpEvents.LOAD_END);
          }
        },
        (reason) => {
          // add layoutCount_ by 1 despite load fails or not
          if (isLoadEvent) {
            this.signals_.rejectSignal(
              CommonSignals.LOAD_END,
              /** @type {!Error} */ (reason)
            );
          }
          this.layoutCount_++;
          this.toggleLoading(false, {cleanup: true});
          throw reason;
        }
      );
    }

    /**
     * Whether the resource is currently visible in the viewport.
     * @return {boolean}
     * @final @package
     */
    isInViewport() {
      return this.isInViewport_;
    }

    /**
     * Instructs the resource that it entered or exited the visible viewport.
     *
     * Can only be called on a upgraded and built element.
     *
     * @param {boolean} inViewport Whether the element has entered or exited
     *   the visible viewport.
     * @final @package
     */
    viewportCallback(inViewport) {
      assertNotTemplate(this);
      if (inViewport == this.isInViewport_) {
        return;
      }
      // TODO(dvoytenko, #9177): investigate/cleanup viewport signals for
      // elements in dead iframes.
      if (!this.ownerDocument || !this.ownerDocument.defaultView) {
        return;
      }
      this.isInViewport_ = inViewport;
      if (this.layoutCount_ == 0) {
        if (!inViewport) {
          this.toggleLoading(false);
        } else {
          // Set a minimum delay in case the element loads very fast or if it
          // leaves the viewport.
          const loadingStartTime = win.Date.now();
          Services.timerFor(toWin(this.ownerDocument.defaultView)).delay(() => {
            // TODO(dvoytenko, #9177): cleanup `this.ownerDocument.defaultView`
            // once investigation is complete. It appears that we get a lot of
            // errors here once the iframe is destroyed due to timer.
            if (
              this.isInViewport_ &&
              this.ownerDocument &&
              this.ownerDocument.defaultView &&
              this.layoutCount_ === 0 // Ensures that layoutCallback hasn't completed in this 100ms window.
            ) {
              this.toggleLoading(true, {startTime: loadingStartTime});
            }
          }, 100);
        }
      }
      if (this.isBuilt()) {
        this.updateInViewport_(inViewport);
      }
    }

    /**
     * @param {boolean} inViewport
     * @private
     */
    updateInViewport_(inViewport) {
      this.implementation_.inViewport_ = inViewport;
      this.implementation_.viewportCallback(inViewport);
      if (inViewport && this.perfOn_) {
        this.getLayoutDelayMeter_().enterViewport();
      }
    }

    /**
     * Whether the resource is currently paused.
     * @return {boolean}
     * @final @package
     */
    isPaused() {
      return this.paused_;
    }

    /**
     * Requests the resource to stop its activity when the document goes into
     * inactive state. The scope is up to the actual component. Among other
     * things the active playback of video or audio content must be stopped.
     *
     * @package @final
     */
    pauseCallback() {
      assertNotTemplate(this);
      if (this.paused_) {
        return;
      }
      this.paused_ = true;
      this.viewportCallback(false);
      if (this.isBuilt()) {
        this.implementation_.pauseCallback();
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
    resumeCallback() {
      assertNotTemplate(this);
      if (!this.paused_) {
        return;
      }
      this.paused_ = false;
      if (this.isBuilt()) {
        this.implementation_.resumeCallback();
      }
    }

    /**
     * Requests the element to unload any expensive resources when the element
     * goes into non-visible state. The scope is up to the actual component.
     *
     * Calling this method on unbuilt or unupgraded element has no effect.
     *
     * @return {boolean}
     * @package @final
     */
    unlayoutCallback() {
      assertNotTemplate(this);
      if (!this.isBuilt()) {
        return false;
      }
      this.signals_.signal(CommonSignals.UNLOAD);
      const isReLayoutNeeded = this.implementation_.unlayoutCallback();
      if (isReLayoutNeeded) {
        this.reset_();
      }
      this.dispatchCustomEventForTesting(AmpEvents.UNLOAD);
      return isReLayoutNeeded;
    }

    /** @private */
    reset_() {
      this.layoutCount_ = 0;
      this.isFirstLayoutCompleted_ = false;
      this.signals_.reset(CommonSignals.RENDER_START);
      this.signals_.reset(CommonSignals.LOAD_START);
      this.signals_.reset(CommonSignals.LOAD_END);
      this.signals_.reset(CommonSignals.INI_LOAD);
    }

    /**
     * Whether to call {@link unlayoutCallback} when pausing the element.
     * Certain elements cannot properly pause (like amp-iframes with unknown
     * video content), and so we must unlayout to stop playback.
     *
     * @return {boolean}
     * @package @final
     */
    unlayoutOnPause() {
      return this.implementation_.unlayoutOnPause();
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
      return this.implementation_.reconstructWhenReparented();
    }

    /**
     * Collapses the element, and notifies its owner (if there is one) that the
     * element is no longer present.
     */
    collapse() {
      this.implementation_./*OK*/ collapse();
    }

    /**
     * Called every time an owned AmpElement collapses itself.
     * @param {!AmpElement} element
     */
    collapsedCallback(element) {
      this.implementation_.collapsedCallback(element);
    }

    /**
     * Expands the element, and notifies its owner (if there is one) that the
     * element is now present.
     */
    expand() {
      this.implementation_./*OK*/ expand();
    }

    /**
     * Called every time an owned AmpElement expands itself.
     * @param {!AmpElement} element
     */
    expandedCallback(element) {
      this.implementation_.expandedCallback(element);
    }

    /**
     * Called when one or more attributes are mutated.
     * Note: Must be called inside a mutate context.
     * Note: Boolean attributes have a value of `true` and `false` when
     *     present and missing, respectively.
     * @param {!JsonObject<string, (null|boolean|string|number|Array|Object)>} mutations
     */
    mutatedAttributesCallback(mutations) {
      this.implementation_.mutatedAttributesCallback(mutations);
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
        this.implementation_.executeAction(invocation, deferred);
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
        return this.implementation_.getConsentPolicy();
      }
      return policyId;
    }

    /**
     * Returns the original nodes of the custom element without any service
     * nodes that could have been added for markup. These nodes can include
     * Text, Comment and other child nodes.
     * @return {!Array<!Node>}
     * @package @final
     */
    getRealChildNodes() {
      return dom.childNodes(this, (node) => !isInternalOrServiceNode(node));
    }

    /**
     * Returns the original children of the custom element without any service
     * nodes that could have been added for markup.
     * @return {!Array<!Element>}
     * @package @final
     */
    getRealChildren() {
      return dom.childElements(
        this,
        (element) => !isInternalOrServiceNode(element)
      );
    }

    /**
     * Returns an optional placeholder element for this custom element.
     * @return {?Element}
     * @package @final
     */
    getPlaceholder() {
      return dom.lastChildElement(this, (el) => {
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
        const placeholders = dom.childElementsByAttr(this, 'placeholder');
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
      return dom.childElementByAttr(this, 'fallback');
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
        show &&
        (resourceState == ResourceState.NOT_BUILT ||
          resourceState == ResourceState.NOT_LAID_OUT ||
          resourceState == ResourceState.READY_FOR_LAYOUT)
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
      this.signals_.signal(CommonSignals.RENDER_START);
      this.togglePlaceholder(false);
      this.toggleLoading(false);
    }

    /**
     * Whether the loading can be shown for this element.
     * @return {boolean}
     * @private
     */
    isLoadingEnabled_() {
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
      if (this.isInA4A()) {
        return false;
      }
      if (this.loadingDisabled_ === undefined) {
        this.loadingDisabled_ = this.hasAttribute('noloading');
      }

      const laidOut =
        this.layoutCount_ > 0 || this.signals_.get(CommonSignals.RENDER_START);
      if (
        this.loadingDisabled_ ||
        (laidOut && !this.implementation_.isLoadingReused()) ||
        this.layoutWidth_ <= 0 || // Layout is not ready or invisible
        !isLoadingAllowed(this) ||
        isInternalOrServiceNode(this) ||
        this.layout_ == Layout.NODISPLAY
      ) {
        return false;
      }

      return true;
    }

    /**
     * @return {boolean}
     */
    isInA4A() {
      return (
        // in FIE
        (this.ampdoc_ && this.ampdoc_.win != this.ownerDocument.defaultView) ||
        // TODO(#22733): cleanup once the ampdoc-fie is fully launched.
        (this.ampdoc_ && !!this.ampdoc_.getParent()) ||
        // in inabox
        getMode().runtime == 'inabox'
      );
    }

    /**
     * Creates a loading object. The caller must ensure that loading can
     * actually be shown. This method must also be called in the mutate
     * context.
     * @private
     * @param {number=} startTime
     */
    prepareLoading_(startTime) {
      if (!this.isLoadingEnabled_()) {
        return;
      }
      if (!this.loadingContainer_) {
        const doc = this.ownerDocument;
        devAssert(doc);

        const container = htmlFor(/** @type {!Document} */ (doc))`
            <div class="i-amphtml-loading-container i-amphtml-fill-content
              amp-hidden"></div>`;
        const loadingElement = createLoaderElement(
          this.getAmpDoc(),
          this,
          this.layoutWidth_,
          this.layoutHeight_,
          startTime
        );

        container.appendChild(loadingElement);

        this.appendChild(container);
        this.loadingContainer_ = container;
        this.loadingElement_ = loadingElement;
      }
    }

    /**
     * Turns the loading indicator on or off.
     * @param {boolean} state
     * @param {{cleanup:(boolean|undefined), startTime:(number|undefined)}=} opt_options
     * @public @final
     */
    toggleLoading(state, opt_options) {
      const cleanup = opt_options && opt_options.cleanup;
      const startTime = opt_options && opt_options.startTime;
      assertNotTemplate(this);

      if (state === this.loadingState_ && !opt_options) {
        // Loading state is the same.
        return;
      }
      this.loadingState_ = state;
      if (!state && !this.loadingContainer_) {
        return;
      }

      // Check if loading should be shown.
      if (state && !this.isLoadingEnabled_()) {
        this.loadingState_ = false;
        return;
      }

      this.mutateOrInvoke_(
        () => {
          let state = this.loadingState_;
          // Repeat "loading enabled" check because it could have changed while
          // waiting for vsync.
          if (state && !this.isLoadingEnabled_()) {
            state = false;
          }
          if (state) {
            this.prepareLoading_(startTime);
          }
          if (!this.loadingContainer_) {
            return;
          }

          this.loadingContainer_.classList.toggle('amp-hidden', !state);
          this.loadingElement_.classList.toggle('amp-active', state);

          if (!state && cleanup && !this.implementation_.isLoadingReused()) {
            const loadingContainer = this.loadingContainer_;
            this.loadingContainer_ = null;
            this.loadingElement_ = null;
            this.mutateOrInvoke_(
              () => {
                dom.removeElement(loadingContainer);
              },
              undefined,
              true
            );
          }
        },
        undefined,
        /* skipRemeasure */ true
      );
    }

    /**
     * Returns an optional overflow element for this custom element.
     * @return {!./layout-delay-meter.LayoutDelayMeter}
     */
    getLayoutDelayMeter_() {
      if (!this.layoutDelayMeter_) {
        this.layoutDelayMeter_ = new LayoutDelayMeter(
          toWin(this.ownerDocument.defaultView),
          this.getLayoutPriority()
        );
      }
      return this.layoutDelayMeter_;
    }

    /**
     * Returns an optional overflow element for this custom element.
     * @return {?Element}
     */
    getOverflowElement() {
      if (this.overflowElement_ === undefined) {
        this.overflowElement_ = dom.childElementByAttr(this, 'overflow');
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
 * Whether the implementation is a stub.
 * @param {?./base-element.BaseElement} impl
 * @return {boolean}
 */
function isStub(impl) {
  return impl instanceof ElementStub;
}

/**
 * Returns "true" for internal AMP nodes or for placeholder elements.
 * @param {!Node} node
 * @return {boolean}
 */
function isInternalOrServiceNode(node) {
  if (isInternalElement(node)) {
    return true;
  }
  if (
    node.tagName &&
    (node.hasAttribute('placeholder') ||
      node.hasAttribute('fallback') ||
      node.hasAttribute('overflow'))
  ) {
    return true;
  }
  return false;
}

/**
 * Creates a new custom element class prototype.
 *
 * @param {!Window} win The window in which to register the custom element.
 * @param {(typeof ./base-element.BaseElement)=} opt_implementationClass For testing only.
 * @return {!Object} Prototype of element.
 */
export function createAmpElementForTesting(win, opt_implementationClass) {
  const Element = createCustomElementClass(win);
  if (getMode().test && opt_implementationClass) {
    Element.prototype.implementationClassForTesting = opt_implementationClass;
  }
  return Element;
}
