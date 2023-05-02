import '../amp-story-audio-sticker';

import * as Preact from '#core/dom/jsx';
import {computedStyle} from '#core/dom/style';

import {Services} from '#service';

import {
  AmpStoryStoreService,
  StateProperty,
} from '../../../amp-story/1.0/amp-story-store-service';

describes.realWin(
  'amp-story-audio-sticker-v0.1',
  {
    amp: {
      runtimeOn: true,
      extensions: ['amp-story:1.0', 'amp-story-audio-sticker:0.1'],
    },
  },
  (env) => {
    let win;
    let doc;
    let storeService;
    let stickerEl;
    let stickerImpl;

    const nextTick = () => new Promise((resolve) => win.setTimeout(resolve, 0));

    beforeEach(async () => {
      win = env.win;
      doc = win.document;

      storeService = new AmpStoryStoreService(win);
      env.sandbox
        .stub(Services, 'storyStoreServiceForOrNull')
        .returns(Promise.resolve(storeService));
      env.sandbox.stub(Services, 'storyStoreService').returns(storeService);

      const storyEl = (
        <amp-story>
          <amp-story-page>
            <amp-story-grid-layer>
              <amp-story-audio-sticker></amp-story-audio-sticker>
            </amp-story-grid-layer>
          </amp-story-page>
        </amp-story>
      );

      doc.body.appendChild(storyEl);
      stickerEl = storyEl.querySelector('amp-story-audio-sticker');
      stickerImpl = await stickerEl.getImpl();
    });

    it('should add all necessary sticker elements', async () => {
      expect(doc.querySelector('.i-amphtml-amp-story-audio-sticker-component'))
        .to.not.be.null;
      expect(doc.querySelector('.i-amphtml-amp-story-audio-sticker-tap-hint'))
        .to.not.be.null;
      expect(
        doc.querySelector('.i-amphtml-amp-story-audio-sticker-container.large')
      ).to.not.be.null;
    });

    it('should unmute the story when clicking on the audio sticker', async () => {
      await stickerImpl.layoutCallback();

      stickerEl.click();
      await nextTick();

      expect(storeService.get(StateProperty.MUTED_STATE)).to.equal(false);
      expect(
        computedStyle(
          win,
          doc.querySelector('.i-amphtml-amp-story-audio-sticker-component')
        ).getPropertyValue('display')
      ).equal('none');
    });
  }
);
