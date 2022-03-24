const test = require('ava');
const {exportedForTesting} = require('../utils');

test('getTopologicalSort', (t) => {
  const mockGraph = {
    a: {
      name: 'a',
      dependencies: {
        b: '1.0.0',
        c: '1.0.0',
        'not-in-graph': '1.0.0',
      },
    },
    b: {
      name: 'b',
      dependencies: {
        c: '1.0.0',
      },
    },
    c: {
      name: 'c',
    },
    d: {
      name: 'd',
      dependencies: {
        b: '1.0.0',
      },
    },
  };

  const nodes = exportedForTesting.getTopologicalSort(mockGraph);
  t.deepEqual(
    nodes.map((node) => node.name),
    ['c', 'b', 'a', 'd']
  );
  t.deepEqual(
    nodes.map((node) => node.depth),
    [0, 1, 2, 2]
  );

  const loopyGraph = {
    a: {
      name: 'a',
      dependencies: {
        b: '1.0.0',
        c: '1.0.0',
        'not-in-graph': '1.0.0',
      },
    },
    b: {
      name: 'b',
      dependencies: {
        c: '1.0.0',
      },
    },
    c: {
      name: 'c',
      dependencies: {
        a: '1.0.0',
      },
    },
  };
  t.throws(() => {
    exportedForTesting.getTopologicalSort(loopyGraph);
  });
});
