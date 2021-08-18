import {RE_ALPHA} from '../../constants';

const RE_NUMDASH = /[0-9\-].*/;

export class ActiveToolsMonitor {
  /**
   * Creates an instance of ActiveToolsMonitor.
   */
  constructor() {
    this.activePcos_ = {};
  }

  /**
   * @param {*} widget
   * @return {void}
   */
  record(widget) {
    // Get the "clean" PCO (no numbers or dashes) from the widget.
    const pco = (widget.id || widget.pco || '').replace(RE_NUMDASH, '');

    // PCOs must be alpha strings, and we don't want duplicates.
    if (!pco || this.activePcos_[pco] || !RE_ALPHA.test(pco)) {
      return;
    }

    this.activePcos_[pco] = pco;
  }

  /**
   * @param {*} productCode
   * @return {void}
   */
  recordProductCode(productCode) {
    // Get the "clean" PCO (no numbers or dashes) from the widget.
    const pco = productCode;

    // PCOs must be alpha strings, and we don't want duplicates.
    if (!pco || this.activePcos_[pco] || !RE_ALPHA.test(pco)) {
      return;
    }

    this.activePcos_[pco] = pco;
  }

  /**
   * @return {!Array}
   */
  getActivePcos() {
    return Object.keys(this.activePcos_);
  }
}
