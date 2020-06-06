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

import {isLayoutSizeDefined} from '../../../src/layout';
import {CSS} from '../../../build/amp-360-player-0.1.css';

const SHADERS = {
  fragSourceCommon: String.raw`
    #ifdef GL_FRAGMENT_PRECISION_HIGH
      precision highp   float;
    #else
      precision mediump float;
    #endif

    const   float     pi = 3.14159265359;
    uniform float     uPxSize;
    uniform mat3      uRot;
    uniform sampler2D uTex;
    varying vec2      vPos;

    bool unproject(vec2, out vec3);

    vec4 sample(float dx, float dy) {
      vec2 p = vPos + uPxSize * vec2(dx, dy);
      vec3 q;
      if(unproject(p, q)) {
        vec3 dir = normalize(uRot * q);
        float u = (0.5 / pi) * atan(dir[1], dir[0]) + 0.5;
        float v = (1.0 / pi) * acos(dir[2]);
        return texture2D(uTex, vec2(u, v));
      }
      else {
        return vec4(0.0);
      }
    }
  `,
  fragSourceFast: String.raw`
    void main() {
      gl_FragColor = sample(0.0, 0.0);
    }
  `,
  fragSourceSlow: String.raw`
    vec4 sampleSq(float dx, float dy) {
      vec4 s = sample(dx, dy);
      return vec4(s.xyz * s.xyz, s.w);
    }

    void main() {
      // (2, 3) halton vector sequences.
      vec4 acc = (1.0 / 16.0) * (
        (((sampleSq( 1.0 /  2.0 - 0.5,  1.0 /  3.0 - 0.5) +
           sampleSq( 1.0 /  4.0 - 0.5,  2.0 /  3.0 - 0.5)) +
          (sampleSq( 3.0 /  4.0 - 0.5,  1.0 /  9.0 - 0.5) +
           sampleSq( 1.0 /  8.0 - 0.5,  4.0 /  9.0 - 0.5))) +
         ((sampleSq( 5.0 /  8.0 - 0.5,  7.0 /  9.0 - 0.5) +
           sampleSq( 3.0 /  8.0 - 0.5,  2.0 /  9.0 - 0.5)) +
          (sampleSq( 7.0 /  8.0 - 0.5,  5.0 /  9.0 - 0.5) +
           sampleSq( 1.0 / 16.0 - 0.5,  8.0 /  9.0 - 0.5)))) +
        (((sampleSq( 9.0 / 16.0 - 0.5,  1.0 / 27.0 - 0.5) +
           sampleSq( 5.0 / 16.0 - 0.5, 10.0 / 27.0 - 0.5)) +
          (sampleSq(13.0 / 16.0 - 0.5, 19.0 / 27.0 - 0.5) +
           sampleSq( 3.0 / 16.0 - 0.5,  4.0 / 27.0 - 0.5))) +
         ((sampleSq(11.0 / 16.0 - 0.5, 13.0 / 27.0 - 0.5) +
           sampleSq( 7.0 / 16.0 - 0.5, 22.0 / 27.0 - 0.5)) +
          (sampleSq(15.0 / 16.0 - 0.5,  7.0 / 27.0 - 0.5) +
           sampleSq( 1.0 / 32.0 - 0.5, 16.0 / 27.0 - 0.5))))
     );
      gl_FragColor = vec4(sqrt(acc.xyz), acc.w);
    }
  `,
  vertSource: String.raw`
    uniform   vec2 uScale;
    attribute vec2 aPos;
    varying   vec2 vPos;

    void main() {
      gl_Position = vec4(aPos, 0.0, 1.0);
      vPos = uScale * aPos;
    }
  `,
};

const MAPPING = {
  azPerspective: String.raw`
    bool unproject(vec2 p, out vec3 q) {
      q = vec3(p, -1.0);
      return true;
    }
  `,
};

class Matrix {
  static mul(n, x, y) {
    console.assert(x.length == n * n && y.length == n * n);
    const z = new Float32Array(n * n);
    for(let i = 0; i < n; ++i) {
      for(let j = 0; j < n; ++j) {
        let sum = 0.0;
        for(let k = 0; k < n; ++k) {
          sum += x[i * n + k] * y[k * n + j];
        }
        z[i * n + j] = sum;
      }
    }
    return z;
  }

