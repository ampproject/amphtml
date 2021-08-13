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

import * as Preact from '#preact';

import {EmbedlyCard} from '../component';
import {EmbedlyContext} from '../embedly-context';

export default {
  title: 'EmbedlyCard',
  component: EmbedlyCard,
  decorators: [withKnobs],
};

export const _default = () => {
  return (
    <EmbedlyCard
      bootstrap="http://localhost:9001/dist.3p/current/vendor/embedly.max.js"
      src="http://ads.localhost:9001/dist.3p/current/frame.max.html"
      url="https://www.youtube.com/watch?v=lBTCB7yLs8Y"
      title="Embedly Card"
      style={{width: '400px', height: '400px'}}
    />
  );
};

export const WithAPIKey = () => {
  const apiKey = text('Embedly API Key', 'valid-api-key');

  return (
    <EmbedlyContext.Provider value={apiKey}>
      <EmbedlyCard
        bootstrap="http://localhost:9001/dist.3p/current/vendor/embedly.max.js"
        src="http://ads.localhost:9001/dist.3p/current/frame.max.html"
        url="https://www.youtube.com/watch?v=lBTCB7yLs8Y"
        title="Embedly Card"
        style={{width: '400px', height: '400px'}}
      />
    </EmbedlyContext.Provider>
  );
};
