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
import {withA11y} from '@storybook/addon-a11y';
import {withKnobs} from '@storybook/addon-knobs';

export default {
  title: 'FitText',
  component: FitText,
  decorators: [withA11y, withKnobs],
};

const fitTextStyle = {
  border: '1px solid black',
  display: 'block',
  width: 300,
  height: 200,
};

export const _default = () => {
  return (
    <FitText width="300" height="200" style={fitTextStyle}>
      Lorem <i>ips</i>um dolor sit amet, has nisl nihil convenire et, vim at
      aeque inermis reprehendunt.
    </FitText>
  );
};

export const scaleUpOverflowEllipsis = () => {
  return (
    <FitText width="300" height="200" style={fitTextStyle} minFontSize={42}>
      Lorem <i>ips</i>um dolor sit amet, has nisl nihil convenire et, vim at
      aeque inermis reprehendunt.
    </FitText>
  );
};

export const scaleDown = () => {
  return (
    <FitText width="300" height="200" style={fitTextStyle}>
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
  return (
    <FitText
      style={{
        border: '1px solid black',
        display: 'block',
        width: 108,
        height: 78,
      }}
    >
      Superlongword text
    </FitText>
  );
};
