import {Services} from '#service';

import {installWebAnimationsIfNecessary} from './install-polyfill';
import {WebAnimationBuilderOptionsDef} from './web-animation-types';
import {Builder} from './web-animations';

export class WebAnimationService {
  /**
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   */
  constructor(ampdoc) {
    /** @private @const */
    this.ampdoc_ = ampdoc;

    /** @private @const */
    this.vsync_ = Services.vsyncFor(ampdoc.win);

    /** @private @const */
    this.owners_ = Services.ownersForDoc(ampdoc);
  }

  /**
   * @param {!WebAnimationBuilderOptionsDef} options
   * @return {!Promise<Builder>}
   */
  createBuilder(options) {
    return installWebAnimationsIfNecessary(this.ampdoc_).then(
      () =>
        new Builder(
          this.ampdoc_.win,
          this.ampdoc_.getRootNode(),
          this.ampdoc_.getUrl(),
          this.vsync_,
          this.owners_,
          options
        )
    );
  }
}
