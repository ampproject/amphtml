import objstr from 'obj-str';

import * as Preact from '#preact';
import {useCallback} from '#preact';
import {propName} from '#preact/utils';

import {useStyles} from './component.jss';

/**
 * @param {!BentoBaseCarouselDef.ArrowProps} props
 * @return {PreactDef.Renderable}
 */
export function Arrow({
  advance,
  as: Comp = DefaultArrow,
  by,
  disabled,
  outsetArrows,
  rtl,
}) {
  const classes = useStyles();
  const onClick = useCallback(() => {
    if (!disabled) {
      advance();
    }
  }, [advance, disabled]);
  return (
    <Comp
      aria-disabled={String(!!disabled)}
      by={by}
      class={objstr({
        [classes.arrow]: true,
        [classes.arrowDisabled]: disabled,
        [classes.arrowPrev]: by < 0,
        [classes.arrowNext]: by > 0,
        [classes.outsetArrow]: outsetArrows,
        [classes.insetArrow]: !outsetArrows,
        [classes.rtl]: rtl,
        [classes.ltr]: !rtl,
      })}
      disabled={disabled}
      onClick={onClick}
      outsetArrows={outsetArrows}
      rtl={rtl.toString()}
    />
  );
}

/**
 * @param {!BentoBaseCarouselDef.ArrowProps} props
 * @return {PreactDef.Renderable}
 */
function DefaultArrow({
  'aria-disabled': ariaDisabled,
  by,
  disabled,
  onClick,
  [propName('class')]: className,
}) {
  const classes = useStyles();
  return (
    <div class={className}>
      <button
        aria-disabled={ariaDisabled}
        aria-label={
          by < 0 ? 'Previous item in carousel' : 'Next item in carousel'
        }
        class={classes.defaultArrowButton}
        disabled={disabled}
        onClick={onClick}
      >
        <div class={`${classes.arrowBaseStyle} ${classes.arrowFrosting}`}></div>
        <div class={`${classes.arrowBaseStyle} ${classes.arrowBackdrop}`}></div>
        <div
          class={`${classes.arrowBaseStyle} ${classes.arrowBackground}`}
        ></div>
        <svg class={classes.arrowIcon} viewBox="0 0 24 24">
          <path
            d={
              by < 0 ? 'M14,7.4 L9.4,12 L14,16.6' : 'M10,7.4 L14.6,12 L10,16.6'
            }
            fill="none"
            stroke-width="2px"
            stroke-linejoin="round"
            stroke-linecap="round"
          />
        </svg>
      </button>
    </div>
  );
}
