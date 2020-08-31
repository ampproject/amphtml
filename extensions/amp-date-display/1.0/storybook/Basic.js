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
import {DateDisplay} from '../date-display';
import {date, withKnobs} from '@storybook/addon-knobs';
import {withA11y} from '@storybook/addon-a11y';

export default {
  title: 'DateDisplay',
  component: DateDisplay,
  decorators: [withA11y, withKnobs],
};

export const _default = () => {
  const dateTime = date('Date/time', new Date());
  return (
    <DateDisplay
      timestampMs={dateTime}
      render={(date) => <span>{`The ISO date is ${date.iso}`}</span>}
    />
  );
};
