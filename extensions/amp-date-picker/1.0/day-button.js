import {format} from 'date-fns';
// eslint-disable-next-line no-unused-vars
import {Button, DayProps, useDay} from 'react-day-picker';

import * as Preact from '#preact';
import {useRef} from '#preact';

const DATE_FORMAT = 'cccc, LLLL d, yyyy';

/**
 * @param {!DayProps} props
 * @return {PreactDef.Renderable}
 */
export function DayButton({date, displayMonth}) {
  const buttonRef = useRef();

  const day = useDay(date, displayMonth, buttonRef);

  return (
    <Button
      {...day.buttonProps}
      ref={buttonRef}
      aria-label={format(date, DATE_FORMAT)}
    />
  );
}
