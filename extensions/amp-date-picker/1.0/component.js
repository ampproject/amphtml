import moment from 'moment';

import {
  closestAncestorElementBySelector,
  scopedQuerySelector,
} from '#core/dom/query';

import * as Preact from '#preact';
import {useCallback, useEffect, useMemo, useRef, useState} from '#preact';
import {ContainWrapper} from '#preact/component';

const DEFAULT_INPUT_SELECTOR = '#date';
const DEFAULT_START_INPUT_SELECTOR = '#startdate';
const DEFAULT_END_INPUT_SELECTOR = '#enddate';
const ISO_8601 = 'YYYY-MM-DD';
const DEFAULT_LOCALE = 'en';
const FORM_INPUT_SELECTOR = 'form';

/** @enum {string} */
const DatePickerMode = {
  STATIC: 'static',
  OVERLAY: 'overlay',
};

/** @enum {string} */
const DatePickerType = {
  SINGLE: 'single',
  RANGE: 'range',
};

/** @enum {string} */
const DateFieldType = {
  DATE: 'input',
  START_DATE: 'start-input',
  END_DATE: 'end-input',
};

const DateFieldNameByType = {
  [DateFieldType.DATE]: 'date',
  [DateFieldType.START_DATE]: 'start-date',
  [DateFieldType.END_DATE]: 'end-date',
};

/**
 * @param {!BentoDatePicker.Props} props
 * @return {PreactDef.Renderable}
 */
export function BentoDatePicker({
  children,
  type = DatePickerType.SINGLE,
  mode = DatePickerMode.STATIC,
  inputSelector = DEFAULT_INPUT_SELECTOR,
  startInputSelector = DEFAULT_START_INPUT_SELECTOR,
  endInputSelector = DEFAULT_END_INPUT_SELECTOR,
  format = ISO_8601,
  locale = DEFAULT_LOCALE,
  id,
  ...rest
}) {
  const wrapperRef = useRef();
  const [dateElement, setDateElement] = useState();
  const [startDateElement, setStartDateElement] = useState();
  const [endDateElement, setEndDateElement] = useState();
  const [hiddenDateElement, setHiddenDateElement] = useState();

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

  /**
   * Generate a name for a hidden input.
   * Date pickers not in a form don't need named hidden inputs.
   * @param {!Element} form
   * @param {!DateFieldType} type
   * @return {string}
   * @private
   */
  const getHiddenInputId = useCallback(
    (form, type) => {
      const name = DateFieldNameByType[type];
      if (!form) {
        return '';
      }

      if (!form.elements[name]) {
        return name;
      }

      const alternativeName = `${id}-${name}`;
      if (id && !form.elements[alternativeName]) {
        return alternativeName;
      }

      // user().error(
      //   TAG,
      //   'Multiple date-pickers with implicit %s fields need to have IDs',
      //   name
      // );
      return '';
    },
    [id]
  );

  /**
   * @return {?moment} date
   */
  const date = useMemo(() => {
    return parseDate(dateElement?.value);
  }, [dateElement, parseDate]);

  /**
   * @return {?moment} date
   */
  const startDate = useMemo(() => {
    return parseDate(startDateElement?.value);
  }, [startDateElement, parseDate]);

  /**
   * @return {?moment} date
   */
  const endDate = useMemo(() => {
    return parseDate(endDateElement?.value);
  }, [endDateElement, parseDate]);

  useEffect(() => {
    const form = closestAncestorElementBySelector(
      wrapperRef.current,
      FORM_INPUT_SELECTOR
    );
    if (type === DatePickerType.SINGLE) {
      const inputElement = scopedQuerySelector(
        wrapperRef.current,
        inputSelector
      );
      if (inputElement) {
        setDateElement(inputElement);
      } else if (mode === DatePickerMode.STATIC && !!form) {
        setHiddenDateElement(() => (
          <input
            type="hidden"
            name={getHiddenInputId(form, DateFieldType.DATE)}
          ></input>
        ));
      }
    } else if (type === DatePickerType.RANGE) {
      const startDateInputElement = scopedQuerySelector(
        wrapperRef.current,
        startInputSelector
      );
      const endDateInputElement = scopedQuerySelector(
        wrapperRef.current,
        endInputSelector
      );
      setStartDateElement(startDateInputElement);
      setEndDateElement(endDateInputElement);
    }
  }, [
    wrapperRef,
    inputSelector,
    startInputSelector,
    endInputSelector,
    type,
    parseDate,
    setDateElement,
    setStartDateElement,
    setEndDateElement,
    mode,
    getHiddenInputId,
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
      {hiddenDateElement}
    </ContainWrapper>
  );
}
