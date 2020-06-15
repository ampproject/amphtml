zuho.js - WebGL equirectangular image viewer

Features:
	- Rendering quality.
		- Use QMC sampling to handle highly nonlinear anisotropy.
		- Pseudo gamma-corrected calculation.
		- Use two shaders (better speed vs better quality) adaptively.
	- Support many projection methods.
		- It is also very easy to add custom projection functions.  See
		  "Mapping" in "zuho.js".
	- No dependencies, small, easy to use.
		- Requires only "zuho.js", which is less than 600 SLOC.

Usage:
	| <script defer src="zuho.js"></script>
	| <div class="equirectangular" data-src="your_favorite_image" style="width: 720px; height: 480px"></div>

	See "index.html" for example and "zuho.js" for detailed usage.

	Although JS API is not stable and not documented yet, it is easy to use
	because zuho.js is a tiny library.

Manipulation:
	Rotate : Left drag.
	  Zoom : Wheel or Shift + mouse left drag.

TODO:
	- UI.
	- Support touch events.
	- Interpolation when zooming.
	- Read XMP metadata.
	- More high quality rendering with WebGL2.

Tips:
	"zuhô (図法)" is the Japanese word which means "map projection method".
