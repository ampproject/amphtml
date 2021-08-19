import {withAmp} from '@ampproject/storybook-addon';
import {date, select, withKnobs} from '@storybook/addon-knobs';

import * as Preact from '#preact';

const DISPLAY_IN_OPTIONS = ['utc', 'local'];
const LOCALES = ['en-US', 'en-GB', 'fr', 'ru', 'ar', 'he', 'ja'];

export default {
  title: 'amp-date-display-1_0',
  decorators: [withKnobs, withAmp],

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

Default.storyName = 'default';

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

DefaultRenderer.storyName = 'default renderer';

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

ExternalTemplate.storyName = 'external template';
