import * as Preact from '#core/dom/jsx';
import '../amp-story-audio-sticker';

import {Services} from '#service';

import {afterRenderPromise} from '#testing/helpers';

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

    const nextTick = () => new Promise((resolve) => win.setTimeout(resolve, 0));

    function buildStory() {
      return (
        <amp-story>
          <amp-story-page>
            <amp-story-grid-layer>
              <amp-story-audio-sticker></amp-story-audio-sticker>
            </amp-story-grid-layer>
          </amp-story-page>
        </amp-story>
      );
    }

    beforeEach(() => {
      win = env.win;
      doc = win.document;

      storeService = new AmpStoryStoreService(win);
      env.sandbox
        .stub(Services, 'storyStoreServiceForOrNull')
        .returns(Promise.resolve(storeService));
      env.sandbox.stub(Services, 'storyStoreService').returns(storeService);

      win.document.body.appendChild(buildStory());
    });

    it('should unmute the story when clicking on the audio sticker', async () => {
      await afterRenderPromise();

      const stickerEl = doc.querySelector('amp-story-audio-sticker');
      stickerEl.click();

      await nextTick();

      expect(storeService.get(StateProperty.MUTED_STATE)).to.equal(false);
    });
  }
);
