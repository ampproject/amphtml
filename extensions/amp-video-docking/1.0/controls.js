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

import * as Preact from '../../../src/preact';
import {Timeout} from '../0.1/timeout';
import {VideoEvents} from '../../../src/video-interface';
import {listen} from '../../../src/event-helper';
import {useCallback, useEffect, useMemo, useState} from '../../../src/preact';
import {useStyles} from './dock.jss';
import objstr from './obj-str';

/**
 * A single controls set can be displayed at a time on the controls layer.
 *
 * These map to their displayable classname portion in the format
 * `amp-video-docked-control-set-${NAME}`
 * e.g. `PLAYBACK: 'playback'` gets `amp-video-docked-control-set-playback`
 * @enum {string}
 */
const ControlSet = {
  // Playback buttons like play/pause, mute and fullscreen.
  PLAYBACK: 'playback',

  // Single button to scroll back to inline position of the component. Displayed
  // during ad playback for CTA interaction.
  SCROLL_BACK: 'scroll-back',
};

/** @private @const {!Array<!./breakpoints.SyntheticBreakpointDef>} */
const BREAKPOINTS = [
  {
    className: 'amp-small',
    minWidth: 0,
  },
  {
    className: 'amp-large',
    minWidth: 300,
  },
];

const TIMEOUT = 1200;
const TIMEOUT_AFTER_INTERACTION = 800;

/**
 * @param {*} styles
 * @return {!PreactDef.Renderable}
 */
export function Controls({styles, state, handle}) {
  const classes = useStyles();

  const [isPlaying, setIsPlaying] = useState(false);
  const [isShown, setIsShown] = useState(false);

  const hideTimeout = useMemo(
    () =>
      new Timeout(window, () => setIsShown(false), {
        setTimeout: setTimeout.bind(window),
        clearTimeout: clearTimeout.bind(window),
      }),
    []
  );

  const hideAfterTimeout = useCallback(
    (after = TIMEOUT) => hideTimeout.trigger(after),
    [hideTimeout]
  );

  useEffect(() => {
    if (!handle) {
      return;
    }
    setIsPlaying(!handle?.paused);
    const unlisteners = [
      listen(handle, VideoEvents.PLAYING, () => {
        setIsPlaying(true);
      }),
      listen(handle, VideoEvents.PAUSE, () => {
        setIsPlaying(false);
      }),
    ];
    return () => {
      unlisteners.forEach((unlisten) => unlisten());
    };
  }, [handle]);

  // Do not show controls during transition steps, which would make them
  // appear intermittently.
  const isInTransition = state?.isInTransition;

  const show = useCallback(() => {
    if (isInTransition) {
      return;
    }

    // Delay by one animation frame to stop mouseover-click sequence mistrigger.
    // See https://jsbin.com/rohesijowi/1/edit?output on Chrome (Blink) on a
    // touch device/device mode.
    requestAnimationFrame(() => {
      setIsShown(true);
      hideAfterTimeout();
    });
  }, [hideAfterTimeout, isInTransition]);

  return (
    <>
      <div
        className={objstr({
          [classes.overlay]: true,
          [classes.overlayControlsBg]: !isInTransition && isShown,
        })}
        style={styles?.transformToAreaStyle}
        onClick={show}
        onMouseOver={show}
        onMouseUp={() => {
          hideAfterTimeout(TIMEOUT_AFTER_INTERACTION);
        }}
        hidden={!styles}
      ></div>
      <div
        className={objstr({
          'amp-video-docked-controls': true,
          [classes.controls]: true,
          [classes.controlsShown]: !isInTransition && isShown,
        })}
        style={styles?.controls}
        hidden={!styles}
      >
        <div
          className={`amp-video-docked-control-set-playback ${classes.controlsGroup}`}
        >
          <div className={classes.controlsToggleButton}>
            <div
              role="button"
              className={classes.playButton}
              hidden={isPlaying}
              onClick={() => {
                handle?.play();
              }}
            ></div>
            <div
              role="button"
              className={classes.pauseButton}
              hidden={!isPlaying}
              onClick={() => {
                handle?.pause();
              }}
            ></div>
          </div>
          <div className={classes.controlsToggleButton}>
            <div
              role="button"
              className={classes.muteButton}
              hidden={handle?.volume <= 0}
              onClick={() => {
                // This doesn't work since handle is a <video>.
                handle?.mute();
              }}
            ></div>
            <div
              role="button"
              className={classes.unmuteButton}
              hidden={handle?.volume > 0}
              onClick={() => {
                // This doesn't work since handle is a <video>.
                handle?.unmute();
              }}
            ></div>
          </div>
          <div className={classes.controlsToggleButton}>
            <div role="button" className={classes.fullscreenButton}></div>
          </div>
        </div>
        <div
          className={`amp-video-docked-control-set-scroll-back ${classes.controlsGroup}`}
          hidden
        >
          <div className={classes.controlsToggleButton}>
            <div role="button" className={classes.scrollBackButton}></div>
          </div>
        </div>
        <div className="amp-video-docked-button-dismiss-group">
          <div role="button" className="amp-video-docked-dismiss"></div>
        </div>
      </div>
    </>
  );
}
