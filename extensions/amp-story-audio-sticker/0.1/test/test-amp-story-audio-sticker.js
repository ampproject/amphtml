import * as Preact from '#core/dom/jsx';
import {closestAncestorElementBySelector} from '#core/dom/query';
import {computedStyle} from '#core/dom/style';

import {Services} from '#service';

import {
  Action,
  AmpStoryStoreService,
  StateProperty,
} from '../../../amp-story/1.0/amp-story-store-service';
import {HIDE_STICKER_DELAY_DURATION} from '../amp-story-audio-sticker';

describes.realWin(
  'amp-story-audio-sticker-v0.1',
  {
    amp: {
      runtimeOn: true,
      extensions: ['amp-story:1.0', 'amp-story-audio-sticker:0.1'],
    },
  },
  (env) => {
    const activePageId = 'page-1';

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
      storeService.subscribe(StateProperty.MUTED_STATE, (muted) => {
        const storeEl = doc.querySelector('amp-story');
        muted
          ? storeEl.setAttribute('muted', '')
          : storeEl.removeAttribute('muted');
      });
      env.sandbox
        .stub(Services, 'storyStoreServiceForOrNull')
        .returns(Promise.resolve(storeService));
      env.sandbox.stub(Services, 'storyStoreService').returns(storeService);

      const storyEl = (
        <amp-story>
          <amp-story-page id="page-1">
            <amp-story-grid-layer>
              <amp-story-audio-sticker></amp-story-audio-sticker>
            </amp-story-grid-layer>
          </amp-story-page>
          <amp-story-page id="page-2">
            <amp-story-grid-layer>
              <amp-story-audio-sticker></amp-story-audio-sticker>
            </amp-story-grid-layer>
          </amp-story-page>
        </amp-story>
      );
      doc.body.appendChild(storyEl);

      stickerEl = doc.querySelector('amp-story-audio-sticker');
      stickerImpl = await stickerEl.getImpl();

      env.sandbox
        .stub(stickerImpl, 'mutateElement')
        .callsFake((fn) => Promise.resolve(fn()));
    });

    it('should add all necessary sticker elements', async () => {
      expect(
        doc.querySelectorAll('.i-amphtml-amp-story-audio-sticker-component')
          .length
      ).equal(2);
      expect(
        doc.querySelectorAll('.i-amphtml-amp-story-audio-sticker-tap-hint')
          .length
      ).equal(2);
      expect(
        doc.querySelectorAll(
          '.i-amphtml-amp-story-audio-sticker-container.large'
        ).length
      ).equal(2);
      expect(
        doc.querySelectorAll('amp-story-audio-sticker-pretap').length
      ).equal(2);
      expect(
        doc.querySelectorAll('amp-story-audio-sticker-posttap').length
      ).equal(2);
    });

    describe('visibilities of different sticker components after a click on the audio sticker', () => {
      beforeEach(async () => {
        await stickerImpl.layoutCallback();

        stickerEl.click();
        await nextTick();
      });

      it('should unmute the story and switch from pretap to posttap state for all stickers', async () => {
        expect(storeService.get(StateProperty.MUTED_STATE)).equal(false);

        doc
          .querySelectorAll('.i-amphtml-amp-story-audio-sticker-tap-hint')
          .forEach((el) =>
            expect(computedStyle(win, el).getPropertyValue('opacity')).equal(
              '0'
            )
          );
        doc
          .querySelectorAll('amp-story-audio-sticker-pretap')
          .forEach((el) =>
            expect(computedStyle(win, el).getPropertyValue('opacity')).equal(
              '0'
            )
          );
        doc
          .querySelectorAll('amp-story-audio-sticker-posttap')
          .forEach((el) =>
            expect(computedStyle(win, el).getPropertyValue('opacity')).equal(
              '1'
            )
          );
      });

      it('should switch from posttap back to pretap state for all stickers', async () => {
        storeService.dispatch(Action.TOGGLE_MUTED, true);
        await nextTick();

        doc
          .querySelectorAll('.i-amphtml-amp-story-audio-sticker-tap-hint')
          .forEach((el) =>
            expect(computedStyle(win, el).getPropertyValue('opacity')).equal(
              '1'
            )
          );
        doc.querySelectorAll('amp-story-audio-sticker-pretap').forEach((el) => {
          // console.log(el.style);
          expect(computedStyle(win, el).getPropertyValue('opacity')).equal('1');
        });
        doc
          .querySelectorAll('amp-story-audio-sticker-posttap')
          .forEach((el) =>
            expect(computedStyle(win, el).getPropertyValue('opacity')).equal(
              '0'
            )
          );
      });
    });

    it('should hide the posttap sticker after 4 seconds or immediately if the sticker is on the active page or not', async () => {
      const clock = env.sandbox.useFakeTimers();
      env.sandbox
        .stub(storeService, 'get')
        .withArgs(StateProperty.CURRENT_PAGE_ID)
        .returns(activePageId);

      await stickerImpl.layoutCallback();

      stickerEl.click();
      await nextTick();

      doc.querySelectorAll('amp-story-audio-sticker').forEach((el) => {
        const currentPageId = closestAncestorElementBySelector(
          el,
          'amp-story-page'
        ).getAttribute('id');
        if (currentPageId === activePageId) {
          clock.tick(HIDE_STICKER_DELAY_DURATION);
        }
        expect(el.classList.contains('hide')).equal(true);
      });
    });
  }
);
