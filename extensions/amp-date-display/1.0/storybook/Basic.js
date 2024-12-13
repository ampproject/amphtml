import * as Preact from '#preact';

import {BentoDateDisplay} from '../component';

export default {
  title: 'DateDisplay',
  component: BentoDateDisplay,
  argTypes: {
    datetime: {
      name: 'Date/time',
      control: {type: 'date'},
      defaultValue: Date.now(),
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

export const Default = ({datetime, displayIn, locale, ...args}) => {
  return (
    <BentoDateDisplay
      datetime={datetime}
      displayIn={displayIn}
      locale={locale}
      render={(date) => (
        <div>{`ISO: ${date.iso}; locale: ${date.localeString}`}</div>
      )}
      {...args}
    />
  );
};

export const DefaultRenderer = ({datetime, displayIn, locale, ...args}) => {
  return (
    <BentoDateDisplay
      datetime={datetime}
      displayIn={displayIn}
      locale={locale}
      {...args}
    />
  );
};
