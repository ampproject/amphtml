import * as Preact from '#preact';
import {ContainWrapper} from '#preact/component';
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from '#preact';
import {useStyles} from './component.jss';

/**
 * @param {!BentoAppBanner.Props} props
 * @return {PreactDef.Renderable}
 */
export function BentoAppBanner({exampleTagNameProp, children, ...rest}) {
  const styles = useStyles();

  return (
    <ContainWrapper layout paint {...rest}>
      {children}
    </ContainWrapper>
  );
}
