module.exports = function(number, index) {
  return [
    ['recent', 'binnenkort'],
    ['%s seconden geleden', 'binnen %s seconden'],
    ['1 minuut geleden', 'binnen 1 minuut'],
    ['%s minuten geleden', 'binnen %s minuten'],
    ['1 uur geleden', 'binnen 1 uur'],
    ['%s uren geleden', 'binnen %s uren'],
    ['1 dag geleden', 'binnen 1 dag'],
    ['%s dagen geleden', 'binnen %s dagen'],
    ['1 week geleden', 'binnen 1 week'],
    ['%s weken geleden', 'binnen %s weken'],
    ['1 maand geleden', 'binnen 1 maand'],
    ['%s maanden geleden', 'binnen %s maanden'],
    ['1 jaar geleden', 'binnen 1 jaar'],
    ['%s jaren geleden', 'binnen %s jaren']
  ][index];
}
