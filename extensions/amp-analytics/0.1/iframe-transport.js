import {createElementWithAttributes} from '#core/dom';
import {toggle} from '#core/dom/style';
import * as mode from '#core/mode';
import {hasOwn} from '#core/types/object';

import {devAssert, user} from '#utils/log';

import {IframeTransportMessageQueue} from './iframe-transport-message-queue';

import * as urls from '../../../src/config/urls';
import {getMode} from '../../../src/mode';

/**
 * @type {string}
 * @private @const
 */
const TAG_ = 'amp-analytics/iframe-transport';

/** @private @const {number} */
const LONG_TASK_REPORTING_THRESHOLD = 5;

/** @typedef {{
 *    frame: Element,
 *    sentinel: string,
 *    usageCount: number,
 *    queue: IframeTransportMessageQueue,
 *  }} */
export let FrameData;

/**
 * @param {!Window} ampWin
 * @param {boolean=} opt_forceProdUrl
 * @return {string}
 * @visibleForTesting
 */
export function getIframeTransportScriptUrlForTesting(
  ampWin,
  opt_forceProdUrl
) {
  return getIframeTransportScriptUrl(ampWin, opt_forceProdUrl);
}

/**
 * Get the URL of the client lib
 * @param {!Window} ampWin The window object of the AMP document
 * @param {boolean=} opt_forceProdUrl If true, prod URL will be returned even
 *     in local/test modes.
 * @return {string}
 */
function getIframeTransportScriptUrl(ampWin, opt_forceProdUrl) {
  if (
    (getMode().localDev || getMode().test) &&
    !opt_forceProdUrl &&
    ampWin.parent &&
    ampWin.parent.location
  ) {
    const loc = ampWin.parent.location;
    return `${loc.protocol}//${loc.host}/dist/iframe-transport-client-lib.js`;
  }
  return urls.thirdParty + `/${mode.version()}/iframe-transport-client-v0.js`;
}

/**
 * @visibleForTesting
 */
export class IframeTransport {
  /**
   * @param {!Window} ampWin The window object of the AMP document
   * @param {string} type The value of the amp-analytics tag's type attribute
   * @param {!JsonObject} config
   * @param {string} id If (potentially) using sendResponseToCreative(), it
   *     should be something that the recipient can use to identify the
   *     context of the message, e.g. the resourceID of a DOM element.
   */
  constructor(ampWin, type, config, id) {
    /** @private @const {!Window} */
    this.ampWin_ = ampWin;

    /** @private @const {string} */
    this.type_ = type;

    /** @private @const {string} */
    this.creativeId_ = id;

    devAssert(
      config && config['iframe'],
      'Must supply iframe URL to constructor!'
    );
    this.frameUrl_ = config['iframe'];

    /** @private {number} */
    this.numLongTasks_ = 0;

    this.processCrossDomainIframe();
  }

  /**
   * Called when a Transport instance is being removed from the DOM
   */
  detach() {
    IframeTransport.markCrossDomainIframeAsDone(
      this.ampWin_.document,
      this.type_
    );
  }

  /**
   * If iframe is specified in config/transport, check whether third-party
   * iframe already exists, and if not, create it.
   */
  processCrossDomainIframe() {
    let frameData;
    if (IframeTransport.hasCrossDomainIframe(this.type_)) {
      frameData = IframeTransport.getFrameData(this.type_);
      ++frameData.usageCount;
    } else {
      frameData = this.createCrossDomainIframe();
      this.ampWin_.document.body.appendChild(frameData.frame);
      this.createPerformanceObserver_();
    }
    devAssert(frameData, 'Trying to use non-existent frame');
  }

  /**
   * Create a cross-domain iframe for third-party vendor analytics
   * @return {!FrameData}
   * @visibleForTesting
   */
  createCrossDomainIframe() {
    // Explanation of IDs:
    // Each instance of IframeTransport (owned by a specific amp-analytics
    // tag, in turn owned by a specific creative) has an ID
    // (this.getCreativeId()).
    // Each cross-domain iframe also has an ID, stored here in sentinel.
    // These two types of IDs have different formats.
    // There is a many-to-one relationship, in that several creatives may
    // utilize the same analytics vendor, so perhaps two creatives might
    // both use the same vendor iframe.
    // Of course, a given creative may use multiple analytics vendors, but
    // in that case it would use multiple amp-analytics tags, so the
    // iframeTransport.getCreativeId() -> sentinel relationship is *not*
    // many-to-many.
    const sentinel = IframeTransport.createUniqueId_();
    const frameName = JSON.stringify(
      /** @type {JsonObject} */ ({
        scriptSrc: getIframeTransportScriptUrl(this.ampWin_),
        sentinel,
        type: this.type_,
      })
    );
    const frame = createElementWithAttributes(
      this.ampWin_.document,
      'iframe',
      /** @type {!JsonObject} */ ({
        sandbox: 'allow-scripts allow-same-origin',
        name: frameName,
        'data-amp-3p-sentinel': sentinel,
      })
    );
    frame.sentinel = sentinel;
    toggle(frame, false);
    frame.src = this.frameUrl_;
    const frameData = /** @type {FrameData} */ ({
      frame,
      usageCount: 1,
      queue: new IframeTransportMessageQueue(
        this.ampWin_,
        /** @type {!HTMLIFrameElement} */
        (frame)
      ),
    });
    IframeTransport.crossDomainIframes_[this.type_] = frameData;
    return frameData;
  }

