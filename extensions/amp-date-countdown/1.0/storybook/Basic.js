import * as Preact from '#preact';

import {BentoDateCountdown} from '../component';

export default {
  title: 'DateCountdown',
  component: BentoDateCountdown,
  argTypes: {
    datetime: {
      name: 'datetime',
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
    whenEnded: {
      name: 'whenEnded',
      defaultValue: 'stop',
      control: {type: 'inline-radio'},
      options: ['stop', 'continue'],
    },
    biggestUnit: {
      name: 'biggestUnit',
      control: {type: 'inline-radio'},
      defaultValue: null,
      options: [null, 'DAYS', 'HOURS', 'MINUTES', 'SECONDS'],
    },
  },

  args: {
    countUp: false,
  },
};

export const _default = (args) => {
  return (
    <div>
      <BentoDateCountdown
        {...args}
        render={(data) => (
          <div>
            <span>{`${data.days} ${data.dd} ${data.d}`}</span>
            <br />
            <span>{`${data.hours} ${data.hh} ${data.h}`}</span>
            <br />
            <span>{`${data.minutes} ${data.mm} ${data.m}`}</span>
            <br />
            <span>{`${data.seconds} ${data.ss} ${data.s}`}</span>
          </div>
        )}
      />
    </div>
  );
};

export const defaultRenderer = (args) => {
  return (
    <div>
      <BentoDateCountdown {...args} />
    </div>
  );
};
