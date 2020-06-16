// (c) Yasuhiro Fujii <y-fujii at mimosa-pudica.net>, under MIT License.
"use strict";

if( NodeList.prototype[Symbol.iterator] === undefined ) {
	NodeList.prototype[Symbol.iterator] = Array.prototype[Symbol.iterator];
}
if( Element.prototype.setCapture === undefined ) {
	Element.prototype.setCapture = function() {};
}
if( Element.prototype.requestFullscreen === undefined ) {
	Element.prototype.requestFullscreen =
		Element.prototype.mozRequestFullScreen ||
		Element.prototype.webkitRequestFullscreen ||
		Element.prototype.msRequestFullscreen;
}

const zuho = {};

zuho.Matrix = class {
	static mul( n, x, y ) {
		console.assert( x.length == n * n && y.length == n * n );
		const z = new Float32Array( n * n );
		for( let i = 0; i < n; ++i ) {
			for( let j = 0; j < n; ++j ) {
				let sum = 0.0;
				for( let k = 0; k < n; ++k ) {
					sum += x[i * n + k] * y[k * n + j];
				}
				z[i * n + j] = sum;
			}
		}
		return z;
	}

	static identity( n ) {
		const z = new Float32Array( n * n );
		z.fill( 0.0 );
		for( let i = 0; i < n; ++i ) {
			z[i * n + i] = 1.0;
		}
		return z;
	}

	static rotation( n, i, j, arg ) {
		console.assert( i < n && j < n );
		const z = this.identity( n );
		const cos = Math.cos( arg );
		const sin = Math.sin( arg );
		z[i * n + i] = +cos;
		z[i * n + j] = -sin;
		z[j * n + i] = +sin;
		z[j * n + j] = +cos;
		return z;
	}
};

