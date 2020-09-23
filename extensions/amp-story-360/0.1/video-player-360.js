import {whenUpgradedToCustomElement} from '../../../src/dom';
import {dev, user} from '../../../src/log';
import {CommonSignals} from '../../../src/common-signals';
import {TAG, CameraAnimation} from './amp-story-360';
import {Renderer} from '../../../third_party/zuho/zuho';
import {listen} from '../../../src/event-helper';

export class VideoPlayer360 {
  constructor(ampStory360, ampVideoEl) {
    this.ampStory360 = ampStory360;
    this.ampVideoEl = ampVideoEl;
  }
  /** @private */
  initLayout_() {
    return whenUpgradedToCustomElement(this.ampVideoEl)
      .then(() => {
        return this.ampVideoEl.signals().whenSignal(CommonSignals.LOAD_END);
      })
      .then(
        () => {
          listen(this.ampVideoEl, 'playing', () => {
            this.ampStory360.renderer_ = new Renderer(this.ampStory360.canvas_);
            this.ampStory360.renderer_.setImageOrientation(
              this.ampStory360.sceneHeading_,
              this.ampStory360.scenePitch_,
              this.ampStory360.sceneRoll_
            );
            this.ampStory360.renderer_.setImage(
              dev().assertElement(this.ampVideoEl.querySelector('video'))
            );
            this.ampStory360.renderer_.resize();
            if (this.ampStory360.orientations_.length < 1) {
              return;
            }
            this.ampStory360.renderInitialPosition_();
            this.ampStory360.isReady_ = true;
            if (this.ampStory360.isPlaying_) {
              this.ampStory360.animate_();
            }
          });
        },
        () => {
          user().error(TAG, 'Failed to load the amp-video.');
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
      if (!this.ampStory360.isPlaying_) {
        this.ampStory360.renderer_.render(false);
        return;
      }
      const nextOrientation = this.ampStory360.animation_.getNextOrientation();
      // mutateElement causes inaccurate animation speed here, so we use rAF.
      this.ampStory360.win.requestAnimationFrame(() => {
        if (nextOrientation) {
          this.ampStory360.renderer_.setCamera(
            nextOrientation.rotation,
            nextOrientation.scale
          );
        }
        this.ampStory360.renderer_.setImage(
          dev().assertElement(this.ampVideoEl.querySelector('video'))
        );

        this.ampStory360.renderer_.render(true);
        loop();
      });
    };
    this.ampStory360.mutateElement(() => loop());
  }
}
