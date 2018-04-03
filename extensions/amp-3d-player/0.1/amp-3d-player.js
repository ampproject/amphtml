/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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
import {query, willReceiveNotification} from './3d/ipc';
import makeViewerIframe from './3d/iframe';
import {isLayoutSizeDefined} from '../../../src/layout';

export class Amp3dPlayer extends AMP.BaseElement {

  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {!Element} */
    this.container_ = null;

    /** @private {!Window} */
    this.viewerWindow_ = null;

    /** @private {!Promise} */
    this.willBeReady_ = new Promise(() => {});

    /** @private {!Promise} */
    this.willBeStarted_ = new Promise(() => {});
  }

  /** @override */
  buildCallback() {
    this.container_ = makeViewerIframe(this.element);

    this.viewerWindow_ = this.container_.contentWindow;
    this.willBeReady_ =
        willReceiveNotification(this.viewerWindow_, 'heartbeat', () => true)
            .then(() => query(this.viewerWindow_, 'ready'));
    this.applyFillContent(this.container_, /* replacedContent */ true);
  }

  /** @override */
  layoutCallback() {
    this.willBeStarted_ = this.willBeReady_
        .then(() => {
          const getOption = (name, fmt, dflt) => {
            return this.element.hasAttribute(name)
              ? fmt(this.element.getAttribute(name))
              : dflt;
          };

          const bool = x => x !== 'false';
          const string = x => x;
          const number = x => parseFloat(x);

          return query(this.viewerWindow_, 'setOptions', {
            src: getOption('src', string, ''),
            renderer: {
              alpha: getOption('alpha', bool, false),
              antialias: getOption('antialiasing', bool, true),
            },
            maxPixelRatio:
                getOption('maxPixelRatio', number, devicePixelRatio || 1),
            controls: {
              enableZoom: getOption('enableZoom', bool, true),
              autoRotate: getOption('autoRotate', bool, false),
            },
          });
        });

    return this.willBeStarted_;
  }

  /** @override */
  viewportCallback(inViewport) {
    this.willBeStarted_
        .then(
            () => query(this.viewerWindow_, 'toggleAMPViewport', inViewport)
        );
  }

  /** @override */
  pauseCallback() {
    this.willBeStarted_
        .then(
            () => query(this.viewerWindow_, 'toggleAMPPlay', false)
        );
  }

  /** @override */
  resumeCallback() {
    this.willBeStarted_
        .then(
            () => query(this.viewerWindow_, 'toggleAMPPlay', true)
        );
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }
}

AMP.registerElement('amp-3d-player', Amp3dPlayer);
