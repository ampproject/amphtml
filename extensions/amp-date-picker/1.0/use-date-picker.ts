import {createContext, useContext} from '#preact';

import {DateFieldType, DatePickerType} from './types';

interface DatePickerContextType {
  selectedDate?: Date;
  selectedStartDate?: Date;
  selectedEndDate?: Date;
  type: DatePickerType;
  focusedInput?: DateFieldType;
}

const DatePickerContext = createContext<DatePickerContextType | null>(null);
export {DatePickerContext};

export function useDatePicker() {
  const context = useContext(DatePickerContext);
  if (!context) {
    throw new Error(
      'This context can only be used inside a DatePickerContext.Provider wrapper'
    );
  }
  return context;
}
