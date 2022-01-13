import {
  closestAncestorElementBySelector,
  scopedQuerySelector,
} from '#core/dom/query';

import * as Preact from '#preact';
import {
  cloneElement,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from '#preact';
import {Children} from '#preact/compat';
import {ContainWrapper} from '#preact/component';

import {BaseDatePicker} from './base-date-picker';
import {
  DateFieldNameByType,
  DateFieldType,
  DatePickerMode,
  FORM_INPUT_SELECTOR,
  TAG,
} from './constants';
import {getFormattedDate, parseDate} from './date-helpers';

/**
 * @param {!DateInput.Props} props
 * @return {PreactDef.Renderable}
 */
export function SingleDatePicker({
  blockedDates,
  children,
  format,
  id,
  inputSelector,
  mode,
  onError,
  ...rest
}) {
  const [inputProps, setInputProps] = useState({});
  const [date, _setDate] = useState();

  const onErrorRef = useRef(onError);
  const containerRef = useRef();

  const initialState = {
    isOpen: mode === DatePickerMode.STATIC,
  };
  const [state, setState] = useState(initialState);

  const handleSetDate = useCallback(
    (date) => {
      _setDate(date);
      setInputProps((props) => ({
        ...props,
        value: getFormattedDate(date, format),
      }));
    },
    [format]
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

      onErrorRef.current(
        `Multiple date-pickers with implicit ${TAG} fields need to have IDs`
      );

      return '';
    },
    [id]
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

  const inputElement = useMemo(() => {
    if (Children.toArray(children).length > 0) {
      return Children.map(children, (element) =>
        cloneElement(element, inputProps)
      );
    }
    return <input {...inputProps} />;
  }, [inputProps, children]);

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
      inputElement.value && _setDate(parseDate(inputElement.value, format));
      setInputProps({
        name: inputElement.name,
        value: inputElement.value,
        onFocus: () => setState({isOpen: true}),
      });
    } else if (mode === DatePickerMode.STATIC && !!form) {
      setInputProps({
        type: 'hidden',
        name: getHiddenInputId(form),
      });
    } else if (mode === DatePickerMode.OVERLAY) {
      onErrorRef.current(`Overlay single pickers must specify "inputSelector"`);
    }
  }, [containerRef, getHiddenInputId, inputSelector, mode, onErrorRef, format]);

  return (
    <ContainWrapper
      ref={containerRef}
      data-date={getFormattedDate(date, format)}
    >
      {inputElement}
      {state.isOpen && (
        <BaseDatePicker
          mode="single"
          selected={date}
          onSelect={setDate}
          {...rest}
        />
      )}
    </ContainWrapper>
  );
}
