import * as Preact from '#preact';
import {useMemo} from '#preact';

import './amp-date-picker.css';
import {
  DEFAULT_END_INPUT_SELECTOR,
  DEFAULT_INPUT_SELECTOR,
  DEFAULT_ON_ERROR,
  DEFAULT_START_INPUT_SELECTOR,
  DatePickerMode,
  DatePickerType,
  ISO_8601,
} from './constants';
import {DateRangePicker} from './date-range-picker';
import {DatesList} from './dates-list';
import {SingleDatePicker} from './single-date-picker';
import {AttributesContext} from './use-attributes';

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
  allowBlockedRanges,
  allowBlockedEndDate,
  highlighted,
}) {
  const blockedDates = useMemo(() => {
    return new DatesList(blocked);
  }, [blocked]);

  const highlightedDates = useMemo(() => {
    return new DatesList(highlighted);
  }, [highlighted]);

  const datePicker = useMemo(() => {
    const commonProps = {
      blockedDates,
      format,
      id,
      initialVisibleMonth,
      mode,
      onError,
      children,
    };
    if (type === DatePickerType.SINGLE) {
      const props = {
        ...commonProps,
        inputSelector,
      };
      return <SingleDatePicker {...props} />;
    } else if (type === DatePickerType.RANGE) {
      const props = {
        ...commonProps,
        startInputSelector,
        endInputSelector,
        allowBlockedEndDate,
        allowBlockedRanges,
      };
      return <DateRangePicker {...props} />;
    } else {
      onError('Invalid date picker type');
    }
  }, [
    blockedDates,
    format,
    id,
    initialVisibleMonth,
    mode,
    onError,
    type,
    allowBlockedEndDate,
    allowBlockedRanges,
    startInputSelector,
    endInputSelector,
    inputSelector,
    children,
  ]);

  return (
    <AttributesContext.Provider
      value={{blockedDates, highlightedDates, allowBlockedEndDate}}
    >
      {datePicker}
    </AttributesContext.Provider>
  );
}
