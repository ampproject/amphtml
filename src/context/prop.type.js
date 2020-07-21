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

/** @externs */

/**
 * A context property.
 *
 * @interface
 * @template T
 */
function ContextProp() {}

/**
 * A globally unique key. Extensions must use a fully qualified name such
 * as "amp-extension:key" or "amp-extension:version:key".
 *
 * @type {string}
 */
ContextProp.prototype.key;

/**
 * An optional type object that can be used for a using system. E.g.
 * this could be a Preact's Context object.
 *
 * @type {?Object}
 */
ContextProp.prototype.type;

/**
 * An array of dependencies that are required for the `compute` callback.
 *
 * @type {!Array<!ContextProp>}
 */
ContextProp.prototype.deps;

/**
 * Whether the value needs a recursive resolution of the parent value. The
 * following values are allowed:
 * - `false`: the parent value is never needed. It's a non-recursive
 * property, such as `Loaded`.
 * - `true`: the parent value is always needed. It's a recursive property.
 * It could be a simple "find first" recursive property. Or it could be a
 * computable property, such as `score` where all values of the score are
 * compounded.
 * - a function: the parent value may or may not be needed. This function
 * will be called with all of the property inputs. It should return `true`
 * if the parent value is needed for the provided inputs. For instance,
 * a recursive property based on AND (e.g. `renderable`), can immediately
 * determine that the resulting value will be `false` because some inputs
 * are `false` and thus a more resource-sensitive parent resolution is not
 * necessary.
 *
 * @type {boolean|function(!Array<T>):boolean}
 */
ContextProp.prototype.needsParent;

/**
 * Computes the property value. This callback is passed the following
 * arguments:
 * 1. The DOM Node.
 * 2. An array of all inputs set on this DOM node for this property.
 * 3. If it's a recursive property, the parent value.
 * 4. If `deps` are specified - the dep values.
 *
 * @type {function(!Node, !Array<T>, ...*):(T|undefined)}
 */
ContextProp.prototype.compute;

/**
 * The default value of a recursive property.
 *
 * @type {T|undefined}
 */
ContextProp.prototype.defaultValue;
