import * as Preact from '#preact';
import {ContainWrapper} from '#preact/component';
import {useAmpContext} from '#preact/context';
import {xhrUtils} from '#preact/utils/xhr';

import {useStyles} from './component.jss';
import {useAsync} from './useAsync';

const listItemTemplate = (item) => <li>{item}</li>;
const listWrapperTemplate = (list) => <ul>{list}</ul>;

/**
 * @param {!BentoList.Props} props
 * @return {PreactDef.Renderable}
 */
export function BentoList({
  src = null,
  fetchJson = xhrUtils.fetchJson,
  itemsKey = 'items',
  template: itemTemplate = listItemTemplate,
  wrapper: wrapperTemplate = listWrapperTemplate,
  loading: loadingTemplate = (src) => 'Loading...',
  error: errorTemplate = (err) => 'Error: ' + err.message,
  ...rest
}) {
  const {playable, renderable} = useAmpContext();

  const styles = useStyles();

  const {error, loading, results} = useAsync(async () => {
    if (!renderable) {
      return null;
    }
    const results = await fetchJson(src).then((res) => res.json());
    return results;
  }, [fetchJson, src, renderable]);

  const items = results?.[itemsKey];

  let children = items?.map((item) => itemTemplate(item));
  if (wrapperTemplate) {
    children = wrapperTemplate(children);
  }

  return (
    <ContainWrapper {...rest}>
      {children}
      {loading && loadingTemplate && loadingTemplate(src)}
      {error && errorTemplate && errorTemplate(error)}
    </ContainWrapper>
  );
}
