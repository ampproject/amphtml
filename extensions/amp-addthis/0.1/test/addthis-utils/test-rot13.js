import {rot13Array} from '../../addthis-utils/rot13';

describes.sandboxed('rot13', {}, () => {
  it('should properly rotate alphabetical characters', () => {
    const expected = [
      '',
      'nOn',
      'uryyb',
      'nopqrstuvwxyzabcdefghijklm',
      'NOPQRSTUVWXYZABCDEFGHIJKLM',
    ];
    const result = rot13Array([
      '',
      'aBa',
      'hello',
      'abcdefghijklmnopqrstuvwxyz',
      'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    ]);
    Object.keys(result).forEach((key, idx) => {
      expect(key).to.equal(expected[idx]);
    });
  });

  it('should not rotate non-alphabetical characters', () => {
    const expected = ['1337', '1337 ns', '!@#$n0 m'];
    const result = rot13Array(['1337', '1337 af', '!@#$a0 z']);
    Object.keys(result).forEach((key, idx) => {
      expect(key).to.equal(expected[idx]);
    });
  });
});
