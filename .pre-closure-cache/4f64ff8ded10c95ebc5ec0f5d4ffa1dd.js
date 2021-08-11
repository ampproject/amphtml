import { $thumbnail as _$thumbnail } from "./component.jss";import { $topControl as _$topControl2 } from "./component.jss";import { $control as _$control4 } from "./component.jss";import { $nextArrow as _$nextArrow } from "./component.jss";import { $prevArrow as _$prevArrow } from "./component.jss";import { $control as _$control3 } from "./component.jss";import { $arrow as _$arrow } from "./component.jss";import { $closeButton as _$closeButton } from "./component.jss";import { $topControl as _$topControl } from "./component.jss";import { $control as _$control2 } from "./component.jss";import { $grid as _$grid } from "./component.jss";import { $gallery as _$gallery2 } from "./component.jss";import { $captionText as _$captionText } from "./component.jss";import { $control as _$control } from "./component.jss";import { $caption as _$caption } from "./component.jss";import { $gallery as _$gallery } from "./component.jss";import { $controlsPanel as _$controlsPanel } from "./component.jss";import { $hideControls as _$hideControls } from "./component.jss";import { $showControls as _$showControls } from "./component.jss";import { $lightbox as _$lightbox } from "./component.jss";var _path, _g, _rect, _circle, _polygon; /**
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
import * as Preact from "../../../src/preact";
import { BaseCarousel } from "../../amp-base-carousel/1.0/component";
import { Lightbox } from "../../amp-lightbox/1.0/component";
import { LightboxGalleryContext } from "./context";
import { PADDING_ALLOWANCE, useStyles } from "./component.jss";
import { forwardRef } from "../../../src/preact/compat";
import { mod } from "../../../src/core/math";
import {
useCallback,
useImperativeHandle,
useLayoutEffect,
useRef,
useState } from "../../../src/preact";

import objstr from 'obj-str';

/** @const {string} */
const DEFAULT_GROUP = 'default';

/** @const {string} */
const EXPOSED_CAPTION_CLASS = 'amp-lightbox-gallery-caption';

/** @enum {string}  */
const CaptionState = {
  AUTO: 'auto',
  CLIP: 'clip',
  EXPAND: 'expanded' };


/** @const {!JsonObject<string, string>} */
const CAPTION_PROPS = {
  'aria-label': 'Toggle caption expanded state.',
  'role': 'button' };


/**
 * @param {!LightboxGalleryDef.Props} props
 * @param {{current: ?LightboxDef.LightboxApi}} ref
 * @return {PreactDef.Renderable}
 */
