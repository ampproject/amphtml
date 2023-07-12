import {devAssert} from '#core/assert';
import {removeElement} from '#core/dom';
import {childElementsByTag} from '#core/dom/query';

import {Services} from '#service';

import {dev} from '#utils/log';

/**
 * Takes as an input a text stream, parses it and incrementally reconstructs
 * it in the new target root.
 *
 * See https://jakearchibald.com/2016/fun-hacks-faster-content/ for more
 * details.
 *
 * @interface
 * @extends {WritableStreamDefaultWriter}
 * @visibleForTesting
 */
export class DomWriter {
  /**
   * Sets the callback that will be called when body has been parsed.
   *
   * For shadow use case, unlike most of other nodes, `<body>` cannot be simply
   * merged to support Shadow DOM polyfill where the use of `<body>`
   * element is not possible.
   *
   * The callback will be given the parsed document and it must return back
   * the reconstructed `<body>` node in the target DOM where all children
   * will be streamed into.
   *
   * @param {function(!Document):!Element} unusedCallback
   */
  onBody(unusedCallback) {}

  /**
   * Sets the callback that will be called when new nodes have been merged
   * into the target DOM.
   * @param {function()} unusedCallback
   */
  onBodyChunk(unusedCallback) {}

  /**
   * Sets the callback that will be called when the DOM has been fully
   * constructed.
   * @param {function()} unusedCallback
   */
  onEnd(unusedCallback) {}
}

/**
 * Takes as an input a text stream, parses it and incrementally reconstructs
 * it in the given root.
 *
 * See https://jakearchibald.com/2016/fun-hacks-faster-content/ for more
 * details.
 *
 * @implements {DomWriter}
 * @visibleForTesting
 */
export class DomWriterStreamer {
  /**
   * @param {!Window} win
   */
  constructor(win) {
    /** @const @private {!Document} */
    this.parser_ = win.document.implementation.createHTMLDocument('');
    this.parser_.open();

    /** @const @private */
    this.vsync_ = Services.vsyncFor(win);

    /** @private @const */
    this.boundMerge_ = this.merge_.bind(this);

    /** @private {?function(!Document):!Element} */
    this.onBody_ = null;

    /** @private {?function()} */
    this.onBodyChunk_ = null;

    /** @private {?function()} */
    this.onEnd_ = null;

    /** @private {boolean} */
    this.mergeScheduled_ = false;

    /** @const @private {!Promise} */
    this.success_ = Promise.resolve();

    /** @private {boolean} */
    this.eof_ = false;

    /** @private {?Element} */
    this.targetBody_ = null;
  }

  /** @override */
  onBody(callback) {
    this.onBody_ = callback;
  }

  /** @override */
  onBodyChunk(callback) {
    this.onBodyChunk_ = callback;
  }

  /** @override */
  onEnd(callback) {
    this.onEnd_ = callback;
  }

  /** @override */
  write(chunk) {
    if (this.eof_) {
      throw new Error('closed already');
    }
    if (chunk) {
      this.parser_.write(/** @type {string} */ (chunk));
    }
    this.schedule_();
    return this.success_;
  }

  /** @override */
  close() {
    this.parser_.close();
    this.eof_ = true;
    this.schedule_();
    return this.success_;
  }

  /** @override */
  abort(unusedReason) {
    throw new Error('Not implemented');
  }

  /** @override */
  releaseLock() {
    throw new Error('Not implemented');
  }

  /** @override */
  get closed() {
    throw new Error('Not implemented');
  }

  /** @override */
  get desiredSize() {
    throw new Error('Not implemented');
  }

  /** @override */
  get ready() {
    throw new Error('Not implemented');
  }

  /** @private */
  schedule_() {
    devAssert(this.onBody_ && this.onBodyChunk_ && this.onEnd_);
    if (!this.mergeScheduled_) {
      this.mergeScheduled_ = true;
      this.vsync_.mutate(this.boundMerge_);
    }
  }

