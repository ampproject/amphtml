/* global THREE, AMP_3D_VIEWER_IPC, resolveURL, AnimationLoop */

export default function gltfViewer() {
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
  const setupCameraForObject = (camera, object) => {
    const bbox = new THREE.Box3();
    bbox.setFromObject(object);
    bbox.getCenter(center);
    bbox.getSize(size);

    const sizeLength = size.length();
    camera.far = sizeLength * 50;
    camera.near = sizeLength * .01;
    camera.position.copy(bbox.max).multiplyScalar(2);
    camera.lookAt(center);

    camera.updateProjectionMatrix();
    camera.updateMatrixWorld();
  };

  const loadObject = (viewer, src) => {
    const baseUrl = THREE.LoaderUtils.extractUrlBase(
        window.parent.location.href
    );
    new THREE.GLTFLoader()
        .load(
            resolveURL(src, baseUrl),
            gltfData => {
              setupCameraForObject(viewer.camera, gltfData.scene);
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
    camera.position.set(2, 3, 4);
    camera.lookAt(new THREE.Vector3(0, 0, 0));

    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    Object.assign(controls, options.controls);

    controls.addEventListener('change', () => {
      animationLoop.needsUpdate = true;
    });

    const step = () => {
      controls.update();
      renderer.render(scene, camera);
    };

    const animationLoop = new AnimationLoop([step]);

    const updateSize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    window.scene = scene;

    const viewer = {
      animationLoop,
      scene,
      camera,
      renderer
    };

    loadObject(viewer, options.src);

    return viewer;
  };

  init();
}
