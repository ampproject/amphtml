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
 import {ContainWrapper} from '#preact/component';
 import {ProxyIframeEmbed} from '../../../src/preact/component/3p-frame';
 import {
   useCallback,
   useEffect,
   useLayoutEffect,
   useMemo,
   useRef,
   useState,
 } from '#preact';
 /**
  * @param {!EmbedlyCardDef.Props} props
  * @return {PreactDef.Renderable}
  */
 export function EmbedlyCard({exampleTagNameProp, ...rest}) {
   // Examples of state and hooks
   // DO NOT SUBMIT: This is example code only.
   const [exampleValue, setExampleValue] = useState(0);
   const exampleRef = useRef(null);
   useCallback(() => {
     /* Do things */
   }, []);
   useEffect(() => {
     /* Do things */
   }, []);
   useLayoutEffect(() => {
     /* Do things */
   }, []);
   useMemo(() => {
     /* Do things */
   }, []);
 
   return (
     <ProxyIframeEmbed
       options={{url:'https://www.youtube.com/watch?v=lBTCB7yLs8Y'}}
       title={'Embedly card'}
       type="embedly"
       {...rest}
     />
   );
 }
 
 // import * as Preact from '#preact';
 // import {
 //   useCallback,
 //   useEffect,
 //   useLayoutEffect,
 //   useMemo,
 //   useRef,
 //   useState,
 // } from '#preact';
 // import {TAG as KEY_TAG} from './amp-embedly-key';
 // //import {ProxyIframeEmbed} from '#preact/component/3p-frame';
 // import {forwardRef} from '#preact/compat';
 
 // // /**
 // //  * Attribute name used to set api key with name
 // //  * expected by embedly.
 // //  * @const {string}
 // //  */
 // // const API_KEY_ATTR_NAME = 'data-card-key';
 
 // /**
 //  * @param {!EmbedlyCardDef.Props} props
 //  * @return {PreactDef.Renderable}
 //  */
 // export function EmbedlyCard({title, url, ...rest}) {
 //   // Check for valid props
 //   if (!checkProps(url)) {
 //     return null;
 //   }
 
 //   // // Prepare options for ProxyIframeEmbed
 //   // const iframeOptions = {
 //   //   url,
 //   // };
 
 //   // Extract Embedly Key
 //   //const ampEmbedlyKeyElement = document.querySelector(KEY_TAG);
 //   //const apiKey = ampEmbedlyKeyElement.getAttribute('value');
 
 //   // Add embedly key
 //   // if (apiKey) {
 //   //   iframeOptions[API_KEY_ATTR_NAME] = apiKey;
 //   // }
 
 //   // <ProxyIframeEmbed
 //   //     options={iframeOptions}
 //   //     ref={ref}
 //   //     title={title || 'Embedly card'}
 //   //     type="embedly"
 //   //     {...rest}
 //   //   />
 //   return (
 //     <h1>Hello</h1>
 //   );
 // }
 
 // // const EmbedlyCard = forwardRef(EmbedlyCardWithRef);
 // // EmbedlyCard.displayName = 'EmbedlyCard'; // Make findable for tests.
 // // export {EmbedlyCard};
 
 // /**
 //  * Verify required props and throw error if necessary.
 //  * @param {string|undefined} url URL to check
 //  * @return {boolean} true on valid
 //  */
 // function checkProps(url) {
 //   // Perform manual checking as assertion is not available for Bento: Issue #32739
 //   if (url === undefined) {
 //     displayWarning('data-url is required for <amp-embedly-card>');
 //     return false;
 //   }
 //   return true;
 // }
 
 // /**
 //  * Display warning in browser console
 //  * @param {?string} message Warning to be displayed
 //  */
 // function displayWarning(message) {
 //   console /*OK*/
 //     .warn(message);
 // }
 