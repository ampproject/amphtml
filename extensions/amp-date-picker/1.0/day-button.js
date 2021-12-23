// eslint-disable-next-line no-unused-vars
import {Button, DayProps, useDay} from 'react-day-picker';

import * as Preact from '#preact';
import {useRef} from '#preact';

import {useAttributes} from './use-attributes';

/**
 * @param {!DayProps} props
 * @return {PreactDef.Renderable}
 */
export function DayButton({date, displayMonth}) {
  const buttonRef = useRef();

  const day = useDay(date, displayMonth, buttonRef);
  const {isDisabled, label} = useAttributes(date);

  return (
    <Button
      {...day.buttonProps}
      ref={buttonRef}
      aria-label={label}
      aria-disabled={isDisabled}
    />
  );
}
