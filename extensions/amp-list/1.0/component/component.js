import * as Preact from '#preact';
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from '#preact';
import {ContainWrapper} from '#preact/component';

import {useStyles} from './component.jss';

/**
 * @param {!BentoList.Props} props
 * @return {PreactDef.Renderable}
 */
export function BentoList({...rest}) {
  // Examples of state and hooks
  const styles = useStyles();

  return (
    <ContainWrapper {...rest}>
      <div class={`${styles.exampleContentHidden}`}>This is hidden</div>
    </ContainWrapper>
  );
}
