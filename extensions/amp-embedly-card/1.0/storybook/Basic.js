<<<<<<< HEAD
/**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
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

import {text, withKnobs} from '@storybook/addon-knobs';

=======
>>>>>>> b306580617... ♻️ Use Storybook `args` (second round) (#35930)
import * as Preact from '#preact';

import {BentoEmbedlyCard} from '../component';
import {BentoEmbedlyContext} from '../embedly-context';

export default {
  title: 'EmbedlyCard',
  component: BentoEmbedlyCard,
};

export const _default = () => {
  return (
    <BentoEmbedlyCard
      url="https://www.youtube.com/watch?v=lBTCB7yLs8Y"
      title="BentoEmbedly Card"
      style={{width: '400px', height: '400px'}}
    />
  );
};

export const WithApiKey = ({apiKey}) => {
  return (
    <BentoEmbedlyContext.Provider value={apiKey}>
      <BentoEmbedlyCard
        url="https://www.youtube.com/watch?v=lBTCB7yLs8Y"
        title="BentoEmbedly Card"
        style={{width: '400px', height: '400px'}}
      />
    </BentoEmbedlyContext.Provider>
  );
};

WithApiKey.args = {
  apiKey: 'valid-api-key',
};
