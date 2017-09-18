import {Builder} from './web-animations';
import {Services} from '../../../src/services';
import {registerServiceBuilder} from '../../../src/service';


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
    this.resources_ = Services.resourcesForDoc(ampdoc);
  }


  /**
   * @return {!Builder}
   */
  createBuilder() {
    return new Builder(
        this.ampdoc_.win,
        this.ampdoc_.getRootNode(),
        this.ampdoc_.getUrl(),
        this.vsync_,
        this.resources_);
  }
}