export function LightboxGalleryProviderWithRef(
{
  children,
  onAfterClose,
  onAfterOpen,
  onBeforeOpen,
  onToggleCaption,
  onViewGrid,
  render },

ref)
{
  const classes = useStyles();
  const lightboxRef = useRef(null);
  const carouselRef = useRef(null);
  const { 0: index, 1: setIndex } = useState(0);
  const renderers = useRef({});
  const captions = useRef({});

  // Prefer counting elements over retrieving array lengths because
  // array can contain empty values that have been deregistered.
  const count = useRef({});
  const carouselElements = useRef({});
  const gridElements = useRef({});

  const { 0: showCarousel, 1: setShowCarousel } = useState(true);
  const { 0: showControls, 1: setShowControls } = useState(true);
  const { 0: group, 1: setGroup } = useState(null);
  const renderElements = useCallback((opt_group) => {
    const group = opt_group ?? Object.keys(renderers.current)[0];
    if (!group) {
      return;
    }
    if (!carouselElements.current[group]) {
      carouselElements.current[group] = [];
      gridElements.current[group] = [];
      count.current[group] = 0;
    }
    renderers.current[group].forEach((render, index) => {
      if (!carouselElements.current[group][index]) {
        const absoluteIndex = count.current[group];
        carouselElements.current[group][index] = render();
        gridElements.current[group][index] =
        Preact.createElement(Thumbnail, {
          onClick: () => {
            setShowCarousel(true);
            setIndex(absoluteIndex);
          },
          render: render });


        count.current[group] += 1;
      }
    });
    setGroup(group);
  }, []);

  const register = useCallback(
  (key, group = DEFAULT_GROUP, render, caption) => {let _group = group;
    // Given key is 1-indexed.
    if (!renderers.current[_group]) {
      renderers.current[_group] = [];
      captions.current[_group] = [];
    }
    renderers.current[_group][key - 1] = render;
    captions.current[_group][key - 1] = caption;
  },
  []);


  const deregister = useCallback((key, group = DEFAULT_GROUP) => {let _group2 = group;
    // Given key is 1-indexed.
    delete renderers.current[_group2][key - 1];
    delete captions.current[_group2][key - 1];
    delete carouselElements.current[_group2][key - 1];
    count.current[_group2]--;
  }, []);

  const open = useCallback(
  (opt_index, opt_group) => {
    renderElements(opt_group);
    setShowControls(true);
    setShowCarousel(true);
    if (opt_index != null) {
      setIndex(opt_index);
    }
    lightboxRef.current?.open();
  },
  [renderElements]);


  const context = {
    deregister,
    register,
    open };


  const captionRef = useRef(undefined);
  const { 0: caption, 1: setCaption } = useState(null);
  const { 0: captionState, 1: setCaptionState } = useState(CaptionState.AUTO);
  useLayoutEffect(() => {
    carouselRef.current?.goToSlide(index);
    if (group) {
      // This is the index to target accounting for existing empty
      // entries in our render sets. Prefer to account for empty
      // entries over filtering them out to respect the index the nodes
      // were originally registered with by the user.
      const inflatedIndex =
      // Registered element entries, including empty.
      renderers.current[group].length -
      // Registered element entries rendered.
      count.current[group] +
      // Normalized carousel index.
      mod(index, count.current[group]);
      setCaption(captions.current[group][inflatedIndex]);
      setCaptionState(CaptionState.AUTO);
    }
  }, [group, index]);

  useLayoutEffect(() => {
    const { offsetHeight, scrollHeight } = captionRef.current ?? {};
    if (scrollHeight > offsetHeight + PADDING_ALLOWANCE) {
      setCaptionState(CaptionState.CLIP);
    }
  }, [caption]);

  useImperativeHandle(
  ref,
  () => ({
    open,
    close: () => {
      lightboxRef.current?.close();
    } }),

  [open]);


  return (
    Preact.createElement(Preact.Fragment, null,
    Preact.createElement(Lightbox, {
      className: ((((((((('' + (((
      true ? _$lightbox : '')))))) + (((
      showControls ? ' ' + _$showControls : '')))))) + (((
      !showControls ? ' ' + _$hideControls : '')))))),

      closeButtonAs: CloseButtonIcon,
      onBeforeOpen: onBeforeOpen,
      onAfterOpen: onAfterOpen,
      onAfterClose: onAfterClose,
      ref: lightboxRef },

    Preact.createElement("div", { className: _$controlsPanel },
    Preact.createElement(ToggleViewIcon, {
      onClick: () => {
        if (showCarousel) {
          onViewGrid?.();
        }
        setShowCarousel(!showCarousel);
      },
      showCarousel: showCarousel })),


    Preact.createElement(BaseCarousel, {
      arrowPrevAs: NavButtonIcon,
      arrowNextAs: NavButtonIcon,
      className: _$gallery,
      defaultSlide: mod(index, count.current[group]) || 0,
      hidden: !showCarousel,
      loop: true,
      onClick: () => setShowControls(!showControls),
      onSlideChange: (i) => setIndex(i),
      ref: carouselRef },

    carouselElements.current[group]),

    Preact.createElement("div", {
      hidden: !showCarousel,
      className: (((((((((((('' + ((((
      true ? _$caption : '')))))))) + ((((
      true ? ' ' + _$control : '')))))))) + ((((
      true ? ' ' + classes[captionState] : '')))))))),

      ref: captionRef, ...((((
      captionState === CaptionState.AUTO ?
      null :
      {
        onClick: () => {
          onToggleCaption?.();
          if (captionState === CaptionState.CLIP) {
            setCaptionState(CaptionState.EXPAND);
          } else {
            setCaptionState(CaptionState.CLIP);
          }
        },
        ...CAPTION_PROPS })))) },


    Preact.createElement("div", {
      className: (((((((((('' + (((((
      true ? _$captionText : '')))))))))) + (((((" amp-lightbox-gallery-caption")))))))))),


      part: "caption" },

    caption)),


    !showCarousel &&
    Preact.createElement("div", {
      className: (((((((('' + ((((true ? _$gallery2 : '')))))))) + ((((true ? ' ' + _$grid : '')))))))) },

    gridElements.current[group])),



    Preact.createElement(LightboxGalleryContext.Provider, { value: context },
    render ? render() : children)));



}

