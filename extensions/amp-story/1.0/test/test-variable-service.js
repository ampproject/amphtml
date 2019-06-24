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
import {AdvancementMode} from '../story-analytics';
import {AmpStoryVariableService} from '../variable-service';
import {StateChangeType} from '../navigation-state';

describes.fakeWin('amp-story variable service', {}, () => {
  let variableService;

  beforeEach(() => {
    variableService = new AmpStoryVariableService();
  });

  it('should update pageIndex and pageId on change', () => {
    variableService.onNavigationStateChange({
      type: StateChangeType.ACTIVE_PAGE,
      value: {
        pageIndex: 123,
        pageId: 'my-page-id',
      },
    });

    const variables = variableService.get();
    expect(variables['storyPageIndex']).to.equal(123);
    expect(variables['storyPageId']).to.equal('my-page-id');
  });

  it('should update storyAdvancementMode on change', () => {
    variableService.onAdvancementModeStateChange(
      AdvancementMode.MANUAL_ADVANCE
    );

    const variables = variableService.get();
    expect(variables['storyAdvancementMode']).to.equal('manualAdvance');
  });
});
