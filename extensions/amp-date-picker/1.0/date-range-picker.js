import {
  addDays,
  differenceInDays,
  isAfter,
  isBefore,
  isSameDay,
  isValid,
} from 'date-fns';

import {Keys_Enum} from '#core/constants/key-codes';
import {
  closestAncestorElementBySelector,
  scopedQuerySelector,
} from '#core/dom/query';

import * as Preact from '#preact';
import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from '#preact';
import {forwardRef} from '#preact/compat';
import {ContainWrapper} from '#preact/component';

import {BaseDatePicker} from './base-date-picker';
import {
  DateFieldNameByType,
  DateFieldType,
  DatePickerMode,
  DatePickerState,
  DatePickerType,
  FORM_INPUT_SELECTOR,
  TAG,
} from './constants';
import {getCurrentDate, getFormattedDate, parseDate} from './date-helpers';
import {DatePickerContext} from './use-date-picker';
import {useDatePickerState} from './use-date-picker-state';
import {useDayAttributes} from './use-day-attributes';

/**
 * @param {!BentoDatePickerDef.DateRangePickerProps} props
 * @param {{current: ?BentoDatePickerDef.BentoDatePickerApi}} ref
 * @return {PreactDef.Renderable}
 */
function DateRangePickerWithRef(
  {
    allowBlockedEndDate,
    allowBlockedRanges,
    blockedDates,
    children,
    endInputSelector,
    format,
    id,
    locale,
    mode,
    onError,
    openAfterSelect,
    startInputSelector,
    ...rest
  },
  ref
) {
  const startInputRef = useRef();
  const endInputRef = useRef();

  const [startDate, setStartDate] = useState();
  const [endDate, setEndDate] = useState();
  const [startHiddenInputName, setStartHiddenInputName] = useState();
  const [endHiddenInputName, setEndHiddenInputName] = useState();
  const [focusedInput, setFocusedInput] = useState();

  const containerRef = useRef();

  const {state, transitionTo} = useDatePickerState(mode);

  const {getDisabledAfter, getDisabledBefore, isDisabled} = useDayAttributes();

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

      onError(
        `Multiple date-pickers with implicit ${TAG} fields need to have IDs`
      );

      return '';
    },
    [id, onError]
  );

  /**
   * Iterate over the dates between a start and end date.
   * @param {!Date} startDate
   * @param {?Date} endDate
   * @param {function(!Date)} cb
   * @private
   */
  const iterateDateRange = useCallback((startDate, endDate, cb) => {
    const normalizedEndDate = endDate || startDate;
    if (
      isSameDay(startDate, normalizedEndDate) ||
      isAfter(startDate, normalizedEndDate)
    ) {
      return;
    }

    if (isSameDay(startDate, endDate)) {
      return cb(startDate);
    }

    const days = differenceInDays(normalizedEndDate, startDate);
    cb(startDate);

    for (let i = 0; i < days; i++) {
      cb(addDays(startDate, i + 1));
    }
  }, []);

  /**
   * Detect if a blocked date is between the start and end date, inclusively,
   * accounting for the `allow-blocked-end-date` attribute.
   * @param {?Date} startDate
   * @param {?Date} endDate
   * @return {boolean} True if the range should not be selected.
   */
  const isBlockedRange = useCallback(
    (startDate, endDate) => {
      if (!startDate || !endDate) {
        return;
      }

      let blockedCount = 0;
      if (!allowBlockedRanges) {
        iterateDateRange(startDate, endDate, (date) => {
          if (blockedDates.contains(date)) {
            blockedCount++;
          }
        });
      }

      // If allow-blocked-end-date is enabled, we do not consider the range
      // blocked when the end date is the only blocked date.
      if (
        blockedCount == 1 &&
        allowBlockedEndDate &&
        isSameDay(endDate, blockedDates.firstDateAfter(startDate))
      ) {
        return false;
      }

      // If there are any blocked dates in the range, it cannot
      // be selected.
      return blockedCount > 0;
    },
    [blockedDates, allowBlockedRanges, iterateDateRange, allowBlockedEndDate]
  );

  const dateRange = useMemo(() => {
    return {
      from: startDate,
      to: endDate,
    };
  }, [startDate, endDate]);

  const handleSetStartDate = useCallback(
    (date) => {
      setStartDate(date);
      if (startInputRef.current) {
        startInputRef.current.value = getFormattedDate(date, format, locale);
      }
    },
    [format, locale, setStartDate]
  );

  const handleSetEndDate = useCallback(
    (date) => {
      setEndDate(date);
      if (endInputRef.current) {
        endInputRef.current.value = getFormattedDate(date, format, locale);
      }
    },
    [format, locale, setEndDate]
  );

  const setDateRange = useCallback(
    ({from: startDate, to: endDate}) => {
      const disabledAfter = getDisabledAfter(startDate);
      const disabledBefore = getDisabledBefore(startDate);
      const isOutsideRange =
        isAfter(endDate, disabledAfter) ||
        (!isSameDay(startDate, endDate) && isBefore(endDate, disabledBefore));
      if (isBlockedRange(startDate, endDate) || isOutsideRange) {
        return;
      }
      // TODO: Clarify this logic
      if (
        focusedInput === DateFieldType.START_DATE &&
        isSameDay(startDate, endDate)
      ) {
        handleSetStartDate(startDate);
      } else if (focusedInput === DateFieldType.END_DATE) {
        handleSetEndDate(endDate);
      } else {
        handleSetStartDate(startDate);
        handleSetEndDate(endDate);
        if (!openAfterSelect && mode === DatePickerMode.OVERLAY) {
          transitionTo(DatePickerState.OVERLAY_CLOSED);
        }
      }
    },
    [
      handleSetStartDate,
      handleSetEndDate,
      isBlockedRange,
      getDisabledAfter,
      getDisabledBefore,
      focusedInput,
      transitionTo,
      openAfterSelect,
      mode,
    ]
  );

  const clear = useCallback(() => {
    handleSetStartDate(undefined);
    handleSetEndDate(undefined);
  }, [handleSetStartDate, handleSetEndDate]);

  const startToday = useCallback(
    ({offset = 0} = {}) => {
      const date = addDays(getCurrentDate(), offset);
      handleSetStartDate(date);
    },
    [handleSetStartDate]
  );

  const endToday = useCallback(
    ({offset = 0} = {}) => {
      const date = addDays(getCurrentDate(), offset);
      handleSetEndDate(date);
    },
    [handleSetEndDate]
  );

  useImperativeHandle(
    ref,
    () =>
      /** @type {!BentoDatePickerDef.BentoDatePickerApi} */ ({
        clear,
        setDates: ({end, start}) => setDateRange({from: start, to: end}),
        startToday,
        endToday,
      }),
    [clear, setDateRange, startToday, endToday]
  );

  /**
   * For inputs that are valid dates, update the date-picker value.
   * @param {!Event} e
   * @private
   */
  const handleStartInput = useCallback(
    (e) => {
      const {target} = e;
      if (target.type === 'hidden') {
        return;
      }

      const date = parseDate(target.value, format, locale);
      if (isValid(date)) {
        setStartDate(date);
      }
    },
    [format, locale, setStartDate]
  );

  /**
   * For inputs that are valid dates, update the date-picker value.
   * @param {!Event} e
   * @private
   */
  const handleEndInput = useCallback(
    (e) => {
      const {target} = e;
      if (target.type === 'hidden') {
        return;
      }

      const date = parseDate(target.value, format, locale);
      if (isValid(date)) {
        setEndDate(date);
      }
    },
    [format, locale, setEndDate]
  );

  useEffect(() => {
    const form = closestAncestorElementBySelector(
      containerRef.current,
      FORM_INPUT_SELECTOR
    );
    const startDateInputElement = scopedQuerySelector(
      containerRef.current,
      startInputSelector
    );
    const endDateInputElement = scopedQuerySelector(
      containerRef.current,
      endInputSelector
    );
    if (startDateInputElement) {
      startInputRef.current = startDateInputElement;
      startDateInputElement.value &&
        setStartDate(parseDate(startDateInputElement.value, format, locale));
    } else if (mode === DatePickerMode.STATIC && !!form) {
      setStartHiddenInputName(getHiddenInputId(form, DateFieldType.START_DATE));
    }
    if (endDateInputElement) {
      endInputRef.current = endDateInputElement;
      endDateInputElement.value &&
        setEndDate(parseDate(endDateInputElement.value, format, locale));
    } else if (mode === DatePickerMode.STATIC && !!form) {
      setEndHiddenInputName(getHiddenInputId(form, DateFieldType.END_DATE));
    } else if (mode === DatePickerMode.OVERLAY) {
      onError(
        `Overlay range pickers must specify "startInputSelector" and "endInputSelector"`
      );
    }
    // This should only be called on first render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const document = containerRef.current.ownerDocument;
    const startInputEl = startInputRef.current;
    const endInputEl = endInputRef.current;
    const containerEl = containerRef.current;
    if (!document) {
      return;
    }
    const handleFocus = (event) => {
      if (event.target === startInputEl) {
        setFocusedInput(DateFieldType.START_DATE);
      }
      if (event.target === endInputEl) {
        setFocusedInput(DateFieldType.END_DATE);
      }
      transitionTo(DatePickerState.OVERLAY_OPEN_INPUT);
    };
    const handleDocumentKeydown = (event) => {
      if (event.key === Keys_Enum.ESCAPE) {
        transitionTo(DatePickerState.OVERLAY_CLOSED);
      }
    };
    const handleInputKeydown = (event) => {
      const {target} = event;
      if (
        !target === startInputEl ||
        !target === endInputEl ||
        target.type === 'hidden'
      ) {
        return;
      }

      if (event.key === Keys_Enum.DOWN_ARROW) {
        /// update field focus?
        transitionTo(DatePickerState.OVERLAY_OPEN_PICKER);
        // Other static mode stuff here
      }
    };
    const handleClick = (event) => {
      const clickWasInDatePicker =
        event.target === startInputEl ||
        event.target === endInputEl ||
        containerEl.contains(event.target);
      if (!clickWasInDatePicker) {
        transitionTo(DatePickerState.OVERLAY_CLOSED);
      }
    };
    if (mode === DatePickerMode.OVERLAY) {
      document.addEventListener('click', handleClick);
      document.addEventListener('keydown', handleDocumentKeydown);
    }
    startInputEl?.addEventListener('focus', handleFocus);
    endInputEl?.addEventListener('focus', handleFocus);
    startInputEl?.addEventListener('change', handleStartInput);
    endInputEl?.addEventListener('change', handleEndInput);
    startInputEl?.addEventListener('keydown', handleInputKeydown);
    endInputEl?.addEventListener('keydown', handleInputKeydown);
    return () => {
      document.addEventListener('click', handleClick);
      document.removeEventListener('keydown', handleDocumentKeydown);
      startInputEl?.removeEventListener('focus', handleFocus);
      endInputEl?.removeEventListener('focus', handleFocus);
      startInputEl?.removeEventListener('change', handleStartInput);
      endInputEl?.removeEventListener('change', handleEndInput);
      startInputEl?.removeEventListener('keydown', handleInputKeydown);
      endInputEl?.removeEventListener('keydown', handleInputKeydown);
    };
  }, [transitionTo, mode, handleStartInput, handleEndInput]);

  return (
    <ContainWrapper
      ref={containerRef}
      data-startdate={getFormattedDate(startDate, format, locale)}
      data-enddate={getFormattedDate(endDate, format, locale)}
    >
      <DatePickerContext.Provider
        value={{
          selectedStartDate: startDate,
          selectedEndDate: endDate,
          type: DatePickerType.RANGE,
          focusedInput,
        }}
      >
        {children}
        {startHiddenInputName && (
          <input
            ref={startInputRef}
            name={startHiddenInputName}
            type="hidden"
          />
        )}
        {endHiddenInputName && (
          <input ref={endInputRef} name={endHiddenInputName} type="hidden" />
        )}
        {state.isOpen && (
          <BaseDatePicker
            mode="range"
            selected={dateRange}
            onSelect={setDateRange}
            locale={locale}
            disabled={[isDisabled, {after: getDisabledAfter(startDate)}]}
            {...rest}
          />
        )}
      </DatePickerContext.Provider>
    </ContainWrapper>
  );
}

const DateRangePicker = forwardRef(DateRangePickerWithRef);
DateRangePicker.displayName = 'DateRangePicker';
export {DateRangePicker};
