<<<<<<< HEAD
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

import {color, object, select, text, withKnobs} from '@storybook/addon-knobs';

=======
>>>>>>> 64cb73b217... ♻️ Use Storybook `args` (first round) (#35915)
import * as Preact from '#preact';

import {SocialShare} from '../component';

const types = [
  'email',
  'facebook',
  'linkedin',
  'pinterest',
  'tumblr',
  'twitter',
  'whatsapp',
  'line',
  'sms',
  'system',
  'custom',
  undefined,
];

export default {
  title: 'SocialShare',
  component: SocialShare,
  argTypes: {
    type: {control: {type: 'select'}, options: types},
    color: {control: {type: 'color'}},
    background: {control: {type: 'color'}},
  },
  args: {
    type: types[0],
    endpoint: '',
    params: {'subject': 'test'},
    target: '',
    width: '',
    height: '',
    children: '',
    color: '',
    background: '',
  },
};

export const _default = (args) => {
  return <SocialShare {...args} />;
};
