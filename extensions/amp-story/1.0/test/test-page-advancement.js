/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
  AdvancementConfig,
  ManualAdvancement,
  MediaBasedAdvancement,
  TimeBasedAdvancement,
} from '../page-advancement';
import {StateProperty} from '../amp-story-store-service';
import {htmlFor} from '../../../../src/static-template';

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
