<<<<<<< HEAD
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

import {boolean, date, select, withKnobs} from '@storybook/addon-knobs';

=======
>>>>>>> b306580617... ♻️ Use Storybook `args` (second round) (#35930)
import * as Preact from '#preact';

import {BentoDateCountdown} from '../component';

export default {
  title: 'DateCountdown',
  component: BentoDateCountdown,
  argTypes: {
    datetime: {
      name: 'datetime',
      defaultValue: new Date(Date.now() + 10000),
      control: {type: 'date'},
    },
    locale: {
      name: 'locale',
      control: {type: 'select'},
      defaultValue: 'en',
      options: [
        'de',
        'en',
        'es',
        'fr',
        'id',
        'it',
        'ja',
        'ko',
        'nl',
        'pt',
        'ru',
        'th',
        'tr',
        'vi',
        'zh-cn',
        'zh-tw',
      ],
    },
    whenEnded: {
      name: 'whenEnded',
      defaultValue: 'stop',
      control: {type: 'inline-radio'},
      options: ['stop', 'continue'],
    },
    biggestUnit: {
      name: 'biggestUnit',
      control: {type: 'inline-radio'},
      defaultValue: null,
      options: [null, 'DAYS', 'HOURS', 'MINUTES', 'SECONDS'],
    },
  },

  args: {
    countUp: false,
  },
};

export const _default = (args) => {
  return (
    <div>
      <BentoDateCountdown
        {...args}
        render={(data) => (
          <div>
            <span>{`${data.days} ${data.dd} ${data.d}`}</span>
            <br />
            <span>{`${data.hours} ${data.hh} ${data.h}`}</span>
            <br />
            <span>{`${data.minutes} ${data.mm} ${data.m}`}</span>
            <br />
            <span>{`${data.seconds} ${data.ss} ${data.s}`}</span>
          </div>
        )}
      />
    </div>
  );
};

export const defaultRenderer = (args) => {
  return (
    <div>
      <BentoDateCountdown {...args} />
    </div>
  );
};