zuho.Renderer = class {
	constructor( canvas ) {
		const params = {
			alpha: true,
			depth: false,
			stencil: false,
			antialias: false,
			premultipliedAlpha: true,
		};
		const gl = this._gl =
			canvas.getContext( "webgl", params ) ||
			canvas.getContext( "experimental-webgl", params );

		this._canvas = canvas;
		this.resize();

		this._vertShader     = gl.createShader( gl.VERTEX_SHADER );
		this._fragShaderFast = gl.createShader( gl.FRAGMENT_SHADER );
		this._fragShaderSlow = gl.createShader( gl.FRAGMENT_SHADER );
		this._progFast       = gl.createProgram();
		this._progSlow       = gl.createProgram();
		this._compile( this._vertShader, zuho.Renderer._vertSource );
		gl.attachShader( this._progFast, this._vertShader );
		gl.attachShader( this._progFast, this._fragShaderFast );
		gl.attachShader( this._progSlow, this._vertShader );
		gl.attachShader( this._progSlow, this._fragShaderSlow );
		this.setMapping( Object.values( zuho.Mapping )[0] );
		this.setCamera( zuho.Matrix.identity( 3 ), 1.0 );

		this._vbo = gl.createBuffer();
		gl.bindBuffer( gl.ARRAY_BUFFER, this._vbo );
		gl.bufferData( gl.ARRAY_BUFFER, zuho.Renderer._vertices, gl.STATIC_DRAW );

		this._tex = gl.createTexture();
		gl.bindTexture( gl.TEXTURE_2D, this._tex );
		gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );
		gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST );
		gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE );
		gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE );

		gl.bindTexture( gl.TEXTURE_2D, null );
		gl.bindBuffer( gl.ARRAY_BUFFER, null );
	}

	setImage( img ) {
		const gl = this._gl;
		gl.bindTexture( gl.TEXTURE_2D, this._tex );
		gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img );
		gl.bindTexture( gl.TEXTURE_2D, null );
	}

	setMapping( code ) {
		this._compile( this._fragShaderFast, zuho.Renderer._fragSourceCommon + zuho.Renderer._fragSourceFast + code );
		this._compile( this._fragShaderSlow, zuho.Renderer._fragSourceCommon + zuho.Renderer._fragSourceSlow + code );
		this._link( this._progFast );
		this._link( this._progSlow );
	}

	setCamera( rot, scale ) {
		this._rotation = rot;
		this._scale    = scale;
	}

	resize() {
		const rect = this._canvas.getBoundingClientRect();
		this._canvas.width  = rect.width  * devicePixelRatio;
		this._canvas.height = rect.height * devicePixelRatio;
		this._gl.viewport( 0.0, 0.0, this._canvas.width, this._canvas.height );
	}

	render( fast ) {
		const gl = this._gl;

		gl.disable( gl.BLEND );

		const prog = fast ? this._progFast : this._progSlow;
		gl.useProgram( prog );
		const f = this._scale / Math.sqrt( gl.drawingBufferWidth * gl.drawingBufferHeight );
		const sx = f * gl.drawingBufferWidth;
		const sy = f * gl.drawingBufferHeight;
		gl.uniformMatrix3fv( gl.getUniformLocation( prog, "uRot"    ), false, this._rotation );
		gl.uniform2f       ( gl.getUniformLocation( prog, "uScale"  ),        sx, sy         );
		gl.uniform1f       ( gl.getUniformLocation( prog, "uPxSize" ),        2.0 * f        );

		gl.enableVertexAttribArray( 0 );
		gl.bindBuffer( gl.ARRAY_BUFFER, this._vbo );
		gl.vertexAttribPointer( 0, 2, gl.FLOAT, false, 0, 0 );

		gl.activeTexture( gl.TEXTURE0 );
		gl.bindTexture( gl.TEXTURE_2D, this._tex );
		gl.uniform1i( gl.getUniformLocation( prog, "uTex" ), 0 );

		gl.drawArrays( gl.TRIANGLE_STRIP, 0, 4 );

		gl.bindTexture( gl.TEXTURE_2D, null );
		gl.bindBuffer( gl.ARRAY_BUFFER, null );
		gl.useProgram( null );
	}

	_compile( shader, src ) {
		const gl = this._gl;
		gl.shaderSource( shader, src );
		gl.compileShader( shader );
		const log = gl.getShaderInfoLog( shader );
		if( log.length > 0 ) {
			console.log( log );
		}
	}

	_link( prog ) {
		const gl = this._gl;
		gl.linkProgram( prog );
		const log = gl.getProgramInfoLog( prog );
		if( log.length > 0 ) {
			console.log( log );
		}
	}
};

zuho.Renderer._vertices = new Float32Array( [
	-1.0, -1.0, +1.0, -1.0, -1.0, +1.0, +1.0, +1.0,
] );

zuho.Renderer._fragSourceCommon = String.raw`
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

	bool unproject( vec2, out vec3 );

	vec4 sample( float dx, float dy ) {
		vec2 p = vPos + uPxSize * vec2( dx, dy );
		vec3 q;
		if( unproject( p, q ) ) {
			vec3 dir = normalize( uRot * q );
			float u = (0.5 / pi) * atan( dir[1], dir[0] ) + 0.5;
			float v = (1.0 / pi) * acos( dir[2] );
			return texture2D( uTex, vec2( u, v ) );
		}
		else {
			return vec4( 0.0 );
		}
	}
`;

zuho.Renderer._fragSourceFast = String.raw`
	void main() {
		gl_FragColor = sample( 0.0, 0.0 );
	}
`;

