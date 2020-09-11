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
import {date, number, text, withKnobs} from '@storybook/addon-knobs';
import {storiesOf} from '@storybook/preact';
import {withA11y} from '@storybook/addon-a11y';
import {withAmp} from '@ampproject/storybook-addon';

// eslint-disable-next-line
storiesOf('amp-timeago', module)
  .addDecorator(withKnobs)
  .addDecorator(withA11y)
  .addDecorator(withAmp)
  .addParameters({
    extensions: [{name: 'amp-timeago', version: '1.0'}],
    experiments: ['amp-timeago-bento'],
  })
  .add('responsive', () => {
    const datetime = date('Date/Time', new Date());
    const cutoff = number('Cutoff (seconds)', 0);
    const placeholder = text('Cutoff placeholder', 'Time passed!');
    return (
      <amp-timeago
        layout="responsive"
        width="100"
        height="40"
        datetime={new Date(datetime).toISOString()}
        cutoff={cutoff}
        locale="en"
      >
        {placeholder}
      </amp-timeago>
    );
  });
