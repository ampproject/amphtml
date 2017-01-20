/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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

import {getDataParamsFromAttributes} from '../../../src/dom';

const VARIABLE_DATA_ATTRIBUTE_KEY = /^vars(.+)/;
const EMPTY_FUNC = function() {};
const PROP = '__AMP_AN_ROOT';


// QQQ: Instrumentation?
class AnalyticsService {

  constructor(ampdoc) {

    this.ampdoc = ampdoc;

    this.ampdocRoot_ = new AmpdocAnalyticsRoot(this.ampdoc);

    this.scoped_ = [];  // QQQ: cleanup
  }

  /**
   * @param {!Element} context
   * @param {!Object} config
   * @param {!QQQ} options
   * @return {!Disposable}
   */
  registerConfig(context, config, options) {
    const root = this.findRoot_(context, options.scoped);
    return new AnalyticsConfig(root, context, config, options);
  }

  /**
   * Triggers the analytics event with the specified type.
   * @param {!Element} target
   * @param {string} eventType
   * @param {!Object<string, string>=} opt_vars A map of vars and their values.
   */
  triggerEvent(target, eventType, opt_vars) {
    const event = new AnalyticsEvent(eventType, opt_vars);

    const roots = this.findTargetRoots_(target);
    roots.forEach(root => {
      const tracker = root.getTrackerOptional(eventType, CustomTracker);
      if (tracker) {
        tracker.trigger(event);
      }
    });
  }

  /**
   * @param {!Element} target
   * @return {!Array<!AnalyticsRoot>}
   */
  findTargetRoots_(target) {// QQQ: inline for optimization.
    const roots = [];
    roots.push(this.findRoot_(target, /* scoped */ false));
    for (let i = 0; i < this.scoped_.length; i++) {
      const scoped = this.scoped_[i];
      if (scoped.contains(target)) {
        roots.push(target);
      }
    }
    return roots;
  }

  /**
   * @param {!Element} context
   * @param {boolean} scoped
   * @return {!AnalyticsRoot}
   */
  findRoot_(context, scoped) {

    // Scoped
    if (scoped) {
      // QQQ: should scoped be on the root level? E.g. scoped within FIE?
      const ampElement = getAmpElement(context);
      return this.getOrCreateRoot_(ampElement, scoped, () => {
        return new ScopedAnalyticsRoot(ampElement);
      });
    }

    // FIE
    const frame = getParentWindowFrameElement(context, this.ampdoc.win);
    if (frame) {
      const embed = getFriendlyIframeEmbedOptional(frame);
      if (embed) {
        return this.getOrCreateRoot_(embed, scoped, () => {
          return new FieAnalyticsRoot(embed);
        });
      }
    }

    return this.ampdocRoot_;
  }

  /**
   * @param {!Object} holder
   * @param {boolean} scoped
   * @param {function(new:T)} factory
   * @template {T extends AnalyticsRoot}
   */
  getOrCreateRoot_(holder, scoped, factory) {
    let root = /** @type {!T} */ (holder[PROP]);
    if (!root) {
      root = factory();
      holder[PROP] = root;
      if (scoped) {
        this.scoped_.push(root);
      }
    }
    return root;
  }
}


/**
 * @implements {!Disposable}
 */
class AnalyticsConfig {
  /**
   * @param {!AnalyticsRoot} root
   * @param {!Element} context
   * @param {!Object} config
   */
  constructor(root, context, config) {
    this.root_ = root;
    this.context_ = context;
    this.config_ = config;

    /** @private {boolean} */
    this.isDisposed_ = false;

    /** @private @const {!UnlistenDef} */
    this.listeners_ = [];
  }

  /** @override */
  dispose() {
    this.isDisposed_ = true;
    this.listeners_.forEach(listener => {
      listener();
    });
  }

  /**
   * @param {string} eventType
   * @param {!Object} config
   * @param {function(new:Tracker)} trackerClass
   */
  addTrigger(eventType, config, trackerClass) {
    const tracker = this.root_.getTracker(eventType, trackerClass);
    this.listeners_.push(tracker.add(
        this.context_,
        eventType,
        config,
        this.handleEvent_.bind(this, eventType, config)));
  }

