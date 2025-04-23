import {getDate} from '#core/types/date';

import * as Preact from '#preact';
import {useEffect, useMemo, useRef, useState} from '#preact';
import {Wrapper} from '#preact/component';
import {useRenderer} from '#preact/component/renderer';
import {useAmpContext} from '#preact/context';
import {useResourcesNotify} from '#preact/utils';

import {getLocaleStrings} from './messages';

const NAME = 'DateCountdown';

// Constants
/** @const {number} */
const MILLISECONDS_IN_DAY = 24 * 60 * 60 * 1000;

/** @const {number} */
const MILLISECONDS_IN_HOUR = 60 * 60 * 1000;

/** @const {number} */
const MILLISECONDS_IN_MINUTE = 60 * 1000;

/** @const {number} */
const MILLISECONDS_IN_SECOND = 1000;

/** @const {number} */
const DELAY = 1000;

/** @const {{[key: string]: number}} */
const TimeUnit = {
  DAYS: 1,
  HOURS: 2,
  MINUTES: 3,
  SECONDS: 4,
};

// Default prop values
const DEFAULT_LOCALE = 'en';
const DEFAULT_WHEN_ENDED = 'stop';
const DEFAULT_BIGGEST_UNIT = 'DAYS';
const DEFAULT_COUNT_UP = false;

/**
 * @param {!JsonObject} data
 * @return {string}
 */
const DEFAULT_RENDER = (data) =>
  /** @type {string} */ (
    `${data['days']} ${data['dd']}, ` +
      `${data['hours']} ${data['hh']}, ` +
      `${data['minutes']} ${data['mm']}, ` +
      `${data['seconds']} ${data['ss']}`
  );

/**
 * @param {!BentoDateCountdownDef.Props} props
 * @return {PreactDef.Renderable}
 */
export function BentoDateCountdown({
  biggestUnit = DEFAULT_BIGGEST_UNIT,
  countUp = DEFAULT_COUNT_UP,
  datetime,
  locale = DEFAULT_LOCALE,
  render = DEFAULT_RENDER,
  whenEnded = DEFAULT_WHEN_ENDED,
  ...rest
}) {
  useResourcesNotify();
  const {playable} = useAmpContext();

  // Compute these values once
  const epoch = useMemo(() => getDate(datetime), [datetime]);
  const localeStrings = useMemo(
    () => getLocaleWord(/** @type {string} */ (locale)),
    [locale]
  );

  // timeleft is updated on each interval callback
  const [timeleft, setTimeleft] = useState(epoch - Date.now() + DELAY);

  // Only update data when timeleft (or other dependencies) are updated
  // Does not update on 2nd render triggered by useRenderer
  const data = useMemo(
    () => getDataForTemplate(timeleft, biggestUnit, localeStrings, countUp),
    [timeleft, biggestUnit, localeStrings, countUp]
  );

  // Reference to DOM element to get access to correct window
  const rootRef = useRef(null);

  useEffect(() => {
    if (!playable || !rootRef.current) {
      return;
    }
    const win = rootRef.current.ownerDocument.defaultView;
    const interval = win.setInterval(() => {
      const newTimeleft = epoch - Date.now() + DELAY;
      setTimeleft(newTimeleft);
      if (whenEnded === DEFAULT_WHEN_ENDED && newTimeleft < 1000) {
        win.clearInterval(interval);
      }
    }, DELAY);
    return () => win.clearInterval(interval);
  }, [playable, epoch, whenEnded]);

  const rendered = useRenderer(render, data);
  const isHtml =
    rendered && typeof rendered == 'object' && '__html' in rendered;

  return (
    <Wrapper
      {...rest}
      ref={rootRef}
      dangerouslySetInnerHTML={isHtml ? rendered : null}
    >
      {isHtml ? null : rendered}
    </Wrapper>
  );
}

