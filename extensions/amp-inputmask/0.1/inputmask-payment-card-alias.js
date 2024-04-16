/**
 * Installs an alias used to mask credit cards and enable digit chunking.
 * https://github.com/RobinHerbots/Inputmask/issues/525
 * @param {!Object} Inputmask
 */
export function factory(Inputmask) {
  // TODO(cvializ): Improve card chunking support
  // https://baymard.com/checkout-usability/credit-card-patterns
  Inputmask.extendAliases({
    'payment-card': {
      'postValidation': (buffer) => /[\s\d]+/.test(buffer.join('')),
      /**
       * @param {!JsonObject} opts
       * @return {*} TODO(#23582): Specify return type
       */
      'mask': function (opts) {
        opts['definitions'] = {
          'x': {
            'validator': function (chrs, buffer) {
              const val = buffer.buffer.join('') + chrs;
              const valExp2 = new RegExp('\\d\\d');
              const regextest = valExp2.test(val);
              return regextest && val != '34' && val != '37';
            },
            'cardinality': 2,
          },
          'y': {
            'validator': function (chrs, buffer) {
              const val = buffer.buffer.join('') + chrs;
              const valExp2 = /3(4|7)/;
              const regextest = valExp2.test(val);
              return regextest;
            },
            'cardinality': 2,
          },
        };
        return [
          'y99 999999 99999',
          'x99 9999 9999 9999',
          '9999 999999 99999',
          '9999 9999 9999 9999',
        ];
      },
    },
  });
}
