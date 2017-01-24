// TODO(dvoytenko): Remove once Closure adds this extern.
// See: https://github.com/google/closure-compiler/issues/2018
// See: https://dom.spec.whatwg.org/#dom-node-getrootnode

/*
 * Copyright 2016 The Closure Compiler Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @see https://dom.spec.whatwg.org/#dictdef-getrootnodeoptions
 * @typedef {{
 *   composed: boolean
 * }}
 */
var GetRootNodeOptions;

/**
 * @see https://dom.spec.whatwg.org/#dom-node-getrootnode
 * @param {GetRootNodeOptions=} opt_options
 * @return {?Node}
 */
Node.prototype.getRootNode = function(opt_options) {};

/**
 * @see https://www.w3.org/TR/shadow-dom/#idl-def-ShadowRootInit
 * @typedef {{
 *   mode: string
 * }}
 */
var ShadowRootInit;

/**
 * @see https://www.w3.org/TR/shadow-dom/#h-extensions-to-element-interface
 * @param {ShadowRootInit=} opt_init
 * @return {!ShadowRoot}
 */
Element.prototype.attachShadow = function(opt_init) {};
