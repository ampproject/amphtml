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
import {date, select, withKnobs} from '@storybook/addon-knobs';
import {withA11y} from '@storybook/addon-a11y';

export default {
  title: 'DateDisplay',
  component: DateDisplay,
  decorators: [withA11y, withKnobs],
};

const DISPLAY_IN_OPTIONS = ['utc', 'local'];
const LOCALES = ['en-US', 'en-GB', 'fr', 'ru', 'ar', 'he', 'ja'];

export const _default = () => {
  const dateTime = date('Date/time', new Date());
  const displayIn = select(
    'Display in',
    DISPLAY_IN_OPTIONS,
    DISPLAY_IN_OPTIONS[0]
  );
  const locale = select('Locale', LOCALES, LOCALES[0]);
  return (
    <DateDisplay
      datetime={dateTime}
      displayIn={displayIn}
      locale={locale}
      render={(date) => (
        <div>{`ISO: ${date.iso}; locale: ${date.localeString}`}</div>
      )}
    />
  );
};

export const defaultRenderer = () => {
  const displayIn = select(
    'Display in',
    DISPLAY_IN_OPTIONS,
    DISPLAY_IN_OPTIONS[0]
  );
  const dateTime = date('Date/time', new Date());
  const locale = select('Locale', LOCALES, LOCALES[0]);
  return (
    <DateDisplay datetime={dateTime} displayIn={displayIn} locale={locale} />
  );
};
