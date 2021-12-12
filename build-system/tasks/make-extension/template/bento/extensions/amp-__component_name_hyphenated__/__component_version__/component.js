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
__jss_import_use_styles__;

/**
 * @param {!Bento__component_name_pascalcase__.Props} props
 * @return {PreactDef.Renderable}
 */
export function Bento__component_name_pascalcase__({exampleTagNameProp, ...rest}) {
  // Examples of state and hooks
  // __do_not_submit__: This is example code only.
  const [exampleValue, setExampleValue] = useState(0);
  const exampleRef = useRef(null);
  __jss_styles_use_styles__;

  useCallback(() => {/* Do things */}, [])
  useEffect(() => {/* Do things */}, [])
  useLayoutEffect(() => {/* Do things */}, [])
  useMemo(() => {/* Do things */}, [])

  return (
    <ContainWrapper layout size paint {...rest} >
      {exampleTagNameProp}
      <div className={__jss_styles_example_or_placeholder__}>
        This is hidden
      </div>
    </ContainWrapper>
  );
}