  /** @private */
  merge_() {
    this.mergeScheduled_ = false;

    // Body has been newly parsed.
    if (!this.targetBody_ && this.parser_.body) {
      this.targetBody_ = this.onBody_(this.parser_);
    }

    // Merge body children.
    if (this.targetBody_) {
      const inputBody = dev().assertElement(this.parser_.body);
      const targetBody = devAssert(this.targetBody_);
      let transferCount = 0;
      removeNoScriptElements(inputBody);
      while (inputBody.firstChild) {
        transferCount++;
        targetBody.appendChild(inputBody.firstChild);
      }
      if (transferCount > 0) {
        this.onBodyChunk_();
      }
    }

    // EOF.
    if (this.eof_) {
      this.onEnd_();
    }
  }
}

/**
 * Takes as an input a text stream, aggregates it and parses it in one bulk.
 * This is a workaround against the browsers that do not support streaming DOM
 * parsing. Mainly currently Firefox.
 *
 * See https://github.com/whatwg/html/issues/2827 and
 * https://bugzilla.mozilla.org/show_bug.cgi?id=867102
 *
 * @implements {DomWriter}
 * @visibleForTesting
 */
export class DomWriterBulk {
  /**
   * @param {!Window} win
   */
  constructor(win) {
    /** @private {!Array<string>} */
    this.fullHtml_ = [];

    /** @const @private */
    this.vsync_ = Services.vsyncFor(win);

    /** @private {?function(!Document):!Element} */
    this.onBody_ = null;

    /** @private {?function()} */
    this.onBodyChunk_ = null;

    /** @private {?function()} */
    this.onEnd_ = null;

    /** @const @private {!Promise} */
    this.success_ = Promise.resolve();

    /** @private {boolean} */
    this.eof_ = false;
  }

  /** @override */
  onBody(callback) {
    this.onBody_ = callback;
  }

  /** @override */
  onBodyChunk(callback) {
    this.onBodyChunk_ = callback;
  }

  /** @override */
  onEnd(callback) {
    this.onEnd_ = callback;
  }

  /** @override */
  write(chunk) {
    devAssert(this.onBody_ && this.onBodyChunk_ && this.onEnd_);
    if (this.eof_) {
      throw new Error('closed already');
    }
    if (chunk) {
      this.fullHtml_.push(dev().assertString(chunk));
    }
    return this.success_;
  }

  /** @override */
  close() {
    devAssert(this.onBody_ && this.onBodyChunk_ && this.onEnd_);
    this.eof_ = true;
    this.vsync_.mutate(() => this.complete_());
    return this.success_;
  }

  /** @override */
  abort(unusedReason) {
    throw new Error('Not implemented');
  }

  /** @override */
  releaseLock() {
    throw new Error('Not implemented');
  }

  /** @override */
  get closed() {
    throw new Error('Not implemented');
  }

  /** @override */
  get desiredSize() {
    throw new Error('Not implemented');
  }

  /** @override */
  get ready() {
    throw new Error('Not implemented');
  }

  /** @private */
  complete_() {
    const fullHtml = this.fullHtml_.join('');
    const doc = new DOMParser().parseFromString(fullHtml, 'text/html');

    // Merge body.
    if (doc.body) {
      const inputBody = doc.body;
      const targetBody = this.onBody_(doc);
      let transferCount = 0;
      removeNoScriptElements(inputBody);
      while (inputBody.firstChild) {
        transferCount++;
        targetBody.appendChild(inputBody.firstChild);
      }
      if (transferCount > 0) {
        this.onBodyChunk_();
      }
    }

    // EOF.
    this.onEnd_();
  }
}

/**
 * Remove any noscript elements.
 *
 * According to the spec
 * (https://w3c.github.io/DOM-Parsing/#the-domparser-interface), with
 * `DOMParser().parseFromString`, contents of `noscript` get parsed as markup,
 * so we need to remove them manually. Why? ¯\_(ツ)_/¯ `createHTMLDocument()`
 * seems to behave the same way.
 *
 * @param {!Element} parent
 */
export function removeNoScriptElements(parent) {
  childElementsByTag(parent, 'noscript').forEach(removeElement);
}
