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

import {number, text, withKnobs} from '@storybook/addon-knobs';

=======
>>>>>>> 64cb73b217... ♻️ Use Storybook `args` (first round) (#35915)
import * as Preact from '#preact';

import {BentoWordPressEmbed} from '../component';

export default {
  title: 'WordPressEmbed',
  component: BentoWordPressEmbed,
  args: {
    url: 'https://wordpress.org/news/2021/06/gutenberg-highlights',
    width: 500,
    height: 200,
  },
};

export const _default = ({height, width, ...args}) => {
  return <BentoWordPressEmbed style={{width, height}} {...args} />;
};
