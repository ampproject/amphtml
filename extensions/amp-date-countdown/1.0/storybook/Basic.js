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
import {date, object, select, text, withKnobs} from '@storybook/addon-knobs';
import {withA11y} from '@storybook/addon-a11y';

export default {
  title: 'Date Countdown',
  component: DateCountdown,
  decorators: [withA11y, withKnobs],
};

export const _default = () => {
  const knobConfigurations = [
    'email',
    'facebook',
    'linkedin',
    'pinterest',
    'tumblr',
    'twitter',
    'whatsapp',
    'line',
    'sms',
    'system',
    'custom endpoint',
    undefined,
    '',
    'random',
  ];
  const type = select('type', knobConfigurations, knobConfigurations[0]);
  const endpoint = text('customEndpoint', undefined);
  const additionalParams = object('additionalParams', {'subject': 'test'});
  const target = text('target', undefined);
  const width = text('width', undefined);
  const height = text('height', undefined);

  const dateTime = date('Date/time', new Date(10000000));

  return (
    <div>
      <DateCountdown
        timeStampe={'blah'}
        timeleftMs={5000}
        target={dateTime}
        locale="de"
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
