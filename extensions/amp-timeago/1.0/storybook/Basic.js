import {date, number, select, text, withKnobs} from '@storybook/addon-knobs';

import * as Preact from '#preact';

import {BentoTimeago} from '../component';

export default {
  title: 'Timeago',
  component: BentoTimeago,
  decorators: [withKnobs],
};

const LOCALES = [
  'en-US',
  'en-GB',
  'fr',
  'ru',
  'ar',
  'he',
  'ja',
  'ZhTw',
  'zH-Tw',
];

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
    <BentoTimeago
      datetime={dateTime}
      locale={locale}
      cutoff={cutoff}
      placeholder={placeholder}
    />
  );
};
