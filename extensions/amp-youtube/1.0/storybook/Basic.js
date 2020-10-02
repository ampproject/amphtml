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
import {Youtube} from '../youtube';
import {boolean, number, object, text, withKnobs} from '@storybook/addon-knobs';
import {withA11y} from '@storybook/addon-a11y';

export default {
  title: 'Youtube',
  component: Youtube,
  decorators: [withA11y, withKnobs],
};

export const _default = () => {
  const width = number('width', 300);
  const height = number('height', 200);
  const videoid = text('videoid', 'IAvf-rkzNck');
  const autoplay = boolean('autoplay', false);
  const loop = boolean('loop', false);
  const params = object('params', {});
  return (
    <Youtube
      autoplay={autoplay}
      loop={loop}
      videoid={videoid}
      params={params}
      style={{width, height}}
    />
  );
};
