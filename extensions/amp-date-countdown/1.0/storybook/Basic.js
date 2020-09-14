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
import {number, select, withKnobs} from '@storybook/addon-knobs';
import {withA11y} from '@storybook/addon-a11y';

export default {
  title: 'DateCountdown',
  component: DateCountdown,
  decorators: [withA11y, withKnobs],
};

export const _default = () => {
  const localeConfigurations = [
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

  const whenEndedConfigurations = ['stop', 'continue'];

  const biggestUnitConfigurations = [
    undefined,
    'DAYS',
    'HOURS',
    'MINUTES',
    'SECONDS',
  ];

  //to do: update me!
  const endDate = number('endDate', null);
  const timeleftMs = number('timeleftMs', 5000);
  const timestampMs = number('timestampMs', null);
  const timestampSeconds = number('timestampSeconds', null);
  const offsetSeconds = number('offsetSeconds', null);
  const locale = select(
    'locale',
    localeConfigurations,
    localeConfigurations[0]
  );
  const whenEnded = select(
    'whenEnded',
    whenEndedConfigurations,
    whenEndedConfigurations[0]
  );
  const biggestUnit = select(
    'biggestUnit',
    biggestUnitConfigurations,
    biggestUnitConfigurations[0]
  );

  return (
    <div>
      <DateCountdown
        endDate={endDate}
        timeleftMs={timeleftMs}
        timestampMs={timestampMs}
        timestampSeconds={timestampSeconds}
        offsetSeconds={offsetSeconds}
        locale={locale}
        whenEnded={whenEnded}
        biggestUnit={biggestUnit}
        render={(data) => (
          <div>
            <span>{`Days ${data.days} ${data.dd} ${data.d}`}</span>
            <br />
            <span>{`Hours ${data.hours} ${data.hh} ${data.h}`}</span>
            <br />
            <span>{`Minutes ${data.minutes} ${data.mm} ${data.m}`}</span>
            <br />
            <span>{`Seconds ${data.seconds} ${data.ss} ${data.s}`}</span>
          </div>
        )}
      ></DateCountdown>
    </div>
  );
};
