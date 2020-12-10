/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {AmpStoryInteractive, InteractiveType} from '../amp-story-interactive';
import {AnalyticsVariable, getVariableService} from '../variable-service';
import {Services} from '../../../../src/services';
import {StateProperty, getStoreService} from '../amp-story-store-service';
import {dict} from '../../../../src/utils/object';
import {getAnalyticsService} from '../story-analytics';
import {getRequestService} from '../amp-story-request-service';
import {htmlFor} from '../../../../src/static-template';

/**
 * Returns mock interactive data.
 *
 * @return {Object}
 */
export const getMockInteractiveData = () => {
  return {
    options: [
      {
        optionIndex: 0,
        totalCount: 3,
        selectedByUser: true,
      },
      {
        optionIndex: 1,
        totalCount: 3,
        selectedByUser: false,
      },
      {
        optionIndex: 2,
        totalCount: 3,
        selectedByUser: false,
      },
      {
        optionIndex: 3,
        totalCount: 1,
        selectedByUser: false,
      },
    ],
  };
};

export const addConfigToInteractive = (
  interactive,
  options = 4,
  correct = undefined,
  attributes = ['text', 'results-category', 'image']
) => {
  for (let i = 0; i < options; i++) {
    attributes.forEach((attr) => {
      interactive.element.setAttribute(
        `option-${i + 1}-${attr}`,
        `${attr} ${i + 1}`
      );
    });
  }
  if (correct) {
    interactive.element.setAttribute(`option-${correct}-correct`, 'correct');
  }
};

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
  return responseCounts.map((count, index) =>
    dict({
      'optionIndex': index,
      'totalCount': count,
      'selectedByUser': false,
    })
  );
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
    let requestService;
    let storeService;

    beforeEach(() => {
      win = env.win;

      env.sandbox
        .stub(Services, 'cidForDoc')
        .resolves({get: () => Promise.resolve('cid')});

      const ampStoryInteractiveEl = win.document.createElement(
        'amp-story-interactive'
      );
      ampStoryInteractiveEl.id = 'TEST_interactiveId';
      ampStoryInteractiveEl.getResources = () =>
        win.__AMP_SERVICES.resources.obj;

      analyticsVars = getVariableService(win);
      analytics = getAnalyticsService(win, win.document.body);
      requestService = getRequestService(win, ampStoryInteractiveEl);
      storeService = getStoreService(win);

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
      ampStoryInteractive.buildCallback();
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
      ampStoryInteractive.buildCallback();
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
      ampStoryInteractive.buildCallback();
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
      env.sandbox
        .stub(requestService, 'executeRequest')
        .resolves(getMockInteractiveData());
      addConfigToInteractive(ampStoryInteractive);
      ampStoryInteractive.element.setAttribute(
        'endpoint',
        'http://localhost:8000'
      );
      ampStoryInteractive.buildCallback();
      await ampStoryInteractive.layoutCallback();

      expect(ampStoryInteractive.getRootElement()).to.have.class(
        'i-amphtml-story-interactive-post-selection'
      );
      expect(ampStoryInteractive.getOptionElements()[0]).to.have.class(
        'i-amphtml-story-interactive-option-selected'
      );
    });

    it('should throw error if percentages are not correctly passed', () => {
      addConfigToInteractive(ampStoryInteractive);
      const responseData = dict({'wrongKey': []});
      allowConsoleError(() => {
        expect(() =>
          ampStoryInteractive.handleSuccessfulDataRetrieval_(responseData)
        ).to.throw();
      });
    });

    it('should preprocess percentages properly', () => {
      const responseData1 = getMockInteractiveData()['options'];

      const percentages1 = ampStoryInteractive.preprocessPercentages_(
        responseData1
      );

      expect(percentages1).to.deep.equal([30, 30, 30, 10]);
    });

    it('should preprocess percentages preserving ties', () => {
      const responseData2 = generateResponseDataFor([3, 3, 3]);
      const percentages2 = ampStoryInteractive.preprocessPercentages_(
        responseData2
      );

      expect(percentages2).to.deep.equal([33, 33, 33]);
    });

    it('should preprocess percentages preserving order', () => {
      const responseData3 = generateResponseDataFor([255, 255, 245, 245]);
      const percentages3 = ampStoryInteractive.preprocessPercentages_(
        responseData3
      );

      expect(percentages3).to.deep.equal([26, 26, 24, 24]);
    });

    it('should preprocess percentages handling rounding edge cases', () => {
      const responseData4 = generateResponseDataFor([335, 335, 330]);
      const percentages4 = ampStoryInteractive.preprocessPercentages_(
        responseData4
      );

      expect(percentages4).to.deep.equal([33, 33, 33]);
    });

    it('should update store service when selecting option with click', async () => {
      const actionsListenerSpy = env.sandbox.spy();
      addConfigToInteractive(ampStoryInteractive);
      ampStoryInteractive.buildCallback();
      await ampStoryInteractive.layoutCallback();
      storeService.subscribe(
        StateProperty.INTERACTIVE_REACT_STATE,
        actionsListenerSpy
      );

      await ampStoryInteractive.getOptionElements()[2].click();

      expect(actionsListenerSpy).to.have.been.calledOnce;
    });

    it('should update store service when getting option selected from backend', async () => {
      const actionsListenerSpy = env.sandbox.spy();
      env.sandbox
        .stub(requestService, 'executeRequest')
        .resolves(getMockInteractiveData());
      addConfigToInteractive(ampStoryInteractive);
      ampStoryInteractive.element.setAttribute(
        'endpoint',
        'http://localhost:8000'
      );
      storeService.subscribe(
        StateProperty.INTERACTIVE_REACT_STATE,
        actionsListenerSpy
      );

      ampStoryInteractive.buildCallback();
      await ampStoryInteractive.layoutCallback();

      expect(actionsListenerSpy).to.have.been.calledOnce;
    });

    it('should update the store property correctly', async () => {
      addConfigToInteractive(ampStoryInteractive, 4, null, ['text']);
      ampStoryInteractive.buildCallback();
      await ampStoryInteractive.layoutCallback();
      await ampStoryInteractive.getOptionElements()[2].click();

      expect(
        storeService.get(StateProperty.INTERACTIVE_REACT_STATE)['id']
      ).to.be.deep.equals({
        option: {
          optionIndex: 2,
          text: 'text 3',
        },
        interactiveId: 'id',
      });
    });
  }
);
