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

import {AmpStoryReaction, ReactionType} from '../amp-story-reaction';
import {AmpStoryStoreService} from '../amp-story-store-service';
import {AnalyticsVariable, getVariableService} from '../variable-service';
import {Services} from '../../../../src/services';
import {dict} from '../../../../src/utils/object';
import {getAnalyticsService} from '../story-analytics';
import {getRequestService} from '../amp-story-request-service';
import {htmlFor} from '../../../../src/static-template';
import {registerServiceBuilder} from '../../../../src/service';

/**
 * Returns mock reaction data.
 *
 * @return {Object}
 */
export const getMockReactionData = () => {
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

class ReactionTest extends AmpStoryReaction {
  constructor(element, options = 4) {
    super(element, ReactionType.QUIZ);
    this.options = options;
  }

  /** @override */
  buildComponent(element) {
    const html = htmlFor(element);
    const root = html`<div class="container"></div>`;
    const option = html`<span class="i-amphtml-story-reaction-option">1</span>`;
    for (let i = 0; i < this.options; i++) {
      const newOption = option.cloneNode();
      newOption.optionIndex_ = i;
      root.appendChild(newOption);
    }
    return root;
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
  'amp-story-reaction',
  {
    amp: true,
  },
  (env) => {
    let win;
    let ampStoryReaction;
    let storyEl;
    let analytics;
    let analyticsVars;
    let requestService;

    beforeEach(() => {
      win = env.win;

      env.sandbox
        .stub(Services, 'cidForDoc')
        .resolves({get: () => Promise.resolve('cid')});

      const ampStoryReactionEl = win.document.createElement(
        'amp-story-reaction'
      );
      ampStoryReactionEl.id = 'TEST_reactionId';
      ampStoryReactionEl.getResources = () => win.__AMP_SERVICES.resources.obj;

      analyticsVars = getVariableService(win);
      analytics = getAnalyticsService(win, win.document.body);
      requestService = getRequestService(win, ampStoryReactionEl);

      const storeService = new AmpStoryStoreService(win);
      registerServiceBuilder(win, 'story-store', function () {
        return storeService;
      });

      storyEl = win.document.createElement('amp-story');
      const storyPage = win.document.createElement('amp-story-page');
      const gridLayer = win.document.createElement('amp-story-grid-layer');
      gridLayer.appendChild(ampStoryReactionEl);
      storyPage.appendChild(gridLayer);
      storyEl.appendChild(storyPage);

      win.document.body.appendChild(storyEl);
      ampStoryReaction = new ReactionTest(ampStoryReactionEl, 4);

      env.sandbox
        .stub(ampStoryReaction, 'mutateElement')
        .callsFake((fn) => fn());
    });

    it('should enter post-interaction state on option click', async () => {
      ampStoryReaction.buildCallback();
      await ampStoryReaction.layoutCallback();
      await ampStoryReaction.getOptionElements()[0].click();
      expect(ampStoryReaction.getRootElement()).to.have.class(
        'i-amphtml-story-reaction-post-selection'
      );
      expect(ampStoryReaction.getOptionElements()[0]).to.have.class(
        'i-amphtml-story-reaction-option-selected'
      );
    });

    it('should only record first option selected', async () => {
      ampStoryReaction.buildCallback();
      await ampStoryReaction.layoutCallback();
      await ampStoryReaction.getOptionElements()[0].click();
      await ampStoryReaction.getOptionElements()[1].click();
      expect(ampStoryReaction.getOptionElements()[0]).to.have.class(
        'i-amphtml-story-reaction-option-selected'
      );
      expect(ampStoryReaction.getOptionElements()[1]).to.not.have.class(
        'i-amphtml-story-reaction-option-selected'
      );
    });

    it('should trigger an analytics event with the right variables on selection', async () => {
      const trigger = env.sandbox.stub(analytics, 'triggerEvent');
      ampStoryReaction.buildCallback();
      await ampStoryReaction.layoutCallback();
      await ampStoryReaction.getOptionElements()[1].click();
      expect(trigger).to.have.been.calledWith('story-reaction');
      const variables = analyticsVars.get();
      expect(variables[AnalyticsVariable.STORY_REACTION_ID]).to.equal(
        'TEST_reactionId'
      );
      expect(variables[AnalyticsVariable.STORY_REACTION_RESPONSE]).to.equal(1);
      expect(variables[AnalyticsVariable.STORY_REACTION_TYPE]).to.equal(
        ampStoryReaction.reactionType_
      );
    });

    it('should update the quiz when the user has already reacted', async () => {
      env.sandbox
        .stub(requestService, 'executeRequest')
        .resolves(getMockReactionData());
      ampStoryReaction.element.setAttribute(
        'endpoint',
        'http://localhost:8000'
      );
      ampStoryReaction.buildCallback();
      await ampStoryReaction.layoutCallback();

      expect(ampStoryReaction.getRootElement()).to.have.class(
        'i-amphtml-story-reaction-post-selection'
      );
      expect(ampStoryReaction.getOptionElements()[0]).to.have.class(
        'i-amphtml-story-reaction-option-selected'
      );
    });

    it('should throw error if percentages are not correctly passed', () => {
      const responseData = dict({'wrongKey': []});
      allowConsoleError(() => {
        expect(() =>
          ampStoryReaction.handleSuccessfulDataRetrieval_(responseData)
        ).to.throw();
      });
    });

    it('should preprocess percentages properly', () => {
      const responseData1 = getMockReactionData()['options'];

      const percentages1 = ampStoryReaction.preprocessPercentages_(
        responseData1
      );

      expect(percentages1).to.deep.equal([30, 30, 30, 10]);
    });

    it('should preprocess percentages preserving ties', () => {
      const responseData2 = generateResponseDataFor([3, 3, 3]);
      const percentages2 = ampStoryReaction.preprocessPercentages_(
        responseData2
      );

      expect(percentages2).to.deep.equal([33, 33, 33]);
    });

    it('should preprocess percentages preserving order', () => {
      const responseData3 = generateResponseDataFor([255, 255, 245, 245]);
      const percentages3 = ampStoryReaction.preprocessPercentages_(
        responseData3
      );

      expect(percentages3).to.deep.equal([26, 26, 24, 24]);
    });

    it('should preprocess percentages handling rounding edge cases', () => {
      const responseData4 = generateResponseDataFor([335, 335, 330]);
      const percentages4 = ampStoryReaction.preprocessPercentages_(
        responseData4
      );

      expect(percentages4).to.deep.equal([33, 33, 33]);
    });
  }
);
