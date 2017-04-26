/**
 * Copyright (c) 2016 hustcc
 * License: MIT
 * Version: v3.0.0
 * https://github.com/hustcc/timeago.js
 */

export const eu = function(number, index) {
  return [
    ['orain', 'denbora bat barru'],
    ['duela %s segundu', '%s segundu barru'],
    ['duela minutu 1', 'minutu 1 barru'],
    ['duela %s minutu', '%s minutu barru'],
    ['duela ordu 1', 'ordu 1 barru'],
    ['duela %s ordu', '%s ordu barru'],
    ['duela egun 1', 'egun 1 barru'],
    ['duela %s egun', '%s egun barru'],
    ['duela aste 1', 'aste 1 barru'],
    ['duela %s aste', '%s aste barru'],
    ['duela hillabete 1', 'hillabete 1 barru'],
    ['duela %s hillabete', '%s hillabete barru'],
    ['duela urte 1', 'urte 1 barru'],
    ['duela %s urte', '%s urte barru'],
  ][index];
};
