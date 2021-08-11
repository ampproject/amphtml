var _button, _button2, _button3, _button4, _button5, _button6, _button7; /**
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

import * as Preact from "../../../../src/preact";
import { button, number, select, text } from '@storybook/addon-knobs';

const FILL_OPTIONS = {
  none: 'none',
  forwards: 'forwards',
  backwards: 'backwards',
  both: 'both' };


const DIRECTION_OPTIONS = {
  normal: 'normal',
  reverse: 'reverse',
  alternate: 'alternate',
  'alternate-reverse': 'alternate-reverse' };


const CONTAINER_STYLE = {
  position: 'relative',
  width: '300px',
  height: '300px',
  background: '#EEE',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center' };


const INFO_STYLE = {
  background: '#DDD',
  fontSize: 'x-small',
  margin: 0,
  position: 'absolute',
  top: 0,
  height: '100%',
  right: '-310px',
  width: '300px',
  overflow: 'auto' };


/**
 * @param {!Object} props
 * @return {!Object}
 */
export function AnimationTemplate(props) {
  const { children, spec } = props;
  const duration = text('Duration', '1s');
  const iterations = number('Iterations', 2);
  const fill = select('Fill', FILL_OPTIONS, 'both');
  const direction = select('Direction', DIRECTION_OPTIONS, 'alternate');
  const fullSpec = {
    duration,
    iterations,
    fill,
    direction,
    ...spec };

  return (
    Preact.createElement("main", null,
    Preact.createElement("amp-animation", { id: "anim1", layout: "nodisplay" },
    Preact.createElement("script", {
      type: "application/json",
      dangerouslySetInnerHTML: { __html: JSON.stringify(fullSpec) } })),



    Preact.createElement("div", { class: "buttons", style: { marginBottom: '8px' } }, (((_button || (((_button =
    Preact.createElement("button", { on: "tap:anim1.start" }, "Start"))))))), (((_button2 || (((_button2 =
    Preact.createElement("button", { on: "tap:anim1.restart" }, "Restart"))))))), (((_button3 || (((_button3 =
    Preact.createElement("button", { on: "tap:anim1.togglePause" }, "Toggle Pause"))))))), (((_button4 || (((_button4 =
    Preact.createElement("button", { on: "tap:anim1.seekTo(percent=0.5)" }, "Seek to 50%"))))))), (((_button5 || (((_button5 =
    Preact.createElement("button", { on: "tap:anim1.reverse" }, "Reverse"))))))), (((_button6 || (((_button6 =
    Preact.createElement("button", { on: "tap:anim1.finish" }, "Finish"))))))), (((_button7 || (((_button7 =
    Preact.createElement("button", { on: "tap:anim1.cancel" }, "Cancel")))))))),

    Preact.createElement("div", { style: CONTAINER_STYLE },
    Preact.createElement("pre", { style: INFO_STYLE }, JSON.stringify(fullSpec, null, 2)),

    children)));



}