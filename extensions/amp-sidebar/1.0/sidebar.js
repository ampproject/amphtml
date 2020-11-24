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
import {forwardRef} from '../../../src/preact/compat';
import {
  useCallback,
  useContext,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useState,
} from '../../../src/preact';
import {useStyles} from './sidebar.jss';

/**
 * @param {!AccordionDef.Props} props //update me
 * @param ref
 * @return {PreactDef.Renderable}
 */
function SidebarWithRef({as: Comp = 'div', children, side, ...rest}, ref) {
  const [opened, setOpened] = useState(true);
  const toggle = useCallback(() => setOpened((prev) => !prev), []);
  const open = useCallback(() => setOpened(true), []);
  const close = useCallback(() => setOpened(false), []);

  useImperativeHandle(
    ref,
    () => ({
      toggle,
      open,
      close,
    }),
    [toggle, open, close]
  );

  const classes = useStyles();
  const sideClass = side === 'left' ? classes.left : classes.right;
  const closedClass =
    side === 'left' ? classes.leftClosed : classes.rightClosed;

  return (
    <Comp
      {...rest}
      className={`${classes.baseClass} ${sideClass} ${
        opened ? classes.opened : closedClass
      }`}
    >
      {children}
    </Comp>
  );
}

const Sidebar = forwardRef(SidebarWithRef);
Sidebar.displayName = 'Sidebar'; // Make findable for tests.
export {Sidebar};
