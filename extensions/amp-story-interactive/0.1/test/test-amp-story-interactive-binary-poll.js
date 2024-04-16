import {Services} from '#service';
import {AmpDocSingle} from '#service/ampdoc-impl';
import {LocalizationService} from '#service/localization';

import {measureMutateElementStub} from '#testing/helpers/service';

import {
  MOCK_URL,
  addConfigToInteractive,
  getMockInteractiveData,
} from './helpers';

import {registerServiceBuilder} from '../../../../src/service-helpers';
import {AmpStoryStoreService} from '../../../amp-story/1.0/amp-story-store-service';
import {AmpStoryInteractiveBinaryPoll} from '../amp-story-interactive-binary-poll';

describes.realWin(
  'amp-story-interactive-binary-poll',
  {
    amp: true,
  },
  (env) => {
    let win;
    let ampStoryPoll;
    let storyEl;
    let xhrMock;
    let xhrJson;

    beforeEach(() => {
      win = env.win;

      env.sandbox
        .stub(Services, 'cidForDoc')
        .resolves({get: () => Promise.resolve('cid')});

      const ampStoryPollEl = win.document.createElement(
        'amp-story-interactive-binary-poll'
      );
      ampStoryPollEl.getAmpDoc = () => new AmpDocSingle(win);
      ampStoryPollEl.getResources = () => win.__AMP_SERVICES.resources.obj;
      const xhr = Services.xhrFor(win);
      xhrMock = env.sandbox.mock(xhr);
      xhrMock.expects('fetchJson').resolves({
        ok: true,
        json() {
          return Promise.resolve(xhrJson);
        },
      });

      const storeService = new AmpStoryStoreService(win);
      registerServiceBuilder(win, 'story-store', function () {
        return storeService;
      });

      const localizationService = new LocalizationService(win.document.body);
      env.sandbox
        .stub(Services, 'localizationServiceForOrNull')
        .returns(Promise.resolve(localizationService));

      storyEl = win.document.createElement('amp-story');
      const storyPage = win.document.createElement('amp-story-page');
      const gridLayer = win.document.createElement('amp-story-grid-layer');
      gridLayer.appendChild(ampStoryPollEl);
      storyPage.appendChild(gridLayer);
      storyEl.appendChild(storyPage);

      win.document.body.appendChild(storyEl);
      ampStoryPoll = new AmpStoryInteractiveBinaryPoll(ampStoryPollEl);
      env.sandbox
        .stub(ampStoryPoll, 'measureMutateElement')
        .callsFake(measureMutateElementStub);
      env.sandbox.stub(ampStoryPoll, 'mutateElement').callsFake((fn) => fn());
    });

    it('should throw an error with fewer than two options', () => {
      addConfigToInteractive(ampStoryPoll, 1);
      allowConsoleError(() => {
        expect(() => {
          ampStoryPoll.buildCallback();
        }).to.throw(/Improper number of options/);
      });
    });

    it('should not throw an error with two options', () => {
      addConfigToInteractive(ampStoryPoll, 2);
      expect(() => ampStoryPoll.buildCallback()).to.not.throw();
    });

    it('should throw an error with more than two options', () => {
      addConfigToInteractive(ampStoryPoll, 3);
      allowConsoleError(() => {
        expect(() => {
          ampStoryPoll.buildCallback();
        }).to.throw(/Improper number of options/);
      });
    });

    it('should fill the content of the options', async () => {
      ampStoryPoll.element.setAttribute('option-1-text', 'Fizz');
      ampStoryPoll.element.setAttribute('option-2-text', 'Buzz');
      await ampStoryPoll.buildCallback();
      await ampStoryPoll.layoutCallback();
      expect(ampStoryPoll.getOptionElements()[0].textContent).to.contain(
        'Fizz'
      );
      expect(ampStoryPoll.getOptionElements()[1].textContent).to.contain(
        'Buzz'
      );
    });

    it('should handle the percentage pipeline', async () => {
      xhrJson = getMockInteractiveData();

      ampStoryPoll.element.setAttribute('endpoint', 'http://localhost:8000');

      addConfigToInteractive(ampStoryPoll, 2);
      await ampStoryPoll.buildCallback();
      await ampStoryPoll.layoutCallback();

      expect(ampStoryPoll.getOptionElements()[0].textContent).to.contain('50%');
      expect(ampStoryPoll.getOptionElements()[1].textContent).to.contain('50%');
    });

    it('should handle the percentage pipeline with scrambled data', async () => {
      xhrJson = {
        options: [
          {index: 1, count: 2, selected: true},
          {index: 0, count: 8, selected: true},
        ],
      };

      ampStoryPoll.element.setAttribute('endpoint', 'http://localhost:8000');

      addConfigToInteractive(ampStoryPoll, 2);
      await ampStoryPoll.buildCallback();
      await ampStoryPoll.layoutCallback();

      expect(ampStoryPoll.getOptionElements()[0].textContent).to.contain('80%');
      expect(ampStoryPoll.getOptionElements()[1].textContent).to.contain('20%');
    });

    it('should handle the percentage pipeline with incomplete data', async () => {
      xhrJson = {
        options: [{index: 1, count: 2, selected: true}],
      };

      ampStoryPoll.element.setAttribute('endpoint', MOCK_URL);

      addConfigToInteractive(ampStoryPoll, 2);
      await ampStoryPoll.buildCallback();
      await ampStoryPoll.layoutCallback();

      expect(ampStoryPoll.getOptionElements()[0].textContent).to.contain('0%');
      expect(ampStoryPoll.getOptionElements()[1].textContent).to.contain(
        '100%'
      );
    });

    it('should handle the percentage pipeline with out of bounds data', async () => {
      xhrJson = {
        options: [
          {index: 1, count: 2, selected: true},
          {index: 2, count: 1, selected: false},
        ],
      };

      ampStoryPoll.element.setAttribute('endpoint', MOCK_URL);

      addConfigToInteractive(ampStoryPoll, 2);
      await ampStoryPoll.buildCallback();
      await ampStoryPoll.layoutCallback();

      expect(ampStoryPoll.getOptionElements()[0].textContent).to.contain('0%');
      expect(ampStoryPoll.getOptionElements()[1].textContent).to.contain(
        '100%'
      );
    });

    it('should change the font-size wih the emoji content', async () => {
      ampStoryPoll.element.setAttribute('option-1-text', '🧛');
      ampStoryPoll.element.setAttribute('option-2-text', '🧛');
      await ampStoryPoll.buildCallback();
      await ampStoryPoll.layoutCallback();
      expect(ampStoryPoll.getRootElement().getAttribute('style')).to.contain(
        '--post-select-scale-variable: 2.00'
      );
    });

    it('should change the font-size with one line content', async () => {
      ampStoryPoll.element.setAttribute('option-1-text', 'This');
      ampStoryPoll.element.setAttribute('option-2-text', 'That');
      await ampStoryPoll.buildCallback();
      await ampStoryPoll.layoutCallback();
      expect(ampStoryPoll.getRootElement().getAttribute('style')).to.contain(
        '--post-select-scale-variable: 1.14'
      );
    });

    it('should change the font-size with two line content', async () => {
      ampStoryPoll.element.setAttribute('option-1-text', 'This is one');
      ampStoryPoll.element.setAttribute('option-2-text', 'That is two');
      await ampStoryPoll.buildCallback();
      await ampStoryPoll.layoutCallback();
      expect(ampStoryPoll.getRootElement().getAttribute('style')).to.contain(
        '--post-select-scale-variable: 1.00'
      );
    });

    it('should clamp transformX of text to MIN_HORIZONTAL_TRANSFORM value', () => {
      const transformVal = ampStoryPoll.getTransformVal_(10);
      expect(transformVal).to.deep.equal(-20);
    });
  }
);
