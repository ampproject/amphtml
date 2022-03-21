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

/**
 * @param {!BentoImgur.Props} props
 * @return {PreactDef.Renderable}
 */
export function BentoImgur({exampleTagNameProp, ...rest}) {
  // Examples of state and hooks
  const [exampleValue, setExampleValue] = useState(0);
  const exampleRef = useRef(null);

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
      <div class={`${styles.exampleContentHidden}`}>This is hidden</div>
    </ContainWrapper>
  );
}
