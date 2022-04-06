import {AmpEvents_Enum} from '#core/constants/amp-events';
import {tryCallback} from '#core/error';

import {listen} from '#utils/event-helper';
import {devAssert} from '#utils/log';

import {
  FxBindings,
  FxObservesSignal,
  FxType, // eslint-disable-line @typescript-eslint/no-unused-vars
  getFxTypes,
} from './fx-type';
import {
  installPositionBoundFx,
  installScrollToggledFx,
} from './providers/fx-provider';

const TAG = 'amp-fx-collection';

/**
 * Bootstraps elements that have `amp-fx=<fx1 fx2>` attribute and installs
 * the specified effects on them.
 * @visibleForTesting
 */
export class AmpFxCollection {
  /**
   * @param  {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   */
  constructor(ampdoc) {
    /** @private @const {!../../../src/service/ampdoc-impl.AmpDoc} */
    this.ampdoc_ = ampdoc;

    /** @private @const {!Array<!Element>} */
    this.seen_ = [];

    Promise.all([ampdoc.whenReady(), ampdoc.whenFirstVisible()]).then(() => {
      const root = this.ampdoc_.getRootNode();
      // Scan when page becomes visible.
      this.scan_();
      // Rescan as DOM changes happen.
      listen(root, AmpEvents_Enum.DOM_UPDATE, () => this.scan_());
    });
  }

  /**
   * Scans the root for fx-enabled elements and registers them with the
   * fx provider.
   */
  scan_() {
    const elements = this.ampdoc_.getRootNode().querySelectorAll('[amp-fx]');
    elements.forEach((element) => {
      if (this.seen_.includes(element)) {
        return;
      }

      // Don't break for all components if only a subset are misconfigured.
      tryCallback(() => this.register_(element));
    });
  }

  /**
   * Registers an fx-enabled element with its requested fx providers.
   * @param {!Element} element
   */
  register_(element) {
    devAssert(element.hasAttribute('amp-fx'));
    devAssert(!this.seen_.includes(element));
    devAssert(this.ampdoc_.isVisible());

    getFxTypes(element).forEach((type) => {
      this.install_(element, type);
    });

    this.seen_.push(element);
  }

  /**
   * @param {!Element} element
   * @param {!FxType} type
   * @private
   */
  install_(element, type) {
    const {observes} = devAssert(FxBindings[type]);
    if (observes == FxObservesSignal.SCROLL_TOGGLE) {
      installScrollToggledFx(this.ampdoc_, element, type);
      return;
    }
    installPositionBoundFx(this.ampdoc_, element, type);
  }
}

AMP.extension(TAG, '0.1', (AMP) => {
  AMP.registerServiceForDoc(TAG, AmpFxCollection);
});
