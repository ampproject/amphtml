import '../amp-story-360';
import {createElementWithAttributes} from '#core/dom';

import {LocalizationService} from '#service/localization';

import {macroTask} from '#testing/helpers';

import {
  registerServiceBuilder,
  registerServiceBuilderForDoc,
} from '../../../../src/service-helpers';
import {
  Action,
  AmpStoryStoreService,
} from '../../../amp-story/1.0/amp-story-store-service';

describes.realWin(
  'amp-story-360',
  {
    amp: {
      runtimeOn: true,
      extensions: ['amp-story-360', 'amp-img'],
    },
  },
  (env) => {
    let win;
    let element;
    let threesixty;
    let storeService;
    let pageEl;

    function appendAmpImg(parent, path) {
      const ampImg = createElementWithAttributes(win.document, 'amp-img', {
        'src': path,
        'width': '7168',
        'height': '3584',
      });
      parent.appendChild(ampImg);
    }

    async function createAmpStory360(imagePath, opt_gyroscope) {
      pageEl = win.document.createElement('amp-story-page');
      pageEl.id = 'page1';
      const attrs = {
        'layout': 'fill',
        'duration': '1s',
        'heading-end': '95',
        'style': 'height: 100px',
      };

      if (opt_gyroscope) {
        attrs['controls'] = 'gyroscope';
      }

      element = createElementWithAttributes(
        win.document,
        'amp-story-360',
        attrs
      );
      if (imagePath) {
        appendAmpImg(element, imagePath);
      }
      pageEl.appendChild(element);
      win.document.body.appendChild(pageEl);

      const localizationService = new LocalizationService(win.document.body);
      registerServiceBuilderForDoc(element, 'localization', function () {
        return localizationService;
      });

      threesixty = await element.getImpl();
    }

    beforeEach(() => {
      win = env.win;

      storeService = new AmpStoryStoreService(win);
      registerServiceBuilder(win, 'story-store', function () {
        return storeService;
      });
    });

    it('should build', async () => {
      await createAmpStory360(
        '/examples/amp-story/img/SeanDoran-Quela-sol1462-edited_ver2-sm.jpg'
      );
      expect(() => {
        threesixty.layoutCallback();
      }).to.not.throw();
    });

    it('activation button should contain role="button" to prevent story page navigation', async () => {
      win.DeviceOrientationEvent.requestPermission = () => Promise.reject();

      await createAmpStory360(
        '/examples/amp-story/img/SeanDoran-Quela-sol1462-edited_ver2-sm.jpg',
        /* opt_gyroscope */ true
      );
      await threesixty.layoutCallback();
      const activationEl = pageEl.querySelector(
        '.i-amphtml-story-360-activate-button'
      );

      await macroTask();

      expect(activationEl.getAttribute('role')).to.eql('button');
    });

    it('should throw if nested amp-img is missing', async () => {
      await createAmpStory360();
      expect(() => {
        allowConsoleError(() => {
          threesixty.layoutCallback();
        });
      }).to.throw();
    });

    it('parses orientation attributes', async () => {
      await createAmpStory360(
        '/examples/amp-story/img/SeanDoran-Quela-sol1462-edited_ver2-sm.jpg'
      );
      await threesixty.layoutCallback();
      expect(threesixty.canAnimate).to.be.true;
    });

    it('should play when in view', async () => {
      await createAmpStory360(
        '/examples/img/SeanDoran-Quela-sol1462-edited_ver2-sm.jpg'
      );
      await threesixty.layoutCallback();
      await storeService.dispatch(Action.CHANGE_PAGE, {id: 'page1', index: 0});
      expect(threesixty.isPlaying_).to.be.true;
    });

    it('should respond to pause when in view', async () => {
      await createAmpStory360(
        '/examples/img/SeanDoran-Quela-sol1462-edited_ver2-sm.jpg'
      );
      await threesixty.layoutCallback();
      await storeService.dispatch(Action.CHANGE_PAGE, {id: 'page1', index: 0});
      await storeService.dispatch(Action.TOGGLE_PAUSED, false);
      expect(threesixty.isPlaying_).to.be.true;
    });

    it('should not play when out of view', async () => {
      await createAmpStory360(
        '/examples/img/SeanDoran-Quela-sol1462-edited_ver2-sm.jpg'
      );
      await threesixty.layoutCallback();
      await storeService.dispatch(Action.CHANGE_PAGE, {id: 'page1', index: 0});
      await storeService.dispatch(Action.TOGGLE_PAUSED, true);
      await storeService.dispatch(Action.CHANGE_PAGE, {
        id: 'notPage1',
        index: 1,
      });
      await storeService.dispatch(Action.TOGGLE_PAUSED, false);
      expect(threesixty.isPlaying_).to.be.false;
    });
  }
);