zuho.Renderer._fragSourceSlow = String.raw`
	vec4 sampleSq( float dx, float dy ) {
		vec4 s = sample( dx, dy );
		return vec4( s.xyz * s.xyz, s.w );
	}

	void main() {
		// (2, 3) halton vector sequences.
		vec4 acc = (1.0 / 16.0) * (
			(((sampleSq(  1.0 /  2.0 - 0.5,  1.0 /  3.0 - 0.5 ) +
			   sampleSq(  1.0 /  4.0 - 0.5,  2.0 /  3.0 - 0.5 )) +
			  (sampleSq(  3.0 /  4.0 - 0.5,  1.0 /  9.0 - 0.5 ) +
			   sampleSq(  1.0 /  8.0 - 0.5,  4.0 /  9.0 - 0.5 ))) +
			 ((sampleSq(  5.0 /  8.0 - 0.5,  7.0 /  9.0 - 0.5 ) +
			   sampleSq(  3.0 /  8.0 - 0.5,  2.0 /  9.0 - 0.5 )) +
			  (sampleSq(  7.0 /  8.0 - 0.5,  5.0 /  9.0 - 0.5 ) +
			   sampleSq(  1.0 / 16.0 - 0.5,  8.0 /  9.0 - 0.5 )))) +
			(((sampleSq(  9.0 / 16.0 - 0.5,  1.0 / 27.0 - 0.5 ) +
			   sampleSq(  5.0 / 16.0 - 0.5, 10.0 / 27.0 - 0.5 )) +
			  (sampleSq( 13.0 / 16.0 - 0.5, 19.0 / 27.0 - 0.5 ) +
			   sampleSq(  3.0 / 16.0 - 0.5,  4.0 / 27.0 - 0.5 ))) +
			 ((sampleSq( 11.0 / 16.0 - 0.5, 13.0 / 27.0 - 0.5 ) +
			   sampleSq(  7.0 / 16.0 - 0.5, 22.0 / 27.0 - 0.5 )) +
			  (sampleSq( 15.0 / 16.0 - 0.5,  7.0 / 27.0 - 0.5 ) +
			   sampleSq(  1.0 / 32.0 - 0.5, 16.0 / 27.0 - 0.5 ))))
		);
		gl_FragColor = vec4( sqrt( acc.xyz ), acc.w );
	}
`;

zuho.Renderer._vertSource = String.raw`
	uniform   vec2 uScale;
	attribute vec2 aPos;
	varying   vec2 vPos;

	void main() {
		gl_Position = vec4( aPos, 0.0, 1.0 );
		vPos = uScale * aPos;
	}
`;

