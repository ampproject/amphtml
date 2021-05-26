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
import {Wrapper, useRenderer} from '../../../src/preact/component';
import {forwardRef} from '../../../src/preact/compat';
import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useState,
} from '../../../src/preact';
import {useResourcesNotify} from '../../../src/preact/utils';

/**
 * @param {!JsonObject} data
 * @return {string}
 */
const DEFAULT_RENDER = (data) => JSON.stringify(data);

/**
 * @param {string} url
 * @return {!Promise<!JsonObject>}
 */
const DEFAULT_GET_JSON = (url) => {
  return fetch(url).then((res) => res.json());
};

/**
 * @param {!RenderDef.Props} props
 * @param {{current: ?RenderDef.RenderApi}} ref
 * @return {PreactDef.Renderable}
 */
export function RenderWithRef(
  {
    src = '',
    getJson = DEFAULT_GET_JSON,
    render = DEFAULT_RENDER,
    onLoading,
    onReady,
    onRefresh,
    onError,
    ariaLiveValue = 'polite',
    ...rest
  },
  ref
) {
  useResourcesNotify();

  const [data, setData] = useState({});

  useEffect(() => {
    // TODO(dmanek): Add additional validation for src
    // when adding url replacement logic.
    if (!src) {
      return;
    }
    let cancelled = false;
    onLoading?.();
    getJson(src)
      .then((data) => {
        if (!cancelled) {
          setData(data);
          onReady?.();
        }
      })
      .catch((e) => {
        onError?.(e);
      });
    return () => {
      cancelled = true;
    };
  }, [getJson, src, onLoading, onReady, onError]);

  const refresh = useCallback(() => {
    onRefresh?.();
    getJson(src, /* shouldRefresh */ true)
      .then((data) => {
        setData(data);
        onReady?.();
      })
      .catch((e) => {
        onError?.(e);
      });
  }, [getJson, src, onReady, onRefresh, onError]);

  useImperativeHandle(
    ref,
    () =>
      /** @type {!RenderDef.RenderApi} */ ({
        refresh,
      }),
    [refresh]
  );

  const rendered = useRenderer(render, data);
  const isHtml =
    rendered && typeof rendered == 'object' && '__html' in rendered;

  return (
    <Wrapper {...rest} dangerouslySetInnerHTML={isHtml ? rendered : null} aria-live={ariaLiveValue}>
      {isHtml ? null : rendered}
    </Wrapper>
  );
}

const Render = forwardRef(RenderWithRef);
Render.displayName = 'Render';
export {Render};
