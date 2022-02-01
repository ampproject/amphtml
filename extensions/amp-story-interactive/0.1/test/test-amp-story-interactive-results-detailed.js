import {Services} from '#service';
import {AmpDocSingle} from '#service/ampdoc-impl';
import {LocalizationService} from '#service/localization';

import {addConfigToInteractive, addThresholdsToInteractive} from './helpers';

import {registerServiceBuilder} from '../../../../src/service-helpers';
import {
  Action,
  AmpStoryStoreService,
} from '../../../amp-story/1.0/amp-story-store-service';
import {InteractiveType} from '../amp-story-interactive-abstract';
import {AmpStoryInteractiveResultsDetailed} from '../amp-story-interactive-results-detailed';

describes.realWin(
  'amp-story-interactive-results-detailed',
  {
    amp: true,
  },
  (env) => {
    let win;
    let ampStoryResultsDetailed;
    let storyEl;
    let storeService;

    beforeEach(() => {
      win = env.win;

      const ampStoryResultsDetailedEl = win.document.createElement(
        'amp-story-interactive-results-detailed'
      );
      ampStoryResultsDetailedEl.getAmpDoc = () => new AmpDocSingle(win);
      ampStoryResultsDetailedEl.getResources = () =>
        win.__AMP_SERVICES.resources.obj;

      storeService = new AmpStoryStoreService(win);
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
      gridLayer.appendChild(ampStoryResultsDetailedEl);
      storyPage.appendChild(gridLayer);
      storyEl.appendChild(storyPage);

      win.document.body.appendChild(storyEl);
      ampStoryResultsDetailed = new AmpStoryInteractiveResultsDetailed(
        ampStoryResultsDetailedEl
      );
      env.sandbox
        .stub(ampStoryResultsDetailed, 'mutateElement')
        .callsFake((fn) => fn());
    });

    it('should throw an error with fewer than two options', () => {
      addConfigToInteractive(ampStoryResultsDetailed, 1);
      allowConsoleError(() => {
        expect(() => {
          ampStoryResultsDetailed.buildCallback();
        }).to.throw(/Improper number of options/);
      });
    });

    it('should not throw an error with two-four options', () => {
      addConfigToInteractive(ampStoryResultsDetailed, 3);
      expect(() => ampStoryResultsDetailed.buildCallback()).to.not.throw();
    });

    it('should throw an error with more than four options', () => {
      addConfigToInteractive(ampStoryResultsDetailed, 5);
      allowConsoleError(() => {
        expect(() => {
          ampStoryResultsDetailed.buildCallback();
        }).to.throw(/Improper number of options/);
      });
    });

    it('should set the text for the category on update', async () => {
      addConfigToInteractive(ampStoryResultsDetailed, 3);
      await ampStoryResultsDetailed.buildCallback();
      await ampStoryResultsDetailed.layoutCallback();
      storeService.dispatch(Action.ADD_INTERACTIVE_REACT, {
        'interactiveId': 'i',
        'option': {'resultscategory': 'results-category 2'},
        'type': InteractiveType.POLL,
      });
      expect(
        ampStoryResultsDetailed.rootEl_.querySelector(
          '.i-amphtml-story-interactive-results-title'
        ).textContent
      ).to.equal('results-category 2');
    });

    it('should set the text for the percentage category on update', async () => {
      addThresholdsToInteractive(ampStoryResultsDetailed, [80, 20, 50]);
      await ampStoryResultsDetailed.buildCallback();
      await ampStoryResultsDetailed.layoutCallback();
      storeService.dispatch(Action.ADD_INTERACTIVE_REACT, {
        'interactiveId': 'i',
        'option': {correct: 'correct'},
        'type': InteractiveType.QUIZ,
      });
      storeService.dispatch(Action.ADD_INTERACTIVE_REACT, {
        'interactiveId': 'j',
        'option': {},
        'type': InteractiveType.QUIZ,
      });
      expect(
        ampStoryResultsDetailed.rootEl_.querySelector(
          '.i-amphtml-story-interactive-results-title'
        ).textContent
      ).to.equal('results-category 3');
    });

    it('should set the percentage for the percentage category on update', async () => {
      addThresholdsToInteractive(ampStoryResultsDetailed, [80, 20, 50]);
      await ampStoryResultsDetailed.buildCallback();
      await ampStoryResultsDetailed.layoutCallback();
      storeService.dispatch(Action.ADD_INTERACTIVE_REACT, {
        'interactiveId': 'i',
        'option': {correct: 'correct'},
        'type': InteractiveType.QUIZ,
      });
      storeService.dispatch(Action.ADD_INTERACTIVE_REACT, {
        'interactiveId': 'j',
        'option': {},
        'type': InteractiveType.QUIZ,
      });
      storeService.dispatch(Action.ADD_INTERACTIVE_REACT, {
        'interactiveId': 'k',
        'option': {},
        'type': InteractiveType.QUIZ,
      });
      expect(
        ampStoryResultsDetailed.rootEl_.querySelector(
          '.i-amphtml-story-interactive-results-top-value-number'
        ).textContent
      ).to.equal('33');
    });

    it('should correctly create elements corresponding to the number of quizzes', async () => {
      addThresholdsToInteractive(ampStoryResultsDetailed, [80, 20, 50]);
      storeService.dispatch(Action.ADD_INTERACTIVE_REACT, {
        'interactiveId': 'i',
        'option': {correct: 'correct'},
        'type': InteractiveType.QUIZ,
      });
      storeService.dispatch(Action.ADD_INTERACTIVE_REACT, {
        'interactiveId': 'j',
        'option': {},
        'type': InteractiveType.QUIZ,
      });
      storeService.dispatch(Action.ADD_INTERACTIVE_REACT, {
        'interactiveId': 'k',
        'option': {},
        'type': InteractiveType.QUIZ,
      });
      storeService.dispatch(Action.ADD_INTERACTIVE_REACT, {
        'interactiveId': 'l',
        'option': {},
        'type': InteractiveType.POLL,
      });
      await ampStoryResultsDetailed.buildCallback();
      await ampStoryResultsDetailed.layoutCallback();
      expect(
        ampStoryResultsDetailed.rootEl_.querySelectorAll(
          '.i-amphtml-story-interactive-results-result'
        ).length
      ).to.equal(3);
    });

    it('should correctly create elements corresponding to the number of polls', async () => {
      addConfigToInteractive(ampStoryResultsDetailed, 3);
      storeService.dispatch(Action.ADD_INTERACTIVE_REACT, {
        'interactiveId': 'i',
        'option': {},
        'type': InteractiveType.POLL,
      });
      storeService.dispatch(Action.ADD_INTERACTIVE_REACT, {
        'interactiveId': 'j',
        'option': {},
        'type': InteractiveType.POLL,
      });
      storeService.dispatch(Action.ADD_INTERACTIVE_REACT, {
        'interactiveId': 'k',
        'option': {},
        'type': InteractiveType.QUIZ,
      });
      await ampStoryResultsDetailed.buildCallback();
      await ampStoryResultsDetailed.layoutCallback();
      expect(
        ampStoryResultsDetailed.rootEl_.querySelectorAll(
          '.i-amphtml-story-interactive-results-result'
        ).length
      ).to.equal(2);
    });

    it('should correctly set images for the detailed results elements', async () => {
      addThresholdsToInteractive(ampStoryResultsDetailed, [80, 20, 50]);
      const image = 'https://example.com/image';
      storeService.dispatch(Action.ADD_INTERACTIVE_REACT, {
        'interactiveId': 'i',
        'option': {correct: 'correct', image},
        'type': InteractiveType.QUIZ,
      });
      await ampStoryResultsDetailed.buildCallback();
      await ampStoryResultsDetailed.layoutCallback();
      expect(
        win
          .getComputedStyle(
            ampStoryResultsDetailed.rootEl_.querySelector(
              '.i-amphtml-story-interactive-results-result'
            )
          )
          .getPropertyValue('background-image')
      ).to.contain(image);
    });
  }
);
