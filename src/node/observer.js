
import {toKey} from './context-type';

/**
 * @typedef {{
 *   contextTypes: (!Array<!ContextTypeDef>|(!ContextTypeDef)),
 * }}
 */
export let ContextNodeObserverOptionsDef;

/**
 * @typedef {{
 *   contextTypes: !Array<!ContextTypeDef>,
 * }}
 */
export let ContextNodeObserverEntryDef;

export class ContextNodeObserver {

  /**
   */
  constructor(callback, options = {}) {
    /** @private @const {function(!Array<!ContextNodeObserverEntryDef>)} */
    this.callback_ = callback;

    const {contextTypes} = options;

    /** @private @const {!ContextNodeObserverOptionsDef} */
    this.options_ = {
      contextTypes: [].concat(contextTypes || []).map(toKey),
    };

    /** @private @const {!Array<!ContextNode>} */
    this.observedNodes_ = [];

    /** @private @const {!Array<!ContextNodeObserverEntryDef>} */
    this.events_ = [];

    this.observer_ = this.observer_.bind(this);
    this.scan_ = this.scan_.bind(this);
    this.report_ = this.report_.bind(this);
  }

  /**
   * @param {!ContextNode} contextNode
   * @param {boolean=} scan
   */
  observe(contextNode, scan = false) {
    if (this.observedNodes_.indexOf(contextNode) != -1) {
      return;
    }
    this.observedNodes_.push(contextNode);
    contextNode.addObserver(this.observer_);
    if (scan) {
      this.scan_(contextNode);
    }
  }

  /**
   * @param {!ContextNode} contextNode
   */
  unobserve(contextNode) {
    const index = this.observedNodes_.indexOf(contextNode);
    if (index == -1) {
      return;
    }
    this.observedNodes_.splice(index, 1);
    contextNode.removeObserver(this.observer_);
  }

  /**
   */
  disconnect() {
    this.observedNodes_.forEach(contextNode => {
      contextNode.removeObserver(this.observer_);
    });
    this.observedNodes_.length = 0;
  }

  /**
   * @param {{contextNode: !ContextNode, keys: !Array<!ContextTypeDef>}} event
   * @private
   */
  observer_(event) {
    const {contextNode, keys} = event;
    if (matchesKeys(contextNode, keys, this.options_)) {
      this.pushEvent_(contextNode);
    }
  }

  /**
   * @param {!ContextNode} contextNode
   * @private
   */
  scan_(contextNode) {
    // QQQ: move to ContextNode? Or static node.js?
    if (matches(contextNode, this.options_)) {
      this.pushEvent_(contextNode);
    }
    // QQQ: enable fast-exist search.
    if (contextNode.children_) {
      contextNode.children_.forEach(this.scan_);
    }
  }

  /**
   * @param {!ContextNode} contextNode
   * @private
   */
  pushEvent_(contextNode) {
    // QQQQ: push keys as well?
    // QQQQ: push value as well?
    // QQQQ: dedup.
    this.events_.push({contextNode});
    if (!this.reportScheduled_) {
      this.reportScheduled_ = true;
      // QQQ: idle/vsync/etc
      setTimeout(this.report_);
    }
  }

  /** @private */
  report_() {
    this.reportScheduled_ = false;
    const events = this.events_.slice(0);
    this.events_.length = 0;
    this.callback_(events);
  }
}

/**
 * @param {!ContextNode} contextNode
 * @param {!ContextNodeObserverOptionsDef} options
 * @return {boolean}
 */
function matches(contextNode, options) {
  const {contextTypes} = options;
  if (contextTypes.length == 0) {
    return true;
  }
  const subscribers = contextNode.subscribers_;
  if (!subscribers) {
    return false;
  }
  return contextTypes.some(key => {
    const subscriber = subscribers.get(key);
    return subscriber && subscriber.value != null;
  });
}

/**
 * @param {!ContextNode} contextNode
 * @param {!Array<string>} keys
 * @param {!ContextNodeObserverOptionsDef} options
 * @return {boolean}
 */
function matchesKeys(contextNode, keys, options) {
  // QQQQ: combine with matches
  const {contextTypes} = options;
  if (contextTypes.length == 0) {
    return true;
  }
  if (keys.length == 0) {
    return false;
  }
  // QQQ: return intersection?
  return contextTypes.some(key => keys.includes(key));
}
