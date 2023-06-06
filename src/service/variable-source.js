import {isAmp4Email} from '#core/document/format';
import {whenDocumentComplete} from '#core/document/ready';
import {isFiniteNumber} from '#core/types';

import {Services} from '#service';

import {loadPromise} from '#utils/event-helper';
import {devAssert} from '#utils/log';

/** @typedef {string|number|boolean|undefined|null} */
export let ResolverReturnDef;

/** @typedef {function(...string):ResolverReturnDef} */
export let SyncResolverDef;

/** @typedef {function(...string):!Promise<ResolverReturnDef>} */
export let AsyncResolverDef;

/** @typedef {{sync: SyncResolverDef, async: AsyncResolverDef}} */
let ReplacementDef;

/**
 * A list of events that the navTiming needs to wait for.
 * Sort event in order
 * @enum {number}
 */
const WAITFOR_EVENTS_ENUM = {
  VIEWER_FIRST_VISIBLE: 1,
  DOCUMENT_COMPLETE: 2,
  LOAD: 3,
  LOAD_END: 4,
};

/**
 * A list of events on which event they should wait
 * @const {!{[key: string]: WAITFOR_EVENTS_ENUM}}
 */
const NAV_TIMING_WAITFOR_EVENTS = {
  // ready on viewer first visible
  'navigationStart': WAITFOR_EVENTS_ENUM.VIEWER_FIRST_VISIBLE,
  'redirectStart': WAITFOR_EVENTS_ENUM.VIEWER_FIRST_VISIBLE,
  'redirectEnd': WAITFOR_EVENTS_ENUM.VIEWER_FIRST_VISIBLE,
  'fetchStart': WAITFOR_EVENTS_ENUM.VIEWER_FIRST_VISIBLE,
  'domainLookupStart': WAITFOR_EVENTS_ENUM.VIEWER_FIRST_VISIBLE,
  'domainLookupEnd': WAITFOR_EVENTS_ENUM.VIEWER_FIRST_VISIBLE,
  'connectStart': WAITFOR_EVENTS_ENUM.VIEWER_FIRST_VISIBLE,
  'secureConnectionStart': WAITFOR_EVENTS_ENUM.VIEWER_FIRST_VISIBLE,
  'connectEnd': WAITFOR_EVENTS_ENUM.VIEWER_FIRST_VISIBLE,
  'requestStart': WAITFOR_EVENTS_ENUM.VIEWER_FIRST_VISIBLE,
  'responseStart': WAITFOR_EVENTS_ENUM.VIEWER_FIRST_VISIBLE,
  'responseEnd': WAITFOR_EVENTS_ENUM.VIEWER_FIRST_VISIBLE,
  // ready on document complte
  'domLoading': WAITFOR_EVENTS_ENUM.DOCUMENT_COMPLETE,
  'domInteractive': WAITFOR_EVENTS_ENUM.DOCUMENT_COMPLETE,
  'domContentLoaded': WAITFOR_EVENTS_ENUM.DOCUMENT_COMPLETE,
  'domComplete': WAITFOR_EVENTS_ENUM.DOCUMENT_COMPLETE,
  // ready on load
  'loadEventStart': WAITFOR_EVENTS_ENUM.LOAD,
  // ready on load complete
  'loadEventEnd': WAITFOR_EVENTS_ENUM.LOAD_END,
};

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
  // Fallback to load event if we don't know what to wait for
  const startWaitForEvent =
    NAV_TIMING_WAITFOR_EVENTS[startEvent] || WAITFOR_EVENTS_ENUM.LOAD;
  const endWaitForEvent = endEvent
    ? NAV_TIMING_WAITFOR_EVENTS[endEvent] || WAITFOR_EVENTS_ENUM.LOAD
    : startWaitForEvent;

  const waitForEvent = Math.max(startWaitForEvent, endWaitForEvent);

  // set wait for onload to be default
  let readyPromise;
  if (waitForEvent === WAITFOR_EVENTS_ENUM.VIEWER_FIRST_VISIBLE) {
    readyPromise = Promise.resolve();
  } else if (waitForEvent === WAITFOR_EVENTS_ENUM.DOCUMENT_COMPLETE) {
    readyPromise = whenDocumentComplete(win.document);
  } else if (waitForEvent === WAITFOR_EVENTS_ENUM.LOAD) {
    readyPromise = loadPromise(win);
  } else if (waitForEvent === WAITFOR_EVENTS_ENUM.LOAD_END) {
    // performance.timing.loadEventEnd returns 0 before the load event handler
    // has terminated, that's when the load event is completed.
    // To wait for the event handler to terminate, wait 1ms and defer to the
    // event loop.
    const timer = Services.timerFor(win);
    readyPromise = loadPromise(win).then(() => timer.promise(1));
  }

  devAssert(readyPromise, 'waitForEvent not supported ' + waitForEvent);

  return readyPromise.then(() => {
    return getTimingDataSync(win, startEvent, endEvent);
  });
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

  const metric =
    endEvent === undefined
      ? timingInfo[startEvent]
      : timingInfo[endEvent] - timingInfo[startEvent];

  if (!isFiniteNumber(metric) || metric < 0) {
    // The metric is not supported.
    return;
  } else {
    return metric;
  }
}

