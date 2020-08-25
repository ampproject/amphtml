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
import {storiesOf} from '@storybook/preact';
import {withA11y} from '@storybook/addon-a11y';
import {withAmp} from '@ampproject/storybook-addon';
import {withKnobs} from '@storybook/addon-knobs';

// eslint-disable-next-line
storiesOf('amp-fit-text', module)
  .addDecorator(withKnobs)
  .addDecorator(withA11y)
  .addDecorator(withAmp)
  .addParameters({
    extensions: [{name: 'amp-fit-text', version: '1.0'}],
    experiments: ['amp-fit-text-bento'],
  })
  .add('Scale up to cover', () => {
    return (
      <amp-fit-text
        width="300"
        height="200"
        style="border: 1px solid black;
      display: block;"
      >
        Lorem <i>ips</i>um dolor sit amet, has nisl nihil convenire et, vim at
        aeque inermis reprehendunt.
      </amp-fit-text>
    );
  })
  .add('Scale up + overflow + ellipsis', () => {
    return (
      <amp-fit-text
        width="300"
        height="200"
        min-font-size="42"
        style="border: 1px solid black;
      display: block;"
      >
        Lorem <i>ips</i>um dolor sit amet, has nisl nihil convenire et, vim at
        aeque inermis reprehendunt.
      </amp-fit-text>
    );
  })
  .add('Scale down', () => {
    return (
      <amp-fit-text
        width="300"
        height="200"
        style="border: 1px solid black;
      display: block;"
      >
        Lorem <i>ips</i>um dolor sit amet, has nisl nihil convenire et, vim at
        aeque inermis reprehendunt. Propriae tincidunt id nec, elit nusquam te
        mea, ius noster platonem in. Mea an idque minim, sit sale deleniti
        apeirian et. Omnium legendos tractatos cu mea. Vix in stet dolorem
        accusamus. Iisque rationibus consetetur in cum, quo unum nulla legere
        ut. Simul numquam saperet no sit.
      </amp-fit-text>
    );
  })
  .add('Scale down more', () => {
    return (
      <amp-fit-text
        width="108"
        height="78"
        style="border: 1px solid black;
      display: block;"
      >
        Superlongword text
      </amp-fit-text>
    );
  })
  .add('layout=responsive', () => {
    return (
      <div
        style="background-color: #bebebe;
      width: 40vw;"
      >
        <amp-fit-text
          width="100"
          height="100"
          style="border: 1px solid black;"
          layout="responsive"
          max-font-size="200"
        >
          Lorem <i>ips</i>um dolor sit amet, has nisl nihil convenire et, vim at
          aeque inermis reprehendunt.
        </amp-fit-text>
      </div>
    );
  });
