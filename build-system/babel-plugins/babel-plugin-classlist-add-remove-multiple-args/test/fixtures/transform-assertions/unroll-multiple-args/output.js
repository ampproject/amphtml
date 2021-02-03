/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
classList.add('something');
classList.add(a);
classList.add(b);
classList.remove(a);
classList.remove(b);
classList.remove(c);
classList.remove(d);
a.classList.remove(a);
a.classList.remove(b);
a.b.classList.add(x);
a.b.classList.add(y);
c.d.f.classList.add(x);
c.d.f.classList.add(y);
c.d.f.classList.add('one-two-three');
// should leave all of the following intact
leave.this.alone(x, y, z);
leave.this.alone.add(a, b);
leave.this.alone.remove(1, 2, 3);
classList(a, b, c);
classList.notAddOrRemove(a, b, c);
add(1, 2, 3);
remove(1, 2, 3);
