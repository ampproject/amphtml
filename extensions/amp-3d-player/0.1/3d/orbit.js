/* global THREE */

export default function declareOrbitControls() {
  /**
   * @author qiao / https://github.com/qiao
   * @author mrdoob / http://mrdoob.com
   * @author alteredq / http://alteredqualia.com/
   * @author WestLangley / http://github.com/WestLangley
   * @author erich666 / http://erichaines.com
   */

// This set of controls performs orbiting, dollying (zooming), and panning.
// Unlike TrackballControls, it maintains the "up" direction object.up (+Y by default).
//
//    Orbit - left mouse / touch: one finger move
//    Zoom - middle mouse, or mousewheel / touch: two finger spread or squish
//    Pan - right mouse, or arrow keys / touch: three finger swipe

  THREE.OrbitControls = function(object, domElement) {

    this.object = object;

    this.domElement = (domElement !== undefined) ? domElement : document;

    // Set to false to disable this control
    this.enabled = true;

    // "target" sets the location of focus, where the object orbits around
    this.target = new THREE.Vector3();

    // How far you can dolly in and out ( PerspectiveCamera only )
    this.minDistance = 0;
    this.maxDistance = Infinity;

    // How far you can orbit vertically, upper and lower limits.
    // Range is 0 to Math.PI radians.
    this.minPolarAngle = 0; // radians
    this.maxPolarAngle = Math.PI; // radians

    // How far you can orbit horizontally, upper and lower limits.
    // If set, must be a sub-interval of the interval [ - Math.PI, Math.PI ].
    this.minAzimuthAngle = -Infinity; // radians
    this.maxAzimuthAngle = Infinity; // radians

    // Set to true to enable damping (inertia)
    // If damping is enabled, you must call controls.update() in your animation loop
    this.enableDamping = false;
    this.dampingFactor = 0.25;

    // This option actually enables dollying in and out; left as "zoom" for backwards compatibility.
    // Set to false to disable zooming
    this.enableZoom = true;
    this.zoomSpeed = 1.0;

    // Set to false to disable rotating
    this.enableRotate = true;
    this.rotateSpeed = 1.0;

    // Set to false to disable panning
    this.enablePan = true;
    this.keyPanSpeed = 7.0;	// pixels moved per arrow key push

    // Set to true to automatically rotate around the target
    // If auto-rotate is enabled, you must call controls.update() in your animation loop
    this.autoRotate = false;
    this.autoRotateSpeed = 2.0; // 30 seconds per round when fps is 60

    // Set to false to disable use of the keys
    this.enableKeys = true;

    // The four arrow keys
    this.keys = {LEFT: 37, UP: 38, RIGHT: 39, BOTTOM: 40};

    // Mouse buttons
    this.mouseButtons = {
      ORBIT: THREE.MOUSE.LEFT,
      ZOOM: THREE.MOUSE.MIDDLE,
      PAN: THREE.MOUSE.RIGHT,
    };

    // for reset
    this.target0 = this.target.clone();
    this.position0 = this.object.position.clone();
    this.zoom0 = this.object.zoom;

    //
    // public methods
    //

    this.getPolarAngle = function() {

      return spherical.phi;

    };

    this.getAzimuthalAngle = function() {

      return spherical.theta;

    };

    this.saveState = function() {

      _.target0.copy(_.target);
      _.position0.copy(_.object.position);
      _.zoom0 = _.object.zoom;

    };

    this.reset = function() {

      _.target.copy(_.target0);
      _.object.position.copy(_.position0);
      _.object.zoom = _.zoom0;

      _.object.updateProjectionMatrix();
      _.dispatchEvent(changeEvent);

      _.update();

      state = STATE.NONE;

    };

    // this method is exposed, but perhaps it would be better if we can make it private...
    this.update = (function() {

      const offset = new THREE.Vector3();

      // so camera.up is the orbit axis
      const quat = new THREE.Quaternion()
          .setFromUnitVectors(object.up, new THREE.Vector3(0, 1, 0));

      const quatInverse = quat.clone().inverse();

      const lastPosition = new THREE.Vector3();
      const lastQuaternion = new THREE.Quaternion();

      return function update() {

        const position = _.object.position;

        offset.copy(position).sub(_.target);

        // rotate offset to "y-axis-is-up" space
        offset.applyQuaternion(quat);

        // angle from z-axis around y-axis
        spherical.setFromVector3(offset);

        if (_.autoRotate && state === STATE.NONE) {

          rLeft(getAutoRotationAngle());

        }

        spherical.theta += sphericalDelta.theta;
        spherical.phi += sphericalDelta.phi;

        // restrict theta to be between desired limits
        spherical.theta = Math.max(
            _.minAzimuthAngle,
            Math.min(_.maxAzimuthAngle, spherical.theta)
        );

        // restrict phi to be between desired limits
        spherical.phi = Math.max(
            _.minPolarAngle,
            Math.min(_.maxPolarAngle, spherical.phi)
        );

        spherical.makeSafe();


        spherical.radius *= scale;

        // restrict radius to be between desired limits
        spherical.radius = Math.max(
            _.minDistance,
            Math.min(_.maxDistance, spherical.radius)
        );

        // move target to panned location
        _.target.add(panOffset);

        offset.setFromSpherical(spherical);

        // rotate offset back to "camera-up-vector-is-up" space
        offset.applyQuaternion(quatInverse);

        position.copy(_.target).add(offset);

        _.object.lookAt(_.target);

        if (_.enableDamping === true) {

          sphericalDelta.theta *= (1 - _.dampingFactor);
          sphericalDelta.phi *= (1 - _.dampingFactor);

        } else {

          sphericalDelta.set(0, 0, 0);

        }

        scale = 1;
        panOffset.set(0, 0, 0);

        // update condition is:
        // min(camera displacement, camera rotation in radians)^2 > EPS
        // using small-angle approximation cos(x/2) = 1 - x^2 / 8

        if (zoomChanged ||
            lastPosition.distanceToSquared(_.object.position) > EPS ||
            8 * (1 - lastQuaternion.dot(_.object.quaternion)) > EPS) {

          _.dispatchEvent(changeEvent);

          lastPosition.copy(_.object.position);
          lastQuaternion.copy(_.object.quaternion);
          zoomChanged = false;

          return true;

        }

        return false;

      };

    }());

    this.dispose = function() {

      _.domElement.removeEventListener('contextmenu', onContextMenu, false);
      _.domElement.removeEventListener('mousedown', onMouseDown, false);
      _.domElement.removeEventListener('wheel', onMouseWheel, false);

      _.domElement.removeEventListener('touchstart', onTouchStart, false);
      _.domElement.removeEventListener('touchend', onTouchEnd, false);
      _.domElement.removeEventListener('touchmove', onTouchMove, false);

      document.removeEventListener('mousemove', onMouseMove, false);
      document.removeEventListener('mouseup', onMouseUp, false);

      window.removeEventListener('keydown', onKeyDown, false);

    };

    //
    // internals
    //

    const _ = this;

    const changeEvent = {type: 'change'};
    const startEvent = {type: 'start'};
    const endEvent = {type: 'end'};

    const STATE = {
      NONE: -1,
      ROTATE: 0,
      DOLLY: 1,
      PAN: 2,
      TOUCH_ROTATE: 3,
      TOUCH_DOLLY: 4,
      TOUCH_PAN: 5,
    };

    let state = STATE.NONE;

    const EPS = 0.000001;

    // current position in spherical coordinates
    const spherical = new THREE.Spherical();
    const sphericalDelta = new THREE.Spherical();

    let scale = 1;
    const panOffset = new THREE.Vector3();
    let zoomChanged = false;

    const rotateStart = new THREE.Vector2();
    const rotateEnd = new THREE.Vector2();
    const rotateDelta = new THREE.Vector2();

    const panStart = new THREE.Vector2();
    const panEnd = new THREE.Vector2();
    const panDelta = new THREE.Vector2();

    const dollyStart = new THREE.Vector2();
    const dollyEnd = new THREE.Vector2();
    const dollyDelta = new THREE.Vector2();

    function getAutoRotationAngle() {

      return 2 * Math.PI / 60 / 60 * _.autoRotateSpeed;

    }

    function getZoomScale() {

      return Math.pow(0.95, _.zoomSpeed);

    }

    function rLeft(angle) {

      sphericalDelta.theta -= angle;

    }

    function rUp(angle) {

      sphericalDelta.phi -= angle;

    }

    const panLeft = (function() {

      const v = new THREE.Vector3();

      return function panLeft(distance, objectMatrix) {

        v.setFromMatrixColumn(objectMatrix, 0); // get X column of objectMatrix
        v.multiplyScalar(-distance);

        panOffset.add(v);

      };

    }());

    const panUp = (function() {

      const v = new THREE.Vector3();

      return function panUp(distance, objectMatrix) {

        v.setFromMatrixColumn(objectMatrix, 1); // get Y column of objectMatrix
        v.multiplyScalar(distance);

        panOffset.add(v);

      };

    }());

    // deltaX and deltaY are in pixels; right and down are positive
    const pan = (function() {

      const offset = new THREE.Vector3();

      return function pan(dx, dy) {

        const el = _.domElement === document
          ? _.domElement.body
          : _.domElement;

        if (_.object instanceof THREE.PerspectiveCamera) {

          // perspective
          const position = _.object.position;
          offset.copy(position).sub(_.target);
          let targetDistance = offset.length();

          // half of the fov is center to top of screen
          targetDistance *= Math.tan((_.object.fov / 2) * Math.PI / 180.0);

          // we actually don't use screenWidth, since perspective camera is fixed to screen height
          panLeft(
              2 * dx * targetDistance / el.clientHeight,
              _.object.matrix
          );
          panUp(
              2 * dy * targetDistance / el.clientHeight,
              _.object.matrix
          );

        } else {
          _.enablePan = false;

        }

      };

    }());

    function dollyIn(dollyScale) {

      if (_.object instanceof THREE.PerspectiveCamera) {

        scale /= dollyScale;

      } else {
        _.enableZoom = false;

      }

    }

    function dollyOut(dollyScale) {

      if (_.object instanceof THREE.PerspectiveCamera) {

        scale *= dollyScale;

      } else {
        _.enableZoom = false;

      }

    }

    //
    // event callbacks - update the object state
    //

    function handleMouseDownRotate(event) {

      //console.log( 'handleMouseDownRotate' );

      rotateStart.set(event.clientX, event.clientY);

    }

    function handleMouseDownDolly(event) {

      //console.log( 'handleMouseDownDolly' );

      dollyStart.set(event.clientX, event.clientY);

    }

    function handleMouseDownPan(event) {

      //console.log( 'handleMouseDownPan' );

      panStart.set(event.clientX, event.clientY);

    }

    function handleMouseMoveRotate(event) {

      //console.log( 'handleMouseMoveRotate' );

      rotateEnd.set(event.clientX, event.clientY);
      rotateDelta.subVectors(rotateEnd, rotateStart);

      const element = _.domElement === document
        ? _.domElement.body
        : _.domElement;

      // rotating across whole screen goes 360 degrees around
      rLeft(2 * Math.PI * rotateDelta.x / element.clientWidth * _.rotateSpeed);

      // rotating up and down along whole screen attempts to go 360, but limited to 180
      rUp(2 * Math.PI * rotateDelta.y / element.clientHeight * _.rotateSpeed);

      rotateStart.copy(rotateEnd);

      _.update();

    }

    function handleMouseMoveDolly(event) {

      //console.log( 'handleMouseMoveDolly' );

      dollyEnd.set(event.clientX, event.clientY);

      dollyDelta.subVectors(dollyEnd, dollyStart);

      if (dollyDelta.y > 0) {

        dollyIn(getZoomScale());

      } else if (dollyDelta.y < 0) {

        dollyOut(getZoomScale());

      }

      dollyStart.copy(dollyEnd);

      _.update();

    }

    function handleMouseMovePan(event) {

      panEnd.set(event.clientX, event.clientY);

      panDelta.subVectors(panEnd, panStart);

      pan(panDelta.x, panDelta.y);

      panStart.copy(panEnd);

      _.update();

    }

    function handleMouseUp() {
    }

    function handleMouseWheel(event) {

      if (event.deltaY < 0) {

        dollyOut(getZoomScale());

      } else if (event.deltaY > 0) {

        dollyIn(getZoomScale());

      }

      _.update();

    }

    function handleKeyDown(event) {

      //console.log( 'handleKeyDown' );

      switch (event.keyCode) {

        case _.keys.UP:
          pan(0, _.keyPanSpeed);
          _.update();
          break;

        case _.keys.BOTTOM:
          pan(0, -_.keyPanSpeed);
          _.update();
          break;

        case _.keys.LEFT:
          pan(_.keyPanSpeed, 0);
          _.update();
          break;

        case _.keys.RIGHT:
          pan(-_.keyPanSpeed, 0);
          _.update();
          break;

      }

    }

    function handleTouchStartRotate(event) {

      //console.log( 'handleTouchStartRotate' );

      rotateStart.set(event.touches[0].pageX, event.touches[0].pageY);

    }

    function handleTouchStartDolly(event) {

      //console.log( 'handleTouchStartDolly' );

      const dx = event.touches[0].pageX - event.touches[1].pageX;
      const dy = event.touches[0].pageY - event.touches[1].pageY;

      const distance = Math.sqrt(dx * dx + dy * dy);

      dollyStart.set(0, distance);

    }

    function handleTouchStartPan(event) {

      panStart.set(event.touches[0].pageX, event.touches[0].pageY);

    }

    function handleTouchMoveRotate(event) {

      rotateEnd.set(event.touches[0].pageX, event.touches[0].pageY);
      rotateDelta.subVectors(rotateEnd, rotateStart);

      const element = _.domElement === document
        ? _.domElement.body
        : _.domElement;

      // rotating across whole screen goes 360 degrees around
      rLeft(2 * Math.PI * rotateDelta.x / element.clientWidth * _.rotateSpeed);

      // rotating up and down along whole screen attempts to go 360, but limited to 180
      rUp(2 * Math.PI * rotateDelta.y / element.clientHeight * _.rotateSpeed);

      rotateStart.copy(rotateEnd);

      _.update();

    }

    function handleTouchMoveDolly(event) {

      //console.log( 'handleTouchMoveDolly' );

      const dx = event.touches[0].pageX - event.touches[1].pageX;
      const dy = event.touches[0].pageY - event.touches[1].pageY;

      const distance = Math.sqrt(dx * dx + dy * dy);

      dollyEnd.set(0, distance);

      dollyDelta.subVectors(dollyEnd, dollyStart);

      if (dollyDelta.y > 0) {

        dollyOut(getZoomScale());

      } else if (dollyDelta.y < 0) {

        dollyIn(getZoomScale());

      }

      dollyStart.copy(dollyEnd);

      _.update();

    }

    function handleTouchMovePan(event) {

      //console.log( 'handleTouchMovePan' );

      panEnd.set(event.touches[0].pageX, event.touches[0].pageY);

      panDelta.subVectors(panEnd, panStart);

      pan(panDelta.x, panDelta.y);

      panStart.copy(panEnd);

      _.update();

    }

    function handleTouchEnd() {}

    //
    // event handlers - FSM: listen for events and reset state
    //

    function onMouseDown(event) {

      if (_.enabled === false) {return;}

      event.preventDefault();

      switch (event.button) {

        case _.mouseButtons.ORBIT:

          if (_.enableRotate === false) {return;}

          handleMouseDownRotate(event);

          state = STATE.ROTATE;

          break;

        case _.mouseButtons.ZOOM:

          if (_.enableZoom === false) {return;}

          handleMouseDownDolly(event);

          state = STATE.DOLLY;

          break;

        case _.mouseButtons.PAN:

          if (_.enablePan === false) {return;}

          handleMouseDownPan(event);

          state = STATE.PAN;

          break;

      }

      if (state !== STATE.NONE) {

        document.addEventListener('mousemove', onMouseMove, false);
        document.addEventListener('mouseup', onMouseUp, false);

        _.dispatchEvent(startEvent);

      }

    }

    function onMouseMove(event) {

      if (_.enabled === false) {return;}

      event.preventDefault();

      switch (state) {

        case STATE.ROTATE:

          if (_.enableRotate === false) {return;}

          handleMouseMoveRotate(event);

          break;

        case STATE.DOLLY:

          if (_.enableZoom === false) {return;}

          handleMouseMoveDolly(event);

          break;

        case STATE.PAN:

          if (_.enablePan === false) {return;}

          handleMouseMovePan(event);

          break;

      }

    }

    function onMouseUp(event) {

      if (_.enabled === false) {return;}

      handleMouseUp(event);

      document.removeEventListener('mousemove', onMouseMove, false);
      document.removeEventListener('mouseup', onMouseUp, false);

      _.dispatchEvent(endEvent);

      state = STATE.NONE;

    }

    function onMouseWheel(event) {

      if (_.enabled === false ||
          _.enableZoom === false ||
          (state !== STATE.NONE && state !== STATE.ROTATE)) {return;}

      event.preventDefault();
      event.stopPropagation();

      handleMouseWheel(event);

      _.dispatchEvent(startEvent); // not sure why these are here...
      _.dispatchEvent(endEvent);

    }

    function onKeyDown(event) {

      if (_.enabled === false ||
          _.enableKeys === false ||
          _.enablePan === false) {return;}

      handleKeyDown(event);

    }

    function onTouchStart(event) {

      if (_.enabled === false) {return;}

      switch (event.touches.length) {

        case 1:	// one-fingered touch: rotate

          if (_.enableRotate === false) {return;}

          handleTouchStartRotate(event);

          state = STATE.TOUCH_ROTATE;

          break;

        case 2:	// two-fingered touch: dolly

          if (_.enableZoom === false) {return;}

          handleTouchStartDolly(event);

          state = STATE.TOUCH_DOLLY;

          break;

        case 3: // three-fingered touch: pan

          if (_.enablePan === false) {return;}

          handleTouchStartPan(event);

          state = STATE.TOUCH_PAN;

          break;

        default:

          state = STATE.NONE;

      }

      if (state !== STATE.NONE) {

        _.dispatchEvent(startEvent);

      }

    }

    function onTouchMove(event) {

      if (_.enabled === false) {return;}

      event.preventDefault();
      event.stopPropagation();

      switch (event.touches.length) {

        case 1: // one-fingered touch: rotate

          if (_.enableRotate === false) {return;}
          if (state !== STATE.TOUCH_ROTATE) {return;} // is this needed?...

          handleTouchMoveRotate(event);

          break;

        case 2: // two-fingered touch: dolly

          if (_.enableZoom === false) {return;}
          if (state !== STATE.TOUCH_DOLLY) {return;} // is this needed?...

          handleTouchMoveDolly(event);

          break;

        case 3: // three-fingered touch: pan

          if (_.enablePan === false) {return;}
          if (state !== STATE.TOUCH_PAN) {return;} // is this needed?...

          handleTouchMovePan(event);

          break;

        default:

          state = STATE.NONE;

      }

    }

    function onTouchEnd(event) {

      if (_.enabled === false) {return;}

      handleTouchEnd(event);

      _.dispatchEvent(endEvent);

      state = STATE.NONE;

    }

    function onContextMenu(event) {

      if (_.enabled === false) {return;}

      event.preventDefault();

    }

    //

    _.domElement.addEventListener('contextmenu', onContextMenu, false);

    _.domElement.addEventListener('mousedown', onMouseDown, false);
    _.domElement.addEventListener('wheel', onMouseWheel, false);

    _.domElement.addEventListener('touchstart', onTouchStart, false);
    _.domElement.addEventListener('touchend', onTouchEnd, false);
    _.domElement.addEventListener('touchmove', onTouchMove, false);

    window.addEventListener('keydown', onKeyDown, false);

    // force an update at start

    this.update();

  };

  THREE.OrbitControls.prototype =
      Object.create(THREE.EventDispatcher.prototype);
  THREE.OrbitControls.prototype.constructor = THREE.OrbitControls;
}
