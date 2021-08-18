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
import {forwardRef} from '#preact/compat';
import {ProxyIframeEmbed} from '#preact/component/3p-frame';
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from '#preact';
/**
 * @param {!RedditDef.Props} props
 * @param ref
 * @return {PreactDef.Renderable}
 */
export function RedditWithRef({embedtype, src, ...rest}, ref) {
  const onMessage = useCallback((event) => {
    console.log(event);
    const data = deserializeMessage(event.data);
    // console.log(e);
  }, []);

  const options = useMemo(() => ({src}), [src]);

  return <ProxyIframeEmbed ref={ref} options={options} type="reddit" {...rest} />;
}

const Reddit = forwardRef(RedditWithRef);
Reddit.displayName = 'Reddit';
export {Reddit};
