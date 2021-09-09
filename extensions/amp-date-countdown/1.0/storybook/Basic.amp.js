import {withAmp} from '@ampproject/storybook-addon';

import * as Preact from '#preact';

export default {
  title: 'amp-date-countdown-1_0',
  decorators: [withAmp],
  parameters: {
    extensions: [
      {name: 'amp-date-countdown', version: '1.0'},
      {name: 'amp-mustache', version: '0.2'},
    ],
    experiments: ['bento'],
  },
  argTypes: {
    dateAttribute: {
      name: 'date attribute',
      control: {type: 'radio'},
      defaultValue: 'end-date',
      options: ['end-date', 'timeleft-ms', 'timestamp-ms', 'timestamp-seconds'],
    },
    'end-date': {
      name: 'end date',
      defaultValue: new Date(Date.now() + 10000),
      control: {type: 'date'},
    },
    locale: {
      name: 'locale',
      control: {type: 'select'},
      defaultValue: 'en',
      options: [
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
      ],
    },
    'when-ended': {
      name: 'when-ended',
      defaultValue: 'stop',
      control: {type: 'inline-radio'},
      options: ['stop', 'continue'],
    },
    'biggest-unit': {
      name: 'biggest-unit',
      control: {type: 'inline-radio'},
      defaultValue: null,
      options: [null, 'DAYS', 'HOURS', 'MINUTES', 'SECONDS'],
    },
  },
  args: {
    'timeleft-ms': 20000,
    'timestamp-ms': Date.now() + 30000,
    'timestamp-seconds': Math.floor(Date.now() / 1000) + 40,
    'offset-seconds': 0,
    'count-up': false,
  },
};

const AmpDateCountdownUsingArgs = ({children, dateAttribute, ...args}) => {
  return (
    <amp-date-countdown
      {...args}
      end-date={
        dateAttribute === 'end-date'
          ? new Date(args['end-date']).toISOString()
          : undefined
      }
      timeleft-ms={
        dateAttribute === 'timeleft-ms' ? args['timeleft-ms'] : undefined
      }
      timestamp-ms={
        dateAttribute === 'timestamp-ms' ? args['timestamp-ms'] : undefined
      }
      timestamp-seconds={
        dateAttribute === 'timestamp-seconds'
          ? args['timestamp-seconds']
          : undefined
      }
    >
      {children}
    </amp-date-countdown>
  );
};

export const Default = (args) => {
  return (
    <AmpDateCountdownUsingArgs height="100" {...args}>
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
    </AmpDateCountdownUsingArgs>
  );
};

export const DefaultRenderer = (args) => {
  return <AmpDateCountdownUsingArgs height="100" {...args} />;
};

export const ExternalTemplate = (args) => {
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
      <AmpDateCountdownUsingArgs height="100" {...args} />
    </div>
  );
};

ExternalTemplate.argTypes = {
  template: {
    name: 'template',
    control: {type: 'inline-radio'},
    defaultValue: 'template1',
    options: ['template1', 'template2'],
  },
};