  /**
   * @param {string} eventType
   * @param {!Object} config
   * @param {!AnalyticsEvent} event
   */
  handleEvent_(eventType, config, event) {
    if (this.isDisposed_) {
      // Not all events can be canceled in time, thus we need to simply
      // ensure they are not reported.
      return;
    }

    // QQQ: should we still report when top root is invisible?
  }
}


/**
 * @abstract
 */
export class Tracker {
  /**
   * @param {!AnalyticsRoot} root
   */
  constructor(root) {
    /** @const */
    this.root = root;
    // QQQ
    // this.ampdoc;
    // this.root;
    // this.eventType;
  }

  /**
   * @param {!Element} context
   * @param {string} eventType
   * @param {!JSONType} config
   * @param {!AnalyticsEventListenerDef} listener
   * @return {!UnlistenDef}
   * @abstract
   */
  add(context, eventType, config, listener) {}
}


/**
 */
export class CustomTracker extends Tracker {
  /**
   */
  constructor(root) {
    super(root);

    /** @const @private {!Object<string, !Observable<!AnalyticsEvent>>} */
    this.observers_ = {};

    /**
     * Early events have to be buffered because there's no way to predict
     * how fast all `amp-analytics` elements will be instrumented.
     * @private {!Object<string, !Array<!AnalyticsEvent>>|undefined}
     */
    this.buffer_ = {};

    // Stop buffering of custom events after 10 seconds. Assumption is that all
    // `amp-analytics` elements will have been instrumented by this time.
    this.timer_.delay(() => {
      this.buffer_ = undefined;
    }, 10000);
  }

  /** @override */
  dispose() {
    this.buffer_ = undefined;
    this.observers_.forEach(observers => {
      observers.removeAll();
    });
  }

  /** @override */
  add(context, eventType, config, listener) {
    // QQQ: selector?

    let observers = this.observers_[eventType];
    if (!observers) {
      observers = new Observable();
      this.observers_[eventType] = observers;
    }
    const unlisten = observers.add(listener);

    // Push recent events if any.
    const buffer = this.buffer_ && this.buffer_[eventType];
    if (buffer) {
      this.timer_.delay(() => {
        buffer.forEach(event => {
          listener(event);
        });
      }, 1);
    }

    return unlisten;
  }

  /**
   * @param {!AnalyticsEvent} event
   */
  trigger(event) {
    // Buffer still exists - enqueue.
    if (this.buffer_) {
      let buffer = this.buffer_[event.type];
      if (!buffer) {
        buffer = [];
        this.buffer_[event.type] = buffer;
      }
      buffer.push(event);
    }

    // If listeners already present - trigger right away.
    const observers = this.observers_[eventType];
    if (observers) {
      observers.fire(event);
    }
  }
}


/**
 */
export class ClickTracker extends Tracker {
  /**
   */
  constructor(root) {
    super(root);

    /** @private {!Observable<!Event>} */
    this.clickObservable_ = new Observable();

    /** @private @const */
    this.boundOnClick_ = e => {
      this.clickObservable_.fire(e);
    };
    // QQQ: `root.getRoot()` is ugly
    this.root.getRoot().addEventListener('click', this.boundOnClick_);
  }

  /** @override */
  dispose() {
    this.root.getRoot().removeEventListener('click', this.boundOnClick_);
    this.clickObservable_.removeAll();
  }

  /** @override */
  add(context, eventType, config, listener) {
    const selector = config['selector'];
    const selectionMethod = config['selectionMethod'] || null;
    if (!selector) {
      user().error(TAG, 'Missing required selector on click trigger'); // QQQ: throw user exceptions and handle them above
      return;
    }
    return this.clickObservable_.add(this.root.createSelectiveListener(
        this.handleClick_.bind(this, listener),
        context,
        selector,
        selectionMethod));
  }

  /**
   * @param {!AnalyticsEventListenerDef} listener
   * @param {!Element} target
   * @param {!Event} event
   * @private
   */
  handleClick_(listener, target, event) {
    const params = getDataParamsFromAttributes(
        target,
        /* computeParamNameFunc */ undefined,
        VARIABLE_DATA_ATTRIBUTE_KEY);
    listener(new AnalyticsEvent(AnalyticsEventType.CLICK, params));
  }
}