/**
 * Returns navigation information from the current browsing context.
 * @param {!Window} win
 * @param {string} attribute
 * @return {ResolverReturnDef}
 */
export function getNavigationData(win, attribute) {
  const navigationInfo = win['performance'] && win['performance']['navigation'];
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
  /**
   * @param {!./ampdoc-impl.AmpDoc} ampdoc
   */
  constructor(ampdoc) {
    /** @protected @const {!./ampdoc-impl.AmpDoc} */
    this.ampdoc = ampdoc;

    /** @private @const {!{[key: string]: !ReplacementDef}} */
    this.replacements_ = Object.create(null);

    /** @private {boolean} */
    this.initialized_ = false;

    this.getUrlMacroAllowlist_();
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
    devAssert(varName.indexOf('RETURN') == -1);
    this.replacements_[varName] = this.replacements_[varName] || {
      sync: undefined,
      async: undefined,
    };
    this.replacements_[varName].sync = syncResolver;
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
    devAssert(varName.indexOf('RETURN') == -1);
    this.replacements_[varName] = this.replacements_[varName] || {
      sync: undefined,
      async: undefined,
    };
    this.replacements_[varName].async = asyncResolver;
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
   * @param {!{[key: string]: *}=} opt_bindings
   * @param {!{[key: string]: boolean}=} opt_allowlist Optional allowlist of names
   *   that can be substituted.
   * @return {!RegExp}
   */
  getExpr(opt_bindings, opt_allowlist) {
    if (!this.initialized_) {
      this.initialize_();
    }
    const all = {...this.replacements_, ...opt_bindings};
    return this.buildExpr_(Object.keys(all), opt_allowlist);
  }

  /**
   * @param {!Array<string>} keys
   * @param {!{[key: string]: boolean}=} opt_allowlist Optional allowlist of names
   *   that can be substituted.
   * @return {!RegExp}
   * @private
   */
  buildExpr_(keys, opt_allowlist) {
    // If a allowlist is present, the keys must belong to the allowlist.
    // We filter the keys one last time to ensure no unallowlisted key is
    // allowed.
    if (this.getUrlMacroAllowlist_()) {
      keys = keys.filter((key) => this.getUrlMacroAllowlist_().includes(key));
    }
    // If a allowlist is passed into the call to GlobalVariableSource.expand_
    // then we only resolve values contained in the allowlist.
    if (opt_allowlist) {
      keys = keys.filter((key) => opt_allowlist[key]);
    }
    if (keys.length === 0) {
      const regexThatMatchesNothing = /_^/g; // lgtm [js/regex/unmatchable-caret]
      return regexThatMatchesNothing;
    }
    // The keys must be sorted to ensure that the longest keys are considered
    // first. This avoids a problem where a RANDOM conflicts with RANDOM_ONE.
    keys.sort((s1, s2) => s2.length - s1.length);
    // Keys that start with a `$` need to be escaped so that they do not
    // interfere with the regex that is constructed.
    const escaped = keys.map((key) => {
      if (key[0] === '$') {
        return '\\' + key;
      }
      return key;
    });

    const all = escaped.join('|');
    // Match the given replacement patterns, as well as optionally
    // arguments to the replacement behind it in parentheses.
    // Example string that match
    // FOO_BAR
    // FOO_BAR(arg1)
    // FOO_BAR(arg1,arg2)
    // FOO_BAR(arg1, arg2)
    const regexStr = '\\$?(' + all + ')';
    return new RegExp(regexStr, 'g');
  }

  /**
   * For email documents, all URL macros are disallowed by default.
   * @return {Array<string>|undefined} The allowlist of substitutable AMP variables
   * @private
   */
  getUrlMacroAllowlist_() {
    if (this.variableAllowlist_) {
      return this.variableAllowlist_;
    }

    // Disallow all URL macros for AMP4Email format documents.
    if (this.ampdoc.isSingleDoc()) {
      const doc = /** @type {!Document} */ (this.ampdoc.getRootNode());
      if (isAmp4Email(doc)) {
        /**
         * The allowlist of variables allowed for variable substitution.
         * @private {?Array<string>}
         */
        this.variableAllowlist_ = [''];
        return this.variableAllowlist_;
      }
    }
  }
}
