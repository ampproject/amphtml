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

import * as Preact from '../../../../src/preact';
import {TruncateText} from '../truncate-text';
import {text, withKnobs} from '@storybook/addon-knobs';
import {withA11y} from '@storybook/addon-a11y';

export default {
  title: 'TruncateText',
  component: TruncateText,
  decorators: [withKnobs, withA11y],
};

export const SimpleTruncatedText = () => {
  const width = text('width', '320em');
  const height = text('height', '64em');

  return (
    <TruncateText
      className="amp-truncate-text"
      layout="fixed"
      style={{width, height}}
      persistent={<button>Lorem Ipsum</button>}
      collapsed={<button>See more</button>}
      expanded={<button>See less</button>}
    >
      Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod
      tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
      veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
      commodo consequat. Duis aute irure dolor in reprehenderit in voluptate
      velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat
      cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id
      est laborum.
      <p> Hello</p>
    </TruncateText>
  );
};

SimpleTruncatedText.story = {
  name: 'Text truncated with a few buttons',
};
