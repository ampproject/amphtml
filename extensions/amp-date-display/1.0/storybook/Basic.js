import {date, select, withKnobs} from '@storybook/addon-knobs';

import * as Preact from '#preact';

import {BentoDateDisplay} from '../component';

export default {
  title: 'DateDisplay',
  component: BentoDateDisplay,
  decorators: [withKnobs],
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
    <BentoDateDisplay
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
    <BentoDateDisplay
      datetime={dateTime}
      displayIn={displayIn}
      locale={locale}
    />
  );
};
