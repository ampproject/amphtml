/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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

import {Action, getStoreService} from '../amp-story-store-service';
import {AdvancementMode} from '../story-analytics';
import {AnalyticsVariable, getVariableService} from '../variable-service';

describes.fakeWin('amp-story variable service', {}, (env) => {
  let variableService;
  let storeService;

  beforeEach(() => {
    variableService = getVariableService(env.win);
    storeService = getStoreService(env.win);
  });

  it('should update pageIndex and pageId on change', () => {
    storeService.dispatch(Action.CHANGE_PAGE, {
      id: 'my-page-id',
      index: 123,
    });

    const variables = variableService.get();
    expect(variables['storyPageIndex']).to.equal(123);
    expect(variables['storyPageId']).to.equal('my-page-id');
  });

  it('should update storyAdvancementMode on change', () => {
    variableService.onVariableUpdate(
      AnalyticsVariable.STORY_ADVANCEMENT_MODE,
      AdvancementMode.MANUAL_ADVANCE
    );

    const variables = variableService.get();
    expect(variables['storyAdvancementMode']).to.equal('manualAdvance');
  });

  it('should calculate storyProgress correctly on change', () => {
    storeService.dispatch(Action.SET_PAGE_IDS, ['a', 'b', 'c', 'd', 'e']);
    storeService.dispatch(Action.CHANGE_PAGE, {
      id: 'd',
      index: 3,
    });

    const variables = variableService.get();
    expect(variables['storyProgress']).to.equal(0.75);
  });
});
