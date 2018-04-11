/* global THREE, AMP_3D_VIEWER_IPC, resolveURL, AnimationLoop */

export default function gltfViewer() {
  const webglSupported = (() => {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl')
        || canvas.getContext('experimental-webgl');
    return gl && gl instanceof WebGLRenderingContext;
  })();

  const notifySignOfLife = () => {
    AMP_3D_VIEWER_IPC.notify(window, 'heartbeat', null);
    const interval = setInterval(() => {
      AMP_3D_VIEWER_IPC.notify(window, 'heartbeat', null);
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  };

  const init = () => {
    let viewer = null;
    let ampPlay = true;
    let ampInViewport = true;
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

    AMP_3D_VIEWER_IPC.addQueryHandler(window, 'setOptions', options => {
      if (!webglSupported) {
        return Promise.reject('webgl is not supported');
      }
      if (viewer) {
        viewer.animationLoop.stop();
      }
      viewer = startViewer(options);
      updateAnimationRun();
    });

    AMP_3D_VIEWER_IPC.addQueryHandler(window, 'toggleAMPViewport', inVp => {
      ampInViewport = inVp;
      updateAnimationRun();
    });

    AMP_3D_VIEWER_IPC.addQueryHandler(window, 'toggleAMPPlay', play => {
      ampPlay = play;
      updateAnimationRun();
    });

    const stopNotifying = notifySignOfLife();
    AMP_3D_VIEWER_IPC.addQueryHandler(window, 'ready', stopNotifying);
  };

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
        window.parent.location.href
    );

    const resolvedUrl = resolveURL(src, baseUrl);

    if (resolvedUrl === '') {
      setTimeout(() => {
        AMP_3D_VIEWER_IPC.query(window, 'error', 'invalid url');
      }, 0);
      return;
    }

    new THREE.GLTFLoader()
        .load(
            resolvedUrl,
            gltfData => {
              setupCameraForObject(viewer, gltfData.scene);
              viewer.gltfData = gltfData;
              gltfData.scene.children
                  .slice()
                  .forEach(child => {
                    viewer.scene.add(child);
                  });
              document.body.appendChild(viewer.renderer.domElement);
              viewer.animationLoop.needsUpdate = true;
              AMP_3D_VIEWER_IPC.query(window, 'loaded', null);
            },
            ({loaded, total}) => {
              AMP_3D_VIEWER_IPC.notify(window, 'progress', {loaded, total});
            },
            err => {
              AMP_3D_VIEWER_IPC.query(window, 'error', err.toString());
            }
        );
  };

  const startViewer = options => {
    const renderer = new THREE.WebGLRenderer(options.renderer);
    renderer.setPixelRatio(Math.min(options.maxPixelRatio, devicePixelRatio));

    const scene = new THREE.Scene();
    scene.add(makeLight());

    const camera = new THREE.PerspectiveCamera();
    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    Object.assign(controls, options.controls);

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
      const w = window.innerWidth;
      const h = window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      animationLoop.needsUpdate = true;
    };

    updateSize();
    window.addEventListener('resize', updateSize);

    const viewer = {
      animationLoop,
      scene,
      camera,
      renderer,
      controls,
    };

    loadObject(viewer, options.src);
    window.viewer = viewer;

    return viewer;
  };

  init();
}
