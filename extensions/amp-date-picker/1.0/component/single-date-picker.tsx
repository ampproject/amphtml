import {isValid} from 'date-fns';
// eslint-disable-next-line local/no-import
import {ComponentProps, Ref} from 'preact';

import {Keys_Enum} from '#core/constants/key-codes';
import {
  closestAncestorElementBySelector,
  querySelectorInSlot,
  scopedQuerySelector,
} from '#core/dom/query';

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

import {BaseDatePicker} from './base-date-picker';
import {DatePickerContext} from './use-date-picker';
import {useDatePickerInput} from './use-date-picker-input';
import {useDatePickerState} from './use-date-picker-state';
import {useDay} from './use-day';

import {DateFieldNameByType, FORM_INPUT_SELECTOR, TAG} from '../constants';
import {getFormattedDate} from '../date-helpers';
import {parseDate} from '../parsers';
import {SingleDatePickerAPI, SingleDatePickerProps} from '../types';

function SingleDatePickerWithRef(
  {
    children,
    format,
    id,
    initialVisibleMonth,
    inputSelector,
    locale,
    mode,
    monthFormat,
    numberOfMonths,
    onError,
    openAfterClear,
    openAfterSelect,
    today,
    weekDayFormat,
  }: SingleDatePickerProps,
  ref: Ref<SingleDatePickerAPI>
) {
  const containerRef = useRef<HTMLElement>(null);

  const [hiddenInputProps, setHiddenInputProps] =
    useState<ComponentProps<'input'>>();

  const [month, setMonth] = useState<Date>(initialVisibleMonth);

  const {isOpen, transitionTo} = useDatePickerState(mode);
  const {blockedDates} = useDay();

  const dateInput = useDatePickerInput({
    formatDate: (date) => getFormattedDate(date, format, locale),
    today,
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
      if ((target as HTMLInputElement).type === 'hidden') {
        return;
      }

      const date = parseDate(
        (target as HTMLInputElement).value,
        format,
        locale
      );
      if (date && isValid(date)) {
        selectDate(date);
      }
    },
    [format, locale, selectDate]
  );

  /**
   * Resets the date and input value and returns to the initial month
   */
  const clear = useCallback(() => {
    dateInput.clear();
    setMonth(initialVisibleMonth);

    if (openAfterClear) {
      transitionTo('overlay-open-input');
    }
  }, [initialVisibleMonth, dateInput, transitionTo, openAfterClear]);

  /**
   * Generate a name for a hidden input.
   * Date pickers not in a form don't need named hidden inputs.
   */
  const getHiddenInputId = useCallback(
    (form: HTMLFormElement) => {
      const name: string = DateFieldNameByType.get('input')!;
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
    const form = closestAncestorElementBySelector(
      containerRef.current!,
      FORM_INPUT_SELECTOR
    ) as HTMLFormElement;
    let inputElement;

    inputElement = scopedQuerySelector(
      containerRef.current!,
      inputSelector
    ) as HTMLInputElement;

    // This is required for bento mode
    if (!inputElement) {
      const slot = containerRef.current?.querySelector('slot');
      if (slot) {
        inputElement = querySelectorInSlot(
          slot,
          inputSelector
        ) as HTMLInputElement;
      }
    }

    if (inputElement) {
      dateInput.ref.current = inputElement;
      if (inputElement.value) {
        const parsedDate = parseDate(inputElement.value, format, locale);
        if (parsedDate) {
          dateInput.setDate(parsedDate);
        }
      }
    } else if (mode === 'static' && !!form) {
      setHiddenInputProps({
        type: 'hidden',
        name: getHiddenInputId(form),
      });
    } else if (mode === 'overlay') {
      onError(`Overlay single pickers must specify "inputSelector"`);
    }
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
      const clickWasInDatePicker =
        event.target === inputEl || containerEl.contains(event.target as Node);
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
      class="amp-date-picker-calendar-container"
      ref={containerRef}
      data-date={
        dateInput.date && getFormattedDate(dateInput.date, format, locale)
      }
    >
      <DatePickerContext.Provider
        value={{selectedDate: dateInput.date, type: 'single'}}
      >
        {children}
        {hiddenInputProps && (
          <input ref={dateInput.ref} {...hiddenInputProps} />
        )}
        {isOpen && (
          <BaseDatePicker
            mode="single"
            selected={dateInput.date}
            // TODO: This might be a bug in ReactDayPicker types
            // @ts-ignore
            onSelect={selectDate}
            locale={locale}
            month={month}
            monthFormat={monthFormat}
            weekDayFormat={weekDayFormat}
            onMonthChange={setMonth}
            today={today}
            numberOfMonths={numberOfMonths}
          />
        )}
      </DatePickerContext.Provider>
    </ContainWrapper>
  );
}

const SingleDatePicker = forwardRef(SingleDatePickerWithRef);
SingleDatePicker.displayName = 'SingleDatePicker';
export {SingleDatePicker};
