import {addDays, differenceInDays, isAfter, isSameDay} from 'date-fns';

import {
  closestAncestorElementBySelector,
  scopedQuerySelector,
} from '#core/dom/query';

import * as Preact from '#preact';
import {
  cloneElement,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from '#preact';
import {Children, forwardRef} from '#preact/compat';
import {ContainWrapper} from '#preact/component';

import {BaseDatePicker} from './base-date-picker';
import {
  DateFieldNameByType,
  DateFieldType,
  DatePickerMode,
  DatePickerState,
  FORM_INPUT_SELECTOR,
  TAG,
} from './constants';
import {getCurrentDate, getFormattedDate, parseDate} from './date-helpers';
import {useDatePickerState} from './use-date-picker-state';

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
    startInputSelector,
    ...rest
  },
  ref
) {
  const startInputElementRef = useRef();
  const endInputElementRef = useRef();

  const [startDate, setStartDate] = useState();
  const [endDate, setEndDate] = useState();

  const [startInputProps, setStartInputProps] = useState();
  const [endInputProps, setEndInputProps] = useState();

  const containerRef = useRef();

  const {state, transitionTo} = useDatePickerState(mode);

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
      setStartInputProps((props) => ({
        ...props,
        value: getFormattedDate(date, format, locale),
      }));
    },
    [format, locale]
  );

  const handleSetEndDate = useCallback(
    (date) => {
      setEndDate(date);
      setEndInputProps((props) => ({
        ...props,
        value: getFormattedDate(date, format, locale),
      }));
    },
    [format, locale]
  );

  const setDateRange = useCallback(
    ({from, to}) => {
      if (isBlockedRange(from, to)) {
        return;
      }
      handleSetStartDate(from);
      handleSetEndDate(to);
    },
    [handleSetStartDate, handleSetEndDate, isBlockedRange]
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

  const inputElements = useMemo(() => {
    const startInputPropsWithRef = {
      ...startInputProps,
      ref: startInputElementRef,
    };
    const endInputPropsWithRef = {
      ...endInputProps,
      ref: endInputElementRef,
    };
    if (Children.toArray(children).length > 0) {
      // TODO: This should be determined based on the selectors, but
      // I'm not sure how to do that using React children
      const [startDateComponent, endDateComponent] = children;
      return [
        cloneElement(startDateComponent, startInputPropsWithRef),
        cloneElement(endDateComponent, endInputPropsWithRef),
      ];
    }
    return (
      <>
        <input {...startInputPropsWithRef} />;
        <input {...endInputPropsWithRef} />;
      </>
    );
  }, [children, endInputProps, startInputProps]);

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
      setStartDate(parseDate(startDateInputElement.value, format, locale));
      setStartInputProps({
        name: startDateInputElement.name,
      });
    } else if (mode === DatePickerMode.STATIC && !!form) {
      setStartInputProps({
        type: 'hidden',
        name: getHiddenInputId(form, DateFieldType.START_DATE),
      });
    }
    if (endDateInputElement) {
      setEndDate(parseDate(endDateInputElement.value, format, locale));
      setEndInputProps({
        name: endDateInputElement.name,
      });
    } else if (mode === DatePickerMode.STATIC && !!form) {
      setEndInputProps({
        type: 'hidden',
        name: getHiddenInputId(form, DateFieldType.END_DATE),
      });
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
    const startInputEl = startInputElementRef.current;
    const endInputEl = endInputElementRef.current;
    const containerEl = containerRef.current;
    if (!document) {
      return;
    }
    const handleFocus = (event) => {
      if (event.target === startInputEl || event.target === endInputEl) {
        transitionTo(DatePickerState.OVERLAY_OPEN_INPUT);
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
    }
    startInputEl?.addEventListener('focus', handleFocus);
    endInputEl?.addEventListener('focus', handleFocus);
    return () => {
      document.addEventListener('click', handleClick);
      startInputEl?.removeEventListener('focus', handleFocus);
      endInputEl?.removeEventListener('focus', handleFocus);
    };
  }, [transitionTo, mode]);

  return (
    <ContainWrapper
      ref={containerRef}
      data-startdate={getFormattedDate(startDate, format, locale)}
      data-enddate={getFormattedDate(endDate, format, locale)}
    >
      {inputElements}
      {state.isOpen && (
        <BaseDatePicker
          mode="range"
          selected={dateRange}
          onSelect={setDateRange}
          locale={locale}
          {...rest}
        />
      )}
    </ContainWrapper>
  );
}

const DateRangePicker = forwardRef(DateRangePickerWithRef);
DateRangePicker.displayName = 'DateRangePicker';
export {DateRangePicker};
