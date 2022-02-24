import * as Preact from '#preact';

import {BentoDateDisplay} from '../component';

export default {
  title: 'DateDisplay',
  component: BentoDateDisplay,
  argTypes: {
    dateTime: {
      name: 'Date/time',
      defaultValue: '2017-08-02T15:05:05.000',
      control: {type: 'text'},
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

export const Default = ({dateTime, displayIn, locale, ...args}) => {
  return (
    <BentoDateDisplay
      dateTime={dateTime}
      displayIn={displayIn}
      locale={locale}
      render={(date) => (
        <div>{`ISO: ${date.iso}; locale: ${date.localeString}`}</div>
      )}
      {...args}
    />
  );
};

export const DefaultRenderer = ({dateTime, displayIn, locale, ...args}) => {
  return (
    <BentoDateDisplay
      datetime={dateTime}
      displayIn={displayIn}
      locale={locale}
      {...args}
    />
  );
};
