import {FiniteStateMachine} from '#core/data-structures/finite-state-machine';
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
  DatePickerState,
  FORM_INPUT_SELECTOR,
  TAG,
  noop,
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
  const inputElementRef = useRef();
  const calendarRef = useRef();
  const [inputProps, setInputProps] = useState({});
  const [date, _setDate] = useState();

  const containerRef = useRef();
  const initialStateMachineState =
    mode === DatePickerMode.OVERLAY
      ? DatePickerState.OVERLAY_CLOSED
      : DatePickerState.STATIC;

  const stateMachineRef = useRef(
    new FiniteStateMachine(initialStateMachineState)
  );

  const initialState = {
    isOpen: mode === DatePickerMode.STATIC,
  };
  const [state, setState] = useState(initialState);

  const initializeStateMachine = useCallback(() => {
    const sm = stateMachineRef.current;
    const {OVERLAY_CLOSED, OVERLAY_OPEN_INPUT, OVERLAY_OPEN_PICKER, STATIC} =
      DatePickerState;
    sm.addTransition(STATIC, STATIC, noop);

    sm.addTransition(OVERLAY_CLOSED, OVERLAY_OPEN_INPUT, () => {
      setState({isOpen: true, isFocused: true, focused: false});
    });

    sm.addTransition(OVERLAY_CLOSED, OVERLAY_OPEN_PICKER, () => {
      setState({isOpen: true, isFocused: true, focused: true});
    });

    sm.addTransition(OVERLAY_CLOSED, OVERLAY_CLOSED, noop);

    sm.addTransition(OVERLAY_OPEN_INPUT, OVERLAY_OPEN_PICKER, () => {
      setState({
        isOpen: true,
        isFocused: true,
        focused: true,
      });
    });

    sm.addTransition(OVERLAY_OPEN_INPUT, OVERLAY_CLOSED, () => {
      setState({
        isOpen: false,
        isFocused: false,
        focused: false,
      });
    });
  }, [setState]);

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

      onError(
        `Multiple date-pickers with implicit ${TAG} fields need to have IDs`
      );

      return '';
    },
    [id, onError]
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

  /**
   * Transition to a new state
   * @param {!DatePickerState} state
   */
  const transitionTo = useCallback((state) => {
    stateMachineRef.current.setState(state);
  }, []);

  const inputElement = useMemo(() => {
    const props = {
      ...inputProps,
      ref: inputElementRef,
    };
    if (Children.toArray(children).length > 0) {
      return Children.map(children, (element) => cloneElement(element, props));
    }
    return <input {...props} />;
  }, [inputProps, children]);

  useEffect(() => {
    initializeStateMachine();
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
      });
    } else if (mode === DatePickerMode.STATIC && !!form) {
      setInputProps({
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
    const inputEl = inputElementRef.current;
    const containerEl = containerRef.current;
    if (!document) {
      return;
    }
    const handleFocus = (event) => {
      if (event.target === inputEl) {
        transitionTo(DatePickerState.OVERLAY_OPEN_INPUT);
      }
    };
    const handleClick = (event) => {
      const clickWasInDatePicker =
        event.target === inputEl || containerEl.contains(event.target);
      if (!clickWasInDatePicker) {
        transitionTo(DatePickerState.OVERLAY_CLOSED);
      }
    };
    if (mode === DatePickerMode.OVERLAY) {
      document.addEventListener('click', handleClick);
    }
    inputEl.addEventListener('focus', handleFocus);
    return () => {
      document.addEventListener('click', handleClick);
      inputEl.removeEventListener('focus', handleFocus);
    };
  }, [transitionTo, mode]);

  return (
    <ContainWrapper
      ref={containerRef}
      data-date={getFormattedDate(date, format)}
    >
      {inputElement}
      {state.isOpen && (
        <BaseDatePicker
          ref={calendarRef}
          mode="single"
          selected={date}
          onSelect={setDate}
          {...rest}
        />
      )}
    </ContainWrapper>
  );
}
