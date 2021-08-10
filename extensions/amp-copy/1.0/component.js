/**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
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
import * as Preact from '#preact';
import {
  copyTextToClipboard,
  isCopyingToClipboardSupported,
} from '#core/window/clipboard';
import {
  useCallback,
  useImperativeHandle,
  useLayoutEffect,
  useState,
} from '#preact';
import {forwardRef} from '#preact/compat';
import {useStyles} from './component.jss';
import objstr from 'obj-str';

/**
 * @param {!CopyDef.Props} props
 * @param {{current: ?CopyDef.CopyApi}} ref
 * @return {PreactDef.Renderable}
 */
export function CopyWithRef({children, sourceId, text, ...rest}, ref) {
  const [status, setStatus] = useState(null);
  const [isCopySupported, setIsCopySupported] = useState(false);
  const classes = useStyles();
  useLayoutEffect(() => {
    if (!ref.current) {
      return;
    }
    if (isCopyingToClipboardSupported(ref.current.ownerDocument)) {
      setIsCopySupported(true);
    } else {
      setIsCopySupported(false);
    }
  }, [ref, setIsCopySupported]);

  const copy = useCallback(
    (sourceId) => {
      let textToCopy = '';

      if (sourceId == undefined) {
        // Copy static text value
        textToCopy = text;
      } else {
        // Copy content of sourceId element
        const content = ref.current.ownerDocument.getElementById(sourceId);
        textToCopy = (content.value ?? content.textContent).trim();
      }

      setStatus(copyTextToClipboard(window, textToCopy));

      setTimeout(() => {
        setStatus(null);
      }, 3000);
    },
    [ref, text]
  );

  const copyText = useCallback((textToCopy) => {
    setStatus(copyTextToClipboard(window, textToCopy));

    setTimeout(() => {
      setStatus(null);
    }, 3000);
  }, []);

  /** Copy Component - API Function */
  useImperativeHandle(
    ref,
    () =>
      /** @type {!CopyDef.CopyApi} */ ({
        copyToClipboard: (selector = null, staticText = null) => {
          if (selector !== null) {
            copy(selector);
          } else if (staticText !== null) {
            copyText(staticText);
          } else {
            // TODO: Assert Error
          }
        },
      }),
    [copy, copyText]
  );

  return (
    <button
      ref={ref}
      className={objstr({
        [classes.success]: status,
        [classes.failed]: status === false,
        [classes.enabled]: isCopySupported,
        [classes.disabled]: !isCopySupported,
      })}
      layout
      size
      paint
      {...rest}
      onClick={() => copy(sourceId)}
    >
      {children}
    </button>
  );
}

const Copy = forwardRef(CopyWithRef);
Copy.displayName = 'Copy'; // Make findable for tests.
export {Copy};
