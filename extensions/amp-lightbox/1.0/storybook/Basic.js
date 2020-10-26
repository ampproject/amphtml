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

import * as Preact from '../../../../src/preact';
import {Lightbox} from '../lightbox';
import {boolean, number, text, withKnobs} from '@storybook/addon-knobs';
import {withA11y} from '@storybook/addon-a11y';

export default {
  title: 'Lightbox',
  component: Lightbox,
  decorators: [withA11y, withKnobs],
};

export const _default = () => {
  const id = text('id', 'lightbox');
  const width = number('width', 600);
  const height = number('height', 600);
  const open = boolean('open', false);
  const animateIn = text('animateIn', 'fade-in');
  return (
    <div>
      <Lightbox
        id={id}
        layout="nodisplay"
        open={open}
        animateIn={animateIn}
        style={{display: 'block', width, height}}
      >
        Lorem <i>ips</i>um dolor sit amet, has nisl nihil convenire et, vim at
        aeque inermis reprehendunt.
      </Lightbox>
    </div>
  );
};
