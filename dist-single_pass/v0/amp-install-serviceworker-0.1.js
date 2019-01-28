(self.AMP=self.AMP||[]).push({n:"amp-install-serviceworker",i:["_base_i","_base_misc"],v:"1901181729101",f:(function(AMP,_){
var $AmpInstallServiceWorker$$module$extensions$amp_install_serviceworker$0_1$amp_install_serviceworker$$ = function($$jscomp$super$this$jscomp$65_element$jscomp$456$$) {
  $$jscomp$super$this$jscomp$65_element$jscomp$456$$ = window.AMP.BaseElement.call(this, $$jscomp$super$this$jscomp$65_element$jscomp$456$$) || this;
  $$jscomp$super$this$jscomp$65_element$jscomp$456$$.$iframeSrc_$ = null;
  $$jscomp$super$this$jscomp$65_element$jscomp$456$$.$urlRewriter_$ = null;
  $$jscomp$super$this$jscomp$65_element$jscomp$456$$.$isSafari_$ = _.$JSCompiler_StaticMethods_isSafari$$(_.$Services$$module$src$services$platformFor$$($$jscomp$super$this$jscomp$65_element$jscomp$456$$.$win$));
  return $$jscomp$super$this$jscomp$65_element$jscomp$456$$;
}, $JSCompiler_StaticMethods_whenLoadedAndVisiblePromise_$$ = function($JSCompiler_StaticMethods_whenLoadedAndVisiblePromise_$self$$) {
  return window.Promise.all([$JSCompiler_StaticMethods_whenLoadedAndVisiblePromise_$self$$.$loadPromise$($JSCompiler_StaticMethods_whenLoadedAndVisiblePromise_$self$$.$win$), _.$Services$$module$src$services$viewerForDoc$$($JSCompiler_StaticMethods_whenLoadedAndVisiblePromise_$self$$.$getAmpDoc$()).$D$]);
}, $JSCompiler_StaticMethods_insertIframe_$$ = function($JSCompiler_StaticMethods_insertIframe_$self$$) {
  return $JSCompiler_StaticMethods_insertIframe_$self$$.$mutateElement$(function() {
    _.$toggle$$module$src$style$$($JSCompiler_StaticMethods_insertIframe_$self$$.element, !1);
    var $iframe$jscomp$64$$ = $JSCompiler_StaticMethods_insertIframe_$self$$.$win$.document.createElement("iframe");
    $iframe$jscomp$64$$.setAttribute("sandbox", "allow-same-origin allow-scripts");
    $iframe$jscomp$64$$.src = $JSCompiler_StaticMethods_insertIframe_$self$$.$iframeSrc_$;
    $JSCompiler_StaticMethods_insertIframe_$self$$.element.appendChild($iframe$jscomp$64$$);
  });
}, $JSCompiler_StaticMethods_maybeInstallUrlRewrite_$$ = function($JSCompiler_StaticMethods_maybeInstallUrlRewrite_$self$$) {
  if ($JSCompiler_StaticMethods_maybeInstallUrlRewrite_$self$$.$getAmpDoc$().$isSingleDoc$()) {
    var $ampdoc$jscomp$181$$ = $JSCompiler_StaticMethods_maybeInstallUrlRewrite_$self$$.$getAmpDoc$(), $urlMatch_win$jscomp$354$$ = $JSCompiler_StaticMethods_maybeInstallUrlRewrite_$self$$.$win$, $urlService$jscomp$7$$ = _.$Services$$module$src$services$urlForDoc$$($JSCompiler_StaticMethods_maybeInstallUrlRewrite_$self$$.element);
    $urlService$jscomp$7$$.parse($urlMatch_win$jscomp$354$$.location.href);
    $urlMatch_win$jscomp$354$$ = $JSCompiler_StaticMethods_maybeInstallUrlRewrite_$self$$.element.getAttribute("data-no-service-worker-fallback-url-match");
    var $shellUrl$$ = $JSCompiler_StaticMethods_maybeInstallUrlRewrite_$self$$.element.getAttribute("data-no-service-worker-fallback-shell-url");
    if ($urlMatch_win$jscomp$354$$ || $shellUrl$$) {
      $shellUrl$$ = _.$removeFragment$$module$src$url$$($shellUrl$$);
      try {
        var $urlMatchExpr$$ = new RegExp($urlMatch_win$jscomp$354$$);
      } catch ($e$261$$) {
        throw _.$user$$module$src$log$$().$createError$('Invalid "data-no-service-worker-fallback-url-match" expression', $e$261$$);
      }
      $JSCompiler_StaticMethods_maybeInstallUrlRewrite_$self$$.$urlRewriter_$ = new $UrlRewriter_$$module$extensions$amp_install_serviceworker$0_1$amp_install_serviceworker$$($ampdoc$jscomp$181$$, $urlMatchExpr$$, $shellUrl$$, $JSCompiler_StaticMethods_maybeInstallUrlRewrite_$self$$.element);
      _.$JSCompiler_StaticMethods_isSecure$$($urlService$jscomp$7$$, $shellUrl$$) && $JSCompiler_StaticMethods_waitToPreloadShell_$$($JSCompiler_StaticMethods_maybeInstallUrlRewrite_$self$$, $shellUrl$$);
    }
  }
}, $JSCompiler_StaticMethods_waitToPreloadShell_$$ = function($JSCompiler_StaticMethods_waitToPreloadShell_$self$$, $shellUrl$jscomp$1$$) {
  $JSCompiler_StaticMethods_whenLoadedAndVisiblePromise_$$($JSCompiler_StaticMethods_waitToPreloadShell_$self$$).then(function() {
    $JSCompiler_StaticMethods_waitToPreloadShell_$self$$.$mutateElement$(function() {
      return $JSCompiler_StaticMethods_preloadShell_$$($JSCompiler_StaticMethods_waitToPreloadShell_$self$$, $shellUrl$jscomp$1$$);
    });
  });
}, $JSCompiler_StaticMethods_preloadShell_$$ = function($JSCompiler_StaticMethods_preloadShell_$self$$, $shellUrl$jscomp$2$$) {
  var $iframe$jscomp$65$$ = $JSCompiler_StaticMethods_preloadShell_$self$$.$win$.document.createElement("iframe");
  $iframe$jscomp$65$$.id = "i-amphtml-shell-preload";
  $iframe$jscomp$65$$.setAttribute("src", $shellUrl$jscomp$2$$ + "#preload");
  _.$toggle$$module$src$style$$($iframe$jscomp$65$$, !1);
  $iframe$jscomp$65$$.setAttribute("sandbox", "allow-scripts allow-same-origin");
  $JSCompiler_StaticMethods_preloadShell_$self$$.$loadPromise$($iframe$jscomp$65$$).then(function() {
    _.$removeElement$$module$src$dom$$($iframe$jscomp$65$$);
  });
  $JSCompiler_StaticMethods_preloadShell_$self$$.element.appendChild($iframe$jscomp$65$$);
}, $UrlRewriter_$$module$extensions$amp_install_serviceworker$0_1$amp_install_serviceworker$$ = function($ampdoc$jscomp$182$$, $urlMatchExpr$jscomp$1$$, $shellUrl$jscomp$3$$, $element$jscomp$457$$) {
  this.$win$ = $ampdoc$jscomp$182$$.$win$;
  this.$J$ = $urlMatchExpr$jscomp$1$$;
  this.$I$ = $shellUrl$jscomp$3$$;
  this.$D$ = _.$Services$$module$src$services$urlForDoc$$($element$jscomp$457$$);
  this.$F$ = this.$D$.parse($shellUrl$jscomp$3$$);
  _.$listen$$module$src$event_helper$$($ampdoc$jscomp$182$$.getRootNode(), "click", this.$G$.bind(this));
}, $install$$module$extensions$amp_install_serviceworker$0_1$amp_install_serviceworker$$ = function($win$jscomp$357$$, $src$jscomp$47$$, $element$jscomp$458$$) {
  var $options$jscomp$53$$ = {};
  $element$jscomp$458$$.hasAttribute("data-scope") && ($options$jscomp$53$$.scope = $element$jscomp$458$$.getAttribute("data-scope"));
  return $win$jscomp$357$$.navigator.serviceWorker.register($src$jscomp$47$$, $options$jscomp$53$$).then(function($src$jscomp$47$$) {
    _.$getMode$$module$src$mode$$().$development$ && _.$user$$module$src$log$$().$Log$$module$src$log_prototype$info$("amp-install-serviceworker", "ServiceWorker registration successful with scope: ", $src$jscomp$47$$.scope);
    var $options$jscomp$53$$ = $src$jscomp$47$$.installing;
    $options$jscomp$53$$ ? $options$jscomp$53$$.addEventListener("statechange", function($options$jscomp$53$$) {
      "activated" === $options$jscomp$53$$.target.state && $performServiceWorkerOptimizations$$module$extensions$amp_install_serviceworker$0_1$amp_install_serviceworker$$($src$jscomp$47$$, $win$jscomp$357$$, $element$jscomp$458$$);
    }) : $src$jscomp$47$$.active && $performServiceWorkerOptimizations$$module$extensions$amp_install_serviceworker$0_1$amp_install_serviceworker$$($src$jscomp$47$$, $win$jscomp$357$$, $element$jscomp$458$$);
    return $src$jscomp$47$$;
  }, function($win$jscomp$357$$) {
    _.$user$$module$src$log$$().error("amp-install-serviceworker", "ServiceWorker registration failed:", $win$jscomp$357$$);
  });
}, $performServiceWorkerOptimizations$$module$extensions$amp_install_serviceworker$0_1$amp_install_serviceworker$$ = function($registration$jscomp$1$$, $win$jscomp$358$$, $element$jscomp$459$$) {
  $sendAmpScriptToSwOnFirstVisit$$module$extensions$amp_install_serviceworker$0_1$amp_install_serviceworker$$($win$jscomp$358$$, $registration$jscomp$1$$);
  $element$jscomp$459$$.hasAttribute("data-prefetch") && $prefetchOutgoingLinks$$module$extensions$amp_install_serviceworker$0_1$amp_install_serviceworker$$($registration$jscomp$1$$, $win$jscomp$358$$);
}, $sendAmpScriptToSwOnFirstVisit$$module$extensions$amp_install_serviceworker$0_1$amp_install_serviceworker$$ = function($ampScriptsUsed_win$jscomp$359$$, $activeSW_registration$jscomp$2$$) {
  "performance" in $ampScriptsUsed_win$jscomp$359$$ && ($ampScriptsUsed_win$jscomp$359$$ = $ampScriptsUsed_win$jscomp$359$$.performance.getEntriesByType("resource").filter(function($ampScriptsUsed_win$jscomp$359$$) {
    return "script" === $ampScriptsUsed_win$jscomp$359$$.initiatorType && _.$startsWith$$module$src$string$$($ampScriptsUsed_win$jscomp$359$$.name, _.$urls$$module$src$config$$.cdn);
  }).map(function($ampScriptsUsed_win$jscomp$359$$) {
    return $ampScriptsUsed_win$jscomp$359$$.name;
  }), $activeSW_registration$jscomp$2$$ = $activeSW_registration$jscomp$2$$.active, $activeSW_registration$jscomp$2$$.postMessage && $activeSW_registration$jscomp$2$$.postMessage(JSON.stringify(_.$dict$$module$src$utils$object$$({type:"AMP__FIRST-VISIT-CACHING", payload:$ampScriptsUsed_win$jscomp$359$$}))));
}, $prefetchOutgoingLinks$$module$extensions$amp_install_serviceworker$0_1$amp_install_serviceworker$$ = function($activeSW$jscomp$1_registration$jscomp$3$$, $links$jscomp$2_win$jscomp$360$$) {
  var $document$jscomp$11$$ = $links$jscomp$2_win$jscomp$360$$.document;
  $links$jscomp$2_win$jscomp$360$$ = [].map.call($document$jscomp$11$$.querySelectorAll("a[data-rel=prefetch]"), function($activeSW$jscomp$1_registration$jscomp$3$$) {
    return $activeSW$jscomp$1_registration$jscomp$3$$.href;
  });
  $supportsPrefetch$$module$extensions$amp_install_serviceworker$0_1$amp_install_serviceworker$$($document$jscomp$11$$) ? $links$jscomp$2_win$jscomp$360$$.forEach(function($activeSW$jscomp$1_registration$jscomp$3$$) {
    var $links$jscomp$2_win$jscomp$360$$ = $document$jscomp$11$$.createElement("link");
    $links$jscomp$2_win$jscomp$360$$.setAttribute("rel", "prefetch");
    $links$jscomp$2_win$jscomp$360$$.setAttribute("href", $activeSW$jscomp$1_registration$jscomp$3$$);
    $document$jscomp$11$$.head.appendChild($links$jscomp$2_win$jscomp$360$$);
  }) : ($activeSW$jscomp$1_registration$jscomp$3$$ = $activeSW$jscomp$1_registration$jscomp$3$$.active, $activeSW$jscomp$1_registration$jscomp$3$$.postMessage && $activeSW$jscomp$1_registration$jscomp$3$$.postMessage(JSON.stringify(_.$dict$$module$src$utils$object$$({type:"AMP__LINK-PREFETCH", payload:$links$jscomp$2_win$jscomp$360$$}))));
}, $supportsPrefetch$$module$extensions$amp_install_serviceworker$0_1$amp_install_serviceworker$$ = function($doc$jscomp$97_fakeLink$$) {
  $doc$jscomp$97_fakeLink$$ = $doc$jscomp$97_fakeLink$$.createElement("link");
  return $doc$jscomp$97_fakeLink$$.$Na$ && $doc$jscomp$97_fakeLink$$.$Na$.supports ? $doc$jscomp$97_fakeLink$$.$Na$.supports("prefetch") : !1;
};
_.$$jscomp$inherits$$($AmpInstallServiceWorker$$module$extensions$amp_install_serviceworker$0_1$amp_install_serviceworker$$, window.AMP.BaseElement);
$AmpInstallServiceWorker$$module$extensions$amp_install_serviceworker$0_1$amp_install_serviceworker$$.prototype.$buildCallback$ = function() {
  var $$jscomp$this$jscomp$692$$ = this, $win$jscomp$353$$ = this.$win$;
  if ("serviceWorker" in $win$jscomp$353$$.navigator) {
    var $urlService$jscomp$6$$ = _.$Services$$module$src$services$urlForDoc$$(this.element), $src$jscomp$46$$ = this.element.getAttribute("src");
    if (!_.$isProxyOrigin$$module$src$url$$($src$jscomp$46$$) && !_.$isProxyOrigin$$module$src$url$$($win$jscomp$353$$.location.href) || this.$isSafari_$) {
      $urlService$jscomp$6$$.parse($win$jscomp$353$$.location.href).origin == $urlService$jscomp$6$$.parse($src$jscomp$46$$).origin ? $JSCompiler_StaticMethods_whenLoadedAndVisiblePromise_$$(this).then(function() {
        return $install$$module$extensions$amp_install_serviceworker$0_1$amp_install_serviceworker$$($$jscomp$this$jscomp$692$$.$win$, $src$jscomp$46$$, $$jscomp$this$jscomp$692$$.element);
      }) : this.$user$().error("amp-install-serviceworker", "Did not install ServiceWorker because it does not match the current origin: " + $src$jscomp$46$$);
    } else {
      var $iframeSrc$jscomp$2$$ = this.element.getAttribute("data-iframe-src");
      if ($iframeSrc$jscomp$2$$) {
        $urlService$jscomp$6$$.parse($iframeSrc$jscomp$2$$);
        var $docInfo$jscomp$5$$ = _.$Services$$module$src$services$documentInfoForDoc$$(this.element);
        $urlService$jscomp$6$$.parse($docInfo$jscomp$5$$.sourceUrl);
        $urlService$jscomp$6$$.parse($docInfo$jscomp$5$$.canonicalUrl);
        this.$iframeSrc_$ = $iframeSrc$jscomp$2$$;
        $JSCompiler_StaticMethods_whenLoadedAndVisiblePromise_$$(this).then(function() {
          return $JSCompiler_StaticMethods_insertIframe_$$($$jscomp$this$jscomp$692$$);
        });
      }
    }
    (_.$isProxyOrigin$$module$src$url$$($src$jscomp$46$$) || _.$isProxyOrigin$$module$src$url$$($win$jscomp$353$$.location.href)) && this.$isSafari_$ && this.$user$().error("amp-install-serviceworker", "Did not install ServiceWorker because of safari double keyring caching as it will not have any effect");
  } else {
    $JSCompiler_StaticMethods_maybeInstallUrlRewrite_$$(this);
  }
};
$UrlRewriter_$$module$extensions$amp_install_serviceworker$0_1$amp_install_serviceworker$$.prototype.$G$ = function($event$jscomp$143_target$jscomp$149$$) {
  if (!$event$jscomp$143_target$jscomp$149$$.defaultPrevented && ($event$jscomp$143_target$jscomp$149$$ = _.$closestByTag$$module$src$dom$$($event$jscomp$143_target$jscomp$149$$.target, "A")) && $event$jscomp$143_target$jscomp$149$$.href) {
    var $tgtLoc$jscomp$1$$ = this.$D$.parse($event$jscomp$143_target$jscomp$149$$.href);
    $tgtLoc$jscomp$1$$.origin == this.$F$.origin && $tgtLoc$jscomp$1$$.pathname != this.$F$.pathname && this.$J$.test($tgtLoc$jscomp$1$$.href) && !$event$jscomp$143_target$jscomp$149$$.getAttribute("i-amphtml-orig-href") && _.$removeFragment$$module$src$url$$($tgtLoc$jscomp$1$$.href) != _.$removeFragment$$module$src$url$$(this.$win$.location.href) && ($event$jscomp$143_target$jscomp$149$$.setAttribute("i-amphtml-orig-href", $event$jscomp$143_target$jscomp$149$$.href), $event$jscomp$143_target$jscomp$149$$.href = 
    this.$I$ + "#href=" + (0,window.encodeURIComponent)($tgtLoc$jscomp$1$$.pathname + $tgtLoc$jscomp$1$$.search + $tgtLoc$jscomp$1$$.hash));
  }
};
window.self.AMP.registerElement("amp-install-serviceworker", $AmpInstallServiceWorker$$module$extensions$amp_install_serviceworker$0_1$amp_install_serviceworker$$);

})});
