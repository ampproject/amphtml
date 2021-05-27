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

import * as Preact from '../../../src/preact';
import {ContainWrapper} from '../../../src/preact/component';
import {forwardRef} from '../../../src/preact/compat';
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from '../../../src/preact';
import { getDailymotionIframeSrc } from '../dailymotion-api';
/**
 * @param {!DailymotionDef.Props} props
 * @param ref
 * @return {PreactDef.Renderable}
 */
export function DailymotionWithRef({videoId, ...rest}, ref) {
  const src = useMemo(
    () =>
      getDailymotionIframeSrc(videoId, mute, endscreenEnable, sharingEnable, start, uiHighlight, uiLog, info);
    [videoId]
  );
  const makeMethodMessage = useCallback(() => '{}', []);

  const onMessage = useCallback((e) => {
    console.log(e);
  }, []);
  return (
    <VideoIframe
      ref={ref}
      {...rest}
      src={src}
      makeMethodMessage={makeMethodMessage}
      onMessage={onMessage}
    />
  );
}

const Dailymotion = forwardRef(DailymotionWithRef);
Dailymotion.displayName = 'Dailymotion';
export {Dailymotion};
