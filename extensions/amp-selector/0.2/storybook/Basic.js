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
import {Selector} from '../selector';
import {withA11y} from '@storybook/addon-a11y';
import {withKnobs} from '@storybook/addon-knobs';

export default {
  title: 'Selector',
  component: Selector,
  decorators: [withA11y, withKnobs],
};

export const _default = () => {
  return (
    <Selector>
      <amp-img
        src="https://amp.dev/static/samples/img/landscape_sea_300x199.jpg"
        width="90"
        height="60"
        option="1"
      ></amp-img>
      <amp-img
        src="https://amp.dev/static/samples/img/landscape_desert_300x200.jpg"
        width="90"
        height="60"
        disabled
        option="2"
      ></amp-img>
      <div class="divider inline-block mx1"></div>
      <amp-img
        src="https://amp.dev/static/samples/img/landscape_ship_300x200.jpg"
        width="90"
        height="60"
        option="3"
      ></amp-img>
      <amp-img
        src="https://amp.dev/static/samples/img/landscape_village_300x200.jpg"
        width="90"
        height="60"
        option="4"
      ></amp-img>
    </Selector>
  );
};
