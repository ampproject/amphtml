let cumulativeLayoutShift, largestContentfulPaint, longTasks;
let measureStarted; // eslint-disable-line @typescript-eslint/no-unused-vars

function renderMeasurement(container, label, count) {
  container./*OK*/ innerHTML += `<div class='i-amphtml-performance-line'>
    <div class="i-amphtml-performance-label">${label}</div>
    <div class="i-amphtml-performance-count">${count.toFixed(4)}</div>
  </div>`;
  return container.lastElementChild.lastElementChild;
}

function addStyleString(root, str) {
  const node = document.createElement('style');
  node./*OK*/ textContent = str;
  root.appendChild(node);
}

function measureCLS() {
  const supported = PerformanceObserver.supportedEntryTypes;
  if (!supported || supported.indexOf('layout-shift') === -1) {
    return;
  }
  cumulativeLayoutShift = 0;
  const layoutShiftObserver = new PerformanceObserver((list) =>
    list
      .getEntries()
      .filter((entry) => !entry.hadRecentInput)
      .forEach((entry) => (cumulativeLayoutShift += entry.value))
  );
  layoutShiftObserver.observe({type: 'layout-shift', buffered: true});
}

function measureLargestContentfulPaint() {
  const supported = PerformanceObserver.supportedEntryTypes;
  if (!supported || supported.indexOf('largest-contentful-paint') === -1) {
    return;
  }
  largestContentfulPaint = 0;
  const largestContentfulPaintObserver = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    const entry = entries[entries.length - 1];
    largestContentfulPaint = entry.renderTime || entry.loadTime;
  });
  largestContentfulPaintObserver.observe({
    type: 'largest-contentful-paint',
    buffered: true,
  });
}

function measureLongTasks() {
  const supported = PerformanceObserver.supportedEntryTypes;
  if (!supported || supported.indexOf('longtask') === -1) {
    return;
  }
  longTasks = [];
  const longTaskObserver = new PerformanceObserver((list) =>
    list.getEntries().forEach((entry) => longTasks.push(entry))
  );
  longTaskObserver.observe({entryTypes: ['longtask']});
}

function measureTimeToInteractive() {
  measureStarted = Date.now();
}

function getMaxFirstInputDelay(firstContentfulPaint) {
  let longest = 0;

  longTasks.forEach((longTask) => {
    if (
      longTask.startTime > firstContentfulPaint &&
      longTask.duration > longest
    ) {
      longest = longTask.duration;
    }
  });

  return longest;
}

function getMetric(name) {
  const entries = performance.getEntries();
  const entry = entries.find((entry) => entry.name === name);
  return entry ? entry.startTime : 0;
}

// function getTimeToInteractive() {
//   return Date.now() - measureStarted;
// }

measureLongTasks();
measureCLS();
measureTimeToInteractive();
measureLargestContentfulPaint();

document.addEventListener('DOMContentLoaded', function () {
  // Create a container for the metrics that is CSS-isolated from the host page
  const resultContainer = document.createElement('div');
  const shadow = resultContainer.attachShadow({mode: 'open'});
  const result = document.createElement('div');
  result.setAttribute('id', 'i-amphtml-performance-result');
  shadow.appendChild(result);
  addStyleString(
    result,
    `
        #i-amphtml-performance-result {
            position: fixed;
            top: 10px;
            left: 10px;
            background-color: #000000aa;
            padding: 10px;
            color: white;
            z-index: 99999;
            pointer-events: none;
            width: 200px;
            overflow: hidden;
        }

        .i-amphtml-performance-line {
            display: flex;
            flex-direction: row;
            flex-wrap: nowrap;
            justify-content: space-between;
            font-size: 12px;
        }

        .i-amphtml-performance-count {
            margin-left: 8px;
            font-weight: bold;
        }
  `
  );

  // TODO(wassgha): Implement an expanded view where these metrics are shown

  // Visible
  // const visible = getMetric('visible');
  // const vis = renderMeasurement(result, 'visible', visible);

  // First paint
  // const firstPaint = getMetric('first-paint');
  // const fp = renderMeasurement(result, 'firstPaint', firstPaint);

  // First contentful paint
  const firstContentfulPaint = getMetric('first-contentful-paint');
  // const fcp = renderMeasurement(
  //   result,
  //   'firstContentfulPaint',
  //   firstContentfulPaint
  // );

  // Time to interactive
  // renderMeasurement(result, 'timeToInteractive', getTimeToInteractive());

  // Largest contentful paint
  const lcp = renderMeasurement(
    result,
    'largestContentfulPaint',
    largestContentfulPaint
  );

  // Max first input delay
  const mfid = renderMeasurement(
    result,
    'maxFirstInputDelay',
    getMaxFirstInputDelay(firstContentfulPaint)
  );

  // Load CLS
  renderMeasurement(result, 'loadCLS', cumulativeLayoutShift * 100);

  // Instantaneous CLS
  const instCLS = renderMeasurement(
    result,
    'instantaneousCLS',
    cumulativeLayoutShift * 100
  );

  // Insert result
  document.body.insertBefore(resultContainer, document.body.firstChild);

  // Instaneous measurement updates
  setInterval(() => {
    instCLS./*OK*/ innerText = (cumulativeLayoutShift * 100).toFixed(4);
    // vis.innerText = getMetric('visible').toFixed(4);
    // fp.innerText = getMetric('first-paint').toFixed(4);
    // fcp.innerText = getMetric('first-contentful-paint').toFixed(4);
    lcp./*OK*/ innerText = largestContentfulPaint.toFixed(4);
    mfid./*OK*/ innerText = getMaxFirstInputDelay(
      getMetric('first-contentful-paint')
    ).toFixed(4);
  }, 250);
});
