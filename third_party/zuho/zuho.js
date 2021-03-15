// (c) Yasuhiro Fujii <y-fujii at mimosa-pudica.net>, under MIT License.
// Refactored and trimmed off for AMP project needs.

const SHADERS = {
  fragSourceCommon: `
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

    vec4 sample(float dx, float dy) {
      vec3 q = vec3(vPos + uPxSize * vec2(dx, dy), -1.0);
      vec3 dir = normalize(uRot * q);
      float u = (-0.5 / pi) * atan(dir[1], dir[0]) + 0.5;
      float v = (1.0 / pi) * acos(dir[2]);
      return texture2D(uTex, vec2(u, v));
    }
  `,
  fragSourceFast: `
    void main() {
      gl_FragColor = sample(0.0, 0.0);
    }
  `,
  fragSourceSlow: `
    vec4 sampleSq(float dx, float dy) {
      vec4 s = sample(dx, dy);
      return vec4(s.xyz * s.xyz, s.w);
    }

    void main() {
      // (2, 3) halton vector sequences.
      vec4 acc = (1.0 / 16.0) * (
        (((sampleSq(1.0 / 2.0 - 0.5,  1.0 / 3.0 - 0.5) +
           sampleSq(1.0 / 4.0 - 0.5,  2.0 / 3.0 - 0.5)) +
          (sampleSq(3.0 / 4.0 - 0.5,  1.0 / 9.0 - 0.5) +
           sampleSq(1.0 / 8.0 - 0.5,  4.0 / 9.0 - 0.5))) +
         ((sampleSq(5.0 / 8.0 - 0.5,  7.0 / 9.0 - 0.5) +
           sampleSq(3.0 / 8.0 - 0.5,  2.0 / 9.0 - 0.5)) +
          (sampleSq(7.0 / 8.0 - 0.5,  5.0 / 9.0 - 0.5) +
           sampleSq(1.0 / 16.0 - 0.5,  8.0 / 9.0 - 0.5)))) +
        (((sampleSq(9.0 / 16.0 - 0.5,  1.0 / 27.0 - 0.5) +
           sampleSq(5.0 / 16.0 - 0.5, 10.0 / 27.0 - 0.5)) +
          (sampleSq(13.0 / 16.0 - 0.5, 19.0 / 27.0 - 0.5) +
           sampleSq(3.0 / 16.0 - 0.5,  4.0 / 27.0 - 0.5))) +
         ((sampleSq(11.0 / 16.0 - 0.5, 13.0 / 27.0 - 0.5) +
           sampleSq(7.0 / 16.0 - 0.5, 22.0 / 27.0 - 0.5)) +
          (sampleSq(15.0 / 16.0 - 0.5,  7.0 / 27.0 - 0.5) +
           sampleSq(1.0 / 32.0 - 0.5, 16.0 / 27.0 - 0.5))))
     );
      gl_FragColor = vec4(sqrt(acc.xyz), acc.w);
    }
  `,
  vertSource: `
    uniform   vec2 uScale;
    attribute vec2 aPos;
    varying   vec2 vPos;

    void main() {
      gl_Position = vec4(aPos, 0.0, 1.0);
      vPos = uScale * aPos;
    }
  `,
};

