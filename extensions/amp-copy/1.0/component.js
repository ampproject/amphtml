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

import * as Preact from '#preact';
import {
  useCallback,
  useMemo,
  useState,
} from '#preact';
import {
  copyTextToClipboard,
  isCopyingToClipboardSupported,
} from '../../../src/clipboard';
import {useStyles} from './component.jss';

/**
 * @param {!CopyDef.Props} props
 * @return {PreactDef.Renderable}
 */
export function Copy({children, sourceId, text, ...rest}) {
  const [status, setStaus] = useState(null);
  let theme = useMemo(()=>{
    if(status!=null){
      if(status==true){
        return useStyles().success;  
      }else{
        return useStyles().failed;
      }
    }
    if(isCopyingToClipboardSupported(document)){
      return useStyles().enabled;
    } else {
      return useStyles().disabled;
    }
  }, [status]);

  const copy = useCallback((sourceId)=> {
    const content = document.getElementById(sourceId);
    let text;
    if(content.value != undefined){
      text = content.value.trim();
    } else {
      text = content.textContent.trim();
    }
    if (copyTextToClipboard(window, text)) {
      setStaus(true);
    } else {
      setStaus(false);
    }
  },[sourceId]);

  return (
    <button className={theme} layout size paint {...rest} onClick={(e) => copy(sourceId)}>
      {children}
    </button>
  );
}
