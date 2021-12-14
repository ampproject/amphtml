import moment from 'moment';

import {scopedQuerySelector} from '#core/dom/query';

import * as Preact from '#preact';
import {useCallback, useEffect, useRef, useState} from '#preact';
import {ContainWrapper} from '#preact/component';

const DEFAULT_INPUT_SELECTOR = '#date';
const DEFAULT_START_INPUT_SELECTOR = '#startdate';
const DEFAULT_END_INPUT_SELECTOR = '#enddate';
const ISO_8601 = 'YYYY-MM-DD';
const DEFAULT_LOCALE = 'en';

const TYPES = {
  SINGLE: 'single',
  RANGE: 'range',
};

/**
 * @param {!BentoDatePicker.Props} props
 * @return {PreactDef.Renderable}
 */
export function BentoDatePicker({
  children,
  type = TYPES.SINGLE,
  inputSelector = DEFAULT_INPUT_SELECTOR,
  startInputSelector = DEFAULT_START_INPUT_SELECTOR,
  endInputSelector = DEFAULT_END_INPUT_SELECTOR,
  format = ISO_8601,
  locale = DEFAULT_LOCALE,
  ...rest
}) {
  const wrapperRef = useRef();
  const [date, setDate] = useState();
  const [startDate, setStartDate] = useState();
  const [endDate, setEndDate] = useState();

  /**
   * Forgivingly parse an ISO8601 input string into a moment object,
   * preferring the date picker's configured format.
   * @param {string} value
   * @return {?moment} date
   */
  const parseDate = useCallback(
    (value) => {
      const dateAsMoment = moment(value, format);
      if (dateAsMoment.isValid()) {
        return dateAsMoment;
      }
      return moment(value);
    },
    [format]
  );

  /**
   * Formats a date in the page's locale and the element's configured format.
   * @param {?moment} date
   * @return {string}
   * @private
   */
  const getFormattedDate = useCallback(
    (dateAsMoment) => {
      if (!dateAsMoment) {
        return '';
      }
      const isUnixTimestamp = format.match(/[Xx]/);
      const _locale = isUnixTimestamp ? DEFAULT_LOCALE : locale;
      return dateAsMoment.clone().locale(_locale).format(format);
    },
    [format, locale]
  );

  useEffect(() => {
    if (type === TYPES.RANGE) {
      const startDateInputElement = scopedQuerySelector(
        wrapperRef.current,
        startInputSelector
      );
      const endDateInputElement = scopedQuerySelector(
        wrapperRef.current,
        endInputSelector
      );
      if (startDateInputElement?.value) {
        setStartDate(parseDate(startDateInputElement.value));
      }
      if (endDateInputElement?.value) {
        setEndDate(parseDate(endDateInputElement.value));
      }
    } else {
      const inputElement = scopedQuerySelector(
        wrapperRef.current,
        inputSelector
      );
      if (inputElement?.value) {
        setDate(parseDate(inputElement.value));
      }
    }
  }, [
    wrapperRef,
    inputSelector,
    setDate,
    startInputSelector,
    endInputSelector,
    type,
    parseDate,
  ]);

  return (
    <ContainWrapper
      ref={wrapperRef}
      data-date={getFormattedDate(date)}
      data-startdate={getFormattedDate(startDate)}
      data-enddate={getFormattedDate(endDate)}
      {...rest}
    >
      {children}
    </ContainWrapper>
  );
}