zuho.Mapping = {
	azPerspective: String.raw`
		bool unproject( vec2 p, out vec3 q ) {
			q = vec3( p, -1.0 );
			return true;
		}
	`,
	azConformal: String.raw`
		bool unproject( vec2 p, out vec3 q ) {
			q = vec3( p, 0.25 * dot( p, p ) - 1.0 );
			return true;
		}
	`,
	azEquidistant: String.raw`
		bool unproject( vec2 p, out vec3 q ) {
			float r = length( p );
			q = vec3( p, -r / tan( r ) );
			return r < pi;
		}
	`,
	azEquiarea: String.raw`
		bool unproject( vec2 p, out vec3 q ) {
			float t = dot( p, p );
			q = vec3( p, (t - 2.0) * inversesqrt( 4.0 - t ) );
			return t < 4.0;
		}
	`,
	azOrthogonal: String.raw`
		bool unproject( vec2 p, out vec3 q ) {
			float t = dot( p, p );
			q = vec3( p * inversesqrt( 1.0 - t ), -1.0 );
			return t < 1.0;
		}
	`,
	azReflect: String.raw`
		bool unproject( vec2 p, out vec3 q ) {
			float t = dot( p, p );
			q = vec3( p, inversesqrt( 1.0 - t ) - 2.0 );
			return t < 1.0;
		}
	`,
	cyPerspective: String.raw`
		bool unproject( vec2 p, out vec3 q ) {
			float t = p.y;
			q = vec3( sin( p.x ), t, -cos( p.x ) );
			return abs( p.x ) < pi;
		}
	`,
	cyConformal: String.raw`
		bool unproject( vec2 p, out vec3 q ) {
			float t = 0.5 * (exp( +p.y ) - exp( -p.y ));
			q = vec3( sin( p.x ), t, -cos( p.x ) );
			return abs( p.x ) < pi;
		}
	`,
	cyEquidistant: String.raw`
		bool unproject( vec2 p, out vec3 q ) {
			float t = tan( p.y );
			q = vec3( sin( p.x ), t, -cos( p.x ) );
			return abs( p.x ) < pi && abs( p.y ) < pi / 2.0;
		}
	`,
	cyEquiarea: String.raw`
		bool unproject( vec2 p, out vec3 q ) {
			float t = p.y * inversesqrt( 1.0 - p.y * p.y );
			q = vec3( sin( p.x ), t, -cos( p.x ) );
			return abs( p.x ) < pi && abs( p.y ) < 1.0;
		}
	`,
	mollweide: String.raw`
		bool unproject( vec2 p, out vec3 q ) {
			float theta = asin( sqrt( 1.0 / 2.0 ) * p.y );
			float sinPhi = (1.0 / pi) * (2.0 * theta + sin( 2.0 * theta ));
			float cosPhi = sqrt( 1.0 - sinPhi * sinPhi );
			float lambda = (pi / sqrt( 8.0 )) * p.x / cos( theta );
			q = vec3(
				cosPhi * +sin( lambda ),
				sinPhi,
				cosPhi * -cos( lambda )
			);
			return abs( sinPhi ) < 1.0 && abs( lambda ) < pi;
		}
	`,
	hammer: String.raw`
		bool unproject( vec2 p, out vec3 q ) {
			float t = dot( vec2( 0.25, 0.5 ) * p, vec2( 0.25, 0.5 ) * p );
			float z = sqrt( 1.0 - t );
			float sinPhi = z * p.y;
			float cosPhi = sqrt( 1.0 - sinPhi * sinPhi );
			float a = z * p.x / (4.0 * z * z - 2.0);
			q = vec3(
				cosPhi * (a * 2.0),
				sinPhi * (a * a + 1.0),
				cosPhi * (a * a - 1.0)
			);
			return t < 0.5;
		}
	`,
	eckert4: String.raw`
		bool unproject( vec2 p, out vec3 q ) {
			float sinTheta = sqrt( (4.0 + pi) / (4.0 * pi) ) * p.y;
			float cosTheta = sqrt( 1.0 - sinTheta * sinTheta );
			float sinPhi = (2.0 / (4.0 + pi)) * (asin( sinTheta ) + sinTheta * cosTheta + 2.0 * sinTheta);
			float cosPhi = sqrt( 1.0 - sinPhi * sinPhi );
			float lambda = (sqrt( 4.0 * pi + pi * pi ) / 2.0) * p.x / (1.0 + cosTheta);
			q = vec3(
				cosPhi * +sin( lambda ),
				sinPhi,
				cosPhi * -cos( lambda )
			);
			return abs( sinPhi ) < 1.0 && abs( lambda ) < pi;
		}
	`,
};

