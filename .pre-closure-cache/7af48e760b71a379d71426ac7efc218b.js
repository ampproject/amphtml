var _Composite, _div; /**
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

import { boolean, select, withKnobs } from '@storybook/addon-knobs';

import * as Preact from "./..";
import { WithAmpContext, useAmpContext, useLoading } from "../context";

export default {
  title: '0/Context',
  decorators: [withKnobs] };


const IMG_SRC =
"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24px' height='24px' viewBox='0 0 24 24' fill='%23000000'%3E%3Cpath d='M0 0h24v24H0z' fill='none'/%3E%3Cpath d='M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z'/%3E%3C/svg%3E";

const LOADING_OPTIONS = ['auto', 'lazy', 'eager', 'unload'];

export const _default = () => {
  const renderable = boolean('top renderable', true);
  const playable = boolean('top playable', true);
  const loading = select('top loading', LOADING_OPTIONS, LOADING_OPTIONS[0]);
  return (
    Preact.createElement(WithAmpContext, {
      renderable: renderable,
      playable: playable,
      loading: loading }, ((_Composite || ((_Composite =

    Preact.createElement(Composite, null)))))));


};

/**
 * @return {PreactDef.Renderable}
 */
function Composite() {
  return (_div || (_div =
  Preact.createElement("div", { class: "composite" },
  Preact.createElement(Info, { title: "Default" }),
  Preact.createElement(WithAmpContext, { renderable: false },
  Preact.createElement(Info, { title: "Context: non-renderable" })),

  Preact.createElement(WithAmpContext, { playable: false },
  Preact.createElement(Info, { title: "Context: non-playable" })),

  Preact.createElement(Info, { title: "Prop: loading = lazy", loading: "lazy" }))));


}

/**
 * @param {{title: string, loading: string}} props
 * @return {PreactDef.Renderable}
 */
function Info({ loading: loadingProp, title, ...rest }) {
  const { loading: loadingContext, playable, renderable } = useAmpContext();
  const loading = useLoading(loadingProp);
  const load = loading != 'unload';
  const infoStyle = { border: '1px dotted gray', margin: 8 };
  const imgStyle = {
    marginLeft: 8,
    width: 20,
    height: 20,
    verticalAlign: 'bottom' };

  return (
    Preact.createElement("section", { ...rest, style: infoStyle },
    Preact.createElement("h3", null, title, ":"),
    Preact.createElement("div", null,
    Preact.createElement("div", null, "context.renderable: ", String(renderable)),
    Preact.createElement("div", null, "context.playable: ", String(playable)),
    Preact.createElement("div", null, "context.loading: ", String(loadingContext)),
    Preact.createElement("div", null, "useLoading.loading: ", String(loading)),
    Preact.createElement("div", null, "load: ", String(load)),
    Preact.createElement("div", null, "img: ",
    String(load),
    Preact.createElement("img", { src: load ? IMG_SRC : undefined, style: imgStyle })))));




}