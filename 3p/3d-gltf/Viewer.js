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

/* global THREE */

import {setStyle} from '../../src/style';
import AnimationLoop from './AnimationLoop';

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

export default class GltfViewer {
  constructor(options, handlers) {
    /** @private */
    this.options_ = options;

    /** @private */
    this.handlers_ = handlers;

    /** @private */
    this.renderer_ = new THREE.WebGLRenderer(options['renderer']);

    /** @private */
    this.camera_ = new THREE.PerspectiveCamera();

    /** @private */
    this.controls_ = new THREE.OrbitControls(
        this.camera_,
        this.renderer_.domElement
    );

    /** @private */
    this.scene_ = new THREE.Scene();

    this.step_ = this.step_.bind(this);
    /** @private */
    this.animationLoop_ = new AnimationLoop(this.step_);

    /** @private */
    this.ampPlay_ = true;

    /** @private */
    this.ampInViewport_ =
        options['initialIntersection']['intersectionRatio'] > 0;

    /** @private */
    this.setSize_ = this.setupSize_();

    this.setupRenderer_();
    this.setupControls_();
    this.setupScene_();
    this.loadObject_();
    this.reconcileAnimationLoop_();

    this.actions = {
      'setSize': this.setSize_,
      'toggleAmpPlay': this.toggleAmpPlay_.bind(this),
      'toggleAmpViewport': this.toggleAmpViewport_.bind(this),
    };
  }

  /** @private */
  setupSize_() {
    let oldW = null;
    let oldH = null;
    /** @param {JsonObject} box */
    const setSize = box => {
      const w = box['width'];
      const h = box['height'];
      if (oldW === w && oldH === h) {
        return;
      }
      this.camera_.aspect = w / h;
      this.camera_.updateProjectionMatrix();
      this.renderer_.setSize(w, h);
      this.animationLoop_.needsUpdate = true;
      oldW = w;
      oldH = h;
    };

    setSize(this.options_['initialLayoutRect']);

    return setSize;
  }

  /** @private */
  setupControls_() {
    Object.assign(this.controls_, this.options_['controls']);
    this.controls_.addEventListener('change', () => {
      this.animationLoop_.needsUpdate = true;
    });
  }

  /** @private */
  setupScene_() {
    const amb = new THREE.AmbientLight();
    const dir1 = new THREE.DirectionalLight();
    dir1.position.set(1, 2, 3);
    const dir2 = new THREE.DirectionalLight();
    dir2.position.set(1, -2, -2);

    const light = new THREE.Group();
    light.add(amb, dir1, dir2);

    this.scene_.add(light);
  }

  /** @private */
  setupRenderer_() {
    this.renderer_.setPixelRatio(
        Math.min(
            this.options_['maxPixelRatio'],
            devicePixelRatio
        )
    );
  }

  /** @private */
  setupCameraForObject_(object) {
    const center = new THREE.Vector3();
    const size = new THREE.Vector3();
    const bbox = new THREE.Box3();
    bbox.setFromObject(object);
    bbox.getCenter(center);
    bbox.getSize(size);

    const sizeLength = size.length();
    this.camera_.far = sizeLength * 50;
    this.camera_.near = sizeLength * .01;
    this.camera_.position.lerpVectors(center, bbox.max, 2);
    this.camera_.lookAt(center);

    this.camera_.updateProjectionMatrix();
    this.camera_.updateMatrixWorld();

    this.controls_.target.copy(center);
  }

  /** @private */
  loadObject_() {
    const baseUrl = THREE.LoaderUtils.extractUrlBase(
        this.options_['hostUrl']
    );

    const resolvedUrl = resolveURL(this.options_['src'], baseUrl);

    if (resolvedUrl === '') {
      return this.handlers_.onerror(new Error('invalid url'));
    }

    const loader = new THREE.GLTFLoader();
    loader.crossOrigin = true;

    loader.load(
        resolvedUrl,
        /**
         * @param {{scene: THREE.Scene}} gltfData
         */
        gltfData => {
          this.setupCameraForObject_(gltfData.scene);
          gltfData.scene.children
              .slice()
              .forEach(child => {
                this.scene_.add(child);
              });

          const el = this.renderer_.domElement;
          setStyle(el, 'position', 'absolute');
          setStyle(el, 'top', 0);
          setStyle(el, 'right', 0);
          setStyle(el, 'bottom', 0);
          setStyle(el, 'left', 0);

          document.body.appendChild(this.renderer_.domElement);
          this.animationLoop_.needsUpdate = true;
          this.handlers_.onload();
        },
        this.handlers_.onprogress,
        this.handlers_.onerror
    );
  }

  /** @private */
  step_() {
    this.controls_.update();
    this.renderer_.render(this.scene_, this.camera_);
  }

  /** @private */
  toggleAmpPlay_(value) {
    this.ampPlay_ = value;
    this.reconcileAnimationLoop_();
  }

  /** @private */
  toggleAmpViewport_(inVp) {
    this.ampInViewport_ = inVp;
    this.reconcileAnimationLoop_();
  }

  /** @private */
  reconcileAnimationLoop_() {
    if (this.ampInViewport_ && this.ampPlay_) {
      this.animationLoop_.needsUpdate = true;
      this.animationLoop_.run();
    } else {
      this.animationLoop_.stop();
    }
  }
}
