/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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
import {dev} from '../log';
import {loadPromise} from '../event-helper';
import {isFiniteNumber} from '../types';

/** @typedef {string|number|boolean|undefined|null} */
let ResolverReturnDef;

/** @typedef {function(...*):ResolverReturnDef} */
let SyncResolverDef;

/** @typedef {function(...*):!Promise<ResolverReturnDef>} */
let AsyncResolverDef;

/** @typedef {{sync: SyncResolverDef, async: AsyncResolverDef}} */
let ReplacementDef;


/**
 * Returns navigation timing information based on the start and end events.
 * The data for the timing events is retrieved from performance.timing API.
 * If start and end events are both given, the result is the difference between
 * the two. If only start event is given, the result is the timing value at
 * start event.
 * @param {!Window} win
 * @param {string} startEvent
 * @param {string=} endEvent
 * @return {!Promise<ResolverReturnDef>}
 */
export function getTimingDataAsync(win, startEvent, endEvent) {
  const metric = getTimingDataSync(win, startEvent, endEvent);
  if (metric === '') {
    // Metric is not yet available. Retry after a delay.
    return loadPromise(win).then(() => {
      return getTimingDataSync(win, startEvent, endEvent);
    });
  }
  return Promise.resolve(metric);
}

/**
 * Returns navigation timing information based on the start and end events.
 * The data for the timing events is retrieved from performance.timing API.
 * If start and end events are both given, the result is the difference between
 * the two. If only start event is given, the result is the timing value at
 * start event. Enforces synchronous evaluation.
 * @param {!Window} win
 * @param {string} startEvent
 * @param {string=} endEvent
 * @return {ResolverReturnDef} undefined if API is not available, empty string
 *    if it is not yet available, or value as string
 */
export function getTimingDataSync(win, startEvent, endEvent) {
  const timingInfo = win['performance'] && win['performance']['timing'];
  if (!timingInfo || timingInfo['navigationStart'] == 0) {
    // Navigation timing API is not supported.
    return;
  }

  const metric = (endEvent === undefined)
      ? timingInfo[startEvent]
      : timingInfo[endEvent] - timingInfo[startEvent];

  if (!isFiniteNumber(metric)) {
    // The metric is not supported.
    return;
  } else if (metric < 0) {;
    return '';
  } else {
    return metric;
  }
}

/**
 * Returns navigation information from the current browsing context.
 * @param {!Window} win
 * @param {string} attribute
 * @return {ResolverReturnDef}
 * @private
 */
export function getNavigationData(win, attribute) {
  const navigationInfo = win['performance'] &&
    win['performance']['navigation'];
  if (!navigationInfo || navigationInfo[attribute] === undefined) {
    // PerformanceNavigation interface is not supported or attribute is not
    // implemented.
    return;
  }
  return navigationInfo[attribute];
}


/**
 * A class to provide variable substitution related features. Extend this class
 * and override initialize() to add more supported variables.
 */
export class VariableSource {
  constructor() {
    /** @private {!RegExp|undefined} */
    this.replacementExpr_ = undefined;

    /** @private @const {!Object<string, !ReplacementDef>} */
    this.replacements_ = Object.create(null);

    /** @private {boolean} */
    this.initialized_ = false;
  }

  /**
   * Lazily initialize the default replacements.
   * @private
   */
  initialize_() {
    this.initialize();
    this.initialized_ = true;
  }

  /**
   * Override this method to set all the variables supported by derived class.
   */
  initialize() {
    // Needs to be implemented by derived classes.
  }

  /**
   * Method exists to assist stubbing in tests.
   * @param {string} name
   * @return {!ReplacementDef}
   */
  get(name) {
    if (!this.initialized_) {
      this.initialize_();
    }

    return this.replacements_[name];
  }

  /**
   * Sets a synchronous value resolver for the variable with the specified name.
   * The value resolver may optionally take an extra parameter.
   * Can be called in conjunction with setAsync to allow for additional
   * asynchronous resolver where expand will use async and expandSync the sync
   * version.
   * @param {string} varName
   * @param {!SyncResolverDef} syncResolver
   * @return {!VariableSource}
   */
  set(varName, syncResolver) {
    dev().assert(varName.includes('RETURN') === false);
    this.replacements_[varName] =
        this.replacements_[varName] || {sync: undefined, async: undefined};
    this.replacements_[varName].sync = syncResolver;
    this.replacementExpr_ = undefined;
    return this;
  }

  /**
   * Sets an async value resolver for the variable with the specified name.
   * The value resolver may optionally take an extra parameter.
   * Can be called in conjuction with setAsync to allow for additional
   * asynchronous resolver where expand will use async and expandSync the sync
   * version.
   * @param {string} varName
   * @param {!AsyncResolverDef} asyncResolver
   * @return {!VariableSource}
   */
  setAsync(varName, asyncResolver) {
    dev().assert(varName.includes('RETURN') === false);
    this.replacements_[varName] =
        this.replacements_[varName] || {sync: undefined, async: undefined};
    this.replacements_[varName].async = asyncResolver;
    this.replacementExpr_ = undefined;
    return this;
  }

  /**
   * Helper method to set both sync and async resolvers.
   * @param {string} varName
   * @param {!SyncResolverDef} syncResolver
   * @param {!AsyncResolverDef} asyncResolver
   * @return {!VariableSource}
   */
  setBoth(varName, syncResolver, asyncResolver) {
    return this.set(varName, syncResolver).setAsync(varName, asyncResolver);
  }

  /**
   * Returns a Regular expression that can be used to detect all the variables
   * in a template.
   * @param {!Object<string, *>=} opt_bindings
   * @return {!RegExp}
   */
  getExpr(opt_bindings) {
    if (!this.initialized_) {
      this.initialize_();
    }

    const additionalKeys = opt_bindings ? Object.keys(opt_bindings) : null;
    if (additionalKeys && additionalKeys.length > 0) {
      const allKeys = Object.keys(this.replacements_);
      additionalKeys.forEach(key => {
        if (this.replacements_[key] === undefined) {
          allKeys.push(key);
        }
      });
      return this.buildExpr_(allKeys);
    }
    if (!this.replacementExpr_) {
      this.replacementExpr_ = this.buildExpr_(Object.keys(this.replacements_));
    }
    return this.replacementExpr_;
  }

  /**
   * @param {!Array<string>} keys
   * @return {!RegExp}
   * @private
   */
  buildExpr_(keys) {
    // The keys must be sorted to ensure that the longest keys are considered
    // first. This avoids a problem where a RANDOM conflicts with RANDOM_ONE.
    keys.sort((s1, s2) => s2.length - s1.length);
    const all = keys.join('|');
    // Match the given replacement patterns, as well as optionally
    // arguments to the replacement behind it in parantheses.
    // Example string that match
    // FOO_BAR
    // FOO_BAR(arg1)
    // FOO_BAR(arg1,arg2)
    return new RegExp('\\$?(' + all + ')(?:\\(([0-9a-zA-Z-_.,]+)\\))?', 'g');
  }
}
