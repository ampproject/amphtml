/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
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

import {Action} from '../../amp-story/1.0/amp-story-store-service';

export const updateInteractiveStoreState = (storeService, interactive) => {
  const update = {
    'option': interactive.getOptionSelected(),
    'interactiveId': this.getInteractiveId_(),
  };
  storeService.dispatch(Action.ADD_INTERACTIVE_REACT, update);
};
