import {isValid} from 'date-fns';
import objStr from 'obj-str';

import {Keys_Enum} from '#core/constants/key-codes';

import * as Preact from '#preact';
import {
  useCallback,
  useEffect,
  useImperativeHandle,
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

import {useStyles} from '../component.jss';
import {DEFAULT_INPUT_SELECTOR} from '../constants';
import {SingleDatePickerAPI} from '../types';

function SingleDatePickerWithRef(
  {children}: RenderableProps<{}>,
  ref: Ref<SingleDatePickerAPI>
) {
  const {
    blockedDates,
    formatDate,
    initialVisibleMonth,
    inputSelector = DEFAULT_INPUT_SELECTOR,
    mode,
    openAfterClear,
    openAfterSelect,
    parseDate,
    today,
  } = useDatePickerContext();

  const containerRef = useRef<HTMLElement>(null);
  const classes = useStyles();

  const defaultMonth = initialVisibleMonth || today;
  const [month, setMonth] = useState<Date>(defaultMonth);

  const {isOpen, transitionTo} = useDatePickerState(mode);

  const dateInput = useDatePickerInput({
    inputSelector,
    type: 'input',
  });

  /**
   * Sets the selected date, month, and input value
   */
  const handleSetDate = useCallback(
    (date: Date) => {
      setMonth(date);
      dateInput.handleSetDate(date);
    },
    [dateInput]
  );

  /**
   * Sets a date if it is available. Closes the date picker in overlay mode.
   */
  const selectDate = useCallback(
    (date: Date) => {
      if (blockedDates.contains(date)) {
        return;
      }
      handleSetDate(date);
      if (!openAfterSelect && mode === 'overlay') {
        transitionTo('overlay-closed');
      }
    },
    [blockedDates, handleSetDate, openAfterSelect, transitionTo, mode]
  );

  /**
   * For inputs that are valid dates, update the date-picker value.
   */
  const handleInput = useCallback(
    (e: InputEvent) => {
      const {target} = e;
      const date = parseDate((target as HTMLInputElement).value);
      if (date && isValid(date)) {
        selectDate(date);
      }
    },
    [selectDate, parseDate]
  );

  /**
   * Resets the date and input value and returns to the initial month
   */
  const clear = useCallback(() => {
    dateInput.clear();
    setMonth(defaultMonth);

    if (openAfterClear) {
      transitionTo('overlay-open-input');
    }
  }, [defaultMonth, dateInput, transitionTo, openAfterClear]);

  useImperativeHandle(
    ref,
    () => ({
      clear,
      today: dateInput.setToToday,
      setDate: selectDate,
    }),
    [clear, dateInput, selectDate]
  );

  useEffect(() => {
    dateInput.initialize(containerRef.current!);

    // This should only be called on first render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Since we are passing this ref directly into the container, we can assume
    // that containerRef.current is defined in this case
    const containerEl = containerRef.current!;
    const document = containerEl.ownerDocument;
    const inputEl = dateInput.ref.current;

    if (!document) {
      return;
    }
    const handleFocus = (event: FocusEvent) => {
      if (event.target === dateInput.ref.current) {
        transitionTo('overlay-open-input');
      }
    };
    const handleClick = (event: MouseEvent) => {
      // This is necessary for bento mode, since .contains does not work with
      // elements in the shadow DOM
      const containsShadowRoot = !!(event.target as Element)?.shadowRoot;
      const clickWasInDatePicker =
        event.target === inputEl ||
        containerEl.contains(event.target as Node) ||
        containsShadowRoot;
      if (!clickWasInDatePicker) {
        transitionTo('overlay-closed');
      }
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

    if (mode === 'overlay') {
      document.addEventListener('click', handleClick);
      document.addEventListener('keydown', handleDocumentKeydown);
    }
    inputEl?.addEventListener('focus', handleFocus);
    inputEl?.addEventListener('change', handleInput);
    inputEl?.addEventListener('keydown', handleInputKeydown);
    return () => {
      document.removeEventListener('click', handleClick);
      document.removeEventListener('keydown', handleDocumentKeydown);
      inputEl?.removeEventListener('focus', handleFocus);
      inputEl?.removeEventListener('change', handleInput);
      inputEl?.removeEventListener('keydown', handleInputKeydown);
    };
  }, [transitionTo, mode, handleInput, dateInput]);

  return (
    <ContainWrapper
      data-testid="date-picker"
      class={objStr({
        [classes.overlay]: mode === 'overlay',
      })}
      ref={containerRef}
      data-date={dateInput.date && formatDate(dateInput.date)}
    >
      {children}
      {dateInput.hiddenInputComponent}
      <BaseDatePicker
        mode="single"
        isOpen={isOpen}
        selected={dateInput.date}
        onSelect={selectDate}
        month={month}
        onMonthChange={setMonth}
      />
    </ContainWrapper>
  );
}

const SingleDatePicker = forwardRef(SingleDatePickerWithRef);
SingleDatePicker.displayName = 'SingleDatePicker';
export {SingleDatePicker};
