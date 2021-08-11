var _style, _style2; /**
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

import { withAmp } from '@ampproject/storybook-addon';
import { number, withKnobs } from '@storybook/addon-knobs';

import * as Preact from "../../preact";

export default {
  title: '0/amp-layout',
  decorators: [withKnobs, withAmp] };


export const responsive = () => {
  const width = number('width', 400);
  const height = number('height', 300);
  return (
    Preact.createElement("main", null, ((_style || ((_style =
    Preact.createElement("style", { jsx: true, global: true },
    `
          .content {
            background: cyan;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100%;
            height: 100%;
          }
        `))))),

    Preact.createElement("amp-layout", { layout: "responsive", width: width, height: height },
    Preact.createElement("div", { className: "content" },
    width, ":", height))));




};

export const intrinsic = () => {
  const width = number('width', 800);
  const height = number('height', 600);
  const maxWidth = number('maxWidth', 400);
  return (
    Preact.createElement("main", null, ((_style2 || ((_style2 =
    Preact.createElement("style", { jsx: true, global: true },
    `
          .container {
            background: lightgray;
            position: relative;
            float: left;
          }
          .content {
            background: cyan;
            width: 100%;
            height: 100%;
          }
        `))))),

    Preact.createElement("div", { class: "container" },
    Preact.createElement("amp-layout", {
      layout: "intrinsic",
      width: width,
      height: height,
      style: { maxWidth } },

    Preact.createElement("div", { class: "content" },
    width, ":", height)))));





};