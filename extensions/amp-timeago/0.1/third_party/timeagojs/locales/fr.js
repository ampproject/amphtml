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

export const fr = function(number, index) {
  return [
    ['à l\'instant', 'dans un instant'],
    ['il y a %s secondes', 'dans %s secondes'],
    ['il y a 1 minute', 'dans 1 minute'],
    ['il y a %s minutes', 'dans %s minutes'],
    ['il y a 1 heure', 'dans 1 heure'],
    ['il y a %s heures', 'dans %s heures'],
    ['il y a 1 jour', 'dans 1 jour'],
    ['il y a %s jours', 'dans %s jours'],
    ['il y a 1 semaine', 'dans 1 semaine'],
    ['il y a %s semaines', 'dans %s semaines'],
    ['il y a 1 mois', 'dans 1 mois'],
    ['il y a %s mois', 'dans %s mois'],
    ['il y a 1 an', 'dans 1 an'],
    ['il y a %s ans', 'dans %s ans'],
  ][index];
};
