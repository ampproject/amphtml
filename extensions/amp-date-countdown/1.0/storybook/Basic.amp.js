import {withAmp} from '@ampproject/storybook-addon';
import {boolean, date, select, text, withKnobs} from '@storybook/addon-knobs';

import * as Preact from '#preact';

export default {
  title: 'amp-date-countdown-1_0',
  decorators: [withKnobs, withAmp],

  parameters: {
    extensions: [
      {name: 'amp-date-countdown', version: '1.0'},
      {name: 'amp-mustache', version: '0.2'},
    ],
    experiments: ['bento'],
  },
};

const DATE_ATTRIBUTE_CONFIGURATIONS = [
  'end-date',
  'timeleft-ms',
  'timestamp-ms',
  'timestamp-seconds',
];

const LOCALE_CONFIGURATIONS = [
  'google',
  'de',
  'en',
  'es',
  'fr',
  'id',
  'it',
  'ja',
  'ko',
  'nl',
  'pt',
  'ru',
  'th',
  'tr',
  'vi',
  'zh-cn',
  'zh-tw',
];

const WHEN_ENDED_CONFIGURATIONS = ['stop', 'continue'];

const BIGGEST_UNIT_CONFIGURATIONS = [
  null,
  'DAYS',
  'HOURS',
  'MINUTES',
  'SECONDS',
];

export const Default = () => {
  const dateAttribute = select(
    'Select a "Date Attribute"',
    DATE_ATTRIBUTE_CONFIGURATIONS,
    DATE_ATTRIBUTE_CONFIGURATIONS[0]
  );
  const endDate = date('end-date', new Date(Date.now() + 10000));
  const timeleftMs = text('timeleft-ms', 20000);
  const timestampMs = text('timestamp-ms', Date.now() + 30000);
  const timestampSeconds = text(
    'timestamp-seconds',
    Math.floor(Date.now() / 1000) + 40
  );

  const offsetSeconds = text('offset-seconds', 0);
  const locale = select(
    'locale',
    LOCALE_CONFIGURATIONS,
    LOCALE_CONFIGURATIONS[0]
  );
  const whenEnded = select(
    'whenEnded',
    WHEN_ENDED_CONFIGURATIONS,
    WHEN_ENDED_CONFIGURATIONS[0]
  );
  const biggestUnit = select(
    'biggestUnit',
    BIGGEST_UNIT_CONFIGURATIONS,
    BIGGEST_UNIT_CONFIGURATIONS[0]
  );
  const countUp = boolean('count-up', false);

  return (
    <amp-date-countdown
      end-date={dateAttribute === 'end-date' ? new Date(endDate) : undefined}
      timeleft-ms={dateAttribute === 'timeleft-ms' ? timeleftMs : undefined}
      timestamp-ms={dateAttribute === 'timestamp-ms' ? timestampMs : undefined}
      timestamp-seconds={
        dateAttribute === 'timestamp-seconds' ? timestampSeconds : undefined
      }
      offset-seconds={offsetSeconds}
      locale={locale}
      when-ended={whenEnded}
      biggest-unit={biggestUnit}
      count-up={countUp}
      layout="fixed-height"
      height="100"
    >
      <template type="amp-mustache">
        <div>
          <span>{'{{days}} {{dd}} {{d}}'}</span>
          <br />
          <span>{'{{hours}} {{hh}} {{h}}'}</span>
          <br />
          <span>{'{{minutes}} {{mm}} {{m}}'}</span>
          <br />
          <span>{'{{seconds}} {{ss}} {{s}}'}</span>
        </div>
      </template>
    </amp-date-countdown>
  );
};

Default.storyName = 'default';

