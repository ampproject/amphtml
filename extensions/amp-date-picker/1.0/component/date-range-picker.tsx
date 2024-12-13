import {isAfter, isBefore, isSameDay, isValid} from 'date-fns';
import {DateRange, Matcher} from 'react-day-picker';

import {Keys_Enum} from '#core/constants/key-codes';

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
import {Ref, RenderableProps} from '#preact/types';

import {BaseDatePicker} from './base-date-picker';
import {useDatePickerContext} from './use-date-picker-context';
import {useDatePickerInput} from './use-date-picker-input';
import {useDatePickerState} from './use-date-picker-state';

import {iterateDateRange} from '../date-helpers';
import {DateFieldType, DateRangePickerAPI} from '../types';

function DateRangePickerWithRef(
  {children}: RenderableProps<{}>,
  ref: Ref<DateRangePickerAPI>
) {
  const {
    allowBlockedEndDate,
    allowBlockedRanges,
    blockedDates,
    endInputSelector,
    formatDate,
    getDisabledAfter,
    getDisabledBefore,
    initialVisibleMonth,
    isDisabled,
    mode,
    openAfterClear,
    openAfterSelect,
    parseDate,
    startInputSelector,
    today,
  } = useDatePickerContext();

  const containerRef = useRef<HTMLElement>(null);

  const [focusedInput, setFocusedInput] =
    useState<DateFieldType>('start-input');

  const defaultMonth = initialVisibleMonth || today;
  const [month, setMonth] = useState<Date>(defaultMonth);

  const {isOpen, transitionTo} = useDatePickerState(mode);
  const startDateInput = useDatePickerInput({
    inputSelector: startInputSelector,
    type: 'start-input',
  });

  const endDateInput = useDatePickerInput({
    inputSelector: endInputSelector,
    type: 'end-input',
  });

  /**
   * Sets the selected date, month, and input value
   */
  const handleSetStartDate = useCallback(
    (date?: Date) => {
      if (!date) {
        return;
      }
      startDateInput.handleSetDate(date);
      setMonth(date);
    },
    [startDateInput]
  );

  /**
   * Sets the selected date, month, and input value
   */
  const handleSetEndDate = useCallback(
    (date?: Date) => {
      if (!date) {
        return;
      }
      endDateInput.handleSetDate(date);
      setMonth(date);
    },
    [endDateInput]
  );

  /**
   * Detect if a blocked date is between the start and end date, inclusively,
   * accounting for the `allow-blocked-end-date` attribute.
   */
  const isBlockedRange = useCallback(
    (startDate?: Date, endDate?: Date) => {
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
    [blockedDates, allowBlockedRanges, allowBlockedEndDate]
  );

  /**
   * Sets a date range if it is available. Closes the date picker in overlay mode.
   */
  const selectDateRange = useCallback(
    ({from: startDate, to: endDate}: DateRange) => {
      const isFinalSelection = !openAfterSelect && focusedInput === 'end-input';
      const isSame = startDate && endDate && isSameDay(startDate, endDate);

      if (isBlockedRange(startDate, endDate)) {
        return;
      }

      const disabledAfter = getDisabledAfter(startDate);
      const disabledBefore = getDisabledBefore(startDate);

      const isAfterDisabledDate =
        disabledAfter && endDate && isAfter(endDate, disabledAfter);
      if (isAfterDisabledDate) {
        return;
      }

      const isBeforeDisabledDate =
        disabledBefore &&
        endDate &&
        !isSame &&
        isBefore(endDate, disabledBefore);
      if (isBeforeDisabledDate) {
        return;
      }

      if (focusedInput === 'start-input') {
        handleSetStartDate(startDate);
      } else if (focusedInput === 'end-input') {
        handleSetEndDate(endDate);
      }

      if (isSame) {
        setFocusedInput('end-input');
      }

      if (isFinalSelection) {
        transitionTo('overlay-closed');
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
    ]
  );

  /**
   * Formats date range for react-day-picker
   */
  const dateRange = useMemo<DateRange>(() => {
    return {
      from: startDateInput.date,
      to: endDateInput.date,
    };
  }, [startDateInput, endDateInput]);

  /**
   * Resets the date and input value and returns to the initial month
   */
  const clear = useCallback(() => {
    setMonth(defaultMonth);
    startDateInput.clear();
    endDateInput.clear();

    if (openAfterClear) {
      transitionTo('overlay-open-input');
    }
  }, [
    defaultMonth,
    startDateInput,
    endDateInput,
    openAfterClear,
    transitionTo,
  ]);

  useImperativeHandle(
    ref,
    () => ({
      clear,
      setDates: (startDate: Date, endDate: Date) => {
        // Note: This function does not set the month or respect blocked dates
        // to maintain feature parity with the original amp date picker.
        handleSetStartDate(startDate);
        handleSetEndDate(endDate);
      },
      startToday: startDateInput.setToToday,
      endToday: endDateInput.setToToday,
    }),
    [clear, startDateInput, endDateInput, handleSetStartDate, handleSetEndDate]
  );

  /**
   * For inputs that are valid dates, update the date-picker value.
   */
  const handleStartChange = useCallback(
    ({target}: InputEvent) => {
      const date = parseDate((target as HTMLInputElement).value);
      if (date && isValid(date)) {
        startDateInput.setDate(date);
      }
    },
    [startDateInput, parseDate]
  );

  /**
   * For inputs that are valid dates, update the date-picker value.
   */
  const handleEndChange = useCallback(
    ({target}: InputEvent) => {
      const date = parseDate((target as HTMLInputElement).value);
      if (date && isValid(date)) {
        endDateInput.setDate(date);
      }
    },
    [endDateInput, parseDate]
  );

  useEffect(() => {
    startDateInput.initialize(containerRef.current!);
    endDateInput.initialize(containerRef.current!);

    // This should only be called on first render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Since we are passing this ref directly into the container, we can assume
    // that containerRef.current is defined in this case
    const containerEl = containerRef.current!;
    const document = containerEl.ownerDocument;
    const startInputEl = startDateInput.ref.current;
    const endInputEl = endDateInput.ref.current;
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
      // This is necessary for bento mode, since .contains does not work with
      // elements in the shadow DOM
      const containsShadowRoot = !!(event.target as Element)?.shadowRoot;
      const clickWasInDatePicker =
        event.target === startInputEl ||
        event.target === endInputEl ||
        containerEl.contains(event.target as Node) ||
        containsShadowRoot;
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
    startInputEl?.addEventListener('change', handleStartChange);
    endInputEl?.addEventListener('change', handleEndChange);
    startInputEl?.addEventListener('keydown', handleInputKeydown);
    endInputEl?.addEventListener('keydown', handleInputKeydown);
    return () => {
      document.removeEventListener('click', handleClick);
      document.removeEventListener('keydown', handleDocumentKeydown);
      startInputEl?.removeEventListener('focus', handleFocus);
      endInputEl?.removeEventListener('focus', handleFocus);
      startInputEl?.removeEventListener('change', handleStartChange);
      endInputEl?.removeEventListener('change', handleEndChange);
      startInputEl?.removeEventListener('keydown', handleInputKeydown);
      endInputEl?.removeEventListener('keydown', handleInputKeydown);
    };
  }, [
    transitionTo,
    mode,
    handleStartChange,
    handleEndChange,
    startDateInput.ref,
    endDateInput.ref,
  ]);

  const disabledMatchers = useMemo(() => {
    const matchers: Matcher[] = [isDisabled];
    if (startDateInput.date) {
      const disabledAfter = getDisabledAfter(startDateInput.date);
      if (disabledAfter) {
        matchers.push({after: disabledAfter});
      }
    }
    return matchers;
  }, [getDisabledAfter, isDisabled, startDateInput.date]);

  return (
    <ContainWrapper
      class="amp-date-picker-calendar-container"
      data-testid="date-picker"
      ref={containerRef}
      data-startdate={startDateInput.date && formatDate(startDateInput.date)}
      data-enddate={endDateInput.date && formatDate(endDateInput.date)}
    >
      {children}
      {startDateInput.hiddenInputComponent}
      {endDateInput.hiddenInputComponent}
      <BaseDatePicker
        mode="range"
        isOpen={isOpen}
        selected={dateRange}
        onSelect={selectDateRange}
        disabled={disabledMatchers}
        month={month}
        onMonthChange={setMonth}
      />
    </ContainWrapper>
  );
}

const DateRangePicker = forwardRef(DateRangePickerWithRef);
DateRangePicker.displayName = 'DateRangePicker';
export {DateRangePicker};
