import {format as dateFnsFormat, isValid, parse} from 'date-fns';
import {DayPicker} from 'react-day-picker';

import {
  closestAncestorElementBySelector,
  scopedQuerySelector,
} from '#core/dom/query';

import * as Preact from '#preact';
import {useCallback, useEffect, useMemo, useRef, useState} from '#preact';
import {ContainWrapper} from '#preact/component';

import './amp-date-picker.css';
import {DayButton} from './day-button';

const DEFAULT_INPUT_SELECTOR = '#date';
const DEFAULT_START_INPUT_SELECTOR = '#startdate';
const DEFAULT_END_INPUT_SELECTOR = '#enddate';
const ISO_8601 = 'yyyy-MM-dd';
const FORM_INPUT_SELECTOR = 'form';
// TODO: Check on this tag name
const TAG = 'BentoDatePicker';
const DEFAULT_ON_ERROR = (message) => {
  throw new Error(message);
};

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
  id,
  onError = DEFAULT_ON_ERROR,
  initialVisibleMonth,
  blocked,
  ...rest
}) {
  const wrapperRef = useRef();
  const onErrorRef = useRef(onError);

  const dateInputRef = useRef();
  const startDateInputRef = useRef();
  const endDateInputRef = useRef();

  const [date, setDate] = useState();
  const [startDate, setStartDate] = useState();
  const [endDate, setEndDate] = useState();

  const [dateInputAttributes, setDateInputAttributes] = useState();
  const [startInputAttributes, setStartInputAttributes] = useState();
  const [endInputAttributes, setEndInputAttributes] = useState();

  const [isOpen, setIsOpen] = useState(mode === DatePickerMode.STATIC);

  // This might not be the best way to handle this, but we need a way to get the initial
  // child nodes and their values, but then replace them with the controlled inputs from
  // state
  const [showChildren, setShowChildren] = useState(true);

  const dateRange = useMemo(() => {
    return {
      from: startDate,
      to: endDate,
    };
  }, [startDate, endDate]);

  const setDateRange = useCallback(
    ({from, to}) => {
      setStartDate(from);
      setEndDate(to);
    },
    [setStartDate, setEndDate]
  );

  /**
   * Forgivingly parse an ISO8601 input string into a date object,
   * preferring the date picker's configured format.
   * @param {string} value
   * @return {?Date} date
   */
  const parseDate = useCallback(
    (value) => {
      if (!value) {
        return null;
      }
      const date = parse(value, format, new Date());
      if (isValid(date)) {
        return date;
      }
      return parse(value);
    },
    [format]
  );

  /**
   * Formats a date in the page's locale and the element's configured format.
   * @param {?Date} date
   * @return {string}
   * @private
   */
  const getFormattedDate = useCallback(
    (date) => {
      if (!date) {
        return '';
      }
      // const isUnixTimestamp = format.match(/[Xx]/);
      // const _locale = isUnixTimestamp ? DEFAULT_LOCALE : locale;
      return dateFnsFormat(date, format);
    },
    [format]
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

      onErrorRef.current(
        `Multiple date-pickers with implicit ${TAG} fields need to have IDs`
      );

      return '';
    },
    [id]
  );

  /**
   * Sets up hidden input fields for a single input.
   * @param {!Element} form
   * @private
   */
  const setupSingleInput = useCallback(
    (form) => {
      const inputElement = scopedQuerySelector(
        wrapperRef.current,
        inputSelector
      );
      if (inputElement) {
        setDate(parseDate(inputElement.value));
        setDateInputAttributes({
          name: inputElement.name,
          onClick: () => setIsOpen(true),
        });
      } else if (mode === DatePickerMode.STATIC && !!form) {
        setDateInputAttributes({
          type: 'hidden',
          name: getHiddenInputId(form, DateFieldType.DATE),
        });
      } else if (mode === DatePickerMode.OVERLAY) {
        onError(`Overlay single pickers must specify "inputSelector"`);
      }
    },
    [inputSelector, getHiddenInputId, mode, parseDate, onError]
  );

  /**
   * Sets up hidden input fields for a range input.
   * @param {!Element} form
   * @private
   */
  const setupRangeInput = useCallback(
    (form) => {
      const startDateInputElement = scopedQuerySelector(
        wrapperRef.current,
        startInputSelector
      );
      const endDateInputElement = scopedQuerySelector(
        wrapperRef.current,
        endInputSelector
      );
      if (startDateInputElement) {
        setStartDate(parseDate(startDateInputElement.value));
        setStartInputAttributes({
          name: startDateInputElement.name,
        });
      } else if (mode === DatePickerMode.STATIC && !!form) {
        setStartInputAttributes({
          type: 'hidden',
          name: getHiddenInputId(form, DateFieldType.START_DATE),
        });
      }
      if (endDateInputElement) {
        setEndDate(parseDate(endDateInputElement.value));
        setEndInputAttributes({
          name: endDateInputElement.name,
        });
      } else if (mode === DatePickerMode.STATIC && !!form) {
        setEndInputAttributes({
          type: 'hidden',
          name: getHiddenInputId(form, DateFieldType.END_DATE),
        });
      } else if (mode === DatePickerMode.OVERLAY) {
        onError(
          `Overlay range pickers must specify "startInputSelector" and "endInputSelector"`
        );
      }
    },
    [
      startInputSelector,
      endInputSelector,
      getHiddenInputId,
      mode,
      parseDate,
      onError,
    ]
  );

  const calendarComponent = useMemo(() => {
    if (!isOpen) {
      return null;
    }
    const defaultProps = {
      'aria-label': 'Calendar',
      defaultMonth: initialVisibleMonth,
      components: {Day: DayButton},
      disabled: blocked,
    };
    if (type === DatePickerType.RANGE) {
      return (
        <DayPicker
          {...defaultProps}
          mode="range"
          selected={dateRange}
          onSelect={setDateRange}
        />
      );
    }
    return (
      <DayPicker
        {...defaultProps}
        mode="single"
        selected={date}
        onSelect={setDate}
      />
    );
  }, [type, initialVisibleMonth, date, dateRange, setDateRange, isOpen]);

  const getInputProps = useCallback(
    (type) => {
      if (type === DateFieldType.DATE) {
        return {
          value: getFormattedDate(date),
          ...dateInputAttributes,
        };
      } else if (type === DateFieldType.START_DATE) {
        return {
          value: getFormattedDate(startDate),
          ...startInputAttributes,
        };
      } else if (type === DateFieldType.END_DATE) {
        return {
          value: getFormattedDate(endDate),
          ...endInputAttributes,
        };
      }
    },
    [
      date,
      startDate,
      endDate,
      getFormattedDate,
      dateInputAttributes,
      endInputAttributes,
      startInputAttributes,
    ]
  );

  useEffect(() => {
    const form = closestAncestorElementBySelector(
      wrapperRef.current,
      FORM_INPUT_SELECTOR
    );
    if (type === DatePickerType.SINGLE) {
      setupSingleInput(form);
    } else if (type === DatePickerType.RANGE) {
      setupRangeInput(form);
    } else {
      onError(`Invalid picker type`);
    }
    setShowChildren(false);
  }, [setupRangeInput, setupSingleInput, type, mode, onError, inputSelector]);

  return (
    <ContainWrapper
      ref={wrapperRef}
      data-date={getFormattedDate(date)}
      data-startdate={getFormattedDate(startDate)}
      data-enddate={getFormattedDate(endDate)}
      {...rest}
    >
      {showChildren && children}
      {type === DatePickerType.SINGLE && (
        <input {...getInputProps(DateFieldType.DATE)} />
      )}
      {type === DatePickerType.RANGE && (
        <>
          <input {...getInputProps(DateFieldType.START_DATE)} />
          <input {...getInputProps(DateFieldType.END_DATE)} />
        </>
      )}
      {calendarComponent}
    </ContainWrapper>
  );
}
