import {scopedQuerySelector} from '#core/dom/query';

import * as Preact from '#preact';
import {useEffect, useRef, useState} from '#preact';
import {ContainWrapper} from '#preact/component';

const DEFAULT_INPUT_SELECTOR = '#date';

/**
 * @param {!BentoDatePicker.Props} props
 * @return {PreactDef.Renderable}
 */
export function BentoDatePicker({
  children,
  inputSelector = DEFAULT_INPUT_SELECTOR,
  ...rest
}) {
  const wrapperRef = useRef();
  const [date, setDate] = useState();

  useEffect(() => {
    const inputElement = scopedQuerySelector(wrapperRef.current, inputSelector);
    if (inputElement?.value) {
      setDate(inputElement.value);
    }
  }, [wrapperRef, inputSelector, setDate]);

  return (
    <ContainWrapper ref={wrapperRef} data-date={date} {...rest}>
      {children}
    </ContainWrapper>
  );
}
