import {devAssert} from '#core/assert';

export class DetachedDomStream {
  /**
   * @param {Window} win
   * @param {function(Document):void} onChunk
   * @param {function(Document):void} onEnd
   */
  constructor(win, onChunk, onEnd) {
    /** @const @private {function(Document):void} */
    this.onChunk_ = onChunk;

    /** @const @private {function(Document):void} */
    this.onEnd_ = onEnd;

    /** @const @private {Document} */
    this.detachedDoc_ = win.document.implementation.createHTMLDocument('');
    this.detachedDoc_.open();

    /** @private {boolean} */
    this.eof_ = false;
  }

  /**
   * Write chunk into detached doc, and call given chunk cb.
   * @public
   * @param {string} chunk
   */
  write(chunk) {
    devAssert(!this.eof_, 'Detached doc already closed.');

    if (chunk) {
      this.detachedDoc_.write(chunk);
    }
    this.onChunk_(this.detachedDoc_);
  }

  /**
   * Called when stream is finished. Close the detached doc, and call cb.
   * @public
   */
  close() {
    this.eof_ = true;
    this.detachedDoc_.close();
    this.onEnd_(this.detachedDoc_);
  }
}
