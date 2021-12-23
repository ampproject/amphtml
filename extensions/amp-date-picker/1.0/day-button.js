import {format} from 'date-fns';
// eslint-disable-next-line no-unused-vars
import {useCallback} from 'preact/hooks';
import {Button, DayProps, useDay} from 'react-day-picker';

import * as Preact from '#preact';
import {useMemo, useRef} from '#preact';

const DATE_FORMAT = 'cccc, LLLL d, yyyy';

/**
 * @param {!DayProps} props
 * @return {PreactDef.Renderable}
 */
export function DayButton({date, displayMonth}) {
  const buttonRef = useRef();

  const day = useDay(date, displayMonth, buttonRef);

  const formattedDate = useMemo(() => {
    return format(date, DATE_FORMAT);
  }, [date]);

  const label = useMemo(() => {
    if (day.modifiers.disabled) {
      return `Not available. ${formattedDate}`;
    }
    return formattedDate;
  }, [formattedDate, day]);

  const handleClick = useCallback(
    (e) => {
      if (!day.modifiers.disabled) {
        day.buttonProps?.onClick?.(e);
      }
    },
    [day]
  );

  return (
    <Button
      {...day.buttonProps}
      ref={buttonRef}
      aria-label={label}
      onClick={handleClick}
    />
  );
}
