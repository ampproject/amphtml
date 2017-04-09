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

export const ptBR = function(number, index) {
  return [
    ['agora mesmo', 'daqui um pouco'],
    ['há %s segundos', 'em %s segundos'],
    ['há um minuto', 'em um minuto'],
    ['há %s minutos', 'em %s minutos'],
    ['há uma hora', 'em uma hora'],
    ['há %s horas', 'em %s horas'],
    ['há um dia', 'em um dia'],
    ['há %s dias', 'em %s dias'],
    ['há uma semana', 'em uma semana'],
    ['há %s semanas', 'em %s semanas'],
    ['há um mês', 'em um mês'],
    ['há %s meses', 'em %s meses'],
    ['há um ano', 'em um ano'],
    ['há %s anos', 'em %s anos'],
  ][index];
};
