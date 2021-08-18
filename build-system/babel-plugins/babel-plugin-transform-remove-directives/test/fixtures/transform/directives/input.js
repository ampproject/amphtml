function without() {}

'use strict';

function named() {
  'use strict';
}

try {
  (function () {
    'use strict';
  })();
} catch (e) {}