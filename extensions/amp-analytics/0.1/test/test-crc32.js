import {crc32} from '../crc32';

const testVectors = [
  {
    input: '',
    output: 0,
  },
  {
    input: 'The quick brown fox jumps over the lazy dog',
    output: 1095738169,
  },
  {
    input: 'The quick brown fox jumps over the lazy dog.',
    output: 1368401385,
  },
  {
    input: 'hello',
    output: 907060870,
  },
  {
    input: 'world',
    output: 980881731,
  },
  {
    input: 'helloworld',
    output: 4192936109,
  },
  {
    input: '12345',
    output: 3421846044,
  },
  {
    input: '漢字',
    output: 2573319087,
  },
  {
    input: '    spaces',
    output: 1946449684,
  },
  {
    input: '-_~c@@l~_-',
    output: 4153342273,
  },
];

describes.sandboxed('CRC32 Implementation', {}, () => {
  testVectors.forEach((test, i) => {
    it(`test #${i}: "${test.input}"`, () => {
      expect(crc32(test.input)).to.equal(test.output);
    });
  });
});
