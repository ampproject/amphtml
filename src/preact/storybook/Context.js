import {Loading_Enum} from '#core/constants/loading-instructions';

import * as Preact from '#preact';
import {WithAmpContext, useAmpContext, useLoading} from '#preact/context';

export default {
  title: '0/Context',
};

const IMG_SRC =
  "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24px' height='24px' viewBox='0 0 24 24' fill='%23000000'%3E%3Cpath d='M0 0h24v24H0z' fill='none'/%3E%3Cpath d='M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z'/%3E%3C/svg%3E";

export const _default = ({...args}) => {
  return (
    <WithAmpContext {...args}>
      <Composite />
    </WithAmpContext>
  );
};

_default.args = {
  renderable: true,
  playable: true,
};

_default.argTypes = {
  loading: {
    name: 'loading',
    defaultValue: 'auto',
    options: ['auto', 'lazy', 'eager', 'unload'],
    control: {type: 'select'},
  },
};

/**
 * @return {import('preact').VNode}
 */
function Composite() {
  return (
    <div class="composite">
      <Info title="Default" />
      <WithAmpContext renderable={false}>
        <Info title="Context: non-renderable" />
      </WithAmpContext>
      <WithAmpContext playable={false}>
        <Info title="Context: non-playable" />
      </WithAmpContext>
      <Info title="Prop: loading = lazy" loading="lazy" />
    </div>
  );
}

/**
 * @param {{title: string, loading?: string}} props
 * @return {import('preact').VNode}
 */
function Info({loading: loadingProp, title, ...rest}) {
  const {loading: loadingContext, playable, renderable} = useAmpContext();
  const loading = useLoading(loadingProp ?? Loading_Enum.AUTO);
  const load = loading != 'unload';
  const infoStyle = {border: '1px dotted gray', margin: 8};
  const imgStyle = {
    marginLeft: 8,
    width: 20,
    height: 20,
    verticalAlign: 'bottom',
  };
  return (
    <section {...rest} style={infoStyle}>
      <h3>{title}:</h3>
      <div>
        <div>context.renderable: {String(renderable)}</div>
        <div>context.playable: {String(playable)}</div>
        <div>context.loading: {String(loadingContext)}</div>
        <div>useLoading.loading: {String(loading)}</div>
        <div>load: {String(load)}</div>
        <div>
          img: {String(load)}
          <img src={load ? IMG_SRC : undefined} style={imgStyle} />
        </div>
      </div>
    </section>
  );
}
