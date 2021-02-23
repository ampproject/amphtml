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

import * as Preact from '../';
import {WithAmpContext, useAmpContext, useLoad} from '../context';
import {boolean, select, withKnobs} from '@storybook/addon-knobs';

import {withA11y} from '@storybook/addon-a11y';

export default {
  title: '0/Context',
  decorators: [withA11y, withKnobs],
};

const IMG_SRC =
  "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24px' height='24px' viewBox='0 0 24 24' fill='%23000000'%3E%3Cpath d='M0 0h24v24H0z' fill='none'/%3E%3Cpath d='M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z'/%3E%3C/svg%3E";

const LOADING_OPTIONS = ['auto', 'lazy', 'eager', 'unload'];

export const _default = () => {
  const renderable = boolean('top renderable', true);
  const playable = boolean('top playable', true);
  const loading = select('top loading', LOADING_OPTIONS, LOADING_OPTIONS[0]);
  return (
    <WithAmpContext
      renderable={renderable}
      playable={playable}
      loading={loading}
    >
      <Composite />
    </WithAmpContext>
  );
};

/**
 * @return {PreactDef.Renderable}
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
 * @param {{title: string, loading: string}} props
 * @return {PreactDef.Renderable}
 */
function Info({title, loading: loadingProp, ...rest}) {
  const {renderable, playable, loading} = useAmpContext();
  const load = useLoad(loadingProp);
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
        <div>context.loading: {String(loading)}</div>
        <div>useLoad.load: {String(load)}</div>
        <div>
          img: {String(load)}
          <img src={load ? IMG_SRC : undefined} style={imgStyle} />
        </div>
      </div>
    </section>
  );
}
