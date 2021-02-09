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

import * as Preact from '../../../src/preact';
import {Timeout} from '../0.1/timeout';
import {VideoEvents} from '../../../src/video-interface';
import {dict} from '../../../src/utils/object';
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
export function Controls({dismissOnTap, scrollBack, styles, state, handle}) {
  const classes = useStyles();

  const [isPlaying, setIsPlaying] = useState(false);
  const [isActive, setIsActive] = useState(false);

  const hideTimeout = useMemo(
    () =>
      new Timeout(window, () => setIsActive(false), {
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

  const activate = useCallback(() => {
    if (isInTransition) {
      return;
    }

    // Delay by one animation frame to stop mouseover-click sequence mistrigger.
    // See https://jsbin.com/rohesijowi/1/edit?output on Chrome (Blink) on a
    // touch device/device mode.
    requestAnimationFrame(() => {
      setIsActive(true);
      hideAfterTimeout();
    });
  }, [hideAfterTimeout, isInTransition]);

  const isDisplayed = !isInTransition && (isActive || !isPlaying);

  return [
    <ActiveArea
      activate={activate}
      style={styles?.transformToAreaStyle}
      className={objstr({
        [classes.overlay]: true,
        [classes.overlayControlsBg]: isDisplayed,
      })}
    />,
    <ActiveArea
      activate={activate}
      style={styles?.controls}
      className={objstr({
        [classes.controls]: true,
        [classes.controlsShown]: isDisplayed,
      })}
      onMouseUp={() => {
        hideAfterTimeout(TIMEOUT_AFTER_INTERACTION);
      }}
    >
      <div className={classes.controlsGroup}>
        <Button
          {...(isPlaying
            ? dict({
                'aria-label': 'Pause',
                'childClassName': classes.pauseButton,
                'onClick': () => handle?.pause(),
              })
            : dict({
                'aria-label': 'Play',
                'childClassName': classes.playButton,
                'onClick': () => handle?.play(),
              }))}
        />
        <Button
          {...(handle?.volume <= 0
            ? dict({
                'aria-label': 'Unmute',
                'childClassName': classes.unmuteButton,
                'onClick': () => handle?.unmute(),
              })
            : dict({
                'aria-label': 'Mute',
                'childClassName': classes.muteButton,
                'onClick': () => handle?.mute(),
              }))}
        />
        <Button
          aria-label="Fullscreen"
          childClassName={classes.fullscreenButton}
          onClick={() => handle?.requestFullscreen()}
        />
      </div>
      <div
        className={classes.controlsGroup}
        hidden // TODO
      >
        <Button
          aria-label="Scroll back to inline video"
          childClassName={classes.scrollBackButton}
          onClick={scrollBack}
        />
      </div>
      <Button
        className={classes.dismissButtonGroup}
        aria-label="Dismiss"
        onClick={dismissOnTap}
        childClassName={classes.dismissButton}
      />
    </ActiveArea>,
  ];
}

/**
 * @param {*} props
 * @return {!PreactDef.Renderable}
 */
function Button({childClassName, onClick, ...rest}) {
  const classes = useStyles();
  return (
    <div
      className={classes.controlsToggleButton}
      role="button"
      tabindex="0"
      onClick={() => {
        // wrap to dismiss returned result
        onClick();
      }}
      {...rest}
    >
      <div className={childClassName} />
    </div>
  );
}

/**
 * @param {*} props
 * @return {!PreactDef.Renderable}
 */
function ActiveArea({activate, ...rest}) {
  return (
    <div
      onClick={activate}
      onMouseOver={activate}
      // This rule is for DOM elements, not prop objects.
      // eslint-disable-next-line local/no-style-property-setting
      hidden={!rest.style}
      {...rest}
    />
  );
}
