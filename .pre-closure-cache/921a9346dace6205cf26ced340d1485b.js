var _h, _source, _summary, _source2; /**
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
import { VideoElementWithActions } from "./_helpers";
import { boolean, number, object, text, withKnobs } from '@storybook/addon-knobs';
import { withAmp } from '@ampproject/storybook-addon';

export default {
  title: 'amp-video-1_0',
  decorators: [withKnobs, withAmp],
  parameters: {
    extensions: [
    { name: 'amp-video', version: '1.0' },
    { name: 'amp-accordion', version: '1.0' }],

    experiments: ['bento'] } };



const AmpVideoWithKnobs = ({ i, ...rest }) => {
  const group = i ? `Player ${i + 1}` : undefined;

  const width = text('width', '640px', group);
  const height = text('height', '360px', group);

  const ariaLabel = text('aria-label', 'Video Player', group);
  const autoplay = boolean('autoplay', true, group);
  const controls = boolean('controls', true, group);
  const mediasession = boolean('mediasession', true, group);
  const noaudio = boolean('noaudio', false, group);
  const loop = boolean('loop', false, group);
  const poster = text(
  'poster',
  'https://amp.dev/static/inline-examples/images/kitten-playing.png',
  group);


  const artist = text('artist', '', group);
  const album = text('album', '', group);
  const artwork = text('artwork', '', group);
  const title = text('title', '', group);

  const sources = object(
  'sources',
  [
  {
    src: 'https://amp.dev/static/inline-examples/videos/kitten-playing.webm',
    type: 'video/webm' },

  {
    src: 'https://amp.dev/static/inline-examples/videos/kitten-playing.mp4',
    type: 'video/mp4' }],


  group);


  return (
    Preact.createElement("amp-video", { ...
      rest,
      ariaLabel: ariaLabel,
      autoplay: autoplay,
      controls: controls,
      mediasession: mediasession,
      noaudio: noaudio,
      loop: loop,
      poster: poster,
      artist: artist,
      album: album,
      artwork: artwork,
      title: title,
      layout: "responsive",
      width: width,
      height: height },

    sources.map((props) =>
    Preact.createElement("source", { ...props }))));



};

const Spacer = ({ height }) => {
  return (
    Preact.createElement("div", {
      style: {
        height,
        background: `linear-gradient(to bottom, #bbb, #bbb 10%, #fff 10%, #fff)`,
        backgroundSize: '100% 10px' } }));



};

export const Default = () => {var _Spacer;
  const amount = number('Amount', 1, {}, 'Page');
  const spacerHeight = text('Space', '80vh', 'Page');
  const spaceAbove = boolean('Space above', false, 'Page');
  const spaceBelow = boolean('Space below', false, 'Page');

  const players = [];
  for (let i = 0; i < amount; i++) {
    players.push(Preact.createElement(AmpVideoWithKnobs, { key: i, i: i }));
    if (i < amount - 1) {
      players.push((_Spacer || (_Spacer = Preact.createElement(Spacer, { height: spacerHeight }))));
    }
  }

  return (
    Preact.createElement(Preact.Fragment, null,
    spaceAbove && Preact.createElement(Spacer, { height: spacerHeight }),
    players,
    spaceBelow && Preact.createElement(Spacer, { height: spacerHeight })));


};

export const Actions = () => {
  const id = 'player';
  return (
    Preact.createElement(VideoElementWithActions, { id: id },
    Preact.createElement(AmpVideoWithKnobs, { id: id })));


};

export const InsideAccordion = () => {
  const width = number('width', 320);
  const height = number('height', 180);
  const autoplay = boolean('autoplay', false);

  return (
    Preact.createElement("amp-accordion", { "expand-single-section": true },
    Preact.createElement("section", { expanded: true }, (((_h || (((_h =
    Preact.createElement("h2", null, "Video"))))))),
    Preact.createElement("div", null,
    Preact.createElement("amp-video", {
      autoplay: autoplay,
      controls: true,
      loop: true,
      width: width,
      height: height }, (((((_source || (((((_source =

    Preact.createElement("source", {
      type: "video/mp4",
      src: "https://amp.dev/static/inline-examples/videos/kitten-playing.mp4" }))))))))))))))));






};

export const InsideDetails = () => {
  const width = number('width', 320);
  const height = number('height', 180);
  const autoplay = boolean('autoplay', false);

  return (
    Preact.createElement("details", { open: true }, ((_summary || ((_summary =
    Preact.createElement("summary", null, "Video"))))),
    Preact.createElement("amp-video", {
      autoplay: autoplay,
      controls: true,
      loop: true,
      width: width,
      height: height }, (((_source2 || (((_source2 =

    Preact.createElement("source", {
      type: "video/mp4",
      src: "https://amp.dev/static/inline-examples/videos/kitten-playing.mp4" }))))))))));




};