  /**
   * Uses the Long Task API to create an observer for when 3p vendor frames
   * take more than 50ms of continuous CPU time.
   * Currently the only action in response to that is to log. It will log
   * once per LONG_TASK_REPORTING_THRESHOLD that a long task occurs. (This
   * implies that there is a grace period for the first
   * LONG_TASK_REPORTING_THRESHOLD-1 occurrences.)
   * @private
   */
  createPerformanceObserver_() {
    if (!isLongTaskApiSupported(this.ampWin_)) {
      return;
    }
    IframeTransport.performanceObservers_[this.type_] =
      new this.ampWin_.PerformanceObserver((entryList) => {
        if (!entryList) {
          return;
        }
        entryList.getEntries().forEach((entry) => {
          if (
            entry &&
            entry['entryType'] == 'longtask' &&
            entry['name'] == 'cross-origin-descendant' &&
            entry.attribution
          ) {
            /** @type {!Array} */ (entry.attribution).forEach((attrib) => {
              if (
                this.frameUrl_ == attrib['containerSrc'] &&
                ++this.numLongTasks_ % LONG_TASK_REPORTING_THRESHOLD == 0
              ) {
                user().error(TAG_, `Long Task: Vendor: "${this.type_}"`);
              }
            });
          }
        });
      });
    IframeTransport.performanceObservers_[this.type_].observe({
      entryTypes: ['longtask'],
    });
  }

  /**
   * Called when a creative no longer needs its cross-domain iframe (for
   * instance, because the creative has been removed from the DOM).
   * Once all creatives using a frame are done with it, the frame can be
   * destroyed.
   * @param {!HTMLDocument} ampDoc The AMP document
   * @param {string} type The type attribute of the amp-analytics tag
   */
  static markCrossDomainIframeAsDone(ampDoc, type) {
    const frameData = IframeTransport.getFrameData(type);
    devAssert(
      frameData && frameData.frame && frameData.usageCount,
      'Marked the ' +
        type +
        ' frame as done, but there is no' +
        ' record of it existing.'
    );
    if (--frameData.usageCount) {
      // Some other instance is still using it
      return;
    }
    ampDoc.body.removeChild(frameData.frame);
    delete IframeTransport.crossDomainIframes_[type];
    if (IframeTransport.performanceObservers_[type]) {
      IframeTransport.performanceObservers_[type].disconnect();
      IframeTransport.performanceObservers_[type] = null;
    }
  }

  /**
   * Returns whether this type of cross-domain frame is already known
   * @param {string} type The type attribute of the amp-analytics tag
   * @return {boolean}
   * @visibleForTesting
   */
  static hasCrossDomainIframe(type) {
    return hasOwn(IframeTransport.crossDomainIframes_, type);
  }

  /**
   * Create a unique value to differentiate messages from a particular
   * creative to the cross-domain iframe, or to identify the iframe itself.
   * @return {string}
   * @private
   */
  static createUniqueId_() {
    return String(++IframeTransport.nextId_);
  }

  /**
   * Sends an AMP Analytics trigger event to a vendor's cross-domain iframe,
   * or queues the message if the frame is not yet ready to receive messages.
   * @param {string} event A string describing the trigger event
   * @visibleForTesting
   */
  sendRequest(event) {
    const frameData = IframeTransport.getFrameData(this.type_);
    devAssert(frameData, 'Trying to send message to non-existent frame');
    devAssert(
      frameData.queue,
      'Event queue is missing for messages from ' +
        this.type_ +
        ' to creative ID ' +
        this.creativeId_
    );
    frameData.queue.enqueue(
      /** @type {!IframeTransportEventDef} */
      ({creativeId: this.creativeId_, message: event})
    );
  }

  /**
   * Gets the FrameData associated with a particular cross-domain frame type.
   * @param {string} type The type attribute of the amp-analytics tag
   * @return {FrameData}
   * @visibleForTesting
   */
  static getFrameData(type) {
    return IframeTransport.crossDomainIframes_[type];
  }

  /**
   * Removes all knowledge of cross-domain iframes.
   * Does not actually remove them from the DOM.
   * @visibleForTesting
   */
  static resetCrossDomainIframes() {
    IframeTransport.crossDomainIframes_ = {};
  }

  /**
   * @return {string} Unique ID of this instance of IframeTransport
   * @visibleForTesting
   */
  getCreativeId() {
    return this.creativeId_;
  }

  /**
   * @return {string} Type attribute of parent amp-analytics instance
   * @visibleForTesting
   */
  getType() {
    return this.type_;
  }
}

/**
 * @param {!Window} win
 * @return {boolean}
 */
export function isLongTaskApiSupported(win) {
  return (
    !!win.PerformanceObserver &&
    !!win['TaskAttributionTiming'] &&
    'containerName' in win['TaskAttributionTiming'].prototype
  );
}

/** @private {{[key: string]: FrameData}} */
IframeTransport.crossDomainIframes_ = {};

/** @private {number} */
IframeTransport.nextId_ = 0;

/** @private {{[key: string]: PerformanceObserver}} */
IframeTransport.performanceObservers_ = {};
