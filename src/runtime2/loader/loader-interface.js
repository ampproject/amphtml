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

import {contextProp, setProp, useDisposableMemo} from '../../context';

/** @type {!ContextProp<LoaderInterface>} */
// eslint-disable-next-line local/no-export-side-effect
export const LoaderProp = contextProp('Loader', {recursive: true});

/**
 * @interface
 * @extends {Disposable}
 */
export class LoaderInterface {
  /**
   * @param {!Element} element
   */
  scheduleLoad(element) {}
}

/**
 * @param {!Node} node
 * @param {typeof Loader} constr
 */
export function LoaderSetter(node, constr) {
  useDisposableMemo(() => {
    // console.log('ThresholdLoaderSetter: new Loader: ', constr);
    const loader = new constr(node);
    setProp(node, LoaderProp, LoaderSetter, loader);
    return {value: loader, dispose: loader.dispose.bind(loader)};
  }, [constr]);
}
