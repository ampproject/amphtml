import {htmlFor} from '#core/dom/static-template';

import {StateProperty} from '../amp-story-store-service';
import {
  AdvancementConfig,
  ManualAdvancement,
  MediaBasedAdvancement,
  TimeBasedAdvancement,
} from '../page-advancement';

describes.realWin('page-advancement', {amp: true}, (env) => {
  let html;
  let win;

  beforeEach(() => {
    html = htmlFor(env.win.document);
    win = env.win;
  });

  describe('forElement', () => {
    describe('ManualAdvancement', () => {
      it('should return a manual advancement for an amp-story element', () => {
        const storyEl = win.document.createElement('amp-story');
        const advancement = AdvancementConfig.forElement(win, storyEl);

        expect(advancement).to.be.instanceOf(ManualAdvancement);
      });

      it('should not return a manual advancement for a non amp-story element', () => {
        const pageEl = win.document.createElement('amp-story-page');
        const advancement = AdvancementConfig.forElement(win, pageEl);

        expect(advancement).to.not.be.instanceOf(ManualAdvancement);
      });

      it('should unpause on visibilitychange', async () => {
        // Fix #28425, on player swipe doesn't get touchend so UI doesn't show.
        const storyEl = win.document.createElement('amp-story');
        const pageEl = win.document.createElement('amp-story-page');
        storyEl.appendChild(pageEl);
        const advancement = new ManualAdvancement(win, storyEl);

        advancement.onTouchstart_({target: pageEl});

        expect(advancement.storeService_.get(StateProperty.PAUSED_STATE)).to.be
          .true;

        // Update visibility to visible.
        env.sandbox.stub(advancement.ampdoc_, 'isVisible').returns(true);
        advancement.ampdoc_.visibilityStateHandlers_.fire();

        expect(advancement.storeService_.get(StateProperty.PAUSED_STATE)).to.be
          .false;
      });

      it('should not hide system UI on visibilitychange', async () => {
        // Fix #28425, on player swipe doesn't get touchend so UI doesn't show.
        const storyEl = win.document.createElement('amp-story');
        const pageEl = win.document.createElement('amp-story-page');
        storyEl.appendChild(pageEl);
        const advancement = new ManualAdvancement(win, storyEl);

        advancement.onTouchstart_({target: pageEl});

        expect(!!advancement.timeoutId_).to.be.true;

        // Update visibility to visible.
        env.sandbox.stub(advancement.ampdoc_, 'isVisible').returns(true);
        advancement.ampdoc_.visibilityStateHandlers_.fire();

        // Check system UI is not visible and timeout was cancelled.
        expect(
          advancement.storeService_.get(
            StateProperty.SYSTEM_UI_IS_VISIBLE_STATE
          )
        ).to.be.true;
        expect(!!advancement.timeoutId_).to.be.false;
      });

      it('should handle click event on amp-story-subscriptions', async () => {
        const storyEl = win.document.createElement('amp-story');
        const pageEl = win.document.createElement('amp-story-page');
        const subscriptionsEl = win.document.createElement(
          'amp-story-subscriptions'
        );
        storyEl.appendChild(pageEl);
        storyEl.appendChild(subscriptionsEl);
        const advancement = new ManualAdvancement(win, storyEl);

        expect(advancement.shouldHandleEvent_({target: subscriptionsEl})).to.be
          .true;
      });
    });

    describe('TimeBasedAdvancement', () => {
      it('should return a time advancement from ms unit', () => {
        const pageEl = html`
          <amp-story-page auto-advance-after="1000ms"> </amp-story-page>
        `;
        const advancement = AdvancementConfig.forElement(win, pageEl);

        expect(advancement).to.be.instanceOf(TimeBasedAdvancement);
      });

      it('should return a time advancement from s unit', () => {
        const pageEl = html`
          <amp-story-page auto-advance-after="3s"> </amp-story-page>
        `;
        const advancement = AdvancementConfig.forElement(win, pageEl);

        expect(advancement).to.be.instanceOf(TimeBasedAdvancement);
      });

      it('should not return a time advancement if no unit', () => {
        const pageEl = html`
          <amp-story-page auto-advance-after="3"> </amp-story-page>
        `;
        const advancement = AdvancementConfig.forElement(win, pageEl);

        expect(advancement).to.not.be.instanceOf(TimeBasedAdvancement);
      });

      it('should not return a time advancement if random string', () => {
        const pageEl = html`
          <amp-story-page auto-advance-after="idkwhatimdoing"> </amp-story-page>
        `;
        const advancement = AdvancementConfig.forElement(win, pageEl);

        expect(advancement).to.not.be.instanceOf(TimeBasedAdvancement);
      });

      it('should update delayMs_ when updateTimeDelay() is called', () => {
        const pageEl = html`
          <amp-story-page auto-advance-after="3s"> </amp-story-page>
        `;
        const advancement = AdvancementConfig.forElement(win, pageEl);
        expect(advancement.delayMs_).to.be.equal(3000);

        advancement.updateTimeDelay('5s');

        expect(advancement.delayMs_).to.be.above(4500).and.below(5500);
        expect(advancement.remainingDelayMs_).to.be.equal(null);
      });

      it('should update remainingDelayMs_ when updateTimeDelay() is called', () => {
        const pageEl = html`
          <amp-story-page auto-advance-after="3s"> </amp-story-page>
        `;
        const advancement = AdvancementConfig.forElement(win, pageEl);
        // Simulate a pause after 1 second.
        advancement.start();
        advancement.startTimeMs_ -= 1000;
        advancement.stop(true /** canResume */);
        expect(advancement.remainingDelayMs_).to.be.above(1500).and.below(2500);

        advancement.updateTimeDelay('5s');

        expect(advancement.remainingDelayMs_).to.be.above(3500).and.below(4500);
      });

      it('should not keep a remainingDelayMs_ if will not resume', () => {
        const pageEl = html`
          <amp-story-page auto-advance-after="3s"> </amp-story-page>
        `;
        const advancement = AdvancementConfig.forElement(win, pageEl);
        // Simulate a pause after 1 second.
        advancement.start();
        advancement.startTimeMs_ -= 1000;
        advancement.stop(false /** canResume */);
        expect(advancement.remainingDelayMs_).to.be.null;
      });

      it('should return progress 0 if stopped and will not resume, then start again', () => {
        const pageEl = html`
          <amp-story-page auto-advance-after="3s"> </amp-story-page>
        `;
        const advancement = AdvancementConfig.forElement(win, pageEl);
        // Simulate a pause after 1 second.
        advancement.start();
        advancement.startTimeMs_ -= 1000;
        advancement.stop(false /** canResume */);
        advancement.start();
        // Progress of ~0
        expect(advancement.getProgress()).to.be.below(0.1);
      });

      it('should return progress > 0 if stopped and will resume', () => {
        const pageEl = html`
          <amp-story-page auto-advance-after="3s"> </amp-story-page>
        `;
        const advancement = AdvancementConfig.forElement(win, pageEl);
        // Simulate a pause after 1 second.
        advancement.start();
        advancement.startTimeMs_ -= 1000;
        advancement.stop(true /** canResume */);
        advancement.start();
        // Progress of ~0.33
        expect(advancement.getProgress()).to.be.above(0.3);
        expect(advancement.getProgress()).to.be.below(0.4);
      });
    });

    describe('MediaBasedAdvancement', () => {
      it('should return a media advancement for amp-video with id', () => {
        const pageEl = html`
          <amp-story-page auto-advance-after="video-id">
            <amp-story-grid-layer>
              <amp-video id="video-id"></amp-video>
            </amp-story-grid-layer>
          </amp-story-page>
        `;
        const advancement = AdvancementConfig.forElement(win, pageEl);

        expect(advancement).to.be.instanceOf(MediaBasedAdvancement);
      });

      it('should return a media advancement for amp-video with data-id', () => {
        const pageEl = html`
          <amp-story-page auto-advance-after="video-id">
            <amp-story-grid-layer>
              <amp-video data-id="video-id"></amp-video>
            </amp-story-grid-layer>
          </amp-story-page>
        `;
        const advancement = AdvancementConfig.forElement(win, pageEl);

        expect(advancement).to.be.instanceOf(MediaBasedAdvancement);
      });

      it('should return a media advancement for amp-audio with id', () => {
        const pageEl = html`
          <amp-story-page auto-advance-after="audio-id">
            <amp-story-grid-layer>
              <amp-audio id="audio-id"></amp-audio>
            </amp-story-grid-layer>
          </amp-story-page>
        `;
        const advancement = AdvancementConfig.forElement(win, pageEl);

        expect(advancement).to.be.instanceOf(MediaBasedAdvancement);
      });

      it('should return a media advancement for amp-audio with data-id', () => {
        const pageEl = html`
          <amp-story-page auto-advance-after="audio-id">
            <amp-story-grid-layer>
              <amp-audio data-id="audio-id"></amp-audio>
            </amp-story-grid-layer>
          </amp-story-page>
        `;
        const advancement = AdvancementConfig.forElement(win, pageEl);

        expect(advancement).to.be.instanceOf(MediaBasedAdvancement);
      });

      it('should return a media advancement for amp-story-page with background audio', () => {
        const pageEl = html`
          <amp-story-page
            id="story-id"
            auto-advance-after="story-id"
            background-audio="foo.mp3"
          >
          </amp-story-page>
        `;
        const advancement = AdvancementConfig.forElement(win, pageEl);

        expect(advancement).to.be.instanceOf(MediaBasedAdvancement);
      });

      it('should not return a media based advancement for other elements', () => {
        const pageEl = html`
          <amp-story-page auto-advance-after="div-id">
            <amp-story-grid-layer>
              <div-id="div-id"></div>
            </amp-story-grid-layer>
          </amp-story-page>
        `;
        const advancement = AdvancementConfig.forElement(win, pageEl);

        expect(advancement).to.not.be.instanceOf(MediaBasedAdvancement);
      });

      it('should not return a media based advancement if id does not exist', () => {
        const pageEl = html`
          <amp-story-page auto-advance-after="unknown-id">
            <amp-story-grid-layer>
              <amp-video id="video-id"></amp-video>
            </amp-story-grid-layer>
          </amp-story-page>
        `;
        const advancement = AdvancementConfig.forElement(win, pageEl);

        expect(advancement).to.not.be.instanceOf(MediaBasedAdvancement);
      });
    });
  });
});
