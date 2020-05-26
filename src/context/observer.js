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

import {removeUniqueItem} from '../utils/array';

/**
 * @typedef {{
 *   props: (!Array<!ContextPropDef>|(!ContextPropDef)),
 * }}
 */
export let ContextNodeObserverOptionsDef;

/**
 * @typedef {{
 *   props: !Array<!ContextPropDef>,
 * }}
 */
export let ContextNodeObserverEntryDef;

export class ContextNodeObserver {

  /**
   */
  constructor(callback, options = {}) {
    /** @private @const {function(!Array<!ContextNodeObserverEntryDef>)} */
    this.callback_ = callback;

    const props = [].concat(options.props || []);

    /** @private @const {!Map<string, !ContextPropDef>} */
    this.props_ = new Map();
    props.forEach(prop => {
      this.props_.set(prop.key, prop);
    });

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
   * @param {!ContextNode} contextNode
   * @param {string} key
   * @private
   */
  observer_(contextNode, key) {
    const prop = this.props_.get(key);
    if (prop) {
      this.pushEvent_(contextNode, prop);
    }
  }

  /**
   * @param {!ContextNode} contextNode
   * @private
   */
  scan_(contextNode) {
    // QQQ: use some private util with `scanUsed`?
    this.props_.forEach((prop) => {
      const value = contextNode.inputsByKey_?.get(prop.key);
      if (value !== undefined) {
        this.pushEvent_(contextNode, prop);
      }
    });
    // QQQ: enable fast-exist search.
    if (contextNode.children_) {
      contextNode.children_.forEach(this.scan_);
    }
  }

  /**
   * @param {!ContextNode} contextNode
   * @param {!ContextPropDef} prop
   * @private
   */
  pushEvent_(contextNode, prop) {
    // QQQ: dedup.
    this.events_.push({contextNode, prop});
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
