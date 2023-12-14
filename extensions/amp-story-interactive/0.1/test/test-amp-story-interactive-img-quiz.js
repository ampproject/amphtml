import {Services} from '#service';
import {AmpDocSingle} from '#service/ampdoc-impl';

import {getLocalizationService} from 'extensions/amp-story/1.0/amp-story-localization-service';

import {
  getMockIncompleteData,
  getMockInteractiveData,
  getMockOutOfBoundsData,
  getMockScrambledData,
  populateQuiz,
} from './helpers';

import {registerServiceBuilder} from '../../../../src/service-helpers';
import LocalizedStringsEn from '../../../amp-story/1.0/_locales/en.json' assert {type: 'json'}; // lgtm[js/syntax-error]
import {AmpStoryStoreService} from '../../../amp-story/1.0/amp-story-store-service';
import {AmpStoryInteractiveImgQuiz} from '../amp-story-interactive-img-quiz';

describes.realWin(
  'amp-story-interactive-img-quiz',
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
        'amp-story-interactive-img-quiz'
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
      ampStoryQuiz = new AmpStoryInteractiveImgQuiz(ampStoryQuizEl);

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

    it('should structure the content in the quiz element with images', async () => {
      ampStoryQuiz.element.setAttribute('option-1-image', 'Fizz');
      ampStoryQuiz.element.setAttribute('option-1-image-alt', 'Fizz');
      ampStoryQuiz.element.setAttribute('option-2-image', 'Buzz');
      ampStoryQuiz.element.setAttribute('option-2-image-alt', 'Buzz');
      await ampStoryQuiz.buildCallback();
      await ampStoryQuiz.layoutCallback();

      const quizContent = ampStoryQuiz.getRootElement().children[0];
      expect(quizContent).to.have.class(
        'i-amphtml-story-interactive-img-option-container'
      );

      // Check option container structure.
      expect(quizContent.childNodes.length).to.equal(2);
      expect(
        quizContent.querySelectorAll('.i-amphtml-story-interactive-img-option')
      ).to.have.length(2);

      //Check option content
      expect(
        win
          .getComputedStyle(
            quizContent.querySelector(
              '.i-amphtml-story-interactive-img-option-img'
            )
          )
          .getPropertyValue('background-image')
      ).to.contain('Fizz');
      expect(
        win
          .getComputedStyle(
            quizContent.querySelectorAll(
              '.i-amphtml-story-interactive-img-option-img'
            )[1]
          )
          .getPropertyValue('background-image')
      ).to.contain('Buzz');
    });

    it('should set the aria-label for each option', async () => {
      ampStoryQuiz.element.setAttribute('option-1-image', 'Fizz');
      ampStoryQuiz.element.setAttribute('option-1-image-alt', 'Fizz');
      ampStoryQuiz.element.setAttribute('option-2-image', 'Buzz');
      ampStoryQuiz.element.setAttribute('option-2-image-alt', 'Buzz');
      await ampStoryQuiz.buildCallback();
      await ampStoryQuiz.layoutCallback();

      const quizContent = ampStoryQuiz.getRootElement().children[0];

      //Check option content
      expect(
        quizContent
          .querySelector('.i-amphtml-story-interactive-img-option')
          .getAttribute('aria-label')
      ).to.contain('Fizz');
      expect(
        quizContent
          .querySelectorAll('.i-amphtml-story-interactive-img-option')[1]
          .getAttribute('aria-label')
      ).to.contain('Buzz');
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
      xhrJson = getMockInteractiveData();

      ampStoryQuiz.element.setAttribute('endpoint', 'http://localhost:8000');

      populateQuiz(ampStoryQuiz);
      await ampStoryQuiz.buildCallback();
      await ampStoryQuiz.layoutCallback();

      expect(ampStoryQuiz.getOptionElements()[0].textContent).to.contain('30%');
      expect(ampStoryQuiz.getOptionElements()[3].textContent).to.contain('10%');
    });

    it('should handle the percentage pipeline with scrambled data', async () => {
      const NUM_OPTIONS = 4;
      xhrJson = getMockScrambledData();

      ampStoryQuiz.element.setAttribute('endpoint', 'http://localhost:8000');

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
