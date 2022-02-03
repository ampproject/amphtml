import {isValid} from 'date-fns';
import {addDays} from 'date-fns/esm';
// TODO: Fix this
// eslint-disable-next-line local/no-import
import {ComponentProps, Ref} from 'preact';

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
  useRef,
  useState,
} from '#preact';
import {forwardRef} from '#preact/compat';
import {ContainWrapper} from '#preact/component';

import {BaseDatePicker} from './base-date-picker';
import {DateFieldNameByType, FORM_INPUT_SELECTOR, TAG} from './constants';
import {getCurrentDate, getFormattedDate, parseDate} from './date-helpers';
import {SingleDatePickerAPI, SingleDatePickerProps} from './types';
import {DatePickerContext} from './use-date-picker';
import {useDatePickerState} from './use-date-picker-state';
import {useDay} from './use-day';

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
    onError,
    openAfterSelect,
    weekDayFormat,
  }: SingleDatePickerProps,
  ref: Ref<SingleDatePickerAPI>
) {
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLElement>(null);

  const [hiddenInputProps, setHiddenInputProps] =
    useState<ComponentProps<'input'>>();
  // This allow the calendar to navigate to a new month when the date changes
  const [date, _setDate] = useState<Date>();
  const [month, setMonth] = useState<Date>(initialVisibleMonth);

  const {isOpen, transitionTo} = useDatePickerState(mode);
  const {blockedDates} = useDay();

  const handleSetDate = useCallback(
    (date: Date) => {
      _setDate(date);
      setMonth(date);
      if (inputRef.current) {
        inputRef.current.value = getFormattedDate(date, format, locale);
      }
    },
    [format, locale]
  );

  const clear = useCallback(() => {
    _setDate(undefined);
    setMonth(initialVisibleMonth);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  }, [initialVisibleMonth]);

  const today = useCallback(
    ({offset = 0} = {}) => {
      const date = addDays(getCurrentDate(), offset);
      handleSetDate(date);
    },
    [handleSetDate]
  );

  const setDate = useCallback(
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

  useImperativeHandle(
    ref,
    () => ({
      clear,
      today,
      setDate,
    }),
    [clear, today, setDate]
  );

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

  useEffect(() => {
    const form = closestAncestorElementBySelector(
      containerRef.current!,
      FORM_INPUT_SELECTOR
    ) as HTMLFormElement;
    const inputElement = scopedQuerySelector(
      containerRef.current!,
      inputSelector
    ) as HTMLInputElement;
    if (inputElement) {
      inputRef.current = inputElement;
      if (inputElement.value) {
        const parsedDate = parseDate(inputElement.value, format, locale);
        if (parsedDate) {
          _setDate(parsedDate);
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
        setDate(date);
      }
    },
    [format, locale, setDate]
  );

  useEffect(() => {
    // Since we are passing this ref directly into the container, we can assume
    // that containerRef.current is defined in this case
    const containerEl = containerRef.current!;
    const document = containerEl.ownerDocument;
    const inputEl = inputRef.current;

    if (!document) {
      return;
    }
    const handleFocus = (event: FocusEvent) => {
      if (event.target === inputRef.current) {
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
  }, [transitionTo, mode, handleInput]);

  return (
    <ContainWrapper
      ref={containerRef}
      data-date={date && getFormattedDate(date, format, locale)}
    >
      <DatePickerContext.Provider value={{selectedDate: date, type: 'single'}}>
        {children}
        {hiddenInputProps && <input ref={inputRef} {...hiddenInputProps} />}
        {isOpen && (
          <BaseDatePicker
            mode="single"
            selected={date}
            // TODO: This might be a bug in ReactDayPicker types
            // @ts-ignore
            onSelect={setDate}
            locale={locale}
            month={month}
            monthFormat={monthFormat}
            weekDayFormat={weekDayFormat}
            onMonthChange={setMonth}
            today={getCurrentDate()}
          />
        )}
      </DatePickerContext.Provider>
    </ContainWrapper>
  );
}

const SingleDatePicker = forwardRef(SingleDatePickerWithRef);
SingleDatePicker.displayName = 'SingleDatePicker';
export {SingleDatePicker};
