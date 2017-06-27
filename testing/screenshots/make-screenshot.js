/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
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

/**
 * Usage:
 * ```
 * phantomjs --ssl-protocol=any --ignore-ssl-errors=true --load-images=true \
 *     make-screenshot.js <BASE> <PATH> <RESULT FILE> <DEVICE>
 * ```
 * E.g.
 * ```
 * phantomjs --ssl-protocol=any --ignore-ssl-errors=true --load-images=true \
 *     make-screenshot.js "http://localhost:8000" \
 *     "/examples/everything.amp.html" \
 *     "everything.png" "iPhone6+"
 * ```
 */

/* TODO(dvoytenko): open via gulp
+    "gulp-image-diff": "~0.3.0",
+    "gulp-exec": "???",

+  return exec.task(command)().on('end', function() {
+    return gulp.src([source + '-output.png'])
+        .pipe(imageDiff({
+            referenceImage: source + '-golden.png',
+            logProgress: true
+        }));
+  });
*/

var system = require('system');
var fs = require('fs');

var SCRIPT = system.args[0];
var BASE = system.args[1];
var PATH = system.args[2];
var FILE = system.args[3];
var DEFAULT_DEVICE_ID = 'iPhone6+';
var DEVICE_ID = system.args[4] || DEFAULT_DEVICE_ID;
console./*OK*/log('SCRIPT = ' + SCRIPT);
console./*OK*/log('BASE = ' + BASE);
console./*OK*/log('PATH = ' + PATH);
console./*OK*/log('FILE = ' + FILE);
console./*OK*/log('DEVICE = ' + DEVICE_ID);
if (!BASE || !PATH) {
  console./*OK*/error('Format: make-screenshot <BASE> <PATH> <FILE> <DEVICE>');
  phantom.exit(1);
}
if (!FILE) {
  FILE = 'output.png';
}

var url = BASE + '/' + PATH + '#off=1&development=1';
console./*OK*/log('URL = ' + url);

var DEVICES = {
  'IPHONE6+': {
    name: 'iPhone6+',
    viewportSize: {width: 414, height: 736},
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 8_0 like Mac OS X)' +
        ' AppleWebKit/600.1.3 (KHTML, like Gecko) Version/8.0 Mobile/12A4345d' +
        ' Safari/600.1.4'
  },
  'IPHONE6': {
    name: 'iPhone6',
    viewportSize: {width: 375, height: 627},
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 8_0 like Mac OS X)' +
        ' AppleWebKit/600.1.3 (KHTML, like Gecko) Version/8.0 Mobile/12A4345d' +
        ' Safari/600.1.4'
  },
  'IPHONE5': {
    name: 'iPhone5',
    viewportSize: {width: 320, height: 568},
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 7_0 like Mac OS X; en-us)' +
        ' AppleWebKit/537.51.1 (KHTML, like Gecko) Version/7.0 Mobile/11A465' +
        ' Safari/9537.53'
  },
  'IPAD': {
    name: 'iPad',
    viewportSize: {width: 768, height: 1024},
    userAgent: 'Mozilla/5.0 (iPad; CPU OS 7_0 like Mac OS X)' +
        ' AppleWebKit/537.51.1 (KHTML, like Gecko) Version/7.0 Mobile/11A465' +
        ' Safari/9537.53'
  }
};
var LANDSCAPE_SUFFIX = '-land';

var LANDSCAPE_MODE = false;
if (DEVICE_ID.substr(-LANDSCAPE_SUFFIX.length) == LANDSCAPE_SUFFIX) {
  LANDSCAPE_MODE = true;
  DEVICE_ID = DEVICE_ID.substr(0, DEVICE_ID.length - LANDSCAPE_SUFFIX.length);
}
var DEVICE = DEVICES[DEVICE_ID.toUpperCase()];
if (!DEVICE) {
  var deviceList = [];
  for (var k in DEVICES) {
    deviceList.push(DEVICES[k].name);
  }
  console./*OK*/error('Unknown device: ' + DEVICE_ID +
      '. Use one of: ' + deviceList.join(',') +
      '. Default is ' + DEFAULT_DEVICE_ID);
  phantom.exit(1);
}


var page = require('webpage').create();