  static identity(n) {
    const z = new Float32Array(n * n);
    z.fill(0.0);
    for(let i = 0; i < n; ++i) {
      z[i * n + i] = 1.0;
    }
    return z;
  }

  static rotation(n, i, j, arg) {
    console.assert(i < n && j < n);
    const z = this.identity(n);
    const cos = Math.cos(arg);
    const sin = Math.sin(arg);
    z[i * n + i] = +cos;
    z[i * n + j] = -sin;
    z[j * n + i] = +sin;
    z[j * n + j] = +cos;
    return z;
  }
}

class Renderer {
  constructor(canvas) {
    const params = {
      alpha: true,
      depth: false,
      stencil: false,
      antialias: false,
      premultipliedAlpha: true,
    };
    const gl = this.gl =
      canvas.getContext("webgl", params) ||
      canvas.getContext("experimental-webgl", params);

    this.canvas = canvas;
    this.resize();

    this.vertShader = gl.createShader(gl.VERTEX_SHADER);
    this.fragShaderFast = gl.createShader(gl.FRAGMENT_SHADER);
    this.fragShaderSlow = gl.createShader(gl.FRAGMENT_SHADER);
    this.progFast = gl.createProgram();
    this.progSlow = gl.createProgram();
    this.compile_(this.vertShader, SHADERS.vertSource);
    gl.attachShader(this.progFast, this.vertShader);
    gl.attachShader(this.progFast, this.fragShaderFast);
    gl.attachShader(this.progSlow, this.vertShader);
    gl.attachShader(this.progSlow, this.fragShaderSlow);
    this.setMapping(MAPPING.azPerspective);
    this.setCamera(Matrix.identity(3), 1.0);

    this.vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);

    const vertices = new Float32Array([-1.0, -1.0, +1.0, -1.0, -1.0, +1.0, +1.0, +1.0]);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    this.tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
  }

  setImage(img) {
    const gl = this.gl;
    gl.bindTexture(gl.TEXTURE_2D, this.tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    gl.bindTexture(gl.TEXTURE_2D, null);
  }

  setMapping(code) {
    this.compile_(this.fragShaderFast, SHADERS.fragSourceCommon + SHADERS.fragSourceFast + code);
    this.compile_(this.fragShaderSlow, SHADERS.fragSourceCommon + SHADERS.fragSourceSlow + code);
    this.link_(this.progFast);
    this.link_(this.progSlow);
  }

  setCamera(rot, scale) {
    this.rotation = rot;
    this.scale = scale;
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;
    this.gl.viewport(0.0, 0.0, this.canvas.width, this.canvas.height);
  }

  render(fast) {
    const gl = this.gl;

    gl.disable(gl.BLEND);

    const prog = fast ? this.progFast : this.progSlow;
    gl.useProgram(prog);
    const f = this.scale / Math.sqrt(gl.drawingBufferWidth * gl.drawingBufferHeight);
    const sx = f * gl.drawingBufferWidth;
    const sy = f * gl.drawingBufferHeight;
    gl.uniformMatrix3fv(gl.getUniformLocation(prog, "uRot"), false, this.rotation);
    gl.uniform2f(gl.getUniformLocation(prog, "uScale"), sx, sy);
    gl.uniform1f(gl.getUniformLocation(prog, "uPxSize"), 2.0 * f);

    gl.enableVertexAttribArray(0);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.tex);
    gl.uniform1i(gl.getUniformLocation(prog, "uTex"), 0);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.useProgram(null);
  }

  compile_(shader, src) {
    const gl = this.gl;
    gl.shaderSource(shader, src);
    gl.compileShader(shader);
    const log = gl.getShaderInfoLog(shader);
    if(log.length > 0) {
      console.log(log);
    }
  }

  link_(prog) {
    const gl = this.gl;
    gl.linkProgram(prog);
    const log = gl.getProgramInfoLog(prog);
    if(log.length > 0) {
      console.log(log);
    }
  }
}

