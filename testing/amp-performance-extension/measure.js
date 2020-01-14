/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
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

function renderMeasurement(container, label, count) {
  const line = document.createElement('div');
  line.classList.add('i-amphtml-performance-line');
  const labelSpan = document.createElement('div');
  labelSpan.classList.add('i-amphtml-performance-label');
  labelSpan.innerText = label;
  const countSpan = document.createElement('div');
  countSpan.classList.add('i-amphtml-performance-count');
  countSpan.innerText = count;
  line.appendChild(labelSpan);
  line.appendChild(countSpan);
  container.appendChild(line);
  return countSpan;
}

function round(num, dec = 4) {
  return Math.round(num * Math.pow(10, dec)) / Math.pow(10, dec);
}

function measureCLS() {
  const supported = PerformanceObserver.supportedEntryTypes;
  if (!supported || supported.indexOf('layout-shift') === -1) {
    return;
  }
  window.cumulativeLayoutShift = 0;
  const layoutShiftObserver = new PerformanceObserver(list =>
    list
      .getEntries()
      .forEach(entry => (window.cumulativeLayoutShift += entry.value))
  );
  layoutShiftObserver.observe({type: 'layout-shift', buffered: true});
}

measureCLS();

document.addEventListener('DOMContentLoaded', function() {
  const result = document.createElement('div');
  result.setAttribute('id', 'i-amphtml-performance-result');

  // Load CLS
  renderMeasurement(
    result,
    'Load CLS',
    round(window.cumulativeLayoutShift * 100)
  );

  // Instantaneous CLS
  const instCLS = renderMeasurement(
    result,
    'Instantaneous CLS',
    window.cumulativeLayoutShift * 100
  );

  // Insert result
  document.body.insertBefore(result, document.body.firstChild);

  // Instaneous measurement updates
  setInterval(() => {
    instCLS.innerText = round(window.cumulativeLayoutShift * 100);
  }, 100);
});