// Viewport and User Agent.
page.viewportSize = !LANDSCAPE_MODE ? DEVICE.viewportSize :
    {width: DEVICE.viewportSize.height, height: DEVICE.viewportSize.width};
page.settings.userAgent = DEVICE.userAgent;
console./*OK*/log('VIEWPORT = ' + page.viewportSize.width + 'x' +
    page.viewportSize.height);
console./*OK*/log('USER AGENT = ' + page.settings.userAgent);


// Logging.
var RESOURCE_PREFIX = 'RESOURCE:';

function log(tag, message) {
  console./*OK*/log(tag, message);
}

function logFromPage(channel, message) {
  if (message && message.substring(0, RESOURCE_PREFIX.length) ==
          RESOURCE_PREFIX) {
    log('[RESOURCE ' + channel + ']', message.substring(
        RESOURCE_PREFIX.length));
  } else {
    log('[PAGE ' + channel + ']', message);
  }
}

page.onResourceRequested = function(request) {
};
page.onConsoleMessage = function(message) {
  logFromPage('INFO', message);
};
page.onError = function(message, trace) {
  logFromPage('ERROR', message);
};


// Rendering.
function renderAndExit(exitCode) {
  page.render(FILE);
  phantom.exit(exitCode);
}

page.onCallback = function(data) {
  if (data.event == 'DONE') {
    renderAndExit(0);
  }
};

var self = this;
page.open(url, function() {
  log('Page opened: ' + self.page.url + ': ' + status);

  page.evaluate(function() {

    function log(message) {
      console./*OK*/log('RESOURCE:' + message);
    }

    function removeFromArray(array, item) {
      var index = array.indexOf(item);
      if (index != -1) {
        array.splice(index, 1);
      }
    }

    function prepareResource(resource) {
      // TODO(dvoytenko): do preparations, e.g. replace `src`, `srcset`, etc.
    }

    function layoutAll(resourcesManager) {
      // TODO(dvoytenko): do a repeated calls until no new elements are loaded.
      window.AMP_RESOURCES_QUEUE = resourcesManager.get();
      window.AMP_LOG = log;
      var resources = window.AMP_RESOURCES_QUEUE.slice(0);

      // Sort in document order.
      resources.sort(function(r1, r2) {
        // 8 | 2 = 0x0A
        // 2 - preceeding
        // 8 - contains
        if (r1.element.compareDocumentPosition(r2.element) & 0x0A != 0) {
          return -1;
        }
        return 1;
      });

      log('Resources to be loaded: ' + resources.length);
      var layoutsDone = 0;
      function completeResource(resource, failure) {
        layoutsDone++;
        if (!failure) {
          log('Resource done: ' + layoutsDone + ': ' + resource.debugid);
        } else {
          log('Resource failed: ' + layoutsDone + ': ' + resource.debugid +
              '; reason: ' + failure);
        }
        removeFromArray(window.AMP_RESOURCES_QUEUE, resource);
        if (layoutsDone >= resources.length) {
          log('All resources loaded');
          window.callPhantom({event: 'DONE'});
        }
      }
      resources.forEach(function(resource) {
        log('Resource started: ' + resource.debugid);
        prepareResource(resource);
        // Note: forceAll is no longer available.
        resource.forceAll().then(function() {
          completeResource(resource);
        }, function(reason) {
          completeResource(resource, reason);
        });
      });
    }

    function onDocumentReady(callback) {
      var ready = document.readyState != 'loading';
      if (ready) {
        callback();
      } else {
        var readyListener = function() {
          if (document.readyState != 'loading') {
            if (!ready) {
              ready = true;
              callback();
            }
            document.removeEventListener('readystatechange', readyListener);
          }
        };
        document.addEventListener('readystatechange', readyListener);
      }
    }

    onDocumentReady(function() {
      (window.AMP = window.AMP || []).push(function(AMP) {
        layoutAll(AMP.resources);
      });
    });
  });

  setTimeout(function() {
    console./*OK*/error('TIMEOUT!');
    page.evaluate(function() {
      var resources = window.AMP_RESOURCES_QUEUE;
      var log = window.AMP_LOG;
      if (resources && resources.length > 0) {
        log('Resources still in queue: ' + resources.length + ':');
        resources.forEach(function(resource) {
          log('- ' + resource.debugid);
        });
      }
    });
    renderAndExit(1);
  }, 30000);
});
