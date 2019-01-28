(function(){var $JSCompiler_prototypeAlias$$;
function $dict$$module$src$utils$object$$($opt_initial$jscomp$1$$) {
  return $opt_initial$jscomp$1$$ || {};
}
;var $optsSupported$$module$src$event_helper_listen$$;
function $internalListenImplementation$$module$src$event_helper_listen$$($element$jscomp$10$$, $eventType$jscomp$3$$, $listener$jscomp$56$$) {
  var $opt_evtListenerOpts$$ = void 0, $localElement$$ = $element$jscomp$10$$, $localListener$$ = $listener$jscomp$56$$;
  var $wrapped$$ = function($element$jscomp$10$$) {
    try {
      return $localListener$$($element$jscomp$10$$);
    } catch ($e$jscomp$7$$) {
      throw self.reportError($e$jscomp$7$$), $e$jscomp$7$$;
    }
  };
  var $optsSupported$$ = $detectEvtListenerOptsSupport$$module$src$event_helper_listen$$(), $capture$$ = !1;
  $opt_evtListenerOpts$$ && ($capture$$ = $opt_evtListenerOpts$$.capture);
  $localElement$$.addEventListener($eventType$jscomp$3$$, $wrapped$$, $optsSupported$$ ? $opt_evtListenerOpts$$ : $capture$$);
}
function $detectEvtListenerOptsSupport$$module$src$event_helper_listen$$() {
  if (void 0 !== $optsSupported$$module$src$event_helper_listen$$) {
    return $optsSupported$$module$src$event_helper_listen$$;
  }
  $optsSupported$$module$src$event_helper_listen$$ = !1;
  try {
    var $options$jscomp$13$$ = {get capture() {
      $optsSupported$$module$src$event_helper_listen$$ = !0;
    }};
    self.addEventListener("test-options", null, $options$jscomp$13$$);
    self.removeEventListener("test-options", null, $options$jscomp$13$$);
  } catch ($err$jscomp$3$$) {
  }
  return $optsSupported$$module$src$event_helper_listen$$;
}
;self.log = self.log || {user:null, dev:null, userForEmbed:null};
function $listen$$module$src$event_helper$$($element$jscomp$11$$, $eventType$jscomp$4$$, $listener$jscomp$57$$) {
  $internalListenImplementation$$module$src$event_helper_listen$$($element$jscomp$11$$, $eventType$jscomp$4$$, $listener$jscomp$57$$);
}
;function $once$$module$src$utils$function$$($fn$jscomp$2$$) {
  var $evaluated$$ = !1, $retValue$$ = null, $callback$jscomp$51$$ = $fn$jscomp$2$$;
  return function($fn$jscomp$2$$) {
    for (var $args$$ = [], $$jscomp$restIndex$$ = 0; $$jscomp$restIndex$$ < arguments.length; ++$$jscomp$restIndex$$) {
      $args$$[$$jscomp$restIndex$$ - 0] = arguments[$$jscomp$restIndex$$];
    }
    $evaluated$$ || ($retValue$$ = $callback$jscomp$51$$.apply(self, $args$$), $evaluated$$ = !0, $callback$jscomp$51$$ = null);
    return $retValue$$;
  };
}
;function $tryResolve$$module$src$utils$promise$$($fn$jscomp$3$$) {
  new Promise(function($resolve$jscomp$3$$) {
    $resolve$jscomp$3$$($fn$jscomp$3$$());
  });
}
;/*
 https://mths.be/cssescape v1.5.1 by @mathias | MIT license */
function $tryParseJson$$module$src$json$$($json$jscomp$1$$) {
  var $opt_onFailed$$;
  try {
    return JSON.parse($json$jscomp$1$$);
  } catch ($e$jscomp$15$$) {
    $opt_onFailed$$ && $opt_onFailed$$($e$jscomp$15$$);
  }
}
;function $userAssert$$module$src$video_iframe_integration$$($shouldBeTrueish$jscomp$4$$, $args$jscomp$1$$) {
  for (var $$jscomp$restParams$jscomp$1$$ = [], $$jscomp$restIndex$jscomp$1$$ = 1; $$jscomp$restIndex$jscomp$1$$ < arguments.length; ++$$jscomp$restIndex$jscomp$1$$) {
    $$jscomp$restParams$jscomp$1$$[$$jscomp$restIndex$jscomp$1$$ - 1] = arguments[$$jscomp$restIndex$jscomp$1$$];
  }
  if (!$shouldBeTrueish$jscomp$4$$) {
    throw Error($$jscomp$restParams$jscomp$1$$.join(" "));
  }
  return $shouldBeTrueish$jscomp$4$$;
}
var $validMethods$$module$src$video_iframe_integration$$ = "pause play mute unmute fullscreenenter fullscreenexit showcontrols hidecontrols".split(" "), $validEvents$$module$src$video_iframe_integration$$ = "canplay load playing pause ended muted unmuted".split(" ");
function $AmpVideoIntegration$$module$src$video_iframe_integration$$($win$jscomp$11$$) {
  var $$jscomp$this$jscomp$1$$ = this;
  this.$isAmpVideoIntegration_$ = !0;
  this.$callCounter_$ = 0;
  this.$callbacks_$ = {};
  this.$win_$ = $win$jscomp$11$$;
  this.$methods_$ = {};
  this.$listenToOnce_$ = $once$$module$src$utils$function$$(function() {
    $listenTo$$module$src$video_iframe_integration$$($$jscomp$this$jscomp$1$$.$win_$, function($win$jscomp$11$$) {
      var $JSCompiler_method$jscomp$inline_23_e$jscomp$16$$ = $win$jscomp$11$$.id;
      "number" === typeof $JSCompiler_method$jscomp$inline_23_e$jscomp$16$$ && isFinite($JSCompiler_method$jscomp$inline_23_e$jscomp$16$$) && $$jscomp$this$jscomp$1$$.$callbacks_$[$JSCompiler_method$jscomp$inline_23_e$jscomp$16$$] ? ((0,$$jscomp$this$jscomp$1$$.$callbacks_$[$JSCompiler_method$jscomp$inline_23_e$jscomp$16$$])($win$jscomp$11$$.args), delete $$jscomp$this$jscomp$1$$.$callbacks_$[$JSCompiler_method$jscomp$inline_23_e$jscomp$16$$]) : "method" == $win$jscomp$11$$.event && ($win$jscomp$11$$ = 
      $win$jscomp$11$$.method, $win$jscomp$11$$ in $$jscomp$this$jscomp$1$$.$methods_$ && $$jscomp$this$jscomp$1$$.$methods_$[$win$jscomp$11$$].call());
    });
  });
  this.$muted_$ = !1;
  this.$getMetadataOnce_$ = $once$$module$src$utils$function$$(function() {
    var $win$jscomp$11$$ = $tryParseJson$$module$src$json$$($$jscomp$this$jscomp$1$$.$win_$.name), $canonicalUrl$$ = $win$jscomp$11$$.canonicalUrl, $sourceUrl$$ = $win$jscomp$11$$.sourceUrl;
    return {canonicalUrl:$canonicalUrl$$, sourceUrl:$sourceUrl$$};
  });
}
$JSCompiler_prototypeAlias$$ = $AmpVideoIntegration$$module$src$video_iframe_integration$$.prototype;
$JSCompiler_prototypeAlias$$.getMetadata = function() {
  return this.$getMetadataOnce_$();
};
$JSCompiler_prototypeAlias$$.method = function($name$jscomp$68$$, $callback$jscomp$60$$) {
  $userAssert$$module$src$video_iframe_integration$$(-1 < $validMethods$$module$src$video_iframe_integration$$.indexOf($name$jscomp$68$$), "Invalid method " + $name$jscomp$68$$ + ".");
  var $wrappedCallback$$ = "play" == $name$jscomp$68$$ || "pause" == $name$jscomp$68$$ ? $JSCompiler_StaticMethods_safePlayOrPause_$$($callback$jscomp$60$$) : $callback$jscomp$60$$;
  this.$methods_$[$name$jscomp$68$$] = $wrappedCallback$$;
  this.$listenToOnce_$();
};
$JSCompiler_prototypeAlias$$.listenTo = function($type$jscomp$117$$, $obj$jscomp$31$$, $opt_initializer$jscomp$1$$) {
  switch($type$jscomp$117$$.toLowerCase()) {
    case "jwplayer":
      $userAssert$$module$src$video_iframe_integration$$(!$opt_initializer$jscomp$1$$, "jwplayer integration does not take an initializer");
      this.$listenToJwPlayer_$($obj$jscomp$31$$);
      break;
    case "videojs":
      $JSCompiler_StaticMethods_listenToVideoJs_$$(this, $obj$jscomp$31$$, $opt_initializer$jscomp$1$$);
      break;
    default:
      $userAssert$$module$src$video_iframe_integration$$(!1, "Invalid listener type " + $type$jscomp$117$$ + ".");
  }
};
$JSCompiler_prototypeAlias$$.$listenToJwPlayer_$ = function($player$$) {
  var $$jscomp$this$jscomp$2$$ = this, $$jscomp$arguments$$ = arguments;
  ["error", "setupError"].forEach(function($e$jscomp$17$$) {
    $player$$.on($e$jscomp$17$$, function() {
      $userAssert$$module$src$video_iframe_integration$$.apply(null, [!1].concat($$jscomp$arguments$$));
      $$jscomp$this$jscomp$2$$.postEvent("error");
    });
  });
  ["adSkipped", "adComplete", "adError"].forEach(function($$jscomp$arguments$$) {
    $player$$.on($$jscomp$arguments$$, function() {
      return $$jscomp$this$jscomp$2$$.postEvent("ad_end");
    });
  });
  $player$$.on("adStarted", function() {
    return $$jscomp$this$jscomp$2$$.postEvent("ad_start");
  });
  var $redispatchAs$$ = {play:"playing", ready:"canplay", pause:"pause"};
  Object.keys($redispatchAs$$).forEach(function($$jscomp$arguments$$) {
    $player$$.on($$jscomp$arguments$$, function() {
      return $$jscomp$this$jscomp$2$$.postEvent($redispatchAs$$[$$jscomp$arguments$$]);
    });
  });
  $player$$.on("volume", function($player$$) {
    return $JSCompiler_StaticMethods_onVolumeChange_$$($$jscomp$this$jscomp$2$$, $player$$.volume);
  });
  this.method("play", function() {
    return $player$$.play();
  });
  this.method("pause", function() {
    return $player$$.pause();
  });
  this.method("mute", function() {
    return $player$$.setMute(!0);
  });
  this.method("unmute", function() {
    return $player$$.setMute(!1);
  });
  this.method("showcontrols", function() {
    return $player$$.setControls(!0);
  });
  this.method("hidecontrols", function() {
    return $player$$.setControls(!1);
  });
  this.method("fullscreenenter", function() {
    return $player$$.setFullscreen(!0);
  });
  this.method("fullscreenexit", function() {
    return $player$$.setFullscreen(!1);
  });
};
function $JSCompiler_StaticMethods_listenToVideoJs_$$($JSCompiler_StaticMethods_listenToVideoJs_$self$$, $element$jscomp$35$$, $opt_initializer$jscomp$2$$) {
  var $initializer$$ = $userAssert$$module$src$video_iframe_integration$$($opt_initializer$jscomp$2$$ || $JSCompiler_StaticMethods_listenToVideoJs_$self$$.$win_$.videojs, "Video.JS not imported or initializer undefined."), $player$jscomp$1$$ = $initializer$$($element$jscomp$35$$);
  $player$jscomp$1$$.ready(function() {
    var $opt_initializer$jscomp$2$$ = "canplay";
    ["playing", "pause", "ended"].forEach(function($element$jscomp$35$$) {
      $player$jscomp$1$$.on($element$jscomp$35$$, function() {
        return $JSCompiler_StaticMethods_listenToVideoJs_$self$$.postEvent($element$jscomp$35$$);
      });
    });
    if (3 <= $player$jscomp$1$$.readyState()) {
      $JSCompiler_StaticMethods_listenToVideoJs_$self$$.postEvent($opt_initializer$jscomp$2$$);
    } else {
      $player$jscomp$1$$.on($opt_initializer$jscomp$2$$, function() {
        return $JSCompiler_StaticMethods_listenToVideoJs_$self$$.postEvent($opt_initializer$jscomp$2$$);
      });
    }
    $listen$$module$src$event_helper$$($element$jscomp$35$$, "volumechange", function() {
      return $JSCompiler_StaticMethods_onVolumeChange_$$($JSCompiler_StaticMethods_listenToVideoJs_$self$$, $player$jscomp$1$$.volume());
    });
    $JSCompiler_StaticMethods_listenToVideoJs_$self$$.method("play", function() {
      return $player$jscomp$1$$.play();
    });
    $JSCompiler_StaticMethods_listenToVideoJs_$self$$.method("pause", function() {
      return $player$jscomp$1$$.pause();
    });
    $JSCompiler_StaticMethods_listenToVideoJs_$self$$.method("mute", function() {
      return $player$jscomp$1$$.muted(!0);
    });
    $JSCompiler_StaticMethods_listenToVideoJs_$self$$.method("unmute", function() {
      return $player$jscomp$1$$.muted(!1);
    });
    $JSCompiler_StaticMethods_listenToVideoJs_$self$$.method("showcontrols", function() {
      return $player$jscomp$1$$.controls(!0);
    });
    $JSCompiler_StaticMethods_listenToVideoJs_$self$$.method("hidecontrols", function() {
      return $player$jscomp$1$$.controls(!1);
    });
    $JSCompiler_StaticMethods_listenToVideoJs_$self$$.method("fullscreenenter", function() {
      return $player$jscomp$1$$.requestFullscreen();
    });
    $JSCompiler_StaticMethods_listenToVideoJs_$self$$.method("fullscreenexit", function() {
      return $player$jscomp$1$$.exitFullscreen();
    });
  });
}
function $JSCompiler_StaticMethods_onVolumeChange_$$($JSCompiler_StaticMethods_onVolumeChange_$self$$, $newVolume$$) {
  0.01 > $newVolume$$ ? ($JSCompiler_StaticMethods_onVolumeChange_$self$$.$muted_$ = !0, $JSCompiler_StaticMethods_onVolumeChange_$self$$.postEvent("muted")) : $JSCompiler_StaticMethods_onVolumeChange_$self$$.$muted_$ && ($JSCompiler_StaticMethods_onVolumeChange_$self$$.$muted_$ = !1, $JSCompiler_StaticMethods_onVolumeChange_$self$$.postEvent("unmuted"));
}
function $JSCompiler_StaticMethods_safePlayOrPause_$$($callback$jscomp$62$$) {
  return function() {
    try {
      $tryResolve$$module$src$utils$promise$$(function() {
        return $callback$jscomp$62$$();
      });
    } catch ($e$jscomp$22$$) {
    }
  };
}
$JSCompiler_prototypeAlias$$.postEvent = function($event$jscomp$5$$) {
  $userAssert$$module$src$video_iframe_integration$$(-1 < $validEvents$$module$src$video_iframe_integration$$.indexOf($event$jscomp$5$$), "Invalid event " + $event$jscomp$5$$);
  $JSCompiler_StaticMethods_postToParent_$$(this, $dict$$module$src$utils$object$$({event:$event$jscomp$5$$}));
};
$JSCompiler_prototypeAlias$$.postAnalyticsEvent = function($eventType$jscomp$7$$, $opt_vars$$) {
  $JSCompiler_StaticMethods_postToParent_$$(this, $dict$$module$src$utils$object$$({event:"analytics", analytics:{eventType:$eventType$jscomp$7$$, vars:$opt_vars$$}}));
};
function $JSCompiler_StaticMethods_postToParent_$$($JSCompiler_StaticMethods_postToParent_$self$$, $data$jscomp$34$$, $opt_callback$jscomp$5$$) {
  var $id$jscomp$8$$ = $JSCompiler_StaticMethods_postToParent_$self$$.$callCounter_$++, $completeData$$ = Object.assign({id:$id$jscomp$8$$}, $data$jscomp$34$$);
  $JSCompiler_StaticMethods_postToParent_$self$$.$win_$.parent && $JSCompiler_StaticMethods_postToParent_$self$$.$win_$.parent.postMessage($completeData$$, "*");
  $opt_callback$jscomp$5$$ && ($JSCompiler_StaticMethods_postToParent_$self$$.$callbacks_$[$id$jscomp$8$$] = $opt_callback$jscomp$5$$);
}
$JSCompiler_prototypeAlias$$.getIntersection = function($callback$jscomp$63$$) {
  this.$listenToOnce_$();
  $JSCompiler_StaticMethods_postToParent_$$(this, $dict$$module$src$utils$object$$({method:"getIntersection"}), $callback$jscomp$63$$);
};
function $listenTo$$module$src$video_iframe_integration$$($win$jscomp$12$$, $onMessage$$) {
  $listen$$module$src$event_helper$$($win$jscomp$12$$, "message", function($win$jscomp$12$$) {
    ($win$jscomp$12$$ = $tryParseJson$$module$src$json$$($win$jscomp$12$$.data)) && $onMessage$$($win$jscomp$12$$);
  });
}
(function($global$$) {
  $global$$.reportError = console.error.bind(console);
  var $integration$$ = new $AmpVideoIntegration$$module$src$video_iframe_integration$$($global$$), $callbacks$$ = $global$$.AmpVideoIframe = $global$$.AmpVideoIframe || [];
  $callbacks$$.push = function($global$$) {
    return $global$$($integration$$);
  };
  $callbacks$$.forEach($callbacks$$.push);
})(self);
})();
//# sourceMappingURL=video-iframe-integration-v0.js.map

