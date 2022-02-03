import {
  addDays,
  differenceInDays,
  isAfter,
  isBefore,
  isSameDay,
  isValid,
} from 'date-fns';
// eslint-disable-next-line local/no-import
import {ComponentProps, Ref} from 'preact';
import {Matcher} from 'react-day-picker';

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
import {DateFieldNameByType, FORM_INPUT_SELECTOR, TAG} from './constants';
import {getCurrentDate, getFormattedDate, parseDate} from './date-helpers';
import {DateFieldType, DateRangePickerAPI, DateRangePickerProps} from './types';
import {DatePickerContext} from './use-date-picker';
import {useDatePickerState} from './use-date-picker-state';
import {useDay} from './use-day';

function DateRangePickerWithRef(
  {
    allowBlockedEndDate,
    allowBlockedRanges,
    children,
    endInputSelector,
    format,
    id,
    initialVisibleMonth,
    locale,
    mode,
    monthFormat,
    onError,
    openAfterSelect,
    startInputSelector,
    weekDayFormat,
  }: DateRangePickerProps,
  ref: Ref<DateRangePickerAPI>
) {
  const startInputRef = useRef<HTMLInputElement>(null);
  const endInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLElement>(null);

  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [startHiddenInputProps, setStartHiddenInputProps] =
    useState<ComponentProps<'input'>>();
  const [endHiddenInputProps, setEndHiddenInputProps] =
    useState<ComponentProps<'input'>>();
  const [focusedInput, setFocusedInput] = useState<DateFieldType>();
  // This allow the calendar to navigate to a new month when the date changes
  const [month, setMonth] = useState<Date>(initialVisibleMonth);

  const {isOpen, transitionTo} = useDatePickerState(mode);
  const {blockedDates} = useDay();

  const {getDisabledAfter, getDisabledBefore, isDisabled} = useDay();

  /**
   * Generate a name for a hidden input.
   * Date pickers not in a form don't need named hidden inputs.
   */
  const getHiddenInputId = useCallback(
    (form: HTMLFormElement, type: DateFieldType) => {
      const name = DateFieldNameByType.get(type)!;
      if (!form) {
        return '';
      }

      if (!form.elements.namedItem(name)) {
        return name;
      }

      const alternativeName = `${id}-${name}`;
      if (id && !form.elements.namedItem(alternativeName)) {
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
   */
  const iterateDateRange = useCallback(
    (startDate: Date, endDate: Date, cb: (date: Date) => void) => {
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
    },
    []
  );

  /**
   * Detect if a blocked date is between the start and end date, inclusively,
   * accounting for the `allow-blocked-end-date` attribute.
   */
  const isBlockedRange = useCallback(
    (startDate: Date, endDate: Date) => {
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
    (date: Date) => {
      setStartDate(date);
      setMonth(date);
      if (startInputRef.current) {
        startInputRef.current.value = getFormattedDate(date, format, locale);
      }
    },
    [format, locale, setStartDate]
  );

  const handleSetEndDate = useCallback(
    (date: Date) => {
      setEndDate(date);
      setMonth(date);
      if (endInputRef.current) {
        endInputRef.current.value = getFormattedDate(date, format, locale);
      }
    },
    [format, locale, setEndDate]
  );

  const setDateRange = useCallback(
    ({from: startDate, to: endDate}: {from: Date; to: Date}) => {
      const disabledAfter = getDisabledAfter(startDate);
      const disabledBefore = getDisabledBefore(startDate);
      const isAfterDisabledDate =
        disabledAfter && isAfter(endDate, disabledAfter);
      const isBeforeDisabledDate =
        disabledBefore &&
        !isSameDay(startDate, endDate) &&
        isBefore(endDate, disabledBefore);
      const isOutsideRange = isAfterDisabledDate || isBeforeDisabledDate;
      if (isBlockedRange(startDate, endDate) || isOutsideRange) {
        return;
      }
      // TODO: Clarify this logic
      if (focusedInput === 'start-input' && isSameDay(startDate, endDate)) {
        handleSetStartDate(startDate);
      } else if (focusedInput === 'end-input') {
        handleSetEndDate(endDate);
      } else {
        handleSetStartDate(startDate);
        handleSetEndDate(endDate);
        if (!openAfterSelect && mode === 'overlay') {
          transitionTo('overlay-closed');
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
    setStartDate(undefined);
    setEndDate(undefined);
    setMonth(initialVisibleMonth);
    if (startInputRef.current) {
      startInputRef.current.value = '';
    }
    if (endInputRef.current) {
      endInputRef.current.value = '';
    }
  }, [initialVisibleMonth]);

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
    () => /** @type {!BentoDatePickerDef.BentoDatePickerApi} */ ({
      clear,
      setDates: ({end, start}: {end: Date; start: Date}) =>
        setDateRange({from: start, to: end}),
      startToday,
      endToday,
    }),
    [clear, setDateRange, startToday, endToday]
  );

  /**
   * For inputs that are valid dates, update the date-picker value.
   */
  const handleStartInput = useCallback(
    (e: InputEvent) => {
      const {target} = e;
      if ((target as HTMLInputElement).type === 'hidden') {
        return;
      }

      const date = parseDate(
        (target as HTMLInputElement).value,
        format,
        locale
      );
      if (date && isValid(date)) {
        setStartDate(date);
      }
    },
    [format, locale, setStartDate]
  );

  /**
   * For inputs that are valid dates, update the date-picker value.
   */
  const handleEndInput = useCallback(
    (e: InputEvent) => {
      const {target} = e;
      if ((target as HTMLInputElement).type === 'hidden') {
        return;
      }

      const date = parseDate(
        (target as HTMLInputElement).value,
        format,
        locale
      );
      if (date && isValid(date)) {
        setEndDate(date);
      }
    },
    [format, locale, setEndDate]
  );

  useEffect(() => {
    const form = closestAncestorElementBySelector(
      containerRef.current!,
      FORM_INPUT_SELECTOR
    ) as HTMLFormElement;
    const startDateInputElement = scopedQuerySelector(
      containerRef.current!,
      startInputSelector
    ) as HTMLInputElement;
    const endDateInputElement = scopedQuerySelector(
      containerRef.current!,
      endInputSelector
    ) as HTMLInputElement;
    if (startDateInputElement) {
      startInputRef.current = startDateInputElement;
      if (startDateInputElement.value) {
        const parsedDate = parseDate(
          startDateInputElement.value,
          format,
          locale
        );
        if (parsedDate) {
          setStartDate(parsedDate);
        }
      }
    } else if (mode === 'static' && !!form) {
      setStartHiddenInputProps({
        type: 'hidden',
        name: getHiddenInputId(form, 'start-input'),
      });
    }
    if (endDateInputElement) {
      endInputRef.current = endDateInputElement;
      if (endDateInputElement.value) {
        const parsedDate = parseDate(endDateInputElement.value, format, locale);
        if (parsedDate) {
          setEndDate(parsedDate);
        }
      }
    } else if (mode === 'static' && !!form) {
      setEndHiddenInputProps({
        type: 'hidden',
        name: getHiddenInputId(form, 'end-input'),
      });
    } else if (mode === 'overlay') {
      onError(
        `Overlay range pickers must specify "startInputSelector" and "endInputSelector"`
      );
    }
    // This should only be called on first render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Since we are passing this ref directly into the container, we can assume
    // that containerRef.current is defined in this case
    const containerEl = containerRef.current!;
    const document = containerEl.ownerDocument;
    const startInputEl = startInputRef.current;
    const endInputEl = endInputRef.current;
    if (!document) {
      return;
    }

    const handleFocus = (event: FocusEvent) => {
      if (event.target === startInputEl) {
        setFocusedInput('start-input');
      }
      if (event.target === endInputEl) {
        setFocusedInput('end-input');
      }
      transitionTo('overlay-open-input');
    };

    const handleDocumentKeydown = (event: KeyboardEvent) => {
      if (event.key === Keys_Enum.ESCAPE) {
        transitionTo('overlay-closed');
      }
    };
    const handleInputKeydown = (event: KeyboardEvent) => {
      const {target} = event;
      if ((target as HTMLInputElement).type === 'hidden') {
        return;
      }

      if (event.key === Keys_Enum.DOWN_ARROW) {
        transitionTo('overlay-open-picker');
      }
    };
    const handleClick = (event: MouseEvent) => {
      const clickWasInDatePicker =
        event.target === startInputEl ||
        event.target === endInputEl ||
        containerEl.contains(event.target as Node);
      if (!clickWasInDatePicker) {
        transitionTo('overlay-closed');
      }
    };
    if (mode === 'overlay') {
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

  const disabledMatchers = useMemo(() => {
    const matchers: Matcher[] = [isDisabled];
    if (startDate) {
      const disabledAfter = getDisabledAfter(startDate);
      if (disabledAfter) {
        matchers.push({after: disabledAfter});
      }
    }
    return matchers;
  }, [startDate, getDisabledAfter, isDisabled]);

  return (
    <ContainWrapper
      ref={containerRef}
      data-startdate={startDate && getFormattedDate(startDate, format, locale)}
      data-enddate={endDate && getFormattedDate(endDate, format, locale)}
    >
      <DatePickerContext.Provider
        value={{
          selectedStartDate: startDate,
          selectedEndDate: endDate,
          type: 'range',
          focusedInput,
        }}
      >
        {children}
        {startHiddenInputProps && (
          <input ref={startInputRef} {...startHiddenInputProps} />
        )}
        {endHiddenInputProps && (
          <input ref={endInputRef} {...endHiddenInputProps} />
        )}
        {isOpen && (
          <BaseDatePicker
            mode="range"
            selected={dateRange}
            // TODO: This might be a bug in ReactDayPicker types
            // @ts-ignore
            onSelect={setDateRange}
            locale={locale}
            disabled={disabledMatchers}
            month={month}
            monthFormat={monthFormat}
            weekDayFormat={weekDayFormat}
            onMonthChange={setMonth}
          />
        )}
      </DatePickerContext.Provider>
    </ContainWrapper>
  );
}

const DateRangePicker = forwardRef(DateRangePickerWithRef);
DateRangePicker.displayName = 'DateRangePicker';
export {DateRangePicker};
