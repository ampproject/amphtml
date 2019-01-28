(self.AMP=self.AMP||[]).push({n:"amp-bind",i:["_base_i","_base_misc"],v:"1901181729101",f:(function(AMP,_){
var $JSCompiler_StaticMethods_onMessageRespond$$ = function($JSCompiler_StaticMethods_onMessageRespond$self$$, $responder$$) {
  $JSCompiler_StaticMethods_onMessageRespond$self$$.$qa$.premutate = $responder$$;
}, $ownProperty$$module$src$utils$object$$ = function($obj$jscomp$27$$, $key$jscomp$36$$) {
  if (_.$hasOwn$$module$src$utils$object$$($obj$jscomp$27$$, $key$jscomp$36$$)) {
    return $obj$jscomp$27$$[$key$jscomp$36$$];
  }
}, $deepEquals$$module$src$json$$ = function($a$jscomp$1_queue$jscomp$1$$, $a$109_b$jscomp$2$$) {
  var $b$110_depth$jscomp$2$$ = 10;
  $b$110_depth$jscomp$2$$ = void 0 === $b$110_depth$jscomp$2$$ ? 5 : $b$110_depth$jscomp$2$$;
  if (!(0,window.isFinite)($b$110_depth$jscomp$2$$) || 0 > $b$110_depth$jscomp$2$$) {
    throw Error("Invalid depth: " + $b$110_depth$jscomp$2$$);
  }
  if ($a$jscomp$1_queue$jscomp$1$$ === $a$109_b$jscomp$2$$) {
    return !0;
  }
  for ($a$jscomp$1_queue$jscomp$1$$ = [{a:$a$jscomp$1_queue$jscomp$1$$, b:$a$109_b$jscomp$2$$, depth:$b$110_depth$jscomp$2$$}]; 0 < $a$jscomp$1_queue$jscomp$1$$.length;) {
    var $$jscomp$destructuring$var5_depth$111$$ = $a$jscomp$1_queue$jscomp$1$$.shift();
    $a$109_b$jscomp$2$$ = $$jscomp$destructuring$var5_depth$111$$.a;
    $b$110_depth$jscomp$2$$ = $$jscomp$destructuring$var5_depth$111$$.b;
    $$jscomp$destructuring$var5_depth$111$$ = $$jscomp$destructuring$var5_depth$111$$.depth;
    if (0 < $$jscomp$destructuring$var5_depth$111$$) {
      if (typeof $a$109_b$jscomp$2$$ !== typeof $b$110_depth$jscomp$2$$) {
        return !1;
      }
      if (Array.isArray($a$109_b$jscomp$2$$) && Array.isArray($b$110_depth$jscomp$2$$)) {
        if ($a$109_b$jscomp$2$$.length !== $b$110_depth$jscomp$2$$.length) {
          return !1;
        }
        for (var $i$jscomp$12_keysA$$ = 0; $i$jscomp$12_keysA$$ < $a$109_b$jscomp$2$$.length; $i$jscomp$12_keysA$$++) {
          $a$jscomp$1_queue$jscomp$1$$.push({a:$a$109_b$jscomp$2$$[$i$jscomp$12_keysA$$], b:$b$110_depth$jscomp$2$$[$i$jscomp$12_keysA$$], depth:$$jscomp$destructuring$var5_depth$111$$ - 1});
        }
        continue;
      } else {
        if ($a$109_b$jscomp$2$$ && $b$110_depth$jscomp$2$$ && "object" === typeof $a$109_b$jscomp$2$$ && "object" === typeof $b$110_depth$jscomp$2$$) {
          $i$jscomp$12_keysA$$ = Object.keys($a$109_b$jscomp$2$$);
          var $i$112_keysB$$ = Object.keys($b$110_depth$jscomp$2$$);
          if ($i$jscomp$12_keysA$$.length !== $i$112_keysB$$.length) {
            return !1;
          }
          for ($i$112_keysB$$ = 0; $i$112_keysB$$ < $i$jscomp$12_keysA$$.length; $i$112_keysB$$++) {
            var $k$jscomp$2$$ = $i$jscomp$12_keysA$$[$i$112_keysB$$];
            $a$jscomp$1_queue$jscomp$1$$.push({a:$a$109_b$jscomp$2$$[$k$jscomp$2$$], b:$b$110_depth$jscomp$2$$[$k$jscomp$2$$], depth:$$jscomp$destructuring$var5_depth$111$$ - 1});
          }
          continue;
        }
      }
    }
    if ($a$109_b$jscomp$2$$ !== $b$110_depth$jscomp$2$$) {
      return !1;
    }
  }
  return !0;
}, $calculateEntryPointScriptUrl$$module$src$service$extension_location$$ = function() {
  var $base$jscomp$3$$ = _.$urls$$module$src$config$$.cdn, $spPath$jscomp$1$$ = _.$getMode$$module$src$mode$$().$singlePassType$ ? _.$getMode$$module$src$mode$$().$singlePassType$ + "/" : "";
  return $base$jscomp$3$$ + "/rtv/" + _.$getMode$$module$src$mode$$().$rtvVersion$ + "/" + $spPath$jscomp$1$$ + "ww.js";
}, $AmpWorker$$module$src$web_worker$amp_worker$$ = function($win$jscomp$335$$) {
  var $$jscomp$this$jscomp$462$$ = this;
  this.$J$ = $win$jscomp$335$$;
  this.$xhr_$ = _.$Services$$module$src$services$xhrFor$$($win$jscomp$335$$);
  var $url$jscomp$178$$ = $calculateEntryPointScriptUrl$$module$src$service$extension_location$$();
  "web-worker";
  this.$F$ = null;
  this.$K$ = _.$JSCompiler_StaticMethods_fetchText$$(this.$xhr_$, $url$jscomp$178$$, {ampCors:!1}).then(function($win$jscomp$335$$) {
    return $win$jscomp$335$$.text();
  }).then(function($blob$jscomp$11_blobUrl_text$jscomp$16$$) {
    $blob$jscomp$11_blobUrl_text$jscomp$16$$ = new $win$jscomp$335$$.Blob([$blob$jscomp$11_blobUrl_text$jscomp$16$$ + "\n//# sourceurl=" + $url$jscomp$178$$], {type:"text/javascript"});
    $blob$jscomp$11_blobUrl_text$jscomp$16$$ = $win$jscomp$335$$.URL.createObjectURL($blob$jscomp$11_blobUrl_text$jscomp$16$$);
    $$jscomp$this$jscomp$462$$.$F$ = new $win$jscomp$335$$.Worker($blob$jscomp$11_blobUrl_text$jscomp$16$$);
    $$jscomp$this$jscomp$462$$.$F$.onmessage = $$jscomp$this$jscomp$462$$.$O$.bind($$jscomp$this$jscomp$462$$);
  });
  this.$D$ = {};
  this.$I$ = 0;
  this.$G$ = [$win$jscomp$335$$];
}, $AmpBindMacro$$module$extensions$amp_bind$0_1$amp_bind_macro$$ = function($var_args$jscomp$69$$) {
  return window.AMP.BaseElement.apply(this, arguments) || this;
}, $AmpState$$module$extensions$amp_bind$0_1$amp_state$$ = function($var_args$jscomp$70$$) {
  return window.AMP.BaseElement.apply(this, arguments) || this;
}, $JSCompiler_StaticMethods_AmpState$$module$extensions$amp_bind$0_1$amp_state_prototype$initialize_$$ = function($JSCompiler_StaticMethods_AmpState$$module$extensions$amp_bind$0_1$amp_state_prototype$initialize_$self$$) {
  var $element$jscomp$346$$ = $JSCompiler_StaticMethods_AmpState$$module$extensions$amp_bind$0_1$amp_state_prototype$initialize_$self$$.element;
  $element$jscomp$346$$.hasAttribute("overridable") && _.$getElementServiceIfAvailableForDocInEmbedScope$$module$src$element_service$$($element$jscomp$346$$).then(function($JSCompiler_StaticMethods_AmpState$$module$extensions$amp_bind$0_1$amp_state_prototype$initialize_$self$$) {
    var $bind$jscomp$2$$ = $element$jscomp$346$$.getAttribute("id");
    $JSCompiler_StaticMethods_AmpState$$module$extensions$amp_bind$0_1$amp_state_prototype$initialize_$self$$.$W$.push($bind$jscomp$2$$);
  });
  0 < $element$jscomp$346$$.children.length && $JSCompiler_StaticMethods_parseChildAndUpdateState_$$($JSCompiler_StaticMethods_AmpState$$module$extensions$amp_bind$0_1$amp_state_prototype$initialize_$self$$);
  $JSCompiler_StaticMethods_AmpState$$module$extensions$amp_bind$0_1$amp_state_prototype$initialize_$self$$.element.hasAttribute("src") && $JSCompiler_StaticMethods_fetchAndUpdate_$$($JSCompiler_StaticMethods_AmpState$$module$extensions$amp_bind$0_1$amp_state_prototype$initialize_$self$$, !0);
  _.$JSCompiler_StaticMethods_registerAction$$($JSCompiler_StaticMethods_AmpState$$module$extensions$amp_bind$0_1$amp_state_prototype$initialize_$self$$, "refresh", function() {
    $JSCompiler_StaticMethods_fetchAndUpdate_$$($JSCompiler_StaticMethods_AmpState$$module$extensions$amp_bind$0_1$amp_state_prototype$initialize_$self$$, !1, !0);
  }, 100);
}, $JSCompiler_StaticMethods_parseChildAndUpdateState_$$ = function($JSCompiler_StaticMethods_parseChildAndUpdateState_$self$$) {
  var $TAG$jscomp$16$$ = $JSCompiler_StaticMethods_AmpState$$module$extensions$amp_bind$0_1$amp_state_prototype$getName_$$($JSCompiler_StaticMethods_parseChildAndUpdateState_$self$$), $children$jscomp$132_firstChild_json$jscomp$13$$ = $JSCompiler_StaticMethods_parseChildAndUpdateState_$self$$.element.children;
  1 != $children$jscomp$132_firstChild_json$jscomp$13$$.length ? $JSCompiler_StaticMethods_parseChildAndUpdateState_$self$$.$user$().error($TAG$jscomp$16$$, "Should contain exactly one <script> child.") : ($children$jscomp$132_firstChild_json$jscomp$13$$ = $children$jscomp$132_firstChild_json$jscomp$13$$[0], _.$isJsonScriptTag$$module$src$dom$$($children$jscomp$132_firstChild_json$jscomp$13$$) ? ($children$jscomp$132_firstChild_json$jscomp$13$$ = _.$tryParseJson$$module$src$json$$($children$jscomp$132_firstChild_json$jscomp$13$$.textContent, 
  function($children$jscomp$132_firstChild_json$jscomp$13$$) {
    $JSCompiler_StaticMethods_parseChildAndUpdateState_$self$$.$user$().error($TAG$jscomp$16$$, "Failed to parse state. Is it valid JSON?", $children$jscomp$132_firstChild_json$jscomp$13$$);
  }), $JSCompiler_StaticMethods_updateState_$$($JSCompiler_StaticMethods_parseChildAndUpdateState_$self$$, $children$jscomp$132_firstChild_json$jscomp$13$$, !0)) : $JSCompiler_StaticMethods_parseChildAndUpdateState_$self$$.$user$().error($TAG$jscomp$16$$, 'State should be in a <script> tag with type="application/json".'));
}, $JSCompiler_StaticMethods_AmpState$$module$extensions$amp_bind$0_1$amp_state_prototype$fetch_$$ = function($ampdoc$jscomp$146$$, $element$jscomp$347$$, $isInit$$, $opt_refresh$jscomp$1$$) {
  var $src$jscomp$25$$ = $element$jscomp$347$$.getAttribute("src"), $policy$jscomp$1$$ = 1;
  if ($isInit$$ || _.$getSourceOrigin$$module$src$url$$($src$jscomp$25$$) == _.$getSourceOrigin$$module$src$url$$($ampdoc$jscomp$146$$.$win$.location)) {
    $policy$jscomp$1$$ = 2;
  }
  return _.$batchFetchJsonFor$$module$src$batched_json$$($ampdoc$jscomp$146$$, $element$jscomp$347$$, void 0, $policy$jscomp$1$$, $opt_refresh$jscomp$1$$);
}, $JSCompiler_StaticMethods_fetchAndUpdate_$$ = function($JSCompiler_StaticMethods_fetchAndUpdate_$self$$, $isInit$jscomp$1$$, $opt_refresh$jscomp$2$$) {
  var $ampdoc$jscomp$147$$ = $JSCompiler_StaticMethods_fetchAndUpdate_$self$$.$getAmpDoc$();
  $JSCompiler_StaticMethods_AmpState$$module$extensions$amp_bind$0_1$amp_state_prototype$fetch_$$($ampdoc$jscomp$147$$, $JSCompiler_StaticMethods_fetchAndUpdate_$self$$.element, $isInit$jscomp$1$$, $opt_refresh$jscomp$2$$).then(function($opt_refresh$jscomp$2$$) {
    $JSCompiler_StaticMethods_updateState_$$($JSCompiler_StaticMethods_fetchAndUpdate_$self$$, $opt_refresh$jscomp$2$$, $isInit$jscomp$1$$);
  });
}, $JSCompiler_StaticMethods_updateState_$$ = function($JSCompiler_StaticMethods_updateState_$self$$, $json$jscomp$15$$, $isInit$jscomp$2$$) {
  if (void 0 !== $json$jscomp$15$$ && null !== $json$jscomp$15$$) {
    var $id$jscomp$64$$ = $JSCompiler_StaticMethods_updateState_$self$$.element.id, $state$jscomp$51$$ = _.$map$$module$src$utils$object$$();
    $state$jscomp$51$$[$id$jscomp$64$$] = $json$jscomp$15$$;
    _.$getElementServiceIfAvailableForDocInEmbedScope$$module$src$element_service$$($JSCompiler_StaticMethods_updateState_$self$$.element).then(function($JSCompiler_StaticMethods_updateState_$self$$) {
      $JSCompiler_StaticMethods_updateState_$self$$.setState($state$jscomp$51$$, $isInit$jscomp$2$$, !$isInit$jscomp$2$$);
    });
  }
}, $JSCompiler_StaticMethods_AmpState$$module$extensions$amp_bind$0_1$amp_state_prototype$getName_$$ = function($JSCompiler_StaticMethods_AmpState$$module$extensions$amp_bind$0_1$amp_state_prototype$getName_$self$$) {
  return "<amp-state> " + ($JSCompiler_StaticMethods_AmpState$$module$extensions$amp_bind$0_1$amp_state_prototype$getName_$self$$.element.getAttribute("id") || "<unknown id>");
}, $BindValidator$$module$extensions$amp_bind$0_1$bind_validator$$ = function($allowUrlBindings$$) {
  this.$D$ = $allowUrlBindings$$;
}, $Bind$$module$extensions$amp_bind$0_1$bind_impl$$ = function($ampdoc$jscomp$148$$, $opt_win$jscomp$3$$) {
  var $$jscomp$this$jscomp$468$$ = this;
  this.ampdoc = $ampdoc$jscomp$148$$;
  this.$J$ = $ampdoc$jscomp$148$$.$win$;
  this.$G$ = $opt_win$jscomp$3$$ || $ampdoc$jscomp$148$$.$win$;
  this.$K$ = [];
  this.$Y$ = _.$debounce$$module$src$utils$rate_limit$$(this.$J$, function() {
    $$jscomp$this$jscomp$468$$.$K$.length = 0;
  }, 5000);
  this.$D$ = [];
  this.$F$ = _.$map$$module$src$utils$object$$();
  this.$history_$ = _.$Services$$module$src$services$historyForDoc$$($ampdoc$jscomp$148$$);
  this.$W$ = [];
  this.$I$ = 1000;
  this.$R$ = _.$Services$$module$src$services$resourcesForDoc$$($ampdoc$jscomp$148$$);
  this.$state_$ = _.$map$$module$src$utils$object$$();
  this.$timer_$ = _.$Services$$module$src$services$timerFor$$(this.$J$);
  this.$V$ = null;
  this.$viewer_$ = _.$Services$$module$src$services$viewerForDoc$$(this.ampdoc);
  $JSCompiler_StaticMethods_onMessageRespond$$(this.$viewer_$, this.$premutate_$.bind(this));
  this.$O$ = this.$viewer_$.$D$.then(function() {
    if ($opt_win$jscomp$3$$) {
      var $$jscomp$this$jscomp$468$$ = $opt_win$jscomp$3$$.document;
      return _.$whenDocumentReady$$module$src$document_ready$$($$jscomp$this$jscomp$468$$).then(function() {
        return $$jscomp$this$jscomp$468$$;
      });
    }
    return $ampdoc$jscomp$148$$.$whenReady$().then(function() {
      return $ampdoc$jscomp$148$$.getRootNode();
    });
  }).then(function($ampdoc$jscomp$148$$) {
    return $JSCompiler_StaticMethods_Bind$$module$extensions$amp_bind$0_1$bind_impl_prototype$initialize_$$($$jscomp$this$jscomp$468$$, $ampdoc$jscomp$148$$);
  });
  this.$P$ = null;
  this.$U$ = new _.$Signals$$module$src$utils$signals$$;
  var $g$jscomp$44$$ = window.self.AMP;
  $g$jscomp$44$$.$printState$ = $g$jscomp$44$$.$printState$ || this.$debugPrintState_$.bind(this);
  $g$jscomp$44$$.setState = $g$jscomp$44$$.setState || function($ampdoc$jscomp$148$$) {
    return $$jscomp$this$jscomp$468$$.setState($ampdoc$jscomp$148$$);
  };
  $g$jscomp$44$$.eval = $g$jscomp$44$$.eval || this.$debugEvaluate_$.bind(this);
}, $JSCompiler_StaticMethods_setStateWithExpression$$ = function($JSCompiler_StaticMethods_setStateWithExpression$self$$, $expression$jscomp$5$$, $scope$jscomp$16$$) {
  _.$dev$$module$src$log$$().$Log$$module$src$log_prototype$info$("amp-bind", "setState:", '"' + $expression$jscomp$5$$ + '"');
  $JSCompiler_StaticMethods_setStateWithExpression$self$$.$P$ = $JSCompiler_StaticMethods_evaluateExpression_$$($JSCompiler_StaticMethods_setStateWithExpression$self$$, $expression$jscomp$5$$, $scope$jscomp$16$$).then(function($expression$jscomp$5$$) {
    return $JSCompiler_StaticMethods_setStateWithExpression$self$$.setState($expression$jscomp$5$$);
  }).then(function() {
    $JSCompiler_StaticMethods_setStateWithExpression$self$$.$history_$.replace({data:_.$dict$$module$src$utils$object$$({"amp-bind":$JSCompiler_StaticMethods_setStateWithExpression$self$$.$state_$}), title:$JSCompiler_StaticMethods_setStateWithExpression$self$$.$G$.document.title});
  });
  return $JSCompiler_StaticMethods_setStateWithExpression$self$$.$P$;
}, $JSCompiler_StaticMethods_pushStateWithExpression$$ = function($JSCompiler_StaticMethods_pushStateWithExpression$self$$, $expression$jscomp$6$$, $scope$jscomp$17$$) {
  _.$dev$$module$src$log$$().$Log$$module$src$log_prototype$info$("amp-bind", "pushState:", $expression$jscomp$6$$);
  return $JSCompiler_StaticMethods_evaluateExpression_$$($JSCompiler_StaticMethods_pushStateWithExpression$self$$, $expression$jscomp$6$$, $scope$jscomp$17$$).then(function($expression$jscomp$6$$) {
    function $scope$jscomp$17$$() {
      return $JSCompiler_StaticMethods_pushStateWithExpression$self$$.setState($result$jscomp$47$$);
    }
    var $result$jscomp$47$$ = _.$map$$module$src$utils$object$$();
    Object.keys($expression$jscomp$6$$).forEach(function($expression$jscomp$6$$) {
      a: {
        var $scope$jscomp$17$$ = $JSCompiler_StaticMethods_pushStateWithExpression$self$$.$state_$[$expression$jscomp$6$$];
        if (void 0 !== $scope$jscomp$17$$) {
          try {
            var $onPop$$ = _.$parseJson$$module$src$json$$(JSON.stringify($scope$jscomp$17$$));
            break a;
          } catch ($e$242$jscomp$inline_2840$$) {
            _.$dev$$module$src$log$$().error("amp-bind", "Failed to copy JSON (" + $scope$jscomp$17$$ + ") with error: " + $e$242$jscomp$inline_2840$$);
          }
        }
        $onPop$$ = null;
      }
      $result$jscomp$47$$[$expression$jscomp$6$$] = $onPop$$;
    });
    return $JSCompiler_StaticMethods_pushStateWithExpression$self$$.setState($expression$jscomp$6$$).then(function() {
      $JSCompiler_StaticMethods_pushStateWithExpression$self$$.$history_$.push($scope$jscomp$17$$, {data:_.$dict$$module$src$utils$object$$({"amp-bind":$JSCompiler_StaticMethods_pushStateWithExpression$self$$.$state_$}), title:$JSCompiler_StaticMethods_pushStateWithExpression$self$$.$G$.document.title});
    });
  });
}, $JSCompiler_StaticMethods_Bind$$module$extensions$amp_bind$0_1$bind_impl_prototype$initialize_$$ = function($JSCompiler_StaticMethods_Bind$$module$extensions$amp_bind$0_1$bind_impl_prototype$initialize_$self$$, $root$jscomp$62$$) {
  _.$dev$$module$src$log$$().$Log$$module$src$log_prototype$info$("amp-bind", "init");
  var $allowUrlProperties$$ = !$JSCompiler_StaticMethods_isAmp4Email_$$($JSCompiler_StaticMethods_Bind$$module$extensions$amp_bind$0_1$bind_impl_prototype$initialize_$self$$);
  $JSCompiler_StaticMethods_Bind$$module$extensions$amp_bind$0_1$bind_impl_prototype$initialize_$self$$.$V$ = new $BindValidator$$module$extensions$amp_bind$0_1$bind_validator$$($allowUrlProperties$$);
  return $JSCompiler_StaticMethods_ww_$$($JSCompiler_StaticMethods_Bind$$module$extensions$amp_bind$0_1$bind_impl_prototype$initialize_$self$$, "bind.init", [$allowUrlProperties$$]).then(function() {
    return window.Promise.all([$JSCompiler_StaticMethods_addMacros_$$($JSCompiler_StaticMethods_Bind$$module$extensions$amp_bind$0_1$bind_impl_prototype$initialize_$self$$), $JSCompiler_StaticMethods_addBindingsForNodes_$$($JSCompiler_StaticMethods_Bind$$module$extensions$amp_bind$0_1$bind_impl_prototype$initialize_$self$$, [$root$jscomp$62$$])]);
  }).then(function($allowUrlProperties$$) {
    _.$dev$$module$src$log$$().$Log$$module$src$log_prototype$info$("amp-bind", "\u2937", "\u0394:", $allowUrlProperties$$);
    $root$jscomp$62$$.addEventListener("amp:dom-update", function($root$jscomp$62$$) {
      return $JSCompiler_StaticMethods_Bind$$module$extensions$amp_bind$0_1$bind_impl_prototype$onDomUpdate_$$($JSCompiler_StaticMethods_Bind$$module$extensions$amp_bind$0_1$bind_impl_prototype$initialize_$self$$, $root$jscomp$62$$);
    });
    if (_.$getMode$$module$src$mode$$().$development$) {
      return $JSCompiler_StaticMethods_evaluate_$$($JSCompiler_StaticMethods_Bind$$module$extensions$amp_bind$0_1$bind_impl_prototype$initialize_$self$$).then(function($root$jscomp$62$$) {
        return $JSCompiler_StaticMethods_Bind$$module$extensions$amp_bind$0_1$bind_impl_prototype$verify_$$($JSCompiler_StaticMethods_Bind$$module$extensions$amp_bind$0_1$bind_impl_prototype$initialize_$self$$, $root$jscomp$62$$);
      });
    }
  }).then(function() {
    _.$JSCompiler_StaticMethods_Viewer$$module$src$service$viewer_impl_prototype$sendMessage$$($JSCompiler_StaticMethods_Bind$$module$extensions$amp_bind$0_1$bind_impl_prototype$initialize_$self$$.$viewer_$, "bindReady", void 0);
  });
}, $JSCompiler_StaticMethods_isAmp4Email_$$ = function($JSCompiler_StaticMethods_isAmp4Email_$self_html$jscomp$8$$) {
  $JSCompiler_StaticMethods_isAmp4Email_$self_html$jscomp$8$$ = $JSCompiler_StaticMethods_isAmp4Email_$self_html$jscomp$8$$.$G$.document.documentElement;
  return $JSCompiler_StaticMethods_isAmp4Email_$self_html$jscomp$8$$.hasAttribute("amp4email") || $JSCompiler_StaticMethods_isAmp4Email_$self_html$jscomp$8$$.hasAttribute("\u26a14email");
}, $JSCompiler_StaticMethods_numberOfBindings$$ = function($JSCompiler_StaticMethods_numberOfBindings$self$$) {
  return $JSCompiler_StaticMethods_numberOfBindings$self$$.$D$.reduce(function($JSCompiler_StaticMethods_numberOfBindings$self$$, $boundElement$$) {
    return $JSCompiler_StaticMethods_numberOfBindings$self$$ + $boundElement$$.$boundProperties$.length;
  }, 0);
}, $JSCompiler_StaticMethods_addMacros_$$ = function($JSCompiler_StaticMethods_addMacros_$self$$) {
  var $elements$jscomp$20$$ = $JSCompiler_StaticMethods_addMacros_$self$$.ampdoc.$getBody$().querySelectorAll("AMP-BIND-MACRO"), $macros$jscomp$4$$ = [];
  _.$iterateCursor$$module$src$dom$$($elements$jscomp$20$$, function($JSCompiler_StaticMethods_addMacros_$self$$) {
    var $elements$jscomp$20$$ = ($JSCompiler_StaticMethods_addMacros_$self$$.getAttribute("arguments") || "").split(",").map(function($JSCompiler_StaticMethods_addMacros_$self$$) {
      return $JSCompiler_StaticMethods_addMacros_$self$$.trim();
    });
    $macros$jscomp$4$$.push({id:$JSCompiler_StaticMethods_addMacros_$self$$.getAttribute("id"), argumentNames:$elements$jscomp$20$$, expressionString:$JSCompiler_StaticMethods_addMacros_$self$$.getAttribute("expression")});
  });
  return 0 == $macros$jscomp$4$$.length ? window.Promise.resolve(0) : $JSCompiler_StaticMethods_ww_$$($JSCompiler_StaticMethods_addMacros_$self$$, "bind.addMacros", [$macros$jscomp$4$$]).then(function($JSCompiler_StaticMethods_addMacros_$self$$) {
    $JSCompiler_StaticMethods_addMacros_$self$$.forEach(function($JSCompiler_StaticMethods_addMacros_$self$$, $macros$jscomp$4$$) {
      $JSCompiler_StaticMethods_reportWorkerError_$$($JSCompiler_StaticMethods_addMacros_$self$$, "amp-bind: Parsing amp-bind-macro failed.", $elements$jscomp$20$$[$macros$jscomp$4$$]);
    });
    return $macros$jscomp$4$$.length;
  });
}, $JSCompiler_StaticMethods_addBindingsForNodes_$$ = function($JSCompiler_StaticMethods_addBindingsForNodes_$self$$, $nodes$jscomp$4_scanPromises$$) {
  $nodes$jscomp$4_scanPromises$$ = $nodes$jscomp$4_scanPromises$$.map(function($nodes$jscomp$4_scanPromises$$) {
    var $node$jscomp$73$$ = $JSCompiler_StaticMethods_addBindingsForNodes_$self$$.$I$ - $JSCompiler_StaticMethods_numberOfBindings$$($JSCompiler_StaticMethods_addBindingsForNodes_$self$$);
    return $JSCompiler_StaticMethods_scanNode_$$($JSCompiler_StaticMethods_addBindingsForNodes_$self$$, $nodes$jscomp$4_scanPromises$$, $node$jscomp$73$$).then(function($nodes$jscomp$4_scanPromises$$) {
      var $node$jscomp$73$$ = $nodes$jscomp$4_scanPromises$$.$bindings$;
      $nodes$jscomp$4_scanPromises$$.$limitExceeded$ && $JSCompiler_StaticMethods_emitMaxBindingsExceededError_$$($JSCompiler_StaticMethods_addBindingsForNodes_$self$$);
      return $node$jscomp$73$$;
    });
  });
  return window.Promise.all($nodes$jscomp$4_scanPromises$$).then(function($nodes$jscomp$4_scanPromises$$) {
    $nodes$jscomp$4_scanPromises$$ = Array.prototype.concat.apply([], $nodes$jscomp$4_scanPromises$$);
    return 0 < $nodes$jscomp$4_scanPromises$$.length ? $JSCompiler_StaticMethods_sendBindingsToWorker_$$($JSCompiler_StaticMethods_addBindingsForNodes_$self$$, $nodes$jscomp$4_scanPromises$$) : 0;
  });
}, $JSCompiler_StaticMethods_emitMaxBindingsExceededError_$$ = function($JSCompiler_StaticMethods_emitMaxBindingsExceededError_$self$$) {
  _.$dev$$module$src$log$$().$expectedError$("amp-bind", "Maximum number of bindings reached (%s). Additional elements with bindings will be ignored.", $JSCompiler_StaticMethods_emitMaxBindingsExceededError_$self$$.$I$);
}, $JSCompiler_StaticMethods_sendBindingsToWorker_$$ = function($JSCompiler_StaticMethods_sendBindingsToWorker_$self$$, $bindings$jscomp$6$$) {
  return $JSCompiler_StaticMethods_ww_$$($JSCompiler_StaticMethods_sendBindingsToWorker_$self$$, "bind.addBindings", [$bindings$jscomp$6$$]).then(function($parseErrors$$) {
    Object.keys($parseErrors$$).forEach(function($bindings$jscomp$6$$) {
      var $expressionString$$ = $JSCompiler_StaticMethods_sendBindingsToWorker_$self$$.$F$[$bindings$jscomp$6$$];
      0 < $expressionString$$.length && $JSCompiler_StaticMethods_reportWorkerError_$$($parseErrors$$[$bindings$jscomp$6$$], 'amp-bind: Expression compile error in "' + $bindings$jscomp$6$$ + '".', $expressionString$$[0]);
    });
    return $bindings$jscomp$6$$.length;
  });
}, $JSCompiler_StaticMethods_removeBindingsForNodes_$$ = function($JSCompiler_StaticMethods_removeBindingsForNodes_$self$$, $nodes$jscomp$5$$) {
  _.$remove$$module$src$utils$array$$($JSCompiler_StaticMethods_removeBindingsForNodes_$self$$.$D$, function($JSCompiler_StaticMethods_removeBindingsForNodes_$self$$) {
    for (var $deletedExpressions$$ = 0; $deletedExpressions$$ < $nodes$jscomp$5$$.length; $deletedExpressions$$++) {
      if ($nodes$jscomp$5$$[$deletedExpressions$$].contains($JSCompiler_StaticMethods_removeBindingsForNodes_$self$$.element)) {
        return !0;
      }
    }
    return !1;
  });
  var $deletedExpressions$$ = [], $expression$jscomp$7$$;
  for ($expression$jscomp$7$$ in $JSCompiler_StaticMethods_removeBindingsForNodes_$self$$.$F$) {
    var $elements$jscomp$22$$ = $JSCompiler_StaticMethods_removeBindingsForNodes_$self$$.$F$[$expression$jscomp$7$$];
    _.$remove$$module$src$utils$array$$($elements$jscomp$22$$, function($JSCompiler_StaticMethods_removeBindingsForNodes_$self$$) {
      for (var $deletedExpressions$$ = 0; $deletedExpressions$$ < $nodes$jscomp$5$$.length; $deletedExpressions$$++) {
        if ($nodes$jscomp$5$$[$deletedExpressions$$].contains($JSCompiler_StaticMethods_removeBindingsForNodes_$self$$)) {
          return !0;
        }
      }
      return !1;
    });
    0 == $elements$jscomp$22$$.length && ($deletedExpressions$$.push($expression$jscomp$7$$), delete $JSCompiler_StaticMethods_removeBindingsForNodes_$self$$.$F$[$expression$jscomp$7$$]);
  }
  var $removed$jscomp$4$$ = $deletedExpressions$$.length;
  return 0 < $removed$jscomp$4$$ ? $JSCompiler_StaticMethods_ww_$$($JSCompiler_StaticMethods_removeBindingsForNodes_$self$$, "bind.removeBindingsWithExpressionStrings", [$deletedExpressions$$]).then(function() {
    return $removed$jscomp$4$$;
  }) : window.Promise.resolve(0);
}, $JSCompiler_StaticMethods_scanNode_$$ = function($JSCompiler_StaticMethods_scanNode_$self$$, $node$jscomp$74$$, $limit$jscomp$2$$) {
  function $scanNextNode_$$() {
    var $node$jscomp$74$$ = $walker$$.currentNode;
    if (!$node$jscomp$74$$) {
      return !0;
    }
    if ($node$jscomp$74$$.nodeType !== window.Node.ELEMENT_NODE) {
      return !$walker$$.nextNode();
    }
    $JSCompiler_StaticMethods_scanElement_$$($JSCompiler_StaticMethods_scanNode_$self$$, $node$jscomp$74$$, $limit$jscomp$2$$ - $bindings$jscomp$7$$.length, $bindings$jscomp$7$$) && ($limitExceeded$jscomp$1$$ = !0);
    return !$walker$$.nextNode() || $limitExceeded$jscomp$1$$;
  }
  var $bindings$jscomp$7$$ = [], $walker$$ = ($node$jscomp$74$$.nodeType == window.Node.DOCUMENT_NODE ? $node$jscomp$74$$ : $node$jscomp$74$$.ownerDocument).createTreeWalker($node$jscomp$74$$, window.NodeFilter.SHOW_ELEMENT, null, !1), $limitExceeded$jscomp$1$$ = !1;
  return new window.Promise(function($node$jscomp$74$$) {
    function $limit$jscomp$2$$($walker$$) {
      var $resolve$jscomp$58$$ = !1;
      if ($walker$$ && !$walker$$.didTimeout) {
        for (; 1 < $walker$$.timeRemaining() && !$resolve$jscomp$58$$;) {
          $resolve$jscomp$58$$ = $scanNextNode_$$();
        }
      } else {
        for ($walker$$ = 0; 250 > $walker$$ && !$resolve$jscomp$58$$; $walker$$++) {
          $resolve$jscomp$58$$ = $scanNextNode_$$();
        }
      }
      $resolve$jscomp$58$$ ? $node$jscomp$74$$({$bindings$:$bindings$jscomp$7$$, $limitExceeded$:$limitExceeded$jscomp$1$$}) : _.$chunk$$module$src$chunk$$($JSCompiler_StaticMethods_scanNode_$self$$.ampdoc, $limit$jscomp$2$$);
    }
    _.$chunk$$module$src$chunk$$($JSCompiler_StaticMethods_scanNode_$self$$.ampdoc, $limit$jscomp$2$$);
  });
}, $JSCompiler_StaticMethods_scanElement_$$ = function($JSCompiler_StaticMethods_scanElement_$self$$, $element$jscomp$351$$, $quota$$, $outBindings$$) {
  var $quotaExceeded$$ = !1, $boundProperties$$ = $JSCompiler_StaticMethods_boundPropertiesInElement_$$($JSCompiler_StaticMethods_scanElement_$self$$, $element$jscomp$351$$);
  $boundProperties$$.length > $quota$$ && ($boundProperties$$.length = $quota$$, $quotaExceeded$$ = !0);
  0 < $boundProperties$$.length && $JSCompiler_StaticMethods_scanElement_$self$$.$D$.push({element:$element$jscomp$351$$, $boundProperties$:$boundProperties$$});
  var $tagName$jscomp$31$$ = $element$jscomp$351$$.tagName;
  $boundProperties$$.forEach(function($quota$$) {
    var $quotaExceeded$$ = $quota$$.expressionString;
    $outBindings$$.push({tagName:$tagName$jscomp$31$$, property:$quota$$.property, expressionString:$quotaExceeded$$});
    $JSCompiler_StaticMethods_scanElement_$self$$.$F$[$quotaExceeded$$] || ($JSCompiler_StaticMethods_scanElement_$self$$.$F$[$quotaExceeded$$] = []);
    $JSCompiler_StaticMethods_scanElement_$self$$.$F$[$quotaExceeded$$].push($element$jscomp$351$$);
  });
  return $quotaExceeded$$;
}, $JSCompiler_StaticMethods_boundPropertiesInElement_$$ = function($JSCompiler_StaticMethods_boundPropertiesInElement_$self$$, $element$jscomp$352$$) {
  for (var $boundProperties$jscomp$1$$ = [], $attrs$jscomp$5$$ = $element$jscomp$352$$.attributes, $i$jscomp$263$$ = 0, $numberOfAttrs$$ = $attrs$jscomp$5$$.length; $i$jscomp$263$$ < $numberOfAttrs$$; $i$jscomp$263$$++) {
    a: {
      var $err$jscomp$inline_2848_property$jscomp$inline_2847$$ = void 0, $JSCompiler_StaticMethods_boundPropertyInAttribute_$self$jscomp$inline_2842_JSCompiler_inline_result$jscomp$6674_property$jscomp$inline_6762$$ = $JSCompiler_StaticMethods_boundPropertiesInElement_$self$$, $attribute$jscomp$inline_2843$$ = $attrs$jscomp$5$$[$i$jscomp$263$$];
      var $JSCompiler_inline_result$jscomp$700_boundProperty$jscomp$1_element$jscomp$inline_2844$$ = $element$jscomp$352$$;
      var $tag$jscomp$inline_2845$$ = $JSCompiler_inline_result$jscomp$700_boundProperty$jscomp$1_element$jscomp$inline_2844$$.tagName, $attr$jscomp$inline_2846_tag$jscomp$inline_6761_tagRules$jscomp$inline_6765$$ = $attribute$jscomp$inline_2843$$.name;
      if (2 < $attr$jscomp$inline_2846_tag$jscomp$inline_6761_tagRules$jscomp$inline_6765$$.length && "[" === $attr$jscomp$inline_2846_tag$jscomp$inline_6761_tagRules$jscomp$inline_6765$$[0] && "]" === $attr$jscomp$inline_2846_tag$jscomp$inline_6761_tagRules$jscomp$inline_6765$$[$attr$jscomp$inline_2846_tag$jscomp$inline_6761_tagRules$jscomp$inline_6765$$.length - 1]) {
        $err$jscomp$inline_2848_property$jscomp$inline_2847$$ = $attr$jscomp$inline_2846_tag$jscomp$inline_6761_tagRules$jscomp$inline_6765$$.substr(1, $attr$jscomp$inline_2846_tag$jscomp$inline_6761_tagRules$jscomp$inline_6765$$.length - 2);
      } else {
        if (_.$startsWith$$module$src$string$$($attr$jscomp$inline_2846_tag$jscomp$inline_6761_tagRules$jscomp$inline_6765$$, "data-amp-bind-") && ($err$jscomp$inline_2848_property$jscomp$inline_2847$$ = $attr$jscomp$inline_2846_tag$jscomp$inline_6761_tagRules$jscomp$inline_6765$$.substr(14), $JSCompiler_inline_result$jscomp$700_boundProperty$jscomp$1_element$jscomp$inline_2844$$.hasAttribute("[" + $err$jscomp$inline_2848_property$jscomp$inline_2847$$ + "]"))) {
          $JSCompiler_inline_result$jscomp$700_boundProperty$jscomp$1_element$jscomp$inline_2844$$ = null;
          break a;
        }
      }
      if ($err$jscomp$inline_2848_property$jscomp$inline_2847$$) {
        b: {
          var $JSCompiler_StaticMethods_rulesForTagAndProperty_$self$jscomp$inline_6760_ampPropertyRules$jscomp$inline_6764_globalRules$jscomp$inline_6763$$ = $JSCompiler_StaticMethods_boundPropertyInAttribute_$self$jscomp$inline_2842_JSCompiler_inline_result$jscomp$6674_property$jscomp$inline_6762$$.$V$;
          $attr$jscomp$inline_2846_tag$jscomp$inline_6761_tagRules$jscomp$inline_6765$$ = $tag$jscomp$inline_2845$$;
          $JSCompiler_StaticMethods_boundPropertyInAttribute_$self$jscomp$inline_2842_JSCompiler_inline_result$jscomp$6674_property$jscomp$inline_6762$$ = $err$jscomp$inline_2848_property$jscomp$inline_2847$$;
          if (_.$startsWith$$module$src$string$$($JSCompiler_StaticMethods_boundPropertyInAttribute_$self$jscomp$inline_2842_JSCompiler_inline_result$jscomp$6674_property$jscomp$inline_6762$$, "aria-")) {
            $JSCompiler_StaticMethods_boundPropertyInAttribute_$self$jscomp$inline_2842_JSCompiler_inline_result$jscomp$6674_property$jscomp$inline_6762$$ = null;
          } else {
            if (!$ownProperty$$module$src$utils$object$$($URL_PROPERTIES$$module$extensions$amp_bind$0_1$bind_validator$$, $JSCompiler_StaticMethods_boundPropertyInAttribute_$self$jscomp$inline_2842_JSCompiler_inline_result$jscomp$6674_property$jscomp$inline_6762$$) || $JSCompiler_StaticMethods_rulesForTagAndProperty_$self$jscomp$inline_6760_ampPropertyRules$jscomp$inline_6764_globalRules$jscomp$inline_6763$$.$D$) {
              $JSCompiler_StaticMethods_rulesForTagAndProperty_$self$jscomp$inline_6760_ampPropertyRules$jscomp$inline_6764_globalRules$jscomp$inline_6763$$ = $ownProperty$$module$src$utils$object$$($GLOBAL_PROPERTY_RULES$$module$extensions$amp_bind$0_1$bind_validator$$, $JSCompiler_StaticMethods_boundPropertyInAttribute_$self$jscomp$inline_2842_JSCompiler_inline_result$jscomp$6674_property$jscomp$inline_6762$$);
              if (void 0 !== $JSCompiler_StaticMethods_rulesForTagAndProperty_$self$jscomp$inline_6760_ampPropertyRules$jscomp$inline_6764_globalRules$jscomp$inline_6763$$) {
                $JSCompiler_StaticMethods_boundPropertyInAttribute_$self$jscomp$inline_2842_JSCompiler_inline_result$jscomp$6674_property$jscomp$inline_6762$$ = $JSCompiler_StaticMethods_rulesForTagAndProperty_$self$jscomp$inline_6760_ampPropertyRules$jscomp$inline_6764_globalRules$jscomp$inline_6763$$;
                break b;
              }
              $JSCompiler_StaticMethods_rulesForTagAndProperty_$self$jscomp$inline_6760_ampPropertyRules$jscomp$inline_6764_globalRules$jscomp$inline_6763$$ = $ownProperty$$module$src$utils$object$$($AMP_PROPERTY_RULES$$module$extensions$amp_bind$0_1$bind_validator$$, $JSCompiler_StaticMethods_boundPropertyInAttribute_$self$jscomp$inline_2842_JSCompiler_inline_result$jscomp$6674_property$jscomp$inline_6762$$);
              if (_.$startsWith$$module$src$string$$($attr$jscomp$inline_2846_tag$jscomp$inline_6761_tagRules$jscomp$inline_6765$$, "AMP-") && void 0 !== $JSCompiler_StaticMethods_rulesForTagAndProperty_$self$jscomp$inline_6760_ampPropertyRules$jscomp$inline_6764_globalRules$jscomp$inline_6763$$) {
                $JSCompiler_StaticMethods_boundPropertyInAttribute_$self$jscomp$inline_2842_JSCompiler_inline_result$jscomp$6674_property$jscomp$inline_6762$$ = $JSCompiler_StaticMethods_rulesForTagAndProperty_$self$jscomp$inline_6760_ampPropertyRules$jscomp$inline_6764_globalRules$jscomp$inline_6763$$;
                break b;
              }
              if ($attr$jscomp$inline_2846_tag$jscomp$inline_6761_tagRules$jscomp$inline_6765$$ = $ownProperty$$module$src$utils$object$$($ELEMENT_RULES$$module$extensions$amp_bind$0_1$bind_validator$$, $attr$jscomp$inline_2846_tag$jscomp$inline_6761_tagRules$jscomp$inline_6765$$)) {
                $JSCompiler_StaticMethods_boundPropertyInAttribute_$self$jscomp$inline_2842_JSCompiler_inline_result$jscomp$6674_property$jscomp$inline_6762$$ = $attr$jscomp$inline_2846_tag$jscomp$inline_6761_tagRules$jscomp$inline_6765$$[$JSCompiler_StaticMethods_boundPropertyInAttribute_$self$jscomp$inline_2842_JSCompiler_inline_result$jscomp$6674_property$jscomp$inline_6762$$];
                break b;
              }
            }
            $JSCompiler_StaticMethods_boundPropertyInAttribute_$self$jscomp$inline_2842_JSCompiler_inline_result$jscomp$6674_property$jscomp$inline_6762$$ = void 0;
          }
        }
        if (void 0 !== $JSCompiler_StaticMethods_boundPropertyInAttribute_$self$jscomp$inline_2842_JSCompiler_inline_result$jscomp$6674_property$jscomp$inline_6762$$) {
          $JSCompiler_inline_result$jscomp$700_boundProperty$jscomp$1_element$jscomp$inline_2844$$ = {property:$err$jscomp$inline_2848_property$jscomp$inline_2847$$, expressionString:$attribute$jscomp$inline_2843$$.value};
          break a;
        }
        $err$jscomp$inline_2848_property$jscomp$inline_2847$$ = _.$user$$module$src$log$$().$createError$("%s: Binding to [%s] on <%s> is not allowed.", "amp-bind", $err$jscomp$inline_2848_property$jscomp$inline_2847$$, $tag$jscomp$inline_2845$$);
        _.$reportError$$module$src$error$$($err$jscomp$inline_2848_property$jscomp$inline_2847$$, $JSCompiler_inline_result$jscomp$700_boundProperty$jscomp$1_element$jscomp$inline_2844$$);
      }
      $JSCompiler_inline_result$jscomp$700_boundProperty$jscomp$1_element$jscomp$inline_2844$$ = null;
    }
    $JSCompiler_inline_result$jscomp$700_boundProperty$jscomp$1_element$jscomp$inline_2844$$ && $boundProperties$jscomp$1$$.push($JSCompiler_inline_result$jscomp$700_boundProperty$jscomp$1_element$jscomp$inline_2844$$);
  }
  return $boundProperties$jscomp$1$$;
}, $JSCompiler_StaticMethods_evaluateExpression_$$ = function($JSCompiler_StaticMethods_evaluateExpression_$self$$, $expression$jscomp$8$$, $scope$jscomp$18$$) {
  return $JSCompiler_StaticMethods_evaluateExpression_$self$$.$O$.then(function() {
    Object.assign($scope$jscomp$18$$, $JSCompiler_StaticMethods_evaluateExpression_$self$$.$state_$);
    return $JSCompiler_StaticMethods_ww_$$($JSCompiler_StaticMethods_evaluateExpression_$self$$, "bind.evaluateExpression", [$expression$jscomp$8$$, $scope$jscomp$18$$]);
  }).then(function($JSCompiler_StaticMethods_evaluateExpression_$self$$) {
    var $expression$jscomp$8$$ = $JSCompiler_StaticMethods_evaluateExpression_$self$$.result;
    if ($JSCompiler_StaticMethods_evaluateExpression_$self$$ = $JSCompiler_StaticMethods_evaluateExpression_$self$$.error) {
      throw $JSCompiler_StaticMethods_reportWorkerError_$$($JSCompiler_StaticMethods_evaluateExpression_$self$$, "amp-bind: Expression eval failed.");
    }
    _.$dev$$module$src$log$$().$Log$$module$src$log_prototype$info$("amp-bind", "\u2937", $expression$jscomp$8$$);
    return $expression$jscomp$8$$;
  });
}, $JSCompiler_StaticMethods_evaluate_$$ = function($JSCompiler_StaticMethods_evaluate_$self$$) {
  return $JSCompiler_StaticMethods_ww_$$($JSCompiler_StaticMethods_evaluate_$self$$, "bind.evaluateBindings", [$JSCompiler_StaticMethods_evaluate_$self$$.$state_$]).then(function($returnValue$jscomp$2$$) {
    var $results$jscomp$13$$ = $returnValue$jscomp$2$$.results, $errors$jscomp$2$$ = $returnValue$jscomp$2$$.errors;
    Object.keys($errors$jscomp$2$$).forEach(function($returnValue$jscomp$2$$) {
      var $results$jscomp$13$$ = $JSCompiler_StaticMethods_evaluate_$self$$.$F$[$returnValue$jscomp$2$$];
      if (0 < $results$jscomp$13$$.length) {
        var $expressionString$jscomp$2_userError$$ = $errors$jscomp$2$$[$returnValue$jscomp$2$$];
        $returnValue$jscomp$2$$ = _.$user$$module$src$log$$().$createError$('%s: Expression evaluation error in "%s". %s', "amp-bind", $returnValue$jscomp$2$$, $expressionString$jscomp$2_userError$$.message);
        $returnValue$jscomp$2$$.stack = $expressionString$jscomp$2_userError$$.stack;
        _.$reportError$$module$src$error$$($returnValue$jscomp$2$$, $results$jscomp$13$$[0]);
      }
    });
    _.$dev$$module$src$log$$().$Log$$module$src$log_prototype$info$("amp-bind", "bindings:", $results$jscomp$13$$);
    return $results$jscomp$13$$;
  });
}, $JSCompiler_StaticMethods_Bind$$module$extensions$amp_bind$0_1$bind_impl_prototype$verify_$$ = function($JSCompiler_StaticMethods_Bind$$module$extensions$amp_bind$0_1$bind_impl_prototype$verify_$self$$, $results$jscomp$14$$) {
  var $elements$jscomp$24$$ = void 0 === $elements$jscomp$24$$ ? null : $elements$jscomp$24$$;
  var $warn$$ = void 0 === $warn$$ ? !0 : $warn$$;
  var $mismatches$$ = {};
  $JSCompiler_StaticMethods_Bind$$module$extensions$amp_bind$0_1$bind_impl_prototype$verify_$self$$.$D$.forEach(function($JSCompiler_StaticMethods_Bind$$module$extensions$amp_bind$0_1$bind_impl_prototype$verify_$self$$) {
    var $boundElement$jscomp$2_boundProperties$jscomp$2$$ = $JSCompiler_StaticMethods_Bind$$module$extensions$amp_bind$0_1$bind_impl_prototype$verify_$self$$.element;
    $JSCompiler_StaticMethods_Bind$$module$extensions$amp_bind$0_1$bind_impl_prototype$verify_$self$$ = $JSCompiler_StaticMethods_Bind$$module$extensions$amp_bind$0_1$bind_impl_prototype$verify_$self$$.$boundProperties$;
    $elements$jscomp$24$$ && !$JSCompiler_StaticMethods_elementsContains_$$($elements$jscomp$24$$, $boundElement$jscomp$2_boundProperties$jscomp$2$$) || $JSCompiler_StaticMethods_Bind$$module$extensions$amp_bind$0_1$bind_impl_prototype$verify_$self$$.forEach(function($JSCompiler_StaticMethods_Bind$$module$extensions$amp_bind$0_1$bind_impl_prototype$verify_$self$$) {
      var $elements$jscomp$24$$ = $results$jscomp$14$$[$JSCompiler_StaticMethods_Bind$$module$extensions$amp_bind$0_1$bind_impl_prototype$verify_$self$$.expressionString];
      if (void 0 !== $elements$jscomp$24$$) {
        var $element$jscomp$354$$ = $JSCompiler_StaticMethods_Bind$$module$extensions$amp_bind$0_1$bind_impl_prototype$verify_$self$$.property, $boundProperty$jscomp$2_expressionString$jscomp$3$$ = $BIND_ONLY_ATTRIBUTES$$module$extensions$amp_bind$0_1$bind_impl$$[$boundElement$jscomp$2_boundProperties$jscomp$2$$.tagName];
        if ($boundProperty$jscomp$2_expressionString$jscomp$3$$ && $boundProperty$jscomp$2_expressionString$jscomp$3$$.includes($element$jscomp$354$$)) {
          $elements$jscomp$24$$ = null;
        } else {
          switch($element$jscomp$354$$) {
            case "text":
              $element$jscomp$354$$ = $boundElement$jscomp$2_boundProperties$jscomp$2$$.textContent;
              $elements$jscomp$24$$ = String($elements$jscomp$24$$);
              $boundProperty$jscomp$2_expressionString$jscomp$3$$ = $element$jscomp$354$$.trim() === $elements$jscomp$24$$.trim();
              break;
            case "class":
              $element$jscomp$354$$ = [];
              for ($boundProperty$jscomp$2_expressionString$jscomp$3$$ = 0; $boundProperty$jscomp$2_expressionString$jscomp$3$$ < $boundElement$jscomp$2_boundProperties$jscomp$2$$.classList.length; $boundProperty$jscomp$2_expressionString$jscomp$3$$++) {
                var $classes$jscomp$inline_2868_cssClass$jscomp$inline_2867_expected$jscomp$3_sortedA$jscomp$inline_6116$$ = $boundElement$jscomp$2_boundProperties$jscomp$2$$.classList[$boundProperty$jscomp$2_expressionString$jscomp$3$$];
                $AMP_CSS_RE$$module$extensions$amp_bind$0_1$bind_impl$$.test($classes$jscomp$inline_2868_cssClass$jscomp$inline_2867_expected$jscomp$3_sortedA$jscomp$inline_6116$$) || $element$jscomp$354$$.push($classes$jscomp$inline_2868_cssClass$jscomp$inline_2867_expected$jscomp$3_sortedA$jscomp$inline_6116$$);
              }
              $classes$jscomp$inline_2868_cssClass$jscomp$inline_2867_expected$jscomp$3_sortedA$jscomp$inline_6116$$ = [];
              Array.isArray($elements$jscomp$24$$) ? $classes$jscomp$inline_2868_cssClass$jscomp$inline_2867_expected$jscomp$3_sortedA$jscomp$inline_6116$$ = $elements$jscomp$24$$ : "string" === typeof $elements$jscomp$24$$ ? ($boundProperty$jscomp$2_expressionString$jscomp$3$$ = $elements$jscomp$24$$.trim(), 0 < $boundProperty$jscomp$2_expressionString$jscomp$3$$.length && ($classes$jscomp$inline_2868_cssClass$jscomp$inline_2867_expected$jscomp$3_sortedA$jscomp$inline_6116$$ = $boundProperty$jscomp$2_expressionString$jscomp$3$$.split(" "))) : 
              ($boundProperty$jscomp$2_expressionString$jscomp$3$$ = _.$user$$module$src$log$$().$createError$('%s: "%s" is not a valid result for [class].', "amp-bind", $elements$jscomp$24$$), _.$reportError$$module$src$error$$($boundProperty$jscomp$2_expressionString$jscomp$3$$, $boundElement$jscomp$2_boundProperties$jscomp$2$$));
              b: {
                $boundProperty$jscomp$2_expressionString$jscomp$3$$ = $element$jscomp$354$$;
                var $b$jscomp$inline_6115_sortedB$jscomp$inline_6117$$ = $classes$jscomp$inline_2868_cssClass$jscomp$inline_2867_expected$jscomp$3_sortedA$jscomp$inline_6116$$;
                if ($boundProperty$jscomp$2_expressionString$jscomp$3$$.length !== $b$jscomp$inline_6115_sortedB$jscomp$inline_6117$$.length) {
                  $boundProperty$jscomp$2_expressionString$jscomp$3$$ = !1;
                } else {
                  $classes$jscomp$inline_2868_cssClass$jscomp$inline_2867_expected$jscomp$3_sortedA$jscomp$inline_6116$$ = (_.$isArray$$module$src$types$$($boundProperty$jscomp$2_expressionString$jscomp$3$$) ? $boundProperty$jscomp$2_expressionString$jscomp$3$$ : _.$toArray$$module$src$types$$($boundProperty$jscomp$2_expressionString$jscomp$3$$)).sort();
                  $b$jscomp$inline_6115_sortedB$jscomp$inline_6117$$ = (_.$isArray$$module$src$types$$($b$jscomp$inline_6115_sortedB$jscomp$inline_6117$$) ? $b$jscomp$inline_6115_sortedB$jscomp$inline_6117$$ : _.$toArray$$module$src$types$$($b$jscomp$inline_6115_sortedB$jscomp$inline_6117$$)).sort();
                  for (var $i$jscomp$inline_6118$$ = 0; $i$jscomp$inline_6118$$ < $boundProperty$jscomp$2_expressionString$jscomp$3$$.length; $i$jscomp$inline_6118$$++) {
                    if ($classes$jscomp$inline_2868_cssClass$jscomp$inline_2867_expected$jscomp$3_sortedA$jscomp$inline_6116$$[$i$jscomp$inline_6118$$] !== $b$jscomp$inline_6115_sortedB$jscomp$inline_6117$$[$i$jscomp$inline_6118$$]) {
                      $boundProperty$jscomp$2_expressionString$jscomp$3$$ = !1;
                      break b;
                    }
                  }
                  $boundProperty$jscomp$2_expressionString$jscomp$3$$ = !0;
                }
              }
              break;
            default:
              $element$jscomp$354$$ = $boundElement$jscomp$2_boundProperties$jscomp$2$$.getAttribute($element$jscomp$354$$), $boundProperty$jscomp$2_expressionString$jscomp$3$$ = !0 === $elements$jscomp$24$$ ? "" === $element$jscomp$354$$ : !1 === $elements$jscomp$24$$ ? null === $element$jscomp$354$$ : $element$jscomp$354$$ === $elements$jscomp$24$$;
          }
          $elements$jscomp$24$$ = $boundProperty$jscomp$2_expressionString$jscomp$3$$ ? null : {$expected$:$elements$jscomp$24$$, $actual$:$element$jscomp$354$$};
        }
        if ($boundProperty$jscomp$2_expressionString$jscomp$3$$ = $elements$jscomp$24$$) {
          $elements$jscomp$24$$ = $boundElement$jscomp$2_boundProperties$jscomp$2$$.tagName, $element$jscomp$354$$ = $JSCompiler_StaticMethods_Bind$$module$extensions$amp_bind$0_1$bind_impl_prototype$verify_$self$$.property, $JSCompiler_StaticMethods_Bind$$module$extensions$amp_bind$0_1$bind_impl_prototype$verify_$self$$ = $JSCompiler_StaticMethods_Bind$$module$extensions$amp_bind$0_1$bind_impl_prototype$verify_$self$$.expressionString, $classes$jscomp$inline_2868_cssClass$jscomp$inline_2867_expected$jscomp$3_sortedA$jscomp$inline_6116$$ = 
          $boundProperty$jscomp$2_expressionString$jscomp$3$$.$expected$, $boundProperty$jscomp$2_expressionString$jscomp$3$$ = $boundProperty$jscomp$2_expressionString$jscomp$3$$.$actual$, $mismatches$$[$elements$jscomp$24$$ + "[" + $element$jscomp$354$$ + "]" + $classes$jscomp$inline_2868_cssClass$jscomp$inline_2867_expected$jscomp$3_sortedA$jscomp$inline_6116$$ + ":" + $boundProperty$jscomp$2_expressionString$jscomp$3$$] = !0, $warn$$ && _.$user$$module$src$log$$().$Log$$module$src$log_prototype$warn$("amp-bind", 
          "Default value (" + $boundProperty$jscomp$2_expressionString$jscomp$3$$ + ") does not match first " + ("result (" + $classes$jscomp$inline_2868_cssClass$jscomp$inline_2867_expected$jscomp$3_sortedA$jscomp$inline_6116$$ + ") for <" + $elements$jscomp$24$$ + " [" + $element$jscomp$354$$ + ']="') + ($JSCompiler_StaticMethods_Bind$$module$extensions$amp_bind$0_1$bind_impl_prototype$verify_$self$$ + '">. We recommend writing expressions with ') + "matching default values, but this can be safely ignored if intentional.");
        }
      }
    });
  });
  return Object.keys($mismatches$$);
}, $JSCompiler_StaticMethods_elementsContains_$$ = function($elements$jscomp$25$$, $el$jscomp$46$$) {
  for (var $i$jscomp$264$$ = 0; $i$jscomp$264$$ < $elements$jscomp$25$$.length; $i$jscomp$264$$++) {
    if ($elements$jscomp$25$$[$i$jscomp$264$$].contains($el$jscomp$46$$)) {
      return !0;
    }
  }
  return !1;
}, $JSCompiler_StaticMethods_calculateUpdates_$$ = function($boundProperties$jscomp$3$$, $results$jscomp$15$$) {
  var $updates$$ = [];
  $boundProperties$jscomp$3$$.forEach(function($boundProperties$jscomp$3$$) {
    var $boundProperty$jscomp$3$$ = $boundProperties$jscomp$3$$.$previousResult$, $newValue$jscomp$8$$ = $results$jscomp$15$$[$boundProperties$jscomp$3$$.expressionString];
    void 0 === $newValue$jscomp$8$$ || $deepEquals$$module$src$json$$($newValue$jscomp$8$$, $boundProperty$jscomp$3$$) || ($boundProperties$jscomp$3$$.$previousResult$ = $newValue$jscomp$8$$, $updates$$.push({$boundProperty$:$boundProperties$jscomp$3$$, newValue:$newValue$jscomp$8$$}));
  });
  return $updates$$;
}, $JSCompiler_StaticMethods_apply_$$ = function($JSCompiler_StaticMethods_apply_$self$$, $results$jscomp$16$$, $opt_isAmpStateMutation$jscomp$1$$) {
  var $promises$jscomp$17$$ = $JSCompiler_StaticMethods_apply_$self$$.$D$.map(function($promises$jscomp$17$$) {
    return $opt_isAmpStateMutation$jscomp$1$$ && "AMP-STATE" == $promises$jscomp$17$$.element.tagName ? window.Promise.resolve() : $JSCompiler_StaticMethods_applyBoundElement_$$($JSCompiler_StaticMethods_apply_$self$$, $results$jscomp$16$$, $promises$jscomp$17$$);
  });
  return window.Promise.all($promises$jscomp$17$$).then(function() {
    _.$dev$$module$src$log$$().$Log$$module$src$log_prototype$info$("amp-bind", "updated:", $promises$jscomp$17$$.length, "elements");
  });
}, $JSCompiler_StaticMethods_applyElements_$$ = function($JSCompiler_StaticMethods_applyElements_$self$$, $results$jscomp$17$$, $elements$jscomp$26$$) {
  var $promises$jscomp$18$$ = [];
  $JSCompiler_StaticMethods_applyElements_$self$$.$D$.forEach(function($boundElement$jscomp$4$$) {
    $elements$jscomp$26$$.forEach(function($elements$jscomp$26$$) {
      $elements$jscomp$26$$.contains($boundElement$jscomp$4$$.element) && $promises$jscomp$18$$.push($JSCompiler_StaticMethods_applyBoundElement_$$($JSCompiler_StaticMethods_applyElements_$self$$, $results$jscomp$17$$, $boundElement$jscomp$4$$));
    });
  });
  return window.Promise.all($promises$jscomp$18$$).then(function() {
    _.$dev$$module$src$log$$().$Log$$module$src$log_prototype$info$("amp-bind", "updated:", $promises$jscomp$18$$.length, "elements");
  });
}, $JSCompiler_StaticMethods_applyBoundElement_$$ = function($JSCompiler_StaticMethods_applyBoundElement_$self$$, $results$jscomp$18$$, $boundElement$jscomp$5$$) {
  var $element$jscomp$356$$ = $boundElement$jscomp$5$$.element, $updates$jscomp$1$$ = $JSCompiler_StaticMethods_calculateUpdates_$$($boundElement$jscomp$5$$.$boundProperties$, $results$jscomp$18$$);
  return 0 === $updates$jscomp$1$$.length ? window.Promise.resolve() : $JSCompiler_StaticMethods_applyBoundElement_$self$$.$R$.$mutateElement$($element$jscomp$356$$, function() {
    var $results$jscomp$18$$ = _.$map$$module$src$utils$object$$(), $boundElement$jscomp$5$$, $height$jscomp$36$$;
    $updates$jscomp$1$$.forEach(function($updates$jscomp$1$$) {
      var $mutations$jscomp$4$$ = $updates$jscomp$1$$.$boundProperty$;
      $updates$jscomp$1$$ = $updates$jscomp$1$$.newValue;
      a: {
        var $width$jscomp$40$$ = $mutations$jscomp$4$$.property;
        var $error$jscomp$61$$ = $element$jscomp$356$$.tagName;
        switch($width$jscomp$40$$) {
          case "text":
            $width$jscomp$40$$ = !0;
            var $newValue$jscomp$9_update$jscomp$1$$ = String($updates$jscomp$1$$);
            "TEXTAREA" === $error$jscomp$61$$ && ($element$jscomp$356$$.value = $newValue$jscomp$9_update$jscomp$1$$, $width$jscomp$40$$ = !1);
            "TITLE" === $error$jscomp$61$$ && $element$jscomp$356$$.parentNode === $JSCompiler_StaticMethods_applyBoundElement_$self$$.$G$.document.head && ($JSCompiler_StaticMethods_applyBoundElement_$self$$.$G$.document.title = $newValue$jscomp$9_update$jscomp$1$$);
            $width$jscomp$40$$ && ($element$jscomp$356$$.textContent = $newValue$jscomp$9_update$jscomp$1$$);
            break;
          case "class":
            $width$jscomp$40$$ = [];
            for ($error$jscomp$61$$ = 0; $error$jscomp$61$$ < $element$jscomp$356$$.classList.length; $error$jscomp$61$$++) {
              $newValue$jscomp$9_update$jscomp$1$$ = $element$jscomp$356$$.classList[$error$jscomp$61$$], $AMP_CSS_RE$$module$extensions$amp_bind$0_1$bind_impl$$.test($newValue$jscomp$9_update$jscomp$1$$) && $width$jscomp$40$$.push($newValue$jscomp$9_update$jscomp$1$$);
            }
            Array.isArray($updates$jscomp$1$$) || "string" === typeof $updates$jscomp$1$$ ? $element$jscomp$356$$.setAttribute("class", $width$jscomp$40$$.concat($updates$jscomp$1$$).join(" ")) : null === $updates$jscomp$1$$ ? $element$jscomp$356$$.setAttribute("class", $width$jscomp$40$$.join(" ")) : ($width$jscomp$40$$ = _.$user$$module$src$log$$().$createError$('%s: "%s" is not a valid result for [class].', "amp-bind", $updates$jscomp$1$$), _.$reportError$$module$src$error$$($width$jscomp$40$$, 
            $element$jscomp$356$$));
            break;
          default:
            var $updateProperty$jscomp$inline_2884$$ = "INPUT" === $error$jscomp$61$$ && $width$jscomp$40$$ in $element$jscomp$356$$, $oldValue$jscomp$inline_2885_value$jscomp$inline_6132$$ = $element$jscomp$356$$.getAttribute($width$jscomp$40$$);
            $error$jscomp$61$$ = !1;
            if ("boolean" === typeof $updates$jscomp$1$$) {
              if ($updateProperty$jscomp$inline_2884$$ && $element$jscomp$356$$[$width$jscomp$40$$] !== $updates$jscomp$1$$ && ($element$jscomp$356$$[$width$jscomp$40$$] = $updates$jscomp$1$$, $error$jscomp$61$$ = !0), $updates$jscomp$1$$ && "" !== $oldValue$jscomp$inline_2885_value$jscomp$inline_6132$$ ? ($element$jscomp$356$$.setAttribute($width$jscomp$40$$, ""), $error$jscomp$61$$ = !0) : $updates$jscomp$1$$ || null === $oldValue$jscomp$inline_2885_value$jscomp$inline_6132$$ || ($element$jscomp$356$$.removeAttribute($width$jscomp$40$$), 
              $error$jscomp$61$$ = !0), $error$jscomp$61$$ && "OPTION" === $element$jscomp$356$$.tagName && "selected" === $width$jscomp$40$$ && $updates$jscomp$1$$ && _.$JSCompiler_StaticMethods_isSafari$$(_.$Services$$module$src$services$platformFor$$($JSCompiler_StaticMethods_applyBoundElement_$self$$.$J$)) && ($newValue$jscomp$9_update$jscomp$1$$ = _.$closestByTag$$module$src$dom$$($element$jscomp$356$$, "select"))) {
                var $attr$jscomp$inline_6135_index$jscomp$inline_6128$$ = _.$toArray$$module$src$types$$($newValue$jscomp$9_update$jscomp$1$$.options).indexOf($element$jscomp$356$$);
                0 <= $attr$jscomp$inline_6135_index$jscomp$inline_6128$$ && ($newValue$jscomp$9_update$jscomp$1$$.selectedIndex = $attr$jscomp$inline_6135_index$jscomp$inline_6128$$);
              }
            } else {
              if ($updates$jscomp$1$$ !== $oldValue$jscomp$inline_2885_value$jscomp$inline_6132$$) {
                b: {
                  $oldValue$jscomp$inline_2885_value$jscomp$inline_6132$$ = String($updates$jscomp$1$$);
                  try {
                    $newValue$jscomp$9_update$jscomp$1$$ = $element$jscomp$356$$.tagName.toLowerCase();
                    $attr$jscomp$inline_6135_index$jscomp$inline_6128$$ = $width$jscomp$40$$.toLowerCase();
                    var $rewrittenValue$jscomp$inline_6136$$ = _.$rewriteAttributeValue$$module$src$purifier$$($newValue$jscomp$9_update$jscomp$1$$, $attr$jscomp$inline_6135_index$jscomp$inline_6128$$, $oldValue$jscomp$inline_2885_value$jscomp$inline_6132$$);
                    if (_.$isProxyOrigin$$module$src$url$$(window.self.location) && "a" === $newValue$jscomp$9_update$jscomp$1$$ && "href" === $attr$jscomp$inline_6135_index$jscomp$inline_6128$$) {
                      var $oldValue$jscomp$inline_6137$$ = $element$jscomp$356$$.getAttribute($attr$jscomp$inline_6135_index$jscomp$inline_6128$$), $newValueIsHash$jscomp$inline_6138$$ = "#" === $rewrittenValue$jscomp$inline_6136$$[0], $oldValueIsHash$jscomp$inline_6139$$ = $oldValue$jscomp$inline_6137$$ && "#" === $oldValue$jscomp$inline_6137$$[0];
                      $newValueIsHash$jscomp$inline_6138$$ && !$oldValueIsHash$jscomp$inline_6139$$ ? ($element$jscomp$356$$.__AMP_ORIGINAL_TARGET_VALUE_ || ($element$jscomp$356$$.__AMP_ORIGINAL_TARGET_VALUE_ = $element$jscomp$356$$.getAttribute("target")), $element$jscomp$356$$.removeAttribute("target")) : $oldValueIsHash$jscomp$inline_6139$$ && !$newValueIsHash$jscomp$inline_6138$$ && $element$jscomp$356$$.setAttribute("target", $element$jscomp$356$$.__AMP_ORIGINAL_TARGET_VALUE_ || "_top");
                    }
                    $updateProperty$jscomp$inline_2884$$ && ($element$jscomp$356$$[$attr$jscomp$inline_6135_index$jscomp$inline_6128$$] = $rewrittenValue$jscomp$inline_6136$$);
                    $element$jscomp$356$$.setAttribute($attr$jscomp$inline_6135_index$jscomp$inline_6128$$, $rewrittenValue$jscomp$inline_6136$$);
                    $error$jscomp$61$$ = !0;
                    break b;
                  } catch ($e$241$jscomp$inline_6141$$) {
                    $error$jscomp$61$$ = _.$user$$module$src$log$$().$createError$('%s: "%s" is not a valid result for [%]', "amp-bind", $oldValue$jscomp$inline_2885_value$jscomp$inline_6132$$, $width$jscomp$40$$, $e$241$jscomp$inline_6141$$), _.$reportError$$module$src$error$$($error$jscomp$61$$, $element$jscomp$356$$);
                  }
                  $error$jscomp$61$$ = !1;
                }
              }
            }
            if ($error$jscomp$61$$) {
              $width$jscomp$40$$ = {name:$width$jscomp$40$$, value:$updates$jscomp$1$$};
              break a;
            }
        }
        $width$jscomp$40$$ = null;
      }
      $width$jscomp$40$$ && ($results$jscomp$18$$[$width$jscomp$40$$.name] = $width$jscomp$40$$.value, $mutations$jscomp$4$$ = $mutations$jscomp$4$$.property, "width" == $mutations$jscomp$4$$ ? $boundElement$jscomp$5$$ = _.$isFiniteNumber$$module$src$types$$($updates$jscomp$1$$) ? Number($updates$jscomp$1$$) : $boundElement$jscomp$5$$ : "height" == $mutations$jscomp$4$$ && ($height$jscomp$36$$ = _.$isFiniteNumber$$module$src$types$$($updates$jscomp$1$$) ? Number($updates$jscomp$1$$) : $height$jscomp$36$$));
    });
    void 0 === $boundElement$jscomp$5$$ && void 0 === $height$jscomp$36$$ || $JSCompiler_StaticMethods_applyBoundElement_$self$$.$R$.$changeSize$($element$jscomp$356$$, $height$jscomp$36$$, $boundElement$jscomp$5$$);
    if ("function" === typeof $element$jscomp$356$$.$mutatedAttributesCallback$) {
      try {
        $element$jscomp$356$$.$mutatedAttributesCallback$($results$jscomp$18$$);
      } catch ($e$240$$) {
        var $error$jscomp$61$$ = _.$user$$module$src$log$$().$createError$("%s: Applying expression results (%s) failed with error,", "amp-bind", JSON.stringify($results$jscomp$18$$), $e$240$$);
        _.$reportError$$module$src$error$$($error$jscomp$61$$, $element$jscomp$356$$);
      }
    }
  });
}, $JSCompiler_StaticMethods_Bind$$module$extensions$amp_bind$0_1$bind_impl_prototype$onDomUpdate_$$ = function($JSCompiler_StaticMethods_Bind$$module$extensions$amp_bind$0_1$bind_impl_prototype$onDomUpdate_$self$$, $event$jscomp$91_target$jscomp$138$$) {
  $event$jscomp$91_target$jscomp$138$$ = $event$jscomp$91_target$jscomp$138$$.target;
  var $parent$jscomp$44$$ = $event$jscomp$91_target$jscomp$138$$.parentNode;
  $parent$jscomp$44$$ && "AMP-LIST" == $parent$jscomp$44$$.tagName || (_.$dev$$module$src$log$$().$Log$$module$src$log_prototype$info$("amp-bind", "dom_update:", $event$jscomp$91_target$jscomp$138$$), $JSCompiler_StaticMethods_removeThenAdd_$$($JSCompiler_StaticMethods_Bind$$module$extensions$amp_bind$0_1$bind_impl_prototype$onDomUpdate_$self$$, [$event$jscomp$91_target$jscomp$138$$], [$event$jscomp$91_target$jscomp$138$$]).then(function() {
  }));
}, $JSCompiler_StaticMethods_removeThenAdd_$$ = function($JSCompiler_StaticMethods_removeThenAdd_$self$$, $remove$jscomp$1$$, $add$jscomp$1$$) {
  var $removed$jscomp$5$$ = 0;
  return $JSCompiler_StaticMethods_removeBindingsForNodes_$$($JSCompiler_StaticMethods_removeThenAdd_$self$$, $remove$jscomp$1$$).then(function($remove$jscomp$1$$) {
    $removed$jscomp$5$$ = $remove$jscomp$1$$;
    return $JSCompiler_StaticMethods_addBindingsForNodes_$$($JSCompiler_StaticMethods_removeThenAdd_$self$$, $add$jscomp$1$$);
  }).then(function($remove$jscomp$1$$) {
    _.$dev$$module$src$log$$().$Log$$module$src$log_prototype$info$("amp-bind", "\u2937", "\u0394:", $remove$jscomp$1$$ - $removed$jscomp$5$$, ", \u2211:", $JSCompiler_StaticMethods_numberOfBindings$$($JSCompiler_StaticMethods_removeThenAdd_$self$$));
    return {$added$:$remove$jscomp$1$$, $removed$:$removed$jscomp$5$$};
  });
}, $JSCompiler_StaticMethods_ww_$$ = function($JSCompiler_StaticMethods_ww_$self_opt_localWin$jscomp$inline_2919$$, $JSCompiler_inline_result$jscomp$698_method$jscomp$23$$, $opt_args$jscomp$11$$) {
  var $win$jscomp$inline_2916$$ = $JSCompiler_StaticMethods_ww_$self_opt_localWin$jscomp$inline_2919$$.$J$;
  $JSCompiler_StaticMethods_ww_$self_opt_localWin$jscomp$inline_2919$$ = $JSCompiler_StaticMethods_ww_$self_opt_localWin$jscomp$inline_2919$$.$G$;
  $win$jscomp$inline_2916$$.Worker ? (_.$registerServiceBuilder$$module$src$service$$($win$jscomp$inline_2916$$, "amp-worker", $AmpWorker$$module$src$web_worker$amp_worker$$), $JSCompiler_inline_result$jscomp$698_method$jscomp$23$$ = _.$getService$$module$src$service$$($win$jscomp$inline_2916$$, "amp-worker").$sendMessage_$($JSCompiler_inline_result$jscomp$698_method$jscomp$23$$, $opt_args$jscomp$11$$ || [], $JSCompiler_StaticMethods_ww_$self_opt_localWin$jscomp$inline_2919$$)) : $JSCompiler_inline_result$jscomp$698_method$jscomp$23$$ = 
  window.Promise.reject("Worker not supported in window.");
  return $JSCompiler_inline_result$jscomp$698_method$jscomp$23$$;
}, $JSCompiler_StaticMethods_reportWorkerError_$$ = function($e$jscomp$199$$, $message$jscomp$58_userError$jscomp$1$$, $opt_element$jscomp$20$$) {
  $message$jscomp$58_userError$jscomp$1$$ = _.$user$$module$src$log$$().$createError$("%s %s", $message$jscomp$58_userError$jscomp$1$$, $e$jscomp$199$$.message);
  $message$jscomp$58_userError$jscomp$1$$.stack = $e$jscomp$199$$.stack;
  _.$reportError$$module$src$error$$($message$jscomp$58_userError$jscomp$1$$, $opt_element$jscomp$20$$);
  return $message$jscomp$58_userError$jscomp$1$$;
}, $JSCompiler_StaticMethods_debugPrintElement_$$ = function($JSCompiler_StaticMethods_debugPrintElement_$self$$, $element$jscomp$362$$) {
  var $index$jscomp$104$$ = _.$findIndex$$module$src$utils$array$$($JSCompiler_StaticMethods_debugPrintElement_$self$$.$D$, function($JSCompiler_StaticMethods_debugPrintElement_$self$$) {
    return $JSCompiler_StaticMethods_debugPrintElement_$self$$.element == $element$jscomp$362$$;
  });
  if (0 > $index$jscomp$104$$) {
    _.$user$$module$src$log$$().$Log$$module$src$log_prototype$info$("amp-bind", "Element has no bindings:", $element$jscomp$362$$);
  } else {
    var $promises$jscomp$19$$ = [], $boundProperties$jscomp$5$$ = $JSCompiler_StaticMethods_debugPrintElement_$self$$.$D$[$index$jscomp$104$$].$boundProperties$;
    $boundProperties$jscomp$5$$.forEach(function($element$jscomp$362$$) {
      $promises$jscomp$19$$.push($JSCompiler_StaticMethods_evaluateExpression_$$($JSCompiler_StaticMethods_debugPrintElement_$self$$, $element$jscomp$362$$.expressionString, $JSCompiler_StaticMethods_debugPrintElement_$self$$.$state_$));
    });
    window.Promise.all($promises$jscomp$19$$).then(function($JSCompiler_StaticMethods_debugPrintElement_$self$$) {
      var $element$jscomp$362$$ = _.$map$$module$src$utils$object$$();
      $boundProperties$jscomp$5$$.forEach(function($index$jscomp$104$$, $promises$jscomp$19$$) {
        $element$jscomp$362$$[$index$jscomp$104$$.property] = $JSCompiler_StaticMethods_debugPrintElement_$self$$[$promises$jscomp$19$$];
      });
      _.$user$$module$src$log$$().$Log$$module$src$log_prototype$info$("amp-bind", $element$jscomp$362$$);
    });
  }
};
_.$BaseElement$$module$src$base_element$$.prototype.$mutatedAttributesCallback$ = _.$JSCompiler_unstubMethod$$(28, function() {
});
_.$AmpImg$$module$builtins$amp_img$$.prototype.$mutatedAttributesCallback$ = _.$JSCompiler_unstubMethod$$(27, function($mutations$jscomp$1$$) {
  if (this.$img_$) {
    var $attrs$$ = _.$ATTRIBUTES_TO_PROPAGATE$$module$builtins$amp_img$$.filter(function($attrs$$) {
      return void 0 !== $mutations$jscomp$1$$[$attrs$$];
    });
    _.$JSCompiler_StaticMethods_propagateAttributes$$(this, $attrs$$, this.$img_$, !0);
    _.$guaranteeSrcForSrcsetUnsupportedBrowsers$$module$src$utils$img$$(this.$img_$);
  }
});
$AmpWorker$$module$src$web_worker$amp_worker$$.prototype.$sendMessage_$ = function($method$jscomp$20$$, $args$jscomp$28$$, $opt_localWin$jscomp$1$$) {
  var $$jscomp$this$jscomp$463$$ = this;
  return this.$K$.then(function() {
    return new window.Promise(function($JSCompiler_inline_result$jscomp$699_resolve$jscomp$57_win$jscomp$inline_2832$$, $index$jscomp$inline_2833_reject$jscomp$22$$) {
      var $id$jscomp$62$$ = $$jscomp$this$jscomp$463$$.$I$++;
      $$jscomp$this$jscomp$463$$.$D$[$id$jscomp$62$$] = {method:$method$jscomp$20$$, resolve:$JSCompiler_inline_result$jscomp$699_resolve$jscomp$57_win$jscomp$inline_2832$$, reject:$index$jscomp$inline_2833_reject$jscomp$22$$};
      $JSCompiler_inline_result$jscomp$699_resolve$jscomp$57_win$jscomp$inline_2832$$ = $opt_localWin$jscomp$1$$ || $$jscomp$this$jscomp$463$$.$J$;
      $index$jscomp$inline_2833_reject$jscomp$22$$ = $$jscomp$this$jscomp$463$$.$G$.indexOf($JSCompiler_inline_result$jscomp$699_resolve$jscomp$57_win$jscomp$inline_2832$$);
      $JSCompiler_inline_result$jscomp$699_resolve$jscomp$57_win$jscomp$inline_2832$$ = 0 <= $index$jscomp$inline_2833_reject$jscomp$22$$ ? $index$jscomp$inline_2833_reject$jscomp$22$$ : $$jscomp$this$jscomp$463$$.$G$.push($JSCompiler_inline_result$jscomp$699_resolve$jscomp$57_win$jscomp$inline_2832$$) - 1;
      $$jscomp$this$jscomp$463$$.$F$.postMessage({method:$method$jscomp$20$$, args:$args$jscomp$28$$, scope:$JSCompiler_inline_result$jscomp$699_resolve$jscomp$57_win$jscomp$inline_2832$$, id:$id$jscomp$62$$});
    });
  });
};
$AmpWorker$$module$src$web_worker$amp_worker$$.prototype.$O$ = function($event$jscomp$89_method$jscomp$21$$) {
  var $$jscomp$destructuring$var317_id$jscomp$63$$ = $event$jscomp$89_method$jscomp$21$$.data;
  $event$jscomp$89_method$jscomp$21$$ = $$jscomp$destructuring$var317_id$jscomp$63$$.method;
  var $returnValue$$ = $$jscomp$destructuring$var317_id$jscomp$63$$.returnValue;
  $$jscomp$destructuring$var317_id$jscomp$63$$ = $$jscomp$destructuring$var317_id$jscomp$63$$.id;
  var $message$jscomp$57$$ = this.$D$[$$jscomp$destructuring$var317_id$jscomp$63$$];
  $message$jscomp$57$$ ? ($message$jscomp$57$$.resolve($returnValue$$), delete this.$D$[$$jscomp$destructuring$var317_id$jscomp$63$$]) : _.$dev$$module$src$log$$().error("web-worker", "Received unexpected message (" + $event$jscomp$89_method$jscomp$21$$ + ", " + $$jscomp$destructuring$var317_id$jscomp$63$$ + ") from worker.");
};
_.$$jscomp$inherits$$($AmpBindMacro$$module$extensions$amp_bind$0_1$amp_bind_macro$$, window.AMP.BaseElement);
$AmpBindMacro$$module$extensions$amp_bind$0_1$amp_bind_macro$$.prototype.$getLayoutPriority$ = function() {
  return 1;
};
$AmpBindMacro$$module$extensions$amp_bind$0_1$amp_bind_macro$$.prototype.$isAlwaysFixed$ = function() {
  return !0;
};
$AmpBindMacro$$module$extensions$amp_bind$0_1$amp_bind_macro$$.prototype.$isLayoutSupported$ = function() {
  return !0;
};
$AmpBindMacro$$module$extensions$amp_bind$0_1$amp_bind_macro$$.prototype.$renderOutsideViewport$ = function() {
  return !0;
};
_.$$jscomp$inherits$$($AmpState$$module$extensions$amp_bind$0_1$amp_state$$, window.AMP.BaseElement);
_.$JSCompiler_prototypeAlias$$ = $AmpState$$module$extensions$amp_bind$0_1$amp_state$$.prototype;
_.$JSCompiler_prototypeAlias$$.$getLayoutPriority$ = function() {
  return 1;
};
_.$JSCompiler_prototypeAlias$$.$isAlwaysFixed$ = function() {
  return !0;
};
_.$JSCompiler_prototypeAlias$$.$isLayoutSupported$ = function() {
  return !0;
};
_.$JSCompiler_prototypeAlias$$.$buildCallback$ = function() {
  var $$jscomp$this$jscomp$464$$ = this;
  _.$toggle$$module$src$style$$(this.element, !1);
  this.element.setAttribute("aria-hidden", "true");
  _.$Services$$module$src$services$viewerForDoc$$(this.$getAmpDoc$()).$D$.then(function() {
    return $JSCompiler_StaticMethods_AmpState$$module$extensions$amp_bind$0_1$amp_state_prototype$initialize_$$($$jscomp$this$jscomp$464$$);
  });
};
_.$JSCompiler_prototypeAlias$$.$mutatedAttributesCallback$ = function($TAG$jscomp$15_mutations$jscomp$3$$) {
  _.$Services$$module$src$services$viewerForDoc$$(this.$getAmpDoc$()).$R$ ? void 0 !== $TAG$jscomp$15_mutations$jscomp$3$$.src && $JSCompiler_StaticMethods_fetchAndUpdate_$$(this, !1) : ($TAG$jscomp$15_mutations$jscomp$3$$ = $JSCompiler_StaticMethods_AmpState$$module$extensions$amp_bind$0_1$amp_state_prototype$getName_$$(this), _.$dev$$module$src$log$$().error($TAG$jscomp$15_mutations$jscomp$3$$, "Viewer must be visible before mutation."));
};
_.$JSCompiler_prototypeAlias$$.$renderOutsideViewport$ = function() {
  return !0;
};
var $GLOBAL_PROPERTY_RULES$$module$extensions$amp_bind$0_1$bind_validator$$ = {"class":{$blacklistedValueRegex$:"(^|\\W)i-amphtml-"}, hidden:null, text:null}, $AMP_PROPERTY_RULES$$module$extensions$amp_bind$0_1$bind_validator$$ = {width:null, height:null}, $ELEMENT_RULES$$module$extensions$amp_bind$0_1$bind_validator$$ = {"AMP-BRIGHTCOVE":{"data-account":null, "data-embed":null, "data-player":null, "data-player-id":null, "data-playlist-id":null, "data-video-id":null}, "AMP-CAROUSEL":{slide:null}, 
"AMP-DATE-PICKER":{max:null, min:null, src:{allowedProtocols:{https:!0}}}, "AMP-GOOGLE-DOCUMENT-EMBED":{src:null, title:null}, "AMP-IFRAME":{src:null}, "AMP-IMG":{alt:null, attribution:null, src:{allowedProtocols:{data:!0, http:!0, https:!0}}, srcset:{alternativeName:"src"}}, "AMP-LIGHTBOX":{open:null}, "AMP-LIST":{src:{allowedProtocols:{https:!0}}, state:null, "is-layout-container":null}, "AMP-SELECTOR":{disabled:null, selected:null}, "AMP-STATE":{src:{allowedProtocols:{https:!0}}}, "AMP-TIMEAGO":{datetime:null, 
title:null}, "AMP-VIDEO":{alt:null, attribution:null, controls:null, loop:null, poster:null, preload:null, src:{allowedProtocols:{https:!0}}}, "AMP-YOUTUBE":{"data-videoid":null}, A:{href:{allowedProtocols:{ftp:!0, http:!0, https:!0, mailto:!0, "fb-messenger":!0, intent:!0, skype:!0, sms:!0, snapchat:!0, tel:!0, tg:!0, threema:!0, twitter:!0, viber:!0, whatsapp:!0}}}, BUTTON:{disabled:null, type:null, value:null}, DETAILS:{open:null}, FIELDSET:{disabled:null}, IMAGE:{"xlink:href":{allowedProtocols:{http:!0, 
https:!0}}}, INPUT:{accept:null, accesskey:null, autocomplete:null, checked:null, disabled:null, height:null, inputmode:null, max:null, maxlength:null, min:null, minlength:null, multiple:null, pattern:null, placeholder:null, readonly:null, required:null, selectiondirection:null, size:null, spellcheck:null, step:null, type:{$blacklistedValueRegex$:"(^|\\s)(button|image|)(\\s|$)"}, value:null, width:null}, OPTION:{disabled:null, label:null, selected:null, value:null}, OPTGROUP:{disabled:null, label:null}, 
SELECT:{autofocus:null, disabled:null, multiple:null, required:null, size:null}, SOURCE:{src:{allowedProtocols:{https:!0}}, type:null}, TRACK:{label:null, src:{allowedProtocols:{https:!0}}, srclang:null}, TEXTAREA:{autocomplete:null, autofocus:null, cols:null, disabled:null, maxlength:null, minlength:null, placeholder:null, readonly:null, required:null, rows:null, selectiondirection:null, selectionend:null, selectionstart:null, spellcheck:null, wrap:null}}, $URL_PROPERTIES$$module$extensions$amp_bind$0_1$bind_validator$$ = 
{src:!0, srcset:!0, href:!0, "xlink:href":!0};
var $AMP_CSS_RE$$module$extensions$amp_bind$0_1$bind_impl$$ = /^(i?-)?amp(html)?-/, $BIND_ONLY_ATTRIBUTES$$module$extensions$amp_bind$0_1$bind_impl$$ = _.$map$$module$src$utils$object$$({"AMP-CAROUSEL":["slide"], "AMP-LIST":["state", "is-layout-container"], "AMP-SELECTOR":["selected"]});
$Bind$$module$extensions$amp_bind$0_1$bind_impl$$.$installInEmbedWindow$ = function($embedWin$jscomp$12$$, $ampdoc$jscomp$149$$) {
  _.$installServiceInEmbedScope$$module$src$service$$($embedWin$jscomp$12$$, "bind", new $Bind$$module$extensions$amp_bind$0_1$bind_impl$$($ampdoc$jscomp$149$$, $embedWin$jscomp$12$$));
};
_.$JSCompiler_prototypeAlias$$ = $Bind$$module$extensions$amp_bind$0_1$bind_impl$$.prototype;
_.$JSCompiler_prototypeAlias$$.signals = function() {
  return this.$U$;
};
_.$JSCompiler_prototypeAlias$$.setState = function($state$jscomp$53$$, $opt_skipEval$$, $opt_isAmpStateMutation$$) {
  var $$jscomp$this$jscomp$469$$ = this;
  try {
    _.$deepMerge$$module$src$utils$object$$(this.$state_$, $state$jscomp$53$$, 10);
  } catch ($e$239$$) {
    _.$user$$module$src$log$$().error("amp-bind", "Failed to merge result from AMP.setState().", $e$239$$);
  }
  _.$dev$$module$src$log$$().$Log$$module$src$log_prototype$info$("amp-bind", "state:", this.$state_$);
  return $opt_skipEval$$ ? window.Promise.resolve() : this.$P$ = this.$O$.then(function() {
    return $JSCompiler_StaticMethods_evaluate_$$($$jscomp$this$jscomp$469$$);
  }).then(function($state$jscomp$53$$) {
    return $JSCompiler_StaticMethods_apply_$$($$jscomp$this$jscomp$469$$, $state$jscomp$53$$, $opt_isAmpStateMutation$$);
  });
};
_.$JSCompiler_prototypeAlias$$.$invoke$ = function($invocation$jscomp$26_tagOrTarget$jscomp$5$$) {
  var $args$jscomp$29_expression$jscomp$4$$ = $invocation$jscomp$26_tagOrTarget$jscomp$5$$.args, $event$jscomp$90$$ = $invocation$jscomp$26_tagOrTarget$jscomp$5$$.event, $method$jscomp$22$$ = $invocation$jscomp$26_tagOrTarget$jscomp$5$$.method, $scope$jscomp$15_sequenceId$jscomp$2$$ = $invocation$jscomp$26_tagOrTarget$jscomp$5$$.$G$;
  $invocation$jscomp$26_tagOrTarget$jscomp$5$$ = $invocation$jscomp$26_tagOrTarget$jscomp$5$$.$tagOrTarget$;
  if (this.$K$.includes($scope$jscomp$15_sequenceId$jscomp$2$$)) {
    return _.$user$$module$src$log$$().error("amp-bind", "One state action allowed per event."), window.Promise.resolve();
  }
  this.$K$.push($scope$jscomp$15_sequenceId$jscomp$2$$);
  this.$Y$();
  if ($args$jscomp$29_expression$jscomp$4$$ = $args$jscomp$29_expression$jscomp$4$$.__AMP_OBJECT_STRING__) {
    switch(this.$I$ = Math.min(2000, Math.max(1000, this.$I$ + 500)), _.$JSCompiler_StaticMethods_signal$$(this.$U$, "FIRST_MUTATE"), $scope$jscomp$15_sequenceId$jscomp$2$$ = {}, $event$jscomp$90$$ && $event$jscomp$90$$.detail && ($scope$jscomp$15_sequenceId$jscomp$2$$.event = $event$jscomp$90$$.detail), $method$jscomp$22$$) {
      case "setState":
        return $JSCompiler_StaticMethods_setStateWithExpression$$(this, $args$jscomp$29_expression$jscomp$4$$, $scope$jscomp$15_sequenceId$jscomp$2$$);
      case "pushState":
        return $JSCompiler_StaticMethods_pushStateWithExpression$$(this, $args$jscomp$29_expression$jscomp$4$$, $scope$jscomp$15_sequenceId$jscomp$2$$);
      default:
        return window.Promise.reject(_.$dev$$module$src$log$$().$createError$("Unrecognized method: %s.%s", $invocation$jscomp$26_tagOrTarget$jscomp$5$$, $method$jscomp$22$$));
    }
  } else {
    _.$user$$module$src$log$$().error("AMP-BIND", "Please use the object-literal syntax, e.g. \"AMP.setState({foo: 'bar'})\" instead of \"AMP.setState(foo='bar')\".");
  }
  return window.Promise.resolve();
};
_.$JSCompiler_prototypeAlias$$.$scanAndApply$ = function($addedElements$$, $removedElements$$) {
  function $cleanup$jscomp$1$$($addedElements$$) {
    $JSCompiler_StaticMethods_removeBindingsForNodes_$$($$jscomp$this$jscomp$472$$, $removedElements$$).then(function($removedElements$$) {
      _.$dev$$module$src$log$$().$Log$$module$src$log_prototype$info$("amp-bind", "\u2937", "\u0394:", $addedElements$$ - $removedElements$$, ", \u2211:", $JSCompiler_StaticMethods_numberOfBindings$$($$jscomp$this$jscomp$472$$));
    });
    return window.Promise.resolve();
  }
  var $$jscomp$this$jscomp$472$$ = this;
  var $timeout$jscomp$10$$ = void 0 === $timeout$jscomp$10$$ ? 2000 : $timeout$jscomp$10$$;
  _.$dev$$module$src$log$$().$Log$$module$src$log_prototype$info$("amp-bind", "rescan:", $addedElements$$, $removedElements$$);
  if ($JSCompiler_StaticMethods_numberOfBindings$$(this) > this.$I$) {
    return $JSCompiler_StaticMethods_emitMaxBindingsExceededError_$$(this), $cleanup$jscomp$1$$(0);
  }
  var $bindings$jscomp$3$$ = [], $elementsToScan$$ = $addedElements$$.slice();
  $addedElements$$.forEach(function($addedElements$$) {
    Array.prototype.push.apply($elementsToScan$$, $addedElements$$.querySelectorAll("[i-amphtml-binding]"));
  });
  $elementsToScan$$.forEach(function($addedElements$$) {
    $JSCompiler_StaticMethods_scanElement_$$($$jscomp$this$jscomp$472$$, $addedElements$$, Number.POSITIVE_INFINITY, $bindings$jscomp$3$$);
  });
  var $added$$ = $bindings$jscomp$3$$.length;
  if (0 === $added$$) {
    return $cleanup$jscomp$1$$(0);
  }
  var $promise$jscomp$38$$ = $JSCompiler_StaticMethods_sendBindingsToWorker_$$(this, $bindings$jscomp$3$$).then(function() {
    return $JSCompiler_StaticMethods_evaluate_$$($$jscomp$this$jscomp$472$$).then(function($removedElements$$) {
      return $JSCompiler_StaticMethods_applyElements_$$($$jscomp$this$jscomp$472$$, $removedElements$$, $addedElements$$);
    });
  }).then(function() {
    $cleanup$jscomp$1$$($added$$);
  });
  return _.$JSCompiler_StaticMethods_timeoutPromise$$(this.$timer_$, $timeout$jscomp$10$$, $promise$jscomp$38$$, "Timed out waiting for amp-bind to process rendered template.");
};
_.$JSCompiler_prototypeAlias$$.$getStateValue$ = function($expr$jscomp$15_value$jscomp$200$$) {
  $expr$jscomp$15_value$jscomp$200$$ = _.$getValueForExpr$$module$src$json$$(this.$state_$, $expr$jscomp$15_value$jscomp$200$$);
  return _.$isObject$$module$src$types$$($expr$jscomp$15_value$jscomp$200$$) || _.$isArray$$module$src$types$$($expr$jscomp$15_value$jscomp$200$$) ? JSON.stringify($expr$jscomp$15_value$jscomp$200$$) : String($expr$jscomp$15_value$jscomp$200$$);
};
_.$JSCompiler_prototypeAlias$$.$premutate_$ = function($data$jscomp$111$$) {
  var $$jscomp$this$jscomp$474$$ = this, $ignoredKeys$$ = [];
  return this.$O$.then(function() {
    Object.keys($data$jscomp$111$$.state).forEach(function($key$jscomp$114$$) {
      $$jscomp$this$jscomp$474$$.$W$.includes($key$jscomp$114$$) || (delete $data$jscomp$111$$.state[$key$jscomp$114$$], $ignoredKeys$$.push($key$jscomp$114$$));
    });
    0 < $ignoredKeys$$.length && _.$user$$module$src$log$$().$Log$$module$src$log_prototype$warn$("amp-bind", "Some state keys could not be premutated because they are missing the overridable attribute: " + $ignoredKeys$$.join(", "));
    return $$jscomp$this$jscomp$474$$.setState($data$jscomp$111$$.state);
  });
};
_.$JSCompiler_prototypeAlias$$.$debugPrintState_$ = function($element$jscomp$361_opt_elementOrExpr_value$jscomp$203$$) {
  $element$jscomp$361_opt_elementOrExpr_value$jscomp$203$$ ? "string" == typeof $element$jscomp$361_opt_elementOrExpr_value$jscomp$203$$ ? ($element$jscomp$361_opt_elementOrExpr_value$jscomp$203$$ = _.$getValueForExpr$$module$src$json$$(this.$state_$, $element$jscomp$361_opt_elementOrExpr_value$jscomp$203$$), _.$user$$module$src$log$$().$Log$$module$src$log_prototype$info$("amp-bind", $element$jscomp$361_opt_elementOrExpr_value$jscomp$203$$)) : $element$jscomp$361_opt_elementOrExpr_value$jscomp$203$$.nodeType == 
  window.Node.ELEMENT_NODE ? ($element$jscomp$361_opt_elementOrExpr_value$jscomp$203$$ = _.$JSCompiler_StaticMethods_assertElement$$(_.$user$$module$src$log$$(), $element$jscomp$361_opt_elementOrExpr_value$jscomp$203$$), $JSCompiler_StaticMethods_debugPrintElement_$$(this, $element$jscomp$361_opt_elementOrExpr_value$jscomp$203$$)) : _.$user$$module$src$log$$().$Log$$module$src$log_prototype$info$("amp-bind", 'Invalid argument. Pass a JSON expression or an element instead e.g. AMP.printState("foo.bar") or AMP.printState($0) after selecting an element.') : 
  _.$user$$module$src$log$$().$Log$$module$src$log_prototype$info$("amp-bind", this.$state_$);
};
_.$JSCompiler_prototypeAlias$$.$debugEvaluate_$ = function($expression$jscomp$9$$) {
  $JSCompiler_StaticMethods_evaluateExpression_$$(this, $expression$jscomp$9$$, this.$state_$).then(function($expression$jscomp$9$$) {
    _.$user$$module$src$log$$().$Log$$module$src$log_prototype$info$("amp-bind", $expression$jscomp$9$$);
  });
};
var $AMP$jscomp$inline_2925$$ = window.self.AMP;
$AMP$jscomp$inline_2925$$.registerServiceForDoc("bind", $Bind$$module$extensions$amp_bind$0_1$bind_impl$$);
$AMP$jscomp$inline_2925$$.registerElement("amp-state", $AmpState$$module$extensions$amp_bind$0_1$amp_state$$);
$AMP$jscomp$inline_2925$$.registerElement("amp-bind-macro", $AmpBindMacro$$module$extensions$amp_bind$0_1$amp_bind_macro$$);

})});