/**
 * @param {number} timeleft
 * @param {string|undefined} biggestUnit
 * @param {!JsonObject} localeStrings
 * @param {boolean} countUp
 * @return {!JsonObject}
 */
function getDataForTemplate(timeleft, biggestUnit, localeStrings, countUp) {
  return /** @type {!JsonObject} */ ({
    ...getYDHMSFromMs(timeleft, /** @type {string} */ (biggestUnit), countUp),
    ...localeStrings,
  });
}

/**
 * Return an object with a label for 'years', 'months', etc. based on the
 * user provided locale string.
 * @param {string} locale
 * @return {!JsonObject}
 */
function getLocaleWord(locale) {
  if (getLocaleStrings(locale) === undefined) {
    displayWarning(
      `Invalid locale ${locale}, defaulting to ${DEFAULT_LOCALE}. ${NAME}`
    );
    locale = DEFAULT_LOCALE;
  }
  const localeWordList = getLocaleStrings(locale);
  return {
    'years': localeWordList[0],
    'months': localeWordList[1],
    'days': localeWordList[2],
    'hours': localeWordList[3],
    'minutes': localeWordList[4],
    'seconds': localeWordList[5],
  };
}

/**
 * Converts a time represented in milliseconds (ms) into a representation with
 * days, hours, minutes, etc. and returns formatted strings in an object.
 * @param {number} ms
 * @param {string} biggestUnit
 * @param {boolean} countUp
 * @return {JsonObject}
 */
function getYDHMSFromMs(ms, biggestUnit, countUp) {
  // If 'count-up' prop is true, we return the negative of what
  // we would originally return since we are counting time-elapsed from a
  // set time instead of time until that time
  if (countUp) {
    ms *= -1;
  }

  //Math.trunc is used instead of Math.floor to support negative past date
  const d =
    TimeUnit[biggestUnit] == TimeUnit.DAYS
      ? supportBackDate(Math.floor(ms / MILLISECONDS_IN_DAY))
      : 0;
  const h =
    TimeUnit[biggestUnit] == TimeUnit.HOURS
      ? supportBackDate(Math.floor(ms / MILLISECONDS_IN_HOUR))
      : TimeUnit[biggestUnit] < TimeUnit.HOURS
        ? supportBackDate(
            Math.floor((ms % MILLISECONDS_IN_DAY) / MILLISECONDS_IN_HOUR)
          )
        : 0;
  const m =
    TimeUnit[biggestUnit] == TimeUnit.MINUTES
      ? supportBackDate(Math.floor(ms / MILLISECONDS_IN_MINUTE))
      : TimeUnit[biggestUnit] < TimeUnit.MINUTES
        ? supportBackDate(
            Math.floor((ms % MILLISECONDS_IN_HOUR) / MILLISECONDS_IN_MINUTE)
          )
        : 0;
  const s =
    TimeUnit[biggestUnit] == TimeUnit.SECONDS
      ? supportBackDate(Math.floor(ms / MILLISECONDS_IN_SECOND))
      : supportBackDate(
          Math.floor((ms % MILLISECONDS_IN_MINUTE) / MILLISECONDS_IN_SECOND)
        );

  return {
    'd': d,
    'dd': padStart(d),
    'h': h,
    'hh': padStart(h),
    'm': m,
    'mm': padStart(m),
    's': s,
    'ss': padStart(s),
  };
}

/**
 * Format a number for output to the template.  Adds a leading zero if the
 * input is only one digit and a negative sign for inputs less than 0.
 * @param {number} input
 * @return {string}
 */
function padStart(input) {
  if (input < -9 || input > 9) {
    return String(input);
  } else if (input >= -9 && input < 0) {
    return '-0' + -input;
  }
  return '0' + input;
}

/**
 * @param {number} input
 * @return {number}
 */
function supportBackDate(input) {
  if (input < 0) {
    return input + 1;
  }
  return input;
}

/**
 * @param {?string} message
 */
function displayWarning(message) {
  console /*OK*/
    .warn(message);
}
