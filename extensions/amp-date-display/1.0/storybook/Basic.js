import * as Preact from '#preact';

import {BentoDateDisplay} from '../component';

export default {
  title: 'DateDisplay',
  component: BentoDateDisplay,
  argTypes: {
    dateTime: {
      name: 'Date/time',
      control: {type: 'date'},
    },
    displayIn: {
      name: 'Display in',
      defaultValue: 'utc',
      options: ['utc', 'local'],
      control: {type: 'select'},
    },
    locale: {
      name: 'Locale',
      defaultValue: 'en-US',
      options: ['en-US', 'en-GB', 'fr', 'ru', 'ar', 'he', 'ja'],
      control: {type: 'select'},
    },
  },
};

export const _default = ({dateTime, displayIn, locale, ...args}) => {
  return (
    <BentoDateDisplay
      {...args}
      dateTime={dateTime}
      displayIn={displayIn}
      locale={locale}
      render={(date) => (
        <div>{`ISO: ${date.iso}; locale: ${date.localeString}`}</div>
      )}
    />
  );
};

export const defaultRenderer = ({dateTime, displayIn, locale}) => {
  return (
    <BentoDateDisplay
      datetime={dateTime}
      displayIn={displayIn}
      locale={locale}
    />
  );
};
