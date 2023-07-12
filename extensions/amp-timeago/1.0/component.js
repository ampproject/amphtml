import {devAssertElement} from '#core/assert';
import {getDate} from '#core/types/date';
import {getWin} from '#core/window';

import * as Preact from '#preact';
import {useCallback, useRef, useState} from '#preact';
import {Wrapper} from '#preact/component';
import {useIntersectionObserver} from '#preact/component/intersection-observer';
import {useMergeRefs, useResourcesNotify} from '#preact/utils';

import {format, getLocale} from './locales';

/** @const {string} */
const DEFAULT_LOCALE = 'en_US';

/** @const {!{[key: string]: *}} */
const DEFAULT_DATETIME_OPTIONS = {
  'year': 'numeric',
  'month': 'short',
  'day': 'numeric',
  'hour': 'numeric',
  'minute': 'numeric',
};

/** @const {!{[key: string]: *}} */
const DEFAULT_TIME_OPTIONS = {'hour': 'numeric', 'minute': 'numeric'};

/**
 * @param {!BentoTimeagoProps} props
 * @return {PreactDef.Renderable}
 */
export function BentoTimeago({
  cutoff,
  datetime,
  locale: localeProp,
  placeholder,
  ...rest
}) {
  const [timestamp, setTimestamp] = useState(placeholder || '');
  const ref = useRef(null);

  const date = getDate(datetime);

  const ioCallback = useCallback(
    ({isIntersecting}) => {
      if (!isIntersecting) {
        return;
      }
      const node = devAssertElement(ref.current);
      let {lang} = node.ownerDocument.documentElement;
      const win = getWin(node);
      if (lang === 'unknown') {
        lang = win.navigator?.language || DEFAULT_LOCALE;
      }
      const locale = getLocale(localeProp || lang);
      setTimestamp(
        getFuzzyTimestampValue(new Date(date), locale, cutoff, placeholder)
      );
    },
    [cutoff, date, localeProp, placeholder]
  );

  const inObRef = useIntersectionObserver(ioCallback);

  useResourcesNotify();

  return (
    <Wrapper
      {...rest}
      as="time"
      ref={useMergeRefs([ref, inObRef])}
      datetime={new Date(date).toISOString()}
    >
      {timestamp}
    </Wrapper>
  );
}

/**
 * @param {!Date} date
 * @param {string} locale
 * @param {number|undefined} cutoff
 * @param {string|!PreactDef.VNode|null|undefined} placeholder
 * @return {string|!PreactDef.VNode}
 */
function getFuzzyTimestampValue(date, locale, cutoff, placeholder) {
  if (!cutoff) {
    return format(date, locale);
  }
  const secondsAgo = Math.floor((Date.now() - date.getTime()) / 1000);

  if (secondsAgo > cutoff) {
    return placeholder ? placeholder : getDefaultPlaceholder(date, locale);
  }
  return format(date, locale);
}

/**
 * @param {Date} date
 * @param {string} locale
 * @return {string}
 */
function getDefaultPlaceholder(date, locale) {
  if (date.toLocaleDateString() == new Date().toLocaleDateString()) {
    // Same date: time is enough.
    return date.toLocaleTimeString(locale, DEFAULT_TIME_OPTIONS);
  }
  return date.toLocaleString(locale, DEFAULT_DATETIME_OPTIONS);
}
