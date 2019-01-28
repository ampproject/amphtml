(self.AMP=self.AMP||[]).push({n:"amp-3d-gltf",i:["_base_i","_base_media"],v:"1901181729101",f:(function(AMP,_){
var $Amp3dGltf$$module$extensions$amp_3d_gltf$0_1$amp_3d_gltf$$ = function($$jscomp$super$this$jscomp$3_element$jscomp$270$$) {
  $$jscomp$super$this$jscomp$3_element$jscomp$270$$ = window.AMP.BaseElement.call(this, $$jscomp$super$this$jscomp$3_element$jscomp$270$$) || this;
  $$jscomp$super$this$jscomp$3_element$jscomp$270$$.$iframe_$ = null;
  $$jscomp$super$this$jscomp$3_element$jscomp$270$$.$willBeReady_$ = new _.$Deferred$$module$src$utils$promise$$;
  $$jscomp$super$this$jscomp$3_element$jscomp$270$$.$willBeLoaded_$ = new _.$Deferred$$module$src$utils$promise$$;
  $$jscomp$super$this$jscomp$3_element$jscomp$270$$.$context_$ = {};
  $$jscomp$super$this$jscomp$3_element$jscomp$270$$.$unlistenMessage_$ = null;
  return $$jscomp$super$this$jscomp$3_element$jscomp$270$$;
}, $JSCompiler_StaticMethods_listenGltfViewerMessages_$$ = function($JSCompiler_StaticMethods_listenGltfViewerMessages_$self$$) {
  if ($JSCompiler_StaticMethods_listenGltfViewerMessages_$self$$.$iframe_$) {
    var $listenIframe$$ = function($listenIframe$$, $disposers$$) {
      return _.$listenFor$$module$src$iframe_helper$$($JSCompiler_StaticMethods_listenGltfViewerMessages_$self$$.$iframe_$, $listenIframe$$, $disposers$$, !0);
    }, $disposers$$ = [$listenIframe$$("ready", $JSCompiler_StaticMethods_listenGltfViewerMessages_$self$$.$willBeReady_$.resolve), $listenIframe$$("loaded", $JSCompiler_StaticMethods_listenGltfViewerMessages_$self$$.$willBeLoaded_$.resolve), $listenIframe$$("error", function() {
      $JSCompiler_StaticMethods_listenGltfViewerMessages_$self$$.$toggleFallback$(!0);
    })];
    return function() {
      return $disposers$$.forEach(function($JSCompiler_StaticMethods_listenGltfViewerMessages_$self$$) {
        return $JSCompiler_StaticMethods_listenGltfViewerMessages_$self$$();
      });
    };
  }
}, $JSCompiler_StaticMethods_sendCommandWhenReady_$$ = function($JSCompiler_StaticMethods_sendCommandWhenReady_$self$$, $action$jscomp$15$$, $args$jscomp$18$$) {
  return $JSCompiler_StaticMethods_sendCommandWhenReady_$self$$.$willBeReady_$.$promise$.then(function() {
    var $iframe$jscomp$inline_5911$$ = $JSCompiler_StaticMethods_sendCommandWhenReady_$self$$.$iframe_$;
    _.$postMessageToWindows$$module$src$iframe_helper$$($iframe$jscomp$inline_5911$$, [{$win$:$iframe$jscomp$inline_5911$$.contentWindow, origin:"*"}], "action", _.$dict$$module$src$utils$object$$({action:$action$jscomp$15$$, args:$args$jscomp$18$$}), !0);
  });
};
_.$$jscomp$inherits$$($Amp3dGltf$$module$extensions$amp_3d_gltf$0_1$amp_3d_gltf$$, window.AMP.BaseElement);
_.$JSCompiler_prototypeAlias$$ = $Amp3dGltf$$module$extensions$amp_3d_gltf$0_1$amp_3d_gltf$$.prototype;
_.$JSCompiler_prototypeAlias$$.$preconnectCallback$ = function($opt_onLayout$jscomp$1$$) {
  _.$preloadBootstrap$$module$src$3p_frame$$(this.$win$, this.$preconnect$);
  this.$preconnect$.url("https://cdnjs.cloudflare.com/ajax/libs/three.js/91/three.js", $opt_onLayout$jscomp$1$$);
  this.$preconnect$.url("https://cdn.jsdelivr.net/npm/three@0.91/examples/js/loaders/GLTFLoader.js", $opt_onLayout$jscomp$1$$);
  this.$preconnect$.url("https://cdn.jsdelivr.net/npm/three@0.91/examples/js/controls/OrbitControls.js", $opt_onLayout$jscomp$1$$);
};
_.$JSCompiler_prototypeAlias$$.$unlayoutCallback$ = function() {
  this.$iframe_$ && (_.$removeElement$$module$src$dom$$(this.$iframe_$), this.$iframe_$ = null);
  this.$unlistenMessage_$ && this.$unlistenMessage_$();
  this.$willBeReady_$ = new _.$Deferred$$module$src$utils$promise$$;
  this.$willBeLoaded_$ = new _.$Deferred$$module$src$utils$promise$$;
  return !0;
};
_.$JSCompiler_prototypeAlias$$.$buildCallback$ = function() {
  function $string$jscomp$14$$($string$jscomp$14$$) {
    return $string$jscomp$14$$;
  }
  function $bool$$($string$jscomp$14$$) {
    return "false" !== $string$jscomp$14$$;
  }
  function $getOption$$($string$jscomp$14$$, $bool$$, $getOption$$) {
    return $$jscomp$this$jscomp$242$$.element.hasAttribute($string$jscomp$14$$) ? $bool$$($$jscomp$this$jscomp$242$$.element.getAttribute($string$jscomp$14$$)) : $getOption$$;
  }
  var $$jscomp$this$jscomp$242$$ = this, $src$jscomp$17$$ = $getOption$$("src", $string$jscomp$14$$, ""), $useAlpha$$ = $getOption$$("alpha", $bool$$, !1);
  this.$context_$ = _.$dict$$module$src$utils$object$$({src:_.$resolveRelativeUrl$$module$src$url$$($src$jscomp$17$$, this.$getAmpDoc$().$AmpDoc$$module$src$service$ampdoc_impl_prototype$getUrl$()), renderer:{alpha:$useAlpha$$, antialias:$getOption$$("antialiasing", $bool$$, !0)}, rendererSettings:{clearAlpha:$useAlpha$$ ? 0 : 1, clearColor:$getOption$$("clearColor", $string$jscomp$14$$, "#fff"), maxPixelRatio:$getOption$$("maxPixelRatio", function($string$jscomp$14$$) {
    return (0,window.parseFloat)($string$jscomp$14$$);
  }, window.devicePixelRatio || 1)}, controls:{enableZoom:$getOption$$("enableZoom", $bool$$, !0), autoRotate:$getOption$$("autoRotate", $bool$$, !1)}});
  _.$JSCompiler_StaticMethods_registerAction$$(this, "setModelRotation", function($string$jscomp$14$$) {
    $JSCompiler_StaticMethods_sendCommandWhenReady_$$($$jscomp$this$jscomp$242$$, "setModelRotation", $string$jscomp$14$$.args).catch(function($string$jscomp$14$$) {
      return _.$dev$$module$src$log$$().error("AMP-3D-GLTF", "setModelRotation failed: %s", $string$jscomp$14$$);
    });
  }, 1);
};
_.$JSCompiler_prototypeAlias$$.$layoutCallback$ = function() {
  var $canvas$jscomp$inline_2111_gl$jscomp$inline_2112_iframe$jscomp$18$$ = window.document.createElement("canvas");
  $canvas$jscomp$inline_2111_gl$jscomp$inline_2112_iframe$jscomp$18$$ = $canvas$jscomp$inline_2111_gl$jscomp$inline_2112_iframe$jscomp$18$$.getContext("webgl") || $canvas$jscomp$inline_2111_gl$jscomp$inline_2112_iframe$jscomp$18$$.getContext("experimental-webgl");
  if (!($canvas$jscomp$inline_2111_gl$jscomp$inline_2112_iframe$jscomp$18$$ && $canvas$jscomp$inline_2111_gl$jscomp$inline_2112_iframe$jscomp$18$$ instanceof window.WebGLRenderingContext)) {
    return this.$toggleFallback$(!0), window.Promise.resolve();
  }
  $canvas$jscomp$inline_2111_gl$jscomp$inline_2112_iframe$jscomp$18$$ = _.$getIframe$$module$src$3p_frame$$(this.$win$, this.element, "3d-gltf", this.$context_$);
  _.$JSCompiler_StaticMethods_applyFillContent$$($canvas$jscomp$inline_2111_gl$jscomp$inline_2112_iframe$jscomp$18$$, !0);
  this.$iframe_$ = $canvas$jscomp$inline_2111_gl$jscomp$inline_2112_iframe$jscomp$18$$;
  this.$unlistenMessage_$ = $JSCompiler_StaticMethods_listenGltfViewerMessages_$$(this);
  this.element.appendChild(this.$iframe_$);
  return this.$willBeLoaded_$.$promise$;
};
_.$JSCompiler_prototypeAlias$$.$viewportCallback$ = function($inViewport$jscomp$6$$) {
  return $JSCompiler_StaticMethods_sendCommandWhenReady_$$(this, "toggleAmpViewport", $inViewport$jscomp$6$$);
};
_.$JSCompiler_prototypeAlias$$.$pauseCallback$ = function() {
  $JSCompiler_StaticMethods_sendCommandWhenReady_$$(this, "toggleAmpPlay", !1);
};
_.$JSCompiler_prototypeAlias$$.$resumeCallback$ = function() {
  $JSCompiler_StaticMethods_sendCommandWhenReady_$$(this, "toggleAmpPlay", !0);
};
_.$JSCompiler_prototypeAlias$$.$onLayoutMeasure$ = function() {
  var $box$jscomp$12$$ = this.$getLayoutBox$();
  $JSCompiler_StaticMethods_sendCommandWhenReady_$$(this, "setSize", _.$dict$$module$src$utils$object$$({width:$box$jscomp$12$$.width, height:$box$jscomp$12$$.height}));
};
_.$JSCompiler_prototypeAlias$$.$isLayoutSupported$ = function($layout$jscomp$25$$) {
  return _.$isLayoutSizeDefined$$module$src$layout$$($layout$jscomp$25$$);
};
window.self.AMP.registerElement("amp-3d-gltf", $Amp3dGltf$$module$extensions$amp_3d_gltf$0_1$amp_3d_gltf$$);

})});
