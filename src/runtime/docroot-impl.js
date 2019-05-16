/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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

import {Observable} from '../observable';
import {Signals} from '../utils/signals';
import {VisibilityState} from '../visibility-state';
import {dev, devAssert} from '../log';

const DOCROOT_PROP = '__AMP_DOCROOT__';

/** @enum {string} */
const DOCROOT_SIGNALS = {
  BODY: 'docroot-body',
  FIRST_VISIBLE: 'docroot-first-visible',
  READY: 'docroot-ready',
};

/**
 * @typedef {{
 *   url: (string|undefined),
 *   visibilityState: !VisibilityState,
 *   ready: boolean,
 * }}
 */
let DocRootOptionsDef;


/**
 * @implements {DocRoot}
 * @abstract
 */
export class DocRootImpl {

  /**
   * @param {!DocumentOrShadowRoot} rootNode
   * @param {!DocRootOptionsDef} options
   */
  constructor(rootNode, options) {
    devAssert(!rootNode[DOCROOT_PROP], 'duplicate docroot');
    rootNode[DOCROOT_PROP] = this;

    /** @private @const {!DocumentOrShadowRoot} */
    this.rootNode_ = rootNode;

    /** @package @const {!Document} */
    this.doc_ = rootNode.ownerDocument || rootNode;

    /** @package @const {!Signals} */
    this.signals_ = new Signals();

    /** @private {string|undefined} */
    this.url_ = options.url;

    /** @private {!VisibilityState} */
    this.visibilityState_ = options.visibilityState;

    /** @private {boolean} */
    this.hasBeenVisible_ = this.visibilityState_ == VisibilityState.VISIBLE;

    /** @private @const {!Obserable<!VisibilityState>} */
    this.visibilityStateHandlers_ = new Observable();

    /** @private {boolean} */
    this.ready_ = options.ready;

    /** @private @const {!Promise} */
    this.bodyPromise_ = this.signals.whenSignal(DOCROOT_SIGNALS.BODY)
        .then(() => this.body);
  }

  /**
   * @return {string}
   * @override
   */
  get url() {
    return this.url_ || this.doc_.location.href;
  }

  /**
   * @param {string} url
   * @package
   */
  setUrl(url) {
    this.url_ = url;
  }

  /**
   * @return {!DocumentOrShadowRoot}
   * @override
   */
  get rootNode() {
    return this.rootNode_;
  }

  /** @override */
  get win() {
    return devAssert(this.doc_.defaultView);
  }

  /** @override */
  get signals() {
    return this.signals_;
  }

  /** @override */
  get styleSheets() {
    return this.rootNode_.styleSheets;
  }

  /** @override */
  get documentElement() {
    return dev().assertElement(this.rootNode_['documentElement']);
  }

  /** @override */
  get head() {
    return dev().assertElement(this.rootNode_['head']);
  }

  /** @override */
  get body() {
    return dev().assertElement(this.bodyIfAvailable, 'body not available');
  }

  /** @override */
  get bodyIfAvailable() {
    return this.rootNode_['body'];
  }

  /** @override */
  waitForBodyOpen() {
    return this.bodyPromise_;
  }

  /**
   * @package
   */
  setBodyAvailable() {
    this.signals_.signal(DOCROOT_SIGNALS.BODY);
  }

  /**
   * @param {!Node} node
   * @return {boolean}
   * @override
   */
  contains(node) {
    return this.rootNode_.contains(node);
  }

  /**
   * @param {string} name
   * @return {!Element}
   * @override
   */
  createElement(name) {
    return this.doc_.createElement(name);
  }

  /**
   * @param {!Node} node
   * @return {!Node}
   * @override
   */
  adoptNode(node) {
    return this.doc_.adoptNode(node);
  }

  /**
   * @param {!Node} node
   * @param {boolean=} deep
   * @return {!Node}
   * @override
   */
  importNode(node, deep = false) {
    return this.doc_.importNode(node, deep);
  }

  /**
   * @param {string} selector
   * @return {!NodeList<!Element>}
   * @override
   */
  querySelectorAll(selector) {
    return this.rootNode_.querySelectorAll(selector);
  }

  /**
   * @param {string} selector
   * @return {!Element}
   * @override
   */
  querySelector(selector) {
    return this.rootNode_.querySelector(selector);
  }

  /** @override */
  getElementById(id) {
    return this.rootNode_.getElementById(id);
  }

  /** @override */
  get ready() {
    return this.ready_;
  }

  /** @override */
  whenReady() {
    return this.signals_.whenSignal(DOCROOT_SIGNALS.READY);
  }

  /**
   * @param {boolean} ready
   * @package
   */
  setReady() {
    if (ready != this.ready_) {
      this.ready_ = ready;
      if (ready) {
        this.signals_.signal(DOCROOT_SIGNALS.READY);
      }
    }
  }

  /** @override */
  get visible() {
    return this.visibilityState_ == VisibilityState.VISIBLE;
  }

  /** @override */
  get hasBeenVisible() {
    return this.hasBeenVisible_;
  }

  /** @override */
  whenFirstVisible() {
    return this.signals_.whenSignal(DOCROOT_SIGNALS.FIRST_VISIBLE);
  }

  /** @override */
  get visibilityState() {
    return this.visibilityState_;
  }

  /** @override */
  onVisibilityStateChange(handler) {
    return this.visibilityStateHandlers_.add(handler);
  }

  /**
   * @param {!VisibilityState} visibilityState
   * @package
   */
  setVisibilityState(visibilityState) {
    if (this.visibilityState_ != visibilityState) {
      this.visibilityState_ = visibilityState;
      if (this.visible && !this.hasBeenViisible_) {
        this.hasBeenVisible_ = true;
        this.signals_.signal(DOCROOT_SIGNALS.FIRST_VISIBLE);
      }
      this.visibilityStateHandlers_.fire();
    }
  }
}


/**
 * @param {!DocRoot} docroot
 * @param {!VisibilityState} state
 * @restricted
 */
export function setDocRootVisibilityState(docroot, state) {
  (/** @type {!DocRootImpl} */ (docroot)).setVisibilityState(state);
}

/**
 * @param {!DocRoot} docroot
 * @param {string} url
 * @restricted
 */
export function setDocRootUrl(docroot, url) {
  (/** @type {!DocRootImpl} */ (docroot)).setUrl(url);
}

/**
 * @param {!DocRoot} docroot
 * @restricted
 */
export function setDocRootBodyAvailable(docroot) {
  (/** @type {!DocRootImpl} */ (docroot)).setBodyAvailable();
}

/**
 * @param {!DocRoot} docroot
 * @restricted
 */
export function setDocRootReady(docroot) {
  (/** @type {!DocRootImpl} */ (docroot)).setReady();
}
