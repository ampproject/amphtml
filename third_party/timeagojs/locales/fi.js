/**
 * Copyright (c) 2016 hustcc
 * License: MIT
 * Version: v3.0.0
 * https://github.com/hustcc/timeago.js
 */

export const fi = function(number, index) {
  return [
    ['juuri äsken', 'juuri nyt'],
    ['%s sekuntia sitten', '%s sekunnin päästä'],
    ['minuutti sitten', 'minuutin päästä'],
    ['%s minuuttia sitten', '%s minuutin päästä'],
    ['tunti sitten', 'tunnin päästä'],
    ['%s tuntia sitten', '%s tunnin päästä'],
    ['päivä sitten', 'päivän päästä'],
    ['%s päivää sitten', '%s päivän päästä'],
    ['viikko sitten', 'viikon päästä'],
    ['%s viikkoa sitten', '%s viikon päästä'],
    ['kuukausi sitten', 'kuukauden päästä'],
    ['%s kuukautta sitten', '%s kuukauden päästä'],
    ['vuosi sitten', 'vuoden päästä'],
    ['%s vuotta sitten', '%s vuoden päästä'],
  ][index];
};
