import {addDays} from 'date-fns/esm';

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
 * @param {!BentoDatePickerDef.SingleDatePickerProps} props
 * @param {{current: ?BentoDatePickerDef.BentoDatePickerApi}} ref
 * @return {PreactDef.Renderable}
 */
function SingleDatePickerWithRef(
  {
    blockedDates,
    children,
    format,
    id,
    inputSelector,
    locale,
    mode,
    onError,
    ...rest
  },
  ref
) {
  const calendarRef = useRef();
  const inputEl = useRef();

  const [date, _setDate] = useState();
  const [hiddenInputAttributes, setHiddenInputAttributes] = useState();

  const containerRef = useRef();

  const {state, transitionTo} = useDatePickerState(mode);

  const handleSetDate = useCallback(
    (date) => {
      _setDate(date);
      if (inputEl.current) {
        inputEl.current.value = getFormattedDate(date, format, locale);
      }
    },
    [format, locale]
  );

  const clear = useCallback(() => {
    handleSetDate(undefined);
  }, [handleSetDate]);

  const today = useCallback(
    ({offset = 0} = {}) => {
      const date = addDays(getCurrentDate(), offset);
      handleSetDate(date);
    },
    [handleSetDate]
  );

  const setDate = useCallback(
    (date) => {
      if (blockedDates.contains(date)) {
        return;
      }
      handleSetDate(date);
    },
    [blockedDates, handleSetDate]
  );

  useImperativeHandle(
    ref,
    () =>
      /** @type {!BentoDatePickerDef.BentoDatePickerApi} */ ({
        clear,
        today,
        setDate,
      }),
    [clear, today, setDate]
  );

  /**
   * Generate a name for a hidden input.
   * Date pickers not in a form don't need named hidden inputs.
   * @param {!Element} form
   * @param {!DateFieldType} type
   * @return {string}
   * @private
   */
  const getHiddenInputId = useCallback(
    (form) => {
      const name = DateFieldNameByType[DateFieldType.DATE];
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

  useEffect(() => {
    const form = closestAncestorElementBySelector(
      containerRef.current,
      FORM_INPUT_SELECTOR
    );
    const inputElement = scopedQuerySelector(
      containerRef.current,
      inputSelector
    );
    if (inputElement) {
      inputEl.current = inputElement;
      inputElement.value &&
        _setDate(parseDate(inputElement.value, format, locale));
    } else if (mode === DatePickerMode.STATIC && !!form) {
      setHiddenInputAttributes({
        type: 'hidden',
        name: getHiddenInputId(form),
      });
    } else if (mode === DatePickerMode.OVERLAY) {
      onError(`Overlay single pickers must specify "inputSelector"`);
    }
    // This should only be called on first render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const document = containerRef.current.ownerDocument;
    const containerEl = containerRef.current;
    if (!document) {
      return;
    }
    const handleFocus = (event) => {
      if (event.target === inputEl.current) {
        transitionTo(DatePickerState.OVERLAY_OPEN_INPUT);
      }
    };
    const handleClick = (event) => {
      const clickWasInDatePicker =
        event.target === inputEl.current || containerEl.contains(event.target);
      if (!clickWasInDatePicker) {
        transitionTo(DatePickerState.OVERLAY_CLOSED);
      }
    };
    if (mode === DatePickerMode.OVERLAY) {
      document.addEventListener('click', handleClick);
    }
    inputEl.current?.addEventListener('focus', handleFocus);
    return () => {
      document.addEventListener('click', handleClick);
      inputEl.current?.removeEventListener('focus', handleFocus);
    };
  }, [transitionTo, mode]);

  return (
    <ContainWrapper
      ref={containerRef}
      data-date={getFormattedDate(date, format, locale)}
    >
      {children}
      {hiddenInputAttributes && (
        <input ref={inputEl} {...hiddenInputAttributes} />
      )}
      {state.isOpen && (
        <BaseDatePicker
          ref={calendarRef}
          mode="single"
          selected={date}
          onSelect={setDate}
          locale={locale}
          {...rest}
        />
      )}
    </ContainWrapper>
  );
}

const SingleDatePicker = forwardRef(SingleDatePickerWithRef);
SingleDatePicker.displayName = 'SingleDatePicker';
export {SingleDatePicker};
