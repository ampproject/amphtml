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

let none = `/rtv/100/log-messages.simple.json`;
let start = `${'123'}/foo`;
let middle = `/rtv/${'012003312116250'}/log-messages.simple.json`;
let end = `rtv/${'123'}`;
let number = `${123}/foo`;
let boolean = `${true}/foo`;
let preventEscaping = `\n`;

let xss = `\u1234\n${'`;\nalert("XSS")`;\n'}${foo}`;