class CameraHeading {
  constructor(theta, phi, scale) {
    this.theta = theta;
    this.phi = phi;
    this.scale = scale;
  }

  get rotation() {
    return Matrix.mul(3,
        Matrix.rotation(3, 1, 2, this.theta),
        Matrix.rotation(3, 0, 1, this.phi));
  }
}

class CameraAnimation {
  constructor(duration, headings) {
    this.maxFrame = 60 / 1000 * duration;
    this.headings = headings;
    this.currentHeadingIndex = 0;
    this.currentFrame = 0;
  }

  easeInOutQuad(x) {
    return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
  }

  getNextHeading() {
    if (this.currentHeadingIndex < 0 || this.currentFrame == this.maxFrame - 1) {
      // Animation ended.
      return null;
    }
    this.currentFrame++;
    const framesPerSection = this.maxFrame / (this.headings.length - 1);
    const lastFrameOfCurrentSection = (this.currentHeadingIndex + 1) * framesPerSection;
    if (this.currentFrame >= lastFrameOfCurrentSection) {
      this.currentHeadingIndex++;
      if (this.currentHeadingIndex == this.headings.length) {
        // End of animation.
        this.currentHeadingIndex = -1;
        return null;
      } else {
        return this.headings[this.currentHeadingIndex];
      }
    }
    const easing = this.easeInOutQuad(this.currentFrame % framesPerSection / framesPerSection);
    const from = this.headings[this.currentHeadingIndex];
    const to = this.headings[this.currentHeadingIndex + 1];
    return new CameraHeading(
      from.theta + (to.theta - from.theta) * easing,
      from.phi + (to.phi - from.phi) * easing,
      from.scale + (to.scale - from.scale) * easing);
  }
}

export class Amp360Player extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {string} */
    this.contentSrc_ = element.getAttribute('data-src');

    /** @private {Array<!CameraHeading>} */
    this.headings_ = [];

    /** @private {number} */
    this.duration_ = parseInt(element.getAttribute('duration') || 0, 10);

    /** @private {?Element} */
    this.container_ = null;

    /** @pivate {?Renderer} */
    this.renderer_ = null;
  }

  /** @override */
  buildCallback() {
    const values = this.element.getAttribute('heading').split(',').map(s => parseFloat(s));
    for (let i = 0; i + 3 <= values.length; i = i + 3) {
      this.headings_.push(new CameraHeading(values[i], values[i+1], values[i+2]));
    }
    this.container_ = this.element.ownerDocument.createElement('div');
    const canvas = this.element.ownerDocument.createElement('canvas');
    this.element.appendChild(this.container_);
    this.container_.appendChild(canvas);
    this.renderer_ = new Renderer(canvas);
    this.applyFillContent(this.container_, /* replacedContent */ true);
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /** @override */
  layoutCallback() {
    // Assuming it's an image, for video we can check the file extension 
    // (or do something fancier like reading the bytes and check the file header).
    const img = new Image();
    const renderer = this.renderer_;
    const loadPromise = new Promise(resolve => {
      img.onload = () => {
        this.renderer_.resize();
        this.renderer_.setImage(img);
        if (this.headings_.length < 1) {
          return
        }
        this.renderer_.setCamera(this.headings_[0].rotation, this.headings_[0].scale);
        this.renderer_.render(false);
        resolve(); 
        if (this.duration_ && this.headings_.length > 1) {
          this.animate();
        }
      };
    });
    img.src = this.contentSrc_;
    // Return a load promise for the image so the runtime knows when the
    // component is ready.
    return loadPromise;
  }

  animate() {
    const animation = new CameraAnimation(this.duration_, this.headings_);
    const loop = () => {
      let nextHeading = animation.getNextHeading();
      if (nextHeading) {
        window.requestAnimationFrame(() => {
          this.renderer_.setCamera(nextHeading.rotation, nextHeading.scale);
          this.renderer_.render(true);
          loop();
        });  
      } else {
        this.renderer_.render(false);
        return;
      }
    };
    loop();
  }
}

AMP.extension('amp-360-player', '0.1', (AMP) => {
  AMP.registerElement('amp-360-player', Amp360Player, CSS);
});