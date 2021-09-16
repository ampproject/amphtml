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
import {date, withKnobs} from '@storybook/addon-knobs';
import {storiesOf} from '@storybook/preact';
import {withA11y} from '@storybook/addon-a11y';
import {withAmp} from 'storybook-addon-amp';

// eslint-disable-next-line
storiesOf('amp-date-display', module)
  .addDecorator(withKnobs)
  .addDecorator(withA11y)
  .addDecorator(withAmp)
  .addParameters({extensions: [{name: 'amp-date-display', version: '1.0'}]})
  .add('responsive', () => {
    const datetime = date('Date/Time', new Date());
    return (
      <amp-date-display
        datetime={datetime}
        layout="responsive"
        width="100"
        height="100"
      >
        <template type="amp-mustache">
          <div>
            {`UTC in local: {{dayName}} {{day}} {{monthName}} {{year}},
            {{hourTwoDigit}}:{{minuteTwoDigit}}:{{secondTwoDigit}}`}
          </div>
        </template>
      </amp-date-display>
    );
  });
