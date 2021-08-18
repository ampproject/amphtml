

import {boolean, date, select, withKnobs} from '@storybook/addon-knobs';

import * as Preact from '#preact';

import {DateCountdown} from '../component';

export default {
  title: 'DateCountdown',
  component: DateCountdown,
  decorators: [withKnobs],
};

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

export const _default = () => {
  const datetime = date('endDate', new Date(Date.now() + 10000));
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
  const countUp = boolean('countUp', false);

  return (
    <div>
      <DateCountdown
        datetime={datetime}
        locale={locale}
        whenEnded={whenEnded}
        biggestUnit={biggestUnit}
        countUp={countUp}
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
      ></DateCountdown>
    </div>
  );
};

export const defaultRenderer = () => {
  const datetime = date('endDate', new Date(Date.now() + 10000));
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
  const countUp = boolean('countUp', false);

  return (
    <div>
      <DateCountdown
        datetime={datetime}
        locale={locale}
        whenEnded={whenEnded}
        biggestUnit={biggestUnit}
        countUp={countUp}
      ></DateCountdown>
    </div>
  );
};