zuho.Handler = class {
	constructor( elem, renderer ) {
		this._element  = elem;
		this._renderer = renderer;
		this._mousePos = null;
		this._touchVar = null;
		this._theta    = Math.PI / -2.0;
		this._phi      = 0.0;
		this._scale    = 1.0;
		this._timer    = null;
		elem.addEventListener( "mousedown",   this._onMouseDown .bind( this ) );
		elem.addEventListener( "mouseup",     this._onMouseUp   .bind( this ) );
		elem.addEventListener( "mousemove",   this._onMouseMove .bind( this ) );
		elem.addEventListener( "wheel",       this._onWheel     .bind( this ) );
		elem.addEventListener( "touchstart",  this._onTouchStart.bind( this ) );
		elem.addEventListener( "touchend",    this._onTouchEnd  .bind( this ) );
		elem.addEventListener( "touchcancel", this._onTouchEnd  .bind( this ) );
		elem.addEventListener( "touchmove",   this._onTouchMove .bind( this ) );
		addEventListener( "resize",            this._onResize   .bind( this ) );
		addEventListener( "deviceorientation", this._onOrientation.bind( this ) );
		this.update( false );
	}

	update( fast ) {
		if( !fast ) {
			this._renderer.resize();
		}

		const rot = zuho.Matrix.mul( 3,
			zuho.Matrix.rotation( 3, 1, 2, this._theta ),
			zuho.Matrix.rotation( 3, 0, 1, this._phi   )
		);
		this._renderer.setCamera( rot, this._scale );
		this._renderer.render( fast );
	}

	_updateDelayed() {
		clearTimeout( this._timer );
		this.update( true );
		this._timer = setTimeout( this._onTimer.bind( this ), 250 );
	}

	_touchVariance( ev ) {
		if( ev.touches.length < 2 ) {
			return null;
		}

		let xs = 0.0;
		let ys = 0.0;
		for( let t of ev.touches ) {
			xs += t.screenX;
			ys += t.screenY;
		}
		const xb = xs / ev.touches.length;
		const yb = ys / ev.touches.length;

		let s2 = 0.0;
		for( let t of ev.touches ) {
			s2 += (t.screenX - xb) * (t.screenX - xb) + (t.screenY - yb) * (t.screenY - yb);
		}
		return s2 / (ev.touches.length - 1);
	}

	_onTimer( ev ) {
		this.update( false );
	}

	_onMouseDown( ev ) {
		if( ev.button != 0 ) {
			return;
		}
		this._mousePos = [ ev.clientX, ev.clientY ];
		ev.target.setCapture();
		ev.preventDefault();
	}

	_onMouseUp( ev ) {
		this._mousePos = null;
		this.update( false );
		ev.preventDefault();
	}

	_onMouseMove( ev ) {
		if( this._mousePos === null ) {
			return;
		}

		const rect = this._element.getBoundingClientRect();
		const unit = 2.0 / Math.sqrt( rect.width * rect.height );
		const dx = ev.clientX - this._mousePos[0];
		const dy = ev.clientY - this._mousePos[1];
		if( ev.shiftKey ) {
			this._scale *= Math.exp( unit * (dx + dy) );
		}
		else {
			this._phi   -= (this._scale * unit) * dx;
			this._theta -= (this._scale * unit) * dy;
		}
		this._mousePos = [ ev.clientX, ev.clientY ];
		this.update( true );
		ev.preventDefault();
	}

	_onWheel( ev ) {
		this._scale *= Math.exp(
			ev.deltaY < 0.0 ? +0.1 :
			ev.deltaY > 0.0 ? -0.1 :
			                   0.0
		);
		this._updateDelayed();
		ev.preventDefault();
	}

	_onTouchStart( ev ) {
		this._touchVar = this._touchVariance( ev );
		ev.preventDefault();
	}

	_onTouchEnd( ev ) {
		this._touchVar = this._touchVariance( ev );
		if( this._touchVar === null ) {
			this.update( false );
		}
		ev.preventDefault();
	}

	_onTouchMove( ev ) {
		const variance = this._touchVariance( ev );
		if( this._touchVar !== null && variance !== null ) {
			this._scale *= Math.sqrt( this._touchVar / variance );
			this.update( true );
		}
		this._touchVar = variance;
		ev.preventDefault();
	}

	_onResize( ev ) {
		this.update( false );
		screen.orientation.lock( "landscape-primary" );
	}

	_onOrientation( ev ) {
		let rot = zuho.Matrix.identity( 3 );
		rot = zuho.Matrix.mul( 3, zuho.Matrix.rotation( 3, 1, 0, (Math.PI / 180.0) * ev.alpha ), rot );
		rot = zuho.Matrix.mul( 3, zuho.Matrix.rotation( 3, 2, 1, (Math.PI / 180.0) * ev.beta  ), rot );
		rot = zuho.Matrix.mul( 3, zuho.Matrix.rotation( 3, 0, 2, (Math.PI / 180.0) * ev.gamma ), rot );
		if( screen.orientation.angle !== undefined ) {
			rot = zuho.Matrix.mul( 3, zuho.Matrix.rotation( 3, 0, 1, (Math.PI / 180.0) * screen.orientation.angle ), rot );
		}
		this._renderer.setCamera( rot, this._scale );
		this._renderer.render( true );
	}
};

