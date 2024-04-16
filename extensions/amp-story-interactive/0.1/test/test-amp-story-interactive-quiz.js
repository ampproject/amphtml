import {Services} from '#service';
import {AmpDocSingle} from '#service/ampdoc-impl';

import {getLocalizationService} from 'extensions/amp-story/1.0/amp-story-localization-service';

import {
  MOCK_URL,
  getMockIncompleteData,
  getMockInteractiveData,
  getMockOutOfBoundsData,
  getMockScrambledData,
  populateQuiz,
} from './helpers';

import {registerServiceBuilder} from '../../../../src/service-helpers';
import LocalizedStringsEn from '../../../amp-story/1.0/_locales/en.json' assert {type: 'json'}; // lgtm[js/syntax-error]
import {AmpStoryStoreService} from '../../../amp-story/1.0/amp-story-store-service';
import {AmpStoryInteractiveQuiz} from '../amp-story-interactive-quiz';

describes.realWin(
  'amp-story-interactive-quiz',
  {
    amp: true,
  },
  (env) => {
    let win;
    let ampStoryQuiz;
    let storyEl;
    let xhrMock;
    let xhrJson;

    beforeEach(() => {
      win = env.win;

      env.sandbox
        .stub(Services, 'cidForDoc')
        .resolves({get: () => Promise.resolve('cid')});

      const ampStoryQuizEl = win.document.createElement(
        'amp-story-interactive-quiz'
      );
      ampStoryQuizEl.getAmpDoc = () => new AmpDocSingle(win);
      ampStoryQuizEl.getResources = () => win.__AMP_SERVICES.resources.obj;

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

      const localizationService = getLocalizationService(win.document.body);
      localizationService.registerLocalizedStringBundles({
        'en': LocalizedStringsEn,
      });

      storyEl = win.document.createElement('amp-story');
      const storyPage = win.document.createElement('amp-story-page');
      const gridLayer = win.document.createElement('amp-story-grid-layer');
      gridLayer.appendChild(ampStoryQuizEl);
      storyPage.appendChild(gridLayer);
      storyEl.appendChild(storyPage);

      win.document.body.appendChild(storyEl);
      ampStoryQuiz = new AmpStoryInteractiveQuiz(ampStoryQuizEl);

      env.sandbox.stub(ampStoryQuiz, 'mutateElement').callsFake((fn) => fn());
    });

    it('should create the prompt and options container if there is a prompt', async () => {
      populateQuiz(ampStoryQuiz, 4, 'Is this a prompt?');
      await ampStoryQuiz.buildCallback();
      await ampStoryQuiz.layoutCallback();
      expect(ampStoryQuiz.getRootElement().children.length).to.equal(2);
    });

    it('should not create the prompt and options container if there no prompt', async () => {
      populateQuiz(ampStoryQuiz, 4, undefined);
      await ampStoryQuiz.buildCallback();
      await ampStoryQuiz.layoutCallback();
      expect(ampStoryQuiz.getRootElement().children.length).to.equal(1);
    });

    it('should structure the content in the quiz element', async () => {
      populateQuiz(ampStoryQuiz, 4, 'Has prompt!?');
      await ampStoryQuiz.buildCallback();
      await ampStoryQuiz.layoutCallback();

      const quizContent = ampStoryQuiz.getRootElement().children;
      expect(quizContent[0]).to.have.class(
        'i-amphtml-story-interactive-prompt-container'
      );
      expect(quizContent[1]).to.have.class(
        'i-amphtml-story-interactive-quiz-option-container'
      );

      // Check prompt container structure.
      expect(quizContent[0].children.length).to.equal(1);
      expect(
        quizContent[0].querySelectorAll('.i-amphtml-story-interactive-prompt')
      ).to.have.length(1);

      // Check option container structure.
      expect(quizContent[1].childNodes.length).to.equal(4);
      expect(
        quizContent[1].querySelectorAll(
          '.i-amphtml-story-interactive-quiz-option'
        )
      ).to.have.length(4);
    });

    it('should throw an error with fewer than two options', () => {
      populateQuiz(ampStoryQuiz, 1);
      allowConsoleError(() => {
        expect(() => {
          ampStoryQuiz.buildCallback();
        }).to.throw(/Improper number of options/);
      });
    });

    it('should not throw an error with three options and one prompt', () => {
      populateQuiz(ampStoryQuiz, 3);
      expect(() => ampStoryQuiz.buildCallback()).to.not.throw();
    });

    it('should throw an error with more than four options', () => {
      populateQuiz(ampStoryQuiz, 5);
      allowConsoleError(() => {
        expect(() => {
          ampStoryQuiz.buildCallback();
        }).to.throw(/Improper number of options/);
      });
    });

    it('should handle the percentage pipeline', async () => {
      ampStoryQuiz.element.setAttribute('endpoint', MOCK_URL);
      xhrJson = getMockInteractiveData();

      populateQuiz(ampStoryQuiz);
      await ampStoryQuiz.buildCallback();
      await ampStoryQuiz.layoutCallback();

      expect(ampStoryQuiz.getOptionElements()[0].textContent).to.contain('30%');
      expect(ampStoryQuiz.getOptionElements()[3].textContent).to.contain('10%');
    });

    it('should handle the percentage pipeline with scrambled data', async () => {
      const NUM_OPTIONS = 4;
      xhrJson = getMockScrambledData();

      ampStoryQuiz.element.setAttribute('endpoint', MOCK_URL);

      populateQuiz(ampStoryQuiz, NUM_OPTIONS);
      await ampStoryQuiz.buildCallback();
      await ampStoryQuiz.layoutCallback();

      const expectedPercentages = [10, 20, 30, 40];
      for (let i = 0; i < NUM_OPTIONS; i++) {
        const expectedText = `${expectedPercentages[i]}%`;
        expect(ampStoryQuiz.getOptionElements()[i].textContent).to.contain(
          expectedText
        );
      }
    });

    it('should handle the percentage pipeline with incomplete data', async () => {
      const NUM_OPTIONS = 4;
      xhrJson = getMockIncompleteData();

      ampStoryQuiz.element.setAttribute('endpoint', 'http://localhost:8000');

      populateQuiz(ampStoryQuiz, NUM_OPTIONS);
      await ampStoryQuiz.buildCallback();
      await ampStoryQuiz.layoutCallback();

      const expectedPercentages = [0, 50, 50, 0];
      for (let i = 0; i < NUM_OPTIONS; i++) {
        const expectedText = `${expectedPercentages[i]}%`;
        expect(ampStoryQuiz.getOptionElements()[i].textContent).to.contain(
          expectedText
        );
      }
    });

    it('should handle the percentage pipeline with out of bounds data', async () => {
      const NUM_OPTIONS = 4;
      xhrJson = getMockOutOfBoundsData();

      ampStoryQuiz.element.setAttribute('endpoint', 'http://localhost:8000');

      populateQuiz(ampStoryQuiz, NUM_OPTIONS);
      await ampStoryQuiz.buildCallback();
      await ampStoryQuiz.layoutCallback();

      const expectedPercentages = [20, 0, 0, 80];
      for (let i = 0; i < NUM_OPTIONS; i++) {
        const expectedText = `${expectedPercentages[i]}%`;
        expect(ampStoryQuiz.getOptionElements()[i].textContent).to.contain(
          expectedText
        );
      }
    });
  }
);
