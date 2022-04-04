import {Services} from '#service';
import {AmpDocSingle} from '#service/ampdoc-impl';
import {LocalizationService} from '#service/localization';

import {measureMutateElementStub} from '#testing/helpers/service';

import {
  addConfigToInteractive,
  getMockIncompleteData,
  getMockInteractiveData,
  getMockOutOfBoundsData,
  getMockScrambledData,
} from './helpers';

import {registerServiceBuilder} from '../../../../src/service-helpers';
import {AmpStoryStoreService} from '../../../amp-story/1.0/amp-story-store-service';
import {AmpStoryInteractivePoll} from '../amp-story-interactive-poll';

describes.realWin(
  'amp-story-interactive-poll',
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
        'amp-story-interactive-poll'
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
      ampStoryPoll = new AmpStoryInteractivePoll(ampStoryPollEl);
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

    it('should throw an error with more than four options', () => {
      addConfigToInteractive(ampStoryPoll, 5);
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

      expect(
        ampStoryPoll.getOptionElements()[0].textContent.replace(/ |\n/g, '')
      ).to.contain('50%');
      expect(
        ampStoryPoll.getOptionElements()[1].textContent.replace(/ |\n/g, '')
      ).to.contain('50%');
    });

    it('should handle the percentage pipeline with scrambled data', async () => {
      const NUM_OPTIONS = 4;
      xhrJson = getMockScrambledData();

      ampStoryPoll.element.setAttribute('endpoint', 'http://localhost:8000');

      addConfigToInteractive(ampStoryPoll, NUM_OPTIONS);
      await ampStoryPoll.buildCallback();
      await ampStoryPoll.layoutCallback();

      const expectedPercentages = [10, 20, 30, 40];
      for (let i = 0; i < NUM_OPTIONS; i++) {
        const expectedText = `${expectedPercentages[i]}%`;
        expect(
          ampStoryPoll.getOptionElements()[i].textContent.replace(/ |\n/g, '')
        ).to.contain(expectedText);
      }
    });

    it('should handle the percentage pipeline with incomplete data', async () => {
      const NUM_OPTIONS = 4;
      xhrJson = getMockIncompleteData();

      ampStoryPoll.element.setAttribute('endpoint', 'http://localhost:8000');

      addConfigToInteractive(ampStoryPoll, NUM_OPTIONS);
      await ampStoryPoll.buildCallback();
      await ampStoryPoll.layoutCallback();

      const expectedPercentages = [0, 50, 50, 0];
      for (let i = 0; i < NUM_OPTIONS; i++) {
        const expectedText = `${expectedPercentages[i]}%`;
        expect(
          ampStoryPoll.getOptionElements()[i].textContent.replace(/ |\n/g, '')
        ).to.contain(expectedText);
      }
    });

    it('should handle the percentage pipeline with out of bounds data', async () => {
      const NUM_OPTIONS = 4;
      xhrJson = getMockOutOfBoundsData();

      ampStoryPoll.element.setAttribute('endpoint', 'http://localhost:8000');

      addConfigToInteractive(ampStoryPoll, NUM_OPTIONS);
      await ampStoryPoll.buildCallback();
      await ampStoryPoll.layoutCallback();

      const expectedPercentages = [20, 0, 0, 80];
      for (let i = 0; i < NUM_OPTIONS; i++) {
        const expectedText = `${expectedPercentages[i]}%`;
        expect(
          ampStoryPoll.getOptionElements()[i].textContent.replace(/ |\n/g, '')
        ).to.contain(expectedText);
      }
    });

    it('should have large font size if options are short', async () => {
      ampStoryPoll.element.setAttribute(
        'option-1-text',
        'This is a short text'
      );
      ampStoryPoll.element.setAttribute(
        'option-2-text',
        'This is another text'
      );
      await ampStoryPoll.buildCallback();
      await ampStoryPoll.layoutCallback();
      expect(
        ampStoryPoll
          .getRootElement()
          .classList.contains('i-amphtml-story-interactive-poll-two-lines')
      ).to.be.false;
    });

    it('should have small font size if options are long', async () => {
      ampStoryPoll.element.setAttribute(
        'option-1-text',
        'This is a really really really really really long text'
      );
      ampStoryPoll.element.setAttribute(
        'option-2-text',
        'This is another text'
      );
      await ampStoryPoll.buildCallback();
      await ampStoryPoll.layoutCallback();
      expect(
        ampStoryPoll
          .getRootElement()
          .classList.contains('i-amphtml-story-interactive-poll-two-lines')
      ).to.be.true;
    });
  }
);
