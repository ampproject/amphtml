import {AmpEvents_Enum} from '#core/constants/amp-events';

import {listen} from '#utils/event-helper';

import {TextMask} from './text-mask';

const SERVICE = 'inputmask';
const TAG = `amp-${SERVICE}`;

export class AmpInputmaskService {
  /**
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   */
  constructor(ampdoc) {
    this.ampdoc = ampdoc;

    /** @private {!Array<!TextMask>} */
    this.masks_ = [];

    /** @const */
    this.domUpdateUnlistener_ = listen(
      this.ampdoc.getRootNode(),
      AmpEvents_Enum.DOM_UPDATE,
      () => this.install()
    );
  }

  /**
   * Install the inputmask service and controllers.
   */
  install() {
    const maskElements = this.ampdoc
      .getRootNode()
      .querySelectorAll('input[mask]');
    maskElements.forEach((element) => {
      if (TextMask.isMasked(element)) {
        return;
      }
      const tm = new TextMask(element);
      this.masks_.push(tm);
    });
  }

  /**
   * Remove the inpumask service and controllers.
   */
  uninstall() {
    this.domUpdateUnlistener_();
    this.masks_.forEach((m) => m.dispose());
    this.masks_ = [];
  }
}

AMP.extension(TAG, '0.1', function (AMP) {
  AMP.registerServiceForDoc(SERVICE, function (ampdoc) {
    return new AmpInputmaskService(ampdoc);
  });
});
