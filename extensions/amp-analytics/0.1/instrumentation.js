import {Services} from '#service';

import {AnalyticsGroup} from './analytics-group';
import {AmpdocAnalyticsRoot, EmbedAnalyticsRoot} from './analytics-root';
import {
  AmpStoryEventTracker,
  AnalyticsEvent,
  AnalyticsEventType,
  CustomEventTracker,
  getTrackerKeyName,
} from './events';

import {getFriendlyIframeEmbedOptional} from '../../../src/iframe-helper';
import {
  getParentWindowFrameElement,
  getServiceForDoc,
  getServicePromiseForDoc,
  registerServiceBuilderForDoc,
} from '../../../src/service-helpers';

const PROP = '__AMP_AN_ROOT';

/**
 * @implements {../../../src/service.Disposable}
 * @package
 * @visibleForTesting
 */
export class InstrumentationService {
  /**
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   */
  constructor(ampdoc) {
    /** @const */
    this.ampdoc = ampdoc;

    /** @const */
    this.root_ = this.findRoot_(ampdoc.getRootNode());
  }

  /** @override */
  dispose() {
    this.root_.dispose();
  }

  /**
   * @param {!Node} context
   * @return {!./analytics-root.AnalyticsRoot}
   */
  getAnalyticsRoot(context) {
    return this.findRoot_(context);
  }

  /**
   * @param {!Element} analyticsElement
   * @return {!AnalyticsGroup}
   */
  createAnalyticsGroup(analyticsElement) {
    const root = this.findRoot_(analyticsElement);
    return new AnalyticsGroup(root, analyticsElement);
  }

  /**
   * @param {string} trackerName
   * @private
   */
  getTrackerClass_(trackerName) {
    switch (trackerName) {
      case AnalyticsEventType.STORY:
        return AmpStoryEventTracker;
      default:
        return CustomEventTracker;
    }
  }

  /**
   * Triggers the analytics event with the specified type.
   *
   * @param {!Element} target
   * @param {string} eventType
   * @param {!JsonObject} vars A map of vars and their values.
   * @param {boolean} enableDataVars A boolean to indicate if data-vars-*
   * attribute value from target element should be included.
   */
  triggerEventForTarget(target, eventType, vars = {}, enableDataVars = true) {
    const event = new AnalyticsEvent(target, eventType, vars, enableDataVars);
    const root = this.findRoot_(target);
    const trackerName = getTrackerKeyName(eventType);
    const tracker = /** @type {!CustomEventTracker|!AmpStoryEventTracker} */ (
      root.getTracker(trackerName, this.getTrackerClass_(trackerName))
    );
    tracker.trigger(event);
  }

  /**
   * @param {!Node} context
   * @return {!./analytics-root.AnalyticsRoot}
   */
  findRoot_(context) {
    // TODO(#22733): cleanup when ampdoc-fie is launched. Just use
    // `ampdoc.getParent()`.
    const ampdoc = Services.ampdoc(context);
    const frame = getParentWindowFrameElement(context);
    const embed = frame && getFriendlyIframeEmbedOptional(frame);
    if (ampdoc == this.ampdoc && !embed && this.root_) {
      // Main root already exists.
      return this.root_;
    }
    return this.getOrCreateRoot_(embed || ampdoc, () => {
      if (embed) {
        return new EmbedAnalyticsRoot(ampdoc, embed);
      }
      return new AmpdocAnalyticsRoot(ampdoc);
    });
  }

  /**
   * @param {!Object} holder
   * @param {function():!./analytics-root.AnalyticsRoot} factory
   * @return {!./analytics-root.AnalyticsRoot}
   */
  getOrCreateRoot_(holder, factory) {
    let root = /** @type {?./analytics-root.AnalyticsRoot} */ (holder[PROP]);
    if (!root) {
      root = factory();
      holder[PROP] = root;
    }
    return root;
  }
}

/**
 * It's important to resolve instrumentation asynchronously in elements that
 * depends on it in multi-doc scope. Otherwise an element life-cycle could
 * resolve way before we have the service available.
 *
 * @param {!Element|!../../../src/service/ampdoc-impl.AmpDoc} elementOrAmpDoc
 * @return {!Promise<InstrumentationService>}
 */
export function instrumentationServicePromiseForDoc(elementOrAmpDoc) {
  return /** @type {!Promise<InstrumentationService>} */ (
    getServicePromiseForDoc(elementOrAmpDoc, 'amp-analytics-instrumentation')
  );
}

/**
 * @param {!Element|!../../../src/service/ampdoc-impl.AmpDoc} elementOrAmpDoc
 * @return {!InstrumentationService}
 */
export function instrumentationServiceForDocForTesting(elementOrAmpDoc) {
  registerServiceBuilderForDoc(
    elementOrAmpDoc,
    'amp-analytics-instrumentation',
    InstrumentationService
  );
  return getServiceForDoc(elementOrAmpDoc, 'amp-analytics-instrumentation');
}
