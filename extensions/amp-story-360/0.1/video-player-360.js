import {Services} from '../../../src/services';
import {closest, whenUpgradedToCustomElement} from '../../../src/dom';
import {dev, user, userAssert} from '../../../src/log';
import {CommonSignals} from '../../../src/common-signals';
import {TAG, CameraAnimation} from './amp-story-360';
import {Matrix, Renderer} from '../../../third_party/zuho/zuho';

export class VideoPlayer360 {
  constructor(ampStory360, ampImgEl) {
    this.ampStory360 = ampStory360;
    this.ampImgEl = ampImgEl;
  }
  /** @private */
  initLayout_() {
    const owners = Services.ownersForDoc(this.ampStory360.element);
    owners.setOwner(this.ampImgEl, this.ampStory360.element);
    owners.scheduleLayout(this.ampStory360.element, this.ampImgEl);
    return whenUpgradedToCustomElement(this.ampImgEl)
      .then(() => {
        return this.ampImgEl.signals().whenSignal(CommonSignals.LOAD_END);
      })
      .then(
        () => {
          this.ampStory360.renderer_ = new Renderer(this.ampStory360.canvas_);
          const img = this.checkImageReSize_(
            dev().assertElement(this.ampStory360.element.querySelector('img'))
          );
          this.ampStory360.renderer_.setImageOrientation(
            this.ampStory360.sceneHeading_,
            this.ampStory360.scenePitch_,
            this.ampStory360.sceneRoll_
          );
          this.ampStory360.renderer_.setImage(img);
          this.ampStory360.renderer_.resize();
          if (this.ampStory360.orientations_.length < 1) {
            return;
          }
          this.ampStory360.renderInitialPosition_();
          this.ampStory360.isReady_ = true;
          if (this.ampStory360.isPlaying_) {
            this.ampStory360.animate_();
          }
        },
        () => {
          user().error(TAG, 'Failed to load the amp-img.');
        }
      );
  }
  /** @private */
  animate_() {
    if (!this.ampStory360.animation_) {
      this.ampStory360.animation_ = new CameraAnimation(
        this.ampStory360.duration_,
        this.ampStory360.orientations_
      );
    }
    const loop = () => {
      if (
        !this.ampStory360.isPlaying_ ||
        !this.ampStory360.animation_ ||
        this.ampStory360.gyroscopeControls_
      ) {
        this.ampStory360.renderer_.render(false);
        return;
      }
      const nextOrientation = this.ampStory360.animation_.getNextOrientation();
      if (nextOrientation) {
        // mutateElement causes inaccurate animation speed here, so we use rAF.
        this.ampStory360.win.requestAnimationFrame(() => {
          this.ampStory360.renderer_.setCamera(
            nextOrientation.rotation,
            nextOrientation.scale
          );
          this.ampStory360.renderer_.render(true);
          loop();
        });
      } else {
        this.ampStory360.isPlaying_ = false;
        this.ampStory360.renderer_.render(false);
        return;
      }
    };
    this.ampStory360.mutateElement(() => loop());
  }
}
