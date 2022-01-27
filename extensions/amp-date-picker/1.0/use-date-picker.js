import {createContext, useContext} from '#preact';

const DatePickerContext = createContext();
export {DatePickerContext};

/**
 * @return {BentoDatePickerDef.DatePickerContext}
 */
export function useDatePicker() {
  const context = useContext(DatePickerContext);
  if (!context) {
    throw new Error(
      'This context can only be used inside a DatePickerContext.Provider wrapper'
    );
  }
  return context;
}
