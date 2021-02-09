/**
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
import * as Preact from '../../../src/preact';
import {fillStretch} from '../../amp-video/1.0/video-wrapper.css';
import {useMemo} from '../../../src/preact';
import {useStyles} from './dock.jss';

export const Placeholder = ({styles}) => {
  const classes = useStyles();
  const boundingClientRect = styles?.boundingClientRect;
  const poster = useMemo(
    () => styles?.element?.querySelector('[poster]')?.getAttribute('poster'),
    [styles?.element]
  );
  return (
    <div
      className={classes.placeholderBackground}
      style={
        boundingClientRect && {
          width: boundingClientRect.width,
          height: boundingClientRect.height,
          top: styles?.offsetTop,
          left: boundingClientRect.left,
        }
      }
    >
      {poster && <img src={poster} style={fillStretch} />}
      <div
        className={classes.placeholderIcon}
        style={styles?.placeholderIcon}
      ></div>
    </div>
  );
};
