/** @enum {string}*/var _classes = { autoplayMaskButton: "autoplay-mask-button-0be5b4b", eq: "eq-0be5b4b", eqPlaying: "eq-playing-0be5b4b", eqCol: "eq-col-0be5b4b" }; /**
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



const eq = {
  pointerEvents: 'none !important',
  alignItems: 'flex-end',
  bottom: 7,
  height: 12,
  opacity: 0.8,
  overflow: 'hidden',
  position: 'absolute',
  right: 7,
  width: 20,
  zIndex: 1,
  display: 'flex' };


const eqCol = {
  flex: 1,
  height: '100%',
  marginRight: 1,
  position: 'relative',
  '&:before, &:after': {
    content: '""',
    animation: '0s linear infinite alternate $eq-animation',
    backgroundColor: '#FAFAFA',
    height: '100%',
    position: 'absolute',
    width: '100%',
    willChange: 'transform',
    animationPlayState: 'paused' },

  '&:nth-child(1)': {
    '&:before': { animationDuration: '0.3s' },
    '&:after': { animationDuration: '0.45s' } },

  '&:nth-child(2)': {
    '&:before': { animationDuration: '0.5s' },
    '&:after': { animationDuration: '0.4s' } },

  '&:nth-child(3)': {
    '&:before': { animationDuration: '0.3s' },
    '&:after': { animationDuration: '0.35s' } },

  '&:nth-child(4)': {
    '&:before': { animationDuration: '0.4s' },
    '&:after': { animationDuration: '0.25s' } } };



const eqPlaying = {
  // These are same as `eqCol`
  '& > div:before, & > div:after': { animationPlayState: 'running' } };


const autoplayMaskButton = {
  display: 'block',
  appearance: 'none',
  background: 'transparent',
  border: 'none',
  width: '100%' };


const JSS = {
  autoplayMaskButton,
  eq,
  eqPlaying,
  eqCol,
  '@keyframes eq-animation': {
    '0%': { transform: 'translateY(100%)' },
    '100%': { transform: 'translateY(0)' } } };export const $autoplayMaskButton = "autoplay-mask-button-0be5b4b";export const $eq = "eq-0be5b4b";export const $eqPlaying = "eq-playing-0be5b4b";export const $eqCol = "eq-col-0be5b4b";



// useStyles gets replaced for AMP builds via `babel-plugin-transform-jss`.
// eslint-disable-next-line local/no-export-side-effect
export const useStyles = (() => _classes);export const CSS = ".autoplay-mask-button-0be5b4b{width:100%;border:none;display:block;-webkit-appearance:none;appearance:none;background:transparent}.eq-0be5b4b{right:7px;width:20px;bottom:7px;height:12px;display:-ms-flexbox;display:flex;opacity:0.8;z-index:1;overflow:hidden;position:absolute;-ms-flex-align:end;align-items:flex-end;pointer-events:none!important}.eq-playing-0be5b4b>div:after,.eq-playing-0be5b4b>div:before{animation-play-state:running}.eq-col-0be5b4b{-ms-flex:1;flex:1;height:100%;position:relative;margin-right:1px}.eq-col-0be5b4b:after,.eq-col-0be5b4b:before{width:100%;height:100%;content:\"\";position:absolute;animation:keyframes-eq-animation-0be5b4b 0s linear infinite alternate;will-change:transform;background-color:#fafafa;animation-play-state:paused}.eq-col-0be5b4b:nth-child(4):before{animation-duration:0.4s}.eq-col-0be5b4b:nth-child(4):after{animation-duration:0.25s}.eq-col-0be5b4b:nth-child(3):before{animation-duration:0.3s}.eq-col-0be5b4b:nth-child(3):after{animation-duration:0.35s}.eq-col-0be5b4b:nth-child(2):before{animation-duration:0.5s}.eq-col-0be5b4b:nth-child(2):after{animation-duration:0.4s}.eq-col-0be5b4b:first-child:before{animation-duration:0.3s}.eq-col-0be5b4b:first-child:after{animation-duration:0.45s}@keyframes keyframes-eq-animation-0be5b4b{0%{transform:translateY(100%)}to{transform:translateY(0)}}";