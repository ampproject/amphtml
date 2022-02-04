import {htmlFor} from '#core/dom/static-template';

import {toggleExperiment} from '#experiments/';

import {Services} from '#service';
import {AmpDocSingle} from '#service/ampdoc-impl';
import {LocalizationService} from '#service/localization';

import {
  MOCK_URL,
  addConfigToInteractive,
  getMockIncompleteData,
  getMockInteractiveData,
  getMockOutOfBoundsData,
  getMockScrambledData,
} from './helpers';

import {registerServiceBuilder} from '../../../../src/service-helpers';
import {
  AmpStoryStoreService,
  StateProperty,
} from '../../../amp-story/1.0/amp-story-store-service';
import {StoryAnalyticsService} from '../../../amp-story/1.0/story-analytics';
import {
  AmpStoryVariableService,
  AnalyticsVariable,
} from '../../../amp-story/1.0/variable-service';
import {
  AmpStoryInteractive,
  InteractiveType,
} from '../amp-story-interactive-abstract';
import {getBackendSpecs} from '../interactive-disclaimer';

class InteractiveTest extends AmpStoryInteractive {
  constructor(element) {
    super(element, InteractiveType.QUIZ);
  }

  /** @override */
  buildComponent() {
    const html = htmlFor(this.element);
    const root = html`<div class="container"></div>`;
    const option = html`<span
      class="i-amphtml-story-interactive-option"
    ></span>`;
    for (let i = 0; i < this.options_.length; i++) {
      const newOption = option.cloneNode();
      newOption.optionIndex_ = this.options_[i]['optionIndex'];
      newOption.textContent = this.options_[i]['text'];
      root.appendChild(newOption);
    }
    return root;
  }

  /** @override */
  getInteractiveId_() {
    return 'id';
  }
}

/**
 * Generates a response given an array of counts.
 *
 * @param {Array<number>} responseCounts
 */
export const generateResponseDataFor = (responseCounts) => {
  return responseCounts.map((count, index) => ({
    'index': index,
    'count': count,
    'selected': false,
  }));
};

