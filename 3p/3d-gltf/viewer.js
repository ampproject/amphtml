/*global THREE*/
import {resolveURL} from './util';
import AnimationLoop from './AnimationLoop';
import declareGLTFLoader from './gltfLoader';
import declareOrbitControls from './orbit';

/**
 * @param {JsonObject} options
 * @param {{onerror: Function, onprogress: Function, onload: Function}} handlers
 * @returns {*}
 */
export default function makeViewer(options, handlers) {
  declareGLTFLoader();
  declareOrbitControls();


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
  const setupCameraForObject = (viewer, object) => {
    const camera = viewer.camera;
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

    viewer.controls.target.copy(center);
  };


  const loadObject = (viewer, src) => {
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
          setupCameraForObject(viewer, gltfData.scene);
          viewer.gltfData = gltfData;
          gltfData.scene.children
              .slice()
              .forEach(child => {
                viewer.scene.add(child);
              });
          Object.assign(viewer.renderer.domElement.style, {
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
          });

          document.body.appendChild(viewer.renderer.domElement);
          viewer.animationLoop.needsUpdate = true;
          handlers.onload();
        },
        handlers.onprogress,
        handlers.onerror
    );
  };

  const webglSupported = (() => {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl')
        || canvas.getContext('experimental-webgl');
    return gl && gl instanceof WebGLRenderingContext;
  })();

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
    viewer.lastRenderCamera = camera;
    renderer.render(scene, camera);
  };

  const animationLoop = new AnimationLoop(step);

  const updateSize = () => {
    const w = global.innerWidth;
    const h = global.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
    animationLoop.needsUpdate = true;
  };

  updateSize();
  global.addEventListener('resize', updateSize);

  const viewer = {
    animationLoop,
    scene,
    camera,
    renderer,
    controls,
    toggleAmpViewport: inVp => {
      ampInViewport = inVp;
      updateAnimationRun();
    },
    ampPlay: play => {
      ampPlay = play;
      updateAnimationRun();
    },
  };

  loadObject(viewer, options['src']);
  global.viewer = viewer;

  let ampInViewport = true;
  let ampPlay = true;

  const updateAnimationRun = () => {
    if (!viewer) {
      console.warn('command sent to uninitialized viewer');
      return;
    }

    if (ampInViewport && ampPlay) {
      viewer.animationLoop.needsUpdate = true;
      viewer.animationLoop.run();
    } else {
      viewer.animationLoop.stop();
    }
  };

  updateAnimationRun();

  return viewer;
}
