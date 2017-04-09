/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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

export const ca = function(number, index) {
  return [
    ['fa un moment', 'd\'aquí un moment'],
    ['fa %s segons', 'd\'aquí %s segons'],
    ['fa 1 minut', 'd\'aquí 1 minut'],
    ['fa %s minuts', 'd\'aquí %s minuts'],
    ['fa 1 hora', 'd\'aquí 1 hora'],
    ['fa %s hores', 'd\'aquí %s hores'],
    ['fa 1 dia', 'd\'aquí 1 dia'],
    ['fa %s dies', 'd\'aquí %s dies'],
    ['fa 1 setmana', 'd\'aquí 1 setmana'],
    ['fa %s setmanes', 'd\'aquí %s setmanes'],
    ['fa 1 mes', 'd\'aquí 1 mes'],
    ['fa %s mesos', 'd\'aquí %s mesos'],
    ['fa 1 any', 'd\'aquí 1 any'],
    ['fa %s anys', 'd\'aquí %s anys'],
  ][index];
};