describes.realWin(
  'amp-story-interactive',
  {
    amp: true,
  },
  (env) => {
    let win;
    let ampStoryInteractive;
    let storyEl;
    let analytics;
    let analyticsVars;
    let storeService;
    let xhrMock;
    let xhrJson;

    beforeEach(() => {
      win = env.win;

      env.sandbox
        .stub(Services, 'cidForDoc')
        .resolves({get: () => Promise.resolve('cid')});

      const ampStoryInteractiveEl = win.document.createElement(
        'amp-story-interactive'
      );
      ampStoryInteractiveEl.id = 'TEST_interactiveId';
      ampStoryInteractiveEl.getAmpDoc = () => new AmpDocSingle(win);
      ampStoryInteractiveEl.getResources = () =>
        win.__AMP_SERVICES.resources.obj;

      analyticsVars = new AmpStoryVariableService(win);
      registerServiceBuilder(win, 'story-variable', function () {
        return analyticsVars;
      });
      analytics = new StoryAnalyticsService(win, win.document.body);
      registerServiceBuilder(win, 'story-analytics', function () {
        return analytics;
      });
      storeService = new AmpStoryStoreService(win);
      registerServiceBuilder(win, 'story-store', function () {
        return storeService;
      });

      const xhr = Services.xhrFor(env.win);
      xhrMock = env.sandbox.mock(xhr);
      xhrMock.expects('fetchJson').resolves({
        ok: true,
        json() {
          return Promise.resolve(xhrJson);
        },
      });

      const localizationService = new LocalizationService(win.document.body);
      env.sandbox
        .stub(Services, 'localizationServiceForOrNull')
        .returns(Promise.resolve(localizationService));

      storyEl = win.document.createElement('amp-story');
      const storyPage = win.document.createElement('amp-story-page');
      storyPage.id = 'page-1';
      const gridLayer = win.document.createElement('amp-story-grid-layer');
      gridLayer.appendChild(ampStoryInteractiveEl);
      storyPage.appendChild(gridLayer);
      storyEl.appendChild(storyPage);

      win.document.body.appendChild(storyEl);
      ampStoryInteractive = new InteractiveTest(ampStoryInteractiveEl);

      env.sandbox
        .stub(ampStoryInteractive, 'mutateElement')
        .callsFake((fn) => fn());
      env.sandbox
        .stub(ampStoryInteractive, 'measureMutateElement')
        .callsFake((fn1, fn2) => {
          fn1();
          fn2();
        });
    });

    it('should parse the attributes properly into an options list', async () => {
      addConfigToInteractive(
        ampStoryInteractive,
        /* options */ 3,
        /* correct */ 1
      );
      const optionsList = ampStoryInteractive.parseOptions_();
      expect(optionsList).to.have.length(3);
      for (let i = 0; i < 3; i++) {
        expect(optionsList[i]).to.haveOwnProperty('text');
        expect(optionsList[i]).to.haveOwnProperty('optionIndex');
      }
      expect(optionsList[0]).to.haveOwnProperty('correct', 'correct');
    });

    it('should enter post-selection state on option click', async () => {
      addConfigToInteractive(ampStoryInteractive);
      await ampStoryInteractive.buildCallback();
      await ampStoryInteractive.layoutCallback();
      await ampStoryInteractive.getOptionElements()[0].click();
      expect(ampStoryInteractive.getRootElement()).to.have.class(
        'i-amphtml-story-interactive-post-selection'
      );
      expect(ampStoryInteractive.getOptionElements()[0]).to.have.class(
        'i-amphtml-story-interactive-option-selected'
      );
    });

    it('should only record first option selected', async () => {
      addConfigToInteractive(ampStoryInteractive);
      await ampStoryInteractive.buildCallback();
      await ampStoryInteractive.layoutCallback();
      await ampStoryInteractive.getOptionElements()[0].click();
      await ampStoryInteractive.getOptionElements()[1].click();
      expect(ampStoryInteractive.getOptionElements()[0]).to.have.class(
        'i-amphtml-story-interactive-option-selected'
      );
      expect(ampStoryInteractive.getOptionElements()[1]).to.not.have.class(
        'i-amphtml-story-interactive-option-selected'
      );
    });

    it('should trigger an analytics event with the right variables on selection', async () => {
      const trigger = env.sandbox.stub(analytics, 'triggerEvent');
      addConfigToInteractive(ampStoryInteractive);
      await ampStoryInteractive.buildCallback();
      await ampStoryInteractive.layoutCallback();
      await ampStoryInteractive.getOptionElements()[1].click();
      expect(trigger).to.have.been.calledWith('story-interactive');
      const variables = analyticsVars.get();
      expect(variables[AnalyticsVariable.STORY_INTERACTIVE_ID]).to.equal(
        'TEST_interactiveId'
      );
      expect(variables[AnalyticsVariable.STORY_INTERACTIVE_RESPONSE]).to.equal(
        1
      );
      expect(variables[AnalyticsVariable.STORY_INTERACTIVE_TYPE]).to.equal(
        ampStoryInteractive.interactiveType_
      );
    });

    it('should update the quiz when the user has already reacted', async () => {
      xhrJson = getMockInteractiveData();
      addConfigToInteractive(ampStoryInteractive);
      ampStoryInteractive.element.setAttribute('endpoint', MOCK_URL);
      await ampStoryInteractive.buildCallback();
      await ampStoryInteractive.layoutCallback();

      expect(ampStoryInteractive.getRootElement()).to.have.class(
        'i-amphtml-story-interactive-post-selection'
      );
      expect(ampStoryInteractive.getOptionElements()[0]).to.have.class(
        'i-amphtml-story-interactive-option-selected'
      );
    });

    it('should select the correct option if the backend responds with scrambled data', async () => {
      const NUM_OPTIONS = 4;
      const scrambledData = getMockScrambledData();
      xhrJson = scrambledData;
      addConfigToInteractive(ampStoryInteractive, NUM_OPTIONS);
      ampStoryInteractive.element.setAttribute('endpoint', MOCK_URL);
      await ampStoryInteractive.buildCallback();
      await ampStoryInteractive.layoutCallback();

      expect(ampStoryInteractive.getRootElement()).to.have.class(
        'i-amphtml-story-interactive-post-selection'
      );
      const selectedIndex = scrambledData.options.filter(
        (option) => option.selected
      )[0].index;
      for (let i = 0; i < NUM_OPTIONS; i++) {
        if (i === selectedIndex) {
          expect(ampStoryInteractive.getOptionElements()[i]).to.have.class(
            'i-amphtml-story-interactive-option-selected'
          );
        } else {
          expect(ampStoryInteractive.getOptionElements()[i]).to.not.have.class(
            'i-amphtml-story-interactive-option-selected'
          );
        }
      }
    });

    it('should select the correct option if the backend responds with incomplete data', async () => {
      const NUM_OPTIONS = 4;
      const incompleteData = getMockIncompleteData();
      xhrJson = incompleteData;
      addConfigToInteractive(ampStoryInteractive, NUM_OPTIONS);
      ampStoryInteractive.element.setAttribute('endpoint', MOCK_URL);
      await ampStoryInteractive.buildCallback();
      await ampStoryInteractive.layoutCallback();

      expect(ampStoryInteractive.getRootElement()).to.have.class(
        'i-amphtml-story-interactive-post-selection'
      );
      const selectedIndex = incompleteData.options.filter(
        (option) => option.selected
      )[0].index;
      for (let i = 0; i < NUM_OPTIONS; i++) {
        if (i === selectedIndex) {
          expect(ampStoryInteractive.getOptionElements()[i]).to.have.class(
            'i-amphtml-story-interactive-option-selected'
          );
        } else {
          expect(ampStoryInteractive.getOptionElements()[i]).to.not.have.class(
            'i-amphtml-story-interactive-option-selected'
          );
        }
      }
    });

    it('should select the correct option if the backend responds with out of bounds data', async () => {
      const NUM_OPTIONS = 4;
      const outOfBoundsData = getMockOutOfBoundsData();
      xhrJson = outOfBoundsData;
      addConfigToInteractive(ampStoryInteractive, NUM_OPTIONS);
      ampStoryInteractive.element.setAttribute('endpoint', MOCK_URL);
      await ampStoryInteractive.buildCallback();
      await ampStoryInteractive.layoutCallback();

      expect(ampStoryInteractive.getRootElement()).to.have.class(
        'i-amphtml-story-interactive-post-selection'
      );
      expect(ampStoryInteractive.optionsData_.length).to.equal(NUM_OPTIONS);
      const selectedIndex = outOfBoundsData.options.filter(
        (option) => option.selected
      )[0].index;
      for (let i = 0; i < NUM_OPTIONS; i++) {
        if (i === selectedIndex) {
          expect(ampStoryInteractive.getOptionElements()[i]).to.have.class(
            'i-amphtml-story-interactive-option-selected'
          );
        } else {
          expect(ampStoryInteractive.getOptionElements()[i]).to.not.have.class(
            'i-amphtml-story-interactive-option-selected'
          );
        }
      }
    });

    it('should throw error if percentages are not correctly passed', () => {
      addConfigToInteractive(ampStoryInteractive);
      const responseData = {'wrongKey': []};
      allowConsoleError(() => {
        expect(() =>
          ampStoryInteractive.onDataRetrieved_(responseData)
        ).to.throw();
      });
    });

    it('should preprocess percentages properly', () => {
      const responseData1 = getMockInteractiveData()['options'];

      const percentages1 =
        ampStoryInteractive.preprocessPercentages_(responseData1);

      expect(percentages1).to.deep.equal([30, 30, 30, 10]);
    });

    it('should preprocess percentages preserving ties', () => {
      const responseData2 = generateResponseDataFor([3, 3, 3]);
      const percentages2 =
        ampStoryInteractive.preprocessPercentages_(responseData2);

      expect(percentages2).to.deep.equal([33, 33, 33]);
    });

    it('should preprocess percentages preserving order', () => {
      const responseData3 = generateResponseDataFor([255, 255, 245, 245]);
      const percentages3 =
        ampStoryInteractive.preprocessPercentages_(responseData3);

      expect(percentages3).to.deep.equal([26, 26, 24, 24]);
    });

    it('should preprocess percentages handling rounding edge cases', () => {
      const responseData4 = generateResponseDataFor([335, 335, 330]);
      const percentages4 =
        ampStoryInteractive.preprocessPercentages_(responseData4);

      expect(percentages4).to.deep.equal([33, 33, 33]);
    });

    it('should update the store property correctly', async () => {
      addConfigToInteractive(ampStoryInteractive, 4, null, ['text']);
      await ampStoryInteractive.buildCallback();
      await ampStoryInteractive.layoutCallback();
      await ampStoryInteractive.getOptionElements()[2].click();

      expect(
        ampStoryInteractive.storeService_.get(
          StateProperty.INTERACTIVE_REACT_STATE
        )['id']
      ).to.be.deep.equals({
        option: {
          optionIndex: 2,
          text: 'text 3',
        },
        interactiveId: 'id',
        type: InteractiveType.QUIZ,
      });
    });

    describe('disclaimer dialog', () => {
      beforeEach(() => {
        toggleExperiment(win, 'amp-story-interactive-disclaimer', true);
      });

      it('should create the dialog when the disclaimer icon is clicked', async () => {
        xhrJson = getMockInteractiveData();
        addConfigToInteractive(ampStoryInteractive);
        ampStoryInteractive.element.setAttribute('endpoint', MOCK_URL);
        await ampStoryInteractive.buildCallback();
        await ampStoryInteractive.layoutCallback();

        await ampStoryInteractive
          .getRootElement()
          .querySelector('.i-amphtml-story-interactive-disclaimer-icon')
          .click();

        expect(
          storyEl.querySelector(
            '.i-amphtml-story-interactive-disclaimer-dialog'
          )
        ).to.not.be.null;
      });

      it('should destroy the dialog when the close button is clicked', async () => {
        xhrJson = getMockInteractiveData();
        addConfigToInteractive(ampStoryInteractive);
        ampStoryInteractive.element.setAttribute('endpoint', MOCK_URL);
        await ampStoryInteractive.buildCallback();
        await ampStoryInteractive.layoutCallback();

        await ampStoryInteractive
          .getRootElement()
          .querySelector('.i-amphtml-story-interactive-disclaimer-icon')
          .click();

        expect(
          storyEl.querySelector(
            '.i-amphtml-story-interactive-disclaimer-dialog'
          )
        ).to.not.be.null;
      });

      it('should set the url of the disclaimer to the backend url', async () => {
        xhrJson = getMockInteractiveData();

        addConfigToInteractive(ampStoryInteractive);
        ampStoryInteractive.element.setAttribute('endpoint', MOCK_URL);
        await ampStoryInteractive.buildCallback();
        await ampStoryInteractive.layoutCallback();

        await ampStoryInteractive
          .getRootElement()
          .querySelector('.i-amphtml-story-interactive-disclaimer-icon')
          .click();

        expect(
          storyEl.querySelector(
            '.i-amphtml-story-interactive-disclaimer-dialog .i-amphtml-story-interactive-disclaimer-url'
          ).textContent
        ).to.be.equal('amp.dev');
      });

      it('should remove learn more link when backend is not on list', async () => {
        xhrJson = getMockInteractiveData();

        addConfigToInteractive(ampStoryInteractive);
        ampStoryInteractive.element.setAttribute('endpoint', MOCK_URL);

        await ampStoryInteractive.buildCallback();
        await ampStoryInteractive.layoutCallback();

        await ampStoryInteractive
          .getRootElement()
          .querySelector('.i-amphtml-story-interactive-disclaimer-icon')
          .click();

        expect(
          storyEl.querySelector(
            '.i-amphtml-story-interactive-disclaimer-dialog .i-amphtml-story-interactive-disclaimer-link'
          )
        ).to.be.null;
      });

      it('should properly find backend from url in list of backends', async () => {
        expect(
          getBackendSpecs('notabackend.com/api/v1', {
            'wrongbackend.com': {
              learnMoreUrl: 'url0',
              'entity': 'WrongBackend',
            },
            'notabackend.com': {learnMoreUrl: 'url1', 'entity': 'NotABackend'},
          })
        ).to.be.deep.equals([
          'notabackend.com',
          {learnMoreUrl: 'url1', entity: 'NotABackend'},
        ]);
      });

      it('should not find backend from url in list of backends that does not include url passed', async () => {
        expect(
          getBackendSpecs('notabackend.com/api/v1', {
            'wrongbackend.com': {
              learnMoreUrl: 'url0',
              'entity': 'WrongBackend',
            },
          })
        ).to.be.undefined;
      });
    });
  }
);