const LightboxGalleryProvider = forwardRef(LightboxGalleryProviderWithRef);
LightboxGalleryProvider.displayName = 'LightboxGalleryProvider';
export { LightboxGalleryProvider };
/**
 * @param {!LightboxDef.CloseButtonProps} props
 * @return {PreactDef.Renderable}
 */
function CloseButtonIcon(props) {

  return (
    Preact.createElement("svg", { ...
      props,
      "aria-label": "Close the lightbox",
      className: (((((('' + ((
      true ? _$control2 : '')))) + ((
      true ? ' ' + _$topControl : '')))) + ((
      true ? ' ' + _$closeButton : '')))),

      role: "button",
      tabIndex: "0",
      viewBox: "0 0 24 24",
      xmlns: "http://www.w3.org/2000/svg" }, ((_path || ((_path =

    Preact.createElement("path", {
      d: "M6.4 6.4 L17.6 17.6 Z M17.6 6.4 L6.4 17.6 Z",
      stroke: "#fff",
      "stroke-width": "2",
      "stroke-linejoin": "round" })))))));



}

/**
 * @param {!BaseCarouselDef.ArrowProps} props
 * @return {PreactDef.Renderable}
 */
function NavButtonIcon({ by, ...rest }) {

  return (
    Preact.createElement("svg", { ...
      rest,
      className: (((((((('' + ((
      true ? _$arrow : '')))) + ((
      true ? ' ' + _$control3 : '')))) + ((
      by < 0 ? ' ' + _$prevArrow : '')))) + ((
      by > 0 ? ' ' + _$nextArrow : '')))),

      viewBox: "0 0 24 24",
      xmlns: "http://www.w3.org/2000/svg" },

    Preact.createElement("path", {
      d: by < 0 ? 'M14,7.4 L9.4,12 L14,16.6' : 'M10,7.4 L14.6,12 L10,16.6',
      fill: "none",
      stroke: "#fff",
      "stroke-width": "2",
      "stroke-linejoin": "round",
      "stroke-linecap": "round" })));



}

/**
 * @param {!BaseCarouselDef.ArrowProps} props
 * @return {PreactDef.Renderable}
 */
function ToggleViewIcon({ showCarousel, ...rest }) {

  return (
    Preact.createElement("svg", {
      "aria-label":
      showCarousel ? 'Switch to grid view' : 'Switch to carousel view',

      className: (((('' + ((
      true ? _$control4 : '')))) + ((
      true ? ' ' + _$topControl2 : '')))),

      role: "button",
      tabIndex: "0",
      viewBox: "0 0 24 24",
      xmlns: "http://www.w3.org/2000/svg", ...
      rest },

    showCarousel ? ((_g || ((_g =
    Preact.createElement("g", { fill: "#fff" },
    Preact.createElement("rect", { x: "3", y: "3", width: "6", height: "8", rx: "1", ry: "1" }),
    Preact.createElement("rect", { x: "15", y: "13", width: "6", height: "8", rx: "1", ry: "1" }),
    Preact.createElement("rect", { x: "11", y: "3", width: "10", height: "8", rx: "1", ry: "1" }),
    Preact.createElement("rect", { x: "3", y: "13", width: "10", height: "8", rx: "1", ry: "1" })))))) :


    Preact.createElement(Preact.Fragment, null, (((_rect || (((_rect =
    Preact.createElement("rect", {
      x: "4",
      y: "4",
      width: "16",
      height: "16",
      rx: "1",
      "stroke-width": "2",
      stroke: "#fff",
      fill: "none" }))))))), (((_circle || (((_circle =

    Preact.createElement("circle", { fill: "#fff", cx: "15.5", cy: "8.5", r: "1.5" }))))))), (((_polygon || (((_polygon =
    Preact.createElement("polygon", {
      fill: "#fff",
      points: "5,19 5,13 8,10 13,15 16,12 19,15 19,19" }))))))))));





}

/**
 * @param {!LightboxGalleryDef.ThumbnailProps} props
 * @return {PreactDef.Renderable}
 */
function Thumbnail({ onClick, render }) {

  return (
    Preact.createElement("div", {
      "aria-label": "View in carousel",
      className: _$thumbnail,
      onClick: onClick,
      role: "button" },

    render()));


}