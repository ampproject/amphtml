import * as Preact from '#preact';
import {useCallback, useEffect, useImperativeHandle, useState} from '#preact';
import {forwardRef} from '#preact/compat';
import {Wrapper, useValueRef} from '#preact/component';
import {useRenderer} from '#preact/component/renderer';
import {useResourcesNotify} from '#preact/utils';

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
    ariaLiveValue = 'polite',
    getJson = DEFAULT_GET_JSON,
    onError,
    onLoad,
    onLoading,
    onRefresh,
    render = DEFAULT_RENDER,
    src = '',
    ...rest
  },
  ref
) {
  useResourcesNotify();

  const [data, setData] = useState({});
  const onLoadRef = useValueRef(onLoad);
  const onErrorRef = useValueRef(onError);

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
        }
      })
      .catch((e) => {
        onErrorRef.current?.(e);
      });
    return () => {
      cancelled = true;
    };
  }, [getJson, src, onErrorRef, onLoading]);

  const refresh = useCallback(() => {
    onRefresh?.();
    getJson(src, /* shouldRefresh */ true)
      .then((data) => {
        setData(data);
        onLoadRef.current?.();
      })
      .catch((e) => {
        onErrorRef.current?.(e);
      });
  }, [getJson, src, onLoadRef, onRefresh, onErrorRef]);

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

  const refFn = useCallback(
    (node) => {
      if (!node?.firstElementChild || !rendered) {
        return;
      }
      onLoadRef.current?.();
    },
    [rendered, onLoadRef]
  );

  return (
    <Wrapper
      ref={refFn}
      {...rest}
      dangerouslySetInnerHTML={isHtml ? rendered : null}
      aria-live={ariaLiveValue}
    >
      {isHtml ? null : rendered}
    </Wrapper>
  );
}

const Render = forwardRef(RenderWithRef);
Render.displayName = 'Render';
export {Render};
