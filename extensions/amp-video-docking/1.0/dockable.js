/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
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
import {DockContext} from './dock';
import {
  useContext,
  useLayoutEffect,
  useRef,
  useState,
} from '../../../src/preact';

/**
 * @param {*} props
 * @return {!PreactDef.Renderable}
 */
export function Dockable({render, handle, docks = false, ...rest}) {
  const containerRef = useRef();

  const context = useContext(DockContext);
  const [currentStyles, setCurrentStyles] = useState(null);

  const styles = context?.styles;

  useLayoutEffect(() => {
    const {current} = containerRef;
    context?.use(current, docks);
    if (styles?.element === current) {
      if (handle?.current) {
        context.setHandle(handle.current);
      }
      setCurrentStyles(styles);
    } else {
      setCurrentStyles(null);
    }
  }, [context, styles, docks, handle, containerRef, setCurrentStyles]);

  return (
    <ContainWrapper
      {...rest}
      ref={containerRef}
      size={!currentStyles}
      layout={!currentStyles}
      paint={!currentStyles}
    >
      {render(!!currentStyles, currentStyles?.dockedStyle)}
    </ContainWrapper>
  );
}
