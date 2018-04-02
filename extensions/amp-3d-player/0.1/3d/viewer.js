/* global THREE, AMP_3D_VIEWER_IPC, resolveURL */

export default function gltfViewer() {
  const notifyReady = () => {
    const interval = setInterval(() => {
      AMP_3D_VIEWER_IPC.notify(window, 'heartbeat', null);
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  };

  const init = () => {
    AMP_3D_VIEWER_IPC.addQueryHandler(window, 'setOptions', options => {
      startViewer(options);
    });

    AMP_3D_VIEWER_IPC.addQueryHandler(window, 'ready', notifyReady());
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

  const startViewer = options => {
    const renderer = new THREE.WebGLRenderer(options.renderer);

    const scene = new THREE.Scene();
    scene.add(makeLight());

    const camera = new THREE.PerspectiveCamera();
    camera.position.set(2, 3, 4);
    camera.lookAt(new THREE.Vector3(0, 0, 0));

    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    Object.assign(controls, options.controls);

    const step = () => {
      controls.update();
      renderer.render(scene, camera);
      requestAnimationFrame(step);
    };

    const updateSize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    updateSize();
    window.addEventListener('resize', updateSize);

    document.body.appendChild(renderer.domElement);

    const baseUrl = THREE.LoaderUtils.extractUrlBase(
        window.parent.location.href
    );
    const src = resolveURL(options.src, baseUrl);

    window.scene = scene;

    new THREE.GLTFLoader()
        .load(
            src,
            gltfData => {
              setupCameraForObject(camera, gltfData.scene);
              gltfData.scene.children
                  .slice()
                  .forEach(child => {
                    scene.add(child);
                  });
            },
            () => {},// todo: progress
            () => {} // todo: error
        );

    step();
  };

  init();
}
