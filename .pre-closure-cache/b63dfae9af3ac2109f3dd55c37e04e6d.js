import { $arrowIcon as _$arrowIcon } from "./component.jss";import { $arrowBackground as _$arrowBackground } from "./component.jss";import { $arrowBaseStyle as _$arrowBaseStyle3 } from "./component.jss";import { $arrowBackdrop as _$arrowBackdrop } from "./component.jss";import { $arrowBaseStyle as _$arrowBaseStyle2 } from "./component.jss";import { $arrowFrosting as _$arrowFrosting } from "./component.jss";import { $arrowBaseStyle as _$arrowBaseStyle } from "./component.jss";import { $defaultArrowButton as _$defaultArrowButton } from "./component.jss";import { $ltr as _$ltr } from "./component.jss";import { $rtl as _$rtl } from "./component.jss";import { $insetArrow as _$insetArrow } from "./component.jss";import { $outsetArrow as _$outsetArrow } from "./component.jss";import { $arrowNext as _$arrowNext } from "./component.jss";import { $arrowPrev as _$arrowPrev } from "./component.jss";import { $arrowDisabled as _$arrowDisabled } from "./component.jss";import { $arrow as _$arrow } from "./component.jss"; /**
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

import * as Preact from "../../../src/preact";
import { useStyles } from "./component.jss";
import objstr from 'obj-str';

/**
 * @param {!BaseCarouselDef.ArrowProps} props
 * @return {PreactDef.Renderable}
 */
export function Arrow({
  advance,
  as: Comp = DefaultArrow,
  by,
  disabled,
  outsetArrows,
  rtl,
  ...rest })
{let _Comp = Comp;

  const onClick = () => {
    if (!disabled) {
      advance();
    }
  };
  return (
    Preact.createElement(_Comp, {
      "aria-disabled": String(!!disabled),
      by: by,
      className: (((((((((((((((('' + ((
      true ? _$arrow : '')))) + ((
      disabled ? ' ' + _$arrowDisabled : '')))) + ((
      by < 0 ? ' ' + _$arrowPrev : '')))) + ((
      by > 0 ? ' ' + _$arrowNext : '')))) + ((
      outsetArrows ? ' ' + _$outsetArrow : '')))) + ((
      !outsetArrows ? ' ' + _$insetArrow : '')))) + ((
      rtl ? ' ' + _$rtl : '')))) + ((
      !rtl ? ' ' + _$ltr : '')))),

      disabled: disabled,
      onClick: onClick,
      outsetArrows: outsetArrows,
      rtl: rtl, ...
      rest }));


}

/**
 * @param {!BaseCarouselDef.ArrowProps} props
 * @return {PreactDef.Renderable}
 */
function DefaultArrow({ by, className, ...rest }) {

  return (
    Preact.createElement("div", { className: className },
    Preact.createElement("button", {
      "aria-label":
      by < 0 ? 'Previous item in carousel' : 'Next item in carousel',

      className: _$defaultArrowButton, ...
      rest },

    Preact.createElement("div", {
      className: `${_$arrowBaseStyle} ${_$arrowFrosting}` }),

    Preact.createElement("div", {
      className: `${_$arrowBaseStyle2} ${_$arrowBackdrop}` }),

    Preact.createElement("div", {
      className: `${_$arrowBaseStyle3} ${_$arrowBackground}` }),

    Preact.createElement("svg", { className: _$arrowIcon, viewBox: "0 0 24 24" },
    Preact.createElement("path", {
      d:
      by < 0 ? 'M14,7.4 L9.4,12 L14,16.6' : 'M10,7.4 L14.6,12 L10,16.6',

      fill: "none",
      "stroke-width": "2px",
      "stroke-linejoin": "round",
      "stroke-linecap": "round" })))));





}