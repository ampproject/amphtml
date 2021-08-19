import {devAssert, devAssertElement} from '#core/assert';
import {Deferred} from '#core/data-structures/promise';

import {removeNoScriptElements} from './dom-writer';

/**
 * @param {!Function} cb
 * @return {!Promise}
 */
const DEFAULT_TRANSFER_THROTTLE_FUNC = (cb) => Promise.resolve(cb());

export class DomTransformStream {
  /**
   * @param {!Window} win
   * @param {(function(!Function):!Promise)=} opt_transferThrottleFunc
   */
  constructor(win, opt_transferThrottleFunc) {
    const headDefer = new Deferred();
    /**
     * Resolves when head has been written to in memory document.
     * @const @private {!Promise<!Element>}
     */
    this.headPromise_ = headDefer.promise;

    /** @const @private {!function(!Element)} */
    this.headResolver_ = headDefer.resolve;

    const transferDefer = new Deferred();
    /**
     * Resovles when complete doc has been transfered to the target
     * body.
     * @const @private {!Promise}
     */
    this.bodyTransferPromise_ = transferDefer.promise;

    /** @const @private {!function(!Promise)} */
    this.bodyTransferResolver_ = transferDefer.resolve;

    /** @private {?Element} */
    this.detachedBody_ = null;

    const targetBodyDefer = new Deferred();
    /**
     * Resolves when target body is ready to receive elements.
     * @private {!Promise<!Element>}
     */
    this.targetBodyPromise_ = targetBodyDefer.promise;

    /** @const @private {!function(!Element)} */
    this.targetBodyResolver_ = targetBodyDefer.resolve;

    /** @private {?Promise} */
    this.currentChunkTransferPromise_ = null;

    /** @private {boolean} */
    this.shouldTransfer_ = false;

    /** @private @const */
    this.transferThrottle_ =
      opt_transferThrottleFunc || DEFAULT_TRANSFER_THROTTLE_FUNC;
  }

  /**
   * Callback passed into DetachedDomStream constructor. Receives updated
   * document everytime a new chunk is written.
   * Resolves headPromise when body is available, and streams to body iff
   * bodyTransfer() has been called.
   * @param {!Document} detachedDoc
   */
  onChunk(detachedDoc) {
    // <body> is newly formed.
    if (!this.detachedBody_ && detachedDoc.body) {
      this.detachedBody_ = detachedDoc.body;
      this.headResolver_(devAssertElement(detachedDoc.head));
    }

    // If bodyTransfer has already been called, keep transferring on new chunks.
    if (this.shouldTransfer_) {
      this.transferBodyChunk_();
    }
  }

  /**
   * Callback passed into DetachedDomStream constructor. Called with complete
   * doc when stream is closed.
   * Schedules final transfer, then resovles body complete promise.
   * @param {!Document} unusedCompleteDoc
   */
  onEnd(unusedCompleteDoc) {
    this.bodyTransferResolver_(this.transferBodyChunk_());
  }

  /**
   * Promise that will resolve with <head> when available.
   * @return {!Promise<!Element>}
   */
  waitForHead() {
    return this.headPromise_;
  }

  /**
   * Start the body transfer process. Should only be called once.
   * @param {!Element} targetBody body element to be appended to.
   * @return {!Promise} resolves when doc has been fully transferred.
   */
  transferBody(targetBody) {
    devAssertElement(
      targetBody,
      'No target body given to DomTransformStream.transferBody'
    );

    devAssert(
      !this.shouldTransfer_,
      'DomTransformStream.transferBody should only be called once'
    );

    this.shouldTransfer_ = true;
    this.targetBodyResolver_(targetBody);

    this.headPromise_.then(() => {
      const attrs = this.detachedBody_.attributes;
      for (let i = 0; i < attrs.length; i++) {
        const {name, value} = attrs[i];
        targetBody.setAttribute(name, value);
      }
    });

    this.transferBodyChunk_();

    return this.bodyTransferPromise_;
  }

  /**
   * Transfers available body elements in vsync cycle.
   * @return {!Promise}
   */
  transferBodyChunk_() {
    if (this.currentChunkTransferPromise_) {
      return this.currentChunkTransferPromise_;
    }

    this.currentChunkTransferPromise_ = Promise.all([
      this.targetBodyPromise_,
      this.headPromise_,
    ]).then((resolvedElements) => {
      const transferThrottle = this.transferThrottle_;
      return transferThrottle(() => {
        this.currentChunkTransferPromise_ = null;
        const targetBody = resolvedElements[0];
        removeNoScriptElements(devAssertElement(this.detachedBody_));
        while (this.detachedBody_.firstChild) {
          targetBody.appendChild(this.detachedBody_.firstChild);
        }
      });
    });

    return this.currentChunkTransferPromise_;
  }
}
