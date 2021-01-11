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
import {date, select, withKnobs} from '@storybook/addon-knobs';
import {withA11y} from '@storybook/addon-a11y';
import {withAmp} from '@ampproject/storybook-addon';

const DISPLAY_IN_OPTIONS = ['utc', 'local'];
const LOCALES = ['en-US', 'en-GB', 'fr', 'ru', 'ar', 'he', 'ja'];

export default {
  title: 'amp-date-display-1_0',
  decorators: [withKnobs, withA11y, withAmp],

  parameters: {
    extensions: [
      {name: 'amp-date-display', version: '1.0'},
      {name: 'amp-mustache', version: '0.2'},
    ],

    experiments: ['bento'],
  },
};

export const Default = () => {
  const datetime = new Date(date('Date/Time', new Date())).toISOString();
  const displayIn = select(
    'Display in',
    DISPLAY_IN_OPTIONS,
    DISPLAY_IN_OPTIONS[0]
  );
  const locale = select('Locale', LOCALES, LOCALES[0]);
  return (
    <amp-date-display
      datetime={datetime}
      display-in={displayIn}
      locale={locale}
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
};

Default.story = {
  name: 'default',
};

export const DefaultRenderer = () => {
  const datetime = new Date(date('Date/Time', new Date())).toISOString();
  const displayIn = select(
    'Display in',
    DISPLAY_IN_OPTIONS,
    DISPLAY_IN_OPTIONS[0]
  );
  const locale = select('Locale', LOCALES, LOCALES[0]);
  return (
    <amp-date-display
      datetime={datetime}
      display-in={displayIn}
      locale={locale}
      layout="responsive"
      width="100"
      height="100"
    />
  );
};

DefaultRenderer.story = {
  name: 'default renderer',
};

export const ExternalTemplate = () => {
  const datetime = new Date(date('Date/Time', new Date())).toISOString();
  const displayIn = select(
    'Display in',
    DISPLAY_IN_OPTIONS,
    DISPLAY_IN_OPTIONS[0]
  );
  const locale = select('Locale', LOCALES, LOCALES[0]);
  const template = select('Template', ['template1', 'template2'], 'template1');
  return (
    <div>
      <template type="amp-mustache" id="template1">
        <div>{`Template1: {{dayName}} {{day}} {{monthName}} {{year}}`}</div>
      </template>
      <template type="amp-mustache" id="template2">
        <div>{`Template2: {{day}} {{month}} {{year}}`}</div>
      </template>
      <amp-date-display
        datetime={datetime}
        display-in={displayIn}
        locale={locale}
        template={template}
        layout="responsive"
        width="100"
        height="100"
      ></amp-date-display>
    </div>
  );
};

ExternalTemplate.story = {
  name: 'external template',
};
