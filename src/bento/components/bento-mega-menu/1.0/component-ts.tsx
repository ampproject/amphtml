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
 * @param {!BentoMegaMenu.Props} props
 * @return {PreactDef.Renderable}
 */
export function BentoMegaMenu({exampleTagNameProp, ...rest}) {
  // Examples of state and hooks
  // DO NOT SUBMIT: This is example code only.
  const [exampleValue, setExampleValue] = useState(0);
  const exampleRef = useRef(null);
  const styles = useStyles();

  useCallback(() => {
    /* Do things */
  }, []);
  useEffect(() => {
    /* Do things */
  }, []);
  useLayoutEffect(() => {
    /* Do things */
  }, []);
  useMemo(() => {
    /* Do things */
  }, []);

  return (
    <ContainWrapper layout size paint {...rest}>
      {exampleTagNameProp}
      <div className={`${styles.exampleContentHidden}`}>This is hidden</div>
    </ContainWrapper>
  );
}
