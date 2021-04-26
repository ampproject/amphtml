/**
 * Copyright __current_year__ The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as Preact from '../../../src/preact';
import {ContainWrapper} from '../../../src/preact/component';
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from '../../../src/preact';
import {useStyles} from './component.jss';

/**
 * @param {!__component_name_pascalcase__Def.Props} props
 * @return {PreactDef.Renderable}
 */
export function __component_name_pascalcase__({exampleTagNameProp, ...rest}) {
  // Examples of state and hooks
  // __do_not_submit__: This is example code only.
  const [exampleValue, setExampleValue] = useState(0);
  const exampleRef = useRef(null);
  const styles = useStyles();

  useCallback(() => {/* Do things */}, [])
  useEffect(() => {/* Do things */}, [])
  useLayoutEffect(() => {/* Do things */}, [])
  useMemo(() => {/* Do things */}, [])

  return (
    <ContainWrapper layout size paint {...rest} >
      {{exampleTagNameProp}}
      <div className={`${styles.exampleContentHidden}`}>
        This is hidden
      </div>
    </ContainWrapper>
  );
}
