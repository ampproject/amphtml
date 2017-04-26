/**
 * Copyright (c) 2016 hustcc
 * License: MIT
 * Version: v3.0.0
 * https://github.com/hustcc/timeago.js
 */

export const it = function(number, index) {
  return [
    ['poco fa', 'tra poco'],
    ['%s secondi fa', '%s secondi da ora'],
    ['un minuto fa', 'un minuto da ora'],
    ['%s minuti fa', '%s minuti da ora'],
    ['un\'ora fa', 'un\'ora da ora'],
    ['%s ore fa', '%s ore da ora'],
    ['un giorno fa', 'un giorno da ora'],
    ['%s giorni fa', '%s giorni da ora'],
    ['una settimana fa', 'una settimana da ora'],
    ['%s settimane fa', '%s settimane da ora'],
    ['un mese fa', 'un mese da ora'],
    ['%s mesi fa', '%s mesi da ora'],
    ['un anno fa', 'un anno da ora'],
    ['%s anni fa', '%s anni da ora'],
  ][index];
};
