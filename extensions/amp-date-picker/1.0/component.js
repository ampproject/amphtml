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
 * @param {!BentoDatePicker.Props} props
 * @return {PreactDef.Renderable}
 */
export function BentoDatePicker({exampleTagNameProp, ...rest}) {
  return (
    <ContainWrapper layout size paint {...rest}>
      {exampleTagNameProp}
    </ContainWrapper>
  );
}
