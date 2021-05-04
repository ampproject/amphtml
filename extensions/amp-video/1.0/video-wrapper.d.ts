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

import {Renderable} from './preact'

export interface Api  {
  play: () => void | Promise<void>,
  pause: () => void,
  requestFullscreen: () => void | Promise<void>,
  currentTime: number,
  duration: number,
  autoplay: boolean,
  controls: boolean,
  loop: boolean,

  mute: () => void,
  unmute: () => void,
  userInteracted: () => void,
}

export type PlayerComponent = () => string | Renderable;

export type Props = {
  component?: PlayerComponent,
  loading?: string,
  src?: string,
  sources?: ?Renderable,
  autoplay?: boolean,
  controls?: boolean,
  noaudio?: boolean,
  poster?: string,
  mediasession?: boolean,
  title?: string,
  artist?: string,
  album?: string,
  artwork?: string,
  onReadyState?: (string, any?) => void,
}

export type AutoplayProps = {
  metadata?: Object | null,
  displayIcon: boolean,
  playing: boolean,
  displayOverlay: boolean,
  onOverlayClick: (...any) => any,
  wrapperRef: {current: Element},
  play: (...any) => any,
  pause: (...any) => any,
}