export const DefaultRenderer = () => {
  const dateAttribute = select(
    'Select a "Date Attribute"',
    DATE_ATTRIBUTE_CONFIGURATIONS,
    DATE_ATTRIBUTE_CONFIGURATIONS[0]
  );
  const endDate = date('end-date', new Date(Date.now() + 10000));
  const timeleftMs = text('timeleft-ms', 20000);
  const timestampMs = text('timestamp-ms', Date.now() + 30000);
  const timestampSeconds = text(
    'timestamp-seconds',
    Math.floor(Date.now() / 1000) + 40
  );

  const offsetSeconds = text('offset-seconds', 0);
  const locale = select(
    'locale',
    LOCALE_CONFIGURATIONS,
    LOCALE_CONFIGURATIONS[0]
  );
  const whenEnded = select(
    'whenEnded',
    WHEN_ENDED_CONFIGURATIONS,
    WHEN_ENDED_CONFIGURATIONS[0]
  );
  const biggestUnit = select(
    'biggestUnit',
    BIGGEST_UNIT_CONFIGURATIONS,
    BIGGEST_UNIT_CONFIGURATIONS[0]
  );
  const countUp = boolean('count-up', false);

  return (
    <amp-date-countdown
      end-date={dateAttribute === 'end-date' ? new Date(endDate) : undefined}
      timeleft-ms={dateAttribute === 'timeleft-ms' ? timeleftMs : undefined}
      timestamp-ms={dateAttribute === 'timestamp-ms' ? timestampMs : undefined}
      timestamp-seconds={
        dateAttribute === 'timestamp-seconds' ? timestampSeconds : undefined
      }
      offset-seconds={offsetSeconds}
      locale={locale}
      when-ended={whenEnded}
      biggest-unit={biggestUnit}
      count-up={countUp}
      layout="fixed-height"
      height="100"
    ></amp-date-countdown>
  );
};

DefaultRenderer.storyName = 'default renderer';

export const ExternalTemplate = () => {
  const template = select('template', ['template1', 'template2'], 'template1');
  const dateAttribute = select(
    'Select a "Date Attribute"',
    DATE_ATTRIBUTE_CONFIGURATIONS,
    DATE_ATTRIBUTE_CONFIGURATIONS[0]
  );
  const endDate = date('end-date', new Date(Date.now() + 10000));
  const timeleftMs = text('timeleft-ms', 20000);
  const timestampMs = text('timestamp-ms', Date.now() + 30000);
  const timestampSeconds = text(
    'timestamp-seconds',
    Math.floor(Date.now() / 1000) + 40
  );

  const offsetSeconds = text('offset-seconds', 0);
  const locale = select(
    'locale',
    LOCALE_CONFIGURATIONS,
    LOCALE_CONFIGURATIONS[0]
  );
  const whenEnded = select(
    'whenEnded',
    WHEN_ENDED_CONFIGURATIONS,
    WHEN_ENDED_CONFIGURATIONS[0]
  );
  const biggestUnit = select(
    'biggestUnit',
    BIGGEST_UNIT_CONFIGURATIONS,
    BIGGEST_UNIT_CONFIGURATIONS[0]
  );
  const countUp = boolean('count-up', false);

  return (
    <div>
      <template type="amp-mustache" id="template1">
        <div>
          {`Template 1: {{s}} {{seconds}} {{m}} {{minutes}} {{h}} {{hours}}` +
            ` {{d}} {{days}} `}
        </div>
      </template>
      <template type="amp-mustache" id="template2">
        <div>
          {`Template 2: {{dd}} {{days}} {{hh}} {{hours}} {{mm}}` +
            ` {{minutes}} {{ss}} {{seconds}}`}
        </div>
      </template>
      <amp-date-countdown
        end-date={dateAttribute === 'end-date' ? new Date(endDate) : undefined}
        timeleft-ms={dateAttribute === 'timeleft-ms' ? timeleftMs : undefined}
        timestamp-ms={
          dateAttribute === 'timestamp-ms' ? timestampMs : undefined
        }
        timestamp-seconds={
          dateAttribute === 'timestamp-seconds' ? timestampSeconds : undefined
        }
        offset-seconds={offsetSeconds}
        locale={locale}
        when-ended={whenEnded}
        biggest-unit={biggestUnit}
        count-up={countUp}
        template={template}
        layout="fixed-height"
        height="100"
      ></amp-date-countdown>
    </div>
  );
};

ExternalTemplate.storyName = 'external template';