/**
 */
export class VisibilityTracker extends Tracker {
  /**
   */
  constructor(root, eventType) {
    super(root, eventType);

    dev().assert(eventType == AnalyticsEventType.VISIBLE ||
        eventType == AnalyticsEventType.HIDDEN,
        'visibility tracker should be called with visible or hidden ' +
        'eventType, instead got %s', eventType);
  }

  /** @override */
  dispose() {
  }

  /** @override*/
  add(context, eventType, config, listener) {
    if (!isVisibilitySpecValid(config)) {
      return EMPTY_FUNC;
    }

    const eventType = this.eventType;
    const shouldBeVisible = eventType == AnalyticsEventType.VISIBLE;
    const listenOnceFunc = this.visibilityV2Enabled_
        ? this.visibility_.listenOnceV2.bind(this.visibility_)
        : this.visibility_.listenOnce.bind(this.visibility_);
    const host = this.root.getHost();
    const spec = /** @type {!Object} */ (config['visibilitySpec']);
    const selector = spec && spec['selector']; // QQQ: support root selectors directly?
    let element;
    if (selector && !isRootSelector(selector)) {
      const selectionMethod = spec['selectionMethod'] || null;
      element = this.root.getElement(context, selector, selectionMethod);
    } else if (host) {
      // An embed of some sort?
      // TODO(dvoytenko, #6794): Remove old `-amp-element` form after the new
      // form is in PROD for 1-2 weeks.
      element = closestBySelector(host, '.-amp-element,.i-amphtml-element');
    } else {
      // QQQ: element = this.root.getRoot();
    }
    if (element && element != this.ampdoc.getRootNode()) {
      // QQQ: check that visibility API considers viewer visibility as well.
      listenOnceFunc(element, spec || {}, vars => {  // QQQ: add `element` to visibility listenOnce APIs.
        const attr = getDataParamsFromAttributes(
            element,
            /* computeParamNameFunc */ undefined,
            VARIABLE_DATA_ATTRIBUTE_KEY);
        for (const key in attr) {
          vars[key] = attr[key];
        }
        listener(new AnalyticsEvent(eventType, vars));
      }, shouldBeVisible, context);  // QQQ: remove context/analyticsElement from visibilty APIs.
    } else {
      // QQQ: root + visibility params?
      const viewer = viewerForDoc(this.ampdoc); //QQQ: where does this.ampdoc come from?
      if (viewer.isVisible() == shouldBeVisible) {
        listener(new AnalyticsEvent(eventType));
        config['called'] = true;
      } else {
        viewer.onVisibilityChanged(() => {
          if (!config['called'] &&
              viewer.isVisible() == shouldBeVisible) {
            listener(new AnalyticsEvent(eventType));
            config['called'] = true;
          }
        });
      }
    }
    // QQQ: return unlisten();
  }
}


/**
 */
export class RenderStartTracker extends Tracker {
  /**
   */
  constructor(root) {
    super(root);
  }

  /** @override */
  dispose() {
  }

  /** @override */
  add(context, eventType, config, listener) {
    const selector = config['selector'] || ':root';
    let renderStartPromise;
    if (isRootSelector(selector)) {
      // Root selector: this is either a top-level document or a friendly embed.
      renderStartPromise = this.root.whenRenderStarted();
    } else {
      // This is an AMP-element signal.
      const selectionMethod = config['selectionMethod'];
      const element = user().assertElement(
          this.root.getElement(context, selector, selectionMethod),
          'Element not found for render-start selectionMethod: ' + selector);
      renderStartPromise = element.whenRenderStarted && element.whenRenderStarted();
    }
    if (renderStartPromise) {
      renderStartPromise.then(() => {
        callback(new AnalyticsEvent(AnalyticsEventType.RENDER_START));
      });
    } else {
      user().error(TAG, 'render-start signal cannot be found: ' + selector);
    }
    return EMPTY_FUNC;
  }
}


// QQQ: Selector class?
