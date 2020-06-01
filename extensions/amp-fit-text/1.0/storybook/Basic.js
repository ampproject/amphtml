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
import {FitText} from '../fit-text';
import {number, text, withKnobs} from '@storybook/addon-knobs';
import {withA11y} from '@storybook/addon-a11y';

export default {
  title: 'FitText',
  component: FitText,
  decorators: [withA11y, withKnobs],
};

export const _default = () => {
  const minFontSize = number('minFontSize', 35);
  const maxFontSize = number('maxFontSize', 72);
  const width = number('width', 300);
  const height = number('height', 200);
  return (
    <FitText
      minFontSize={minFontSize}
      maxFontSize={maxFontSize}
      style={{display: 'block', border: '1px solid black', width, height}}
    >
      Lorem <i>ips</i>um dolor sit amet, has nisl nihil convenire et, vim at
      aeque inermis reprehendunt.
    </FitText>
  );
};

export const scaleUpOverflowEllipsis = () => {
  const minFontSize = number('minFontSize', 42);
  const maxFontSize = number('maxFontSize', 72);
  const width = number('width', 300);
  const height = number('height', 200);
  return (
    <FitText
      minFontSize={minFontSize}
      maxFontSize={maxFontSize}
      style={{display: 'block', border: '1px solid black', width, height}}
    >
      Lorem <i>ips</i>um dolor sit amet, has nisl nihil convenire et, vim at
      aeque inermis reprehendunt.
    </FitText>
  );
};

export const scaleDown = () => {
  const minFontSize = number('minFontSize', 6);
  const maxFontSize = number('maxFontSize', 72);
  const width = number('width', 300);
  const height = number('height', 200);
  return (
    <FitText
      minFontSize={minFontSize}
      maxFontSize={maxFontSize}
      style={{display: 'block', border: '1px solid black', width, height}}
    >
      Lorem <i>ips</i>um dolor sit amet, has nisl nihil convenire et, vim at
      aeque inermis reprehendunt. Propriae tincidunt id nec, elit nusquam te
      mea, ius noster platonem in. Mea an idque minim, sit sale deleniti
      apeirian et. Omnium legendos tractatos cu mea. Vix in stet dolorem
      accusamus. Iisque rationibus consetetur in cum, quo unum nulla legere ut.
      Simul numquam saperet no sit.
    </FitText>
  );
};

export const scaleDownMore = () => {
  const minFontSize = number('minFontSize', 6);
  const maxFontSize = number('maxFontSize', 72);
  const width = number('width', 108);
  const height = number('height', 78);
  return (
    <FitText
      minFontSize={minFontSize}
      maxFontSize={maxFontSize}
      style={{display: 'block', border: '1px solid black', width, height}}
    >
      Superlongword text
    </FitText>
  );
};

export const configureContent = () => {
  const content = text('Content', 'hello world');
  const minFontSize = number('minFontSize', 6);
  const maxFontSize = number('maxFontSize', 200);
  const width = number('width', 400);
  const height = number('height', 400);
  return (
    <FitText
      minFontSize={minFontSize}
      maxFontSize={maxFontSize}
      style={{display: 'block', border: '1px solid black', width, height}}
    >
      {content}
    </FitText>
  );
};
