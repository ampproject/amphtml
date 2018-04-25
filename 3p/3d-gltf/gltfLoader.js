/* global THREE */
import {dict} from '../../src/utils/object';
import {parseJson} from '../../src/json';
import {resolveURL} from './util';

/**
 * @author Rich Tibbett / https://github.com/richtr
 * @author mrdoob / http://mrdoob.com/
 * @author Tony Parisi / http://www.tonyparisi.com/
 * @author Takahiro / https://github.com/takahirox
 * @author Don McCurdy / https://www.donmccurdy.com
 */
export default function declareGLTFLoader() {
  const T = THREE;

  T.GLTFLoader = (function() {
    function GLTFLoader(manager) {
      this.manager = (manager !== undefined)
        ? manager
        : T.DefaultLoadingManager;
      this.dracoLoader = null;
    }
    GLTFLoader.prototype = {
      constructor: GLTFLoader,
      crossOrigin: 'Anonymous',
      load: function(url, onLoad, onProgress, onError) {
        const _ = this;
        const path = this.path !== undefined
          ? this.path
          : T.LoaderUtils.extractUrlBase(url);
        const loader = new T.FileLoader(_.manager);
        loader.setResponseType('arraybuffer');
        loader.load(url, function(data) {
          try {
            _.parse(data, path, onLoad, onError);
          } catch (e) {
            if (onError !== undefined) {
              onError(e);
            } else {
              throw e;
            }
          }
        }, onProgress, onError);
      },
      setCrossOrigin: function(value) {
        this.crossOrigin = value;
        return this;
      },
      setPath: function(value) {
        this.path = value;
        return this;
      },
      setDRACOLoader: function(dracoLoader) {
        this.dracoLoader = dracoLoader;
        return this;
      },
      parse: function(data, path, onLoad, onError) {
        let content;
        const extensions = {};
        if (typeof data === 'string') {
          content = data;
        } else {
          const magic = T.LoaderUtils.decodeText(new Uint8Array(data, 0, 4));
          if (magic === BINARY_EXTENSION_HEADER_MAGIC) {
            try {
              extensions[XT.KHR_BINARY_GLTF] =
                  new GLTFBinaryExtension(data);
            } catch (error) {
              if (onError) {onError(error);}
              return;
            }
            content = extensions[XT.KHR_BINARY_GLTF].content;
          } else {
            content = T.LoaderUtils.decodeText(new Uint8Array(data));
          }
        }
        const json = parseJson(content);
        if (json['asset'] === undefined || json['asset']['version'][0] < 2) {
          if (onError) {
            onError(new Error(
                'T.GLTFLoader: Unsupported asset. ' +
                'glTF versions >=2.0 are supported. ' +
                'Use LegacyGLTFLoader instead.'
            ));
          }
          return;
        }
        if (json['extensionsUsed']) {
          if (json['extensionsUsed'].indexOf(XT.KHR_LIGHTS) >= 0) {
            extensions[XT.KHR_LIGHTS] = new GLTFLightsExtension(json);
          }
          if (json['extensionsUsed'].indexOf(XT.KHR_MATERIALS_UNLIT) >= 0) {
            extensions[XT.KHR_MATERIALS_UNLIT] =
                new GLTFMaterialsUnlitExtension(json);
          }
          if (json['extensionsUsed']
              .indexOf(XT.KHR_MATERIALS_PBR_SPECULAR_GLOSSINESS) >= 0) {
            extensions[XT.KHR_MATERIALS_PBR_SPECULAR_GLOSSINESS] =
                new GLTFMaterialsPbrSpecularGlossinessExtension();
          }
          if (json['extensionsUsed']
              .indexOf(XT.KHR_DRACO_MESH_COMPRESSION) >= 0) {
            extensions[XT.KHR_DRACO_MESH_COMPRESSION] =
                new GLTFDracoMeshCompressionExtension(this.dracoLoader);
          }
        }
        console.time('GLTFLoader');
        const parser = new GLTFParser(json, extensions, {
          path: path || this.path || '',
          crossOrigin: this.crossOrigin,
          manager: this.manager,
        });
        parser.parse(function(scene, scenes, cameras, animations, asset) {
          console.timeEnd('GLTFLoader');
          const glTF = {
            scene,
            scenes,
            cameras,
            animations,
            asset,
          };
          onLoad(glTF);
        }, onError);
      },
    };
    /* GLTFREGISTRY */
    function GLTFRegistry() {
      let objects = {};
      return {
        get: function(key) {
          return objects[key];
        },
        add: function(key, object) {
          objects[key] = object;
        },
        remove: function(key) {
          delete objects[key];
        },
        removeAll: function() {
          objects = {};
        },
      };
    }
    /*********************************/
    /********** EXTENSIONS ***********/
    /*********************************/
    const XT = {
      KHR_BINARY_GLTF: 'KHR_binary_glTF',
      KHR_DRACO_MESH_COMPRESSION: 'KHR_draco_mesh_compression',
      KHR_LIGHTS: 'KHR_lights',
      KHR_MATERIALS_PBR_SPECULAR_GLOSSINESS:
          'KHR_materials_pbrSpecularGlossiness',
      KHR_MATERIALS_UNLIT: 'KHR_materials_unlit',
    };
    /**
     * Lights Extension
     *
     * Specification: PENDING
     * @constructor
     */
    function GLTFLightsExtension(json) {
      this.name = XT.KHR_LIGHTS;
      this.lights = {};
      const extension =
          (json.extensions && json.extensions[XT.KHR_LIGHTS]) || {};
      const lights = extension.lights || {};
      for (const lightId in lights) {
        /** * @type {JsonObject} */
        const light = lights[lightId];
        /** @type {?THREE.Light} */
        let lightNode;
        const color = new T.Color().fromArray(light['color']);
        switch (light['type']) {
          case 'directional':
            lightNode = new T.DirectionalLight(color);
            lightNode.position.set(0, 0, 1);
            break;
          case 'point':
            lightNode = new T.PointLight(color);
            break;
          case 'spot':
            lightNode = new T.SpotLight(color);
            lightNode.position.set(0, 0, 1);
            break;
          case 'ambient':
            lightNode = new T.AmbientLight(color);
            break;
        }
        if (lightNode) {
          if (light['constantAttenuation'] !== undefined) {
            lightNode.intensity = light['constantAttenuation'];
          }
          if (light['linearAttenuation'] !== undefined) {
            lightNode.distance = 1 / light['linearAttenuation'];
          }
          if (light['quadraticAttenuation'] !== undefined) {
            lightNode.decay = light['quadraticAttenuation'];
          }
          if (light['fallOffAngle'] !== undefined) {
            lightNode.angle = light['fallOffAngle'];
          }
          if (light['fallOffExponent'] !== undefined) {
            console.warn(
                'T.GLTFLoader:: light.fallOffExponent not currently supported.'
            );
          }
          lightNode.name = light['name'] || ('light_' + lightId);
          this.lights[lightId] = lightNode;
        }
      }
    }
    /**
     * Unlit Materials Extension (pending)
     *
     * PR: https://github.com/KhronosGroup/glTF/pull/1163
     * @constructor
     */
    function GLTFMaterialsUnlitExtension(opt_json) {
      this.name = XT.KHR_MATERIALS_UNLIT;
    }
    GLTFMaterialsUnlitExtension.prototype.getMaterialType = function() {
      return T.MeshBasicMaterial;
    };
    /**
     * @param materialParams
     * @param {JsonObject} material
     * @param parser
     * @returns {Promise}
     */
    GLTFMaterialsUnlitExtension.prototype.extendParams =
        function(materialParams, material, parser) {
          const pending = [];
          materialParams.color = new T.Color(1.0, 1.0, 1.0);
          materialParams.opacity = 1.0;
          const metallicRoughness = material['pbrMetallicRoughness'];
          if (metallicRoughness) {
            if (Array.isArray(metallicRoughness['baseColorFactor'])) {
              const array = metallicRoughness['baseColorFactor'];
              materialParams.color.fromArray(array);
              materialParams.opacity = array[3];
            }
            if (metallicRoughness['baseColorTexture'] !== undefined) {
              pending.push(parser.assignTexture(
                  materialParams,
                  'map',
                  metallicRoughness['baseColorTexture']['index']
              ));
            }
          }
          return Promise.all(pending);
        };
    /* BINARY EXTENSION */
    // const BINARY_EXTENSION_BUFFER_NAME = 'binary_glTF';
    const BINARY_EXTENSION_HEADER_MAGIC = 'glTF';
    const BIN_EXT_HDR_LEN = 12;
    const BINARY_EXTENSION_CHUNK_TYPES = {JSON: 0x4E4F534A, BIN: 0x004E4942};
    /** @constructor */
    function GLTFBinaryExtension(data) {
      this.name = XT.KHR_BINARY_GLTF;
      this.content = null;
      this.body = null;
      const headerView = new DataView(data, 0, BIN_EXT_HDR_LEN);
      this.header = {
        magic: T.LoaderUtils.decodeText(new Uint8Array(data.slice(0, 4))),
        version: headerView.getUint32(4, true),
        length: headerView.getUint32(8, true),
      };
      if (this.header.magic !== BINARY_EXTENSION_HEADER_MAGIC) {
        throw new Error(
            'THREE.GLTFLoader: Unsupported glTF-Binary header.'
        );
      } else if (this.header.version < 2.0) {
        throw new Error(
            'THREE.GLTFLoader: Legacy binary file detected. ' +
            'Use LegacyGLTFLoader instead.'
        );
      }
      const chunkView = new DataView(data, BIN_EXT_HDR_LEN);
      let iChunk = 0;
      while (iChunk < chunkView.byteLength) {
        const nChunk = chunkView.getUint32(iChunk, true);
        iChunk += 4;
        const chunkType = chunkView.getUint32(iChunk, true);
        iChunk += 4;
        if (chunkType === BINARY_EXTENSION_CHUNK_TYPES.JSON) {
          const chunk = new Uint8Array(data, BIN_EXT_HDR_LEN + iChunk, nChunk);
          this.content = T.LoaderUtils.decodeText(chunk);
        } else if (chunkType === BINARY_EXTENSION_CHUNK_TYPES.BIN) {
          const byteOffset = BIN_EXT_HDR_LEN + iChunk;
          this.body = data.slice(byteOffset, byteOffset + nChunk);
        }
        // Clients must ignore chunks with unknown types.
        iChunk += nChunk;
      }
      if (this.content === null) {
        throw new Error('THREE.GLTFLoader: JSON content not found.');
      }
    }
    /**
     * DRACO Mesh Compression Extension
     *
     * Specification: https://github.com/KhronosGroup/glTF/pull/874
     * @constructor
     */
    function GLTFDracoMeshCompressionExtension(dracoLoader) {
      if (!dracoLoader) {
        throw new Error('THREE.GLTFLoader: No DRACOLoader instance provided.');
      }
      this.name = XT.KHR_DRACO_MESH_COMPRESSION;
      this.dracoLoader = dracoLoader;
    }

    /**
     *
     * @param {JsonObject} primitive
     * @param parser
     * @returns {*}
     */
    GLTFDracoMeshCompressionExtension.prototype.decodePrimitive =
        function(primitive, parser) {
          const dl = this.dracoLoader;
          const bufferViewIndex =
              primitive['extensions'][this.name]['bufferView'];
          const gltfAttributeMap =
              primitive['extensions'][this.name]['attributes'];
          const threeAttributeMap = {};
          for (const attrName in gltfAttributeMap) {
            if (!(attrName in ATTRS)) {continue;}
            threeAttributeMap[ATTRS[attrName]] = gltfAttributeMap[attrName];
          }
          return parser
              .getDependency('bufferView', bufferViewIndex)
              .then(function(bufferView) {
                return new Promise(function(resolve) {
                  dl.decodeDracoFile(bufferView, resolve, threeAttributeMap);
                });
              });
        };
    /**
     * Specular-Glossiness Extension
     *
     * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_materials_pbrSpecularGlossiness
     * @constructor
     */
    function GLTFMaterialsPbrSpecularGlossinessExtension() {
      return {
        name: XT.KHR_MATERIALS_PBR_SPECULAR_GLOSSINESS,
        specularGlossinessParams: [
          'color',
          'map',
          'lightMap',
          'lightMapIntensity',
          'aoMap',
          'aoMapIntensity',
          'emissive',
          'emissiveIntensity',
          'emissiveMap',
          'bumpMap',
          'bumpScale',
          'normalMap',
          'displacementMap',
          'displacementScale',
          'displacementBias',
          'specularMap',
          'specular',
          'glossinessMap',
          'glossiness',
          'alphaMap',
          'envMap',
          'envMapIntensity',
          'refractionRatio',
        ],
        getMaterialType: function() {
          return T.ShaderMaterial;
        },
        /**
         *
         * @param params
         * @param {JsonObject} matDef
         * @param parser
         * @returns {Promise}
         */
        extendParams: function(params, matDef, parser) {
          const pbrSpGl = matDef['extensions'][this.name];
          const shader = T.ShaderLib['standard'];
          /** @type {Object.<string,*>} */
          const uniforms = T.UniformsUtils.clone(shader.uniforms);
          const specularMapParsFragmentChunk = [
            '#ifdef USE_SPECULARMAP',
            '	uniform sampler2D specularMap;',
            '#endif',
          ].join('\n');
          const glossinessMapParsFragmentChunk = [
            '#ifdef USE_GLOSSINESSMAP',
            '	uniform sampler2D glossinessMap;',
            '#endif',
          ].join('\n');
          const specularMapFragmentChunk = [
            'vec3 specularFactor = specular;',
            '#ifdef USE_SPECULARMAP',
            '	vec4 texelSpecular = texture2D( specularMap, vUv );',
            '	texelSpecular = sRGBToLinear( texelSpecular );',
            '	// reads channel RGB, compatible with a ' +
            'glTF Specular-Glossiness (RGBA) texture',
            '	specularFactor *= texelSpecular.rgb;',
            '#endif',
          ].join('\n');
          const glossinessMapFragmentChunk = [
            'float glossinessFactor = glossiness;',
            '#ifdef USE_GLOSSINESSMAP',
            '	vec4 texelGlossiness = texture2D( glossinessMap, vUv );',
            '	// reads channel A, compatible with a ' +
            'glTF Specular-Glossiness (RGBA) texture',
            '	glossinessFactor *= texelGlossiness.a;',
            '#endif',
          ].join('\n');
          const lightPhysicalFragmentChunk = [
            'PhysicalMaterial material;',
            'material.diffuseColor = diffuseColor.rgb;',
            'material.specularRoughness = ' +
            'clamp( 1.0 - glossinessFactor, 0.04, 1.0 );',
            'material.specularColor = specularFactor.rgb;',
          ].join('\n');
          const fragmentShader = shader.fragmentShader
              .replace('#include <specularmap_fragment>', '')
              .replace('uniform float roughness;', 'uniform vec3 specular;')
              .replace('uniform float metalness;', 'uniform float glossiness;')
              .replace(
                  '#include <roughnessmap_pars_fragment>',
                  specularMapParsFragmentChunk
              )
              .replace(
                  '#include <metalnessmap_pars_fragment>',
                  glossinessMapParsFragmentChunk
              )
              .replace(
                  '#include <roughnessmap_fragment>',
                  specularMapFragmentChunk
              )
              .replace(
                  '#include <metalnessmap_fragment>',
                  glossinessMapFragmentChunk
              )
              .replace(
                  '#include <lights_physical_fragment>',
                  lightPhysicalFragmentChunk
              );
          delete uniforms['roughness'];
          delete uniforms['metalness'];
          delete uniforms['roughnessMap'];
          delete uniforms['metalnessMap'];
          uniforms.specular = {value: new T.Color().setHex(0x111111)};
          uniforms.glossiness = {value: 0.5};
          uniforms.specularMap = {value: null};
          uniforms.glossinessMap = {value: null};
          params.vertexShader = shader.vertexShader;
          params.fragmentShader = fragmentShader;
          params.uniforms = uniforms;
          params.defines = {'STANDARD': ''};
          params.color = new T.Color(1.0, 1.0, 1.0);
          params.opacity = 1.0;
          const pending = [];
          if (Array.isArray(pbrSpGl['diffuseFactor'])) {
            const array = pbrSpGl['diffuseFactor'];
            params.color.fromArray(array);
            params.opacity = array[3];
          }
          if (pbrSpGl['diffuseTexture'] !== undefined) {
            pending.push(parser.assignTexture(params, 'map',
                pbrSpGl['diffuseTexture']['index']));
          }
          params.emissive = new T.Color(0.0, 0.0, 0.0);
          params.glossiness = pbrSpGl['glossinessFactor'] !== undefined
            ? pbrSpGl['glossinessFactor']
            : 1.0;
          params.specular = new T.Color(1.0, 1.0, 1.0);
          if (Array.isArray(pbrSpGl['specularFactor'])) {
            params.specular.fromArray(pbrSpGl['specularFactor']);
          }
          if (pbrSpGl['specularGlossinessTexture'] !== undefined) {
            const specGlossIndex = pbrSpGl
                ['specularGlossinessTexture']['index'];
            pending.push(parser.assignTexture(
                params, 'glossinessMap', specGlossIndex));
            pending.push(parser.assignTexture(
                params, 'specularMap', specGlossIndex));
          }
          return Promise.all(pending);
        },
        createMaterial: function(params) {
          // setup material properties based on MeshStandardMaterial for Specular-Glossiness
          const material = new T.ShaderMaterial({
            defines: params.defines,
            vertexShader: params.vertexShader,
            fragmentShader: params.fragmentShader,
            uniforms: params.uniforms,
            fog: true,
            lights: true,
            opacity: params.opacity,
            transparent: params.transparent,
          });
          material.isGLTFSpecularGlossinessMaterial = true;
          material.color = params.color;
          material.map = params.map === undefined ? null : params.map;
          material.lightMap = null;
          material.lightMapIntensity = 1.0;
          material.aoMap = params.aoMap === undefined ? null : params.aoMap;
          material.aoMapIntensity = 1.0;
          material.emissive = params.emissive;
          material.emissiveIntensity = 1.0;
          material.emissiveMap = params.emissiveMap === undefined
            ? null : params.emissiveMap;
          material.bumpMap = params.bumpMap === undefined
            ? null : params.bumpMap;
          material.bumpScale = 1;
          material.normalMap = params.normalMap === undefined
            ? null : params.normalMap;
          if (params.normalScale) {material.normalScale = params.normalScale;}
          material.displacementMap = null;
          material.displacementScale = 1;
          material.displacementBias = 0;
          material.specularMap = params.specularMap === undefined
            ? null : params.specularMap;
          material.specular = params.specular;
          material.glossinessMap = params.glossinessMap === undefined
            ? null : params.glossinessMap;
          material.glossiness = params.glossiness;
          material.alphaMap = null;
          material.envMap = params.envMap === undefined ? null : params.envMap;
          material.envMapIntensity = 1.0;
          material.refractionRatio = 0.98;
          material.extensions.derivatives = true;
          return material;
        },
        cloneMaterial: function(source) {
          const target = source.clone();
          target.isGLTFSpecularGlossinessMaterial = true;
          const params = this.specularGlossinessParams;
          for (let i = 0, il = params.length; i < il; i++) {
            target[params[i]] = source[params[i]];
          }
          return target;
        },
        // Here's based on refreshUniformsCommon() and refreshUniformsStandard() in WebGLRenderer.
        refreshUniforms(renderer, scene, camera, geometry, material) {
          if (material.isGLTFSpecularGlossinessMaterial !== true) {
            return;
          }
          /** @type {Object.<string, THREE.Uniform>} */
          const ufs = material.uniforms;
          const defs = material.defines;
          ufs['opacity'].value = material.opacity;
          ufs['diffuse'].value.copy(material.color);
          ufs['emissive'].value.copy(material.emissive)
              .multiplyScalar(material.emissiveIntensity);
          ufs['map'].value = material.map;
          ufs['specularMap'].value = material.specularMap;
          ufs['alphaMap'].value = material.alphaMap;
          ufs['lightMap'].value = material.lightMap;
          ufs['lightMapIntensity'].value = material.lightMapIntensity;
          ufs['aoMap'].value = material.aoMap;
          ufs['aoMapIntensity'].value = material.aoMapIntensity;
          // uv repeat and offset setting priorities
          // 1. color map
          // 2. specular map
          // 3. normal map
          // 4. bump map
          // 5. alpha map
          // 6. emissive map
          let uvScaleMap;
          if (material.map) {
            uvScaleMap = material.map;
          } else if (material.specularMap) {
            uvScaleMap = material.specularMap;
          } else if (material.displacementMap) {
            uvScaleMap = material.displacementMap;
          } else if (material.normalMap) {
            uvScaleMap = material.normalMap;
          } else if (material.bumpMap) {
            uvScaleMap = material.bumpMap;
          } else if (material.glossinessMap) {
            uvScaleMap = material.glossinessMap;
          } else if (material.alphaMap) {
            uvScaleMap = material.alphaMap;
          } else if (material.emissiveMap) {
            uvScaleMap = material.emissiveMap;
          }
          if (uvScaleMap !== undefined) {
            // backwards compatibility
            if (uvScaleMap.isWebGLRenderTarget) {
              uvScaleMap = uvScaleMap.texture;
            }
            let offset;
            let repeat;
            if (uvScaleMap.matrix !== undefined) {
              // > r88.
              if (uvScaleMap.matrixAutoUpdate === true) {
                offset = uvScaleMap.offset;
                repeat = uvScaleMap.repeat;
                const rotation = uvScaleMap.rotation;
                const center = uvScaleMap.center;
                uvScaleMap.matrix.setUvTransform(
                    offset.x, offset.y,
                    repeat.x, repeat.y,
                    rotation,
                    center.x, center.y
                );
              }
              ufs['uvTransform'].value.copy(uvScaleMap.matrix);
            } else {
              // <= r87. Remove when reasonable.
              offset = uvScaleMap.offset;
              repeat = uvScaleMap.repeat;
              ufs['offsetRepeat'].value
                  .set(offset.x, offset.y, repeat.x, repeat.y);
            }
          }
          ufs['envMap'].value = material.envMap;
          ufs['envMapIntensity'].value = material.envMapIntensity;
          ufs['flipEnvMap'].value =
              (material.envMap && material.envMap.isCubeTexture) ? -1 : 1;
          ufs['refractionRatio'].value = material.refractionRatio;
          ufs['specular'].value.copy(material.specular);
          ufs['glossiness'].value = material.glossiness;
          ufs['glossinessMap'].value = material.glossinessMap;
          ufs['emissiveMap'].value = material.emissiveMap;
          ufs['bumpMap'].value = material.bumpMap;
          ufs['normalMap'].value = material.normalMap;
          ufs['displacementMap'].value = material.displacementMap;
          ufs['displacementScale'].value = material.displacementScale;
          ufs['displacementBias'].value = material.displacementBias;
          if (ufs['glossinessMap'].value !== null &&
              defs.USE_GLOSSINESSMAP === undefined) {
            defs.USE_GLOSSINESSMAP = '';
            // set USE_ROUGHNESSMAP to enable vUv
            defs.USE_ROUGHNESSMAP = '';
          }
          if (ufs['glossinessMap'].value === null &&
              defs.USE_GLOSSINESSMAP !== undefined) {
            delete defs.USE_GLOSSINESSMAP;
            delete defs.USE_ROUGHNESSMAP;
          }
        },
      };
    }
    /*********************************/
    /********** INTERPOLATION ********/
    /*********************************/
    // Spline Interpolation
    // Specification: https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#appendix-c-spline-interpolation

    class GLTFCubicSplineInterpolant extends THREE.Interpolant {}

    GLTFCubicSplineInterpolant.prototype.interpolate_ =
        function(i1, t0, t, t1) {
          const result = this.resultBuffer;
          const values = this.sampleValues;
          const stride = this.valueSize;
          const stride2 = stride * 2;
          const stride3 = stride * 3;
          const td = t1 - t0;
          const p = (t - t0) / td;
          const pp = p * p;
          const ppp = pp * p;
          const offset1 = i1 * stride3;
          const offset0 = offset1 - stride3;
          const s0 = 2 * ppp - 3 * pp + 1;
          const s1 = ppp - 2 * pp + p;
          const s2 = -2 * ppp + 3 * pp;
          const s3 = ppp - pp;
          // Layout of keyframe output values for CUBICSPLINE animations:
          //   [ inTangent_1, splineVertex_1, outTangent_1, inTangent_2, splineVertex_2, ... ]
          for (let i = 0; i !== stride; i++) {
            const p0 = values[offset0 + i + stride]; // splineVertex_k
            const m0 = values[offset0 + i + stride2] * td; // outTangent_k * (t_k+1 - t_k)
            const p1 = values[offset1 + i + stride]; // splineVertex_k+1
            const m1 = values[offset1 + i] * td; // inTangent_k+1 * (t_k+1 - t_k)
            result[i] = s0 * p0 + s1 * m0 + s2 * p1 + s3 * m1;
          }
          return result;
        };
    /*********************************/
    /********** INTERNALS ************/
    /*********************************/
    /* CONSTANTS */
    const WEBGL_CONSTANTS = {
      FLOAT: 5126,
      //FLOAT_MAT2: 35674,
      FLOAT_MAT3: 35675,
      FLOAT_MAT4: 35676,
      FLOAT_VEC2: 35664,
      FLOAT_VEC3: 35665,
      FLOAT_VEC4: 35666,
      LINEAR: 9729,
      REPEAT: 10497,
      SAMPLER_2D: 35678,
      POINTS: 0,
      LINES: 1,
      LINE_LOOP: 2,
      LINE_STRIP: 3,
      TRIANGLES: 4,
      TRIANGLE_STRIP: 5,
      TRIANGLE_FAN: 6,
      UNSIGNED_BYTE: 5121,
      UNSIGNED_SHORT: 5123,
    };
    /*
    const WEBGL_TYPE = {
      5126: Number,
      //35674: T.Matrix2,
      35675: T.Matrix3,
      35676: T.Matrix4,
      35664: T.Vector2,
      35665: T.Vector3,
      35666: T.Vector4,
      35678: T.Texture,
    };
  */
    const WEBGL_COMPONENT_TYPES = {
      5120: Int8Array,
      5121: Uint8Array,
      5122: Int16Array,
      5123: Uint16Array,
      5125: Uint32Array,
      5126: Float32Array,
    };
    const WEBGL_FILTERS = {
      9728: T.NearestFilter,
      9729: T.LinearFilter,
      9984: T.NearestMipMapNearestFilter,
      9985: T.LinearMipMapNearestFilter,
      9986: T.NearestMipMapLinearFilter,
      9987: T.LinearMipMapLinearFilter,
    };
    const WEBGL_WRAPPINGS = {
      33071: T.ClampToEdgeWrapping,
      33648: T.MirroredRepeatWrapping,
      10497: T.RepeatWrapping,
    };
    const WGL_TEX_FORMAT = {
      6406: T.AlphaFormat,
      6407: T.RGBFormat,
      6408: T.RGBAFormat,
      6409: T.LuminanceFormat,
      6410: T.LuminanceAlphaFormat,
    };
    const WEBGL_TEXTURE_DATATYPES = {
      5121: T.UnsignedByteType,
      32819: T.UnsignedShort4444Type,
      32820: T.UnsignedShort5551Type,
      33635: T.UnsignedShort565Type,
    };
    /*
    const WEBGL_SIDES = {
      1028: T.BackSide, // Culling front
      1029: T.FrontSide, // Culling back
    //1032: T.NoSide   // Culling front and back, what to do?
    };
    const WEBGL_DEPTH_FUNCS = {
      512: T.NeverDepth,
      513: T.LessDepth,
      514: T.EqualDepth,
      515: T.LessEqualDepth,
      516: T.GreaterEqualDepth,
      517: T.NotEqualDepth,
      518: T.GreaterEqualDepth,
      519: T.AlwaysDepth,
    };
    const WEBGL_BLEND_EQUATIONS = {
      32774: T.AddEquation,
      32778: T.SubtractEquation,
      32779: T.ReverseSubtractEquation,
    };
    const WEBGL_BLEND_FUNCS = {
      0: T.ZeroFactor,
      1: T.OneFactor,
      768: T.SrcColorFactor,
      769: T.OneMinusSrcColorFactor,
      770: T.SrcAlphaFactor,
      771: T.OneMinusSrcAlphaFactor,
      772: T.DstAlphaFactor,
      773: T.OneMinusDstAlphaFactor,
      774: T.DstColorFactor,
      775: T.OneMinusDstColorFactor,
      776: T.SrcAlphaSaturateFactor,
    // The followings are not supported by Three.js yet
    //32769: CONSTANT_COLOR,
    //32770: ONE_MINUS_CONSTANT_COLOR,
    //32771: CONSTANT_ALPHA,
    //32772: ONE_MINUS_CONSTANT_COLOR
    };
  */
    const WEBGL_TYPE_SIZES = {
      'SCALAR': 1,
      'VEC2': 2,
      'VEC3': 3,
      'VEC4': 4,
      'MAT2': 4,
      'MAT3': 9,
      'MAT4': 16,
    };
    const ATTRS = {
      POSITION: 'position',
      NORMAL: 'normal',
      TEXCOORD_0: 'uv',
      TEXCOORD0: 'uv', // deprecated
      TEXCOORD: 'uv', // deprecated
      TEXCOORD_1: 'uv2',
      COLOR_0: 'color',
      COLOR0: 'color', // deprecated
      COLOR: 'color', // deprecated
      WEIGHTS_0: 'skinWeight',
      WEIGHT: 'skinWeight', // deprecated
      JOINTS_0: 'skinIndex',
      JOINT: 'skinIndex', // deprecated
    };
    const PATH_PROPERTIES = {
      scale: 'scale',
      translation: 'position',
      rotation: 'quaternion',
      weights: 'morphTargetInfluences',
    };
    const INTERPOLATION = {
      CUBICSPLINE: T.InterpolateSmooth, // We use custom interpolation GLTFCubicSplineInterpolation for CUBICSPLINE.
      // KeyframeTrack.optimize() can't handle glTF Cubic Spline output values layout,
      // using T.InterpolateSmooth for KeyframeTrack instantiation to prevent optimization.
      // See KeyframeTrack.optimize() for the detail.
      LINEAR: T.InterpolateLinear,
      STEP: T.InterpolateDiscrete,
    };
    /*
    const STATES_ENABLES = {
      2884: 'CULL_FACE',
      2929: 'DEPTH_TEST',
      3042: 'BLEND',
      3089: 'SCISSOR_TEST',
      32823: 'POLYGON_OFFSET_FILL',
      32926: 'SAMPLE_ALPHA_TO_COVERAGE',
    };
  */
    const ALPHA_MODES = {
      OPAQUE: 'OPAQUE',
      MASK: 'MASK',
      BLEND: 'BLEND',
    };

    /**
     * Specification: https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#default-material
     */
    function createDefaultMaterial() {
      return new T.MeshStandardMaterial({
        color: 0xFFFFFF,
        emissive: 0x000000,
        metalness: 1,
        roughness: 1,
        transparent: false,
        depthTest: true,
        side: T.FrontSide,
      });
    }

    /**
     * @param {THREE.Mesh} mesh
     * @param {JsonObject} meshDef
     * @param {JsonObject} primitiveDef
     * @param accessors
     */
    function addMorphTargets(mesh, meshDef, primitiveDef, accessors) {
      const geometry = mesh.geometry;
      const material = mesh.material;
      const targets = primitiveDef['targets'];
      const morphAttributes = geometry.morphAttributes;
      morphAttributes.position = [];
      morphAttributes.normal = [];
      material.morphTargets = true;
      for (let i = 0, il = targets.length; i < il; i++) {
        const target = targets[i];
        const attributeName = 'morphTarget' + i;
        let positionAttribute, normalAttribute;
        if (target.POSITION !== undefined) {
          // Three.js morph formula is
          //   position
          //     + weight0 * ( morphTarget0 - position )
          //     + weight1 * ( morphTarget1 - position )
          //     ...
          // while the glTF one is
          //   position
          //     + weight0 * morphTarget0
          //     + weight1 * morphTarget1
          //     ...
          // then adding position to morphTarget.
          // So morphTarget value will depend on mesh's position, then cloning attribute
          // for the case if attribute is shared among two or more meshes.
          positionAttribute = cloneBufferAttribute(accessors[target.POSITION]);
          const position = geometry.attributes.position;
          for (let j = 0, jl = positionAttribute.count; j < jl; j++) {
            positionAttribute.setXYZ(
                j,
                positionAttribute.getX(j) + position.getX(j),
                positionAttribute.getY(j) + position.getY(j),
                positionAttribute.getZ(j) + position.getZ(j)
            );
          }
        } else if (geometry.attributes.position) {
          // Copying the original position not to affect the final position.
          // See the formula above.
          positionAttribute = cloneBufferAttribute(
              geometry.attributes.position
          );
        }
        if (positionAttribute !== undefined) {
          positionAttribute.name = attributeName;
          morphAttributes.position.push(positionAttribute);
        }
        if (target.NORMAL !== undefined) {
          material.morphNormals = true;
          // see target.POSITION's comment
          normalAttribute = cloneBufferAttribute(accessors[target.NORMAL]);
          const normal = geometry.attributes.normal;
          for (let j = 0, jl = normalAttribute.count; j < jl; j++) {
            normalAttribute.setXYZ(
                j,
                normalAttribute.getX(j) + normal.getX(j),
                normalAttribute.getY(j) + normal.getY(j),
                normalAttribute.getZ(j) + normal.getZ(j)
            );
          }
        } else if (geometry.attributes.normal !== undefined) {
          normalAttribute = cloneBufferAttribute(geometry.attributes.normal);
        }
        if (normalAttribute !== undefined) {
          normalAttribute.name = attributeName;
          morphAttributes.normal.push(normalAttribute);
        }
      }
      mesh.updateMorphTargets();
      if (meshDef['weights'] !== undefined) {
        for (let i = 0, il = meshDef['weights'].length; i < il; i++) {
          mesh.morphTargetInfluences[i] = meshDef['weights'][i];
        }
      }
      // .extras has user-defined data, so check that .extras.targetNames is an array.
      if (meshDef['extras'] &&
          Array.isArray(meshDef['extras']['targetNames'])) {
        const il = meshDef['extras']['targetNames'].length;
        for (let i = 0; i < il; i++) {
          mesh.morphTargetDictionary[meshDef['extras']['targetNames'][i]] = i;
        }
      }
    }

    /**
     * @param {JsonObject} a
     * @param {JsonObject} b
     * @returns {boolean}
     */
    function isPrimitiveEqual(a, b) {
      if (a['indices'] !== b['indices']) {
        return false;
      }
      const attribA = a['attributes'] || {};
      const attribB = b['attributes'] || {};
      const keysA = Object.keys(attribA);
      const keysB = Object.keys(attribB);
      if (keysA.length !== keysB.length) {
        return false;
      }
      for (let i = 0, il = keysA.length; i < il; i++) {
        const key = keysA[i];
        if (attribA[key] !== attribB[key]) {
          return false;
        }
      }
      return true;
    }

    function getCachedGeometry(cache, newPrimitive) {
      for (let i = 0, il = cache.length; i < il; i++) {
        const cached = cache[i];
        if (isPrimitiveEqual(cached.primitive, newPrimitive)) {
          return cached.promise;
        }
      }
      return null;
    }

    /**
     * @param {THREE.BufferAttribute|THREE.InterleavedBufferAttribute} attribute
     * @returns {THREE.BufferAttribute}
     */
    function cloneBufferAttribute(attribute) {
      if (attribute.isInterleavedBufferAttribute) {
        const count = attribute.count;
        const itemSize = attribute.itemSize;
        const array = attribute.array.slice(0, count * itemSize);
        for (let i = 0; i < count; ++i) {
          array[i] = attribute.getX(i);
          if (itemSize >= 2) {array[i + 1] = attribute.getY(i);}
          if (itemSize >= 3) {array[i + 2] = attribute.getZ(i);}
          if (itemSize >= 4) {array[i + 3] = attribute.getW(i);}
        }
        return new T.BufferAttribute(array, itemSize, attribute.normalized);
      }
      return attribute.clone();
    }
    /* GLTF PARSER */
    /** @unrestricted */
    class GLTFParser {
      constructor(json, extensions, options) {
        /** @type {JsonObject} */
        this.json = json || dict({});
        /** @type {Object.<string,*>} */
        this.extensions = extensions || {};
        this.options = options || {};
        // loader object cache
        this.cache = GLTFRegistry();
        // BufferGeometry caching
        this.primitiveCache = [];
        this.textureLoader = new T.TextureLoader(this.options.manager);
        this.textureLoader.setCrossOrigin(this.options.crossOrigin);
        this.fileLoader = new T.FileLoader(this.options.manager);
        this.fileLoader.setResponseType('arraybuffer');
      }
    }

    GLTFParser.prototype.parse = function(onLoad, onError) {
      const json = this.json;
      // Clear the loader cache
      this.cache.removeAll();
      // Mark the special nodes/meshes in json for efficient parse
      this.markDefs();
      // Fire the callback on complete
      this.getMultiDependencies([
        'scene',
        'animation',
        'camera',
      ]).then(function(dependencies) {
        const scenes = dependencies.scenes || [];
        const scene = scenes[json['scene'] || 0];
        const animations = dependencies.animations || [];
        const asset = json['asset'];
        const cameras = dependencies.cameras || [];
        onLoad(scene, scenes, cameras, animations, asset);
      }).catch(onError);
    };
    /**
     * Marks the special nodes/meshes in json for efficient parse.
     */
    GLTFParser.prototype.markDefs = function() {
      const nodeDefs = this.json['nodes'] || [];
      const skinDefs = this.json['skins'] || [];
      const meshDefs = this.json['meshes'] || [];
      const meshReferences = {};
      const meshUses = {};
      // Nothing in the node definition indicates whether it is a Bone or an
      // Object3D. Use the skins' joint references to mark bones.
      for (let skinIndex = 0, skinLength = skinDefs.length;
        skinIndex < skinLength;
        skinIndex++) {
        const joints = skinDefs[skinIndex].joints;
        for (let i = 0, il = joints.length; i < il; i++) {
          nodeDefs[joints[i]].isBone = true;
        }
      }
      // Meshes can (and should) be reused by multiple nodes in a glTF asset. To
      // avoid having more than one T.Mesh with the same name, count
      // references and rename instances below.
      //
      // Example: CesiumMilkTruck sample model reuses "Wheel" meshes.
      for (let nodeIndex = 0, nodeLength = nodeDefs.length;
        nodeIndex < nodeLength; nodeIndex++) {
        /** @type {JsonObject} */
        const nodeDef = nodeDefs[nodeIndex];
        if (nodeDef['mesh'] !== undefined) {
          if (meshReferences[nodeDef['mesh']] === undefined) {
            meshReferences[nodeDef['mesh']] = meshUses[nodeDef['mesh']] = 0;
          }
          meshReferences[nodeDef['mesh']]++;
          // Nothing in the mesh definition indicates whether it is
          // a SkinnedMesh or Mesh. Use the node's mesh reference
          // to mark SkinnedMesh if node has skin.
          if (nodeDef['skin'] !== undefined) {
            meshDefs[nodeDef['mesh']]['isSkinnedMesh'] = true;
          }
        }
      }
      this.json['meshReferences'] = meshReferences;
      this.json['meshUses'] = meshUses;
    };
    GLTFParser.prototype.getDependency = function(type, index) {
      const cacheKey = type + ':' + index;
      let dependency = this.cache.get(cacheKey);
      if (!dependency) {
        const fnName = 'load' + type.charAt(0).toUpperCase() + type.slice(1);
        dependency = this[fnName](index);
        this.cache.add(cacheKey, dependency);
      }
      return dependency;
    };
    GLTFParser.prototype.getDependencies = function(type) {
      let dependencies = this.cache.get(type);
      if (!dependencies) {
        const parser = this;
        const defs = this.json[type + (type === 'mesh' ? 'es' : 's')] || [];
        dependencies = Promise.all(defs.map(function(def, index) {
          return parser.getDependency(type, index);
        }));
        this.cache.add(type, dependencies);
      }
      return dependencies;
    };

    /**
     * @param types
     * @returns {Promise<Object.<string,*>>}
     */
    GLTFParser.prototype.getMultiDependencies = function(types) {
      const results = {};
      const pendings = [];
      for (let i = 0, il = types.length; i < il; i++) {
        const type = types[i];
        let value = this.getDependencies(type);
        value = value.then(function(key, value) {
          results[key] = value;
        }.bind(this, type + (type === 'mesh' ? 'es' : 's')));
        pendings.push(value);
      }
      return Promise.all(pendings).then(function() {
        return results;
      });
    };
    GLTFParser.prototype.loadBuffer = function(bufferIndex) {
      const bufferDef = this.json['buffers'][bufferIndex];
      const loader = this.fileLoader;
      if (bufferDef.type && bufferDef.type !== 'arraybuffer') {
        throw new Error(
            'THREE.GLTFLoader: ' + bufferDef.type +
            ' buffer type is not supported.'
        );
      }
      // If present, GLB container is required to be the first buffer.
      if (bufferDef.uri === undefined && bufferIndex === 0) {
        return Promise.resolve(this.extensions[XT.KHR_BINARY_GLTF].body);
      }
      const options = this.options;
      return new Promise(function(resolve, reject) {
        loader.load(
            resolveURL(bufferDef.uri, options.path), resolve, undefined,
            function() {
              reject(new Error(
                  'THREE.GLTFLoader: Failed to load buffer "'
                  + bufferDef.uri + '".'
              ));
            }
        );
      });
    };
    GLTFParser.prototype.loadBufferView = function(bufferViewIndex) {
      const bufferViewDef = this.json['bufferViews'][bufferViewIndex];
      return this.getDependency('buffer', bufferViewDef.buffer)
          .then(function(buffer) {
            const byteLength = bufferViewDef.byteLength || 0;
            const byteOffset = bufferViewDef.byteOffset || 0;
            return buffer.slice(byteOffset, byteOffset + byteLength);
          });
    };
    GLTFParser.prototype.loadAccessor = function(accessorIndex) {
      const parser = this;
      /** @type {JsonObject} */
      const json = this.json;
      const accessorDef = json['accessors'][accessorIndex];
      if (accessorDef['bufferView'] === undefined &&
          accessorDef['sparse'] === undefined) {
        // Ignore empty accessors, which may be used to declare runtime
        // information about attributes coming from another source (e.g. Draco
        // compression extension).
        return null;
      }
      const pendingBufferViews = [];
      if (accessorDef['bufferView'] !== undefined) {
        pendingBufferViews.push(
            this.getDependency('bufferView', accessorDef['bufferView'])
        );
      } else {
        pendingBufferViews.push(null);
      }
      if (accessorDef['sparse'] !== undefined) {
        pendingBufferViews.push(
            this.getDependency(
                'bufferView',
                accessorDef['sparse']['indices']['bufferView']
            )
        );
        pendingBufferViews.push(
            this.getDependency(
                'bufferView',
                accessorDef['sparse']['values']['bufferView']
            )
        );
      }
      return Promise.all(pendingBufferViews).then(function(bufferViews) {
        const bufferView = bufferViews[0];
        const itemSize = WEBGL_TYPE_SIZES[accessorDef['type']];
        const TypedArray = WEBGL_COMPONENT_TYPES[accessorDef['componentType']];
        // For VEC3: itemSize is 3, elementBytes is 4, itemBytes is 12.
        const elementBytes = TypedArray.BYTES_PER_ELEMENT;
        const itemBytes = elementBytes * itemSize;
        const byteOffset = accessorDef['byteOffset'] || 0;
        const byteStride =
            json['bufferViews'][accessorDef['bufferView']]['byteStride'];
        const normalized = accessorDef['normalized'] === true;
        let array, bufferAttribute;
        // The buffer is not interleaved if the stride is the item size in bytes.
        if (byteStride && byteStride !== itemBytes) {
          const ibCacheKey = 'InterleavedBuffer:' +
              accessorDef['bufferView'] +
              ':' +
              accessorDef['componentType'];
          let ib = parser.cache.get(ibCacheKey);
          if (!ib) {
            // Use the full buffer if it's interleaved.
            array = new TypedArray(bufferView);
            // Integer parameters to IB/IBA are in array elements, not bytes.
            ib = new T.InterleavedBuffer(array, byteStride / elementBytes);
            parser.cache.add(ibCacheKey, ib);
          }
          bufferAttribute = new T.InterleavedBufferAttribute(
              ib, itemSize, byteOffset / elementBytes, normalized
          );
        } else {
          if (bufferView === null) {
            array = new TypedArray(accessorDef['count'] * itemSize);
          } else {
            array = new TypedArray(
                bufferView, byteOffset, accessorDef['count'] * itemSize
            );
          }
          bufferAttribute = new T.BufferAttribute(array, itemSize, normalized);
        }
        // https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#sparse-accessors
        if (accessorDef['sparse'] !== undefined) {
          const itemSizeIndices = WEBGL_TYPE_SIZES.SCALAR;
          const TypedArrayIndices = WEBGL_COMPONENT_TYPES[
              accessorDef['sparse']['indices']['componentType']
          ];
          const byteOffsetIndices =
              accessorDef['sparse']['indices']['byteOffset'] || 0;
          const byteOffsetValues =
              accessorDef['sparse']['values']['byteOffset'] || 0;
          const sparseIndices = new TypedArrayIndices(
              bufferViews[1], byteOffsetIndices,
              accessorDef['sparse']['count'] * itemSizeIndices
          );
          const sparseValues = new TypedArray(
              bufferViews[2], byteOffsetValues,
              accessorDef['sparse']['count'] * itemSize
          );
          if (bufferView !== null) {
            // Avoid modifying the original ArrayBuffer, if the bufferView wasn't initialized with zeroes.
            bufferAttribute.setArray(bufferAttribute.array.slice());
          }
          for (let i = 0, il = sparseIndices.length; i < il; i++) {
            const index = sparseIndices[i];
            bufferAttribute.setX(index, sparseValues[i * itemSize]);
            if (itemSize >= 2) {
              bufferAttribute.setY(index, sparseValues[i * itemSize + 1]);
            }
            if (itemSize >= 3) {
              bufferAttribute.setZ(index, sparseValues[i * itemSize + 2]);
            }
            if (itemSize >= 4) {
              bufferAttribute.setW(index, sparseValues[i * itemSize + 3]);
            }
            if (itemSize >= 5) {
              throw new Error(
                  'THREE.GLTFLoader: ' +
                  'Unsupported itemSize in sparse BufferAttribute.'
              );
            }
          }
        }
        return bufferAttribute;
      });
    };
    GLTFParser.prototype.loadTexture = function(textureIndex) {
      const parser = this;
      /** @type {JsonObject} */
      const json = this.json;
      const options = this.options;
      const textureLoader = this.textureLoader;
      const URL = global.URL || global.webkitURL;
      const textureDef = json['textures'][textureIndex];
      const source = json['images'][textureDef.source];
      let sourceURI = source['uri'];
      let isObjectURL = false;
      if (source['bufferView'] !== undefined) {
        // Load binary image data from bufferView, if provided.
        sourceURI = parser
            .getDependency('bufferView', source['bufferView'])
            .then(function(bufferView) {
              isObjectURL = true;
              const blob = new Blob([bufferView], {type: source['mimeType']});
              sourceURI = URL.createObjectURL(blob);
              return sourceURI;
            });
      }
      return Promise.resolve(sourceURI).then(function(sourceURI) {
        // Load Texture resource.
        const loader = T.Loader.Handlers.get(sourceURI) || textureLoader;
        return new Promise(function(resolve, reject) {
          loader.load(
              resolveURL(sourceURI, options.path),
              resolve,
              undefined,
              reject
          );
        });
      }).then(function(texture) {
        // Clean up resources and configure Texture.
        if (isObjectURL === true) {
          URL.revokeObjectURL(sourceURI);
        }
        texture.flipY = false;
        if (textureDef['name'] !== undefined) {
          texture.name = textureDef['name'];
        }
        texture.format = textureDef['format'] !== undefined
          ? WGL_TEX_FORMAT[textureDef['format']] : T.RGBAFormat;
        if (textureDef['internalFormat'] !== undefined &&
            texture.format !== WGL_TEX_FORMAT[textureDef['internalFormat']]) {
          console.warn(
              'THREE.GLTFLoader: Three.js does not support texture ' +
              'internalFormat which is different from texture format. ' +
              'internalFormat will be forced to be the same value as format.'
          );
        }
        texture.type = textureDef['type'] !== undefined
          ? WEBGL_TEXTURE_DATATYPES[textureDef['type']] : T.UnsignedByteType;
        const samplers = json['samplers'] || {};
        const sampler = samplers[textureDef['sampler']] || {};
        texture.magFilter = WEBGL_FILTERS[sampler.magFilter] || T.LinearFilter;
        texture.minFilter =
            WEBGL_FILTERS[sampler.minFilter] || T.LinearMipMapLinearFilter;
        texture.wrapS = WEBGL_WRAPPINGS[sampler.wrapS] || T.RepeatWrapping;
        texture.wrapT = WEBGL_WRAPPINGS[sampler.wrapT] || T.RepeatWrapping;
        return texture;
      });
    };
    /**
     * Asynchronously assigns a texture to the given material parameters.
     * @param {Object} materialParams
     * @param {string} textureName
     * @param {number} textureIndex
     * @return {Promise}
     */
    GLTFParser.prototype.assignTexture =
        function(materialParams, textureName, textureIndex) {
          return this.getDependency('texture', textureIndex)
              .then(function(texture) {
                materialParams[textureName] = texture;
              });
        };
    GLTFParser.prototype.loadMaterial = function(materialIndex) {
      const parser = this;
      const xts = this.extensions;
      /** @type {JsonObject} */
      const matDef = this.json['materials'][materialIndex];
      let matType;
      const matParams = {};
      const materialExtensions = matDef['extensions'] || {};
      const pending = [];
      if (materialExtensions[XT.KHR_MATERIALS_PBR_SPECULAR_GLOSSINESS]) {
        const sgXt = xts[XT.KHR_MATERIALS_PBR_SPECULAR_GLOSSINESS];
        matType = sgXt.getMaterialType(matDef);
        pending.push(sgXt.extendParams(matParams, matDef, parser));
      } else if (materialExtensions[XT.KHR_MATERIALS_UNLIT]) {
        const kmuExtension = xts[XT.KHR_MATERIALS_UNLIT];
        matType = kmuExtension.getMaterialType(matDef);
        pending.push(
            kmuExtension.extendParams(matParams, matDef, parser)
        );
      } else {
        // Specification:
        // https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#metallic-roughness-material
        matType = T.MeshStandardMaterial;
        /** @type {JsonObject} */
        const metallicRoughness = matDef['pbrMetallicRoughness'] || dict({});
        matParams.color = new T.Color(1.0, 1.0, 1.0);
        matParams.opacity = 1.0;
        if (Array.isArray(metallicRoughness['baseColorFactor'])) {
          const array = metallicRoughness['baseColorFactor'];
          matParams.color.fromArray(array);
          matParams.opacity = array[3];
        }
        if (metallicRoughness['baseColorTexture'] !== undefined) {
          pending.push(
              parser.assignTexture(
                  matParams,
                  'map',
                  metallicRoughness['baseColorTexture']['index']
              )
          );
        }
        matParams.metalness =
            metallicRoughness['metallicFactor'] !== undefined
              ? metallicRoughness['metallicFactor']
              : 1.0;
        matParams.roughness = metallicRoughness['roughnessFactor'] !== undefined
          ? metallicRoughness['roughnessFactor']
          : 1.0;
        if (metallicRoughness['metallicRoughnessTexture'] !== undefined) {
          const textureIndex =
              metallicRoughness['metallicRoughnessTexture']['index'];
          pending.push(
              parser.assignTexture(
                  matParams, 'metalnessMap', textureIndex
              )
          );
          pending.push(
              parser.assignTexture(
                  matParams, 'roughnessMap', textureIndex
              )
          );
        }
      }
      if (matDef['doubleSided'] === true) {
        matParams.side = T.DoubleSide;
      }
      const alphaMode = matDef['alphaMode'] || ALPHA_MODES.OPAQUE;
      if (alphaMode === ALPHA_MODES.BLEND) {
        matParams.transparent = true;
      } else {
        matParams.transparent = false;
        if (alphaMode === ALPHA_MODES.MASK) {
          matParams.alphaTest = matDef['alphaCutoff'] !== undefined
            ? matDef['alphaCutoff']
            : 0.5;
        }
      }
      if (matDef['normalTexture'] !== undefined &&
          matType !== T.MeshBasicMaterial) {
        pending.push(
            parser.assignTexture(
                matParams,
                'normalMap',
                matDef['normalTexture']['index']
            )
        );
        matParams.normalScale = new T.Vector2(1, 1);
        if (matDef['normalTexture']['scale'] !== undefined) {
          matParams.normalScale.set(
              matDef['normalTexture']['scale'],
              matDef['normalTexture']['scale']
          );
        }
      }
      if (matDef['occlusionTexture'] !== undefined &&
          matType !== T.MeshBasicMaterial) {
        pending.push(
            parser.assignTexture(
                matParams,
                'aoMap',
                matDef['occlusionTexture']['index']
            )
        );
        if (matDef['occlusionTexture']['strength'] !== undefined) {
          matParams.aoMapIntensity = matDef['occlusionTexture']['strength'];
        }
      }
      if (matDef['emissiveFactor'] !== undefined &&
          matType !== T.MeshBasicMaterial) {
        matParams.emissive = new T.Color().fromArray(matDef['emissiveFactor']);
      }
      if (matDef['emissiveTexture'] !== undefined &&
          matType !== T.MeshBasicMaterial) {
        pending.push(
            parser.assignTexture(
                matParams,
                'emissiveMap',
                matDef['emissiveTexture']['index']
            )
        );
      }
      return Promise.all(pending).then(function() {
        let material;
        if (matType === T.ShaderMaterial) {
          material = xts[XT.KHR_MATERIALS_PBR_SPECULAR_GLOSSINESS]
              .createMaterial(matParams);
        } else {
          material = new matType(matParams);
        }
        if (matDef['name'] !== undefined) {material.name = matDef['name'];}
        // Normal map textures use OpenGL conventions:
        // https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#materialnormaltexture
        if (material.normalScale) {
          material.normalScale.x = -material.normalScale.x;
        }
        // emissiveTexture and baseColorTexture use sRGB encoding.
        if (material.map) {material.map.encoding = T.sRGBEncoding;}
        if (material.emissiveMap) {
          material.emissiveMap.encoding = T.sRGBEncoding;
        }
        if (matDef['extras']) {material.userData = matDef['extras'];}
        return material;
      });
    };

    /**
     * @param geometry
     * @param {JsonObject} primitiveDef
     * @param accessors
     */
    function addPrimitiveAttributes(geometry, primitiveDef, accessors) {
      const attributes = primitiveDef['attributes'];
      for (const gltfAttributeName in attributes) {
        const threeAttributeName = ATTRS[gltfAttributeName];
        const bufferAttribute = accessors[attributes[gltfAttributeName]];
        // Skip attributes already provided by e.g. Draco extension.
        if (!threeAttributeName) {continue;}
        if (threeAttributeName in geometry.attributes) {continue;}
        geometry.addAttribute(threeAttributeName, bufferAttribute);
      }
      if (primitiveDef['indices'] !== undefined && !geometry.index) {
        geometry.setIndex(accessors[primitiveDef['indices']]);
      }
    }
    GLTFParser.prototype.loadGeometries = function(primitives) {
      const parser = this;
      const extensions = this.extensions;
      const cache = this.primitiveCache;
      return this.getDependencies('accessor').then(function(accessors) {
        const pending = [];
        for (let i = 0, il = primitives.length; i < il; i++) {
          /** @type {JsonObject} */
          const primitive = primitives[i];
          // See if we've already created this geometry
          const cached = getCachedGeometry(cache, primitive);
          if (cached) {
            // Use the cached geometry if it exists
            pending.push(cached);
          } else if (primitive['extensions'] &&
              primitive['extensions'][XT.KHR_DRACO_MESH_COMPRESSION]) {
            // Use DRACO geometry if available
            const geometryPromise = extensions[XT.KHR_DRACO_MESH_COMPRESSION]
                .decodePrimitive(primitive, parser)
                .then(function(geometry) {
                  addPrimitiveAttributes(geometry, primitive, accessors);
                  return geometry;
                });
            cache.push({primitive, promise: geometryPromise});
            pending.push(geometryPromise);
          } else {
            // Otherwise create a new geometry
            const geometry = new T.BufferGeometry();
            addPrimitiveAttributes(geometry, primitive, accessors);
            const geometryPromise = Promise.resolve(geometry);
            // Cache this geometry
            cache.push({
              primitive,
              promise: geometryPromise,
            });
            pending.push(geometryPromise);
          }
        }
        return Promise.all(pending);
      });
    };
    GLTFParser.prototype.loadMesh = function(meshIndex) {
      const scope = this;
      const extensions = this.extensions;
      /** @type {JsonObject} */
      const meshDef = this.json['meshes'][meshIndex];
      return this.getMultiDependencies([
        'accessor',
        'material',
      ]).then(function(dependencies) {
        const group = new T.Group();
        /** @type {Array<JsonObject>} */
        const primitives = meshDef['primitives'];
        return scope.loadGeometries(primitives).then(function(geometries) {
          for (let i = 0, il = primitives.length; i < il; i++) {
            const primitive = primitives[i];
            /** @type {THREE.BufferGeometry} */
            const geometry = geometries[i];
            let material = primitive['material'] === undefined
              ? createDefaultMaterial()
              : dependencies['materials'][primitive['material']];
            if (material.aoMap
                && geometry.attributes['uv2'] === undefined
                && geometry.attributes['uv'] !== undefined) {
              console.log(
                  'THREE.GLTFLoader: Duplicating UVs to support aoMap.'
              );
              geometry.addAttribute(
                  'uv2',
                  new T.BufferAttribute(geometry.attributes['uv'].array, 2)
              );
            }
            // If the material will be modified later on, clone it now.
            const useVertexColors = geometry.attributes['color'] !== undefined;
            const useFlatShading = geometry.attributes['normal'] === undefined;
            const useSkinning = meshDef['isSkinnedMesh'] === true;
            const useMorphTargets = primitive['targets'] !== undefined;
            if (useVertexColors || useFlatShading ||
                useSkinning || useMorphTargets) {
              if (material.isGLTFSpecularGlossinessMaterial) {
                const specGlossExtension =
                    extensions[XT.KHR_MATERIALS_PBR_SPECULAR_GLOSSINESS];
                material = specGlossExtension.cloneMaterial(material);
              } else {
                material = material.clone();
              }
            }
            if (useVertexColors) {
              material.vertexColors = T.VertexColors;
              material.needsUpdate = true;
            }
            if (useFlatShading) {
              material.flatShading = true;
            }
            let mesh;
            if (primitive['mode'] === WEBGL_CONSTANTS.TRIANGLES ||
                primitive['mode'] === WEBGL_CONSTANTS.TRIANGLE_STRIP ||
                primitive['mode'] === WEBGL_CONSTANTS.TRIANGLE_FAN ||
                primitive['mode'] === undefined) {
              if (useSkinning) {
                mesh = new T.SkinnedMesh(geometry, material);
                material.skinning = true;
              } else {
                mesh = new T.Mesh(geometry, material);
              }
              if (primitive['mode'] === WEBGL_CONSTANTS.TRIANGLE_STRIP) {
                mesh.drawMode = T.TriangleStripDrawMode;
              } else if (primitive['mode'] === WEBGL_CONSTANTS.TRIANGLE_FAN) {
                mesh.drawMode = T.TriangleFanDrawMode;
              }
            } else if (primitive['mode'] === WEBGL_CONSTANTS.LINES ||
                primitive['mode'] === WEBGL_CONSTANTS.LINE_STRIP ||
                primitive['mode'] === WEBGL_CONSTANTS.LINE_LOOP) {
              const cacheKey = 'LineBasicMaterial:' + material.uuid;
              let lineMaterial = scope.cache.get(cacheKey);
              if (!lineMaterial) {
                lineMaterial = new T.LineBasicMaterial();
                T.Material.prototype.copy.call(lineMaterial, material);
                lineMaterial.color.copy(material.color);
                lineMaterial.lights = false; // LineBasicMaterial doesn't support lights yet
                scope.cache.add(cacheKey, lineMaterial);
              }
              material = lineMaterial;
              if (primitive['mode'] === WEBGL_CONSTANTS.LINES) {
                mesh = new T.LineSegments(geometry, material);
              } else if (primitive['mode'] === WEBGL_CONSTANTS.LINE_STRIP) {
                mesh = new T.Line(geometry, material);
              } else {
                mesh = new T.LineLoop(geometry, material);
              }
            } else if (primitive['mode'] === WEBGL_CONSTANTS.POINTS) {
              const cacheKey = 'PointsMaterial:' + material.uuid;
              let pointsMaterial = scope.cache.get(cacheKey);
              if (!pointsMaterial) {
                pointsMaterial = new T.PointsMaterial();
                T.Material.prototype.copy.call(pointsMaterial, material);
                pointsMaterial.color.copy(material.color);
                pointsMaterial.map = material.map;
                pointsMaterial.lights = false; // PointsMaterial doesn't support lights yet
                scope.cache.add(cacheKey, pointsMaterial);
              }
              material = pointsMaterial;
              mesh = new T.Points(geometry, material);
            } else {
              throw new Error(
                  'THREE.GLTFLoader: Primitive mode unsupported: ' +
                  primitive['mode']
              );
            }
            mesh.name = meshDef['name'] || ('mesh_' + meshIndex);
            if (useMorphTargets) {
              addMorphTargets(
                  mesh, meshDef, primitive, dependencies['accessors']
              );
            }
            if (meshDef['extras'] !== undefined) {
              mesh.userData = meshDef['extras'];
            }
            if (primitive['extras'] !== undefined) {
              mesh.geometry.userData = primitive['extras'];
            }
            // for Specular-Glossiness.
            if (material.isGLTFSpecularGlossinessMaterial === true) {
              mesh.onBeforeRender =
                  extensions[XT.KHR_MATERIALS_PBR_SPECULAR_GLOSSINESS]
                      .refreshUniforms;
            }
            if (primitives.length > 1) {
              mesh.name += '_' + i;
              group.add(mesh);
            } else {
              return mesh;
            }
          }
          return group;
        });
      });
    };
    GLTFParser.prototype.loadCamera = function(cameraIndex) {
      let camera;
      const cameraDef = this.json['cameras'][cameraIndex];
      const params = cameraDef[cameraDef.type];
      if (!params) {
        console.warn('THREE.GLTFLoader: Missing camera parameters.');
        return;
      }
      if (cameraDef.type === 'perspective') {
        camera = new T.PerspectiveCamera(
            T.Math.radToDeg(params.yfov),
            params.aspectRatio || 1,
            params.znear || 1,
            params.zfar || 2e6
        );
      } else if (cameraDef.type === 'orthographic') {
        camera = new T.OrthographicCamera(
            params.xmag / -2,
            params.xmag / 2,
            params.ymag / 2,
            params.ymag / -2,
            params.znear,
            params.zfar
        );
      }
      if (cameraDef.name !== undefined) {camera.name = cameraDef.name;}
      if (cameraDef.extras) {camera.userData = cameraDef.extras;}
      return Promise.resolve(camera);
    };
    GLTFParser.prototype.loadSkin = function(skinIndex) {
      const skinDef = this.json['skins'][skinIndex];
      const skinEntry = {joints: skinDef.joints};
      if (skinDef.inverseBindMatrices === undefined) {
        return Promise.resolve(skinEntry);
      }
      return this
          .getDependency('accessor', skinDef.inverseBindMatrices)
          .then(function(accessor) {
            skinEntry.inverseBindMatrices = accessor;
            return skinEntry;
          });
    };
    GLTFParser.prototype.loadAnimation = function(animIndex) {
      /** @type {JsonObject} */
      const animDef = this.json['animations'][animIndex];
      return this.getMultiDependencies([
        'accessor',
        'node',
      ]).then(function(dependencies) {
        const tracks = [];
        for (let i = 0, il = animDef['channels'].length; i < il; i++) {
          /** @type {JsonObject} */
          const channel = animDef['channels'][i];
          const sampler = animDef['samplers'][channel['sampler']];
          if (sampler) {
            const target = channel['target'];
            const name = target.node !== undefined ? target.node : target.id; // NOTE: target.id is deprecated.
            const input = animDef['parameters'] !== undefined
              ? animDef['parameters'][sampler.input] : sampler.input;
            const output = animDef['parameters'] !== undefined
              ? animDef['parameters'][sampler.output] : sampler.output;
            const inputAccessor = dependencies['accessors'][input];
            const outputAccessor = dependencies['accessors'][output];
            const node = dependencies['nodes'][name];
            if (node) {
              node.updateMatrix();
              node.matrixAutoUpdate = true;
              let TypedKeyframeTrack;
              switch (PATH_PROPERTIES[target.path]) {
                case PATH_PROPERTIES.weights:
                  TypedKeyframeTrack = T.NumberKeyframeTrack;
                  break;
                case PATH_PROPERTIES.rotation:
                  TypedKeyframeTrack = T.QuaternionKeyframeTrack;
                  break;
                case PATH_PROPERTIES.position:
                case PATH_PROPERTIES.scale:
                default:
                  TypedKeyframeTrack = T.VectorKeyframeTrack;
                  break;
              }
              const targetName = node.name ? node.name : node.uuid;
              const interpolation = sampler.interpolation !== undefined
                ? INTERPOLATION[sampler.interpolation] : T.InterpolateLinear;
              const targetNames = [];
              if (PATH_PROPERTIES[target.path] === PATH_PROPERTIES.weights) {
                // node should be T.Group here but
                // PATH_PROPERTIES.weights(morphTargetInfluences) should be
                // the property of a mesh object under node.
                // So finding targets here.
                node.traverse(function(/** @type {THREE.Object3D} */ object) {
                  if (object.isMesh === true &&
                      object.material.morphTargets === true) {
                    targetNames.push(object.name ? object.name : object.uuid);
                  }
                });
              } else {
                targetNames.push(targetName);
              }
              // KeyframeTrack.optimize() will modify given 'times' and 'values'
              // buffers before creating a truncated copy to keep. Because buffers may
              // be reused by other tracks, make copies here.
              for (let j = 0, jl = targetNames.length; j < jl; j++) {
                const track = new TypedKeyframeTrack(
                    targetNames[j] + '.' + PATH_PROPERTIES[target.path],
                    T.AnimationUtils.arraySlice(inputAccessor.array, 0),
                    T.AnimationUtils.arraySlice(outputAccessor.array, 0),
                    interpolation
                );
                // Here is the trick to enable custom interpolation.
                // Overrides .createInterpolant in a factory method which creates custom interpolation.
                if (sampler.interpolation === 'CUBICSPLINE') {
                  track.createInterpolant =
                      function InterpolantFactoryMethodGLTFCubicSpline(result) {
                        // A CUBICSPLINE keyframe in glTF has three output values for each input value,
                        // representing inTangent, splineVertex, and outTangent. As a result, track.getValueSize()
                        // must be divided by three to get the interpolant's sampleSize argument.
                        return new GLTFCubicSplineInterpolant(
                            this.times,
                            this.values,
                            this.getValueSize() / 3,
                            result
                        );
                      };
                  // Workaround, provide an alternate way to know if the interpolant type is cubis spline to track.
                  // track.getInterpolation() doesn't return valid value for custom interpolant.
                  track.createInterpolant
                      .isInterpolantFactoryMethodGLTFCubicSpline = true;
                }
                tracks.push(track);
              }
            }
          }
        }
        const name = animDef['name'] !== undefined
          ? animDef['name'] : 'animation_' + animIndex;
        return new T.AnimationClip(name, undefined, tracks);
      });
    };
    GLTFParser.prototype.loadNode = function(nodeIndex) {
      const extensions = this.extensions;
      const meshReferences = this.json['meshReferences'];
      const meshUses = this.json['meshUses'];
      /** @type {JsonObject} */
      const nodeDef = this.json['nodes'][nodeIndex];
      return this.getMultiDependencies([
        'mesh',
        'skin',
        'camera',
      ]).then(function(dependencies) {
        let node;
        if (nodeDef['isBone'] === true) {
          node = new T.Bone();
        } else if (nodeDef['mesh'] !== undefined) {
          /** @type {THREE.Mesh} */
          const mesh = dependencies['meshes'][nodeDef['mesh']];
          node = mesh.clone();
          // for Specular-Glossiness
          if (mesh.isGroup === true) {
            for (let i = 0, il = mesh.children.length; i < il; i++) {
              const child = mesh.children[i];
              if (child.material &&
                  child.material.isGLTFSpecularGlossinessMaterial === true) {
                node.children[i].onBeforeRender = child.onBeforeRender;
              }
            }
          } else {
            if (mesh.material &&
                mesh.material.isGLTFSpecularGlossinessMaterial === true) {
              node.onBeforeRender = mesh.onBeforeRender;
            }
          }
          if (meshReferences[nodeDef['mesh']] > 1) {
            node.name += '_instance_' + meshUses[nodeDef['mesh']]++;
          }
        } else if (nodeDef['camera'] !== undefined) {
          node = dependencies.cameras[nodeDef['camera']];
        } else if (nodeDef['extensions']
            && nodeDef['extensions'][XT.KHR_LIGHTS]
            && nodeDef['extensions'][XT.KHR_LIGHTS]['light'] !== undefined) {
          const lights = extensions[XT.KHR_LIGHTS].lights;
          node = lights[nodeDef['extensions'][XT.KHR_LIGHTS]['light']];
        } else {
          node = new T.Object3D();
        }
        if (nodeDef['name'] !== undefined) {
          node.name = T.PropertyBinding.sanitizeNodeName(nodeDef['name']);
        }
        if (nodeDef['extras']) {node.userData = nodeDef['extras'];}
        if (nodeDef['matrix'] !== undefined) {
          const matrix = new T.Matrix4();
          matrix.fromArray(nodeDef['matrix']);
          node.applyMatrix(matrix);
        } else {
          if (nodeDef['translation'] !== undefined) {
            node.position.fromArray(nodeDef['translation']);
          }
          if (nodeDef['rotation'] !== undefined) {
            node.quaternion.fromArray(nodeDef['rotation']);
          }
          if (nodeDef['scale'] !== undefined) {
            node.scale.fromArray(nodeDef['scale']);
          }
        }
        return node;
      });
    };
    GLTFParser.prototype.loadScene = (function() {
      // scene node hierachy builder
      /**
       * @param nodeId
       * @param parentObject
       * @param {JsonObject} json
       * @param allNodes
       * @param skins
       */
      function buildNodeHierachy(nodeId, parentObject, json, allNodes, skins) {
        const node = allNodes[nodeId];
        const nodeDef = json['nodes'][nodeId];
        // build skeleton here as well
        if (nodeDef['skin'] !== undefined) {
          const meshes = node.isGroup === true ? node.children : [node];
          for (let i = 0, il = meshes.length; i < il; i++) {
            const mesh = meshes[i];
            const skinEntry = skins[nodeDef['skin']];
            const bones = [];
            const boneInverses = [];
            for (let j = 0, jl = skinEntry.joints.length; j < jl; j++) {
              const jointId = skinEntry.joints[j];
              const jointNode = allNodes[jointId];
              if (jointNode) {
                bones.push(jointNode);
                const mat = new T.Matrix4();
                if (skinEntry.inverseBindMatrices !== undefined) {
                  mat.fromArray(skinEntry.inverseBindMatrices.array, j * 16);
                }
                boneInverses.push(mat);
              } else {
                console.warn(
                    'THREE.GLTFLoader: Joint "%s" could not be found.',
                    jointId
                );
              }
            }
            mesh.bind(new T.Skeleton(bones, boneInverses), mesh.matrixWorld);
          }
        }
        // build node hierachy
        parentObject.add(node);
        if (nodeDef['children']) {
          /** @type {Array} */
          const children = nodeDef['children'];
          for (let i = 0, il = children.length; i < il; i++) {
            const child = children[i];
            buildNodeHierachy(child, node, json, allNodes, skins);
          }
        }
      }
      return function loadScene(sceneIndex) {
        /** @this {GLTFParser} */

        /** @type {JsonObject} */
        const json = this.json;
        const extensions = this.extensions;
        const sceneDef = this.json['scenes'][sceneIndex];
        return this.getMultiDependencies([
          'node',
          'skin',
        ]).then(function(/** @type {Object.<string,*>} */ dependencies) {
          const scene = new T.Scene();
          if (sceneDef['name'] !== undefined) {scene.name = sceneDef['name'];}
          if (sceneDef['extras']) {scene['userData'] = sceneDef['extras'];}
          const nodeIds = sceneDef.nodes || [];
          for (let i = 0, il = nodeIds.length; i < il; i++) {
            buildNodeHierachy(
                nodeIds[i],
                scene,
                json,
                dependencies['nodes'],
                dependencies['skins']
            );
          }
          // Ambient lighting, if present, is always attached to the scene root.
          if (sceneDef['extensions']
              && sceneDef['extensions'][XT.KHR_LIGHTS]
              && sceneDef['extensions'][XT.KHR_LIGHTS]['light'] !== undefined) {
            const lights = extensions[XT.KHR_LIGHTS].lights;
            scene.add(lights[sceneDef['extensions'][XT.KHR_LIGHTS]['light']]);
          }
          return scene;
        });
      };
    }());
    return GLTFLoader;
  })();
}