export class Matrix {
  static mul(n, x, y) {
    console.assert(x.length == n * n && y.length == n * n);
    const z = new Float32Array(n * n);
    for (let i = 0; i < n; ++i) {
      for (let j = 0; j < n; ++j) {
        let sum = 0.0;
        for (let k = 0; k < n; ++k) {
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
    for (let i = 0; i < n; ++i) {
      z[i * n + i] = 1.0;
    }
    return z;
  }

  static rotation(n, i, j, arg) {
    console.assert(i < n && j < n);
    const z = Matrix.identity(n);
    const cos = Math.cos(arg);
    const sin = Math.sin(arg);
    z[i * n + i] = +cos;
    z[i * n + j] = -sin;
    z[j * n + i] = +sin;
    z[j * n + j] = +cos;
    return z;
  }
};

export class Renderer {
  constructor(canvas) {
    const params = {
      alpha: true,
      depth: false,
      stencil: false,
      antialias: false,
      premultipliedAlpha: true,
      preserveDrawingBuffer: window.__AMP_TEST || false,
    };
    this.gl = canvas.getContext('webgl', params) ||
        canvas.getContext('experimental-webgl', params);

    this.canvas = canvas;
    
    this.rotation = null;
    this.scale = 1;
    this.orientation = null;

    this.vertShader = null;
    this.fragShaderFast = null;
    this.fragShaderSlow = null;
    this.progFast = null;
    this.progSlow = null;
    this.vbo = null;
    this.tex = null;
  }

  init() {
    const gl = this.gl;
    
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
    this.setMapping();
    this.setCamera(Matrix.identity(3), 1.0);

    this.vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
    const vertices =
        new Float32Array([-1.0, -1.0, +1.0, -1.0, -1.0, +1.0, +1.0, +1.0]);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    this.tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    
    this.resize();
  }
          
  setImage(img) {
    const gl = this.gl;
    gl.bindTexture(gl.TEXTURE_2D, this.tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    gl.bindTexture(gl.TEXTURE_2D, null);
  }

  setImageOrientation(heading = 0, pitch = 0, roll = 0) {
    const RAD = Math.PI / 180;
    this.orientation =
        this.euler_(RAD * heading, RAD * pitch, RAD * roll);
  }

  setMapping(code = '') {
    this.compile_(
        this.fragShaderFast,
        SHADERS.fragSourceCommon + SHADERS.fragSourceFast + code);
    this.compile_(
        this.fragShaderSlow,
        SHADERS.fragSourceCommon + SHADERS.fragSourceSlow + code);
    this.link_(this.progFast);
    this.link_(this.progSlow);
  }

  setCamera(rot, scale) {
    this.rotation = rot;
    this.scale = scale;
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = rect.width * devicePixelRatio;
    this.canvas.height = rect.height * devicePixelRatio;
    this.gl.viewport(0.0, 0.0, this.canvas.width, this.canvas.height);
  }

  render(fast) {
    const gl = this.gl;

    gl.disable(gl.BLEND);

    const prog = fast ? this.progFast : this.progSlow;
    gl.useProgram(prog);
    const f =
        this.scale / Math.sqrt(gl.drawingBufferWidth * gl.drawingBufferHeight);
    const sx = f * gl.drawingBufferWidth;
    const sy = f * gl.drawingBufferHeight;
    gl.uniformMatrix3fv(
        gl.getUniformLocation(prog, 'uRot'), false, this.rotation);
    gl.uniform2f(gl.getUniformLocation(prog, 'uScale'), sx, sy);
    gl.uniform1f(gl.getUniformLocation(prog, 'uPxSize'), 2.0 * f);

    if (!this.orientation) {
      this.orientation = Matrix.identity(3);
    }
    gl.uniformMatrix3fv(
        gl.getUniformLocation(prog, 'uRot'), false,
        Matrix.mul(3, this.rotation, this.orientation));

    gl.enableVertexAttribArray(0);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.tex);
    gl.uniform1i(gl.getUniformLocation(prog, 'uTex'), 0);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.useProgram(null);
  }

  /** @private */
  compile_(shader, src) {
    const gl = this.gl;
    gl.shaderSource(shader, src);
    gl.compileShader(shader);
    const log = gl.getShaderInfoLog(shader);
    if (log.length > 0) {
      console.log(log);
    }
  }

  /** @private */
  link_(prog) {
    const gl = this.gl;
    gl.linkProgram(prog);
    const log = gl.getProgramInfoLog(prog);
    if (log.length > 0) {
      console.log(log);
    }
  }

  /** @private */
  euler_(heading, pitch, roll) {
    const te = Matrix.identity(3);
    const x = -roll, y = -pitch, z = -heading;

    const a = Math.cos(x), b = Math.sin(x);
    const c = Math.cos(y), d = Math.sin(y);
    const e = Math.cos(z), f = Math.sin(z);

    const ae = a * e, af = a * f, be = b * e, bf = b * f;

    te[0] = c * e;
    te[3] = -c * f;
    te[6] = d;
    te[1] = af + be * d;
    te[4] = ae - bf * d;
    te[7] = -b * c;
    te[2] = bf - ae * d;
    te[5] = be + af * d;
    te[8] = a * c;

    return te;
  }
}
