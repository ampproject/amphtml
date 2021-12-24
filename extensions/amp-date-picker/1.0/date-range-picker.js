import {addDays, differenceInDays, isAfter, isSameDay} from 'date-fns';
import {DayPicker} from 'react-day-picker';

import {
  closestAncestorElementBySelector,
  scopedQuerySelector,
} from '#core/dom/query';

import * as Preact from '#preact';
import {useCallback, useEffect, useMemo, useRef, useState} from '#preact';
import {Children} from '#preact/compat';
import {ContainWrapper} from '#preact/component';

import {
  DateFieldNameByType,
  DateFieldType,
  DatePickerMode,
  FORM_INPUT_SELECTOR,
  TAG,
} from './constants';
import {getFormattedDate, parseDate} from './date-helpers';
import {DayButton} from './day-button';

/**
 * @param {!DateInput.Props} props
 * @return {PreactDef.Renderable}
 */
export function DateRangePicker({
  allowBlockedEndDate,
  allowBlockedRanges,
  blockedDates,
  children,
  endInputSelector,
  format,
  id,
  initialVisibleMonth,
  mode,
  onError,
  startInputSelector,
}) {
  const [startDate, setStartDate] = useState();
  const [endDate, setEndDate] = useState();

  const [startInputAttributes, setStartInputAttributes] = useState();
  const [endInputAttributes, setEndInputAttributes] = useState();

  const onErrorRef = useRef(onError);
  const containerRef = useRef();

  const [isOpen] = useState(mode === DatePickerMode.STATIC);

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

  const setDateRange = useCallback(
    ({from, to}) => {
      if (isBlockedRange(from, to)) {
        return;
      }
      setStartDate(from);
      setEndDate(to);
    },
    [setStartDate, setEndDate, isBlockedRange]
  );

  const startInputProps = useMemo(() => {
    return {
      value: getFormattedDate(startDate, format),
      ...startInputAttributes,
    };
  }, [startDate, startInputAttributes, format]);

  const endInputProps = useMemo(() => {
    return {
      value: getFormattedDate(endDate, format),
      ...endInputAttributes,
    };
  }, [endDate, endInputAttributes, format]);

  const inputElements = useMemo(() => {
    // TODO: We may need to pass additional props to these children based
    // on their input type
    if (Children.toArray(children).length > 0) {
      return children;
    }
    return (
      <>
        <input {...startInputProps} />;
        <input {...endInputProps} />;
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
      setStartDate(parseDate(startDateInputElement.value, format));
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
      setEndDate(parseDate(endDateInputElement.value, format));
      setEndInputAttributes({
        name: endDateInputElement.name,
      });
    } else if (mode === DatePickerMode.STATIC && !!form) {
      setEndInputAttributes({
        type: 'hidden',
        name: getHiddenInputId(form, DateFieldType.END_DATE),
      });
    } else if (mode === DatePickerMode.OVERLAY) {
      onErrorRef.current(
        `Overlay range pickers must specify "startInputSelector" and "endInputSelector"`
      );
    }
  }, [
    containerRef,
    getHiddenInputId,
    mode,
    onErrorRef,
    startInputSelector,
    endInputSelector,
    format,
  ]);

  return (
    <ContainWrapper
      ref={containerRef}
      data-startdate={getFormattedDate(startDate, format)}
      data-enddate={getFormattedDate(endDate, format)}
    >
      {inputElements}
      {isOpen && (
        <DayPicker
          aria-label="Calendar"
          defaultMonth={initialVisibleMonth}
          components={{Day: DayButton}}
          mode="range"
          selected={dateRange}
          onSelect={setDateRange}
        />
      )}
    </ContainWrapper>
  );
}
