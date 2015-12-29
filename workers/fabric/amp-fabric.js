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

import '../../third_party/babel/custom-babel-helpers';
//import {fabric} from '../../third_party/fabric/fabric';

console.log('AMP-FABRIC STARTED!', this, self);
console.log('FABRIC: ', fabric);

function log(var_args) {
  const args = Array.prototype.slice.call(arguments, 0);
  args.unshift('[AMPFabric]');
  console.log.apply(console, args);
}


self['fabric'] = fabric;

var element = self.createDomElement('canvas');
var canvas = new fabric.StaticCanvas(element);
canvas.renderAll = function() {
  return canvas;
};

self['AMP'] = {
  canvas: canvas,
  mount: function() {
    // TODO: Remove. Do this on frame or via events.
    send('mount', canvas.toJSON());
  }
};


var startedResolver;
var started = new Promise(function(resolve) {
  startedResolver = resolve;
});

self.addEventListener('message', function(e) {
  log('WORKER MESSAGE RCVD:', e);
  startedResolver();
  if (e.data.type == 'event') {
    // TODO: dispatch events
  }
}, false);

function send(type, data) {
  started.then(function() {
    self.postMessage({
      type: type,
      data: data
    });
    log('message posted: ', type, data);
  });
}
