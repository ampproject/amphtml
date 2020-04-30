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
import {createKeyedContext, useContext, useRef} from '../../../src/preact';
import {WithAmpContext, AmpContext} from '../../../src/preact/context';
import {openWindowDialog} from '../../../src/dom';
import {useResourcesNotify} from '../../../src/preact/utils';

export const CustomContext = createKeyedContext('amp-bento2:CustomContext', {parent: null});

/**
 * @param {!JsonObject} props
 * @return {PreactDef.Renderable}
 */
export function BentoComponent(props) {
  // useResourcesNotify();
  const {id, renderable = true, playable = true} = props;
  const context = useContext(AmpContext);
  const customContext = useContext(CustomContext);
  const counterRef = useRef(0);
  counterRef.current++;
  console.log('id: ', id, 'render:', counterRef.current);
  console.log('customContext: ', customContext);
  return (
    <WithAmpContext debug={id} renderable={props.renderable} playable={props.playable}>
      <div {...props}
          data-ctx-renderable={`${context.renderable}`}
          data-ctx-playable={`${context.playable}`} >
        <div>
          Render count: {counterRef.current}
        </div>
        <div>
          Props: {JSON.stringify({
            renderable: props.renderable,
            playable: props.playable,
          })}
        </div>
        <div>
          customContext: {JSON.stringify({
            parent: customContext.parent,
          })}
        </div>
        <div>
          AMP Context: {JSON.stringify({
            renderable: context.renderable,
            playable: context.playable,
          })}
        </div>
        <CustomContext.Provider value={{parent: id}}>
          <Test />
          <div>
            {props.children}
          </div>
        </CustomContext.Provider>
      </div>
    </WithAmpContext>
  );
}

function Test() {
  const {parent} = useContext(CustomContext);
  return (
    <div style={{background: 'lightgray'}}>Test: parent={parent}</div>
  );
}
