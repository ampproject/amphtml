import {format as dateFnsFormat, isValid, parse} from 'date-fns';
import * as moment from 'moment';
import {
  DayPickerRangeController,
  DayPickerSingleDateController,
} from 'react-dates';

import {
  closestAncestorElementBySelector,
  scopedQuerySelector,
} from '#core/dom/query';

import * as Preact from '#preact';
import {
  cloneElement,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from '#preact';
import {ContainWrapper} from '#preact/component';

import './amp-date-picker.css';

const DEFAULT_INPUT_SELECTOR = '#date';
const DEFAULT_START_INPUT_SELECTOR = '#startdate';
const DEFAULT_END_INPUT_SELECTOR = '#enddate';
const ISO_8601 = 'yyyy-MM-dd';
const DEFAULT_LOCALE = 'en';
const FORM_INPUT_SELECTOR = 'form';
// TODO: Check on this tag name
const TAG = 'BentoDatePicker';

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
 * Formats a date as a moment object
 * TODO: Remove this once we are no longer using moment
 * @param {?Date} date
 * @return {moment}
 * @private
 */
function asMoment(date) {
  return moment(date);
}

/**
 * Formats a moment object as a Date
 * TODO: Remove this once we are no longer using moment
 * @param moment
 * @return {Date}
 * @private
 */
function asDate(moment) {
  return moment.toDate();
}

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
  onError,
  ...rest
}) {
  const wrapperRef = useRef();
  const onErrorRef = useRef(onError);

  const dateInputRef = useRef();
  const startDateInputRef = useRef();
  const endDateInputRef = useRef();

  const [dateElement, setDateElement] = useState();
  const [startDateElement, setStartDateElement] = useState();
  const [endDateElement, setEndDateElement] = useState();

  const [date, setDate] = useState();
  const [startDate, setStartDate] = useState();
  const [endDate, setEndDate] = useState();

  const [isOpen, setIsOpen] = useState(mode === DatePickerMode.STATIC);

  // const {dayPickerProps, inputProps} = useInput();

  // This might not be the best way to handle this, but we need a way to get the initial
  // child nodes and their values, but then replace them with the controlled inputs from
  // state
  const [showChildren, setShowChildren] = useState(true);

  /**
   * Forgivingly parse an ISO8601 input string into a date object,
   * preferring the date picker's configured format.
   * @param {string} value
   * @return {?Date} date
   */
  const parseDate = useCallback(
    (value) => {
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
        setDateElement(() => (
          <input ref={dateInputRef} value={inputElement.value} />
        ));
      } else if (mode === DatePickerMode.STATIC && !!form) {
        setDateElement(() => (
          <input
            ref={dateInputRef}
            type="hidden"
            name={getHiddenInputId(form, DateFieldType.DATE)}
          ></input>
        ));
      }
    },
    [inputSelector, getHiddenInputId, mode, parseDate]
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
        setStartDateElement(() => (
          <input ref={startDateInputRef} value={startDateInputElement.value} />
        ));
      } else if (mode === DatePickerMode.STATIC && !!form) {
        setStartDateElement(() => (
          <input
            type="hidden"
            name={getHiddenInputId(form, DateFieldType.START_DATE)}
          />
        ));
      }
      if (endDateInputElement) {
        setEndDate(parseDate(endDateInputElement.value));
        setEndDateElement(() => (
          <input ref={endDateInputRef} value={endDateInputElement.value} />
        ));
      } else if (mode === DatePickerMode.STATIC && !!form) {
        setEndDateElement(() => (
          <input
            type="hidden"
            name={getHiddenInputId(form, DateFieldType.END_DATE)}
          />
        ));
      }
    },
    [startInputSelector, endInputSelector, getHiddenInputId, mode, parseDate]
  );

  const onDateChange = useCallback(
    (dateAsMoment) => {
      const _date = asDate(dateAsMoment);
      setDate(_date);
    },
    [setDate]
  );

  const onDatesChange = useCallback(
    ({endDate, startDate}) => {
      const _startDate = asDate(startDate);
      const _endDate = asDate(endDate);
      setStartDate(_startDate);
      setEndDate(_endDate);
    },
    [setStartDate, setEndDate]
  );

  const calendarComponent = useMemo(() => {
    const defaultProps = {
      'aria-label': 'Calendar',
    };
    if (type === DatePickerType.RANGE) {
      return (
        <DayPickerRangeController
          {...defaultProps}
          onDatesChange={onDatesChange}
        />
      );
    }
    return (
      <DayPickerSingleDateController
        {...defaultProps}
        onDateChange={onDateChange}
      />
    );
  }, [onDateChange, onDatesChange, type]);

  useEffect(() => {
    const form = closestAncestorElementBySelector(
      wrapperRef.current,
      FORM_INPUT_SELECTOR
    );
    if (type === DatePickerType.SINGLE) {
      setupSingleInput(form);
      if (mode === DatePickerMode.OVERLAY && !dateElement) {
        onError(`Overlay single pickers must specify "inputSelector"`);
      }
    } else if (type === DatePickerType.RANGE) {
      setupRangeInput(form);
      if (
        mode === DatePickerMode.OVERLAY &&
        (!startDateElement || !endDateElement)
      ) {
        onError(
          `Overlay range pickers must specify "startInputSelector" and "endInputSelector"`
        );
      }
    } else {
      onError(`Invalid picker type`);
    }
    setShowChildren(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    setupRangeInput,
    setupSingleInput,
    type,
    // TODO: Uncommenting these dependencies causes the unit tests not to complete
    // dateElement,
    // startDateElement,
    // endDateElement,
    mode,
    onError,
  ]);

  return (
    <ContainWrapper
      ref={wrapperRef}
      data-date={getFormattedDate(date)}
      data-startdate={getFormattedDate(startDate)}
      data-enddate={getFormattedDate(endDate)}
      {...rest}
    >
      {showChildren && children}
      {dateElement &&
        cloneElement(dateElement, {value: getFormattedDate(date)})}
      {startDateElement &&
        cloneElement(startDateElement, {value: getFormattedDate(startDate)})}
      {endDateElement &&
        cloneElement(endDateElement, {value: getFormattedDate(endDate)})}
      {calendarComponent}
    </ContainWrapper>
  );
}
