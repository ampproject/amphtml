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
import {Timeago} from '../timeago';
import {date, number, select, text, withKnobs} from '@storybook/addon-knobs';
import {withA11y} from '@storybook/addon-a11y';

export default {
  title: 'Timeago',
  component: Timeago,
  decorators: [withA11y, withKnobs],
};

const LOCALES = ['en-US', 'en-GB', 'fr', 'ru', 'ar', 'he', 'ja'];

export const _default = () => {
  const dateTime = date('Date/time', new Date());
  const cutoff = number('Cutoff (seconds)', 0);
  const placeholder = text('Cutoff placeholder', 'Time passed!');
  const userLocale = navigator.language || 'en-US';
  const allLocales = [userLocale].concat(
    LOCALES.filter((locale) => locale != userLocale)
  );
  const locale = select('Locale', allLocales, userLocale);
  return (
    <Timeago
      datetime={new Date(dateTime).toISOString()}
      locale={locale}
      cutoff={cutoff}
      placeholder={placeholder}
    />
  );
};