zuho.Menu = class {
	constructor( elem, renderer ) {
		const menu = document.createRange().createContextualFragment( zuho.Menu.template );
		for( let e of menu.querySelectorAll( ".mapping" ) ) {
			const type = e.dataset.type;
			e.onclick = function( ev ) {
				renderer.setMapping( zuho.Mapping[type] );
				renderer.render( false );
				ev.preventDefault();
			};
		}
		const e = menu.querySelector( ".fullscreen" );
		e.onclick = function( ev ) {
			elem.requestFullscreen();
		};
		elem.appendChild( menu );
	}
};

zuho.Menu.template = String.raw`
	<menu>
		<menuitem class="mapping" data-type="azPerspective">Azimuthal | Perspective</menuitem>
		<menuitem class="mapping" data-type="azConformal">Azimuthal | Conformal</menuitem>
		<menuitem class="mapping" data-type="azEquidistant">Azimuthal | Equidistant</menuitem>
		<menuitem class="mapping" data-type="azEquiarea">Azimuthal | Equiarea</menuitem>
		<menuitem class="mapping" data-type="azOrthogonal">Azimuthal | Orthogonal</menuitem>
		<menuitem class="mapping" data-type="azReflect">Azimuthal | Reflect</menuitem>
		<menuitem class="mapping" data-type="cyPerspective">Cylindrical | Perspective</menuitem>
		<menuitem class="mapping" data-type="cyConformal">Cylindrical | Conformal</menuitem>
		<menuitem class="mapping" data-type="cyEquidistant">Cylindrical | Equidistant</menuitem>
		<menuitem class="mapping" data-type="cyEquiarea">Cylindrical | Equiarea</menuitem>
		<menuitem class="mapping" data-type="mollweide">Mollweide</menuitem>
		<menuitem class="mapping" data-type="hammer">Hammer</menuitem>
		<menuitem class="mapping" data-type="eckert4">Eckert IV</menuitem>
		<hr>
		<menuitem class="fullscreen">Fullscreen</menuitem>
	</menu>
`;

zuho.stylesheet = String.raw`
	.equirectangular * {
		padding: 0;
		margin:  0;
		border: none;
		        user-select: none;
		   -moz-user-select: none;
		-webkit-user-select: none;
		    -ms-user-select: none;
	}
	.equirectangular canvas, .equirectangular menu, .equirectangular menu menuitem {
		display: block;
	}
	.equirectangular canvas {
		width:  100%;
		height: 100%;
	}
	.equirectangular menu {
		position: absolute;
		right: 0;
		top:   0;
		z-index: 1;
		font: x-small/1.0 sans-serif;
		color: #ffffff;
		background: #303030;
		opacity: 0.25;
		transition: opacity 1s;
	}
	.equirectangular menu:hover {
		opacity: 0.875;
		transition: opacity 0s;
	}
	.equirectangular menu hr {
		height: 1px;
		margin: 0.5em 1.0em;
		background: #ffffff;
	}
	.equirectangular menu menuitem {
		padding: 0.5em 1.0em;

	}
	.equirectangular menu menuitem:hover {
		background: #406080;
	}
`;

addEventListener( "DOMContentLoaded", function( ev ) {
	const style = document.createElement( "style" );
	style.textContent = zuho.stylesheet;
	document.head.insertBefore( style, document.head.firstChild );

	for( let _div of document.querySelectorAll( "div.equirectangular" ) ) {
		const div = _div;
		const img = new Image();
		img.onload = function() {
			const canvas = div.appendChild( document.createElement( "canvas" ) );
			const renderer = new zuho.Renderer( canvas );
			renderer.setImage( img );
			new zuho.Handler( canvas, renderer );
			new zuho.Menu   ( div,    renderer );
		};
		img.src = div.dataset.src;
	}
} );
