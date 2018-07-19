//3d-gltf/index.js
var THREE;

THREE.LoaderUtils
THREE.LoaderUtils.extractUrlBase

THREE.WebGLRenderer = class {
  /** @param {!JsonObject} opts */
  constructor(opts) {
    /** @type {?Element} */ this.domElement = null;}};
THREE.WebGLRenderer.prototype.setSize
THREE.WebGLRenderer.prototype.setPixelRatio
THREE.WebGLRenderer.prototype.render

THREE.Light = class extends THREE.Object3D {};
THREE.DirectionalLight = class extends THREE.Light {};
THREE.AmbientLight = class extends THREE.Light {};

THREE.Box3 = class {};
THREE.Box3.prototype.getSize
THREE.Box3.prototype.getCenter
THREE.Box3.prototype.setFromObject
THREE.Box3.prototype.min
THREE.Box3.prototype.max

THREE.Vector3 = class {
  /** @param {number=} opt_x
   * @param {number=} opt_y
   * @param {number=} opt_z */
  constructor(opt_x, opt_y, opt_z) {}
};
THREE.Vector3.prototype.lerpVectors
THREE.Vector3.prototype.copy
THREE.Vector3.prototype.clone
THREE.Vector3.prototype.subVectors
THREE.Vector3.prototype.multiplyScalar
THREE.Vector3.prototype.setFromMatrixColumn
THREE.Vector3.prototype.add
THREE.Vector3.prototype.set
THREE.Vector3.prototype.applyQuaternion
THREE.Vector3.prototype.setFromSpherical
THREE.Vector3.prototype.distanceToSquared
THREE.Vector3.prototype.length
THREE.Vector3.prototype.fromArray

THREE.Object3D = class {
  constructor() {
    this.position = new THREE.Vector3();
    this.children = [];}};

THREE.Object3D.prototype.applyMatrix
THREE.Object3D.prototype.add
THREE.Object3D.prototype.updateMatrixWorld
THREE.Object3D.prototype.lookAt
THREE.Object3D.prototype.clone

THREE.OrbitControls = class {
  /** @param {THREE.Camera} camera
   * @param {Element} domElement */
  constructor(camera, domElement) {
    this.target = new THREE.Vector3(); }};
THREE.OrbitControls.prototype.update
THREE.OrbitControls.prototype.addEventListener

THREE.Scene = class extends THREE.Object3D {};
THREE.Group = class extends THREE.Object3D {};

THREE.Camera = class extends THREE.Object3D {
  constructor() {
    super();
    this.fov = 0;
    this.far = 0;
    this.near = 0;
    this.aspect = 0;
    this.zoom = 0;}};
THREE.Camera.prototype.updateProjectionMatrix
THREE.Camera.prototype.setFromUnitVectors

THREE.PerspectiveCamera = class extends THREE.Camera {};

THREE.GLTFLoader = class {
  constructor() {
    this.crossOrigin = false;}};
THREE.GLTFLoader.prototype.load
