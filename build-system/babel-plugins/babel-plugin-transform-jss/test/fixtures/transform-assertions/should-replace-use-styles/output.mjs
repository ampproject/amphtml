import { $single as _$single } from "../foo.jss";
import { $two as _$two } from "../foo.jss";
import { $one as _$one } from "../foo.jss";
import { $x as _$x2 } from "../foo.jss";
import { $foo as _$foo } from "./something.jss";
import { $x as _$x } from "../foo.jss";
import { $b as _$b } from "../foo.jss";

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
import { useStyles } from '../foo.jss';
import { useStyles as useSomeOtherNameWithStyles } from './something.jss';
console.log(_$b);
console.log(_$x);

function x() {
  return _$foo;
}

_$x2;
const {
  one: _unused,
  two: _unused2,
  ...rest
} = useStyles();
const twoRenamed = _$two;
const one = _$one;
let single = _$single;
