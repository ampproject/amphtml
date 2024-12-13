import {Deferred} from '#core/data-structures/promise';
import * as Preact from '#core/dom/jsx';
import {closestAncestorElementBySelector} from '#core/dom/query';
import {computedStyle} from '#core/dom/style';

import {Services} from '#service';

import {
  Action,
  AmpStoryStoreService,
  StateProperty,
} from '../../../amp-story/1.0/amp-story-store-service';
import {} from '../amp-story-audio-sticker';

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

      const storyEl = (
        <amp-story style="--story-audio-sticker-outline-color:rgb(0, 200, 0)">
          <amp-story-page id="page-1">
            <amp-story-grid-layer>
              <amp-story-audio-sticker sticker-style="outline"></amp-story-audio-sticker>
            </amp-story-grid-layer>
          </amp-story-page>
          <amp-story-page id="page-2">
            <amp-story-grid-layer>
              <amp-story-audio-sticker></amp-story-audio-sticker>
            </amp-story-grid-layer>
          </amp-story-page>
          <div class="i-amphtml-system-layer-host"></div>
        </amp-story>
      );
      doc.body.appendChild(storyEl);

      storeService = new AmpStoryStoreService(win);
      storeService.subscribe(StateProperty.MUTED_STATE, (muted) => {
        muted
          ? storyEl.setAttribute('muted', '')
          : storyEl.removeAttribute('muted');
      });
      env.sandbox
        .stub(Services, 'storyStoreServiceForOrNull')
        .returns(Promise.resolve(storeService));
      env.sandbox.stub(Services, 'storyStoreService').returns(storeService);

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
          '.i-amphtml-amp-story-audio-sticker-container.small'
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

        // Wait until the animation is finished to check the opacity value.
        const deferred = new Deferred();
        setTimeout(() => {
          doc
            .querySelectorAll('.i-amphtml-amp-story-audio-sticker-tap-hint')
            .forEach((el) =>
              expect(computedStyle(win, el).getPropertyValue('opacity')).equal(
                '1'
              )
            );
          deferred.resolve();
        }, 750);

        doc.querySelectorAll('amp-story-audio-sticker-pretap').forEach((el) => {
          expect(computedStyle(win, el).getPropertyValue('opacity')).equal('1');
        });
        doc
          .querySelectorAll('amp-story-audio-sticker-posttap')
          .forEach((el) =>
            expect(computedStyle(win, el).getPropertyValue('opacity')).equal(
              '0'
            )
          );
        return deferred.promise;
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
        const pageEl = closestAncestorElementBySelector(el, 'amp-story-page');
        if (pageEl.hasAttribute('active')) {
          clock.tick(4000);
        }
        expect(computedStyle(win, el).getPropertyValue('opacity')).equal('0');
      });
    });

    it('should override the default style color if the custom color is in valid RGB/RGBA format ', async () => {
      await stickerImpl.layoutCallback();
      await nextTick();

      const stickerWithOutline = doc.querySelector(
        'amp-story-audio-sticker[sticker-style="outline"]'
      );
      expect(
        computedStyle(win, stickerWithOutline).getPropertyValue(
          '--story-audio-sticker-outline-color'
        )
      ).equal('rgb(0, 200, 0)');
    });
  }
);
