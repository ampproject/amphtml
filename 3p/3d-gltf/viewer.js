/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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

/*global THREE*/
import AnimationLoop from './AnimationLoop';

const isWebGLSupported = () => {
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl')
      || canvas.getContext('experimental-webgl');
  return gl && gl instanceof WebGLRenderingContext;
};

const resolveURL = (url, path) => {
  // Invalid URL
  if (typeof url !== 'string' || url === '') {return '';}
  // Absolute URL http://,https://,//
  if (/^(https?:)?\/\//i.test(url)) {return url;}
  // Data URI
  if (/^data:.*,.*$/i.test(url)) {return url;}
  // Blob URL
  if (/^blob:.*$/i.test(url)) {return url;}
  // Relative URL
  return path + url;
};

/**
 * @param {JsonObject} options
 * @param {{onerror: Function, onprogress: Function, onload: Function}} handlers
 * @returns {*}
 */
export default function makeViewer(options, handlers) {
  const makeLight = () => {
    const amb = new THREE.AmbientLight();
    const dir1 = new THREE.DirectionalLight();
    dir1.position.set(1, 2, 3);
    const dir2 = new THREE.DirectionalLight();
    dir2.position.set(1, -2, -2);

    const light = new THREE.Group();
    light.add(amb, dir1, dir2);

    return light;
  };

  const center = new THREE.Vector3();
  const size = new THREE.Vector3();
  const setupCameraForObject = object => {
    const bbox = new THREE.Box3();
    bbox.setFromObject(object);
    bbox.getCenter(center);
    bbox.getSize(size);

    const sizeLength = size.length();
    camera.far = sizeLength * 50;
    camera.near = sizeLength * .01;
    camera.position.lerpVectors(center, bbox.max, 2);
    camera.lookAt(center);

    camera.updateProjectionMatrix();
    camera.updateMatrixWorld();

    controls.target.copy(center);
  };


  const loadObject = src => {
    const baseUrl = THREE.LoaderUtils.extractUrlBase(
        options['hostUrl']
    );

    const resolvedUrl = resolveURL(src, baseUrl);

    if (resolvedUrl === '') {
      return handlers.onerror(new Error('invalid url'));
    }

    const loader = new THREE.GLTFLoader();
    loader.crossOrigin = true;

    loader.load(
        resolvedUrl,
        gltfData => {
          setupCameraForObject(gltfData.scene);
          gltfData.scene.children
              .slice()
              .forEach(child => {
                scene.add(child);
              });
          Object.assign(renderer.domElement.style, {
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
          });

          document.body.appendChild(renderer.domElement);
          animationLoop.needsUpdate = true;
          handlers.onload();
        },
        handlers.onprogress,
        handlers.onerror
    );
  };

  const webglSupported = isWebGLSupported();

  if (!webglSupported) {
    return handlers.onerror(new Error('webgl is not supported'));
  }


  const renderer = new THREE.WebGLRenderer(options['renderer']);
  renderer.setPixelRatio(Math.min(options['maxPixelRatio'], devicePixelRatio));

  const scene = new THREE.Scene();
  scene.add(makeLight());

  const camera = new THREE.PerspectiveCamera();
  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  Object.assign(controls, options['controls']);

  controls.addEventListener('change', () => {
    animationLoop.needsUpdate = true;
  });

  const step = () => {
    controls.update();
    renderer.render(scene, camera);
  };

  const animationLoop = new AnimationLoop(step);

  let oldW = null;
  let oldH = null;
  /** @param {JsonObject} box */
  const setSize = box => {
    const w = box['width'];
    const h = box['height'];
    if (oldW === w && oldH === h) {
      return;
    }
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
    animationLoop.needsUpdate = true;
    oldW = w;
    oldH = h;
  };

  setSize(options['initialLayoutRect']);

  const viewer = {
    scene,
    camera,
    renderer,
    controls,
    setSize,
    toggleAmpViewport: inVp => {
      ampInViewport = inVp;
      updateAnimationRun();
    },
    ampPlay: play => {
      ampPlay = play;
      updateAnimationRun();
    },
  };

  loadObject(options['src']);

  let ampInViewport = true;
  let ampPlay = true;

  const updateAnimationRun = () => {
    if (ampInViewport && ampPlay) {
      animationLoop.needsUpdate = true;
      animationLoop.run();
    } else {
      animationLoop.stop();
    }
  };

  updateAnimationRun();

  return viewer;
}
