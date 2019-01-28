(self.AMP=self.AMP||[]).push({n:"_base_misc",i:"_base_i",v:"1901181729101",f:(function(AMP,_){
var $JSCompiler_StaticMethods_setVisible$$, $JSCompiler_StaticMethods_getFriendlyIframeEmbed_$$, $JSCompiler_StaticMethods_getViewportMeta_$$, $JSCompiler_StaticMethods_setViewportMetaString_$$, $JSCompiler_StaticMethods_runAnimMutateSeries$$, $$jscomp$arrayIterator$$, $$jscomp$iteratorPrototype$$, $parseSrcset$$module$src$srcset$$, $Srcset$$module$src$srcset$$, $sortByWidth$$module$src$srcset$$, $sortByDpr$$module$src$srcset$$, $addToSet$$module$dompurify$dist$purify_es$$, $clone$$module$dompurify$dist$purify_es$$, 
$_toConsumableArray$$module$dompurify$dist$purify_es$$, $createDOMPurify$$module$dompurify$dist$purify_es$$, $resolveUrlAttr$$module$src$purifier$$, $resolveImageUrlAttr$$module$src$purifier$$, $Gesture$$module$src$gesture$$, $Gestures$$module$src$gesture$$, $JSCompiler_StaticMethods_signalPending_$$, $JSCompiler_StaticMethods_signalEmit_$$, $JSCompiler_StaticMethods_afterEvent_$$, $JSCompiler_StaticMethods_Gestures$$module$src$gesture_prototype$stopTracking_$$, $GestureRecognizer$$module$src$gesture$$, 
$JSCompiler_StaticMethods_signalReady$$, $JSCompiler_StaticMethods_signalEnd$$, $NOOP_CALLBACK_$$module$src$motion$$, $calcVelocity$$module$src$motion$$, $Motion$$module$src$motion$$, $JSCompiler_StaticMethods_SwipeRecognizer$$module$src$gesture_recognizers_prototype$emit_$$, $JSCompiler_StaticMethods_TapzoomRecognizer$$module$src$gesture_recognizers_prototype$emit_$$, $JSCompiler_StaticMethods_PinchRecognizer$$module$src$gesture_recognizers_prototype$emit_$$, $ViewerLoginDialog$$module$extensions$amp_access$0_1$login_dialog$$, 
$WebLoginDialog$$module$extensions$amp_access$0_1$login_dialog$$, $JSCompiler_StaticMethods_WebLoginDialog$$module$extensions$amp_access$0_1$login_dialog_prototype$cleanup_$$, $JSCompiler_StaticMethods_WebLoginDialog$$module$extensions$amp_access$0_1$login_dialog_prototype$openInternal_$$, $JSCompiler_StaticMethods_setupDialog_$$, $JSCompiler_StaticMethods_loginDone_$$, $JSCompiler_StaticMethods_getReturnUrl_$$, $buildLoginUrl$$module$extensions$amp_access$0_1$login_dialog$$, $xhrRequest$$module$src$document_fetcher$$, 
$parseHeaders$$module$src$document_fetcher$$;
_.$JSCompiler_StaticMethods_registerDefaultAction$$ = function($JSCompiler_StaticMethods_registerDefaultAction$self$$, $handler$jscomp$7$$, $alias$jscomp$1$$, $minTrust$jscomp$1$$) {
  $alias$jscomp$1$$ = void 0 === $alias$jscomp$1$$ ? "activate" : $alias$jscomp$1$$;
  _.$JSCompiler_StaticMethods_registerAction$$($JSCompiler_StaticMethods_registerDefaultAction$self$$, $alias$jscomp$1$$, $handler$jscomp$7$$, void 0 === $minTrust$jscomp$1$$ ? 100 : $minTrust$jscomp$1$$);
  $JSCompiler_StaticMethods_registerDefaultAction$self$$.$defaultActionAlias_$ = $alias$jscomp$1$$;
};
_.$JSCompiler_StaticMethods_removeAll$$ = function($JSCompiler_StaticMethods_removeAll$self$$) {
  $JSCompiler_StaticMethods_removeAll$self$$.$D$ && ($JSCompiler_StaticMethods_removeAll$self$$.$D$.length = 0);
};
_.$JSCompiler_StaticMethods_getHandlerCount$$ = function($JSCompiler_StaticMethods_getHandlerCount$self$$) {
  return $JSCompiler_StaticMethods_getHandlerCount$self$$.$D$ ? $JSCompiler_StaticMethods_getHandlerCount$self$$.$D$.length : 0;
};
_.$JSCompiler_StaticMethods_installActionHandler$$ = function($JSCompiler_StaticMethods_installActionHandler$self$$, $target$jscomp$73$$, $handler$jscomp$17$$, $minTrust$jscomp$4$$) {
  $minTrust$jscomp$4$$ = void 0 === $minTrust$jscomp$4$$ ? 100 : $minTrust$jscomp$4$$;
  $target$jscomp$73$$.getAttribute("id");
  if ($target$jscomp$73$$.__AMP_ACTION_HANDLER__) {
    _.$dev$$module$src$log$$().error("Action", "Action handler already installed for " + $target$jscomp$73$$);
  } else {
    var $currentQueue$$ = $target$jscomp$73$$.__AMP_ACTION_QUEUE__;
    $target$jscomp$73$$.__AMP_ACTION_HANDLER__ = {$handler$:$handler$jscomp$17$$, $minTrust$:$minTrust$jscomp$4$$};
    _.$isArray$$module$src$types$$($currentQueue$$) && _.$Services$$module$src$services$timerFor$$($target$jscomp$73$$.ownerDocument.defaultView).delay(function() {
      $currentQueue$$.forEach(function($JSCompiler_StaticMethods_installActionHandler$self$$) {
        try {
          _.$JSCompiler_StaticMethods_satisfiesTrust$$($JSCompiler_StaticMethods_installActionHandler$self$$, $minTrust$jscomp$4$$) && $handler$jscomp$17$$($JSCompiler_StaticMethods_installActionHandler$self$$);
        } catch ($e$jscomp$46$$) {
          _.$dev$$module$src$log$$().error("Action", "Action execution failed:", $JSCompiler_StaticMethods_installActionHandler$self$$, $e$jscomp$46$$);
        }
      });
      $target$jscomp$73$$.__AMP_ACTION_QUEUE__.length = 0;
    }, 1);
  }
};
_.$JSCompiler_StaticMethods_sendSignal$$ = function($JSCompiler_StaticMethods_sendSignal$self$$, $input$jscomp$21$$, $opt_init$jscomp$11$$) {
  return _.$JSCompiler_StaticMethods_fetchAmpCors_$$($JSCompiler_StaticMethods_sendSignal$self$$, $input$jscomp$21$$, $opt_init$jscomp$11$$).then(function($JSCompiler_StaticMethods_sendSignal$self$$) {
    return _.$assertSuccess$$module$src$utils$xhr_utils$$($JSCompiler_StaticMethods_sendSignal$self$$);
  });
};
_.$JSCompiler_StaticMethods_uniform$$ = function($JSCompiler_StaticMethods_uniform$self$$, $input$jscomp$26$$) {
  return _.$JSCompiler_StaticMethods_sha384$$($JSCompiler_StaticMethods_uniform$self$$, $input$jscomp$26$$).then(function($JSCompiler_StaticMethods_uniform$self$$) {
    for (var $input$jscomp$26$$ = 0, $buffer$jscomp$11$$ = 2; 0 <= $buffer$jscomp$11$$; $buffer$jscomp$11$$--) {
      $input$jscomp$26$$ = ($input$jscomp$26$$ + $JSCompiler_StaticMethods_uniform$self$$[$buffer$jscomp$11$$]) / 256;
    }
    return $input$jscomp$26$$;
  });
};
_.$JSCompiler_StaticMethods_registerAnchorMutator$$ = function($JSCompiler_StaticMethods_registerAnchorMutator$self$$, $callback$jscomp$72$$, $priority$jscomp$5$$) {
  _.$JSCompiler_StaticMethods_PriorityQueue$$module$src$utils$priority_queue_prototype$enqueue$$($JSCompiler_StaticMethods_registerAnchorMutator$self$$.$J$, $callback$jscomp$72$$, $priority$jscomp$5$$);
};
_.$JSCompiler_StaticMethods_isBot$$ = function($JSCompiler_StaticMethods_isBot$self$$) {
  return /bot/i.test($JSCompiler_StaticMethods_isBot$self$$.$D$.userAgent);
};
_.$JSCompiler_StaticMethods_unwrap$$ = function($root$jscomp$11$$) {
  for (var $singleElement$$ = null, $n$jscomp$12$$ = $root$jscomp$11$$.firstChild; null != $n$jscomp$12$$; $n$jscomp$12$$ = $n$jscomp$12$$.nextSibling) {
    if (3 == $n$jscomp$12$$.nodeType) {
      if ($n$jscomp$12$$.textContent.trim()) {
        $singleElement$$ = null;
        break;
      }
    } else {
      if (8 != $n$jscomp$12$$.nodeType) {
        if (1 == $n$jscomp$12$$.nodeType) {
          if ($singleElement$$) {
            $singleElement$$ = null;
            break;
          } else {
            $singleElement$$ = $n$jscomp$12$$;
          }
        } else {
          $singleElement$$ = null;
        }
      }
    }
  }
  return $singleElement$$ || $root$jscomp$11$$;
};
_.$JSCompiler_StaticMethods_collectVars$$ = function($JSCompiler_StaticMethods_collectVars$self$$, $url$jscomp$87$$, $opt_bindings$jscomp$6$$) {
  var $vars$jscomp$2$$ = Object.create(null);
  return (new _.$Expander$$module$src$service$url_expander$expander$$($JSCompiler_StaticMethods_collectVars$self$$.$D$, $opt_bindings$jscomp$6$$, $vars$jscomp$2$$)).expand($url$jscomp$87$$).then(function() {
    return $vars$jscomp$2$$;
  });
};
$JSCompiler_StaticMethods_setVisible$$ = function($JSCompiler_StaticMethods_setVisible$self$$, $visible$jscomp$3$$) {
  $JSCompiler_StaticMethods_setVisible$self$$.$D$ && $JSCompiler_StaticMethods_setVisible$self$$.$vsync_$.$mutate$(function() {
    _.$setStyle$$module$src$style$$($JSCompiler_StaticMethods_setVisible$self$$.$D$.$F$(), "visibility", $visible$jscomp$3$$ ? "visible" : "hidden");
  });
};
$JSCompiler_StaticMethods_getFriendlyIframeEmbed_$$ = function($JSCompiler_StaticMethods_getFriendlyIframeEmbed_$self_iframeOptional$$, $element$jscomp$197$$) {
  return ($JSCompiler_StaticMethods_getFriendlyIframeEmbed_$self_iframeOptional$$ = _.$getParentWindowFrameElement$$module$src$service$$($element$jscomp$197$$, $JSCompiler_StaticMethods_getFriendlyIframeEmbed_$self_iframeOptional$$.ampdoc.$win$)) && _.$getFriendlyIframeEmbedOptional$$module$src$friendly_iframe_embed$$($JSCompiler_StaticMethods_getFriendlyIframeEmbed_$self_iframeOptional$$);
};
$JSCompiler_StaticMethods_getViewportMeta_$$ = function($JSCompiler_StaticMethods_getViewportMeta_$self$$) {
  if (_.$isIframed$$module$src$dom$$($JSCompiler_StaticMethods_getViewportMeta_$self$$.ampdoc.$win$)) {
    return null;
  }
  void 0 === $JSCompiler_StaticMethods_getViewportMeta_$self$$.$P$ && ($JSCompiler_StaticMethods_getViewportMeta_$self$$.$P$ = $JSCompiler_StaticMethods_getViewportMeta_$self$$.$J$.querySelector("meta[name=viewport]"), $JSCompiler_StaticMethods_getViewportMeta_$self$$.$P$ && ($JSCompiler_StaticMethods_getViewportMeta_$self$$.$K$ = $JSCompiler_StaticMethods_getViewportMeta_$self$$.$P$.content));
  return $JSCompiler_StaticMethods_getViewportMeta_$self$$.$P$;
};
$JSCompiler_StaticMethods_setViewportMetaString_$$ = function($JSCompiler_StaticMethods_setViewportMetaString_$self_viewportMeta$jscomp$1$$, $viewportMetaString$$) {
  return ($JSCompiler_StaticMethods_setViewportMetaString_$self_viewportMeta$jscomp$1$$ = $JSCompiler_StaticMethods_getViewportMeta_$$($JSCompiler_StaticMethods_setViewportMetaString_$self_viewportMeta$jscomp$1$$)) && $JSCompiler_StaticMethods_setViewportMetaString_$self_viewportMeta$jscomp$1$$.content != $viewportMetaString$$ ? ("Viewport", $JSCompiler_StaticMethods_setViewportMetaString_$self_viewportMeta$jscomp$1$$.content = $viewportMetaString$$, !0) : !1;
};
_.$JSCompiler_StaticMethods_leaveOverlayMode$$ = function($JSCompiler_StaticMethods_leaveOverlayMode$self$$) {
  $JSCompiler_StaticMethods_leaveOverlayMode$self$$.$Viewport$$module$src$service$viewport$viewport_impl_prototype$resetScroll$();
  void 0 !== $JSCompiler_StaticMethods_leaveOverlayMode$self$$.$K$ && $JSCompiler_StaticMethods_setViewportMetaString_$$($JSCompiler_StaticMethods_leaveOverlayMode$self$$, $JSCompiler_StaticMethods_leaveOverlayMode$self$$.$K$);
};
_.$JSCompiler_StaticMethods_leaveLightboxMode$$ = function($JSCompiler_StaticMethods_leaveLightboxMode$self$$, $fieOptional$jscomp$inline_1635_opt_requestingElement$jscomp$1$$) {
  _.$JSCompiler_StaticMethods_Viewer$$module$src$service$viewer_impl_prototype$sendMessage$$($JSCompiler_StaticMethods_leaveLightboxMode$self$$.$viewer_$, "cancelFullOverlay", {}, !0);
  $JSCompiler_StaticMethods_setVisible$$($JSCompiler_StaticMethods_leaveLightboxMode$self$$.$G$, !0);
  _.$JSCompiler_StaticMethods_leaveOverlayMode$$($JSCompiler_StaticMethods_leaveLightboxMode$self$$);
  $fieOptional$jscomp$inline_1635_opt_requestingElement$jscomp$1$$ && ($fieOptional$jscomp$inline_1635_opt_requestingElement$jscomp$1$$ = $JSCompiler_StaticMethods_getFriendlyIframeEmbed_$$($JSCompiler_StaticMethods_leaveLightboxMode$self$$, $fieOptional$jscomp$inline_1635_opt_requestingElement$jscomp$1$$)) && $fieOptional$jscomp$inline_1635_opt_requestingElement$jscomp$1$$.$leaveFullOverlayMode$();
  return $JSCompiler_StaticMethods_leaveLightboxMode$self$$.$D$.$updateLightboxMode$(!1);
};
_.$JSCompiler_StaticMethods_disableTouchZoom$$ = function($JSCompiler_StaticMethods_disableTouchZoom$self$$) {
  var $params$jscomp$inline_5801_viewportMeta$$ = $JSCompiler_StaticMethods_getViewportMeta_$$($JSCompiler_StaticMethods_disableTouchZoom$self$$);
  if (!$params$jscomp$inline_5801_viewportMeta$$) {
    return !1;
  }
  var $currentValue$jscomp$inline_1637$$ = $params$jscomp$inline_5801_viewportMeta$$.content, $updateParams$jscomp$inline_1638$$ = {"maximum-scale":"1", "user-scalable":"no"};
  $params$jscomp$inline_5801_viewportMeta$$ = Object.create(null);
  if ($currentValue$jscomp$inline_1637$$) {
    for (var $changed$jscomp$inline_1640_pairs$jscomp$inline_5802$$ = $currentValue$jscomp$inline_1637$$.split(/,|;/), $i$jscomp$inline_5803$$ = 0; $i$jscomp$inline_5803$$ < $changed$jscomp$inline_1640_pairs$jscomp$inline_5802$$.length; $i$jscomp$inline_5803$$++) {
      var $split$jscomp$inline_5804_value$jscomp$inline_5806$$ = $changed$jscomp$inline_1640_pairs$jscomp$inline_5802$$[$i$jscomp$inline_5803$$].split("="), $name$jscomp$inline_5805$$ = $split$jscomp$inline_5804_value$jscomp$inline_5806$$[0].trim();
      $split$jscomp$inline_5804_value$jscomp$inline_5806$$ = $split$jscomp$inline_5804_value$jscomp$inline_5806$$[1];
      $split$jscomp$inline_5804_value$jscomp$inline_5806$$ = ($split$jscomp$inline_5804_value$jscomp$inline_5806$$ || "").trim();
      $name$jscomp$inline_5805$$ && ($params$jscomp$inline_5801_viewportMeta$$[$name$jscomp$inline_5805$$] = $split$jscomp$inline_5804_value$jscomp$inline_5806$$);
    }
  }
  $changed$jscomp$inline_1640_pairs$jscomp$inline_5802$$ = !1;
  for (var $content$jscomp$inline_5809_k$jscomp$inline_1641$$ in $updateParams$jscomp$inline_1638$$) {
    $params$jscomp$inline_5801_viewportMeta$$[$content$jscomp$inline_5809_k$jscomp$inline_1641$$] !== $updateParams$jscomp$inline_1638$$[$content$jscomp$inline_5809_k$jscomp$inline_1641$$] && ($changed$jscomp$inline_1640_pairs$jscomp$inline_5802$$ = !0, void 0 !== $updateParams$jscomp$inline_1638$$[$content$jscomp$inline_5809_k$jscomp$inline_1641$$] ? $params$jscomp$inline_5801_viewportMeta$$[$content$jscomp$inline_5809_k$jscomp$inline_1641$$] = $updateParams$jscomp$inline_1638$$[$content$jscomp$inline_5809_k$jscomp$inline_1641$$] : 
    delete $params$jscomp$inline_5801_viewportMeta$$[$content$jscomp$inline_5809_k$jscomp$inline_1641$$]);
  }
  if ($changed$jscomp$inline_1640_pairs$jscomp$inline_5802$$) {
    $content$jscomp$inline_5809_k$jscomp$inline_1641$$ = "";
    for ($JSCompiler_temp$jscomp$5596_k$jscomp$inline_5810$$ in $params$jscomp$inline_5801_viewportMeta$$) {
      0 < $content$jscomp$inline_5809_k$jscomp$inline_1641$$.length && ($content$jscomp$inline_5809_k$jscomp$inline_1641$$ += ","), $content$jscomp$inline_5809_k$jscomp$inline_1641$$ = $params$jscomp$inline_5801_viewportMeta$$[$JSCompiler_temp$jscomp$5596_k$jscomp$inline_5810$$] ? $content$jscomp$inline_5809_k$jscomp$inline_1641$$ + ($JSCompiler_temp$jscomp$5596_k$jscomp$inline_5810$$ + "=" + $params$jscomp$inline_5801_viewportMeta$$[$JSCompiler_temp$jscomp$5596_k$jscomp$inline_5810$$]) : $content$jscomp$inline_5809_k$jscomp$inline_1641$$ + 
      $JSCompiler_temp$jscomp$5596_k$jscomp$inline_5810$$;
    }
    var $JSCompiler_temp$jscomp$5596_k$jscomp$inline_5810$$ = $content$jscomp$inline_5809_k$jscomp$inline_1641$$;
  } else {
    $JSCompiler_temp$jscomp$5596_k$jscomp$inline_5810$$ = $currentValue$jscomp$inline_1637$$;
  }
  return $JSCompiler_StaticMethods_setViewportMetaString_$$($JSCompiler_StaticMethods_disableTouchZoom$self$$, $JSCompiler_temp$jscomp$5596_k$jscomp$inline_5810$$);
};
_.$JSCompiler_StaticMethods_resetTouchZoom$$ = function($JSCompiler_StaticMethods_resetTouchZoom$self$$) {
  var $windowHeight$$ = $JSCompiler_StaticMethods_resetTouchZoom$self$$.ampdoc.$win$.innerHeight, $documentHeight$$ = $JSCompiler_StaticMethods_resetTouchZoom$self$$.$J$.documentElement.clientHeight;
  $windowHeight$$ && $documentHeight$$ && $windowHeight$$ === $documentHeight$$ || _.$JSCompiler_StaticMethods_disableTouchZoom$$($JSCompiler_StaticMethods_resetTouchZoom$self$$) && $JSCompiler_StaticMethods_resetTouchZoom$self$$.$timer_$.delay(function() {
    void 0 !== $JSCompiler_StaticMethods_resetTouchZoom$self$$.$K$ && $JSCompiler_StaticMethods_setViewportMetaString_$$($JSCompiler_StaticMethods_resetTouchZoom$self$$, $JSCompiler_StaticMethods_resetTouchZoom$self$$.$K$);
  }, 50);
};
_.$JSCompiler_StaticMethods_enterOverlayMode$$ = function($JSCompiler_StaticMethods_enterOverlayMode$self$$) {
  _.$JSCompiler_StaticMethods_disableTouchZoom$$($JSCompiler_StaticMethods_enterOverlayMode$self$$);
  _.$JSCompiler_StaticMethods_Viewport$$module$src$service$viewport$viewport_impl_prototype$disableScroll$$($JSCompiler_StaticMethods_enterOverlayMode$self$$);
};
_.$JSCompiler_StaticMethods_enterLightboxMode$$ = function($JSCompiler_StaticMethods_enterLightboxMode$self$$, $fieOptional$jscomp$inline_1629_opt_requestingElement$$) {
  _.$JSCompiler_StaticMethods_Viewer$$module$src$service$viewer_impl_prototype$sendMessage$$($JSCompiler_StaticMethods_enterLightboxMode$self$$.$viewer_$, "requestFullOverlay", {}, !0);
  _.$JSCompiler_StaticMethods_enterOverlayMode$$($JSCompiler_StaticMethods_enterLightboxMode$self$$);
  $JSCompiler_StaticMethods_setVisible$$($JSCompiler_StaticMethods_enterLightboxMode$self$$.$G$, !1);
  $fieOptional$jscomp$inline_1629_opt_requestingElement$$ && ($fieOptional$jscomp$inline_1629_opt_requestingElement$$ = $JSCompiler_StaticMethods_getFriendlyIframeEmbed_$$($JSCompiler_StaticMethods_enterLightboxMode$self$$, $fieOptional$jscomp$inline_1629_opt_requestingElement$$)) && (_.$isExperimentOn$$module$src$experiments$$($JSCompiler_StaticMethods_enterLightboxMode$self$$.ampdoc.$win$, "amp-lightbox-a4a-proto"), $fieOptional$jscomp$inline_1629_opt_requestingElement$$.$enterFullOverlayMode$());
  return $JSCompiler_StaticMethods_enterLightboxMode$self$$.$D$.$updateLightboxMode$(!0);
};
$JSCompiler_StaticMethods_runAnimMutateSeries$$ = function($JSCompiler_StaticMethods_runAnimMutateSeries$self$$, $contextNode$jscomp$8$$, $mutator$jscomp$10$$) {
  return _.$JSCompiler_StaticMethods_canAnimate_$$($JSCompiler_StaticMethods_runAnimMutateSeries$self$$, $contextNode$jscomp$8$$) ? new window.Promise(function($resolve$jscomp$40$$, $reject$jscomp$18$$) {
    var $startTime$jscomp$9$$ = Date.now(), $prevTime$$ = 0, $task$jscomp$22$$ = _.$JSCompiler_StaticMethods_createAnimTask$$($JSCompiler_StaticMethods_runAnimMutateSeries$self$$, $contextNode$jscomp$8$$, {$mutate$:function($JSCompiler_StaticMethods_runAnimMutateSeries$self$$) {
      var $contextNode$jscomp$8$$ = Date.now() - $startTime$jscomp$9$$;
      $mutator$jscomp$10$$($contextNode$jscomp$8$$, $contextNode$jscomp$8$$ - $prevTime$$, $JSCompiler_StaticMethods_runAnimMutateSeries$self$$) ? 5000 < $contextNode$jscomp$8$$ ? $reject$jscomp$18$$(Error("timeout")) : ($prevTime$$ = $contextNode$jscomp$8$$, $task$jscomp$22$$($JSCompiler_StaticMethods_runAnimMutateSeries$self$$)) : $resolve$jscomp$40$$();
    }});
    $task$jscomp$22$$({});
  }) : window.Promise.reject(_.$cancellation$$module$src$error$$());
};
_.$$jscomp$initSymbol$$ = function() {
  _.$$jscomp$initSymbol$$ = function() {
  };
  _.$$jscomp$global$$.Symbol || (_.$$jscomp$global$$.Symbol = _.$$jscomp$Symbol$$);
};
_.$$jscomp$initSymbolIterator$$ = function() {
  _.$$jscomp$initSymbol$$();
  var $symbolIterator$$ = _.$$jscomp$global$$.Symbol.iterator;
  $symbolIterator$$ || ($symbolIterator$$ = _.$$jscomp$global$$.Symbol.iterator = _.$$jscomp$global$$.Symbol("iterator"));
  "function" != typeof Array.prototype[$symbolIterator$$] && (0,_.$$jscomp$defineProperty$$)(Array.prototype, $symbolIterator$$, {configurable:!0, writable:!0, value:function() {
    return $$jscomp$arrayIterator$$(this);
  }});
  _.$$jscomp$initSymbolIterator$$ = function() {
  };
};
$$jscomp$arrayIterator$$ = function($array$jscomp$5$$) {
  var $index$jscomp$54$$ = 0;
  return $$jscomp$iteratorPrototype$$(function() {
    return $index$jscomp$54$$ < $array$jscomp$5$$.length ? {done:!1, value:$array$jscomp$5$$[$index$jscomp$54$$++]} : {done:!0};
  });
};
$$jscomp$iteratorPrototype$$ = function($iterator$jscomp$6_next$$) {
  _.$$jscomp$initSymbolIterator$$();
  $iterator$jscomp$6_next$$ = {next:$iterator$jscomp$6_next$$};
  $iterator$jscomp$6_next$$[_.$$jscomp$global$$.Symbol.iterator] = function() {
    return this;
  };
  return $iterator$jscomp$6_next$$;
};
_.$toUpperCase$$module$src$string$$ = function($_match$$, $character$$) {
  return $character$$.toUpperCase();
};
_.$dashToUnderline$$module$src$string$$ = function() {
  return window.navigator.language.replace("-", "_");
};
_.$omit$$module$src$utils$object$$ = function($o$$, $props$jscomp$130$$) {
  return Object.keys($o$$).reduce(function($acc$$, $key$jscomp$38$$) {
    $props$jscomp$130$$.includes($key$jscomp$38$$) || ($acc$$[$key$jscomp$38$$] = $o$$[$key$jscomp$38$$]);
    return $acc$$;
  }, {});
};
_.$copyChildren$$module$src$dom$$ = function($from_n$jscomp$3$$, $to$$) {
  var $frag$$ = $to$$.ownerDocument.createDocumentFragment();
  for ($from_n$jscomp$3$$ = $from_n$jscomp$3$$.firstChild; $from_n$jscomp$3$$; $from_n$jscomp$3$$ = $from_n$jscomp$3$$.nextSibling) {
    $frag$$.appendChild($from_n$jscomp$3$$.cloneNode(!0));
  }
  $to$$.appendChild($frag$$);
};
_.$childElement$$module$src$dom$$ = function($child_parent$jscomp$5$$, $callback$jscomp$55$$) {
  for ($child_parent$jscomp$5$$ = $child_parent$jscomp$5$$.firstElementChild; $child_parent$jscomp$5$$; $child_parent$jscomp$5$$ = $child_parent$jscomp$5$$.nextElementSibling) {
    if ($callback$jscomp$55$$($child_parent$jscomp$5$$)) {
      return $child_parent$jscomp$5$$;
    }
  }
  return null;
};
_.$templateContentClone$$module$src$dom$$ = function($template$jscomp$2$$) {
  if ("content" in $template$jscomp$2$$) {
    return $template$jscomp$2$$.content.cloneNode(!0);
  }
  var $content$$ = $template$jscomp$2$$.ownerDocument.createDocumentFragment();
  _.$copyChildren$$module$src$dom$$($template$jscomp$2$$, $content$$);
  return $content$$;
};
_.$isJsonScriptTag$$module$src$dom$$ = function($element$jscomp$21$$) {
  return "SCRIPT" == $element$jscomp$21$$.tagName && $element$jscomp$21$$.hasAttribute("type") && "APPLICATION/JSON" == $element$jscomp$21$$.getAttribute("type").toUpperCase();
};
_.$getChildJsonConfig$$module$src$json$$ = function($element$jscomp$30_script_scripts$$) {
  $element$jscomp$30_script_scripts$$ = _.$childElementsByTag$$module$src$dom$$($element$jscomp$30_script_scripts$$, "script");
  if (1 !== $element$jscomp$30_script_scripts$$.length) {
    throw Error("Found " + $element$jscomp$30_script_scripts$$.length + " <script> children. Expected 1.");
  }
  $element$jscomp$30_script_scripts$$ = $element$jscomp$30_script_scripts$$[0];
  if (!_.$isJsonScriptTag$$module$src$dom$$($element$jscomp$30_script_scripts$$)) {
    throw Error('<script> child must have type="application/json"');
  }
  try {
    return _.$parseJson$$module$src$json$$($element$jscomp$30_script_scripts$$.textContent);
  } catch ($unusedError$$) {
    throw Error("Failed to parse <script> contents. Is it valid JSON?");
  }
};
_.$Services$$module$src$services$accessServiceForDoc$$ = function($element$jscomp$36$$) {
  return _.$getElementServiceForDoc$$module$src$element_service$$($element$jscomp$36$$, "access", "amp-access");
};
_.$Services$$module$src$services$webAnimationServiceFor$$ = function($element$jscomp$47$$) {
  return _.$getElementServiceForDoc$$module$src$element_service$$($element$jscomp$47$$, "web-animation", "amp-animation");
};
_.$scale$$module$src$style$$ = function($value$jscomp$114$$) {
  return "scale(" + $value$jscomp$114$$ + ")";
};
_.$rotate$$module$src$style$$ = function($value$jscomp$115$$) {
  "number" == typeof $value$jscomp$115$$ && ($value$jscomp$115$$ += "deg");
  return "rotate(" + $value$jscomp$115$$ + ")";
};
_.$chunk$$module$src$chunk$$ = function($JSCompiler_StaticMethods_Chunks$$module$src$chunk_prototype$run$self$jscomp$inline_1981_elementOrAmpDoc$jscomp$18$$, $fn$jscomp$10$$) {
  _.$deactivated$$module$src$chunk$$ ? _.$resolved$$module$src$chunk$$.then($fn$jscomp$10$$) : ($JSCompiler_StaticMethods_Chunks$$module$src$chunk_prototype$run$self$jscomp$inline_1981_elementOrAmpDoc$jscomp$18$$ = _.$chunkServiceForDoc$$module$src$chunk$$($JSCompiler_StaticMethods_Chunks$$module$src$chunk_prototype$run$self$jscomp$inline_1981_elementOrAmpDoc$jscomp$18$$), _.$JSCompiler_StaticMethods_enqueueTask_$$($JSCompiler_StaticMethods_Chunks$$module$src$chunk_prototype$run$self$jscomp$inline_1981_elementOrAmpDoc$jscomp$18$$, 
  new _.$Task$$module$src$chunk$$($fn$jscomp$10$$), 10));
};
_.$base64UrlDecodeToBytes$$module$src$utils$base64$$ = function($encoded_str$jscomp$9$$) {
  $encoded_str$jscomp$9$$ = (0,window.atob)($encoded_str$jscomp$9$$.replace(/[-_.]/g, function($encoded_str$jscomp$9$$) {
    return $base64UrlDecodeSubs$$module$src$utils$base64$$[$encoded_str$jscomp$9$$];
  }));
  return _.$stringToBytes$$module$src$utils$bytes$$($encoded_str$jscomp$9$$);
};
_.$isInFie$$module$src$friendly_iframe_embed$$ = function($element$jscomp$158$$) {
  return !!_.$closestBySelector$$module$src$dom$$($element$jscomp$158$$, ".i-amphtml-fie");
};
_.$setStyles$$module$src$transition$$ = function($element$jscomp$159$$, $styles$jscomp$3$$) {
  return function($time$jscomp$7$$, $complete$jscomp$3$$) {
    for (var $k$jscomp$12$$ in $styles$jscomp$3$$) {
      var $style$jscomp$inline_1985$$ = $k$jscomp$12$$;
      "display" === $style$jscomp$inline_1985$$ && _.$dev$$module$src$log$$().error("STYLE", "`display` style detected. You must use toggle instead.");
      _.$setStyle$$module$src$style$$($element$jscomp$159$$, $style$jscomp$inline_1985$$, $styles$jscomp$3$$[$k$jscomp$12$$]($time$jscomp$7$$, $complete$jscomp$3$$));
    }
  };
};
_.$VideoServiceSync$$module$src$service$video_service_sync_impl$delegateAutoplay$$ = function($video$jscomp$7$$) {
  _.$JSCompiler_StaticMethods_signal$$($video$jscomp$7$$.signals(), "autoplay-delegated");
};
_.$mod$$module$src$utils$math$$ = function($a$jscomp$4$$, $b$jscomp$8$$) {
  return 0 < $a$jscomp$4$$ && 0 < $b$jscomp$8$$ ? $a$jscomp$4$$ % $b$jscomp$8$$ : ($a$jscomp$4$$ % $b$jscomp$8$$ + $b$jscomp$8$$) % $b$jscomp$8$$;
};
_.$SsrTemplateHelper$$module$src$ssr_template_helper$$ = function($sourceComponent$$, $viewer$jscomp$29$$, $templates$$) {
  this.$viewer_$ = $viewer$jscomp$29$$;
  this.$templates_$ = $templates$$;
  this.$D$ = $sourceComponent$$;
};
_.$JSCompiler_StaticMethods_fetchAndRenderTemplate$$ = function($JSCompiler_StaticMethods_fetchAndRenderTemplate$self_ampComponent$jscomp$inline_1992$$, $JSCompiler_temp_const$jscomp$581_element$jscomp$258$$, $JSCompiler_inline_result$jscomp$582_request$jscomp$10$$, $opt_templates_opt_templates$jscomp$inline_1990$$, $opt_attributes_opt_attributes$jscomp$inline_1991$$) {
  $opt_templates_opt_templates$jscomp$inline_1990$$ = void 0 === $opt_templates_opt_templates$jscomp$inline_1990$$ ? null : $opt_templates_opt_templates$jscomp$inline_1990$$;
  $opt_attributes_opt_attributes$jscomp$inline_1991$$ = void 0 === $opt_attributes_opt_attributes$jscomp$inline_1991$$ ? {} : $opt_attributes_opt_attributes$jscomp$inline_1991$$;
  var $errorTemplate$jscomp$inline_1994_mustacheTemplate_successTemplate$jscomp$inline_1993$$;
  $opt_templates_opt_templates$jscomp$inline_1990$$ || ($errorTemplate$jscomp$inline_1994_mustacheTemplate_successTemplate$jscomp$inline_1993$$ = _.$JSCompiler_StaticMethods_maybeFindTemplate$$($JSCompiler_temp_const$jscomp$581_element$jscomp$258$$));
  $JSCompiler_temp_const$jscomp$581_element$jscomp$258$$ = $JSCompiler_StaticMethods_fetchAndRenderTemplate$self_ampComponent$jscomp$inline_1992$$.$viewer_$;
  $opt_attributes_opt_attributes$jscomp$inline_1991$$ = void 0 === $opt_attributes_opt_attributes$jscomp$inline_1991$$ ? {} : $opt_attributes_opt_attributes$jscomp$inline_1991$$;
  $JSCompiler_StaticMethods_fetchAndRenderTemplate$self_ampComponent$jscomp$inline_1992$$ = _.$dict$$module$src$utils$object$$({type:$JSCompiler_StaticMethods_fetchAndRenderTemplate$self_ampComponent$jscomp$inline_1992$$.$D$});
  ($errorTemplate$jscomp$inline_1994_mustacheTemplate_successTemplate$jscomp$inline_1993$$ = $opt_templates_opt_templates$jscomp$inline_1990$$ && $opt_templates_opt_templates$jscomp$inline_1990$$.successTemplate ? $opt_templates_opt_templates$jscomp$inline_1990$$.successTemplate : $errorTemplate$jscomp$inline_1994_mustacheTemplate_successTemplate$jscomp$inline_1993$$) && ($JSCompiler_StaticMethods_fetchAndRenderTemplate$self_ampComponent$jscomp$inline_1992$$.successTemplate = {type:"amp-mustache", 
  payload:$errorTemplate$jscomp$inline_1994_mustacheTemplate_successTemplate$jscomp$inline_1993$$.innerHTML});
  ($errorTemplate$jscomp$inline_1994_mustacheTemplate_successTemplate$jscomp$inline_1993$$ = $opt_templates_opt_templates$jscomp$inline_1990$$ && $opt_templates_opt_templates$jscomp$inline_1990$$.errorTemplate ? $opt_templates_opt_templates$jscomp$inline_1990$$.errorTemplate : null) && ($JSCompiler_StaticMethods_fetchAndRenderTemplate$self_ampComponent$jscomp$inline_1992$$.errorTemplate = {type:"amp-mustache", payload:$errorTemplate$jscomp$inline_1994_mustacheTemplate_successTemplate$jscomp$inline_1993$$.innerHTML});
  $opt_attributes_opt_attributes$jscomp$inline_1991$$ && Object.assign($JSCompiler_StaticMethods_fetchAndRenderTemplate$self_ampComponent$jscomp$inline_1992$$, $opt_attributes_opt_attributes$jscomp$inline_1991$$);
  $JSCompiler_inline_result$jscomp$582_request$jscomp$10$$ = _.$dict$$module$src$utils$object$$({originalRequest:_.$toStructuredCloneable$$module$src$utils$xhr_utils$$($JSCompiler_inline_result$jscomp$582_request$jscomp$10$$.xhrUrl, $JSCompiler_inline_result$jscomp$582_request$jscomp$10$$.fetchOpt), ampComponent:$JSCompiler_StaticMethods_fetchAndRenderTemplate$self_ampComponent$jscomp$inline_1992$$});
  return _.$JSCompiler_StaticMethods_sendMessageAwaitResponse$$($JSCompiler_temp_const$jscomp$581_element$jscomp$258$$, "viewerRenderTemplate", $JSCompiler_inline_result$jscomp$582_request$jscomp$10$$);
};
_.$srcsetFromElement$$module$src$srcset$$ = function($element$jscomp$259_srcAttr$$) {
  var $srcsetAttr$$ = $element$jscomp$259_srcAttr$$.getAttribute("srcset");
  if ($srcsetAttr$$) {
    return $parseSrcset$$module$src$srcset$$($srcsetAttr$$);
  }
  $element$jscomp$259_srcAttr$$ = $element$jscomp$259_srcAttr$$.getAttribute("src");
  return _.$srcsetFromSrc$$module$src$srcset$$($element$jscomp$259_srcAttr$$);
};
_.$srcsetFromSrc$$module$src$srcset$$ = function($src$jscomp$14$$) {
  return new $Srcset$$module$src$srcset$$([{url:$src$jscomp$14$$, width:void 0, $dpr$:1}]);
};
$parseSrcset$$module$src$srcset$$ = function($s$jscomp$22$$) {
  for (var $sources$$ = [], $match$jscomp$12$$; $match$jscomp$12$$ = $srcsetRegex$$module$src$srcset$$.exec($s$jscomp$22$$);) {
    var $url$jscomp$106$$ = $match$jscomp$12$$[1], $width$jscomp$23$$ = void 0;
    if ($match$jscomp$12$$[2]) {
      var $type$jscomp$139$$ = $match$jscomp$12$$[3].toLowerCase();
      if ("w" == $type$jscomp$139$$) {
        $width$jscomp$23$$ = (0,window.parseInt)($match$jscomp$12$$[2], 10);
      } else {
        if ("x" == $type$jscomp$139$$) {
          var $dpr$$ = (0,window.parseFloat)($match$jscomp$12$$[2]);
        } else {
          continue;
        }
      }
    } else {
      $dpr$$ = 1;
    }
    $sources$$.push({url:$url$jscomp$106$$, width:$width$jscomp$23$$, $dpr$:$dpr$$});
  }
  return new $Srcset$$module$src$srcset$$($sources$$);
};
$Srcset$$module$src$srcset$$ = function($sources$jscomp$1$$) {
  this.$D$ = $sources$jscomp$1$$;
  for (var $hasWidth$$ = !1, $i$jscomp$148$$ = 0; $i$jscomp$148$$ < $sources$jscomp$1$$.length; $i$jscomp$148$$++) {
    var $source$jscomp$22$$ = $sources$jscomp$1$$[$i$jscomp$148$$];
    $hasWidth$$ = $hasWidth$$ || !!$source$jscomp$22$$.width;
  }
  $sources$jscomp$1$$.sort($hasWidth$$ ? $sortByWidth$$module$src$srcset$$ : $sortByDpr$$module$src$srcset$$);
  this.$F$ = $hasWidth$$;
};
_.$JSCompiler_StaticMethods_Srcset$$module$src$srcset_prototype$stringify$$ = function($JSCompiler_StaticMethods_Srcset$$module$src$srcset_prototype$stringify$self$$, $opt_mapper$$) {
  for (var $res$jscomp$18$$ = [], $sources$jscomp$4$$ = $JSCompiler_StaticMethods_Srcset$$module$src$srcset_prototype$stringify$self$$.$D$, $i$jscomp$151$$ = 0; $i$jscomp$151$$ < $sources$jscomp$4$$.length; $i$jscomp$151$$++) {
    var $source$jscomp$23$$ = $sources$jscomp$4$$[$i$jscomp$151$$], $src$jscomp$15$$ = $source$jscomp$23$$.url;
    $opt_mapper$$ && ($src$jscomp$15$$ = $opt_mapper$$($src$jscomp$15$$));
    $src$jscomp$15$$ = $JSCompiler_StaticMethods_Srcset$$module$src$srcset_prototype$stringify$self$$.$F$ ? $src$jscomp$15$$ + (" " + $source$jscomp$23$$.width + "w") : $src$jscomp$15$$ + (" " + $source$jscomp$23$$.$dpr$ + "x");
    $res$jscomp$18$$.push($src$jscomp$15$$);
  }
  return $res$jscomp$18$$.join(", ");
};
$sortByWidth$$module$src$srcset$$ = function($s1$jscomp$2$$, $s2$jscomp$2$$) {
  return $s1$jscomp$2$$.width - $s2$jscomp$2$$.width;
};
$sortByDpr$$module$src$srcset$$ = function($s1$jscomp$3$$, $s2$jscomp$3$$) {
  return $s1$jscomp$3$$.$dpr$ - $s2$jscomp$3$$.$dpr$;
};
$addToSet$$module$dompurify$dist$purify_es$$ = function($set$jscomp$2$$, $array$jscomp$15$$) {
  for (var $l$jscomp$4$$ = $array$jscomp$15$$.length; $l$jscomp$4$$--;) {
    "string" === typeof $array$jscomp$15$$[$l$jscomp$4$$] && ($array$jscomp$15$$[$l$jscomp$4$$] = $array$jscomp$15$$[$l$jscomp$4$$].toLowerCase()), $set$jscomp$2$$[$array$jscomp$15$$[$l$jscomp$4$$]] = !0;
  }
  return $set$jscomp$2$$;
};
$clone$$module$dompurify$dist$purify_es$$ = function($object$jscomp$4$$) {
  var $newObject$$ = {}, $property$jscomp$11$$ = void 0;
  for ($property$jscomp$11$$ in $object$jscomp$4$$) {
    Object.prototype.hasOwnProperty.call($object$jscomp$4$$, $property$jscomp$11$$) && ($newObject$$[$property$jscomp$11$$] = $object$jscomp$4$$[$property$jscomp$11$$]);
  }
  return $newObject$$;
};
$_toConsumableArray$$module$dompurify$dist$purify_es$$ = function($arr$jscomp$10$$) {
  if (Array.isArray($arr$jscomp$10$$)) {
    for (var $i$jscomp$152$$ = 0, $arr2$jscomp$1$$ = Array($arr$jscomp$10$$.length); $i$jscomp$152$$ < $arr$jscomp$10$$.length; $i$jscomp$152$$++) {
      $arr2$jscomp$1$$[$i$jscomp$152$$] = $arr$jscomp$10$$[$i$jscomp$152$$];
    }
    return $arr2$jscomp$1$$;
  }
  return Array.from($arr$jscomp$10$$);
};
$createDOMPurify$$module$dompurify$dist$purify_es$$ = function() {
  function $_sanitizeAttributes$$($_sanitizeAttributes$$) {
    var $_sanitizeElements$$, $_isNode$$;
    $_executeHook$$("beforeSanitizeAttributes", $_sanitizeAttributes$$, null);
    var $_createIterator$$ = $_sanitizeAttributes$$.attributes;
    if ($_createIterator$$) {
      var $_initDocument$$ = {attrName:"", $attrValue$:"", $keepAttr$:!0, $allowedAttributes$:$ALLOWED_ATTR$$};
      for ($_isNode$$ = $_createIterator$$.length; $_isNode$$--;) {
        var $_forceRemove$$ = $_sanitizeElements$$ = $_createIterator$$[$_isNode$$], $_parseConfig$$ = $_forceRemove$$.name;
        $_forceRemove$$ = $_forceRemove$$.namespaceURI;
        $_sanitizeElements$$ = $_sanitizeElements$$.value.trim();
        var $document$jscomp$6$$ = $_parseConfig$$.toLowerCase();
        $_initDocument$$.attrName = $document$jscomp$6$$;
        $_initDocument$$.$attrValue$ = $_sanitizeElements$$;
        $_initDocument$$.$keepAttr$ = !0;
        $_executeHook$$("uponSanitizeAttribute", $_sanitizeAttributes$$, $_initDocument$$);
        $_sanitizeElements$$ = $_initDocument$$.$attrValue$;
        if ("name" === $document$jscomp$6$$ && "IMG" === $_sanitizeAttributes$$.nodeName && $_createIterator$$.id) {
          var $window$jscomp$26$$ = $_createIterator$$.id;
          $_createIterator$$ = Array.prototype.slice.apply($_createIterator$$);
          $_removeAttribute$$("id", $_sanitizeAttributes$$);
          $_removeAttribute$$($_parseConfig$$, $_sanitizeAttributes$$);
          $_createIterator$$.indexOf($window$jscomp$26$$) > $_isNode$$ && $_sanitizeAttributes$$.setAttribute("id", $window$jscomp$26$$.value);
        } else {
          if ("INPUT" !== $_sanitizeAttributes$$.nodeName || "type" !== $document$jscomp$6$$ || "file" !== $_sanitizeElements$$ || !$ALLOWED_ATTR$$[$document$jscomp$6$$] && $FORBID_ATTR$$[$document$jscomp$6$$]) {
            "id" === $_parseConfig$$ && $_sanitizeAttributes$$.setAttribute($_parseConfig$$, ""), $_removeAttribute$$($_parseConfig$$, $_sanitizeAttributes$$);
          } else {
            continue;
          }
        }
        if ($_initDocument$$.$keepAttr$ && $_isValidAttribute$$($_sanitizeAttributes$$.nodeName.toLowerCase(), $document$jscomp$6$$, $_sanitizeElements$$)) {
          try {
            $_forceRemove$$ ? $_sanitizeAttributes$$.setAttributeNS($_forceRemove$$, $_parseConfig$$, $_sanitizeElements$$) : $_sanitizeAttributes$$.setAttribute($_parseConfig$$, $_sanitizeElements$$), $DOMPurify$$.$removed$.pop();
          } catch ($err$jscomp$27$$) {
          }
        }
      }
      $_executeHook$$("afterSanitizeAttributes", $_sanitizeAttributes$$, null);
    }
  }
  function $_isValidAttribute$$($_sanitizeAttributes$$, $_isValidAttribute$$, $_sanitizeElements$$) {
    if ($SANITIZE_DOM$$ && ("id" === $_isValidAttribute$$ || "name" === $_isValidAttribute$$) && ($_sanitizeElements$$ in $document$jscomp$6$$ || $_sanitizeElements$$ in $formElement$$)) {
      return !1;
    }
    $SAFE_FOR_TEMPLATES$$ && ($_sanitizeElements$$ = $_sanitizeElements$$.replace($MUSTACHE_EXPR$$module$dompurify$dist$purify_es$$, " "), $_sanitizeElements$$ = $_sanitizeElements$$.replace($ERB_EXPR$$module$dompurify$dist$purify_es$$, " "));
    if (!$ALLOW_DATA_ATTR$$ || !$DATA_ATTR$$module$dompurify$dist$purify_es$$.test($_isValidAttribute$$)) {
      if (!$ALLOW_ARIA_ATTR$$ || !$ARIA_ATTR$$module$dompurify$dist$purify_es$$.test($_isValidAttribute$$)) {
        if (!$ALLOWED_ATTR$$[$_isValidAttribute$$] || $FORBID_ATTR$$[$_isValidAttribute$$] || !($URI_SAFE_ATTRIBUTES$$[$_isValidAttribute$$] || $IS_ALLOWED_URI$$1$$.test($_sanitizeElements$$.replace($ATTR_WHITESPACE$$module$dompurify$dist$purify_es$$, "")) || ("src" === $_isValidAttribute$$ || "xlink:href" === $_isValidAttribute$$) && "script" !== $_sanitizeAttributes$$ && 0 === $_sanitizeElements$$.indexOf("data:") && $DATA_URI_TAGS$$[$_sanitizeAttributes$$] || $ALLOW_UNKNOWN_PROTOCOLS$$ && !$IS_SCRIPT_OR_DATA$$module$dompurify$dist$purify_es$$.test($_sanitizeElements$$.replace($ATTR_WHITESPACE$$module$dompurify$dist$purify_es$$, 
        ""))) && $_sanitizeElements$$) {
          return !1;
        }
      }
    }
    return !0;
  }
  function $_sanitizeElements$$($_sanitizeAttributes$$) {
    $_executeHook$$("beforeSanitizeElements", $_sanitizeAttributes$$, null);
    if ($_sanitizeAttributes$$ instanceof $Text$jscomp$1$$ || $_sanitizeAttributes$$ instanceof $Comment$jscomp$1$$ ? 0 : !("string" === typeof $_sanitizeAttributes$$.nodeName && "string" === typeof $_sanitizeAttributes$$.textContent && "function" === typeof $_sanitizeAttributes$$.removeChild && $_sanitizeAttributes$$.attributes instanceof $NamedNodeMap$jscomp$1$$ && "function" === typeof $_sanitizeAttributes$$.removeAttribute && "function" === typeof $_sanitizeAttributes$$.setAttribute)) {
      return $_forceRemove$$($_sanitizeAttributes$$), !0;
    }
    var $_isValidAttribute$$ = $_sanitizeAttributes$$.nodeName.toLowerCase();
    $_executeHook$$("uponSanitizeElement", $_sanitizeAttributes$$, {tagName:$_isValidAttribute$$, $allowedTags$:$ALLOWED_TAGS$$});
    if (!$ALLOWED_TAGS$$[$_isValidAttribute$$] || $FORBID_TAGS$$[$_isValidAttribute$$]) {
      if ($KEEP_CONTENT$$ && !$FORBID_CONTENTS$$[$_isValidAttribute$$] && "function" === typeof $_sanitizeAttributes$$.insertAdjacentHTML) {
        try {
          $_sanitizeAttributes$$.insertAdjacentHTML("AfterEnd", $_sanitizeAttributes$$.innerHTML);
        } catch ($err$jscomp$26$$) {
        }
      }
      $_forceRemove$$($_sanitizeAttributes$$);
      return !0;
    }
    !$SAFE_FOR_JQUERY$$ || $_sanitizeAttributes$$.firstElementChild || $_sanitizeAttributes$$.content && $_sanitizeAttributes$$.content.firstElementChild || !/</g.test($_sanitizeAttributes$$.textContent) || ($DOMPurify$$.$removed$.push({element:$_sanitizeAttributes$$.cloneNode()}), $_sanitizeAttributes$$.innerHTML ? $_sanitizeAttributes$$.innerHTML = $_sanitizeAttributes$$.innerHTML.replace(/</g, "&lt;") : $_sanitizeAttributes$$.innerHTML = $_sanitizeAttributes$$.textContent.replace(/</g, "&lt;"));
    $SAFE_FOR_TEMPLATES$$ && 3 === $_sanitizeAttributes$$.nodeType && ($_isValidAttribute$$ = $_sanitizeAttributes$$.textContent, $_isValidAttribute$$ = $_isValidAttribute$$.replace($MUSTACHE_EXPR$$module$dompurify$dist$purify_es$$, " "), $_isValidAttribute$$ = $_isValidAttribute$$.replace($ERB_EXPR$$module$dompurify$dist$purify_es$$, " "), $_sanitizeAttributes$$.textContent !== $_isValidAttribute$$ && ($DOMPurify$$.$removed$.push({element:$_sanitizeAttributes$$.cloneNode()}), $_sanitizeAttributes$$.textContent = 
    $_isValidAttribute$$));
    $_executeHook$$("afterSanitizeElements", $_sanitizeAttributes$$, null);
    return !1;
  }
  function $_executeHook$$($_sanitizeAttributes$$, $_isValidAttribute$$, $_sanitizeElements$$) {
    $hooks$$[$_sanitizeAttributes$$] && $hooks$$[$_sanitizeAttributes$$].forEach(function($_sanitizeAttributes$$) {
      $_sanitizeAttributes$$.call($DOMPurify$$, $_isValidAttribute$$, $_sanitizeElements$$, $CONFIG$$);
    });
  }
  function $_isNode$$($_sanitizeAttributes$$) {
    return "object" === ("undefined" === typeof $Node$jscomp$2$$ ? "undefined" : $_typeof$$module$dompurify$dist$purify_es$$($Node$jscomp$2$$)) ? $_sanitizeAttributes$$ instanceof $Node$jscomp$2$$ : $_sanitizeAttributes$$ && "object" === ("undefined" === typeof $_sanitizeAttributes$$ ? "undefined" : $_typeof$$module$dompurify$dist$purify_es$$($_sanitizeAttributes$$)) && "number" === typeof $_sanitizeAttributes$$.nodeType && "string" === typeof $_sanitizeAttributes$$.nodeName;
  }
  function $_createIterator$$($_sanitizeAttributes$$) {
    return $createNodeIterator$$.call($_sanitizeAttributes$$.ownerDocument || $_sanitizeAttributes$$, $_sanitizeAttributes$$, $NodeFilter$jscomp$1$$.SHOW_ELEMENT | $NodeFilter$jscomp$1$$.SHOW_COMMENT | $NodeFilter$jscomp$1$$.SHOW_TEXT, function() {
      return $NodeFilter$jscomp$1$$.FILTER_ACCEPT;
    }, !1);
  }
  function $_initDocument$$($_sanitizeAttributes$$) {
    var $_isValidAttribute$$ = void 0;
    $FORCE_BODY$$ && ($_sanitizeAttributes$$ = "<remove></remove>" + $_sanitizeAttributes$$);
    if ($useDOMParser$$) {
      try {
        $_isValidAttribute$$ = (new $DOMParser$jscomp$1$$).parseFromString($_sanitizeAttributes$$, "text/html");
      } catch ($err$jscomp$23$$) {
      }
    }
    $removeTitle$$ && $addToSet$$module$dompurify$dist$purify_es$$($FORBID_TAGS$$, ["title"]);
    if (!$_isValidAttribute$$ || !$_isValidAttribute$$.documentElement) {
      $_isValidAttribute$$ = $implementation$$.createHTMLDocument("");
      var $_sanitizeElements$$ = $_isValidAttribute$$.body;
      $_sanitizeElements$$.parentNode.removeChild($_sanitizeElements$$.parentNode.firstElementChild);
      $_sanitizeElements$$.outerHTML = $_sanitizeAttributes$$;
    }
    return $getElementsByTagName$$.call($_isValidAttribute$$, $WHOLE_DOCUMENT$$ ? "html" : "body")[0];
  }
  function $_removeAttribute$$($_sanitizeAttributes$$, $_isValidAttribute$$) {
    try {
      $DOMPurify$$.$removed$.push({$attribute$:$_isValidAttribute$$.getAttributeNode($_sanitizeAttributes$$), from:$_isValidAttribute$$});
    } catch ($err$jscomp$22$$) {
      $DOMPurify$$.$removed$.push({$attribute$:null, from:$_isValidAttribute$$});
    }
    $_isValidAttribute$$.removeAttribute($_sanitizeAttributes$$);
  }
  function $_forceRemove$$($_sanitizeAttributes$$) {
    $DOMPurify$$.$removed$.push({element:$_sanitizeAttributes$$});
    try {
      $_sanitizeAttributes$$.parentNode.removeChild($_sanitizeAttributes$$);
    } catch ($err$jscomp$21$$) {
      $_sanitizeAttributes$$.outerHTML = "";
    }
  }
  function $_parseConfig$$($_sanitizeAttributes$$) {
    "object" !== ("undefined" === typeof $_sanitizeAttributes$$ ? "undefined" : $_typeof$$module$dompurify$dist$purify_es$$($_sanitizeAttributes$$)) && ($_sanitizeAttributes$$ = {});
    $ALLOWED_TAGS$$ = "ALLOWED_TAGS" in $_sanitizeAttributes$$ ? $addToSet$$module$dompurify$dist$purify_es$$({}, $_sanitizeAttributes$$.ALLOWED_TAGS) : $DEFAULT_ALLOWED_TAGS$$;
    $ALLOWED_ATTR$$ = "ALLOWED_ATTR" in $_sanitizeAttributes$$ ? $addToSet$$module$dompurify$dist$purify_es$$({}, $_sanitizeAttributes$$.ALLOWED_ATTR) : $DEFAULT_ALLOWED_ATTR$$;
    $FORBID_TAGS$$ = "FORBID_TAGS" in $_sanitizeAttributes$$ ? $addToSet$$module$dompurify$dist$purify_es$$({}, $_sanitizeAttributes$$.FORBID_TAGS) : {};
    $FORBID_ATTR$$ = "FORBID_ATTR" in $_sanitizeAttributes$$ ? $addToSet$$module$dompurify$dist$purify_es$$({}, $_sanitizeAttributes$$.FORBID_ATTR) : {};
    $USE_PROFILES$$ = "USE_PROFILES" in $_sanitizeAttributes$$ ? $_sanitizeAttributes$$.USE_PROFILES : !1;
    $ALLOW_ARIA_ATTR$$ = !1 !== $_sanitizeAttributes$$.ALLOW_ARIA_ATTR;
    $ALLOW_DATA_ATTR$$ = !1 !== $_sanitizeAttributes$$.ALLOW_DATA_ATTR;
    $ALLOW_UNKNOWN_PROTOCOLS$$ = $_sanitizeAttributes$$.ALLOW_UNKNOWN_PROTOCOLS || !1;
    $SAFE_FOR_JQUERY$$ = $_sanitizeAttributes$$.SAFE_FOR_JQUERY || !1;
    $SAFE_FOR_TEMPLATES$$ = $_sanitizeAttributes$$.SAFE_FOR_TEMPLATES || !1;
    $WHOLE_DOCUMENT$$ = $_sanitizeAttributes$$.WHOLE_DOCUMENT || !1;
    $RETURN_DOM$$ = $_sanitizeAttributes$$.RETURN_DOM || !1;
    $RETURN_DOM_FRAGMENT$$ = $_sanitizeAttributes$$.RETURN_DOM_FRAGMENT || !1;
    $RETURN_DOM_IMPORT$$ = $_sanitizeAttributes$$.RETURN_DOM_IMPORT || !1;
    $FORCE_BODY$$ = $_sanitizeAttributes$$.FORCE_BODY || !1;
    $SANITIZE_DOM$$ = !1 !== $_sanitizeAttributes$$.SANITIZE_DOM;
    $KEEP_CONTENT$$ = !1 !== $_sanitizeAttributes$$.KEEP_CONTENT;
    $IN_PLACE$$ = $_sanitizeAttributes$$.IN_PLACE || !1;
    $IS_ALLOWED_URI$$1$$ = $_sanitizeAttributes$$.ALLOWED_URI_REGEXP || $IS_ALLOWED_URI$$1$$;
    $SAFE_FOR_TEMPLATES$$ && ($ALLOW_DATA_ATTR$$ = !1);
    $RETURN_DOM_FRAGMENT$$ && ($RETURN_DOM$$ = !0);
    $USE_PROFILES$$ && ($ALLOWED_TAGS$$ = $addToSet$$module$dompurify$dist$purify_es$$({}, [].concat($_toConsumableArray$$module$dompurify$dist$purify_es$$($text$$module$dompurify$dist$purify_es$$))), $ALLOWED_ATTR$$ = [], !0 === $USE_PROFILES$$.html && ($addToSet$$module$dompurify$dist$purify_es$$($ALLOWED_TAGS$$, $html$$module$dompurify$dist$purify_es$$), $addToSet$$module$dompurify$dist$purify_es$$($ALLOWED_ATTR$$, $html$1$$module$dompurify$dist$purify_es$$)), !0 === $USE_PROFILES$$.svg && ($addToSet$$module$dompurify$dist$purify_es$$($ALLOWED_TAGS$$, 
    $svg$$module$dompurify$dist$purify_es$$), $addToSet$$module$dompurify$dist$purify_es$$($ALLOWED_ATTR$$, $svg$1$$module$dompurify$dist$purify_es$$), $addToSet$$module$dompurify$dist$purify_es$$($ALLOWED_ATTR$$, $xml$$module$dompurify$dist$purify_es$$)), !0 === $USE_PROFILES$$.svgFilters && ($addToSet$$module$dompurify$dist$purify_es$$($ALLOWED_TAGS$$, $svgFilters$$module$dompurify$dist$purify_es$$), $addToSet$$module$dompurify$dist$purify_es$$($ALLOWED_ATTR$$, $svg$1$$module$dompurify$dist$purify_es$$), 
    $addToSet$$module$dompurify$dist$purify_es$$($ALLOWED_ATTR$$, $xml$$module$dompurify$dist$purify_es$$)), !0 === $USE_PROFILES$$.mathMl && ($addToSet$$module$dompurify$dist$purify_es$$($ALLOWED_TAGS$$, $mathMl$$module$dompurify$dist$purify_es$$), $addToSet$$module$dompurify$dist$purify_es$$($ALLOWED_ATTR$$, $mathMl$1$$module$dompurify$dist$purify_es$$), $addToSet$$module$dompurify$dist$purify_es$$($ALLOWED_ATTR$$, $xml$$module$dompurify$dist$purify_es$$)));
    $_sanitizeAttributes$$.ADD_TAGS && ($ALLOWED_TAGS$$ === $DEFAULT_ALLOWED_TAGS$$ && ($ALLOWED_TAGS$$ = $clone$$module$dompurify$dist$purify_es$$($ALLOWED_TAGS$$)), $addToSet$$module$dompurify$dist$purify_es$$($ALLOWED_TAGS$$, $_sanitizeAttributes$$.ADD_TAGS));
    $_sanitizeAttributes$$.ADD_ATTR && ($ALLOWED_ATTR$$ === $DEFAULT_ALLOWED_ATTR$$ && ($ALLOWED_ATTR$$ = $clone$$module$dompurify$dist$purify_es$$($ALLOWED_ATTR$$)), $addToSet$$module$dompurify$dist$purify_es$$($ALLOWED_ATTR$$, $_sanitizeAttributes$$.ADD_ATTR));
    $_sanitizeAttributes$$.ADD_URI_SAFE_ATTR && $addToSet$$module$dompurify$dist$purify_es$$($URI_SAFE_ATTRIBUTES$$, $_sanitizeAttributes$$.ADD_URI_SAFE_ATTR);
    $KEEP_CONTENT$$ && ($ALLOWED_TAGS$$["#text"] = !0);
    $WHOLE_DOCUMENT$$ && $addToSet$$module$dompurify$dist$purify_es$$($ALLOWED_TAGS$$, ["html", "head", "body"]);
    $ALLOWED_TAGS$$.table && $addToSet$$module$dompurify$dist$purify_es$$($ALLOWED_TAGS$$, ["tbody"]);
    Object && "freeze" in Object && Object.freeze($_sanitizeAttributes$$);
    $CONFIG$$ = $_sanitizeAttributes$$;
  }
  function $DOMPurify$$($_sanitizeAttributes$$) {
    return $createDOMPurify$$module$dompurify$dist$purify_es$$($_sanitizeAttributes$$);
  }
  var $window$jscomp$26$$ = 0 < arguments.length && void 0 !== arguments[0] ? arguments[0] : "undefined" === typeof window ? null : window;
  $DOMPurify$$.version = "1.0.8";
  $DOMPurify$$.$removed$ = [];
  if (!$window$jscomp$26$$ || !$window$jscomp$26$$.document || 9 !== $window$jscomp$26$$.document.nodeType) {
    return $DOMPurify$$.isSupported = !1, $DOMPurify$$;
  }
  var $originalDocument$$ = $window$jscomp$26$$.document, $useDOMParser$$ = !1, $removeTitle$$ = !1, $document$jscomp$6$$ = $window$jscomp$26$$.document, $DocumentFragment$jscomp$1$$ = $window$jscomp$26$$.DocumentFragment, $Node$jscomp$2$$ = $window$jscomp$26$$.Node, $NodeFilter$jscomp$1$$ = $window$jscomp$26$$.NodeFilter, $_document__window$NamedNodeMap_template$jscomp$4$$ = $window$jscomp$26$$.NamedNodeMap, $NamedNodeMap$jscomp$1$$ = void 0 === $_document__window$NamedNodeMap_template$jscomp$4$$ ? 
  $window$jscomp$26$$.NamedNodeMap || $window$jscomp$26$$.$MozNamedAttrMap$ : $_document__window$NamedNodeMap_template$jscomp$4$$, $Text$jscomp$1$$ = $window$jscomp$26$$.Text, $Comment$jscomp$1$$ = $window$jscomp$26$$.Comment, $DOMParser$jscomp$1$$ = $window$jscomp$26$$.DOMParser;
  "function" === typeof $window$jscomp$26$$.HTMLTemplateElement && ($_document__window$NamedNodeMap_template$jscomp$4$$ = $document$jscomp$6$$.createElement("template"), $_document__window$NamedNodeMap_template$jscomp$4$$.content && $_document__window$NamedNodeMap_template$jscomp$4$$.content.ownerDocument && ($document$jscomp$6$$ = $_document__window$NamedNodeMap_template$jscomp$4$$.content.ownerDocument));
  $_document__window$NamedNodeMap_template$jscomp$4$$ = $document$jscomp$6$$;
  var $implementation$$ = $_document__window$NamedNodeMap_template$jscomp$4$$.implementation, $createNodeIterator$$ = $_document__window$NamedNodeMap_template$jscomp$4$$.createNodeIterator, $getElementsByTagName$$ = $_document__window$NamedNodeMap_template$jscomp$4$$.getElementsByTagName, $createDocumentFragment$$ = $_document__window$NamedNodeMap_template$jscomp$4$$.createDocumentFragment, $importNode$jscomp$1$$ = $originalDocument$$.importNode, $hooks$$ = {};
  $DOMPurify$$.isSupported = $implementation$$ && "undefined" !== typeof $implementation$$.createHTMLDocument && 9 !== $document$jscomp$6$$.documentMode;
  var $IS_ALLOWED_URI$$1$$ = $IS_ALLOWED_URI$$module$dompurify$dist$purify_es$$, $ALLOWED_TAGS$$ = null, $DEFAULT_ALLOWED_TAGS$$ = $addToSet$$module$dompurify$dist$purify_es$$({}, [].concat($_toConsumableArray$$module$dompurify$dist$purify_es$$($html$$module$dompurify$dist$purify_es$$), $_toConsumableArray$$module$dompurify$dist$purify_es$$($svg$$module$dompurify$dist$purify_es$$), $_toConsumableArray$$module$dompurify$dist$purify_es$$($svgFilters$$module$dompurify$dist$purify_es$$), $_toConsumableArray$$module$dompurify$dist$purify_es$$($mathMl$$module$dompurify$dist$purify_es$$), 
  $_toConsumableArray$$module$dompurify$dist$purify_es$$($text$$module$dompurify$dist$purify_es$$))), $ALLOWED_ATTR$$ = null, $DEFAULT_ALLOWED_ATTR$$ = $addToSet$$module$dompurify$dist$purify_es$$({}, [].concat($_toConsumableArray$$module$dompurify$dist$purify_es$$($html$1$$module$dompurify$dist$purify_es$$), $_toConsumableArray$$module$dompurify$dist$purify_es$$($svg$1$$module$dompurify$dist$purify_es$$), $_toConsumableArray$$module$dompurify$dist$purify_es$$($mathMl$1$$module$dompurify$dist$purify_es$$), 
  $_toConsumableArray$$module$dompurify$dist$purify_es$$($xml$$module$dompurify$dist$purify_es$$))), $FORBID_TAGS$$ = null, $FORBID_ATTR$$ = null, $ALLOW_ARIA_ATTR$$ = !0, $ALLOW_DATA_ATTR$$ = !0, $ALLOW_UNKNOWN_PROTOCOLS$$ = !1, $SAFE_FOR_JQUERY$$ = !1, $SAFE_FOR_TEMPLATES$$ = !1, $WHOLE_DOCUMENT$$ = !1, $SET_CONFIG$$ = !1, $FORCE_BODY$$ = !1, $RETURN_DOM$$ = !1, $RETURN_DOM_FRAGMENT$$ = !1, $RETURN_DOM_IMPORT$$ = !1, $SANITIZE_DOM$$ = !0, $KEEP_CONTENT$$ = !0, $IN_PLACE$$ = !1, $USE_PROFILES$$ = 
  {}, $FORBID_CONTENTS$$ = $addToSet$$module$dompurify$dist$purify_es$$({}, "audio head math script style template svg video".split(" ")), $DATA_URI_TAGS$$ = $addToSet$$module$dompurify$dist$purify_es$$({}, ["audio", "video", "img", "source", "image"]), $URI_SAFE_ATTRIBUTES$$ = $addToSet$$module$dompurify$dist$purify_es$$({}, "alt class for id label name pattern placeholder summary title value style xmlns".split(" ")), $CONFIG$$ = null, $formElement$$ = $document$jscomp$6$$.createElement("form");
  if ($DOMPurify$$.isSupported) {
    try {
      $_initDocument$$('<svg><p><style><img src="</style><img src=x onerror=alert(1)//">').querySelector("svg img") && ($useDOMParser$$ = !0);
    } catch ($err$jscomp$inline_2014$$) {
    }
    try {
      $_initDocument$$("<x/><title>&lt;/title&gt;&lt;img&gt;").querySelector("title").textContent.match(/<\/title/) && ($removeTitle$$ = !0);
    } catch ($err$jscomp$inline_2016$$) {
    }
  }
  var $_sanitizeShadowDOM$$ = function $_sanitizeShadowDOM$jscomp$1$$($_isValidAttribute$$) {
    var $_isNode$$, $_initDocument$$ = $_createIterator$$($_isValidAttribute$$);
    for ($_executeHook$$("beforeSanitizeShadowDOM", $_isValidAttribute$$, null); $_isNode$$ = $_initDocument$$.nextNode();) {
      $_executeHook$$("uponSanitizeShadowNode", $_isNode$$, null), $_sanitizeElements$$($_isNode$$) || ($_isNode$$.content instanceof $DocumentFragment$jscomp$1$$ && $_sanitizeShadowDOM$jscomp$1$$($_isNode$$.content), $_sanitizeAttributes$$($_isNode$$));
    }
    $_executeHook$$("afterSanitizeShadowDOM", $_isValidAttribute$$, null);
  };
  $DOMPurify$$.$sanitize$ = function($_isValidAttribute$$, $_executeHook$$) {
    var $_removeAttribute$$ = void 0, $document$jscomp$6$$ = void 0;
    $_isValidAttribute$$ || ($_isValidAttribute$$ = "\x3c!--\x3e");
    if ("string" !== typeof $_isValidAttribute$$ && !$_isNode$$($_isValidAttribute$$)) {
      if ("function" !== typeof $_isValidAttribute$$.toString) {
        throw new TypeError("toString is not a function");
      }
      $_isValidAttribute$$ = $_isValidAttribute$$.toString();
      if ("string" !== typeof $_isValidAttribute$$) {
        throw new TypeError("dirty is not a string, aborting");
      }
    }
    if (!$DOMPurify$$.isSupported) {
      if ("object" === $_typeof$$module$dompurify$dist$purify_es$$($window$jscomp$26$$.$toStaticHTML$) || "function" === typeof $window$jscomp$26$$.$toStaticHTML$) {
        if ("string" === typeof $_isValidAttribute$$) {
          return $window$jscomp$26$$.$toStaticHTML$($_isValidAttribute$$);
        }
        if ($_isNode$$($_isValidAttribute$$)) {
          return $window$jscomp$26$$.$toStaticHTML$($_isValidAttribute$$.outerHTML);
        }
      }
      return $_isValidAttribute$$;
    }
    $SET_CONFIG$$ || $_parseConfig$$($_executeHook$$);
    $DOMPurify$$.$removed$ = [];
    if (!$IN_PLACE$$) {
      if ($_isValidAttribute$$ instanceof $Node$jscomp$2$$) {
        $_removeAttribute$$ = $_initDocument$$("\x3c!--\x3e"), $_executeHook$$ = $_removeAttribute$$.ownerDocument.importNode($_isValidAttribute$$, !0), 1 === $_executeHook$$.nodeType && "BODY" === $_executeHook$$.nodeName ? $_removeAttribute$$ = $_executeHook$$ : $_removeAttribute$$.appendChild($_executeHook$$);
      } else {
        if (!$RETURN_DOM$$ && !$WHOLE_DOCUMENT$$ && -1 === $_isValidAttribute$$.indexOf("<")) {
          return $_isValidAttribute$$;
        }
        $_removeAttribute$$ = $_initDocument$$($_isValidAttribute$$);
        if (!$_removeAttribute$$) {
          return $RETURN_DOM$$ ? null : "";
        }
      }
    }
    $_removeAttribute$$ && $FORCE_BODY$$ && $_forceRemove$$($_removeAttribute$$.firstChild);
    for (var $removeTitle$$ = $_createIterator$$($IN_PLACE$$ ? $_isValidAttribute$$ : $_removeAttribute$$); $_executeHook$$ = $removeTitle$$.nextNode();) {
      3 === $_executeHook$$.nodeType && $_executeHook$$ === $document$jscomp$6$$ || $_sanitizeElements$$($_executeHook$$) || ($_executeHook$$.content instanceof $DocumentFragment$jscomp$1$$ && $_sanitizeShadowDOM$$($_executeHook$$.content), $_sanitizeAttributes$$($_executeHook$$), $document$jscomp$6$$ = $_executeHook$$);
    }
    if ($IN_PLACE$$) {
      return $_isValidAttribute$$;
    }
    if ($RETURN_DOM$$) {
      if ($RETURN_DOM_FRAGMENT$$) {
        for ($_isValidAttribute$$ = $createDocumentFragment$$.call($_removeAttribute$$.ownerDocument); $_removeAttribute$$.firstChild;) {
          $_isValidAttribute$$.appendChild($_removeAttribute$$.firstChild);
        }
      } else {
        $_isValidAttribute$$ = $_removeAttribute$$;
      }
      $RETURN_DOM_IMPORT$$ && ($_isValidAttribute$$ = $importNode$jscomp$1$$.call($originalDocument$$, $_isValidAttribute$$, !0));
      return $_isValidAttribute$$;
    }
    return $WHOLE_DOCUMENT$$ ? $_removeAttribute$$.outerHTML : $_removeAttribute$$.innerHTML;
  };
  $DOMPurify$$.$I$ = function($_sanitizeAttributes$$) {
    $_parseConfig$$($_sanitizeAttributes$$);
    $SET_CONFIG$$ = !0;
  };
  $DOMPurify$$.$D$ = function() {
    $CONFIG$$ = null;
    $SET_CONFIG$$ = !1;
  };
  $DOMPurify$$.$isValidAttribute$ = function($_sanitizeAttributes$$, $_sanitizeElements$$, $_executeHook$$) {
    $CONFIG$$ || $_parseConfig$$({});
    return $_isValidAttribute$$($_sanitizeAttributes$$.toLowerCase(), $_sanitizeElements$$.toLowerCase(), $_executeHook$$);
  };
  $DOMPurify$$.$addHook$ = function($_sanitizeAttributes$$, $_isValidAttribute$$) {
    "function" === typeof $_isValidAttribute$$ && ($hooks$$[$_sanitizeAttributes$$] = $hooks$$[$_sanitizeAttributes$$] || [], $hooks$$[$_sanitizeAttributes$$].push($_isValidAttribute$$));
  };
  $DOMPurify$$.$F$ = function($_sanitizeAttributes$$) {
    $hooks$$[$_sanitizeAttributes$$] && $hooks$$[$_sanitizeAttributes$$].pop();
  };
  $DOMPurify$$.$G$ = function($_sanitizeAttributes$$) {
    $hooks$$[$_sanitizeAttributes$$] && ($hooks$$[$_sanitizeAttributes$$] = []);
  };
  $DOMPurify$$.$removeAllHooks$ = function() {
    $hooks$$ = {};
  };
  return $DOMPurify$$;
};
_.$purifyConfig$$module$src$purifier$$ = function() {
  return Object.assign({}, $PURIFY_CONFIG$$module$src$purifier$$, {ADD_ATTR:_.$WHITELISTED_ATTRS$$module$src$purifier$$, FORBID_TAGS:Object.keys(_.$BLACKLISTED_TAGS$$module$src$purifier$$), FORCE_BODY:!0, RETURN_DOM:!0});
};
_.$addPurifyHooks$$module$src$purifier$$ = function($purifier$$, $diffing$jscomp$1$$) {
  function $disableDiffingFor$$($purifier$$) {
    $diffing$jscomp$1$$ && !$purifier$$.hasAttribute("i-amphtml-key") && $purifier$$.setAttribute("i-amphtml-key", $KEY_COUNTER$$module$src$purifier$$++);
  }
  var $allowedTags$$, $allowedTagsChanges$$ = [], $allowedAttributes$$, $allowedAttributesChanges$$ = [];
  $purifier$$.$addHook$("uponSanitizeElement", function($purifier$$, $diffing$jscomp$1$$) {
    var $allowedAttributes$$ = $diffing$jscomp$1$$.tagName;
    $allowedTags$$ = $diffing$jscomp$1$$.$allowedTags$;
    _.$startsWith$$module$src$string$$($allowedAttributes$$, "amp-") && ($allowedTags$$[$allowedAttributes$$] = !0, $disableDiffingFor$$($purifier$$));
    "a" === $allowedAttributes$$ && $purifier$$.hasAttribute("href") && !$purifier$$.hasAttribute("target") && $purifier$$.setAttribute("target", "_top");
    var $allowedAttributesChanges$$ = $WHITELISTED_TAGS_BY_ATTRS$$module$src$purifier$$[$allowedAttributes$$];
    $allowedAttributesChanges$$ && ($diffing$jscomp$1$$ = $allowedAttributesChanges$$.$attribute$, $allowedAttributesChanges$$ = $allowedAttributesChanges$$.values, $purifier$$.hasAttribute($diffing$jscomp$1$$) && $allowedAttributesChanges$$.includes($purifier$$.getAttribute($diffing$jscomp$1$$)) && ($allowedTags$$[$allowedAttributes$$] = !0, $allowedTagsChanges$$.push($allowedAttributes$$)));
  });
  $purifier$$.$addHook$("afterSanitizeElements", function() {
    $allowedTagsChanges$$.forEach(function($purifier$$) {
      delete $allowedTags$$[$purifier$$];
    });
    $allowedTagsChanges$$.length = 0;
    this.$removed$.forEach(function($purifier$$) {
      $purifier$$.element && "REMOVE" !== $purifier$$.element.nodeName && _.$user$$module$src$log$$().error("PURIFIER", "Removed unsafe element:", $purifier$$.element.nodeName);
    });
  });
  $purifier$$.$addHook$("uponSanitizeAttribute", function($purifier$$, $diffing$jscomp$1$$) {
    function $allowedTags$$() {
      $allowedAttributes$$[$node$jscomp$55$$] || ($allowedAttributes$$[$node$jscomp$55$$] = !0, $allowedAttributesChanges$$.push($node$jscomp$55$$));
    }
    var $allowedTagsChanges$$ = $purifier$$.nodeName.toLowerCase(), $node$jscomp$55$$ = $diffing$jscomp$1$$.attrName, $data$jscomp$78$$ = $diffing$jscomp$1$$.$attrValue$;
    $allowedAttributes$$ = $diffing$jscomp$1$$.$allowedAttributes$;
    if (_.$startsWith$$module$src$string$$($allowedTagsChanges$$, "amp-")) {
      $allowedTags$$();
    } else {
      "a" == $allowedTagsChanges$$ && "target" == $node$jscomp$55$$ && ($data$jscomp$78$$ = $data$jscomp$78$$.toLowerCase(), $data$jscomp$78$$ = _.$WHITELISTED_TARGETS$$module$src$purifier$$.includes($data$jscomp$78$$) ? $data$jscomp$78$$ : "_top");
      var $attrsByTags_classicBinding$$ = _.$WHITELISTED_ATTRS_BY_TAGS$$module$src$purifier$$[$allowedTagsChanges$$];
      $attrsByTags_classicBinding$$ && $attrsByTags_classicBinding$$.includes($node$jscomp$55$$) && $allowedTags$$();
    }
    $attrsByTags_classicBinding$$ = "[" == $node$jscomp$55$$[0] && "]" == $node$jscomp$55$$[$node$jscomp$55$$.length - 1];
    var $alternativeBinding$$ = _.$startsWith$$module$src$string$$($node$jscomp$55$$, "data-amp-bind-");
    $attrsByTags_classicBinding$$ && $purifier$$.setAttribute("data-amp-bind-" + $node$jscomp$55$$.substring(1, $node$jscomp$55$$.length - 1), $data$jscomp$78$$);
    if ($attrsByTags_classicBinding$$ || $alternativeBinding$$) {
      $purifier$$.setAttribute("i-amphtml-binding", ""), $disableDiffingFor$$($purifier$$);
    }
    _.$isValidAttr$$module$src$purifier$$($allowedTagsChanges$$, $node$jscomp$55$$, $data$jscomp$78$$, !0) ? $data$jscomp$78$$ && !_.$startsWith$$module$src$string$$($node$jscomp$55$$, "data-amp-bind-") && ($data$jscomp$78$$ = _.$rewriteAttributeValue$$module$src$purifier$$($allowedTagsChanges$$, $node$jscomp$55$$, $data$jscomp$78$$)) : $diffing$jscomp$1$$.$keepAttr$ = !1;
    $diffing$jscomp$1$$.$attrValue$ = $data$jscomp$78$$;
  });
  $purifier$$.$addHook$("afterSanitizeAttributes", function($purifier$$) {
    $allowedAttributesChanges$$.forEach(function($purifier$$) {
      delete $allowedAttributes$$[$purifier$$];
    });
    $allowedAttributesChanges$$.length = 0;
    _.$remove$$module$src$utils$array$$(this.$removed$, function($diffing$jscomp$1$$) {
      if ($diffing$jscomp$1$$.from !== $purifier$$ || !$diffing$jscomp$1$$.$attribute$) {
        return !1;
      }
      var $disableDiffingFor$$ = $diffing$jscomp$1$$.$attribute$;
      $diffing$jscomp$1$$ = $disableDiffingFor$$.name;
      $disableDiffingFor$$ = $disableDiffingFor$$.value;
      if ("on" === $diffing$jscomp$1$$.toLowerCase()) {
        return $purifier$$.setAttribute("on", $disableDiffingFor$$), !0;
      }
      "[" == $diffing$jscomp$1$$[0] && "]" == $diffing$jscomp$1$$[$diffing$jscomp$1$$.length - 1] || _.$user$$module$src$log$$().error("PURIFIER", "Removed unsafe attribute: " + $diffing$jscomp$1$$ + '="' + $disableDiffingFor$$ + '"');
      return !1;
    });
  });
};
_.$isValidAttr$$module$src$purifier$$ = function($attrBlacklist_tagName$jscomp$26$$, $attrName$jscomp$5_blacklistedValuesRegex$$, $attrValue$jscomp$1$$, $attrNameBlacklist_normalized$jscomp$1_opt_purify$$) {
  if (void 0 === $attrNameBlacklist_normalized$jscomp$1_opt_purify$$ || !$attrNameBlacklist_normalized$jscomp$1_opt_purify$$) {
    if (_.$startsWith$$module$src$string$$($attrName$jscomp$5_blacklistedValuesRegex$$, "on") && "on" != $attrName$jscomp$5_blacklistedValuesRegex$$) {
      return !1;
    }
    if ($attrValue$jscomp$1$$) {
      $attrNameBlacklist_normalized$jscomp$1_opt_purify$$ = $attrValue$jscomp$1$$.toLowerCase().replace(/[\s,\u0000]+/g, "");
      for (var $i$jscomp$153$$ = 0; $i$jscomp$153$$ < $BLACKLISTED_ATTR_VALUES$$module$src$purifier$$.length; $i$jscomp$153$$++) {
        if (0 <= $attrNameBlacklist_normalized$jscomp$1_opt_purify$$.indexOf($BLACKLISTED_ATTR_VALUES$$module$src$purifier$$[$i$jscomp$153$$])) {
          return !1;
        }
      }
    }
  }
  return "style" == $attrName$jscomp$5_blacklistedValuesRegex$$ ? !$INVALID_INLINE_STYLE_REGEX$$module$src$purifier$$.test($attrValue$jscomp$1$$) : "class" == $attrName$jscomp$5_blacklistedValuesRegex$$ && $attrValue$jscomp$1$$ && /(^|\W)i-amphtml-/i.test($attrValue$jscomp$1$$) || ("src" == $attrName$jscomp$5_blacklistedValuesRegex$$ || "href" == $attrName$jscomp$5_blacklistedValuesRegex$$ || "srcset" == $attrName$jscomp$5_blacklistedValuesRegex$$) && /__amp_source_origin/.test($attrValue$jscomp$1$$) || 
  ($attrNameBlacklist_normalized$jscomp$1_opt_purify$$ = $BLACKLISTED_TAG_SPECIFIC_ATTRS$$module$src$purifier$$[$attrBlacklist_tagName$jscomp$26$$]) && -1 != $attrNameBlacklist_normalized$jscomp$1_opt_purify$$.indexOf($attrName$jscomp$5_blacklistedValuesRegex$$) || ($attrBlacklist_tagName$jscomp$26$$ = $BLACKLISTED_TAG_SPECIFIC_ATTR_VALUES$$module$src$purifier$$[$attrBlacklist_tagName$jscomp$26$$]) && ($attrName$jscomp$5_blacklistedValuesRegex$$ = $attrBlacklist_tagName$jscomp$26$$[$attrName$jscomp$5_blacklistedValuesRegex$$]) && 
  -1 != $attrValue$jscomp$1$$.search($attrName$jscomp$5_blacklistedValuesRegex$$) ? !1 : !0;
};
_.$rewriteAttributeValue$$module$src$purifier$$ = function($tagName$jscomp$27$$, $attrName$jscomp$7$$, $attrValue$jscomp$3$$) {
  return "src" == $attrName$jscomp$7$$ || "href" == $attrName$jscomp$7$$ || "srcset" == $attrName$jscomp$7$$ ? $resolveUrlAttr$$module$src$purifier$$($tagName$jscomp$27$$, $attrName$jscomp$7$$, $attrValue$jscomp$3$$) : $attrValue$jscomp$3$$;
};
$resolveUrlAttr$$module$src$purifier$$ = function($tagName$jscomp$28$$, $attrName$jscomp$9$$, $attrValue$jscomp$4$$) {
  var $windowLocation$$ = window.self.location;
  _.$checkCorsUrl$$module$src$url$$($attrValue$jscomp$4$$);
  var $isProxyHost$$ = _.$isProxyOrigin$$module$src$url$$($windowLocation$$), $baseUrl$jscomp$6$$ = _.$parseUrlDeprecated$$module$src$url$$(_.$getSourceUrl$$module$src$url$$($windowLocation$$));
  if ("href" == $attrName$jscomp$9$$ && !_.$startsWith$$module$src$string$$($attrValue$jscomp$4$$, "#")) {
    return _.$resolveRelativeUrl$$module$src$url$$($attrValue$jscomp$4$$, $baseUrl$jscomp$6$$);
  }
  if ("src" == $attrName$jscomp$9$$) {
    return "amp-img" == $tagName$jscomp$28$$ ? $resolveImageUrlAttr$$module$src$purifier$$($attrValue$jscomp$4$$, $baseUrl$jscomp$6$$, $isProxyHost$$) : _.$resolveRelativeUrl$$module$src$url$$($attrValue$jscomp$4$$, $baseUrl$jscomp$6$$);
  }
  if ("srcset" == $attrName$jscomp$9$$) {
    try {
      var $srcset$jscomp$2$$ = $parseSrcset$$module$src$srcset$$($attrValue$jscomp$4$$);
    } catch ($e$195$$) {
      return _.$user$$module$src$log$$().error("PURIFIER", "Failed to parse srcset: ", $e$195$$), $attrValue$jscomp$4$$;
    }
    return _.$JSCompiler_StaticMethods_Srcset$$module$src$srcset_prototype$stringify$$($srcset$jscomp$2$$, function($tagName$jscomp$28$$) {
      return $resolveImageUrlAttr$$module$src$purifier$$($tagName$jscomp$28$$, $baseUrl$jscomp$6$$, $isProxyHost$$);
    });
  }
  return $attrValue$jscomp$4$$;
};
$resolveImageUrlAttr$$module$src$purifier$$ = function($attrValue$jscomp$5_src$jscomp$16$$, $baseUrl$jscomp$7$$, $isProxyHost$jscomp$1$$) {
  $attrValue$jscomp$5_src$jscomp$16$$ = _.$parseUrlDeprecated$$module$src$url$$(_.$resolveRelativeUrl$$module$src$url$$($attrValue$jscomp$5_src$jscomp$16$$, $baseUrl$jscomp$7$$));
  return "data:" == $attrValue$jscomp$5_src$jscomp$16$$.protocol || _.$isProxyOrigin$$module$src$url$$($attrValue$jscomp$5_src$jscomp$16$$) || !$isProxyHost$jscomp$1$$ ? $attrValue$jscomp$5_src$jscomp$16$$.href : _.$urls$$module$src$config$$.cdn + "/i/" + ("https:" == $attrValue$jscomp$5_src$jscomp$16$$.protocol ? "s/" : "") + (0,window.encodeURIComponent)($attrValue$jscomp$5_src$jscomp$16$$.host) + $attrValue$jscomp$5_src$jscomp$16$$.pathname + ($attrValue$jscomp$5_src$jscomp$16$$.search || "") + 
  ($attrValue$jscomp$5_src$jscomp$16$$.hash || "");
};
$Gesture$$module$src$gesture$$ = function($type$jscomp$141$$, $data$jscomp$80$$, $event$jscomp$39$$) {
  var $time$jscomp$18$$ = Date.now();
  this.type = $type$jscomp$141$$;
  this.data = $data$jscomp$80$$;
  this.time = $time$jscomp$18$$;
  this.event = $event$jscomp$39$$;
};
$Gestures$$module$src$gesture$$ = function($element$jscomp$261$$, $shouldNotPreventDefault$$) {
  this.$element_$ = $element$jscomp$261$$;
  this.$D$ = [];
  this.$I$ = [];
  this.$ready_$ = [];
  this.$F$ = [];
  this.$G$ = null;
  this.$aa$ = $shouldNotPreventDefault$$;
  this.$K$ = !1;
  this.$P$ = new _.$Pass$$module$src$pass$$($element$jscomp$261$$.ownerDocument.defaultView, this.$doPass_$.bind(this));
  this.$Y$ = new _.$Observable$$module$src$observable$$;
  this.$J$ = Object.create(null);
  this.$W$ = this.$Gestures$$module$src$gesture_prototype$onTouchStart_$.bind(this);
  this.$U$ = this.$Gestures$$module$src$gesture_prototype$onTouchEnd_$.bind(this);
  this.$V$ = this.$Gestures$$module$src$gesture_prototype$onTouchMove_$.bind(this);
  this.$R$ = this.$Gestures$$module$src$gesture_prototype$onTouchCancel_$.bind(this);
  this.$element_$.addEventListener("touchstart", this.$W$);
  this.$element_$.addEventListener("touchend", this.$U$);
  this.$element_$.addEventListener("touchmove", this.$V$);
  this.$element_$.addEventListener("touchcancel", this.$R$);
  this.$O$ = !1;
};
_.$Gestures$$module$src$gesture$get$$ = function($element$jscomp$262$$, $opt_shouldNotPreventDefault$$) {
  var $res$jscomp$19$$ = $element$jscomp$262$$.__AMP_Gestures;
  $res$jscomp$19$$ || ($res$jscomp$19$$ = new $Gestures$$module$src$gesture$$($element$jscomp$262$$, void 0 === $opt_shouldNotPreventDefault$$ ? !1 : $opt_shouldNotPreventDefault$$), $element$jscomp$262$$.__AMP_Gestures = $res$jscomp$19$$);
  return $res$jscomp$19$$;
};
_.$JSCompiler_StaticMethods_onGesture$$ = function($JSCompiler_StaticMethods_onGesture$self$$, $recognizer_recognizerConstr$$, $handler$jscomp$34$$) {
  $recognizer_recognizerConstr$$ = new $recognizer_recognizerConstr$$($JSCompiler_StaticMethods_onGesture$self$$);
  var $type$jscomp$142$$ = $recognizer_recognizerConstr$$.$getType$(), $overserver$$ = $JSCompiler_StaticMethods_onGesture$self$$.$J$[$type$jscomp$142$$];
  $overserver$$ || ($JSCompiler_StaticMethods_onGesture$self$$.$D$.push($recognizer_recognizerConstr$$), $overserver$$ = new _.$Observable$$module$src$observable$$, $JSCompiler_StaticMethods_onGesture$self$$.$J$[$type$jscomp$142$$] = $overserver$$);
  return $overserver$$.add($handler$jscomp$34$$);
};
_.$JSCompiler_StaticMethods_removeGesture$$ = function($JSCompiler_StaticMethods_removeGesture$self$$) {
  var $type$jscomp$143$$ = (new _.$SwipeXYRecognizer$$module$src$gesture_recognizers$$($JSCompiler_StaticMethods_removeGesture$self$$)).$getType$(), $index$jscomp$75_overserver$jscomp$1$$ = $JSCompiler_StaticMethods_removeGesture$self$$.$J$[$type$jscomp$143$$];
  $index$jscomp$75_overserver$jscomp$1$$ && (_.$JSCompiler_StaticMethods_removeAll$$($index$jscomp$75_overserver$jscomp$1$$), $index$jscomp$75_overserver$jscomp$1$$ = _.$findIndex$$module$src$utils$array$$($JSCompiler_StaticMethods_removeGesture$self$$.$D$, function($JSCompiler_StaticMethods_removeGesture$self$$) {
    return $JSCompiler_StaticMethods_removeGesture$self$$.$getType$() == $type$jscomp$143$$;
  }), 0 > $index$jscomp$75_overserver$jscomp$1$$ || ($JSCompiler_StaticMethods_removeGesture$self$$.$D$.splice($index$jscomp$75_overserver$jscomp$1$$, 1), $JSCompiler_StaticMethods_removeGesture$self$$.$ready_$.splice($index$jscomp$75_overserver$jscomp$1$$, 1), $JSCompiler_StaticMethods_removeGesture$self$$.$F$.splice($index$jscomp$75_overserver$jscomp$1$$, 1), $JSCompiler_StaticMethods_removeGesture$self$$.$I$.splice($index$jscomp$75_overserver$jscomp$1$$, 1), delete $JSCompiler_StaticMethods_removeGesture$self$$.$J$[$type$jscomp$143$$]));
};
_.$JSCompiler_StaticMethods_onPointerDown$$ = function($JSCompiler_StaticMethods_onPointerDown$self$$, $handler$jscomp$35$$) {
  return $JSCompiler_StaticMethods_onPointerDown$self$$.$Y$.add($handler$jscomp$35$$);
};
$JSCompiler_StaticMethods_signalPending_$$ = function($JSCompiler_StaticMethods_signalPending_$self$$, $recognizer$jscomp$2$$, $timeLeft$$) {
  if ($JSCompiler_StaticMethods_signalPending_$self$$.$G$) {
    $recognizer$jscomp$2$$.$acceptCancel$();
  } else {
    for (var $now$jscomp$19$$ = Date.now(), $i$jscomp$159$$ = 0; $i$jscomp$159$$ < $JSCompiler_StaticMethods_signalPending_$self$$.$D$.length; $i$jscomp$159$$++) {
      $JSCompiler_StaticMethods_signalPending_$self$$.$D$[$i$jscomp$159$$] == $recognizer$jscomp$2$$ && ($JSCompiler_StaticMethods_signalPending_$self$$.$F$[$i$jscomp$159$$] = $now$jscomp$19$$ + $timeLeft$$);
    }
  }
};
$JSCompiler_StaticMethods_signalEmit_$$ = function($JSCompiler_StaticMethods_signalEmit_$self_overserver$jscomp$2$$, $recognizer$jscomp$4$$, $data$jscomp$81$$, $event$jscomp$44$$) {
  ($JSCompiler_StaticMethods_signalEmit_$self_overserver$jscomp$2$$ = $JSCompiler_StaticMethods_signalEmit_$self_overserver$jscomp$2$$.$J$[$recognizer$jscomp$4$$.$getType$()]) && $JSCompiler_StaticMethods_signalEmit_$self_overserver$jscomp$2$$.$fire$(new $Gesture$$module$src$gesture$$($recognizer$jscomp$4$$.$getType$(), $data$jscomp$81$$, $event$jscomp$44$$));
};
$JSCompiler_StaticMethods_afterEvent_$$ = function($JSCompiler_StaticMethods_afterEvent_$self$$, $event$jscomp$45$$) {
  var $cancelEvent$$ = !!$JSCompiler_StaticMethods_afterEvent_$self$$.$G$ || $JSCompiler_StaticMethods_afterEvent_$self$$.$K$;
  $JSCompiler_StaticMethods_afterEvent_$self$$.$K$ = !1;
  if (!$cancelEvent$$) {
    for (var $now$jscomp$20$$ = Date.now(), $i$jscomp$160$$ = 0; $i$jscomp$160$$ < $JSCompiler_StaticMethods_afterEvent_$self$$.$D$.length; $i$jscomp$160$$++) {
      if ($JSCompiler_StaticMethods_afterEvent_$self$$.$ready_$[$i$jscomp$160$$] || $JSCompiler_StaticMethods_afterEvent_$self$$.$F$[$i$jscomp$160$$] && $JSCompiler_StaticMethods_afterEvent_$self$$.$F$[$i$jscomp$160$$] >= $now$jscomp$20$$) {
        $cancelEvent$$ = !0;
        break;
      }
    }
  }
  $cancelEvent$$ && ($event$jscomp$45$$.stopPropagation(), $JSCompiler_StaticMethods_afterEvent_$self$$.$aa$ || $event$jscomp$45$$.preventDefault());
  $JSCompiler_StaticMethods_afterEvent_$self$$.$O$ && ($JSCompiler_StaticMethods_afterEvent_$self$$.$O$ = !1, $JSCompiler_StaticMethods_afterEvent_$self$$.$doPass_$());
};
$JSCompiler_StaticMethods_Gestures$$module$src$gesture_prototype$stopTracking_$$ = function($JSCompiler_StaticMethods_Gestures$$module$src$gesture_prototype$stopTracking_$self$$, $index$jscomp$78$$) {
  $JSCompiler_StaticMethods_Gestures$$module$src$gesture_prototype$stopTracking_$self$$.$I$[$index$jscomp$78$$] = !1;
  $JSCompiler_StaticMethods_Gestures$$module$src$gesture_prototype$stopTracking_$self$$.$F$[$index$jscomp$78$$] = 0;
  $JSCompiler_StaticMethods_Gestures$$module$src$gesture_prototype$stopTracking_$self$$.$ready_$[$index$jscomp$78$$] || $JSCompiler_StaticMethods_Gestures$$module$src$gesture_prototype$stopTracking_$self$$.$D$[$index$jscomp$78$$].$acceptCancel$();
};
$GestureRecognizer$$module$src$gesture$$ = function($type$jscomp$144$$, $manager$jscomp$4$$) {
  this.$type_$ = $type$jscomp$144$$;
  this.$manager_$ = $manager$jscomp$4$$;
};
$JSCompiler_StaticMethods_signalReady$$ = function($JSCompiler_StaticMethods_signalReady$self$$, $offset$jscomp$16$$) {
  var $JSCompiler_StaticMethods_signalReady_$self$jscomp$inline_2026$$ = $JSCompiler_StaticMethods_signalReady$self$$.$manager_$;
  if ($JSCompiler_StaticMethods_signalReady_$self$jscomp$inline_2026$$.$G$) {
    $JSCompiler_StaticMethods_signalReady$self$$.$acceptCancel$();
  } else {
    for (var $now$jscomp$inline_2029$$ = Date.now(), $i$jscomp$inline_2030$$ = 0; $i$jscomp$inline_2030$$ < $JSCompiler_StaticMethods_signalReady_$self$jscomp$inline_2026$$.$D$.length; $i$jscomp$inline_2030$$++) {
      $JSCompiler_StaticMethods_signalReady_$self$jscomp$inline_2026$$.$D$[$i$jscomp$inline_2030$$] == $JSCompiler_StaticMethods_signalReady$self$$ && ($JSCompiler_StaticMethods_signalReady_$self$jscomp$inline_2026$$.$ready_$[$i$jscomp$inline_2030$$] = $now$jscomp$inline_2029$$ + $offset$jscomp$16$$, $JSCompiler_StaticMethods_signalReady_$self$jscomp$inline_2026$$.$F$[$i$jscomp$inline_2030$$] = 0);
    }
    $JSCompiler_StaticMethods_signalReady_$self$jscomp$inline_2026$$.$O$ = !0;
  }
};
$JSCompiler_StaticMethods_signalEnd$$ = function($JSCompiler_StaticMethods_signalEnd$self$$) {
  var $JSCompiler_StaticMethods_signalEnd_$self$jscomp$inline_2032$$ = $JSCompiler_StaticMethods_signalEnd$self$$.$manager_$;
  $JSCompiler_StaticMethods_signalEnd_$self$jscomp$inline_2032$$.$G$ == $JSCompiler_StaticMethods_signalEnd$self$$ && ($JSCompiler_StaticMethods_signalEnd_$self$jscomp$inline_2032$$.$G$ = null, $JSCompiler_StaticMethods_signalEnd_$self$jscomp$inline_2032$$.$K$ = !0);
};
$NOOP_CALLBACK_$$module$src$motion$$ = function() {
};
$calcVelocity$$module$src$motion$$ = function($deltaV$$, $deltaTime$jscomp$1$$, $prevVelocity$$) {
  1 > $deltaTime$jscomp$1$$ && ($deltaTime$jscomp$1$$ = 1);
  var $depr$$ = 0.5 + Math.min($deltaTime$jscomp$1$$ / 33.34, 0.5);
  return $deltaV$$ / $deltaTime$jscomp$1$$ * $depr$$ + $prevVelocity$$ * (1 - $depr$$);
};
_.$continueMotion$$module$src$motion$$ = function($contextNode$jscomp$9$$, $startX$$, $startY$$, $veloX$$, $veloY$$, $callback$jscomp$99$$) {
  return (new $Motion$$module$src$motion$$($contextNode$jscomp$9$$, $startX$$, $startY$$, $veloX$$, $veloY$$, $callback$jscomp$99$$)).start();
};
$Motion$$module$src$motion$$ = function($contextNode$jscomp$10_deferred$jscomp$24$$, $startX$jscomp$1$$, $startY$jscomp$1$$, $veloX$jscomp$1$$, $veloY$jscomp$1$$, $callback$jscomp$100$$) {
  this.$vsync_$ = _.$Services$$module$src$services$vsyncFor$$(window.self);
  this.$U$ = $contextNode$jscomp$10_deferred$jscomp$24$$;
  this.$K$ = $callback$jscomp$100$$;
  this.$D$ = $startX$jscomp$1$$;
  this.$F$ = $startY$jscomp$1$$;
  this.$O$ = $veloX$jscomp$1$$;
  this.$P$ = $veloY$jscomp$1$$;
  this.$J$ = this.$I$ = 0;
  $contextNode$jscomp$10_deferred$jscomp$24$$ = new _.$Deferred$$module$src$utils$promise$$;
  this.$R$ = $contextNode$jscomp$10_deferred$jscomp$24$$.$promise$;
  this.$W$ = $contextNode$jscomp$10_deferred$jscomp$24$$.resolve;
  this.$V$ = $contextNode$jscomp$10_deferred$jscomp$24$$.reject;
  this.$G$ = !1;
};
_.$JSCompiler_StaticMethods_Motion$$module$src$motion_prototype$thenAlways$$ = function($JSCompiler_StaticMethods_Motion$$module$src$motion_prototype$thenAlways$self$$, $callback$jscomp$101_opt_callback$jscomp$9$$) {
  $callback$jscomp$101_opt_callback$jscomp$9$$ = $callback$jscomp$101_opt_callback$jscomp$9$$ || $NOOP_CALLBACK_$$module$src$motion$$;
  return $JSCompiler_StaticMethods_Motion$$module$src$motion_prototype$thenAlways$self$$.then($callback$jscomp$101_opt_callback$jscomp$9$$, $callback$jscomp$101_opt_callback$jscomp$9$$);
};
_.$TapRecognizer$$module$src$gesture_recognizers$$ = function($manager$jscomp$5$$) {
  $GestureRecognizer$$module$src$gesture$$.call(this, "tap", $manager$jscomp$5$$);
  this.$F$ = this.$D$ = this.$startY_$ = this.$startX_$ = 0;
  this.$target_$ = null;
};
_.$DoubletapRecognizer$$module$src$gesture_recognizers$$ = function($manager$jscomp$6$$) {
  $GestureRecognizer$$module$src$gesture$$.call(this, "doubletap", $manager$jscomp$6$$);
  this.$D$ = this.$G$ = this.$F$ = this.$startY_$ = this.$startX_$ = 0;
  this.$I$ = null;
};
_.$SwipeRecognizer$$module$src$gesture_recognizers$$ = function($type$jscomp$145$$, $manager$jscomp$7$$, $horiz$$, $vert$$) {
  $GestureRecognizer$$module$src$gesture$$.call(this, $type$jscomp$145$$, $manager$jscomp$7$$);
  this.$O$ = $horiz$$;
  this.$P$ = $vert$$;
  this.$D$ = !1;
  this.$J$ = this.$I$ = this.$R$ = this.$K$ = this.$W$ = this.$V$ = this.$U$ = this.$G$ = this.$F$ = this.$startY_$ = this.$startX_$ = 0;
};
$JSCompiler_StaticMethods_SwipeRecognizer$$module$src$gesture_recognizers_prototype$emit_$$ = function($JSCompiler_StaticMethods_SwipeRecognizer$$module$src$gesture_recognizers_prototype$emit_$self$$, $first$jscomp$6$$, $last$jscomp$2$$, $event$jscomp$47$$) {
  $JSCompiler_StaticMethods_SwipeRecognizer$$module$src$gesture_recognizers_prototype$emit_$self$$.$K$ = Date.now();
  var $deltaTime$jscomp$2$$ = $JSCompiler_StaticMethods_SwipeRecognizer$$module$src$gesture_recognizers_prototype$emit_$self$$.$K$ - $JSCompiler_StaticMethods_SwipeRecognizer$$module$src$gesture_recognizers_prototype$emit_$self$$.$R$;
  if (!$last$jscomp$2$$ && 4 < $deltaTime$jscomp$2$$ || $last$jscomp$2$$ && 16 < $deltaTime$jscomp$2$$) {
    $JSCompiler_StaticMethods_SwipeRecognizer$$module$src$gesture_recognizers_prototype$emit_$self$$.$I$ = $calcVelocity$$module$src$motion$$($JSCompiler_StaticMethods_SwipeRecognizer$$module$src$gesture_recognizers_prototype$emit_$self$$.$F$ - $JSCompiler_StaticMethods_SwipeRecognizer$$module$src$gesture_recognizers_prototype$emit_$self$$.$U$, $deltaTime$jscomp$2$$, $JSCompiler_StaticMethods_SwipeRecognizer$$module$src$gesture_recognizers_prototype$emit_$self$$.$I$), $JSCompiler_StaticMethods_SwipeRecognizer$$module$src$gesture_recognizers_prototype$emit_$self$$.$J$ = 
    $calcVelocity$$module$src$motion$$($JSCompiler_StaticMethods_SwipeRecognizer$$module$src$gesture_recognizers_prototype$emit_$self$$.$G$ - $JSCompiler_StaticMethods_SwipeRecognizer$$module$src$gesture_recognizers_prototype$emit_$self$$.$V$, $deltaTime$jscomp$2$$, $JSCompiler_StaticMethods_SwipeRecognizer$$module$src$gesture_recognizers_prototype$emit_$self$$.$J$), $JSCompiler_StaticMethods_SwipeRecognizer$$module$src$gesture_recognizers_prototype$emit_$self$$.$I$ = 1e-4 < Math.abs($JSCompiler_StaticMethods_SwipeRecognizer$$module$src$gesture_recognizers_prototype$emit_$self$$.$I$) ? 
    $JSCompiler_StaticMethods_SwipeRecognizer$$module$src$gesture_recognizers_prototype$emit_$self$$.$I$ : 0, $JSCompiler_StaticMethods_SwipeRecognizer$$module$src$gesture_recognizers_prototype$emit_$self$$.$J$ = 1e-4 < Math.abs($JSCompiler_StaticMethods_SwipeRecognizer$$module$src$gesture_recognizers_prototype$emit_$self$$.$J$) ? $JSCompiler_StaticMethods_SwipeRecognizer$$module$src$gesture_recognizers_prototype$emit_$self$$.$J$ : 0, $JSCompiler_StaticMethods_SwipeRecognizer$$module$src$gesture_recognizers_prototype$emit_$self$$.$U$ = 
    $JSCompiler_StaticMethods_SwipeRecognizer$$module$src$gesture_recognizers_prototype$emit_$self$$.$F$, $JSCompiler_StaticMethods_SwipeRecognizer$$module$src$gesture_recognizers_prototype$emit_$self$$.$V$ = $JSCompiler_StaticMethods_SwipeRecognizer$$module$src$gesture_recognizers_prototype$emit_$self$$.$G$, $JSCompiler_StaticMethods_SwipeRecognizer$$module$src$gesture_recognizers_prototype$emit_$self$$.$R$ = $JSCompiler_StaticMethods_SwipeRecognizer$$module$src$gesture_recognizers_prototype$emit_$self$$.$K$;
  }
  $JSCompiler_StaticMethods_signalEmit_$$($JSCompiler_StaticMethods_SwipeRecognizer$$module$src$gesture_recognizers_prototype$emit_$self$$.$manager_$, $JSCompiler_StaticMethods_SwipeRecognizer$$module$src$gesture_recognizers_prototype$emit_$self$$, {first:$first$jscomp$6$$, $last$:$last$jscomp$2$$, time:$JSCompiler_StaticMethods_SwipeRecognizer$$module$src$gesture_recognizers_prototype$emit_$self$$.$K$, deltaX:$JSCompiler_StaticMethods_SwipeRecognizer$$module$src$gesture_recognizers_prototype$emit_$self$$.$O$ ? 
  $JSCompiler_StaticMethods_SwipeRecognizer$$module$src$gesture_recognizers_prototype$emit_$self$$.$F$ - $JSCompiler_StaticMethods_SwipeRecognizer$$module$src$gesture_recognizers_prototype$emit_$self$$.$startX_$ : 0, deltaY:$JSCompiler_StaticMethods_SwipeRecognizer$$module$src$gesture_recognizers_prototype$emit_$self$$.$P$ ? $JSCompiler_StaticMethods_SwipeRecognizer$$module$src$gesture_recognizers_prototype$emit_$self$$.$G$ - $JSCompiler_StaticMethods_SwipeRecognizer$$module$src$gesture_recognizers_prototype$emit_$self$$.$startY_$ : 
  0, $startX$:$JSCompiler_StaticMethods_SwipeRecognizer$$module$src$gesture_recognizers_prototype$emit_$self$$.$startX_$, $startY$:$JSCompiler_StaticMethods_SwipeRecognizer$$module$src$gesture_recognizers_prototype$emit_$self$$.$startY_$, $lastX$:$JSCompiler_StaticMethods_SwipeRecognizer$$module$src$gesture_recognizers_prototype$emit_$self$$.$F$, $lastY$:$JSCompiler_StaticMethods_SwipeRecognizer$$module$src$gesture_recognizers_prototype$emit_$self$$.$G$, velocityX:$JSCompiler_StaticMethods_SwipeRecognizer$$module$src$gesture_recognizers_prototype$emit_$self$$.$O$ ? 
  $JSCompiler_StaticMethods_SwipeRecognizer$$module$src$gesture_recognizers_prototype$emit_$self$$.$I$ : 0, velocityY:$JSCompiler_StaticMethods_SwipeRecognizer$$module$src$gesture_recognizers_prototype$emit_$self$$.$P$ ? $JSCompiler_StaticMethods_SwipeRecognizer$$module$src$gesture_recognizers_prototype$emit_$self$$.$J$ : 0}, $event$jscomp$47$$);
};
_.$SwipeXYRecognizer$$module$src$gesture_recognizers$$ = function($manager$jscomp$8$$) {
  _.$SwipeRecognizer$$module$src$gesture_recognizers$$.call(this, "swipe-xy", $manager$jscomp$8$$, !0, !0);
};
_.$TapzoomRecognizer$$module$src$gesture_recognizers$$ = function($manager$jscomp$11$$) {
  $GestureRecognizer$$module$src$gesture$$.call(this, "tapzoom", $manager$jscomp$11$$);
  this.$D$ = !1;
  this.$P$ = this.$O$ = this.$K$ = this.$F$ = this.$U$ = this.$R$ = this.$J$ = this.$I$ = this.$G$ = this.$startY_$ = this.$startX_$ = 0;
};
$JSCompiler_StaticMethods_TapzoomRecognizer$$module$src$gesture_recognizers_prototype$emit_$$ = function($JSCompiler_StaticMethods_TapzoomRecognizer$$module$src$gesture_recognizers_prototype$emit_$self$$, $first$jscomp$7$$, $last$jscomp$3$$, $event$jscomp$49$$) {
  $JSCompiler_StaticMethods_TapzoomRecognizer$$module$src$gesture_recognizers_prototype$emit_$self$$.$F$ = Date.now();
  $first$jscomp$7$$ ? $JSCompiler_StaticMethods_TapzoomRecognizer$$module$src$gesture_recognizers_prototype$emit_$self$$.$O$ = $JSCompiler_StaticMethods_TapzoomRecognizer$$module$src$gesture_recognizers_prototype$emit_$self$$.$P$ = 0 : 2 < $JSCompiler_StaticMethods_TapzoomRecognizer$$module$src$gesture_recognizers_prototype$emit_$self$$.$F$ - $JSCompiler_StaticMethods_TapzoomRecognizer$$module$src$gesture_recognizers_prototype$emit_$self$$.$K$ && ($JSCompiler_StaticMethods_TapzoomRecognizer$$module$src$gesture_recognizers_prototype$emit_$self$$.$O$ = 
  $calcVelocity$$module$src$motion$$($JSCompiler_StaticMethods_TapzoomRecognizer$$module$src$gesture_recognizers_prototype$emit_$self$$.$G$ - $JSCompiler_StaticMethods_TapzoomRecognizer$$module$src$gesture_recognizers_prototype$emit_$self$$.$R$, $JSCompiler_StaticMethods_TapzoomRecognizer$$module$src$gesture_recognizers_prototype$emit_$self$$.$F$ - $JSCompiler_StaticMethods_TapzoomRecognizer$$module$src$gesture_recognizers_prototype$emit_$self$$.$K$, $JSCompiler_StaticMethods_TapzoomRecognizer$$module$src$gesture_recognizers_prototype$emit_$self$$.$O$), 
  $JSCompiler_StaticMethods_TapzoomRecognizer$$module$src$gesture_recognizers_prototype$emit_$self$$.$P$ = $calcVelocity$$module$src$motion$$($JSCompiler_StaticMethods_TapzoomRecognizer$$module$src$gesture_recognizers_prototype$emit_$self$$.$I$ - $JSCompiler_StaticMethods_TapzoomRecognizer$$module$src$gesture_recognizers_prototype$emit_$self$$.$U$, $JSCompiler_StaticMethods_TapzoomRecognizer$$module$src$gesture_recognizers_prototype$emit_$self$$.$F$ - $JSCompiler_StaticMethods_TapzoomRecognizer$$module$src$gesture_recognizers_prototype$emit_$self$$.$K$, 
  $JSCompiler_StaticMethods_TapzoomRecognizer$$module$src$gesture_recognizers_prototype$emit_$self$$.$P$));
  $JSCompiler_StaticMethods_TapzoomRecognizer$$module$src$gesture_recognizers_prototype$emit_$self$$.$R$ = $JSCompiler_StaticMethods_TapzoomRecognizer$$module$src$gesture_recognizers_prototype$emit_$self$$.$G$;
  $JSCompiler_StaticMethods_TapzoomRecognizer$$module$src$gesture_recognizers_prototype$emit_$self$$.$U$ = $JSCompiler_StaticMethods_TapzoomRecognizer$$module$src$gesture_recognizers_prototype$emit_$self$$.$I$;
  $JSCompiler_StaticMethods_TapzoomRecognizer$$module$src$gesture_recognizers_prototype$emit_$self$$.$K$ = $JSCompiler_StaticMethods_TapzoomRecognizer$$module$src$gesture_recognizers_prototype$emit_$self$$.$F$;
  $JSCompiler_StaticMethods_signalEmit_$$($JSCompiler_StaticMethods_TapzoomRecognizer$$module$src$gesture_recognizers_prototype$emit_$self$$.$manager_$, $JSCompiler_StaticMethods_TapzoomRecognizer$$module$src$gesture_recognizers_prototype$emit_$self$$, {first:$first$jscomp$7$$, $last$:$last$jscomp$3$$, $centerClientX$:$JSCompiler_StaticMethods_TapzoomRecognizer$$module$src$gesture_recognizers_prototype$emit_$self$$.$startX_$, $centerClientY$:$JSCompiler_StaticMethods_TapzoomRecognizer$$module$src$gesture_recognizers_prototype$emit_$self$$.$startY_$, 
  deltaX:$JSCompiler_StaticMethods_TapzoomRecognizer$$module$src$gesture_recognizers_prototype$emit_$self$$.$G$ - $JSCompiler_StaticMethods_TapzoomRecognizer$$module$src$gesture_recognizers_prototype$emit_$self$$.$startX_$, deltaY:$JSCompiler_StaticMethods_TapzoomRecognizer$$module$src$gesture_recognizers_prototype$emit_$self$$.$I$ - $JSCompiler_StaticMethods_TapzoomRecognizer$$module$src$gesture_recognizers_prototype$emit_$self$$.$startY_$, velocityX:$JSCompiler_StaticMethods_TapzoomRecognizer$$module$src$gesture_recognizers_prototype$emit_$self$$.$O$, 
  velocityY:$JSCompiler_StaticMethods_TapzoomRecognizer$$module$src$gesture_recognizers_prototype$emit_$self$$.$P$}, $event$jscomp$49$$);
};
_.$PinchRecognizer$$module$src$gesture_recognizers$$ = function($manager$jscomp$12$$) {
  $GestureRecognizer$$module$src$gesture$$.call(this, "pinch", $manager$jscomp$12$$);
  this.$D$ = !1;
  this.$G$ = this.$F$ = this.$Y$ = this.$W$ = this.$ea$ = this.$ga$ = this.$fa$ = this.$ba$ = this.$aa$ = this.$V$ = this.$R$ = this.$U$ = this.$P$ = this.$O$ = this.$J$ = this.$K$ = this.$I$ = 0;
};
$JSCompiler_StaticMethods_PinchRecognizer$$module$src$gesture_recognizers_prototype$emit_$$ = function($JSCompiler_StaticMethods_PinchRecognizer$$module$src$gesture_recognizers_prototype$emit_$self$$, $first$jscomp$8$$, $last$jscomp$4$$, $event$jscomp$51$$) {
  $JSCompiler_StaticMethods_PinchRecognizer$$module$src$gesture_recognizers_prototype$emit_$self$$.$W$ = Date.now();
  var $deltaTime$jscomp$3_x1$jscomp$inline_2087$$ = $JSCompiler_StaticMethods_PinchRecognizer$$module$src$gesture_recognizers_prototype$emit_$self$$.$W$ - $JSCompiler_StaticMethods_PinchRecognizer$$module$src$gesture_recognizers_prototype$emit_$self$$.$Y$, $deltaX$$ = Math.abs($JSCompiler_StaticMethods_PinchRecognizer$$module$src$gesture_recognizers_prototype$emit_$self$$.$P$ - $JSCompiler_StaticMethods_PinchRecognizer$$module$src$gesture_recognizers_prototype$emit_$self$$.$I$ - ($JSCompiler_StaticMethods_PinchRecognizer$$module$src$gesture_recognizers_prototype$emit_$self$$.$R$ - 
  $JSCompiler_StaticMethods_PinchRecognizer$$module$src$gesture_recognizers_prototype$emit_$self$$.$J$)), $deltaY$$ = Math.abs($JSCompiler_StaticMethods_PinchRecognizer$$module$src$gesture_recognizers_prototype$emit_$self$$.$U$ - $JSCompiler_StaticMethods_PinchRecognizer$$module$src$gesture_recognizers_prototype$emit_$self$$.$K$ - ($JSCompiler_StaticMethods_PinchRecognizer$$module$src$gesture_recognizers_prototype$emit_$self$$.$V$ - $JSCompiler_StaticMethods_PinchRecognizer$$module$src$gesture_recognizers_prototype$emit_$self$$.$O$));
  if (!$last$jscomp$4$$ && 4 < $deltaTime$jscomp$3_x1$jscomp$inline_2087$$ || $last$jscomp$4$$ && 16 < $deltaTime$jscomp$3_x1$jscomp$inline_2087$$) {
    $JSCompiler_StaticMethods_PinchRecognizer$$module$src$gesture_recognizers_prototype$emit_$self$$.$F$ = $calcVelocity$$module$src$motion$$($deltaX$$ - $JSCompiler_StaticMethods_PinchRecognizer$$module$src$gesture_recognizers_prototype$emit_$self$$.$aa$, $deltaTime$jscomp$3_x1$jscomp$inline_2087$$, $JSCompiler_StaticMethods_PinchRecognizer$$module$src$gesture_recognizers_prototype$emit_$self$$.$F$), $JSCompiler_StaticMethods_PinchRecognizer$$module$src$gesture_recognizers_prototype$emit_$self$$.$G$ = 
    $calcVelocity$$module$src$motion$$($deltaY$$ - $JSCompiler_StaticMethods_PinchRecognizer$$module$src$gesture_recognizers_prototype$emit_$self$$.$ba$, $deltaTime$jscomp$3_x1$jscomp$inline_2087$$, $JSCompiler_StaticMethods_PinchRecognizer$$module$src$gesture_recognizers_prototype$emit_$self$$.$G$), $JSCompiler_StaticMethods_PinchRecognizer$$module$src$gesture_recognizers_prototype$emit_$self$$.$F$ = 1e-4 < Math.abs($JSCompiler_StaticMethods_PinchRecognizer$$module$src$gesture_recognizers_prototype$emit_$self$$.$F$) ? 
    $JSCompiler_StaticMethods_PinchRecognizer$$module$src$gesture_recognizers_prototype$emit_$self$$.$F$ : 0, $JSCompiler_StaticMethods_PinchRecognizer$$module$src$gesture_recognizers_prototype$emit_$self$$.$G$ = 1e-4 < Math.abs($JSCompiler_StaticMethods_PinchRecognizer$$module$src$gesture_recognizers_prototype$emit_$self$$.$G$) ? $JSCompiler_StaticMethods_PinchRecognizer$$module$src$gesture_recognizers_prototype$emit_$self$$.$G$ : 0, $JSCompiler_StaticMethods_PinchRecognizer$$module$src$gesture_recognizers_prototype$emit_$self$$.$aa$ = 
    $deltaX$$, $JSCompiler_StaticMethods_PinchRecognizer$$module$src$gesture_recognizers_prototype$emit_$self$$.$ba$ = $deltaY$$, $JSCompiler_StaticMethods_PinchRecognizer$$module$src$gesture_recognizers_prototype$emit_$self$$.$Y$ = $JSCompiler_StaticMethods_PinchRecognizer$$module$src$gesture_recognizers_prototype$emit_$self$$.$W$;
  }
  $deltaTime$jscomp$3_x1$jscomp$inline_2087$$ = $JSCompiler_StaticMethods_PinchRecognizer$$module$src$gesture_recognizers_prototype$emit_$self$$.$P$;
  var $x2$jscomp$inline_2088$$ = $JSCompiler_StaticMethods_PinchRecognizer$$module$src$gesture_recognizers_prototype$emit_$self$$.$R$, $y1$jscomp$inline_2089$$ = $JSCompiler_StaticMethods_PinchRecognizer$$module$src$gesture_recognizers_prototype$emit_$self$$.$U$, $y2$jscomp$inline_2090$$ = $JSCompiler_StaticMethods_PinchRecognizer$$module$src$gesture_recognizers_prototype$emit_$self$$.$V$, $x1$jscomp$inline_2093$$ = $JSCompiler_StaticMethods_PinchRecognizer$$module$src$gesture_recognizers_prototype$emit_$self$$.$I$, 
  $x2$jscomp$inline_2094$$ = $JSCompiler_StaticMethods_PinchRecognizer$$module$src$gesture_recognizers_prototype$emit_$self$$.$J$, $y1$jscomp$inline_2095$$ = $JSCompiler_StaticMethods_PinchRecognizer$$module$src$gesture_recognizers_prototype$emit_$self$$.$K$, $y2$jscomp$inline_2096$$ = $JSCompiler_StaticMethods_PinchRecognizer$$module$src$gesture_recognizers_prototype$emit_$self$$.$O$;
  $JSCompiler_StaticMethods_signalEmit_$$($JSCompiler_StaticMethods_PinchRecognizer$$module$src$gesture_recognizers_prototype$emit_$self$$.$manager_$, $JSCompiler_StaticMethods_PinchRecognizer$$module$src$gesture_recognizers_prototype$emit_$self$$, {first:$first$jscomp$8$$, $last$:$last$jscomp$4$$, time:$JSCompiler_StaticMethods_PinchRecognizer$$module$src$gesture_recognizers_prototype$emit_$self$$.$W$, $centerClientX$:$JSCompiler_StaticMethods_PinchRecognizer$$module$src$gesture_recognizers_prototype$emit_$self$$.$fa$, 
  $centerClientY$:$JSCompiler_StaticMethods_PinchRecognizer$$module$src$gesture_recognizers_prototype$emit_$self$$.$ga$, dir:Math.sign(($deltaTime$jscomp$3_x1$jscomp$inline_2087$$ - $x2$jscomp$inline_2088$$) * ($deltaTime$jscomp$3_x1$jscomp$inline_2087$$ - $x2$jscomp$inline_2088$$) + ($y1$jscomp$inline_2089$$ - $y2$jscomp$inline_2090$$) * ($y1$jscomp$inline_2089$$ - $y2$jscomp$inline_2090$$) - (($x1$jscomp$inline_2093$$ - $x2$jscomp$inline_2094$$) * ($x1$jscomp$inline_2093$$ - $x2$jscomp$inline_2094$$) + 
  ($y1$jscomp$inline_2095$$ - $y2$jscomp$inline_2096$$) * ($y1$jscomp$inline_2095$$ - $y2$jscomp$inline_2096$$))), deltaX:0.5 * $deltaX$$, deltaY:0.5 * $deltaY$$, velocityX:0.5 * $JSCompiler_StaticMethods_PinchRecognizer$$module$src$gesture_recognizers_prototype$emit_$self$$.$F$, velocityY:0.5 * $JSCompiler_StaticMethods_PinchRecognizer$$module$src$gesture_recognizers_prototype$emit_$self$$.$G$}, $event$jscomp$51$$);
};
_.$copyTextToClipboard$$module$src$clipboard$$ = function($win$jscomp$279$$, $text$jscomp$12$$) {
  var $copySuccessful$$ = !1, $doc$jscomp$64$$ = $win$jscomp$279$$.document, $textarea$$ = $doc$jscomp$64$$.createElement("textarea");
  _.$setStyles$$module$src$style$$($textarea$$, {position:"fixed", top:0, left:0, width:"50px", height:"50px", padding:0, border:"none", outline:"none", background:"transparent"});
  $textarea$$.value = $text$jscomp$12$$;
  $textarea$$.readOnly = !0;
  $textarea$$.contentEditable = !0;
  $doc$jscomp$64$$.body.appendChild($textarea$$);
  var $range$jscomp$6$$ = $doc$jscomp$64$$.createRange();
  $range$jscomp$6$$.selectNode($textarea$$);
  $win$jscomp$279$$.getSelection().removeAllRanges();
  $win$jscomp$279$$.getSelection().addRange($range$jscomp$6$$);
  $textarea$$.setSelectionRange(0, $text$jscomp$12$$.length);
  try {
    $copySuccessful$$ = $doc$jscomp$64$$.execCommand("copy");
  } catch ($e$197$$) {
  }
  _.$removeElement$$module$src$dom$$($textarea$$);
  return $copySuccessful$$;
};
_.$DocImpl$$module$extensions$amp_subscriptions$0_1$doc_impl$$ = function($ampdoc$jscomp$104$$) {
  this.$ampdoc_$ = $ampdoc$jscomp$104$$;
};
_.$Entitlement$$module$extensions$amp_subscriptions$0_1$entitlement$$ = function($input$jscomp$30$$) {
  var $source$jscomp$24$$ = $input$jscomp$30$$.source, $service$jscomp$20$$ = $input$jscomp$30$$.$service$, $granted$$ = void 0 === $input$jscomp$30$$.$granted$ ? !1 : $input$jscomp$30$$.$granted$, $grantReason$$ = void 0 === $input$jscomp$30$$.$grantReason$ ? "" : $input$jscomp$30$$.$grantReason$, $dataObject$$ = $input$jscomp$30$$.$dataObject$;
  this.raw = void 0 === $input$jscomp$30$$.raw ? "" : $input$jscomp$30$$.raw;
  this.source = $source$jscomp$24$$;
  this.$service$ = $service$jscomp$20$$;
  this.$granted$ = $granted$$;
  this.$grantReason$ = $grantReason$$;
  this.data = $dataObject$$;
};
_.$JSCompiler_StaticMethods_isSubscriber$$ = function($JSCompiler_StaticMethods_isSubscriber$self$$) {
  return $JSCompiler_StaticMethods_isSubscriber$self$$.$granted$ && "SUBSCRIBER" === $JSCompiler_StaticMethods_isSubscriber$self$$.$grantReason$;
};
_.$createLoginDialog$$module$extensions$amp_access$0_1$login_dialog$$ = function($ampdoc$jscomp$105$$, $urlOrPromise$$) {
  var $viewer$jscomp$30$$ = _.$Services$$module$src$services$viewerForDoc$$($ampdoc$jscomp$105$$);
  return (0,window.parseInt)($viewer$jscomp$30$$.$params_$.dialog, 10) ? new $ViewerLoginDialog$$module$extensions$amp_access$0_1$login_dialog$$($viewer$jscomp$30$$, $urlOrPromise$$) : new $WebLoginDialog$$module$extensions$amp_access$0_1$login_dialog$$($ampdoc$jscomp$105$$.$win$, $viewer$jscomp$30$$, $urlOrPromise$$);
};
_.$openLoginDialog$$module$extensions$amp_access$0_1$login_dialog$$ = function($ampdoc$jscomp$106$$, $urlOrPromise$jscomp$1$$) {
  return _.$createLoginDialog$$module$extensions$amp_access$0_1$login_dialog$$($ampdoc$jscomp$106$$, $urlOrPromise$jscomp$1$$).open();
};
$ViewerLoginDialog$$module$extensions$amp_access$0_1$login_dialog$$ = function($viewer$jscomp$31$$, $urlOrPromise$jscomp$3$$) {
  this.viewer = $viewer$jscomp$31$$;
  this.$D$ = $urlOrPromise$jscomp$3$$;
};
$WebLoginDialog$$module$extensions$amp_access$0_1$login_dialog$$ = function($win$jscomp$283$$, $viewer$jscomp$32$$, $urlOrPromise$jscomp$4$$) {
  this.$win$ = $win$jscomp$283$$;
  this.viewer = $viewer$jscomp$32$$;
  this.$G$ = $urlOrPromise$jscomp$4$$;
  this.$K$ = this.$F$ = this.$I$ = this.$D$ = this.$P$ = this.$J$ = null;
};
$JSCompiler_StaticMethods_WebLoginDialog$$module$extensions$amp_access$0_1$login_dialog_prototype$cleanup_$$ = function($JSCompiler_StaticMethods_WebLoginDialog$$module$extensions$amp_access$0_1$login_dialog_prototype$cleanup_$self$$) {
  $JSCompiler_StaticMethods_WebLoginDialog$$module$extensions$amp_access$0_1$login_dialog_prototype$cleanup_$self$$.$J$ = null;
  $JSCompiler_StaticMethods_WebLoginDialog$$module$extensions$amp_access$0_1$login_dialog_prototype$cleanup_$self$$.$P$ = null;
  if ($JSCompiler_StaticMethods_WebLoginDialog$$module$extensions$amp_access$0_1$login_dialog_prototype$cleanup_$self$$.$D$) {
    try {
      $JSCompiler_StaticMethods_WebLoginDialog$$module$extensions$amp_access$0_1$login_dialog_prototype$cleanup_$self$$.$D$.close();
    } catch ($e$199$$) {
    }
    $JSCompiler_StaticMethods_WebLoginDialog$$module$extensions$amp_access$0_1$login_dialog_prototype$cleanup_$self$$.$D$ = null;
  }
  $JSCompiler_StaticMethods_WebLoginDialog$$module$extensions$amp_access$0_1$login_dialog_prototype$cleanup_$self$$.$F$ && ($JSCompiler_StaticMethods_WebLoginDialog$$module$extensions$amp_access$0_1$login_dialog_prototype$cleanup_$self$$.$win$.clearInterval($JSCompiler_StaticMethods_WebLoginDialog$$module$extensions$amp_access$0_1$login_dialog_prototype$cleanup_$self$$.$F$), $JSCompiler_StaticMethods_WebLoginDialog$$module$extensions$amp_access$0_1$login_dialog_prototype$cleanup_$self$$.$F$ = null);
  $JSCompiler_StaticMethods_WebLoginDialog$$module$extensions$amp_access$0_1$login_dialog_prototype$cleanup_$self$$.$K$ && ($JSCompiler_StaticMethods_WebLoginDialog$$module$extensions$amp_access$0_1$login_dialog_prototype$cleanup_$self$$.$K$(), $JSCompiler_StaticMethods_WebLoginDialog$$module$extensions$amp_access$0_1$login_dialog_prototype$cleanup_$self$$.$K$ = null);
};
$JSCompiler_StaticMethods_WebLoginDialog$$module$extensions$amp_access$0_1$login_dialog_prototype$openInternal_$$ = function($JSCompiler_StaticMethods_WebLoginDialog$$module$extensions$amp_access$0_1$login_dialog_prototype$openInternal_$self$$) {
  var $options$jscomp$25_screen$jscomp$5$$ = $JSCompiler_StaticMethods_WebLoginDialog$$module$extensions$amp_access$0_1$login_dialog_prototype$openInternal_$self$$.$win$.screen, $loginUrl$jscomp$1_w$jscomp$12$$ = Math.floor(Math.min(700, 0.9 * $options$jscomp$25_screen$jscomp$5$$.width)), $h$jscomp$9$$ = Math.floor(Math.min(450, 0.9 * $options$jscomp$25_screen$jscomp$5$$.height));
  $options$jscomp$25_screen$jscomp$5$$ = "height=" + $h$jscomp$9$$ + ",width=" + $loginUrl$jscomp$1_w$jscomp$12$$ + ",left=" + Math.floor(($options$jscomp$25_screen$jscomp$5$$.width - $loginUrl$jscomp$1_w$jscomp$12$$) / 2) + ",top=" + Math.floor(($options$jscomp$25_screen$jscomp$5$$.height - $h$jscomp$9$$) / 2) + ",resizable=yes,scrollbars=yes";
  var $returnUrl$$ = $JSCompiler_StaticMethods_getReturnUrl_$$($JSCompiler_StaticMethods_WebLoginDialog$$module$extensions$amp_access$0_1$login_dialog_prototype$openInternal_$self$$);
  $JSCompiler_StaticMethods_WebLoginDialog$$module$extensions$amp_access$0_1$login_dialog_prototype$openInternal_$self$$.$I$ = null;
  "string" == typeof $JSCompiler_StaticMethods_WebLoginDialog$$module$extensions$amp_access$0_1$login_dialog_prototype$openInternal_$self$$.$G$ ? ($loginUrl$jscomp$1_w$jscomp$12$$ = $buildLoginUrl$$module$extensions$amp_access$0_1$login_dialog$$($JSCompiler_StaticMethods_WebLoginDialog$$module$extensions$amp_access$0_1$login_dialog_prototype$openInternal_$self$$.$G$, $returnUrl$$), "amp-access-login", $JSCompiler_StaticMethods_WebLoginDialog$$module$extensions$amp_access$0_1$login_dialog_prototype$openInternal_$self$$.$D$ = 
  _.$openWindowDialog$$module$src$dom$$($JSCompiler_StaticMethods_WebLoginDialog$$module$extensions$amp_access$0_1$login_dialog_prototype$openInternal_$self$$.$win$, $loginUrl$jscomp$1_w$jscomp$12$$, "_blank", $options$jscomp$25_screen$jscomp$5$$), $JSCompiler_StaticMethods_WebLoginDialog$$module$extensions$amp_access$0_1$login_dialog_prototype$openInternal_$self$$.$D$ && ($JSCompiler_StaticMethods_WebLoginDialog$$module$extensions$amp_access$0_1$login_dialog_prototype$openInternal_$self$$.$I$ = 
  window.Promise.resolve())) : ("amp-access-login", $JSCompiler_StaticMethods_WebLoginDialog$$module$extensions$amp_access$0_1$login_dialog_prototype$openInternal_$self$$.$D$ = _.$openWindowDialog$$module$src$dom$$($JSCompiler_StaticMethods_WebLoginDialog$$module$extensions$amp_access$0_1$login_dialog_prototype$openInternal_$self$$.$win$, "", "_blank", $options$jscomp$25_screen$jscomp$5$$), $JSCompiler_StaticMethods_WebLoginDialog$$module$extensions$amp_access$0_1$login_dialog_prototype$openInternal_$self$$.$D$ && 
  ($JSCompiler_StaticMethods_WebLoginDialog$$module$extensions$amp_access$0_1$login_dialog_prototype$openInternal_$self$$.$I$ = $JSCompiler_StaticMethods_WebLoginDialog$$module$extensions$amp_access$0_1$login_dialog_prototype$openInternal_$self$$.$G$.then(function($options$jscomp$25_screen$jscomp$5$$) {
    $options$jscomp$25_screen$jscomp$5$$ = $buildLoginUrl$$module$extensions$amp_access$0_1$login_dialog$$($options$jscomp$25_screen$jscomp$5$$, $returnUrl$$);
    "amp-access-login";
    $JSCompiler_StaticMethods_WebLoginDialog$$module$extensions$amp_access$0_1$login_dialog_prototype$openInternal_$self$$.$D$.location.replace($options$jscomp$25_screen$jscomp$5$$);
  }, function($JSCompiler_StaticMethods_WebLoginDialog$$module$extensions$amp_access$0_1$login_dialog_prototype$openInternal_$self$$) {
    throw Error("failed to resolve url: " + $JSCompiler_StaticMethods_WebLoginDialog$$module$extensions$amp_access$0_1$login_dialog_prototype$openInternal_$self$$);
  })));
  $JSCompiler_StaticMethods_WebLoginDialog$$module$extensions$amp_access$0_1$login_dialog_prototype$openInternal_$self$$.$I$ ? $JSCompiler_StaticMethods_WebLoginDialog$$module$extensions$amp_access$0_1$login_dialog_prototype$openInternal_$self$$.$I$.then(function() {
    $JSCompiler_StaticMethods_setupDialog_$$($JSCompiler_StaticMethods_WebLoginDialog$$module$extensions$amp_access$0_1$login_dialog_prototype$openInternal_$self$$, $returnUrl$$);
  }, function($options$jscomp$25_screen$jscomp$5$$) {
    $JSCompiler_StaticMethods_loginDone_$$($JSCompiler_StaticMethods_WebLoginDialog$$module$extensions$amp_access$0_1$login_dialog_prototype$openInternal_$self$$, null, $options$jscomp$25_screen$jscomp$5$$);
  }) : $JSCompiler_StaticMethods_loginDone_$$($JSCompiler_StaticMethods_WebLoginDialog$$module$extensions$amp_access$0_1$login_dialog_prototype$openInternal_$self$$, null, Error("failed to open dialog"));
};
$JSCompiler_StaticMethods_setupDialog_$$ = function($JSCompiler_StaticMethods_setupDialog_$self$$, $returnUrl$jscomp$1$$) {
  var $returnOrigin$$ = _.$parseUrlDeprecated$$module$src$url$$($returnUrl$jscomp$1$$).origin;
  $JSCompiler_StaticMethods_setupDialog_$self$$.$F$ = $JSCompiler_StaticMethods_setupDialog_$self$$.$win$.setInterval(function() {
    $JSCompiler_StaticMethods_setupDialog_$self$$.$D$.closed && ($JSCompiler_StaticMethods_setupDialog_$self$$.$win$.clearInterval($JSCompiler_StaticMethods_setupDialog_$self$$.$F$), $JSCompiler_StaticMethods_setupDialog_$self$$.$F$ = null, $JSCompiler_StaticMethods_setupDialog_$self$$.$win$.setTimeout(function() {
      $JSCompiler_StaticMethods_loginDone_$$($JSCompiler_StaticMethods_setupDialog_$self$$, "");
    }, 3000));
  }, 500);
  $JSCompiler_StaticMethods_setupDialog_$self$$.$K$ = _.$listen$$module$src$event_helper$$($JSCompiler_StaticMethods_setupDialog_$self$$.$win$, "message", function($returnUrl$jscomp$1$$) {
    "amp-access-login";
    $returnUrl$jscomp$1$$.origin == $returnOrigin$$ && $returnUrl$jscomp$1$$.data && "amp" == $returnUrl$jscomp$1$$.data.sentinel && ("amp-access-login", "result" == $returnUrl$jscomp$1$$.data.type && ($JSCompiler_StaticMethods_setupDialog_$self$$.$D$ && $JSCompiler_StaticMethods_setupDialog_$self$$.$D$.postMessage(_.$dict$$module$src$utils$object$$({sentinel:"amp", type:"result-ack"}), $returnOrigin$$), $JSCompiler_StaticMethods_loginDone_$$($JSCompiler_StaticMethods_setupDialog_$self$$, $returnUrl$jscomp$1$$.data.result)));
  });
};
$JSCompiler_StaticMethods_loginDone_$$ = function($JSCompiler_StaticMethods_loginDone_$self$$, $result$jscomp$20$$, $opt_error$jscomp$2$$) {
  $JSCompiler_StaticMethods_loginDone_$self$$.$J$ && ("amp-access-login", $opt_error$jscomp$2$$ ? $JSCompiler_StaticMethods_loginDone_$self$$.$P$($opt_error$jscomp$2$$) : $JSCompiler_StaticMethods_loginDone_$self$$.$J$($result$jscomp$20$$), $JSCompiler_StaticMethods_WebLoginDialog$$module$extensions$amp_access$0_1$login_dialog_prototype$cleanup_$$($JSCompiler_StaticMethods_loginDone_$self$$));
};
$JSCompiler_StaticMethods_getReturnUrl_$$ = function($JSCompiler_StaticMethods_getReturnUrl_$self$$) {
  return _.$urls$$module$src$config$$.cdn + "/v0/amp-login-done-0.1.html?url=" + (0,window.encodeURIComponent)($JSCompiler_StaticMethods_getReturnUrl_$self$$.viewer.$resolvedViewerUrl_$);
};
$buildLoginUrl$$module$extensions$amp_access$0_1$login_dialog$$ = function($url$jscomp$111$$, $returnUrl$jscomp$3$$) {
  return $RETURN_URL_REGEX$$module$extensions$amp_access$0_1$login_dialog$$.test($url$jscomp$111$$) ? $url$jscomp$111$$.replace($RETURN_URL_REGEX$$module$extensions$amp_access$0_1$login_dialog$$, (0,window.encodeURIComponent)($returnUrl$jscomp$3$$)) : $url$jscomp$111$$ + (-1 == $url$jscomp$111$$.indexOf("?") ? "?" : "&") + "return=" + (0,window.encodeURIComponent)($returnUrl$jscomp$3$$);
};
_.$evaluateAccessExpr$$module$extensions$amp_access$0_1$access_expr$$ = function($expr$jscomp$12$$, $data$jscomp$85$$) {
  try {
    return $parser$$module$extensions$amp_access$0_1$access_expr_impl$$.$yy$ = $data$jscomp$85$$, !!$parser$$module$extensions$amp_access$0_1$access_expr_impl$$.parse($expr$jscomp$12$$);
  } finally {
    $parser$$module$extensions$amp_access$0_1$access_expr_impl$$.$yy$ = null;
  }
};
_.$JSCompiler_StaticMethods_JwtHelper$$module$extensions$amp_access$0_1$jwt_prototype$decodeInternal_$$ = function($encodedToken$jscomp$2$$) {
  function $invalidToken$$() {
    throw Error('Invalid token: "' + $encodedToken$jscomp$2$$ + '"');
  }
  var $parts$jscomp$6$$ = $encodedToken$jscomp$2$$.split(".");
  3 != $parts$jscomp$6$$.length && $invalidToken$$();
  var $headerUtf8Bytes$$ = _.$base64UrlDecodeToBytes$$module$src$utils$base64$$($parts$jscomp$6$$[0]), $payloadUtf8Bytes$$ = _.$base64UrlDecodeToBytes$$module$src$utils$base64$$($parts$jscomp$6$$[1]);
  return {header:_.$tryParseJson$$module$src$json$$(_.$utf8Decode$$module$src$utils$bytes$$($headerUtf8Bytes$$), $invalidToken$$), $payload$:_.$tryParseJson$$module$src$json$$(_.$utf8Decode$$module$src$utils$bytes$$($payloadUtf8Bytes$$), $invalidToken$$), $verifiable$:$parts$jscomp$6$$[0] + "." + $parts$jscomp$6$$[1], $sig$:$parts$jscomp$6$$[2]};
};
_.$NotificationUiManager$$module$src$service$notification_ui_manager$$ = function() {
  this.$D$ = 0;
  this.$I$ = window.Promise.resolve();
  this.$F$ = function() {
  };
  this.$G$ = function() {
  };
};
_.$JSCompiler_StaticMethods_registerUI$$ = function($JSCompiler_StaticMethods_registerUI$self$$, $show$jscomp$2$$) {
  0 == $JSCompiler_StaticMethods_registerUI$self$$.$D$ && $JSCompiler_StaticMethods_registerUI$self$$.$G$();
  $JSCompiler_StaticMethods_registerUI$self$$.$D$++;
  var $promise$jscomp$30$$ = $JSCompiler_StaticMethods_registerUI$self$$.$I$.then(function() {
    return $show$jscomp$2$$().then(function() {
      $JSCompiler_StaticMethods_registerUI$self$$.$D$--;
      0 == $JSCompiler_StaticMethods_registerUI$self$$.$D$ && $JSCompiler_StaticMethods_registerUI$self$$.$F$();
    });
  });
  return $JSCompiler_StaticMethods_registerUI$self$$.$I$ = $promise$jscomp$30$$;
};
_.$fetchDocument$$module$src$document_fetcher$$ = function($win$jscomp$285$$, $input$jscomp$33$$, $ampdocService$jscomp$6_ampdocSingle$jscomp$2_opt_init$jscomp$13$$) {
  var $init$jscomp$14$$ = _.$setupInit$$module$src$utils$xhr_utils$$($ampdocService$jscomp$6_ampdocSingle$jscomp$2_opt_init$jscomp$13$$, "text/html");
  $init$jscomp$14$$ = _.$setupAMPCors$$module$src$utils$xhr_utils$$($win$jscomp$285$$, $input$jscomp$33$$, $init$jscomp$14$$);
  $input$jscomp$33$$ = _.$setupInput$$module$src$utils$xhr_utils$$($win$jscomp$285$$, $input$jscomp$33$$, $init$jscomp$14$$);
  $ampdocService$jscomp$6_ampdocSingle$jscomp$2_opt_init$jscomp$13$$ = _.$Services$$module$src$services$ampdocServiceFor$$($win$jscomp$285$$);
  $ampdocService$jscomp$6_ampdocSingle$jscomp$2_opt_init$jscomp$13$$ = $ampdocService$jscomp$6_ampdocSingle$jscomp$2_opt_init$jscomp$13$$.$isSingleDoc$() ? $ampdocService$jscomp$6_ampdocSingle$jscomp$2_opt_init$jscomp$13$$.$getAmpDoc$() : null;
  $init$jscomp$14$$.responseType = "document";
  return _.$getViewerInterceptResponse$$module$src$utils$xhr_utils$$($win$jscomp$285$$, $ampdocService$jscomp$6_ampdocSingle$jscomp$2_opt_init$jscomp$13$$, $input$jscomp$33$$, $init$jscomp$14$$).then(function($ampdocService$jscomp$6_ampdocSingle$jscomp$2_opt_init$jscomp$13$$) {
    return $ampdocService$jscomp$6_ampdocSingle$jscomp$2_opt_init$jscomp$13$$ ? $ampdocService$jscomp$6_ampdocSingle$jscomp$2_opt_init$jscomp$13$$.text().then(function($win$jscomp$285$$) {
      return (new window.DOMParser).parseFromString($win$jscomp$285$$, "text/html");
    }) : $xhrRequest$$module$src$document_fetcher$$($input$jscomp$33$$, $init$jscomp$14$$).then(function($input$jscomp$33$$) {
      var $ampdocService$jscomp$6_ampdocSingle$jscomp$2_opt_init$jscomp$13$$ = $input$jscomp$33$$.$xhr$;
      _.$verifyAmpCORSHeaders$$module$src$utils$xhr_utils$$($win$jscomp$285$$, $input$jscomp$33$$.response);
      return $ampdocService$jscomp$6_ampdocSingle$jscomp$2_opt_init$jscomp$13$$.responseXML;
    });
  });
};
$xhrRequest$$module$src$document_fetcher$$ = function($input$jscomp$34$$, $init$jscomp$15$$) {
  return new window.Promise(function($resolve$jscomp$48$$, $reject$jscomp$20$$) {
    var $xhr$jscomp$8$$ = new window.XMLHttpRequest;
    $xhr$jscomp$8$$.open($init$jscomp$15$$.method || "GET", $input$jscomp$34$$, !0);
    $xhr$jscomp$8$$.withCredentials = "include" == $init$jscomp$15$$.credentials;
    $xhr$jscomp$8$$.responseType = "document";
    for (var $header$jscomp$3$$ in $init$jscomp$15$$.headers) {
      $xhr$jscomp$8$$.setRequestHeader($header$jscomp$3$$, $init$jscomp$15$$.headers[$header$jscomp$3$$]);
    }
    $xhr$jscomp$8$$.onreadystatechange = function() {
      if (!(2 > $xhr$jscomp$8$$.readyState)) {
        if (100 > $xhr$jscomp$8$$.status || 599 < $xhr$jscomp$8$$.status) {
          $xhr$jscomp$8$$.onreadystatechange = null, $reject$jscomp$20$$(_.$user$$module$src$log$$().$createExpectedError$("Unknown HTTP status " + $xhr$jscomp$8$$.status));
        } else {
          if (4 == $xhr$jscomp$8$$.readyState) {
            var $input$jscomp$34$$ = {status:$xhr$jscomp$8$$.status, statusText:$xhr$jscomp$8$$.statusText, headers:$parseHeaders$$module$src$document_fetcher$$($xhr$jscomp$8$$.getAllResponseHeaders())};
            $input$jscomp$34$$ = new window.Response("", $input$jscomp$34$$);
            $input$jscomp$34$$ = _.$assertSuccess$$module$src$utils$xhr_utils$$($input$jscomp$34$$).then(function($input$jscomp$34$$) {
              return {response:$input$jscomp$34$$, $xhr$:$xhr$jscomp$8$$};
            });
            $resolve$jscomp$48$$($input$jscomp$34$$);
          }
        }
      }
    };
    $xhr$jscomp$8$$.onerror = function() {
      $reject$jscomp$20$$(_.$user$$module$src$log$$().$createExpectedError$("Request failure"));
    };
    $xhr$jscomp$8$$.onabort = function() {
      $reject$jscomp$20$$(_.$user$$module$src$log$$().$createExpectedError$("Request aborted"));
    };
    "POST" == $init$jscomp$15$$.method ? $xhr$jscomp$8$$.send($init$jscomp$15$$.body) : $xhr$jscomp$8$$.send();
  });
};
$parseHeaders$$module$src$document_fetcher$$ = function($rawHeaders$$) {
  var $headers$jscomp$4$$ = _.$dict$$module$src$utils$object$$({});
  $rawHeaders$$.replace(/\r?\n[\t ]+/g, " ").split(/\r?\n/).forEach(function($rawHeaders$$) {
    $rawHeaders$$ = $rawHeaders$$.split(":");
    var $line$jscomp$3_parts$jscomp$7$$ = $rawHeaders$$.shift().trim();
    $line$jscomp$3_parts$jscomp$7$$ && ($headers$jscomp$4$$[$line$jscomp$3_parts$jscomp$7$$] = $rawHeaders$$.join(":").trim());
  });
  return $headers$jscomp$4$$;
};
_.$AccessClientAdapter$$module$extensions$amp_access$0_1$amp_access_client$$ = function($ampdoc$jscomp$108$$, $JSCompiler_inline_result$jscomp$596_configJson_timeout$jscomp$inline_2109$$, $context$jscomp$14$$) {
  this.ampdoc = $ampdoc$jscomp$108$$;
  this.$context_$ = $context$jscomp$14$$;
  this.$D$ = $JSCompiler_inline_result$jscomp$596_configJson_timeout$jscomp$inline_2109$$.authorization;
  this.$I$ = !$JSCompiler_inline_result$jscomp$596_configJson_timeout$jscomp$inline_2109$$.noPingback;
  this.$J$ = $JSCompiler_inline_result$jscomp$596_configJson_timeout$jscomp$inline_2109$$.pingback;
  $JSCompiler_inline_result$jscomp$596_configJson_timeout$jscomp$inline_2109$$.authorizationTimeout ? ($JSCompiler_inline_result$jscomp$596_configJson_timeout$jscomp$inline_2109$$ = $JSCompiler_inline_result$jscomp$596_configJson_timeout$jscomp$inline_2109$$.authorizationTimeout, _.$getMode$$module$src$mode$$().$development$ || ($JSCompiler_inline_result$jscomp$596_configJson_timeout$jscomp$inline_2109$$ = Math.min($JSCompiler_inline_result$jscomp$596_configJson_timeout$jscomp$inline_2109$$, 3000))) : 
  $JSCompiler_inline_result$jscomp$596_configJson_timeout$jscomp$inline_2109$$ = 3000;
  this.$G$ = $JSCompiler_inline_result$jscomp$596_configJson_timeout$jscomp$inline_2109$$;
  this.$xhr_$ = _.$Services$$module$src$services$xhrFor$$($ampdoc$jscomp$108$$.$win$);
  this.$timer_$ = _.$Services$$module$src$services$timerFor$$($ampdoc$jscomp$108$$.$win$);
};
_.$AmpDoc$$module$src$service$ampdoc_impl$$.prototype.$isBodyAvailable$ = _.$JSCompiler_unstubMethod$$(45, function() {
  return !1;
});
_.$AmpDocSingle$$module$src$service$ampdoc_impl$$.prototype.$isBodyAvailable$ = _.$JSCompiler_unstubMethod$$(44, function() {
  return !!this.$win$.document.body;
});
_.$AmpDocShadow$$module$src$service$ampdoc_impl$$.prototype.$isBodyAvailable$ = _.$JSCompiler_unstubMethod$$(43, function() {
  return !!this.$G$;
});
_.$ViewportBindingIosEmbedShadowRoot_$$module$src$service$viewport$viewport_binding_ios_embed_sd$$.prototype.$updateLightboxMode$ = _.$JSCompiler_unstubMethod$$(39, function() {
  return window.Promise.resolve();
});
_.$ViewportBindingIosEmbedWrapper_$$module$src$service$viewport$viewport_binding_ios_embed_wrapper$$.prototype.$updateLightboxMode$ = _.$JSCompiler_unstubMethod$$(38, function() {
  return window.Promise.resolve();
});
_.$ViewportBindingNatural_$$module$src$service$viewport$viewport_binding_natural$$.prototype.$updateLightboxMode$ = _.$JSCompiler_unstubMethod$$(37, function() {
  return window.Promise.resolve();
});
_.$TransferLayerBody$$module$src$service$fixed_layer$$.prototype.$F$ = _.$JSCompiler_unstubMethod$$(36, function() {
  return this.$D$;
});
_.$TransferLayerShadow$$module$src$service$fixed_layer$$.prototype.$F$ = _.$JSCompiler_unstubMethod$$(35, function() {
  return this.$D$;
});
_.$AnimationPlayer$$module$src$animation$$.prototype.$halt$ = _.$JSCompiler_unstubMethod$$(34, function() {
  _.$JSCompiler_StaticMethods_AnimationPlayer$$module$src$animation_prototype$complete_$$(this, !1);
});
_.$BaseElement$$module$src$base_element$$.prototype.$scheduleResume$ = _.$JSCompiler_unstubMethod$$(14, function($elements$jscomp$5$$) {
  this.element.$getResources$().$scheduleResume$(this.element, $elements$jscomp$5$$);
});
_.$Resources$$module$src$service$resources_impl$$.prototype.$scheduleResume$ = _.$JSCompiler_unstubMethod$$(13, function($parentElement$jscomp$2_parentResource$jscomp$1$$, $subElements$jscomp$2$$) {
  $parentElement$jscomp$2_parentResource$jscomp$1$$ = _.$Resource$$module$src$service$resource$forElementOptional$$($parentElement$jscomp$2_parentResource$jscomp$1$$);
  $subElements$jscomp$2$$ = _.$elements_$$module$src$service$resources_impl$$($subElements$jscomp$2$$);
  _.$JSCompiler_StaticMethods_discoverResourcesForArray_$$(this, $parentElement$jscomp$2_parentResource$jscomp$1$$, $subElements$jscomp$2$$, function($parentElement$jscomp$2_parentResource$jscomp$1$$) {
    $parentElement$jscomp$2_parentResource$jscomp$1$$.resume();
  });
});
_.$BaseElement$$module$src$base_element$$.prototype.$schedulePause$ = _.$JSCompiler_unstubMethod$$(12, function($elements$jscomp$4$$) {
  this.element.$getResources$().$schedulePause$(this.element, $elements$jscomp$4$$);
});
_.$Resources$$module$src$service$resources_impl$$.prototype.$schedulePause$ = _.$JSCompiler_unstubMethod$$(11, function($parentElement$jscomp$1_parentResource$$, $subElements$jscomp$1$$) {
  $parentElement$jscomp$1_parentResource$$ = _.$Resource$$module$src$service$resource$forElementOptional$$($parentElement$jscomp$1_parentResource$$);
  $subElements$jscomp$1$$ = _.$elements_$$module$src$service$resources_impl$$($subElements$jscomp$1$$);
  _.$JSCompiler_StaticMethods_discoverResourcesForArray_$$(this, $parentElement$jscomp$1_parentResource$$, $subElements$jscomp$1$$, function($parentElement$jscomp$1_parentResource$$) {
    $parentElement$jscomp$1_parentResource$$.pause();
  });
});
_.$BaseElement$$module$src$base_element$$.prototype.$getDpr$ = _.$JSCompiler_unstubMethod$$(8, function() {
  return this.element.$getResources$().$getDpr$();
});
_.$Resources$$module$src$service$resources_impl$$.prototype.$getDpr$ = _.$JSCompiler_unstubMethod$$(7, function() {
  return this.$wa$;
});
var $base64UrlDecodeSubs$$module$src$utils$base64$$ = {"-":"+", _:"/", ".":"="};
_.$SsrTemplateHelper$$module$src$ssr_template_helper$$.prototype.isSupported = function() {
  var $ampdoc$jscomp$103$$ = this.$viewer_$.ampdoc;
  return $ampdoc$jscomp$103$$.$isSingleDoc$() && $ampdoc$jscomp$103$$.getRootNode().documentElement.hasAttribute("allow-viewer-render-template") ? _.$JSCompiler_StaticMethods_hasCapability$$(this.$viewer_$, "viewerRenderTemplate") : !1;
};
var $srcsetRegex$$module$src$srcset$$ = /(\S+)(?:\s+(?:(-?\d+(?:\.\d+)?)([a-zA-Z]*)))?\s*(?:,|$)/g;
$Srcset$$module$src$srcset$$.prototype.select = function($sources$jscomp$inline_1998_sources$jscomp$inline_2008_width$jscomp$24$$, $JSCompiler_temp$jscomp$583_dpr$jscomp$1_width$jscomp$inline_1997$$) {
  if (this.$F$) {
    $JSCompiler_temp$jscomp$583_dpr$jscomp$1_width$jscomp$inline_1997$$ = $sources$jscomp$inline_1998_sources$jscomp$inline_2008_width$jscomp$24$$ * $JSCompiler_temp$jscomp$583_dpr$jscomp$1_width$jscomp$inline_1997$$;
    $sources$jscomp$inline_1998_sources$jscomp$inline_2008_width$jscomp$24$$ = this.$D$;
    for (var $minIndex$jscomp$inline_1999_minIndex$jscomp$inline_2009$$ = 0, $minScore$jscomp$inline_2000_minScore$jscomp$inline_2010$$ = window.Infinity, $i$jscomp$inline_2011_minWidth$jscomp$inline_2001$$ = window.Infinity, $i$jscomp$inline_2002_score$jscomp$inline_2012$$ = 0; $i$jscomp$inline_2002_score$jscomp$inline_2012$$ < $sources$jscomp$inline_1998_sources$jscomp$inline_2008_width$jscomp$24$$.length; $i$jscomp$inline_2002_score$jscomp$inline_2012$$++) {
      var $sWidth$jscomp$inline_2003$$ = $sources$jscomp$inline_1998_sources$jscomp$inline_2008_width$jscomp$24$$[$i$jscomp$inline_2002_score$jscomp$inline_2012$$].width, $score$jscomp$inline_2004$$ = Math.abs($sWidth$jscomp$inline_2003$$ - $JSCompiler_temp$jscomp$583_dpr$jscomp$1_width$jscomp$inline_1997$$);
      if ($score$jscomp$inline_2004$$ <= 1.1 * $minScore$jscomp$inline_2000_minScore$jscomp$inline_2010$$ || 1.2 < $JSCompiler_temp$jscomp$583_dpr$jscomp$1_width$jscomp$inline_1997$$ / $i$jscomp$inline_2011_minWidth$jscomp$inline_2001$$) {
        $minIndex$jscomp$inline_1999_minIndex$jscomp$inline_2009$$ = $i$jscomp$inline_2002_score$jscomp$inline_2012$$, $minScore$jscomp$inline_2000_minScore$jscomp$inline_2010$$ = $score$jscomp$inline_2004$$, $i$jscomp$inline_2011_minWidth$jscomp$inline_2001$$ = $sWidth$jscomp$inline_2003$$;
      } else {
        break;
      }
    }
  } else {
    for ($sources$jscomp$inline_1998_sources$jscomp$inline_2008_width$jscomp$24$$ = this.$D$, $minIndex$jscomp$inline_1999_minIndex$jscomp$inline_2009$$ = 0, $minScore$jscomp$inline_2000_minScore$jscomp$inline_2010$$ = window.Infinity, $i$jscomp$inline_2011_minWidth$jscomp$inline_2001$$ = 0; $i$jscomp$inline_2011_minWidth$jscomp$inline_2001$$ < $sources$jscomp$inline_1998_sources$jscomp$inline_2008_width$jscomp$24$$.length; $i$jscomp$inline_2011_minWidth$jscomp$inline_2001$$++) {
      if ($i$jscomp$inline_2002_score$jscomp$inline_2012$$ = Math.abs($sources$jscomp$inline_1998_sources$jscomp$inline_2008_width$jscomp$24$$[$i$jscomp$inline_2011_minWidth$jscomp$inline_2001$$].$dpr$ - $JSCompiler_temp$jscomp$583_dpr$jscomp$1_width$jscomp$inline_1997$$), $i$jscomp$inline_2002_score$jscomp$inline_2012$$ <= $minScore$jscomp$inline_2000_minScore$jscomp$inline_2010$$) {
        $minIndex$jscomp$inline_1999_minIndex$jscomp$inline_2009$$ = $i$jscomp$inline_2011_minWidth$jscomp$inline_2001$$, $minScore$jscomp$inline_2000_minScore$jscomp$inline_2010$$ = $i$jscomp$inline_2002_score$jscomp$inline_2012$$;
      } else {
        break;
      }
    }
  }
  $JSCompiler_temp$jscomp$583_dpr$jscomp$1_width$jscomp$inline_1997$$ = $minIndex$jscomp$inline_1999_minIndex$jscomp$inline_2009$$;
  return this.$D$[$JSCompiler_temp$jscomp$583_dpr$jscomp$1_width$jscomp$inline_1997$$].url;
};
var $html$$module$dompurify$dist$purify_es$$ = "a abbr acronym address area article aside audio b bdi bdo big blink blockquote body br button canvas caption center cite code col colgroup content data datalist dd decorator del details dfn dir div dl dt element em fieldset figcaption figure font footer form h1 h2 h3 h4 h5 h6 head header hgroup hr html i img input ins kbd label legend li main map mark marquee menu menuitem meter nav nobr ol optgroup option output p pre progress q rp rt ruby s samp section select shadow small source spacer span strike strong style sub summary sup table tbody td template textarea tfoot th thead time tr track tt u ul var video wbr".split(" "), 
$svg$$module$dompurify$dist$purify_es$$ = "svg a altglyph altglyphdef altglyphitem animatecolor animatemotion animatetransform audio canvas circle clippath defs desc ellipse filter font g glyph glyphref hkern image line lineargradient marker mask metadata mpath path pattern polygon polyline radialgradient rect stop style switch symbol text textpath title tref tspan video view vkern".split(" "), $svgFilters$$module$dompurify$dist$purify_es$$ = "feBlend feColorMatrix feComponentTransfer feComposite feConvolveMatrix feDiffuseLighting feDisplacementMap feDistantLight feFlood feFuncA feFuncB feFuncG feFuncR feGaussianBlur feMerge feMergeNode feMorphology feOffset fePointLight feSpecularLighting feSpotLight feTile feTurbulence".split(" "), 
$mathMl$$module$dompurify$dist$purify_es$$ = "math menclose merror mfenced mfrac mglyph mi mlabeledtr mmuliscripts mn mo mover mpadded mphantom mroot mrow ms mpspace msqrt mystyle msub msup msubsup mtable mtd mtext mtr munder munderover".split(" "), $text$$module$dompurify$dist$purify_es$$ = ["#text"], $html$1$$module$dompurify$dist$purify_es$$ = "accept action align alt autocomplete background bgcolor border cellpadding cellspacing checked cite class clear color cols colspan coords crossorigin datetime default dir disabled download enctype face for headers height hidden high href hreflang id integrity ismap label lang list loop low max maxlength media method min multiple name noshade novalidate nowrap open optimum pattern placeholder poster preload pubdate radiogroup readonly rel required rev reversed role rows rowspan spellcheck scope selected shape size sizes span srclang start src srcset step style summary tabindex title type usemap valign value width xmlns".split(" "), 
$svg$1$$module$dompurify$dist$purify_es$$ = "accent-height accumulate additivive alignment-baseline ascent attributename attributetype azimuth basefrequency baseline-shift begin bias by class clip clip-path clip-rule color color-interpolation color-interpolation-filters color-profile color-rendering cx cy d dx dy diffuseconstant direction display divisor dur edgemode elevation end fill fill-opacity fill-rule filter flood-color flood-opacity font-family font-size font-size-adjust font-stretch font-style font-variant font-weight fx fy g1 g2 glyph-name glyphref gradientunits gradienttransform height href id image-rendering in in2 k k1 k2 k3 k4 kerning keypoints keysplines keytimes lang lengthadjust letter-spacing kernelmatrix kernelunitlength lighting-color local marker-end marker-mid marker-start markerheight markerunits markerwidth maskcontentunits maskunits max mask media method mode min name numoctaves offset operator opacity order orient orientation origin overflow paint-order path pathlength patterncontentunits patterntransform patternunits points preservealpha preserveaspectratio r rx ry radius refx refy repeatcount repeatdur restart result rotate scale seed shape-rendering specularconstant specularexponent spreadmethod stddeviation stitchtiles stop-color stop-opacity stroke-dasharray stroke-dashoffset stroke-linecap stroke-linejoin stroke-miterlimit stroke-opacity stroke stroke-width style surfacescale tabindex targetx targety transform text-anchor text-decoration text-rendering textlength type u1 u2 unicode values viewbox visibility vert-adv-y vert-origin-x vert-origin-y width word-spacing wrap writing-mode xchannelselector ychannelselector x x1 x2 xmlns y y1 y2 z zoomandpan".split(" "), 
$mathMl$1$$module$dompurify$dist$purify_es$$ = "accent accentunder align bevelled close columnsalign columnlines columnspan denomalign depth dir display displaystyle fence frame height href id largeop length linethickness lspace lquote mathbackground mathcolor mathsize mathvariant maxsize minsize movablelimits notation numalign open rowalign rowlines rowspacing rowspan rspace rquote scriptlevel scriptminsize scriptsizemultiplier selection separator separators stretchy subscriptshift supscriptshift symmetric voffset width xmlns".split(" "), 
$xml$$module$dompurify$dist$purify_es$$ = ["xlink:href", "xml:id", "xlink:title", "xml:space", "xmlns:xlink"], $MUSTACHE_EXPR$$module$dompurify$dist$purify_es$$ = /\{\{[\s\S]*|[\s\S]*\}\}/gm, $ERB_EXPR$$module$dompurify$dist$purify_es$$ = /<%[\s\S]*|[\s\S]*%>/gm, $DATA_ATTR$$module$dompurify$dist$purify_es$$ = /^data-[\-\w.\u00B7-\uFFFF]/, $ARIA_ATTR$$module$dompurify$dist$purify_es$$ = /^aria-[\-\w]+$/, $IS_ALLOWED_URI$$module$dompurify$dist$purify_es$$ = /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i, 
$IS_SCRIPT_OR_DATA$$module$dompurify$dist$purify_es$$ = /^(?:\w+script|data):/i, $ATTR_WHITESPACE$$module$dompurify$dist$purify_es$$ = /[\u0000-\u0020\u00A0\u1680\u180E\u2000-\u2029\u205f\u3000]/g;
_.$$jscomp$initSymbol$$();
_.$$jscomp$initSymbol$$();
_.$$jscomp$initSymbolIterator$$();
var $_typeof$$module$dompurify$dist$purify_es$$ = "function" === typeof window.Symbol && "symbol" === typeof window.Symbol.iterator ? function($obj$jscomp$37$$) {
  return typeof $obj$jscomp$37$$;
} : function($obj$jscomp$38$$) {
  _.$$jscomp$initSymbol$$();
  _.$$jscomp$initSymbol$$();
  _.$$jscomp$initSymbol$$();
  return $obj$jscomp$38$$ && "function" === typeof window.Symbol && $obj$jscomp$38$$.constructor === window.Symbol && $obj$jscomp$38$$ !== window.Symbol.prototype ? "symbol" : typeof $obj$jscomp$38$$;
};
var $WHITELISTED_TAGS_BY_ATTRS$$module$src$purifier$$, $BLACKLISTED_ATTR_VALUES$$module$src$purifier$$, $BLACKLISTED_TAG_SPECIFIC_ATTR_VALUES$$module$src$purifier$$, $BLACKLISTED_FIELDS_ATTR$$module$src$purifier$$, $BLACKLISTED_TAG_SPECIFIC_ATTRS$$module$src$purifier$$, $INVALID_INLINE_STYLE_REGEX$$module$src$purifier$$, $PURIFY_CONFIG$$module$src$purifier$$, $KEY_COUNTER$$module$src$purifier$$;
_.$DomPurify$$module$src$purifier$$ = $createDOMPurify$$module$dompurify$dist$purify_es$$()(window.self);
_.$BLACKLISTED_TAGS$$module$src$purifier$$ = {applet:!0, audio:!0, base:!0, embed:!0, frame:!0, frameset:!0, iframe:!0, img:!0, link:!0, meta:!0, object:!0, style:!0, video:!0};
_.$TRIPLE_MUSTACHE_WHITELISTED_TAGS$$module$src$purifier$$ = "a b br caption colgroup code del div em i ins li mark ol p q s small span strong sub sup table tbody time td th thead tfoot tr u ul".split(" ");
_.$WHITELISTED_ATTRS$$module$src$purifier$$ = "amp-fx fallback heights layout min-font-size max-font-size on option placeholder submitting submit-success submit-error validation-for verify-error visible-when-invalid href style text subscriptions-action subscriptions-actions subscriptions-decorate subscriptions-dialog subscriptions-display subscriptions-section subscriptions-service".split(" ");
_.$WHITELISTED_ATTRS_BY_TAGS$$module$src$purifier$$ = {a:["rel", "target"], div:["template"], form:["action-xhr", "verify-xhr", "custom-validation-reporting", "target"], template:["type"]};
$WHITELISTED_TAGS_BY_ATTRS$$module$src$purifier$$ = {script:{attribute:"type", values:["application/json", "application/ld+json"]}};
_.$WHITELISTED_TARGETS$$module$src$purifier$$ = ["_top", "_blank"];
$BLACKLISTED_ATTR_VALUES$$module$src$purifier$$ = ["javascript:", "vbscript:", "data:", "<script", "\x3c/script"];
$BLACKLISTED_TAG_SPECIFIC_ATTR_VALUES$$module$src$purifier$$ = _.$dict$$module$src$utils$object$$({input:{type:/(?:image|button)/i}});
$BLACKLISTED_FIELDS_ATTR$$module$src$purifier$$ = "form formaction formmethod formtarget formnovalidate formenctype".split(" ");
$BLACKLISTED_TAG_SPECIFIC_ATTRS$$module$src$purifier$$ = _.$dict$$module$src$utils$object$$({input:$BLACKLISTED_FIELDS_ATTR$$module$src$purifier$$, textarea:$BLACKLISTED_FIELDS_ATTR$$module$src$purifier$$, select:$BLACKLISTED_FIELDS_ATTR$$module$src$purifier$$});
$INVALID_INLINE_STYLE_REGEX$$module$src$purifier$$ = /!important|position\s*:\s*fixed|position\s*:\s*sticky/i;
$PURIFY_CONFIG$$module$src$purifier$$ = {USE_PROFILES:{html:!0, svg:!0, svgFilters:!0}};
$KEY_COUNTER$$module$src$purifier$$ = 0;
_.$JSCompiler_prototypeAlias$$ = $Gestures$$module$src$gesture$$.prototype;
_.$JSCompiler_prototypeAlias$$.$cleanup$ = function() {
  this.$element_$.removeEventListener("touchstart", this.$W$);
  this.$element_$.removeEventListener("touchend", this.$U$);
  this.$element_$.removeEventListener("touchmove", this.$V$);
  this.$element_$.removeEventListener("touchcancel", this.$R$);
  delete this.$element_$.__AMP_Gestures;
  this.$P$.cancel();
};
_.$JSCompiler_prototypeAlias$$.$Gestures$$module$src$gesture_prototype$onTouchStart_$ = function($event$jscomp$40$$) {
  var $now$jscomp$15$$ = Date.now();
  this.$K$ = !1;
  this.$Y$.$fire$($event$jscomp$40$$);
  for (var $i$jscomp$154$$ = 0; $i$jscomp$154$$ < this.$D$.length; $i$jscomp$154$$++) {
    if (!this.$ready_$[$i$jscomp$154$$] && (this.$F$[$i$jscomp$154$$] && this.$F$[$i$jscomp$154$$] < $now$jscomp$15$$ && $JSCompiler_StaticMethods_Gestures$$module$src$gesture_prototype$stopTracking_$$(this, $i$jscomp$154$$), this.$D$[$i$jscomp$154$$].$GestureRecognizer$$module$src$gesture_prototype$onTouchStart$($event$jscomp$40$$))) {
      var $index$jscomp$inline_2019$$ = $i$jscomp$154$$;
      this.$I$[$index$jscomp$inline_2019$$] = !0;
      this.$F$[$index$jscomp$inline_2019$$] = 0;
    }
  }
  $JSCompiler_StaticMethods_afterEvent_$$(this, $event$jscomp$40$$);
};
_.$JSCompiler_prototypeAlias$$.$Gestures$$module$src$gesture_prototype$onTouchMove_$ = function($event$jscomp$41$$) {
  for (var $now$jscomp$16$$ = Date.now(), $i$jscomp$155$$ = 0; $i$jscomp$155$$ < this.$D$.length; $i$jscomp$155$$++) {
    this.$I$[$i$jscomp$155$$] && (this.$F$[$i$jscomp$155$$] && this.$F$[$i$jscomp$155$$] < $now$jscomp$16$$ ? $JSCompiler_StaticMethods_Gestures$$module$src$gesture_prototype$stopTracking_$$(this, $i$jscomp$155$$) : this.$D$[$i$jscomp$155$$].$GestureRecognizer$$module$src$gesture_prototype$onTouchMove$($event$jscomp$41$$) || $JSCompiler_StaticMethods_Gestures$$module$src$gesture_prototype$stopTracking_$$(this, $i$jscomp$155$$));
  }
  $JSCompiler_StaticMethods_afterEvent_$$(this, $event$jscomp$41$$);
};
_.$JSCompiler_prototypeAlias$$.$Gestures$$module$src$gesture_prototype$onTouchEnd_$ = function($event$jscomp$42$$) {
  for (var $now$jscomp$17$$ = Date.now(), $i$jscomp$156$$ = 0; $i$jscomp$156$$ < this.$D$.length; $i$jscomp$156$$++) {
    if (this.$I$[$i$jscomp$156$$]) {
      if (this.$F$[$i$jscomp$156$$] && this.$F$[$i$jscomp$156$$] < $now$jscomp$17$$) {
        $JSCompiler_StaticMethods_Gestures$$module$src$gesture_prototype$stopTracking_$$(this, $i$jscomp$156$$);
      } else {
        this.$D$[$i$jscomp$156$$].$GestureRecognizer$$module$src$gesture_prototype$onTouchEnd$($event$jscomp$42$$);
        var $isReady$$ = !this.$F$[$i$jscomp$156$$], $isExpired$$ = this.$F$[$i$jscomp$156$$] < $now$jscomp$17$$;
        this.$G$ != this.$D$[$i$jscomp$156$$] && ($isReady$$ || $isExpired$$) && $JSCompiler_StaticMethods_Gestures$$module$src$gesture_prototype$stopTracking_$$(this, $i$jscomp$156$$);
      }
    }
  }
  $JSCompiler_StaticMethods_afterEvent_$$(this, $event$jscomp$42$$);
};
_.$JSCompiler_prototypeAlias$$.$Gestures$$module$src$gesture_prototype$onTouchCancel_$ = function($event$jscomp$43$$) {
  for (var $i$jscomp$157$$ = 0; $i$jscomp$157$$ < this.$D$.length; $i$jscomp$157$$++) {
    var $index$jscomp$inline_5904$$ = $i$jscomp$157$$;
    this.$ready_$[$index$jscomp$inline_5904$$] = 0;
    $JSCompiler_StaticMethods_Gestures$$module$src$gesture_prototype$stopTracking_$$(this, $index$jscomp$inline_5904$$);
  }
  $JSCompiler_StaticMethods_afterEvent_$$(this, $event$jscomp$43$$);
};
_.$JSCompiler_prototypeAlias$$.$doPass_$ = function() {
  for (var $index$jscomp$inline_2022_now$jscomp$21$$ = Date.now(), $readyIndex_recognizer$jscomp$inline_2023$$ = -1, $i$jscomp$161_i$jscomp$inline_2024_waitTime$$ = 0; $i$jscomp$161_i$jscomp$inline_2024_waitTime$$ < this.$D$.length; $i$jscomp$161_i$jscomp$inline_2024_waitTime$$++) {
    if (!this.$ready_$[$i$jscomp$161_i$jscomp$inline_2024_waitTime$$]) {
      this.$F$[$i$jscomp$161_i$jscomp$inline_2024_waitTime$$] && this.$F$[$i$jscomp$161_i$jscomp$inline_2024_waitTime$$] < $index$jscomp$inline_2022_now$jscomp$21$$ && $JSCompiler_StaticMethods_Gestures$$module$src$gesture_prototype$stopTracking_$$(this, $i$jscomp$161_i$jscomp$inline_2024_waitTime$$);
    } else {
      if (-1 == $readyIndex_recognizer$jscomp$inline_2023$$ || this.$ready_$[$i$jscomp$161_i$jscomp$inline_2024_waitTime$$] > this.$ready_$[$readyIndex_recognizer$jscomp$inline_2023$$]) {
        $readyIndex_recognizer$jscomp$inline_2023$$ = $i$jscomp$161_i$jscomp$inline_2024_waitTime$$;
      }
    }
  }
  if (-1 != $readyIndex_recognizer$jscomp$inline_2023$$) {
    for (var $i$196_index$jscomp$inline_5907$$ = $i$jscomp$161_i$jscomp$inline_2024_waitTime$$ = 0; $i$196_index$jscomp$inline_5907$$ < this.$D$.length; $i$196_index$jscomp$inline_5907$$++) {
      !this.$ready_$[$i$196_index$jscomp$inline_5907$$] && this.$I$[$i$196_index$jscomp$inline_5907$$] && ($i$jscomp$161_i$jscomp$inline_2024_waitTime$$ = Math.max($i$jscomp$161_i$jscomp$inline_2024_waitTime$$, this.$F$[$i$196_index$jscomp$inline_5907$$] - $index$jscomp$inline_2022_now$jscomp$21$$));
    }
    if (2 > $i$jscomp$161_i$jscomp$inline_2024_waitTime$$) {
      $index$jscomp$inline_2022_now$jscomp$21$$ = $readyIndex_recognizer$jscomp$inline_2023$$;
      $readyIndex_recognizer$jscomp$inline_2023$$ = this.$D$[$index$jscomp$inline_2022_now$jscomp$21$$];
      for ($i$jscomp$161_i$jscomp$inline_2024_waitTime$$ = 0; $i$jscomp$161_i$jscomp$inline_2024_waitTime$$ < this.$D$.length; $i$jscomp$161_i$jscomp$inline_2024_waitTime$$++) {
        $i$jscomp$161_i$jscomp$inline_2024_waitTime$$ != $index$jscomp$inline_2022_now$jscomp$21$$ && ($i$196_index$jscomp$inline_5907$$ = $i$jscomp$161_i$jscomp$inline_2024_waitTime$$, this.$ready_$[$i$196_index$jscomp$inline_5907$$] = 0, $JSCompiler_StaticMethods_Gestures$$module$src$gesture_prototype$stopTracking_$$(this, $i$196_index$jscomp$inline_5907$$));
      }
      this.$ready_$[$index$jscomp$inline_2022_now$jscomp$21$$] = 0;
      this.$F$[$index$jscomp$inline_2022_now$jscomp$21$$] = 0;
      this.$G$ = $readyIndex_recognizer$jscomp$inline_2023$$;
      $readyIndex_recognizer$jscomp$inline_2023$$.$acceptStart$();
    } else {
      _.$JSCompiler_StaticMethods_schedule$$(this.$P$, $i$jscomp$161_i$jscomp$inline_2024_waitTime$$);
    }
  }
};
_.$JSCompiler_prototypeAlias$$ = $GestureRecognizer$$module$src$gesture$$.prototype;
_.$JSCompiler_prototypeAlias$$.$getType$ = function() {
  return this.$type_$;
};
_.$JSCompiler_prototypeAlias$$.$acceptStart$ = function() {
};
_.$JSCompiler_prototypeAlias$$.$acceptCancel$ = function() {
};
_.$JSCompiler_prototypeAlias$$.$GestureRecognizer$$module$src$gesture_prototype$onTouchStart$ = function() {
  return !1;
};
_.$JSCompiler_prototypeAlias$$.$GestureRecognizer$$module$src$gesture_prototype$onTouchMove$ = function() {
  return !1;
};
_.$JSCompiler_prototypeAlias$$.$GestureRecognizer$$module$src$gesture_prototype$onTouchEnd$ = function() {
};
var $EXP_FRAME_CONST_$$module$src$motion$$ = Math.round(-16.67 / Math.log(0.95));
_.$JSCompiler_prototypeAlias$$ = $Motion$$module$src$motion$$.prototype;
_.$JSCompiler_prototypeAlias$$.start = function() {
  this.$G$ = !0;
  if (0.02 >= Math.abs(this.$O$) && 0.02 >= Math.abs(this.$P$)) {
    this.$K$(this.$D$, this.$F$), this.$completeContinue_$(!0);
  } else {
    this.$I$ = this.$O$;
    this.$J$ = this.$P$;
    var $boundStep$jscomp$inline_2036$$ = this.$stepContinue_$.bind(this), $boundComplete$jscomp$inline_2037$$ = this.$completeContinue_$.bind(this, !0);
    $JSCompiler_StaticMethods_runAnimMutateSeries$$(this.$vsync_$, this.$U$, $boundStep$jscomp$inline_2036$$).then($boundComplete$jscomp$inline_2037$$, $boundComplete$jscomp$inline_2037$$);
  }
  return this;
};
_.$JSCompiler_prototypeAlias$$.$halt$ = function() {
  this.$G$ && this.$completeContinue_$(!1);
};
_.$JSCompiler_prototypeAlias$$.then = function($opt_resolve$jscomp$2$$, $opt_reject$jscomp$2$$) {
  return $opt_resolve$jscomp$2$$ || $opt_reject$jscomp$2$$ ? this.$R$.then($opt_resolve$jscomp$2$$, $opt_reject$jscomp$2$$) : this.$R$;
};
_.$JSCompiler_prototypeAlias$$.$stepContinue_$ = function($decel_timeSinceStart$jscomp$1$$, $timeSincePrev$$) {
  if (!this.$G$) {
    return !1;
  }
  this.$D$ += $timeSincePrev$$ * this.$I$;
  this.$F$ += $timeSincePrev$$ * this.$J$;
  if (!this.$K$(this.$D$, this.$F$)) {
    return !1;
  }
  $decel_timeSinceStart$jscomp$1$$ = Math.exp(-$decel_timeSinceStart$jscomp$1$$ / $EXP_FRAME_CONST_$$module$src$motion$$);
  this.$I$ = this.$O$ * $decel_timeSinceStart$jscomp$1$$;
  this.$J$ = this.$P$ * $decel_timeSinceStart$jscomp$1$$;
  return 0.02 < Math.abs(this.$I$) || 0.02 < Math.abs(this.$J$);
};
_.$JSCompiler_prototypeAlias$$.$completeContinue_$ = function($success$jscomp$7$$) {
  this.$G$ && (this.$G$ = !1, this.$K$(this.$D$, this.$F$), $success$jscomp$7$$ ? this.$W$() : this.$V$());
};
_.$$jscomp$inherits$$(_.$TapRecognizer$$module$src$gesture_recognizers$$, $GestureRecognizer$$module$src$gesture$$);
_.$TapRecognizer$$module$src$gesture_recognizers$$.prototype.$GestureRecognizer$$module$src$gesture_prototype$onTouchStart$ = function($e$jscomp$101$$) {
  var $touches$jscomp$2$$ = $e$jscomp$101$$.touches;
  this.$target_$ = $e$jscomp$101$$.target;
  return $touches$jscomp$2$$ && 1 == $touches$jscomp$2$$.length ? (this.$startX_$ = $touches$jscomp$2$$[0].clientX, this.$startY_$ = $touches$jscomp$2$$[0].clientY, !0) : !1;
};
_.$TapRecognizer$$module$src$gesture_recognizers$$.prototype.$GestureRecognizer$$module$src$gesture_prototype$onTouchMove$ = function($dy$jscomp$7_e$jscomp$102_touches$jscomp$3$$) {
  return ($dy$jscomp$7_e$jscomp$102_touches$jscomp$3$$ = $dy$jscomp$7_e$jscomp$102_touches$jscomp$3$$.changedTouches || $dy$jscomp$7_e$jscomp$102_touches$jscomp$3$$.touches) && 1 == $dy$jscomp$7_e$jscomp$102_touches$jscomp$3$$.length && (this.$D$ = $dy$jscomp$7_e$jscomp$102_touches$jscomp$3$$[0].clientX, this.$F$ = $dy$jscomp$7_e$jscomp$102_touches$jscomp$3$$[0].clientY, $dy$jscomp$7_e$jscomp$102_touches$jscomp$3$$ = 8 <= Math.abs(this.$F$ - this.$startY_$), 8 <= Math.abs(this.$D$ - this.$startX_$) || 
  $dy$jscomp$7_e$jscomp$102_touches$jscomp$3$$) ? !1 : !0;
};
_.$TapRecognizer$$module$src$gesture_recognizers$$.prototype.$GestureRecognizer$$module$src$gesture_prototype$onTouchEnd$ = function() {
  $JSCompiler_StaticMethods_signalReady$$(this, 0);
};
_.$TapRecognizer$$module$src$gesture_recognizers$$.prototype.$acceptStart$ = function() {
  $JSCompiler_StaticMethods_signalEmit_$$(this.$manager_$, this, {clientX:this.$D$, clientY:this.$F$, target:this.$target_$}, null);
  $JSCompiler_StaticMethods_signalEnd$$(this);
};
_.$$jscomp$inherits$$(_.$DoubletapRecognizer$$module$src$gesture_recognizers$$, $GestureRecognizer$$module$src$gesture$$);
_.$JSCompiler_prototypeAlias$$ = _.$DoubletapRecognizer$$module$src$gesture_recognizers$$.prototype;
_.$JSCompiler_prototypeAlias$$.$GestureRecognizer$$module$src$gesture_prototype$onTouchStart$ = function($e$jscomp$103_touches$jscomp$4$$) {
  return 1 < this.$D$ ? !1 : ($e$jscomp$103_touches$jscomp$4$$ = $e$jscomp$103_touches$jscomp$4$$.touches) && 1 == $e$jscomp$103_touches$jscomp$4$$.length ? (this.$startX_$ = $e$jscomp$103_touches$jscomp$4$$[0].clientX, this.$startY_$ = $e$jscomp$103_touches$jscomp$4$$[0].clientY, this.$F$ = $e$jscomp$103_touches$jscomp$4$$[0].clientX, this.$G$ = $e$jscomp$103_touches$jscomp$4$$[0].clientY, !0) : !1;
};
_.$JSCompiler_prototypeAlias$$.$GestureRecognizer$$module$src$gesture_prototype$onTouchMove$ = function($dy$jscomp$8_e$jscomp$104_touches$jscomp$5$$) {
  return ($dy$jscomp$8_e$jscomp$104_touches$jscomp$5$$ = $dy$jscomp$8_e$jscomp$104_touches$jscomp$5$$.touches) && 1 == $dy$jscomp$8_e$jscomp$104_touches$jscomp$5$$.length ? (this.$F$ = $dy$jscomp$8_e$jscomp$104_touches$jscomp$5$$[0].clientX, this.$G$ = $dy$jscomp$8_e$jscomp$104_touches$jscomp$5$$[0].clientY, $dy$jscomp$8_e$jscomp$104_touches$jscomp$5$$ = 8 <= Math.abs(this.$G$ - this.$startY_$), 8 <= Math.abs(this.$F$ - this.$startX_$) || $dy$jscomp$8_e$jscomp$104_touches$jscomp$5$$ ? (this.$acceptCancel$(), 
  !1) : !0) : !1;
};
_.$JSCompiler_prototypeAlias$$.$GestureRecognizer$$module$src$gesture_prototype$onTouchEnd$ = function($e$jscomp$105$$) {
  this.$D$++;
  2 > this.$D$ ? $JSCompiler_StaticMethods_signalPending_$$(this.$manager_$, this, 200) : (this.$I$ = $e$jscomp$105$$, $JSCompiler_StaticMethods_signalReady$$(this, 0));
};
_.$JSCompiler_prototypeAlias$$.$acceptStart$ = function() {
  this.$D$ = 0;
  $JSCompiler_StaticMethods_signalEmit_$$(this.$manager_$, this, {clientX:this.$F$, clientY:this.$G$}, this.$I$);
  $JSCompiler_StaticMethods_signalEnd$$(this);
};
_.$JSCompiler_prototypeAlias$$.$acceptCancel$ = function() {
  this.$D$ = 0;
};
_.$$jscomp$inherits$$(_.$SwipeRecognizer$$module$src$gesture_recognizers$$, $GestureRecognizer$$module$src$gesture$$);
_.$JSCompiler_prototypeAlias$$ = _.$SwipeRecognizer$$module$src$gesture_recognizers$$.prototype;
_.$JSCompiler_prototypeAlias$$.$GestureRecognizer$$module$src$gesture_prototype$onTouchStart$ = function($e$jscomp$106_touches$jscomp$6$$) {
  $e$jscomp$106_touches$jscomp$6$$ = $e$jscomp$106_touches$jscomp$6$$.touches;
  return this.$D$ && $e$jscomp$106_touches$jscomp$6$$ && 1 < $e$jscomp$106_touches$jscomp$6$$.length ? !0 : $e$jscomp$106_touches$jscomp$6$$ && 1 == $e$jscomp$106_touches$jscomp$6$$.length ? (this.$W$ = Date.now(), this.$startX_$ = $e$jscomp$106_touches$jscomp$6$$[0].clientX, this.$startY_$ = $e$jscomp$106_touches$jscomp$6$$[0].clientY, !0) : !1;
};
_.$JSCompiler_prototypeAlias$$.$GestureRecognizer$$module$src$gesture_prototype$onTouchMove$ = function($dx$jscomp$7_e$jscomp$107$$) {
  var $dy$jscomp$9_touches$jscomp$7_x$jscomp$83$$ = $dx$jscomp$7_e$jscomp$107$$.touches;
  if ($dy$jscomp$9_touches$jscomp$7_x$jscomp$83$$ && 1 <= $dy$jscomp$9_touches$jscomp$7_x$jscomp$83$$.length) {
    var $$jscomp$destructuring$var209_y$jscomp$63$$ = $dy$jscomp$9_touches$jscomp$7_x$jscomp$83$$[0];
    $dy$jscomp$9_touches$jscomp$7_x$jscomp$83$$ = $$jscomp$destructuring$var209_y$jscomp$63$$.clientX;
    $$jscomp$destructuring$var209_y$jscomp$63$$ = $$jscomp$destructuring$var209_y$jscomp$63$$.clientY;
    this.$F$ = $dy$jscomp$9_touches$jscomp$7_x$jscomp$83$$;
    this.$G$ = $$jscomp$destructuring$var209_y$jscomp$63$$;
    if (this.$D$) {
      $JSCompiler_StaticMethods_SwipeRecognizer$$module$src$gesture_recognizers_prototype$emit_$$(this, !1, !1, $dx$jscomp$7_e$jscomp$107$$);
    } else {
      if ($dx$jscomp$7_e$jscomp$107$$ = Math.abs($dy$jscomp$9_touches$jscomp$7_x$jscomp$83$$ - this.$startX_$), $dy$jscomp$9_touches$jscomp$7_x$jscomp$83$$ = Math.abs($$jscomp$destructuring$var209_y$jscomp$63$$ - this.$startY_$), this.$O$ && this.$P$) {
        (8 <= $dx$jscomp$7_e$jscomp$107$$ || 8 <= $dy$jscomp$9_touches$jscomp$7_x$jscomp$83$$) && $JSCompiler_StaticMethods_signalReady$$(this, -10);
      } else {
        if (this.$O$) {
          if (8 <= $dx$jscomp$7_e$jscomp$107$$ && $dx$jscomp$7_e$jscomp$107$$ > $dy$jscomp$9_touches$jscomp$7_x$jscomp$83$$) {
            $JSCompiler_StaticMethods_signalReady$$(this, -10);
          } else {
            if (8 <= $dy$jscomp$9_touches$jscomp$7_x$jscomp$83$$) {
              return !1;
            }
          }
        } else {
          if (this.$P$) {
            if (8 <= $dy$jscomp$9_touches$jscomp$7_x$jscomp$83$$ && $dy$jscomp$9_touches$jscomp$7_x$jscomp$83$$ > $dx$jscomp$7_e$jscomp$107$$) {
              $JSCompiler_StaticMethods_signalReady$$(this, -10);
            } else {
              if (8 <= $dx$jscomp$7_e$jscomp$107$$) {
                return !1;
              }
            }
          } else {
            return !1;
          }
        }
      }
    }
    return !0;
  }
  return !1;
};
_.$JSCompiler_prototypeAlias$$.$GestureRecognizer$$module$src$gesture_prototype$onTouchEnd$ = function($e$jscomp$108$$) {
  var $touches$jscomp$8$$ = $e$jscomp$108$$.touches;
  $touches$jscomp$8$$ && 0 == $touches$jscomp$8$$.length && this.$D$ && (this.$D$ = !1, $JSCompiler_StaticMethods_SwipeRecognizer$$module$src$gesture_recognizers_prototype$emit_$$(this, !1, !0, $e$jscomp$108$$), $JSCompiler_StaticMethods_signalEnd$$(this));
};
_.$JSCompiler_prototypeAlias$$.$acceptStart$ = function() {
  this.$D$ = !0;
  this.$U$ = this.$startX_$;
  this.$V$ = this.$startY_$;
  this.$R$ = this.$W$;
  this.$startX_$ = this.$F$;
  this.$startY_$ = this.$G$;
  $JSCompiler_StaticMethods_SwipeRecognizer$$module$src$gesture_recognizers_prototype$emit_$$(this, !0, !1, null);
};
_.$JSCompiler_prototypeAlias$$.$acceptCancel$ = function() {
  this.$D$ = !1;
};
_.$$jscomp$inherits$$(_.$SwipeXYRecognizer$$module$src$gesture_recognizers$$, _.$SwipeRecognizer$$module$src$gesture_recognizers$$);
_.$$jscomp$inherits$$(_.$TapzoomRecognizer$$module$src$gesture_recognizers$$, $GestureRecognizer$$module$src$gesture$$);
_.$JSCompiler_prototypeAlias$$ = _.$TapzoomRecognizer$$module$src$gesture_recognizers$$.prototype;
_.$JSCompiler_prototypeAlias$$.$GestureRecognizer$$module$src$gesture_prototype$onTouchStart$ = function($e$jscomp$109_touches$jscomp$9$$) {
  return this.$D$ ? !1 : ($e$jscomp$109_touches$jscomp$9$$ = $e$jscomp$109_touches$jscomp$9$$.touches) && 1 == $e$jscomp$109_touches$jscomp$9$$.length ? (this.$startX_$ = $e$jscomp$109_touches$jscomp$9$$[0].clientX, this.$startY_$ = $e$jscomp$109_touches$jscomp$9$$[0].clientY, !0) : !1;
};
_.$JSCompiler_prototypeAlias$$.$GestureRecognizer$$module$src$gesture_prototype$onTouchMove$ = function($dy$jscomp$10_e$jscomp$110$$) {
  var $touches$jscomp$10$$ = $dy$jscomp$10_e$jscomp$110$$.touches;
  if ($touches$jscomp$10$$ && 1 == $touches$jscomp$10$$.length) {
    this.$G$ = $touches$jscomp$10$$[0].clientX;
    this.$I$ = $touches$jscomp$10$$[0].clientY;
    if (this.$D$) {
      $JSCompiler_StaticMethods_TapzoomRecognizer$$module$src$gesture_recognizers_prototype$emit_$$(this, !1, !1, $dy$jscomp$10_e$jscomp$110$$);
    } else {
      if ($dy$jscomp$10_e$jscomp$110$$ = 8 <= Math.abs(this.$I$ - this.$startY_$), 8 <= Math.abs(this.$G$ - this.$startX_$) || $dy$jscomp$10_e$jscomp$110$$) {
        if (0 == this.$J$) {
          return this.$acceptCancel$(), !1;
        }
        $JSCompiler_StaticMethods_signalReady$$(this, 0);
      }
    }
    return !0;
  }
  return !1;
};
_.$JSCompiler_prototypeAlias$$.$GestureRecognizer$$module$src$gesture_prototype$onTouchEnd$ = function($e$jscomp$111$$) {
  this.$D$ ? this.$D$ && (this.$D$ = !1, $JSCompiler_StaticMethods_TapzoomRecognizer$$module$src$gesture_recognizers_prototype$emit_$$(this, !1, !0, $e$jscomp$111$$), $JSCompiler_StaticMethods_signalEnd$$(this)) : (this.$J$++, 1 == this.$J$ ? $JSCompiler_StaticMethods_signalPending_$$(this.$manager_$, this, 400) : this.$acceptCancel$());
};
_.$JSCompiler_prototypeAlias$$.$acceptStart$ = function() {
  this.$J$ = 0;
  this.$D$ = !0;
  $JSCompiler_StaticMethods_TapzoomRecognizer$$module$src$gesture_recognizers_prototype$emit_$$(this, !0, !1, null);
};
_.$JSCompiler_prototypeAlias$$.$acceptCancel$ = function() {
  this.$J$ = 0;
  this.$D$ = !1;
};
_.$$jscomp$inherits$$(_.$PinchRecognizer$$module$src$gesture_recognizers$$, $GestureRecognizer$$module$src$gesture$$);
_.$JSCompiler_prototypeAlias$$ = _.$PinchRecognizer$$module$src$gesture_recognizers$$.prototype;
_.$JSCompiler_prototypeAlias$$.$GestureRecognizer$$module$src$gesture_prototype$onTouchStart$ = function($e$jscomp$112_touches$jscomp$11$$) {
  $e$jscomp$112_touches$jscomp$11$$ = $e$jscomp$112_touches$jscomp$11$$.touches;
  return $e$jscomp$112_touches$jscomp$11$$ ? 1 == $e$jscomp$112_touches$jscomp$11$$.length || this.$D$ && 2 < $e$jscomp$112_touches$jscomp$11$$.length ? !0 : 2 == $e$jscomp$112_touches$jscomp$11$$.length ? (this.$ea$ = Date.now(), this.$I$ = $e$jscomp$112_touches$jscomp$11$$[0].clientX, this.$K$ = $e$jscomp$112_touches$jscomp$11$$[0].clientY, this.$J$ = $e$jscomp$112_touches$jscomp$11$$[1].clientX, this.$O$ = $e$jscomp$112_touches$jscomp$11$$[1].clientY, !0) : !1 : !1;
};
_.$JSCompiler_prototypeAlias$$.$GestureRecognizer$$module$src$gesture_prototype$onTouchMove$ = function($dx1$jscomp$inline_2068_dx1$jscomp$inline_2076_e$jscomp$113$$) {
  var $dy1$jscomp$inline_2069_dy1$jscomp$inline_2077_touches$jscomp$12$$ = $dx1$jscomp$inline_2068_dx1$jscomp$inline_2076_e$jscomp$113$$.touches;
  if (!$dy1$jscomp$inline_2069_dy1$jscomp$inline_2077_touches$jscomp$12$$ || 0 == $dy1$jscomp$inline_2069_dy1$jscomp$inline_2077_touches$jscomp$12$$.length) {
    return !1;
  }
  if (1 == $dy1$jscomp$inline_2069_dy1$jscomp$inline_2077_touches$jscomp$12$$.length) {
    return !0;
  }
  this.$P$ = $dy1$jscomp$inline_2069_dy1$jscomp$inline_2077_touches$jscomp$12$$[0].clientX;
  this.$U$ = $dy1$jscomp$inline_2069_dy1$jscomp$inline_2077_touches$jscomp$12$$[0].clientY;
  this.$R$ = $dy1$jscomp$inline_2069_dy1$jscomp$inline_2077_touches$jscomp$12$$[1].clientX;
  this.$V$ = $dy1$jscomp$inline_2069_dy1$jscomp$inline_2077_touches$jscomp$12$$[1].clientY;
  if (this.$D$) {
    return $JSCompiler_StaticMethods_PinchRecognizer$$module$src$gesture_recognizers_prototype$emit_$$(this, !1, !1, $dx1$jscomp$inline_2068_dx1$jscomp$inline_2076_e$jscomp$113$$), !0;
  }
  $dx1$jscomp$inline_2068_dx1$jscomp$inline_2076_e$jscomp$113$$ = this.$P$ - this.$I$;
  $dy1$jscomp$inline_2069_dy1$jscomp$inline_2077_touches$jscomp$12$$ = this.$U$ - this.$K$;
  var $dx2$jscomp$inline_2070_dx2$jscomp$inline_2078$$ = this.$R$ - this.$J$, $dy2$jscomp$inline_2071_dy2$jscomp$inline_2079$$ = this.$V$ - this.$O$, $xPinchRecognized$jscomp$inline_2080_xPinchRejected$jscomp$inline_2072$$ = 10 <= Math.abs($dx1$jscomp$inline_2068_dx1$jscomp$inline_2076_e$jscomp$113$$ + $dx2$jscomp$inline_2070_dx2$jscomp$inline_2078$$), $yPinchRecognized$jscomp$inline_2081_yPinchRejected$jscomp$inline_2073$$ = 10 <= Math.abs($dy1$jscomp$inline_2069_dy1$jscomp$inline_2077_touches$jscomp$12$$ + 
  $dy2$jscomp$inline_2071_dy2$jscomp$inline_2079$$);
  if ((0 < $dx1$jscomp$inline_2068_dx1$jscomp$inline_2076_e$jscomp$113$$ * $dx2$jscomp$inline_2070_dx2$jscomp$inline_2078$$ || 0 < $dy1$jscomp$inline_2069_dy1$jscomp$inline_2077_touches$jscomp$12$$ * $dy2$jscomp$inline_2071_dy2$jscomp$inline_2079$$) && ($xPinchRecognized$jscomp$inline_2080_xPinchRejected$jscomp$inline_2072$$ || $yPinchRecognized$jscomp$inline_2081_yPinchRejected$jscomp$inline_2073$$)) {
    return !1;
  }
  $dx1$jscomp$inline_2068_dx1$jscomp$inline_2076_e$jscomp$113$$ = this.$P$ - this.$I$;
  $dy1$jscomp$inline_2069_dy1$jscomp$inline_2077_touches$jscomp$12$$ = this.$U$ - this.$K$;
  $dx2$jscomp$inline_2070_dx2$jscomp$inline_2078$$ = this.$R$ - this.$J$;
  $dy2$jscomp$inline_2071_dy2$jscomp$inline_2079$$ = this.$V$ - this.$O$;
  $xPinchRecognized$jscomp$inline_2080_xPinchRejected$jscomp$inline_2072$$ = 4 <= Math.abs($dx1$jscomp$inline_2068_dx1$jscomp$inline_2076_e$jscomp$113$$ - $dx2$jscomp$inline_2070_dx2$jscomp$inline_2078$$);
  $yPinchRecognized$jscomp$inline_2081_yPinchRejected$jscomp$inline_2073$$ = 4 <= Math.abs($dy1$jscomp$inline_2069_dy1$jscomp$inline_2077_touches$jscomp$12$$ - $dy2$jscomp$inline_2071_dy2$jscomp$inline_2079$$);
  0 >= $dx1$jscomp$inline_2068_dx1$jscomp$inline_2076_e$jscomp$113$$ * $dx2$jscomp$inline_2070_dx2$jscomp$inline_2078$$ && 0 >= $dy1$jscomp$inline_2069_dy1$jscomp$inline_2077_touches$jscomp$12$$ * $dy2$jscomp$inline_2071_dy2$jscomp$inline_2079$$ && ($xPinchRecognized$jscomp$inline_2080_xPinchRejected$jscomp$inline_2072$$ || $yPinchRecognized$jscomp$inline_2081_yPinchRejected$jscomp$inline_2073$$) && $JSCompiler_StaticMethods_signalReady$$(this, 0);
  return !0;
};
_.$JSCompiler_prototypeAlias$$.$GestureRecognizer$$module$src$gesture_prototype$onTouchEnd$ = function($e$jscomp$114$$) {
  var $touches$jscomp$13$$ = $e$jscomp$114$$.touches;
  $touches$jscomp$13$$ && 2 > $touches$jscomp$13$$.length && this.$D$ && (this.$D$ = !1, $JSCompiler_StaticMethods_PinchRecognizer$$module$src$gesture_recognizers_prototype$emit_$$(this, !1, !0, $e$jscomp$114$$), $JSCompiler_StaticMethods_signalEnd$$(this));
};
_.$JSCompiler_prototypeAlias$$.$acceptStart$ = function() {
  this.$D$ = !0;
  this.$Y$ = this.$ea$;
  this.$ba$ = this.$aa$ = 0;
  this.$fa$ = 0.5 * (this.$I$ + this.$J$);
  this.$ga$ = 0.5 * (this.$K$ + this.$O$);
  $JSCompiler_StaticMethods_PinchRecognizer$$module$src$gesture_recognizers_prototype$emit_$$(this, !0, !1, null);
};
_.$JSCompiler_prototypeAlias$$.$acceptCancel$ = function() {
  this.$D$ = !1;
};
var $$jscomp$compprop0$$;
$$jscomp$compprop0$$ = {};
_.$stateComparisonFunctions$$module$extensions$amp_story$1_0$amp_story_store_service$$ = ($$jscomp$compprop0$$.actionsWhitelist = function($old$jscomp$1$$, $curr$$) {
  return $old$jscomp$1$$.length !== $curr$$.length;
}, $$jscomp$compprop0$$);
/*
 mustache.js - Logic-less {{mustache}} templates with JavaScript
 http://github.com/janl/mustache.js
*/
_.$Mustache$$module$third_party$mustache$mustache$$ = {};
(function($mustache$$) {
  function $isFunction$$($mustache$$) {
    return "function" === typeof $mustache$$;
  }
  function $escapeRegExp$$($mustache$$) {
    return $mustache$$.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, "\\$&");
  }
  function $hasProperty$$($mustache$$, $isFunction$$) {
    return null != $mustache$$ && "object" === typeof $mustache$$ && Object.prototype.hasOwnProperty.call($mustache$$, $isFunction$$);
  }
  function $Scanner$$($mustache$$) {
    this.$tail$ = this.string = $mustache$$;
    this.$pos$ = 0;
  }
  function $Context$$($mustache$$, $isFunction$$) {
    this.view = $mustache$$;
    this.cache = {".":this.view};
    this.parent = $isFunction$$;
  }
  function $Writer$$() {
    this.cache = {};
  }
  var $objectToString$$ = Object.prototype.toString, $isArray$$ = Array.isArray || function($mustache$$) {
    return "[object Array]" === $objectToString$$.call($mustache$$);
  }, $regExpTest$$ = RegExp.prototype.test, $nonSpaceRe$$ = /\S/, $entityMap$$ = {"&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;", "/":"&#x2F;", "`":"&#x60;", "=":"&#x3D;"}, $whiteRe$$ = /\s*/, $spaceRe$$ = /\s+/, $equalsRe$$ = /\s*=/, $curlyRe$$ = /\s*\}/, $tagRe$$ = /#|\^|\/|>|\{|&|=|!/;
  $Scanner$$.prototype.$eos$ = function() {
    return "" === this.$tail$;
  };
  $Scanner$$.prototype.$scan$ = function($mustache$$) {
    $mustache$$ = this.$tail$.match($mustache$$);
    if (!$mustache$$ || 0 !== $mustache$$.index) {
      return "";
    }
    $mustache$$ = $mustache$$[0];
    this.$tail$ = this.$tail$.substring($mustache$$.length);
    this.$pos$ += $mustache$$.length;
    return $mustache$$;
  };
  $Scanner$$.prototype.$scanUntil$ = function($mustache$$) {
    $mustache$$ = this.$tail$.search($mustache$$);
    switch($mustache$$) {
      case -1:
        var $isFunction$$ = this.$tail$;
        this.$tail$ = "";
        break;
      case 0:
        $isFunction$$ = "";
        break;
      default:
        $isFunction$$ = this.$tail$.substring(0, $mustache$$), this.$tail$ = this.$tail$.substring($mustache$$);
    }
    this.$pos$ += $isFunction$$.length;
    return $isFunction$$;
  };
  $Context$$.prototype.push = function($mustache$$) {
    return new $Context$$($mustache$$, this);
  };
  $Context$$.prototype.$lookup$ = function($mustache$$) {
    var $escapeRegExp$$ = this.cache;
    if ($escapeRegExp$$.hasOwnProperty($mustache$$)) {
      var $Scanner$$ = $escapeRegExp$$[$mustache$$];
    } else {
      for (var $Context$$ = this, $Writer$$, $objectToString$$, $isArray$$ = !1; $Context$$;) {
        if (0 < $mustache$$.indexOf(".")) {
          for ($Scanner$$ = $Context$$.view, $Writer$$ = $mustache$$.split("."), $objectToString$$ = 0; null != $Scanner$$ && $objectToString$$ < $Writer$$.length;) {
            if (!$hasProperty$$($Scanner$$, $Writer$$[$objectToString$$])) {
              $Scanner$$ = null;
              break;
            }
            $objectToString$$ === $Writer$$.length - 1 && ($isArray$$ = !0);
            $Scanner$$ = $Scanner$$[$Writer$$[$objectToString$$++]];
          }
        } else {
          $hasProperty$$($Context$$.view, $mustache$$) ? ($Scanner$$ = $Context$$.view[$mustache$$], $isArray$$ = !0) : $Scanner$$ = null;
        }
        if ($isArray$$) {
          break;
        }
        $Context$$ = $Context$$.parent;
      }
      $escapeRegExp$$[$mustache$$] = $Scanner$$;
    }
    $isFunction$$($Scanner$$) && ($Scanner$$ = $Scanner$$.call(this.view));
    return $Scanner$$;
  };
  $Writer$$.prototype.$clearCache$ = function() {
    this.cache = {};
  };
  $Writer$$.prototype.parse = function($isFunction$$, $hasProperty$$) {
    var $Context$$ = this.cache, $Writer$$ = $Context$$[$isFunction$$];
    if (null == $Writer$$) {
      if ($isFunction$$) {
        var $objectToString$$ = [];
        $Writer$$ = [];
        var $entityMap$$ = [], $template$jscomp$6$$ = !1, $collector$jscomp$inline_6843_openingTagRe$jscomp$inline_6717_section$jscomp$inline_6846_tags$jscomp$2$$ = !1;
        var $defaultWriter$$ = $hasProperty$$ || $mustache$$.$tags$;
        "string" === typeof $defaultWriter$$ && ($defaultWriter$$ = $defaultWriter$$.split($spaceRe$$, 2));
        if (!$isArray$$($defaultWriter$$) || 2 !== $defaultWriter$$.length) {
          throw Error("Invalid tags: " + $defaultWriter$$);
        }
        $hasProperty$$ = new RegExp($escapeRegExp$$($defaultWriter$$[0]) + "\\s*");
        var $closingTagRe$jscomp$inline_6718$$ = new RegExp("\\s*" + $escapeRegExp$$($defaultWriter$$[1]));
        $defaultWriter$$ = new RegExp("\\s*" + $escapeRegExp$$("}" + $defaultWriter$$[1]));
        for (var $scanner$jscomp$inline_6721$$ = new $Scanner$$($isFunction$$), $start$jscomp$inline_6722$$, $chr$jscomp$inline_6725_openSection$jscomp$inline_6727_type$jscomp$inline_6723$$, $value$jscomp$inline_6724$$, $i$jscomp$inline_6728_token$jscomp$inline_6726$$; !$scanner$jscomp$inline_6721$$.$eos$();) {
          $start$jscomp$inline_6722$$ = $scanner$jscomp$inline_6721$$.$pos$;
          if ($value$jscomp$inline_6724$$ = $scanner$jscomp$inline_6721$$.$scanUntil$($hasProperty$$)) {
            $i$jscomp$inline_6728_token$jscomp$inline_6726$$ = 0;
            for (var $valueLength$jscomp$inline_6729$$ = $value$jscomp$inline_6724$$.length; $i$jscomp$inline_6728_token$jscomp$inline_6726$$ < $valueLength$jscomp$inline_6729$$; ++$i$jscomp$inline_6728_token$jscomp$inline_6726$$) {
              if ($chr$jscomp$inline_6725_openSection$jscomp$inline_6727_type$jscomp$inline_6723$$ = $value$jscomp$inline_6724$$.charAt($i$jscomp$inline_6728_token$jscomp$inline_6726$$), $regExpTest$$.call($nonSpaceRe$$, $chr$jscomp$inline_6725_openSection$jscomp$inline_6727_type$jscomp$inline_6723$$) ? $collector$jscomp$inline_6843_openingTagRe$jscomp$inline_6717_section$jscomp$inline_6846_tags$jscomp$2$$ = !0 : $entityMap$$.push($Writer$$.length), $Writer$$.push(["text", $chr$jscomp$inline_6725_openSection$jscomp$inline_6727_type$jscomp$inline_6723$$, 
              $start$jscomp$inline_6722$$, $start$jscomp$inline_6722$$ + 1]), $start$jscomp$inline_6722$$ += 1, "\n" === $chr$jscomp$inline_6725_openSection$jscomp$inline_6727_type$jscomp$inline_6723$$) {
                if ($template$jscomp$6$$ && !$collector$jscomp$inline_6843_openingTagRe$jscomp$inline_6717_section$jscomp$inline_6846_tags$jscomp$2$$) {
                  for (; $entityMap$$.length;) {
                    delete $Writer$$[$entityMap$$.pop()];
                  }
                } else {
                  $entityMap$$ = [];
                }
                $collector$jscomp$inline_6843_openingTagRe$jscomp$inline_6717_section$jscomp$inline_6846_tags$jscomp$2$$ = $template$jscomp$6$$ = !1;
              }
            }
          }
          if (!$scanner$jscomp$inline_6721$$.$scan$($hasProperty$$)) {
            break;
          }
          $template$jscomp$6$$ = !0;
          $chr$jscomp$inline_6725_openSection$jscomp$inline_6727_type$jscomp$inline_6723$$ = $scanner$jscomp$inline_6721$$.$scan$($tagRe$$) || "name";
          $scanner$jscomp$inline_6721$$.$scan$($whiteRe$$);
          "=" === $chr$jscomp$inline_6725_openSection$jscomp$inline_6727_type$jscomp$inline_6723$$ ? ($value$jscomp$inline_6724$$ = $scanner$jscomp$inline_6721$$.$scanUntil$($equalsRe$$), $scanner$jscomp$inline_6721$$.$scan$($equalsRe$$), $scanner$jscomp$inline_6721$$.$scanUntil$($closingTagRe$jscomp$inline_6718$$)) : "{" === $chr$jscomp$inline_6725_openSection$jscomp$inline_6727_type$jscomp$inline_6723$$ ? ($value$jscomp$inline_6724$$ = $scanner$jscomp$inline_6721$$.$scanUntil$($defaultWriter$$), 
          $scanner$jscomp$inline_6721$$.$scan$($curlyRe$$), $scanner$jscomp$inline_6721$$.$scanUntil$($closingTagRe$jscomp$inline_6718$$), $chr$jscomp$inline_6725_openSection$jscomp$inline_6727_type$jscomp$inline_6723$$ = "&") : $value$jscomp$inline_6724$$ = $scanner$jscomp$inline_6721$$.$scanUntil$($closingTagRe$jscomp$inline_6718$$);
          if (!$scanner$jscomp$inline_6721$$.$scan$($closingTagRe$jscomp$inline_6718$$)) {
            throw Error("Unclosed tag at " + $scanner$jscomp$inline_6721$$.$pos$);
          }
          $i$jscomp$inline_6728_token$jscomp$inline_6726$$ = [$chr$jscomp$inline_6725_openSection$jscomp$inline_6727_type$jscomp$inline_6723$$, $value$jscomp$inline_6724$$, $start$jscomp$inline_6722$$, $scanner$jscomp$inline_6721$$.$pos$];
          $Writer$$.push($i$jscomp$inline_6728_token$jscomp$inline_6726$$);
          if ("#" === $chr$jscomp$inline_6725_openSection$jscomp$inline_6727_type$jscomp$inline_6723$$ || "^" === $chr$jscomp$inline_6725_openSection$jscomp$inline_6727_type$jscomp$inline_6723$$) {
            $objectToString$$.push($i$jscomp$inline_6728_token$jscomp$inline_6726$$);
          } else {
            if ("/" === $chr$jscomp$inline_6725_openSection$jscomp$inline_6727_type$jscomp$inline_6723$$) {
              $chr$jscomp$inline_6725_openSection$jscomp$inline_6727_type$jscomp$inline_6723$$ = $objectToString$$.pop();
              if (!$chr$jscomp$inline_6725_openSection$jscomp$inline_6727_type$jscomp$inline_6723$$) {
                throw Error('Unopened section "' + $value$jscomp$inline_6724$$ + '" at ' + $start$jscomp$inline_6722$$);
              }
              if ($chr$jscomp$inline_6725_openSection$jscomp$inline_6727_type$jscomp$inline_6723$$[1] !== $value$jscomp$inline_6724$$) {
                throw Error('Unclosed section "' + $chr$jscomp$inline_6725_openSection$jscomp$inline_6727_type$jscomp$inline_6723$$[1] + '" at ' + $start$jscomp$inline_6722$$);
              }
            } else {
              if ("name" === $chr$jscomp$inline_6725_openSection$jscomp$inline_6727_type$jscomp$inline_6723$$ || "{" === $chr$jscomp$inline_6725_openSection$jscomp$inline_6727_type$jscomp$inline_6723$$ || "&" === $chr$jscomp$inline_6725_openSection$jscomp$inline_6727_type$jscomp$inline_6723$$) {
                $collector$jscomp$inline_6843_openingTagRe$jscomp$inline_6717_section$jscomp$inline_6846_tags$jscomp$2$$ = !0;
              }
            }
          }
        }
        if ($chr$jscomp$inline_6725_openSection$jscomp$inline_6727_type$jscomp$inline_6723$$ = $objectToString$$.pop()) {
          throw Error('Unclosed section "' + $chr$jscomp$inline_6725_openSection$jscomp$inline_6727_type$jscomp$inline_6723$$[1] + '" at ' + $scanner$jscomp$inline_6721$$.$pos$);
        }
        $objectToString$$ = [];
        $template$jscomp$6$$ = 0;
        for ($collector$jscomp$inline_6843_openingTagRe$jscomp$inline_6717_section$jscomp$inline_6846_tags$jscomp$2$$ = $Writer$$.length; $template$jscomp$6$$ < $collector$jscomp$inline_6843_openingTagRe$jscomp$inline_6717_section$jscomp$inline_6846_tags$jscomp$2$$; ++$template$jscomp$6$$) {
          if ($entityMap$$ = $Writer$$[$template$jscomp$6$$]) {
            if ("text" === $entityMap$$[0] && $JSCompiler_inline_result$jscomp$6662_lastToken$jscomp$inline_6837_nestedTokens$jscomp$inline_6842$$ && "text" === $JSCompiler_inline_result$jscomp$6662_lastToken$jscomp$inline_6837_nestedTokens$jscomp$inline_6842$$[0]) {
              $JSCompiler_inline_result$jscomp$6662_lastToken$jscomp$inline_6837_nestedTokens$jscomp$inline_6842$$[1] += $entityMap$$[1], $JSCompiler_inline_result$jscomp$6662_lastToken$jscomp$inline_6837_nestedTokens$jscomp$inline_6842$$[3] = $entityMap$$[3];
            } else {
              $objectToString$$.push($entityMap$$);
              var $JSCompiler_inline_result$jscomp$6662_lastToken$jscomp$inline_6837_nestedTokens$jscomp$inline_6842$$ = $entityMap$$;
            }
          }
        }
        $hasProperty$$ = $JSCompiler_inline_result$jscomp$6662_lastToken$jscomp$inline_6837_nestedTokens$jscomp$inline_6842$$ = [];
        $Writer$$ = [];
        $template$jscomp$6$$ = 0;
        for ($collector$jscomp$inline_6843_openingTagRe$jscomp$inline_6717_section$jscomp$inline_6846_tags$jscomp$2$$ = $objectToString$$.length; $template$jscomp$6$$ < $collector$jscomp$inline_6843_openingTagRe$jscomp$inline_6717_section$jscomp$inline_6846_tags$jscomp$2$$; ++$template$jscomp$6$$) {
          switch($entityMap$$ = $objectToString$$[$template$jscomp$6$$], $entityMap$$[0]) {
            case "#":
            case "^":
              $hasProperty$$.push($entityMap$$);
              $Writer$$.push($entityMap$$);
              $hasProperty$$ = $entityMap$$[4] = [];
              break;
            case "/":
              $hasProperty$$ = $Writer$$.pop();
              $hasProperty$$[5] = $entityMap$$[2];
              $hasProperty$$ = 0 < $Writer$$.length ? $Writer$$[$Writer$$.length - 1][4] : $JSCompiler_inline_result$jscomp$6662_lastToken$jscomp$inline_6837_nestedTokens$jscomp$inline_6842$$;
              break;
            default:
              $hasProperty$$.push($entityMap$$);
          }
        }
      } else {
        $JSCompiler_inline_result$jscomp$6662_lastToken$jscomp$inline_6837_nestedTokens$jscomp$inline_6842$$ = [];
      }
      $Writer$$ = $Context$$[$isFunction$$] = $JSCompiler_inline_result$jscomp$6662_lastToken$jscomp$inline_6837_nestedTokens$jscomp$inline_6842$$;
    }
    return $Writer$$;
  };
  $Writer$$.prototype.render = function($mustache$$, $isFunction$$, $escapeRegExp$$) {
    var $hasProperty$$ = this.parse($mustache$$);
    return this.$renderTokens$($hasProperty$$, $isFunction$$ instanceof $Context$$ ? $isFunction$$ : new $Context$$($isFunction$$), $escapeRegExp$$, $mustache$$);
  };
  $Writer$$.prototype.$renderTokens$ = function($mustache$$, $isFunction$$, $escapeRegExp$$, $hasProperty$$) {
    for (var $Scanner$$ = "", $Context$$, $Writer$$, $objectToString$$, $isArray$$ = 0, $regExpTest$$ = $mustache$$.length; $isArray$$ < $regExpTest$$; ++$isArray$$) {
      $objectToString$$ = void 0, $Context$$ = $mustache$$[$isArray$$], $Writer$$ = $Context$$[0], "#" === $Writer$$ ? $objectToString$$ = this.$renderSection$($Context$$, $isFunction$$, $escapeRegExp$$, $hasProperty$$) : "^" === $Writer$$ ? $objectToString$$ = this.$renderInverted$($Context$$, $isFunction$$, $escapeRegExp$$, $hasProperty$$) : ">" === $Writer$$ ? $objectToString$$ = this.$renderPartial$($Context$$, $isFunction$$, $escapeRegExp$$) : "&" === $Writer$$ ? $objectToString$$ = this.$unescapedValue$($Context$$, 
      $isFunction$$) : "name" === $Writer$$ ? $objectToString$$ = this.$escapedValue$($Context$$, $isFunction$$) : "text" === $Writer$$ && ($objectToString$$ = this.$rawValue$($Context$$)), void 0 !== $objectToString$$ && ($Scanner$$ += $objectToString$$);
    }
    return $Scanner$$;
  };
  $Writer$$.prototype.$renderSection$ = function($mustache$$, $escapeRegExp$$, $hasProperty$$, $Scanner$$) {
    function $Context$$($mustache$$) {
      return $Writer$$.render($mustache$$, $escapeRegExp$$, $hasProperty$$);
    }
    var $Writer$$ = this, $objectToString$$ = "", $regExpTest$$ = $escapeRegExp$$.$lookup$($mustache$$[1]);
    if ($regExpTest$$) {
      if ($isArray$$($regExpTest$$)) {
        for (var $curlyRe$$ = 0, $nonSpaceRe$$ = $regExpTest$$.length; $curlyRe$$ < $nonSpaceRe$$; ++$curlyRe$$) {
          $objectToString$$ += this.$renderTokens$($mustache$$[4], $escapeRegExp$$.push($regExpTest$$[$curlyRe$$]), $hasProperty$$, $Scanner$$);
        }
      } else {
        if ("object" === typeof $regExpTest$$ || "string" === typeof $regExpTest$$ || "number" === typeof $regExpTest$$) {
          $objectToString$$ += this.$renderTokens$($mustache$$[4], $escapeRegExp$$.push($regExpTest$$), $hasProperty$$, $Scanner$$);
        } else {
          if ($isFunction$$($regExpTest$$)) {
            if ("string" !== typeof $Scanner$$) {
              throw Error("Cannot use higher-order sections without the original template");
            }
            $regExpTest$$ = $regExpTest$$.call($escapeRegExp$$.view, $Scanner$$.slice($mustache$$[3], $mustache$$[5]), $Context$$);
            null != $regExpTest$$ && ($objectToString$$ += $regExpTest$$);
          } else {
            $objectToString$$ += this.$renderTokens$($mustache$$[4], $escapeRegExp$$, $hasProperty$$, $Scanner$$);
          }
        }
      }
      return $objectToString$$;
    }
  };
  $Writer$$.prototype.$renderInverted$ = function($mustache$$, $isFunction$$, $escapeRegExp$$, $hasProperty$$) {
    var $Scanner$$ = $isFunction$$.$lookup$($mustache$$[1]);
    if (!$Scanner$$ || $isArray$$($Scanner$$) && 0 === $Scanner$$.length) {
      return this.$renderTokens$($mustache$$[4], $isFunction$$, $escapeRegExp$$, $hasProperty$$);
    }
  };
  $Writer$$.prototype.$renderPartial$ = function($mustache$$, $escapeRegExp$$, $hasProperty$$) {
    if ($hasProperty$$ && ($mustache$$ = $isFunction$$($hasProperty$$) ? $hasProperty$$($mustache$$[1]) : $hasProperty$$[$mustache$$[1]], null != $mustache$$)) {
      return this.$renderTokens$(this.parse($mustache$$), $escapeRegExp$$, $hasProperty$$, $mustache$$);
    }
  };
  $Writer$$.prototype.$unescapedValue$ = function($isFunction$$, $escapeRegExp$$) {
    $isFunction$$ = $escapeRegExp$$.$lookup$($isFunction$$[1]);
    if (null != $isFunction$$) {
      return $mustache$$.$sanitizeUnescaped$ ? $mustache$$.$sanitizeUnescaped$($isFunction$$) : $isFunction$$;
    }
  };
  $Writer$$.prototype.$escapedValue$ = function($isFunction$$, $escapeRegExp$$) {
    $isFunction$$ = $escapeRegExp$$.$lookup$($isFunction$$[1]);
    if (null != $isFunction$$) {
      return $mustache$$.escape($isFunction$$);
    }
  };
  $Writer$$.prototype.$rawValue$ = function($mustache$$) {
    return $mustache$$[1];
  };
  $mustache$$.name = "mustache.js";
  $mustache$$.version = "2.2.0";
  $mustache$$.$tags$ = ["{{", "}}"];
  var $defaultWriter$$ = new $Writer$$;
  $mustache$$.$clearCache$ = function() {
    return $defaultWriter$$.$clearCache$();
  };
  $mustache$$.parse = function($mustache$$, $isFunction$$) {
    return $defaultWriter$$.parse($mustache$$, $isFunction$$);
  };
  $mustache$$.render = function($mustache$$, $isFunction$$, $escapeRegExp$$) {
    if ("string" !== typeof $mustache$$) {
      throw $isFunction$$ = TypeError, $mustache$$ = $isArray$$($mustache$$) ? "array" : typeof $mustache$$, new $isFunction$$('Invalid template! Template should be a "string" but "' + $mustache$$ + '" was given as the first argument for mustache#render(template, view, partials)');
    }
    return $defaultWriter$$.render($mustache$$, $isFunction$$, $escapeRegExp$$);
  };
  $mustache$$.$to_html$ = function($escapeRegExp$$, $hasProperty$$, $Scanner$$, $Context$$) {
    $escapeRegExp$$ = $mustache$$.render($escapeRegExp$$, $hasProperty$$, $Scanner$$);
    if ($isFunction$$($Context$$)) {
      $Context$$($escapeRegExp$$);
    } else {
      return $escapeRegExp$$;
    }
  };
  $mustache$$.escape = function($mustache$$) {
    return String($mustache$$).replace(/[&<>"'`=\/]/g, function($mustache$$) {
      return $entityMap$$[$mustache$$];
    });
  };
  $mustache$$.$sanitizeUnescaped$ = null;
  $mustache$$.$setUnescapedSanitizer$ = function($isFunction$$) {
    $mustache$$.$sanitizeUnescaped$ = $isFunction$$;
  };
  $mustache$$.$Scanner$ = $Scanner$$;
  $mustache$$.$Context$ = $Context$$;
  $mustache$$.$Writer$ = $Writer$$;
})(_.$Mustache$$module$third_party$mustache$mustache$$);
_.$JSCompiler_prototypeAlias$$ = _.$DocImpl$$module$extensions$amp_subscriptions$0_1$doc_impl$$.prototype;
_.$JSCompiler_prototypeAlias$$.$getWin$ = _.$JSCompiler_stubMethod$$(3);
_.$JSCompiler_prototypeAlias$$.getRootNode = function() {
  return this.$ampdoc_$.getRootNode();
};
_.$JSCompiler_prototypeAlias$$.$getRootElement$ = function() {
  var $root$jscomp$23$$ = this.$ampdoc_$.getRootNode();
  return $root$jscomp$23$$.documentElement || $root$jscomp$23$$.body || $root$jscomp$23$$;
};
_.$JSCompiler_prototypeAlias$$.$getHead$ = _.$JSCompiler_stubMethod$$(53);
_.$JSCompiler_prototypeAlias$$.$getBody$ = function() {
  return this.$ampdoc_$.$isBodyAvailable$() ? this.$ampdoc_$.$getBody$() : null;
};
_.$JSCompiler_prototypeAlias$$.$Doc$$module$third_party$subscriptions_project$config_prototype$isReady$ = _.$JSCompiler_stubMethod$$(54);
_.$JSCompiler_prototypeAlias$$.$whenReady$ = function() {
  return this.$ampdoc_$.$whenReady$();
};
_.$Entitlement$$module$extensions$amp_subscriptions$0_1$entitlement$$.prototype.json = function() {
  return _.$dict$$module$src$utils$object$$({source:this.source, service:this.$service$, granted:this.$granted$, grantReason:this.$grantReason$, data:this.data});
};
var $RETURN_URL_REGEX$$module$extensions$amp_access$0_1$login_dialog$$ = /RETURN_URL/;
$ViewerLoginDialog$$module$extensions$amp_access$0_1$login_dialog$$.prototype.$O$ = function() {
  return ("string" == typeof this.$D$ ? window.Promise.resolve(this.$D$) : this.$D$).then(function($url$jscomp$108$$) {
    return $buildLoginUrl$$module$extensions$amp_access$0_1$login_dialog$$($url$jscomp$108$$, "RETURN_URL");
  });
};
$ViewerLoginDialog$$module$extensions$amp_access$0_1$login_dialog$$.prototype.open = function() {
  var $$jscomp$this$jscomp$232$$ = this;
  return this.$O$().then(function($loginUrl$$) {
    "amp-access-login";
    return _.$JSCompiler_StaticMethods_sendMessageAwaitResponse$$($$jscomp$this$jscomp$232$$.viewer, "openDialog", _.$dict$$module$src$utils$object$$({url:$loginUrl$$}));
  });
};
$WebLoginDialog$$module$extensions$amp_access$0_1$login_dialog$$.prototype.open = function() {
  var $$jscomp$this$jscomp$233$$ = this;
  return (new window.Promise(function($resolve$jscomp$46$$, $reject$jscomp$19$$) {
    $$jscomp$this$jscomp$233$$.$J$ = $resolve$jscomp$46$$;
    $$jscomp$this$jscomp$233$$.$P$ = $reject$jscomp$19$$;
    $JSCompiler_StaticMethods_WebLoginDialog$$module$extensions$amp_access$0_1$login_dialog_prototype$openInternal_$$($$jscomp$this$jscomp$233$$);
  })).then(function($result$jscomp$19$$) {
    $JSCompiler_StaticMethods_WebLoginDialog$$module$extensions$amp_access$0_1$login_dialog_prototype$cleanup_$$($$jscomp$this$jscomp$233$$);
    return $result$jscomp$19$$;
  }, function($error$jscomp$35$$) {
    $JSCompiler_StaticMethods_WebLoginDialog$$module$extensions$amp_access$0_1$login_dialog_prototype$cleanup_$$($$jscomp$this$jscomp$233$$);
    throw $error$jscomp$35$$;
  });
};
$WebLoginDialog$$module$extensions$amp_access$0_1$login_dialog$$.prototype.$O$ = function() {
  var $$jscomp$this$jscomp$234$$ = this;
  return ("string" == typeof this.$G$ ? window.Promise.resolve(this.$G$) : this.$G$).then(function($url$jscomp$109$$) {
    return $buildLoginUrl$$module$extensions$amp_access$0_1$login_dialog$$($url$jscomp$109$$, $JSCompiler_StaticMethods_getReturnUrl_$$($$jscomp$this$jscomp$234$$));
  });
};
var $parser$$module$extensions$amp_access$0_1$access_expr_impl$$ = function() {
  function $o$jscomp$7$$($o$jscomp$7$$, $Parser$$, $$V0_parser$$, $$V1$$) {
    $$V0_parser$$ = $$V0_parser$$ || {};
    for ($$V1$$ = $o$jscomp$7$$.length; $$V1$$--; $$V0_parser$$[$o$jscomp$7$$[$$V1$$]] = $Parser$$) {
    }
    return $$V0_parser$$;
  }
  function $Parser$$() {
    this.$yy$ = {};
  }
  var $$V0_parser$$ = [1, 3], $$V1$$ = [1, 4], $$V2$$ = [1, 18], $$V3$$ = [1, 13], $$V4$$ = [1, 14], $$V5$$ = [1, 15], $$V6$$ = [1, 16], $$V7$$ = [1, 17], $$V8$$ = [1, 20], $$V9$$ = [1, 21], $$Va$$ = [5, 6, 7, 10], $$Vb$$ = [5, 6, 7, 10, 15, 16, 17, 18, 19, 20, 21], $$Vc$$ = [5, 6, 7, 10, 15, 16, 17, 18, 19, 20, 21, 25];
  $$V0_parser$$ = {trace:function() {
  }, $yy$:{}, $symbols_$:{error:2, result:3, search_condition:4, EOF:5, OR:6, AND:7, NOT:8, "(":9, ")":10, predicate:11, comparison_predicate:12, truthy_predicate:13, scalar_exp:14, EQ:15, DEQ:16, NEQ:17, LT:18, LTE:19, GT:20, GTE:21, atom:22, field_ref:23, literal:24, DOT:25, field_name:26, NAME:27, STRING:28, NUMERIC:29, TRUE:30, FALSE:31, NULL:32, $accept:0, $end:1}, $terminals_$:{2:"error", 5:"EOF", 6:"OR", 7:"AND", 8:"NOT", 9:"(", 10:")", 15:"EQ", 16:"DEQ", 17:"NEQ", 18:"LT", 19:"LTE", 20:"GT", 
  21:"GTE", 25:"DOT", 27:"NAME", 28:"STRING", 29:"NUMERIC", 30:"TRUE", 31:"FALSE", 32:"NULL"}, $productions_$:[0, [3, 2], [4, 3], [4, 3], [4, 2], [4, 3], [4, 1], [11, 1], [11, 1], [12, 3], [12, 3], [12, 3], [12, 3], [12, 3], [12, 3], [12, 3], [13, 1], [14, 1], [14, 1], [22, 1], [23, 3], [23, 1], [26, 1], [24, 1], [24, 1], [24, 1], [24, 1], [24, 1]], $performAction$:function($o$jscomp$7$$, $Parser$$, $$V0_parser$$, $$V1$$, $$V2$$, $$V3$$) {
    $Parser$$ = $$V3$$.length - 1;
    switch($$V2$$) {
      case 1:
        return $$V3$$[$Parser$$ - 1];
      case 2:
        this.$$$ = $$V3$$[$Parser$$ - 2] || $$V3$$[$Parser$$];
        break;
      case 3:
        this.$$$ = $$V3$$[$Parser$$ - 2] && $$V3$$[$Parser$$];
        break;
      case 4:
        this.$$$ = !$$V3$$[$Parser$$];
        break;
      case 5:
        this.$$$ = $$V3$$[$Parser$$ - 1];
        break;
      case 6:
      case 7:
      case 8:
      case 17:
      case 18:
      case 19:
        this.$$$ = $$V3$$[$Parser$$];
        break;
      case 9:
        this.$$$ = $$V3$$[$Parser$$ - 2] === $$V3$$[$Parser$$];
        break;
      case 10:
        throw Error('"==" is not allowed, use "="');
      case 11:
        this.$$$ = $$V3$$[$Parser$$ - 2] !== $$V3$$[$Parser$$];
        break;
      case 12:
        this.$$$ = typeof $$V3$$[$Parser$$ - 2] == typeof $$V3$$[$Parser$$] && $$V3$$[$Parser$$ - 2] < $$V3$$[$Parser$$];
        break;
      case 13:
        this.$$$ = typeof $$V3$$[$Parser$$ - 2] == typeof $$V3$$[$Parser$$] && $$V3$$[$Parser$$ - 2] <= $$V3$$[$Parser$$];
        break;
      case 14:
        this.$$$ = typeof $$V3$$[$Parser$$ - 2] == typeof $$V3$$[$Parser$$] && $$V3$$[$Parser$$ - 2] > $$V3$$[$Parser$$];
        break;
      case 15:
        this.$$$ = typeof $$V3$$[$Parser$$ - 2] == typeof $$V3$$[$Parser$$] && $$V3$$[$Parser$$ - 2] >= $$V3$$[$Parser$$];
        break;
      case 16:
        this.$$$ = void 0 !== $$V3$$[$Parser$$] && null !== $$V3$$[$Parser$$] && "" !== $$V3$$[$Parser$$] && 0 !== $$V3$$[$Parser$$] && !1 !== $$V3$$[$Parser$$];
        break;
      case 20:
        this.$$$ = "[object Object]" == Object.prototype.toString.call($$V3$$[$Parser$$ - 2]) && $$V3$$[$Parser$$ - 2].hasOwnProperty($$V3$$[$Parser$$]) ? $$V3$$[$Parser$$ - 2][$$V3$$[$Parser$$]] : null;
        break;
      case 21:
        this.$$$ = void 0 !== $$V1$$[$$V3$$[$Parser$$]] ? $$V1$$[$$V3$$[$Parser$$]] : null;
        break;
      case 22:
        this.$$$ = $o$jscomp$7$$;
        break;
      case 23:
        this.$$$ = $o$jscomp$7$$.substring(1, $o$jscomp$7$$.length - 1);
        break;
      case 24:
        this.$$$ = Number($o$jscomp$7$$);
        break;
      case 25:
        this.$$$ = !0;
        break;
      case 26:
        this.$$$ = !1;
        break;
      case 27:
        this.$$$ = null;
    }
  }, table:[{3:1, 4:2, 8:$$V0_parser$$, 9:$$V1$$, 11:5, 12:6, 13:7, 14:8, 22:9, 23:10, 24:11, 26:12, 27:$$V2$$, 28:$$V3$$, 29:$$V4$$, 30:$$V5$$, 31:$$V6$$, 32:$$V7$$}, {1:[3]}, {5:[1, 19], 6:$$V8$$, 7:$$V9$$}, {4:22, 8:$$V0_parser$$, 9:$$V1$$, 11:5, 12:6, 13:7, 14:8, 22:9, 23:10, 24:11, 26:12, 27:$$V2$$, 28:$$V3$$, 29:$$V4$$, 30:$$V5$$, 31:$$V6$$, 32:$$V7$$}, {4:23, 8:$$V0_parser$$, 9:$$V1$$, 11:5, 12:6, 13:7, 14:8, 22:9, 23:10, 24:11, 26:12, 27:$$V2$$, 28:$$V3$$, 29:$$V4$$, 30:$$V5$$, 31:$$V6$$, 
  32:$$V7$$}, $o$jscomp$7$$($$Va$$, [2, 6]), $o$jscomp$7$$($$Va$$, [2, 7]), $o$jscomp$7$$($$Va$$, [2, 8]), $o$jscomp$7$$($$Va$$, [2, 16], {15:[1, 24], 16:[1, 25], 17:[1, 26], 18:[1, 27], 19:[1, 28], 20:[1, 29], 21:[1, 30]}), $o$jscomp$7$$($$Vb$$, [2, 17]), $o$jscomp$7$$($$Vb$$, [2, 18], {25:[1, 31]}), $o$jscomp$7$$($$Vb$$, [2, 19]), $o$jscomp$7$$($$Vc$$, [2, 21]), $o$jscomp$7$$($$Vb$$, [2, 23]), $o$jscomp$7$$($$Vb$$, [2, 24]), $o$jscomp$7$$($$Vb$$, [2, 25]), $o$jscomp$7$$($$Vb$$, [2, 26]), $o$jscomp$7$$($$Vb$$, 
  [2, 27]), $o$jscomp$7$$($$Vc$$, [2, 22]), {1:[2, 1]}, {4:32, 8:$$V0_parser$$, 9:$$V1$$, 11:5, 12:6, 13:7, 14:8, 22:9, 23:10, 24:11, 26:12, 27:$$V2$$, 28:$$V3$$, 29:$$V4$$, 30:$$V5$$, 31:$$V6$$, 32:$$V7$$}, {4:33, 8:$$V0_parser$$, 9:$$V1$$, 11:5, 12:6, 13:7, 14:8, 22:9, 23:10, 24:11, 26:12, 27:$$V2$$, 28:$$V3$$, 29:$$V4$$, 30:$$V5$$, 31:$$V6$$, 32:$$V7$$}, $o$jscomp$7$$($$Va$$, [2, 4]), {6:$$V8$$, 7:$$V9$$, 10:[1, 34]}, {14:35, 22:9, 23:10, 24:11, 26:12, 27:$$V2$$, 28:$$V3$$, 29:$$V4$$, 30:$$V5$$, 
  31:$$V6$$, 32:$$V7$$}, {14:36, 22:9, 23:10, 24:11, 26:12, 27:$$V2$$, 28:$$V3$$, 29:$$V4$$, 30:$$V5$$, 31:$$V6$$, 32:$$V7$$}, {14:37, 22:9, 23:10, 24:11, 26:12, 27:$$V2$$, 28:$$V3$$, 29:$$V4$$, 30:$$V5$$, 31:$$V6$$, 32:$$V7$$}, {14:38, 22:9, 23:10, 24:11, 26:12, 27:$$V2$$, 28:$$V3$$, 29:$$V4$$, 30:$$V5$$, 31:$$V6$$, 32:$$V7$$}, {14:39, 22:9, 23:10, 24:11, 26:12, 27:$$V2$$, 28:$$V3$$, 29:$$V4$$, 30:$$V5$$, 31:$$V6$$, 32:$$V7$$}, {14:40, 22:9, 23:10, 24:11, 26:12, 27:$$V2$$, 28:$$V3$$, 29:$$V4$$, 
  30:$$V5$$, 31:$$V6$$, 32:$$V7$$}, {14:41, 22:9, 23:10, 24:11, 26:12, 27:$$V2$$, 28:$$V3$$, 29:$$V4$$, 30:$$V5$$, 31:$$V6$$, 32:$$V7$$}, {26:42, 27:$$V2$$}, $o$jscomp$7$$([5, 6, 10], [2, 2], {7:$$V9$$}), $o$jscomp$7$$($$Va$$, [2, 3]), $o$jscomp$7$$($$Va$$, [2, 5]), $o$jscomp$7$$($$Va$$, [2, 9]), $o$jscomp$7$$($$Va$$, [2, 10]), $o$jscomp$7$$($$Va$$, [2, 11]), $o$jscomp$7$$($$Va$$, [2, 12]), $o$jscomp$7$$($$Va$$, [2, 13]), $o$jscomp$7$$($$Va$$, [2, 14]), $o$jscomp$7$$($$Va$$, [2, 15]), $o$jscomp$7$$($$Vc$$, 
  [2, 20])], $defaultActions$:{19:[2, 1]}, parseError:function($o$jscomp$7$$, $Parser$$) {
    if ($Parser$$.$recoverable$) {
      this.trace($o$jscomp$7$$);
    } else {
      throw $o$jscomp$7$$ = Error($o$jscomp$7$$), $o$jscomp$7$$.hash = $Parser$$, $o$jscomp$7$$;
    }
  }, parse:function($o$jscomp$7$$) {
    var $Parser$$ = [0], $$V0_parser$$ = [null], $$V1$$ = [], $$V2$$ = this.table, $$V3$$ = "", $$V4$$ = 0, $$V5$$ = 0, $$V6$$ = 0, $$V7$$ = $$V1$$.slice.call(arguments, 1), $input$jscomp$31$$ = Object.create(this.$lexer$), $$V8$$ = {};
    for ($$V9$$ in this.$yy$) {
      Object.prototype.hasOwnProperty.call(this.$yy$, $$V9$$) && ($$V8$$[$$V9$$] = this.$yy$[$$V9$$]);
    }
    $input$jscomp$31$$.$setInput$($o$jscomp$7$$, $$V8$$);
    $$V8$$.$lexer$ = $input$jscomp$31$$;
    $$V8$$.$parser$ = this;
    "undefined" == typeof $input$jscomp$31$$.$yylloc$ && ($input$jscomp$31$$.$yylloc$ = {});
    var $$V9$$ = $input$jscomp$31$$.$yylloc$;
    $$V1$$.push($$V9$$);
    var $$Vc$$ = $input$jscomp$31$$.options && $input$jscomp$31$$.options.$ranges$;
    "function" === typeof $$V8$$.parseError ? this.parseError = $$V8$$.parseError : this.parseError = Object.getPrototypeOf(this).parseError;
    for (var $$Va$$, $preErrorSymbol$$, $$Vb$$, $action$jscomp$14_newState$jscomp$11$$, $yyval$$ = {}, $p$jscomp$11$$, $expected$jscomp$1_len$jscomp$1$$;;) {
      $$Vb$$ = $Parser$$[$Parser$$.length - 1];
      if (this.$defaultActions$[$$Vb$$]) {
        $action$jscomp$14_newState$jscomp$11$$ = this.$defaultActions$[$$Vb$$];
      } else {
        if (null === $$Va$$ || "undefined" == typeof $$Va$$) {
          $$Va$$ = $input$jscomp$31$$.$lex$() || 1, "number" !== typeof $$Va$$ && ($$Va$$ = this.$symbols_$[$$Va$$] || $$Va$$);
        }
        $action$jscomp$14_newState$jscomp$11$$ = $$V2$$[$$Vb$$] && $$V2$$[$$Vb$$][$$Va$$];
      }
      if ("undefined" === typeof $action$jscomp$14_newState$jscomp$11$$ || !$action$jscomp$14_newState$jscomp$11$$.length || !$action$jscomp$14_newState$jscomp$11$$[0]) {
        $expected$jscomp$1_len$jscomp$1$$ = [];
        for ($p$jscomp$11$$ in $$V2$$[$$Vb$$]) {
          this.$terminals_$[$p$jscomp$11$$] && 2 < $p$jscomp$11$$ && $expected$jscomp$1_len$jscomp$1$$.push("'" + this.$terminals_$[$p$jscomp$11$$] + "'");
        }
        var $errStr$$ = $input$jscomp$31$$.$showPosition$ ? "Parse error on line " + ($$V4$$ + 1) + ":\n" + $input$jscomp$31$$.$showPosition$() + "\nExpecting " + $expected$jscomp$1_len$jscomp$1$$.join(", ") + ", got '" + (this.$terminals_$[$$Va$$] || $$Va$$) + "'" : "Parse error on line " + ($$V4$$ + 1) + ": Unexpected " + (1 == $$Va$$ ? "end of input" : "'" + (this.$terminals_$[$$Va$$] || $$Va$$) + "'");
        this.parseError($errStr$$, {text:$input$jscomp$31$$.match, $token$:this.$terminals_$[$$Va$$] || $$Va$$, line:$input$jscomp$31$$.$yylineno$, $loc$:$$V9$$, $expected$:$expected$jscomp$1_len$jscomp$1$$});
      }
      if ($action$jscomp$14_newState$jscomp$11$$[0] instanceof Array && 1 < $action$jscomp$14_newState$jscomp$11$$.length) {
        throw Error("Parse Error: multiple actions possible at state: " + $$Vb$$ + ", token: " + $$Va$$);
      }
      switch($action$jscomp$14_newState$jscomp$11$$[0]) {
        case 1:
          $Parser$$.push($$Va$$);
          $$V0_parser$$.push($input$jscomp$31$$.$yytext$);
          $$V1$$.push($input$jscomp$31$$.$yylloc$);
          $Parser$$.push($action$jscomp$14_newState$jscomp$11$$[1]);
          $$Va$$ = null;
          $preErrorSymbol$$ ? ($$Va$$ = $preErrorSymbol$$, $preErrorSymbol$$ = null) : ($$V5$$ = $input$jscomp$31$$.$yyleng$, $$V3$$ = $input$jscomp$31$$.$yytext$, $$V4$$ = $input$jscomp$31$$.$yylineno$, $$V9$$ = $input$jscomp$31$$.$yylloc$, 0 < $$V6$$ && $$V6$$--);
          break;
        case 2:
          $expected$jscomp$1_len$jscomp$1$$ = this.$productions_$[$action$jscomp$14_newState$jscomp$11$$[1]][1];
          $yyval$$.$$$ = $$V0_parser$$[$$V0_parser$$.length - $expected$jscomp$1_len$jscomp$1$$];
          $yyval$$.$_$$ = {$first_line$:$$V1$$[$$V1$$.length - ($expected$jscomp$1_len$jscomp$1$$ || 1)].$first_line$, $last_line$:$$V1$$[$$V1$$.length - 1].$last_line$, $first_column$:$$V1$$[$$V1$$.length - ($expected$jscomp$1_len$jscomp$1$$ || 1)].$first_column$, $last_column$:$$V1$$[$$V1$$.length - 1].$last_column$};
          $$Vc$$ && ($yyval$$.$_$$.$range$ = [$$V1$$[$$V1$$.length - ($expected$jscomp$1_len$jscomp$1$$ || 1)].$range$[0], $$V1$$[$$V1$$.length - 1].$range$[1]]);
          $$Vb$$ = this.$performAction$.apply($yyval$$, [$$V3$$, $$V5$$, $$V4$$, $$V8$$, $action$jscomp$14_newState$jscomp$11$$[1], $$V0_parser$$, $$V1$$].concat($$V7$$));
          if ("undefined" !== typeof $$Vb$$) {
            return $$Vb$$;
          }
          $expected$jscomp$1_len$jscomp$1$$ && ($Parser$$ = $Parser$$.slice(0, -2 * $expected$jscomp$1_len$jscomp$1$$), $$V0_parser$$ = $$V0_parser$$.slice(0, -1 * $expected$jscomp$1_len$jscomp$1$$), $$V1$$ = $$V1$$.slice(0, -1 * $expected$jscomp$1_len$jscomp$1$$));
          $Parser$$.push(this.$productions_$[$action$jscomp$14_newState$jscomp$11$$[1]][0]);
          $$V0_parser$$.push($yyval$$.$$$);
          $$V1$$.push($yyval$$.$_$$);
          $action$jscomp$14_newState$jscomp$11$$ = $$V2$$[$Parser$$[$Parser$$.length - 2]][$Parser$$[$Parser$$.length - 1]];
          $Parser$$.push($action$jscomp$14_newState$jscomp$11$$);
          break;
        case 3:
          return !0;
      }
    }
  }};
  $$V0_parser$$.$lexer$ = function() {
    return {$EOF$:1, parseError:function($o$jscomp$7$$, $Parser$$) {
      if (this.$yy$.$parser$) {
        this.$yy$.$parser$.parseError($o$jscomp$7$$, $Parser$$);
      } else {
        throw Error($o$jscomp$7$$);
      }
    }, $setInput$:function($o$jscomp$7$$, $Parser$$) {
      this.$yy$ = $Parser$$ || this.$yy$ || {};
      this.$_input$ = $o$jscomp$7$$;
      this.$_more$ = this.$_backtrack$ = this.done = !1;
      this.$yylineno$ = this.$yyleng$ = 0;
      this.$yytext$ = this.$matched$ = this.match = "";
      this.$conditionStack$ = ["INITIAL"];
      this.$yylloc$ = {$first_line$:1, $first_column$:0, $last_line$:1, $last_column$:0};
      this.options.$ranges$ && (this.$yylloc$.$range$ = [0, 0]);
      this.offset = 0;
      return this;
    }, input:function() {
      var $o$jscomp$7$$ = this.$_input$[0];
      this.$yytext$ += $o$jscomp$7$$;
      this.$yyleng$++;
      this.offset++;
      this.match += $o$jscomp$7$$;
      this.$matched$ += $o$jscomp$7$$;
      $o$jscomp$7$$.match(/(?:\r\n?|\n).*/g) ? (this.$yylineno$++, this.$yylloc$.$last_line$++) : this.$yylloc$.$last_column$++;
      this.options.$ranges$ && this.$yylloc$.$range$[1]++;
      this.$_input$ = this.$_input$.slice(1);
      return $o$jscomp$7$$;
    }, $unput$:function($o$jscomp$7$$) {
      var $Parser$$ = $o$jscomp$7$$.length, $$V0_parser$$ = $o$jscomp$7$$.split(/(?:\r\n?|\n)/g);
      this.$_input$ = $o$jscomp$7$$ + this.$_input$;
      this.$yytext$ = this.$yytext$.substr(0, this.$yytext$.length - $Parser$$);
      this.offset -= $Parser$$;
      $o$jscomp$7$$ = this.match.split(/(?:\r\n?|\n)/g);
      this.match = this.match.substr(0, this.match.length - 1);
      this.$matched$ = this.$matched$.substr(0, this.$matched$.length - 1);
      $$V0_parser$$.length - 1 && (this.$yylineno$ -= $$V0_parser$$.length - 1);
      var $$V1$$ = this.$yylloc$.$range$;
      this.$yylloc$ = {$first_line$:this.$yylloc$.$first_line$, $last_line$:this.$yylineno$ + 1, $first_column$:this.$yylloc$.$first_column$, $last_column$:$$V0_parser$$ ? ($$V0_parser$$.length === $o$jscomp$7$$.length ? this.$yylloc$.$first_column$ : 0) + $o$jscomp$7$$[$o$jscomp$7$$.length - $$V0_parser$$.length].length - $$V0_parser$$[0].length : this.$yylloc$.$first_column$ - $Parser$$};
      this.options.$ranges$ && (this.$yylloc$.$range$ = [$$V1$$[0], $$V1$$[0] + this.$yyleng$ - $Parser$$]);
      this.$yyleng$ = this.$yytext$.length;
      return this;
    }, $more$:function() {
      this.$_more$ = !0;
      return this;
    }, reject:function() {
      if (this.options.$backtrack_lexer$) {
        this.$_backtrack$ = !0;
      } else {
        return this.parseError("Lexical error on line " + (this.$yylineno$ + 1) + ". You can only invoke reject() in the lexer when the lexer is of the backtracking persuasion (options.backtrack_lexer = true).\n" + this.$showPosition$(), {text:"", $token$:null, line:this.$yylineno$});
      }
      return this;
    }, $less$:function($o$jscomp$7$$) {
      this.$unput$(this.match.slice($o$jscomp$7$$));
    }, $pastInput$:function() {
      var $o$jscomp$7$$ = this.$matched$.substr(0, this.$matched$.length - this.match.length);
      return (20 < $o$jscomp$7$$.length ? "..." : "") + $o$jscomp$7$$.substr(-20).replace(/\n/g, "");
    }, $upcomingInput$:function() {
      var $o$jscomp$7$$ = this.match;
      20 > $o$jscomp$7$$.length && ($o$jscomp$7$$ += this.$_input$.substr(0, 20 - $o$jscomp$7$$.length));
      return ($o$jscomp$7$$.substr(0, 20) + (20 < $o$jscomp$7$$.length ? "..." : "")).replace(/\n/g, "");
    }, $showPosition$:function() {
      var $o$jscomp$7$$ = this.$pastInput$(), $Parser$$ = Array($o$jscomp$7$$.length + 1).join("-");
      return $o$jscomp$7$$ + this.$upcomingInput$() + "\n" + $Parser$$ + "^";
    }, $test_match$:function($o$jscomp$7$$, $Parser$$) {
      var $$V0_parser$$;
      if (this.options.$backtrack_lexer$) {
        var $$V1$$ = {$yylineno$:this.$yylineno$, $yylloc$:{$first_line$:this.$yylloc$.$first_line$, $last_line$:this.$last_line$, $first_column$:this.$yylloc$.$first_column$, $last_column$:this.$yylloc$.$last_column$}, $yytext$:this.$yytext$, match:this.match, matches:this.matches, $matched$:this.$matched$, $yyleng$:this.$yyleng$, offset:this.offset, $_more$:this.$_more$, $_input$:this.$_input$, $yy$:this.$yy$, $conditionStack$:this.$conditionStack$.slice(0), done:this.done};
        this.options.$ranges$ && ($$V1$$.$yylloc$.$range$ = this.$yylloc$.$range$.slice(0));
      }
      if ($$V0_parser$$ = $o$jscomp$7$$[0].match(/(?:\r\n?|\n).*/g)) {
        this.$yylineno$ += $$V0_parser$$.length;
      }
      this.$yylloc$ = {$first_line$:this.$yylloc$.$last_line$, $last_line$:this.$yylineno$ + 1, $first_column$:this.$yylloc$.$last_column$, $last_column$:$$V0_parser$$ ? $$V0_parser$$[$$V0_parser$$.length - 1].length - $$V0_parser$$[$$V0_parser$$.length - 1].match(/\r?\n?/)[0].length : this.$yylloc$.$last_column$ + $o$jscomp$7$$[0].length};
      this.$yytext$ += $o$jscomp$7$$[0];
      this.match += $o$jscomp$7$$[0];
      this.matches = $o$jscomp$7$$;
      this.$yyleng$ = this.$yytext$.length;
      this.options.$ranges$ && (this.$yylloc$.$range$ = [this.offset, this.offset += this.$yyleng$]);
      this.$_backtrack$ = this.$_more$ = !1;
      this.$_input$ = this.$_input$.slice($o$jscomp$7$$[0].length);
      this.$matched$ += $o$jscomp$7$$[0];
      $o$jscomp$7$$ = this.$performAction$.call(this, this.$yy$, this, $Parser$$, this.$conditionStack$[this.$conditionStack$.length - 1]);
      this.done && this.$_input$ && (this.done = !1);
      if ($o$jscomp$7$$) {
        return $o$jscomp$7$$;
      }
      if (this.$_backtrack$) {
        for (var $$V2$$ in $$V1$$) {
          this[$$V2$$] = $$V1$$[$$V2$$];
        }
      }
      return !1;
    }, next:function() {
      if (this.done) {
        return this.$EOF$;
      }
      this.$_input$ || (this.done = !0);
      var $o$jscomp$7$$;
      this.$_more$ || (this.match = this.$yytext$ = "");
      for (var $Parser$$ = this.$_currentRules$(), $$V0_parser$$ = 0; $$V0_parser$$ < $Parser$$.length; $$V0_parser$$++) {
        if (($o$jscomp$7$$ = this.$_input$.match(this.rules[$Parser$$[$$V0_parser$$]])) && (!$$V1$$ || $o$jscomp$7$$[0].length > $$V1$$[0].length)) {
          var $$V1$$ = $o$jscomp$7$$;
          var $$V2$$ = $$V0_parser$$;
          if (this.options.$backtrack_lexer$) {
            $$V1$$ = this.$test_match$($o$jscomp$7$$, $Parser$$[$$V0_parser$$]);
            if (!1 !== $$V1$$) {
              return $$V1$$;
            }
            if (this.$_backtrack$) {
              $$V1$$ = !1;
            } else {
              return !1;
            }
          } else {
            if (!this.options.flex) {
              break;
            }
          }
        }
      }
      return $$V1$$ ? ($$V1$$ = this.$test_match$($$V1$$, $Parser$$[$$V2$$]), !1 !== $$V1$$ ? $$V1$$ : !1) : "" === this.$_input$ ? this.$EOF$ : this.parseError("Lexical error on line " + (this.$yylineno$ + 1) + ". Unrecognized text.\n" + this.$showPosition$(), {text:"", $token$:null, line:this.$yylineno$});
    }, $lex$:function() {
      var $o$jscomp$7$$ = this.next();
      return $o$jscomp$7$$ ? $o$jscomp$7$$ : this.$lex$();
    }, $begin$:function($o$jscomp$7$$) {
      this.$conditionStack$.push($o$jscomp$7$$);
    }, $popState$:function() {
      return 0 < this.$conditionStack$.length - 1 ? this.$conditionStack$.pop() : this.$conditionStack$[0];
    }, $_currentRules$:function() {
      return this.$conditionStack$.length && this.$conditionStack$[this.$conditionStack$.length - 1] ? this.$conditions$[this.$conditionStack$[this.$conditionStack$.length - 1]].rules : this.$conditions$.INITIAL.rules;
    }, $topState$:function($o$jscomp$7$$) {
      $o$jscomp$7$$ = this.$conditionStack$.length - 1 - Math.abs($o$jscomp$7$$ || 0);
      return 0 <= $o$jscomp$7$$ ? this.$conditionStack$[$o$jscomp$7$$] : "INITIAL";
    }, pushState:function($o$jscomp$7$$) {
      this.$begin$($o$jscomp$7$$);
    }, $stateStackSize$:function() {
      return this.$conditionStack$.length;
    }, options:{}, $performAction$:function($o$jscomp$7$$, $Parser$$, $$V0_parser$$) {
      switch($$V0_parser$$) {
        case 1:
          return 7;
        case 2:
          return 6;
        case 3:
          return 8;
        case 4:
          return 32;
        case 5:
          return 30;
        case 6:
          return 30;
        case 7:
          return 31;
        case 8:
          return 31;
        case 9:
          return 9;
        case 10:
          return 10;
        case 11:
          return "|";
        case 12:
          return 19;
        case 13:
          return 18;
        case 14:
          return 21;
        case 15:
          return 20;
        case 16:
          return 17;
        case 17:
          return 16;
        case 18:
          return 15;
        case 19:
          return 29;
        case 20:
          return 27;
        case 21:
          return 28;
        case 22:
          return 28;
        case 23:
          return 25;
        case 24:
          return "INVALID";
        case 25:
          return 5;
      }
    }, rules:[/^(?:\s+)/, /^(?:AND\b)/, /^(?:OR\b)/, /^(?:NOT\b)/, /^(?:NULL\b)/, /^(?:TRUE\b)/, /^(?:true\b)/, /^(?:FALSE\b)/, /^(?:false\b)/, /^(?:\()/, /^(?:\))/, /^(?:\|)/, /^(?:<=)/, /^(?:<)/, /^(?:>=)/, /^(?:>)/, /^(?:!=)/, /^(?:==)/, /^(?:=)/, /^(?:-?[0-9]+(\.[0-9]+)?\b)/, /^(?:[a-zA-Z_][a-zA-Z0-9_]*)/, /^(?:'[^']*')/, /^(?:"[^"]*")/, /^(?:\.)/, /^(?:.)/, /^(?:$)/], $conditions$:{INITIAL:{rules:[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25], 
    inclusive:!0}}};
  }();
  $Parser$$.prototype = $$V0_parser$$;
  $$V0_parser$$.$D$ = $Parser$$;
  return new $Parser$$;
}();
_.$JSCompiler_prototypeAlias$$ = _.$AccessClientAdapter$$module$extensions$amp_access$0_1$amp_access_client$$.prototype;
_.$JSCompiler_prototypeAlias$$.$getConfig$ = _.$JSCompiler_stubMethod$$(55);
_.$JSCompiler_prototypeAlias$$.$isAuthorizationEnabled$ = _.$JSCompiler_stubMethod$$(56);
_.$JSCompiler_prototypeAlias$$.$authorize$ = _.$JSCompiler_stubMethod$$(57);
_.$JSCompiler_prototypeAlias$$.$AccessClientAdapter$$module$extensions$amp_access$0_1$amp_access_client_prototype$isPingbackEnabled$ = _.$JSCompiler_stubMethod$$(58);
_.$JSCompiler_prototypeAlias$$.$AccessClientAdapter$$module$extensions$amp_access$0_1$amp_access_client_prototype$pingback$ = _.$JSCompiler_stubMethod$$(59);
_.$JSCompiler_prototypeAlias$$.$postAction$ = _.$JSCompiler_stubMethod$$(60);

})});
