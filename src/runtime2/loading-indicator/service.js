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

import {
  CanPlay,
  LoadPendingState,
  LoadedState,
  LoadingStrategy,
  LoadingStrategyProp,
  observeInput,
  useDisposableMemo,
  useMountComponent,
  useRef,
  useUnmountComponent,
  withMetaData,
} from '../../context';
import {createLoaderElement} from '../../loader';
import {devAssert} from '../../log';
import {htmlFor} from '../../static-template';
import {isInternalElement, isLoadingAllowed} from '../../layout';

/**
 * @param {!Node} root
 * @return {!Function}
 */
export function LoadingIndicatorService(root) {
  // console.log('LoadingIndicatorService: init');

  const mountComponent = useMountComponent();
  const unmountComponent = useUnmountComponent();

  const io = new IntersectionObserver((records) => {
    records.forEach((intersection) => {
      const {target} = intersection;
      mountComponent(LoadingIndicator, intersection, target);
    });
  });

  const LoadPendingTracker = withMetaData(
    [CanPlay, LoadingStrategyProp, LoadPendingState, LoadedState],
    (node, _, canPlay, loadingStrategy, loadPending, loaded) => {
      // console.log('LoadingIndicatorService: LoadPendingTracker: ',
      //   node.nodeName + '#' + node.id,
      //   canPlay, loadingStrategy, loadPending, loaded);
      const indicatorsEnabled =
        loadingStrategy == LoadingStrategy.AUTO ||
        loadingStrategy == LoadingStrategy.LAZY ||
        loadingStrategy == LoadingStrategy.EAGER;
      if (indicatorsEnabled && canPlay && loadPending && !loaded) {
        io.observe(node);
        return () => {
          io.unobserve(node);
          unmountComponent(LoadingIndicator, node);
        };
      }
    }
  );
  LoadPendingTracker.displayName = 'LoadPendingTracker';

  const cleanupInputObserver = observeInput(
    root,
    LoadPendingState,
    true,
    (nodes) => {
      nodes.forEach((node) => {
        // console.log('LoadingIndicatorService: found node: ',
        //   node.nodeName + '#' + node.id,
        //   isLoadingEnabledOnElement(node));
        if (isLoadingEnabledOnElement(node)) {
          mountComponent(LoadPendingTracker, null, node);
        }
      });
    }
  );

  return () => {
    cleanupInputObserver();
    io.disconnect();
  };
}

/**
 * @param {!Node} node
 * @param {!IntersectionObserverEntry} intersection
 */
function LoadingIndicator(node, intersection) {
  // console.log('LoadingIndicator: ', node.nodeName + '#' + node.id, intersection);

  const {
    isIntersecting,
    boundingClientRect: {width, height},
  } = intersection;

  const startTimeRef = useRef(Date.now());
  const sizeRef = useRef({width, height});

  const loadingElement = useDisposableMemo(() => {
    const startTime = startTimeRef.current;
    const {width, height} = sizeRef.current;

    const doc = devAssert(node.ownerDocument);
    const container = htmlFor(doc)`
        <div class="i-amphtml-loading-container i-amphtml-fill-content
          amp-hidden"></div>`;

    const loadingElement = createLoaderElement(
      node.getAmpDoc(),
      node,
      width,
      height,
      startTime
    );
    container.appendChild(loadingElement);
    node.appendChild(container);

    const dispose = () => {
      node.removeChild(container);
    };

    return {value: loadingElement, dispose};
  });

  const loadingContainer = loadingElement.parentElement;
  loadingContainer.classList.toggle('amp-hidden', !isIntersecting);
  loadingElement.classList.toggle('amp-active', isIntersecting);
}

/**
 * @param {!Element} element
 * @return {boolean}
 */
function isLoadingEnabledOnElement(element) {
  return (
    isLoadingAllowed(element) &&
    !element.hasAttribute('noloading') &&
    !isInternalOrServiceNode(element)
  );
}

/**
 * Returns "true" for internal AMP nodes or for placeholder elements.
 * @param {!Node} node
 * @return {boolean}
 */
function isInternalOrServiceNode(node) {
  if (isInternalElement(node)) {
    return true;
  }
  if (
    node.tagName &&
    (node.hasAttribute('placeholder') ||
      node.hasAttribute('fallback') ||
      node.hasAttribute('overflow'))
  ) {
    return true;
  }
  return false;
}
