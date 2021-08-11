var _AccordionHeader, _AccordionHeader2, _source; /**
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
import {
Accordion,
AccordionContent,
AccordionHeader,
AccordionSection } from "../../../amp-accordion/1.0/component";

import { VideoWrapper } from "../component";
import { boolean, number, object, text, withKnobs } from '@storybook/addon-knobs';

export default {
  title: 'Video Wrapper',
  component: VideoWrapper,
  decorators: [withKnobs] };


const VideoTagPlayer = ({ i }) => {
  const group = `Player ${i + 1}`;

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
    Preact.createElement(VideoWrapper, {
      component: "video",
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
      style: { width, height },
      sources: sources.map((props) =>
      Preact.createElement("source", { ...props })) }));



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
    players.push(Preact.createElement(VideoTagPlayer, { key: i, i: i }));
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

export const InsideAccordion = () => {
  const width = text('width', '320px');
  const height = text('height', '180px');
  return (
    Preact.createElement(Accordion, { expandSingleSection: true },
    Preact.createElement(AccordionSection, { key: 1, expanded: true }, (((_AccordionHeader || (((_AccordionHeader =
    Preact.createElement(AccordionHeader, null,
    Preact.createElement("h2", null, "Controls")))))))),

    Preact.createElement(AccordionContent, null,
    Preact.createElement(VideoWrapper, {
      component: "video",
      controls: true,
      loop: true,
      style: { width, height },
      src: "https://amp.dev/static/inline-examples/videos/kitten-playing.mp4",
      poster: "https://amp.dev/static/inline-examples/images/kitten-playing.png" }))),



    Preact.createElement(AccordionSection, { key: 2 }, (((_AccordionHeader2 || (((_AccordionHeader2 =
    Preact.createElement(AccordionHeader, null,
    Preact.createElement("h2", null, "Autoplay")))))))),

    Preact.createElement(AccordionContent, null,
    Preact.createElement(VideoWrapper, {
      component: "video",
      autoplay: true,
      loop: true,
      style: { width, height },
      src: "https://amp.dev/static/inline-examples/videos/kitten-playing.mp4",
      poster: "https://amp.dev/static/inline-examples/images/kitten-playing.png",
      sources: [(((((_source || (((((_source =
      Preact.createElement("source", {
        type: "video/mp4",
        src: "https://amp.dev/static/inline-examples/videos/kitten-playing.mp4" })))))))))))] })))));







};