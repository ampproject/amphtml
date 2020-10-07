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
import {DateCountdown} from '../date-countdown';
import {date, select, withKnobs} from '@storybook/addon-knobs';
import {withA11y} from '@storybook/addon-a11y';

export default {
  title: 'DateCountdown',
  component: DateCountdown,
  decorators: [withA11y, withKnobs],
};

const LOCALE_CONFIGURATIONS = [
  'google',
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
];

const WHEN_ENDED_CONFIGURATIONS = ['stop', 'continue'];

const BIGGEST_UNIT_CONFIGURATIONS = [
  null,
  'DAYS',
  'HOURS',
  'MINUTES',
  'SECONDS',
];

export const _default = () => {
  const datetime = date('endDate', new Date(Date.now() + 10000));
  const locale = select(
    'locale',
    LOCALE_CONFIGURATIONS,
    LOCALE_CONFIGURATIONS[0]
  );
  const whenEnded = select(
    'whenEnded',
    WHEN_ENDED_CONFIGURATIONS,
    WHEN_ENDED_CONFIGURATIONS[0]
  );
  const biggestUnit = select(
    'biggestUnit',
    BIGGEST_UNIT_CONFIGURATIONS,
    BIGGEST_UNIT_CONFIGURATIONS[0]
  );

  return (
    <div>
      <DateCountdown
        datetime={datetime}
        locale={locale}
        whenEnded={whenEnded}
        biggestUnit={biggestUnit}
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
      ></DateCountdown>
    </div>
  );
};

export const defaultRenderer = () => {
  const datetime = date('endDate', new Date(Date.now() + 10000));
  const locale = select(
    'locale',
    LOCALE_CONFIGURATIONS,
    LOCALE_CONFIGURATIONS[0]
  );
  const whenEnded = select(
    'whenEnded',
    WHEN_ENDED_CONFIGURATIONS,
    WHEN_ENDED_CONFIGURATIONS[0]
  );
  const biggestUnit = select(
    'biggestUnit',
    BIGGEST_UNIT_CONFIGURATIONS,
    BIGGEST_UNIT_CONFIGURATIONS[0]
  );

  return (
    <div>
      <DateCountdown
        datetime={datetime}
        locale={locale}
        whenEnded={whenEnded}
        biggestUnit={biggestUnit}
      ></DateCountdown>
    </div>
  );
};
