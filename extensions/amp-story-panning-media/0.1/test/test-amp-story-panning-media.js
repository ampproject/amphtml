import '../amp-story-panning-media';
import {createElementWithAttributes} from '#core/dom';

import {afterRenderPromise} from '#testing/helpers';

import {registerServiceBuilder} from '../../../../src/service-helpers';
import {
  Action,
  AmpStoryStoreService,
} from '../../../amp-story/1.0/amp-story-store-service';

describes.realWin(
  'amp-story-panning-media',
  {
    amp: {
      runtimeOn: true,
      extensions: ['amp-story-panning-media', 'amp-img'],
    },
  },
  (env) => {
    let win;
    let element;
    let panningMedia;
    let storeService;

    function appendAmpImg(parent, path) {
      const ampImg = createElementWithAttributes(win.document, 'amp-img', {
        'src': path,
        'width': '4000',
        'height': '3059',
        'layout': 'fill',
      });
      parent.appendChild(ampImg);
    }

    async function createAmpStoryPanningMedia(imagePath, attributes = {}) {
      const pageEl = win.document.createElement('amp-story-page');
      pageEl.id = 'page1';
      element = createElementWithAttributes(
        win.document,
        'amp-story-panning-media',
        {
          'layout': 'fill',
          ...attributes,
        }
      );
      if (imagePath) {
        appendAmpImg(element, imagePath);
      }
      pageEl.appendChild(element);
      win.document.body.appendChild(pageEl);

      panningMedia = await element.getImpl();
    }

    beforeEach(() => {
      win = env.win;

      storeService = new AmpStoryStoreService(win);
      registerServiceBuilder(win, 'story-store', function () {
        return storeService;
      });
      storeService.dispatch(Action.SET_PAGE_SIZE, {
        width: 700,
        height: 1000,
      });
    });

    it('should build', async () => {
      await createAmpStoryPanningMedia(
        '/examples/amp-story/img/conservatory-coords.jpg'
      );
      expect(() => panningMedia.layoutCallback()).to.not.throw();
    });

    it('should throw if nested amp-img is missing', async () => {
      await createAmpStoryPanningMedia();
      expect(() =>
        allowConsoleError(() => panningMedia.layoutCallback())
      ).to.throw('Element expected: null');
    });

    it('sets transform of amp-img on page change', async () => {
      const attributes = {
        'group-id': 'group-1',
        'data-x': '50%',
        'data-y': '50%',
        'data-zoom': 2,
      };
      await createAmpStoryPanningMedia(
        '/examples/amp-story/img/conservatory-coords.jpg',
        attributes
      );
      await panningMedia.layoutCallback();
      await storeService.dispatch(Action.CHANGE_PAGE, {id: 'page1', index: 0});
      await afterRenderPromise(win);
      expect(panningMedia.element.firstChild.style.transform).to.equal(
        `translate3d(${attributes['data-x']}, ${attributes['data-y']}, ${
          (attributes['data-zoom'] - 1) / attributes['data-zoom']
        }px)`
      );
    });

    it('calculates zoom with lock-bounds', async () => {
      const attributes = {
        'group-id': 'group-1',
        'data-zoom': 0.2,
        'lock-bounds': '',
      };
      await createAmpStoryPanningMedia(
        '/examples/amp-story/img/conservatory-coords.jpg',
        attributes
      );
      await storeService.dispatch(Action.CHANGE_PAGE, {id: 'page1', index: 0});
      await panningMedia.layoutCallback();
      await afterRenderPromise(win);
      expect(panningMedia.element.firstChild.style.transform).to.equal(
        `translate3d(0%, 0%, 0px)`
      );
    });
  }
);
