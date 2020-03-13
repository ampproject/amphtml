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
import { PostHTML } from 'posthtml';
export interface ScriptNode extends PostHTML.Node {
    tag: 'script';
    attrs: {
        [key: string]: string | undefined;
        src: string;
    };
}
/**
 * Determines if a Node is really a ScriptNode.
 * @param node
 */
export declare function isValidScript(node: PostHTML.Node): node is ScriptNode;
