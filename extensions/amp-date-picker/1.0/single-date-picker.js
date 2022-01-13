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

  const onErrorRef = useRef(onError);
  const containerRef = useRef();

  const [isOpen] = useState(mode === DatePickerMode.STATIC);

  const date = useMemo(() => {
    return inputProps.value && parseDate(inputProps.value, format);
  }, [format, inputProps]);

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
      setInputProps((props) => ({
        ...props,
        value: getFormattedDate(date, format),
      }));
    },
    [blockedDates, format]
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
      setInputProps({
        name: inputElement.name,
        value: inputElement.value,
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
      {isOpen && (
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
