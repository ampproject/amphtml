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
import {Wrapper, useRenderer} from '../../../src/preact/component';
import {useEffect} from '../../../src/preact';
import {useResourcesNotify} from '../../../src/preact/utils';

export const Fetch = ({src, target}) => {
  const [data, setData] = useState({});

  useEffect(() => {
    fetch(src)
      .then((res) => res.json())
      .then((data) => {
        setData(data);
      });
  }, [src]);

  useResourcesNotify();

  return (
    <textarea
      id={target}
      disabled
      style="height:0;width:0;position:absolute;top:-1000px"
    >
      {data}
    </textarea>
  );
};

// const TextArea = ({id, value}) => (
//   <textarea
//     id={id}
//     disabled
//     style="height:0;width:0;position:absolute;top:-1000px"
//   >
//     {value}
//   </textarea>
// );
