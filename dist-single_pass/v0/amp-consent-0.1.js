(self.AMP=self.AMP||[]).push({n:"amp-consent",i:["_base_i","_base_misc"],v:"1901181729101",f:(function(AMP,_){
var $JSCompiler_StaticMethods_onQueueEmpty$$ = function($JSCompiler_StaticMethods_onQueueEmpty$self$$, $handler$jscomp$36$$) {
  $JSCompiler_StaticMethods_onQueueEmpty$self$$.$F$ = $handler$jscomp$36$$;
  0 == $JSCompiler_StaticMethods_onQueueEmpty$self$$.$D$ && $handler$jscomp$36$$();
}, $JSCompiler_StaticMethods_onQueueNotEmpty$$ = function($JSCompiler_StaticMethods_onQueueNotEmpty$self$$, $handler$jscomp$37$$) {
  $JSCompiler_StaticMethods_onQueueNotEmpty$self$$.$G$ = $handler$jscomp$37$$;
  0 < $JSCompiler_StaticMethods_onQueueNotEmpty$self$$.$D$ && $handler$jscomp$37$$();
}, $isAmpElement$$module$src$dom$$ = function($element$jscomp$24_tag$jscomp$7$$) {
  $element$jscomp$24_tag$jscomp$7$$ = $element$jscomp$24_tag$jscomp$7$$.tagName;
  return _.$startsWith$$module$src$string$$($element$jscomp$24_tag$jscomp$7$$, "AMP-") && !("AMP-STICKY-AD-TOP-PADDING" == $element$jscomp$24_tag$jscomp$7$$ || "AMP-BODY" == $element$jscomp$24_tag$jscomp$7$$);
}, $calculateLegacyStateValue$$module$extensions$amp_consent$0_1$consent_info$$ = function($consentState$jscomp$11$$) {
  return 1 == $consentState$jscomp$11$$ ? !0 : 2 == $consentState$jscomp$11$$ ? !1 : null;
}, $isConsentInfoStoredValueSame$$module$extensions$amp_consent$0_1$consent_info$$ = function($infoA$$, $infoB$$) {
  if (!$infoA$$ && !$infoB$$) {
    return !0;
  }
  if ($infoA$$ && $infoB$$) {
    var $stringEqual$$ = ($infoA$$.consentString || "") === ($infoB$$.consentString || ""), $isDirtyEqual$$ = !!$infoA$$.isDirty === !!$infoB$$.isDirty;
    return $calculateLegacyStateValue$$module$extensions$amp_consent$0_1$consent_info$$($infoA$$.consentState) === $calculateLegacyStateValue$$module$extensions$amp_consent$0_1$consent_info$$($infoB$$.consentState) && $stringEqual$$ && $isDirtyEqual$$;
  }
  return !1;
}, $constructConsentInfo$$module$extensions$amp_consent$0_1$consent_info$$ = function($consentState$jscomp$12$$, $opt_consentString$$, $opt_isDirty$$) {
  return {consentState:$consentState$jscomp$12$$, consentString:$opt_consentString$$, isDirty:$opt_isDirty$$};
}, $convertValueToState$$module$extensions$amp_consent$0_1$consent_info$$ = function($value$jscomp$211$$) {
  return !0 === $value$jscomp$211$$ || 1 === $value$jscomp$211$$ ? 1 : !1 === $value$jscomp$211$$ || 0 === $value$jscomp$211$$ ? 2 : 5;
}, $ConsentUI$$module$extensions$amp_consent$0_1$consent_ui$$ = function($baseInstance$jscomp$5_loadingSpinner$jscomp$inline_6159_promptUISrc$jscomp$inline_3050$$, $config$jscomp$55_postPromptUI$jscomp$inline_3048_promptElement$jscomp$inline_3051$$, $iframe$jscomp$inline_6155_opt_postPromptUI_placeholder$jscomp$inline_6158_promptUI$jscomp$inline_3049$$) {
  this.$G$ = $baseInstance$jscomp$5_loadingSpinner$jscomp$inline_6159_promptUISrc$jscomp$inline_3050$$;
  this.$isFullscreen_$ = this.$P$ = this.$isVisible_$ = this.$R$ = this.$O$ = !1;
  this.$D$ = null;
  this.$W$ = _.$isExperimentOn$$module$src$experiments$$($baseInstance$jscomp$5_loadingSpinner$jscomp$inline_6159_promptUISrc$jscomp$inline_3050$$.$win$, "amp-consent-v2") && $config$jscomp$55_postPromptUI$jscomp$inline_3048_promptElement$jscomp$inline_3051$$.uiConfig && !0 === $config$jscomp$55_postPromptUI$jscomp$inline_3048_promptElement$jscomp$inline_3051$$.uiConfig.overlay;
  this.$I$ = !0;
  this.$maskElement_$ = null;
  this.$ampdoc_$ = $baseInstance$jscomp$5_loadingSpinner$jscomp$inline_6159_promptUISrc$jscomp$inline_3050$$.$getAmpDoc$();
  this.$viewport_$ = _.$Services$$module$src$services$viewportForDoc$$(this.$ampdoc_$);
  this.$F$ = $baseInstance$jscomp$5_loadingSpinner$jscomp$inline_6159_promptUISrc$jscomp$inline_3050$$.element;
  this.$J$ = $baseInstance$jscomp$5_loadingSpinner$jscomp$inline_6159_promptUISrc$jscomp$inline_3050$$.$win$;
  this.$placeholder_$ = this.$V$ = this.$K$ = null;
  this.$U$ = this.$Y$.bind(this);
  $iframe$jscomp$inline_6155_opt_postPromptUI_placeholder$jscomp$inline_6158_promptUI$jscomp$inline_3049$$ ? (($config$jscomp$55_postPromptUI$jscomp$inline_3048_promptElement$jscomp$inline_3051$$ = this.$ampdoc_$.getElementById($iframe$jscomp$inline_6155_opt_postPromptUI_placeholder$jscomp$inline_6158_promptUI$jscomp$inline_3049$$)) || _.$user$$module$src$log$$().error("amp-consent-ui", "postPromptUI element with id=%s not found", $iframe$jscomp$inline_6155_opt_postPromptUI_placeholder$jscomp$inline_6158_promptUI$jscomp$inline_3049$$), 
  this.$D$ = $config$jscomp$55_postPromptUI$jscomp$inline_3048_promptElement$jscomp$inline_3051$$, this.$R$ = !0) : ($iframe$jscomp$inline_6155_opt_postPromptUI_placeholder$jscomp$inline_6158_promptUI$jscomp$inline_3049$$ = $config$jscomp$55_postPromptUI$jscomp$inline_3048_promptElement$jscomp$inline_3051$$.promptUI, $baseInstance$jscomp$5_loadingSpinner$jscomp$inline_6159_promptUISrc$jscomp$inline_3050$$ = $config$jscomp$55_postPromptUI$jscomp$inline_3048_promptElement$jscomp$inline_3051$$.promptUISrc, 
  $iframe$jscomp$inline_6155_opt_postPromptUI_placeholder$jscomp$inline_6158_promptUI$jscomp$inline_3049$$ ? (($config$jscomp$55_postPromptUI$jscomp$inline_3048_promptElement$jscomp$inline_3051$$ = this.$ampdoc_$.getElementById($iframe$jscomp$inline_6155_opt_postPromptUI_placeholder$jscomp$inline_6158_promptUI$jscomp$inline_3049$$)) && this.$F$.contains($config$jscomp$55_postPromptUI$jscomp$inline_3048_promptElement$jscomp$inline_3051$$) || _.$user$$module$src$log$$().error("amp-consent-ui", "child element of <amp-consent> with promptUI id %s not found", 
  $iframe$jscomp$inline_6155_opt_postPromptUI_placeholder$jscomp$inline_6158_promptUI$jscomp$inline_3049$$), this.$D$ = $config$jscomp$55_postPromptUI$jscomp$inline_3048_promptElement$jscomp$inline_3051$$) : $baseInstance$jscomp$5_loadingSpinner$jscomp$inline_6159_promptUISrc$jscomp$inline_3050$$ && _.$isExperimentOn$$module$src$experiments$$(this.$J$, "amp-consent-v2") && (this.$O$ = !0, $iframe$jscomp$inline_6155_opt_postPromptUI_placeholder$jscomp$inline_6158_promptUI$jscomp$inline_3049$$ = this.$F$.ownerDocument.createElement("iframe"), 
  $iframe$jscomp$inline_6155_opt_postPromptUI_placeholder$jscomp$inline_6158_promptUI$jscomp$inline_3049$$.src = $baseInstance$jscomp$5_loadingSpinner$jscomp$inline_6159_promptUISrc$jscomp$inline_3050$$, $iframe$jscomp$inline_6155_opt_postPromptUI_placeholder$jscomp$inline_6158_promptUI$jscomp$inline_3049$$.setAttribute("sandbox", "allow-scripts"), $iframe$jscomp$inline_6155_opt_postPromptUI_placeholder$jscomp$inline_6158_promptUI$jscomp$inline_3049$$.classList.add("i-amphtml-consent-ui-fill"), this.$D$ = 
  $iframe$jscomp$inline_6155_opt_postPromptUI_placeholder$jscomp$inline_6158_promptUI$jscomp$inline_3049$$, $iframe$jscomp$inline_6155_opt_postPromptUI_placeholder$jscomp$inline_6158_promptUI$jscomp$inline_3049$$ = this.$F$.ownerDocument.createElement("placeholder"), _.$toggle$$module$src$style$$($iframe$jscomp$inline_6155_opt_postPromptUI_placeholder$jscomp$inline_6158_promptUI$jscomp$inline_3049$$, !1), $iframe$jscomp$inline_6155_opt_postPromptUI_placeholder$jscomp$inline_6158_promptUI$jscomp$inline_3049$$.classList.add("i-amphtml-consent-ui-placeholder"), 
  $baseInstance$jscomp$5_loadingSpinner$jscomp$inline_6159_promptUISrc$jscomp$inline_3050$$ = _.$htmlFor$$module$src$static_template$$($iframe$jscomp$inline_6155_opt_postPromptUI_placeholder$jscomp$inline_6158_promptUI$jscomp$inline_3049$$)($_template$$module$extensions$amp_consent$0_1$consent_ui$$), $iframe$jscomp$inline_6155_opt_postPromptUI_placeholder$jscomp$inline_6158_promptUI$jscomp$inline_3049$$.appendChild($baseInstance$jscomp$5_loadingSpinner$jscomp$inline_6159_promptUISrc$jscomp$inline_3050$$), 
  this.$placeholder_$ = $iframe$jscomp$inline_6155_opt_postPromptUI_placeholder$jscomp$inline_6158_promptUI$jscomp$inline_3049$$, this.$V$ = $config$jscomp$55_postPromptUI$jscomp$inline_3048_promptElement$jscomp$inline_3051$$.clientConfig || null));
}, $JSCompiler_StaticMethods_getClientInfoPromise_$$ = function($JSCompiler_StaticMethods_getClientInfoPromise_$self$$) {
  return _.$getServicePromiseForDoc$$module$src$service$$($JSCompiler_StaticMethods_getClientInfoPromise_$self$$.$ampdoc_$, "consentStateManager").then(function($consentStateManager$$) {
    return $consentStateManager$$.$instance_$.get().then(function($consentStateManager$$) {
      var $consentInfo$jscomp$1$$ = $consentStateManager$$.consentState;
      return _.$dict$$module$src$utils$object$$({clientConfig:$JSCompiler_StaticMethods_getClientInfoPromise_$self$$.$V$, consentState:1 === $consentInfo$jscomp$1$$ ? "accepted" : 2 === $consentInfo$jscomp$1$$ ? "rejected" : "unknown", consentString:$consentStateManager$$.consentString});
    });
  });
}, $JSCompiler_StaticMethods_loadIframe_$$ = function($JSCompiler_StaticMethods_loadIframe_$self$$) {
  $JSCompiler_StaticMethods_loadIframe_$self$$.$K$ = new _.$Deferred$$module$src$utils$promise$$;
  var $classList$jscomp$4_iframePromise$$ = $JSCompiler_StaticMethods_loadIframe_$self$$.$F$.classList;
  _.$elementByTag$$module$src$dom$$($JSCompiler_StaticMethods_loadIframe_$self$$.$F$, "placeholder") || _.$insertAfterOrAtStart$$module$src$dom$$($JSCompiler_StaticMethods_loadIframe_$self$$.$F$, $JSCompiler_StaticMethods_loadIframe_$self$$.$placeholder_$, null);
  $classList$jscomp$4_iframePromise$$.add("i-amphtml-consent-ui-loading");
  _.$toggle$$module$src$style$$($JSCompiler_StaticMethods_loadIframe_$self$$.$D$, !1);
  $classList$jscomp$4_iframePromise$$ = $JSCompiler_StaticMethods_getClientInfoPromise_$$($JSCompiler_StaticMethods_loadIframe_$self$$).then(function($classList$jscomp$4_iframePromise$$) {
    $JSCompiler_StaticMethods_loadIframe_$self$$.$D$.setAttribute("name", JSON.stringify($classList$jscomp$4_iframePromise$$));
    $JSCompiler_StaticMethods_loadIframe_$self$$.$J$.addEventListener("message", $JSCompiler_StaticMethods_loadIframe_$self$$.$U$);
    _.$insertAfterOrAtStart$$module$src$dom$$($JSCompiler_StaticMethods_loadIframe_$self$$.$F$, $JSCompiler_StaticMethods_loadIframe_$self$$.$D$, null);
  });
  return window.Promise.all([$classList$jscomp$4_iframePromise$$, $JSCompiler_StaticMethods_loadIframe_$self$$.$K$.$promise$, $JSCompiler_StaticMethods_loadIframe_$self$$.$G$.$mutateElement$(function() {
    _.$toggle$$module$src$style$$($JSCompiler_StaticMethods_loadIframe_$self$$.$placeholder_$, !0);
  })]);
}, $JSCompiler_StaticMethods_showIframe_$$ = function($JSCompiler_StaticMethods_showIframe_$self$$) {
  var $classList$jscomp$5$$ = $JSCompiler_StaticMethods_showIframe_$self$$.$F$.classList;
  $classList$jscomp$5$$.add("i-amphtml-consent-ui-iframe-active");
  _.$toggle$$module$src$style$$($JSCompiler_StaticMethods_showIframe_$self$$.$placeholder_$, !1);
  _.$toggle$$module$src$style$$($JSCompiler_StaticMethods_showIframe_$self$$.$D$, !0);
  _.$setStyles$$module$src$style$$($JSCompiler_StaticMethods_showIframe_$self$$.$F$, {transform:"", transition:""});
  $JSCompiler_StaticMethods_showIframe_$self$$.$G$.$mutateElement$(function() {
    $classList$jscomp$5$$.remove("i-amphtml-consent-ui-loading");
    $JSCompiler_StaticMethods_showIframe_$self$$.$G$.$mutateElement$(function() {
      $classList$jscomp$5$$.add("i-amphtml-consent-ui-in");
      $JSCompiler_StaticMethods_showIframe_$self$$.$P$ = !0;
    });
  });
}, $JSCompiler_StaticMethods_maybeShowOverlay_$$ = function($JSCompiler_StaticMethods_maybeShowOverlay_$self$$) {
  if ($JSCompiler_StaticMethods_maybeShowOverlay_$self$$.$W$) {
    if (!$JSCompiler_StaticMethods_maybeShowOverlay_$self$$.$maskElement_$) {
      var $mask$jscomp$8$$ = $JSCompiler_StaticMethods_maybeShowOverlay_$self$$.$J$.document.createElement("div");
      $mask$jscomp$8$$.classList.add("i-amphtml-consent-ui-mask");
      $JSCompiler_StaticMethods_maybeShowOverlay_$self$$.$F$.ownerDocument.body.appendChild($mask$jscomp$8$$);
      $JSCompiler_StaticMethods_maybeShowOverlay_$self$$.$maskElement_$ = $mask$jscomp$8$$;
    }
    _.$toggle$$module$src$style$$($JSCompiler_StaticMethods_maybeShowOverlay_$self$$.$maskElement_$, !0);
    $JSCompiler_StaticMethods_maybeShowOverlay_$self$$.$I$ && (_.$JSCompiler_StaticMethods_enterOverlayMode$$($JSCompiler_StaticMethods_maybeShowOverlay_$self$$.$viewport_$), $JSCompiler_StaticMethods_maybeShowOverlay_$self$$.$I$ = !1);
  }
}, $JSCompiler_StaticMethods_updateConsentInstanceState$$ = function($JSCompiler_StaticMethods_updateConsentInstanceState$self$$, $state$jscomp$55$$, $consentStr$$) {
  $JSCompiler_StaticMethods_updateConsentInstanceState$self$$.$instance_$ ? ($JSCompiler_StaticMethods_updateConsentInstanceState$self$$.$instance_$.update($state$jscomp$55$$, $consentStr$$), $JSCompiler_StaticMethods_updateConsentInstanceState$self$$.$D$ && $JSCompiler_StaticMethods_updateConsentInstanceState$self$$.$D$($constructConsentInfo$$module$extensions$amp_consent$0_1$consent_info$$($state$jscomp$55$$, $consentStr$$))) : _.$dev$$module$src$log$$().error("CONSENT-STATE-MANAGER", "instance not registered");
}, $JSCompiler_StaticMethods_onConsentStateChange$$ = function($JSCompiler_StaticMethods_onConsentStateChange$self$$, $handler$jscomp$45$$) {
  $JSCompiler_StaticMethods_onConsentStateChange$self$$.$D$ = $handler$jscomp$45$$;
  $JSCompiler_StaticMethods_onConsentStateChange$self$$.$instance_$.get().then(function($JSCompiler_StaticMethods_onConsentStateChange$self$$) {
    $handler$jscomp$45$$($JSCompiler_StaticMethods_onConsentStateChange$self$$);
  });
}, $JSCompiler_StaticMethods_whenConsentReady$$ = function($JSCompiler_StaticMethods_whenConsentReady$self$$) {
  if ($JSCompiler_StaticMethods_whenConsentReady$self$$.$instance_$) {
    return window.Promise.resolve();
  }
  if (!$JSCompiler_StaticMethods_whenConsentReady$self$$.$F$) {
    var $deferred$jscomp$40$$ = new _.$Deferred$$module$src$utils$promise$$;
    $JSCompiler_StaticMethods_whenConsentReady$self$$.$F$ = $deferred$jscomp$40$$.$promise$;
    $JSCompiler_StaticMethods_whenConsentReady$self$$.$consentReadyResolver_$ = $deferred$jscomp$40$$.resolve;
  }
  return $JSCompiler_StaticMethods_whenConsentReady$self$$.$F$;
}, $ConsentInstance$$module$extensions$amp_consent$0_1$consent_state_manager$$ = function($ampdoc$jscomp$151$$, $id$jscomp$66$$, $config$jscomp$58$$) {
  this.$ampdoc_$ = $ampdoc$jscomp$151$$;
  this.$J$ = _.$isExperimentOn$$module$src$experiments$$($ampdoc$jscomp$151$$.$win$, "amp-consent-v2");
  this.$I$ = $id$jscomp$66$$;
  this.$G$ = null;
  this.$storagePromise_$ = _.$Services$$module$src$services$storageForDoc$$($ampdoc$jscomp$151$$);
  this.$D$ = null;
  this.$storageKey_$ = "amp-consent:" + $id$jscomp$66$$;
  this.$F$ = $config$jscomp$58$$.onUpdateHref || null;
}, $JSCompiler_StaticMethods_updateStoredValue_$$ = function($JSCompiler_StaticMethods_updateStoredValue_$self$$, $consentInfo$jscomp$2$$) {
  $JSCompiler_StaticMethods_updateStoredValue_$self$$.$storagePromise_$.then(function($storage$jscomp$6$$) {
    if ($isConsentInfoStoredValueSame$$module$extensions$amp_consent$0_1$consent_info$$($consentInfo$jscomp$2$$, $JSCompiler_StaticMethods_updateStoredValue_$self$$.$D$)) {
      a: {
        if ($JSCompiler_StaticMethods_updateStoredValue_$self$$.$J$ || $consentInfo$jscomp$2$$.consentString || void 0 !== $consentInfo$jscomp$2$$.isDirty) {
          var $JSCompiler_inline_result$jscomp$716_obj$jscomp$inline_3067_value$jscomp$212$$ = _.$map$$module$src$utils$object$$();
          var $consentState$jscomp$inline_3068$$ = $consentInfo$jscomp$2$$.consentState;
          if (1 == $consentState$jscomp$inline_3068$$) {
            $JSCompiler_inline_result$jscomp$716_obj$jscomp$inline_3067_value$jscomp$212$$.s = 1;
          } else {
            if (2 == $consentState$jscomp$inline_3068$$) {
              $JSCompiler_inline_result$jscomp$716_obj$jscomp$inline_3067_value$jscomp$212$$.s = 0;
            } else {
              $JSCompiler_inline_result$jscomp$716_obj$jscomp$inline_3067_value$jscomp$212$$ = null;
              break a;
            }
          }
          $consentInfo$jscomp$2$$.consentString && ($JSCompiler_inline_result$jscomp$716_obj$jscomp$inline_3067_value$jscomp$212$$.r = $consentInfo$jscomp$2$$.consentString);
          !0 === $consentInfo$jscomp$2$$.isDirty && ($JSCompiler_inline_result$jscomp$716_obj$jscomp$inline_3067_value$jscomp$212$$.d = 1);
          $JSCompiler_inline_result$jscomp$716_obj$jscomp$inline_3067_value$jscomp$212$$ = 0 == Object.keys($JSCompiler_inline_result$jscomp$716_obj$jscomp$inline_3067_value$jscomp$212$$) ? null : $JSCompiler_inline_result$jscomp$716_obj$jscomp$inline_3067_value$jscomp$212$$;
        } else {
          $JSCompiler_inline_result$jscomp$716_obj$jscomp$inline_3067_value$jscomp$212$$ = $calculateLegacyStateValue$$module$extensions$amp_consent$0_1$consent_info$$($consentInfo$jscomp$2$$.consentState);
        }
      }
      null != $JSCompiler_inline_result$jscomp$716_obj$jscomp$inline_3067_value$jscomp$212$$ && (_.$JSCompiler_StaticMethods_setNonBoolean$$($storage$jscomp$6$$, $JSCompiler_StaticMethods_updateStoredValue_$self$$.$storageKey_$, $JSCompiler_inline_result$jscomp$716_obj$jscomp$inline_3067_value$jscomp$212$$), $JSCompiler_StaticMethods_sendUpdateHrefRequest_$$($JSCompiler_StaticMethods_updateStoredValue_$self$$, $consentInfo$jscomp$2$$));
    }
  });
}, $JSCompiler_StaticMethods_sendUpdateHrefRequest_$$ = function($JSCompiler_StaticMethods_sendUpdateHrefRequest_$self$$, $consentInfo$jscomp$4$$) {
  if ($JSCompiler_StaticMethods_sendUpdateHrefRequest_$self$$.$F$) {
    var $consentState$jscomp$13$$ = $calculateLegacyStateValue$$module$extensions$amp_consent$0_1$consent_info$$($consentInfo$jscomp$4$$.consentState);
    _.$Services$$module$src$services$cidForDoc$$($JSCompiler_StaticMethods_sendUpdateHrefRequest_$self$$.$ampdoc_$).then(function($JSCompiler_StaticMethods_sendUpdateHrefRequest_$self$$) {
      return $JSCompiler_StaticMethods_sendUpdateHrefRequest_$self$$.get({scope:"AMP-CONSENT", createCookieIfNotPresent:!0}, window.Promise.resolve());
    }).then(function($request$jscomp$30_userId$$) {
      $request$jscomp$30_userId$$ = {consentInstanceId:$JSCompiler_StaticMethods_sendUpdateHrefRequest_$self$$.$I$, ampUserId:$request$jscomp$30_userId$$};
      null != $consentState$jscomp$13$$ && ($request$jscomp$30_userId$$.consentState = $consentState$jscomp$13$$);
      $consentInfo$jscomp$4$$.consentString && ($request$jscomp$30_userId$$.consentString = $consentInfo$jscomp$4$$.consentString);
      var $init$jscomp$16$$ = {credentials:"include", method:"POST", body:$request$jscomp$30_userId$$, ampCors:!1};
      _.$Services$$module$src$services$viewerForDoc$$($JSCompiler_StaticMethods_sendUpdateHrefRequest_$self$$.$ampdoc_$).$D$.then(function() {
        _.$JSCompiler_StaticMethods_fetchJson$$(_.$Services$$module$src$services$xhrFor$$($JSCompiler_StaticMethods_sendUpdateHrefRequest_$self$$.$ampdoc_$.$win$), $JSCompiler_StaticMethods_sendUpdateHrefRequest_$self$$.$F$, $init$jscomp$16$$);
      });
    });
  }
}, $ConsentPolicyManager$$module$extensions$amp_consent$0_1$consent_policy_manager$$ = function($ampdoc$jscomp$152_consentValueInitiated$$) {
  this.$ampdoc_$ = $ampdoc$jscomp$152_consentValueInitiated$$;
  this.$G$ = _.$map$$module$src$utils$object$$();
  this.$F$ = _.$map$$module$src$utils$object$$();
  this.$O$ = _.$getServicePromiseForDoc$$module$src$service$$(this.$ampdoc_$, "consentStateManager");
  this.$R$ = new _.$Deferred$$module$src$utils$promise$$;
  $ampdoc$jscomp$152_consentValueInitiated$$ = new _.$Deferred$$module$src$utils$promise$$;
  this.$V$ = $ampdoc$jscomp$152_consentValueInitiated$$.$promise$;
  this.$J$ = $ampdoc$jscomp$152_consentValueInitiated$$.resolve;
  this.$U$ = new _.$Observable$$module$src$observable$$;
  this.$I$ = this.$D$ = this.$P$ = null;
}, $JSCompiler_StaticMethods_registerConsentPolicyInstance$$ = function($JSCompiler_StaticMethods_registerConsentPolicyInstance$self$$, $policyId$jscomp$6$$, $config$jscomp$59$$) {
  if (!$JSCompiler_StaticMethods_registerConsentPolicyInstance$self$$.$F$[$policyId$jscomp$6$$]) {
    var $waitFor$$ = Object.keys($config$jscomp$59$$.waitFor || {});
    if (1 !== $waitFor$$.length || $waitFor$$[0] !== $JSCompiler_StaticMethods_registerConsentPolicyInstance$self$$.$P$) {
      _.$user$$module$src$log$$().error("consent-policy-manager", "invalid waitFor value, consent policy will never resolve");
    } else {
      var $instance$jscomp$10$$ = new $ConsentPolicyInstance$$module$extensions$amp_consent$0_1$consent_policy_manager$$($config$jscomp$59$$);
      $JSCompiler_StaticMethods_registerConsentPolicyInstance$self$$.$F$[$policyId$jscomp$6$$] = $instance$jscomp$10$$;
      $JSCompiler_StaticMethods_registerConsentPolicyInstance$self$$.$G$[$policyId$jscomp$6$$] && ($JSCompiler_StaticMethods_registerConsentPolicyInstance$self$$.$G$[$policyId$jscomp$6$$].resolve(), $JSCompiler_StaticMethods_registerConsentPolicyInstance$self$$.$G$[$policyId$jscomp$6$$] = null);
      $JSCompiler_StaticMethods_registerConsentPolicyInstance$self$$.$V$.then(function() {
        $JSCompiler_StaticMethods_registerConsentPolicyInstance$self$$.$D$ && $instance$jscomp$10$$.evaluate($JSCompiler_StaticMethods_registerConsentPolicyInstance$self$$.$D$);
        $JSCompiler_StaticMethods_registerConsentPolicyInstance$self$$.$U$.add(function($JSCompiler_StaticMethods_registerConsentPolicyInstance$self$$) {
          $instance$jscomp$10$$.evaluate($JSCompiler_StaticMethods_registerConsentPolicyInstance$self$$);
        });
        $JSCompiler_StaticMethods_registerConsentPolicyInstance$self$$.$R$.$promise$.then(function() {
          $JSCompiler_StaticMethods_startTimeout$$($instance$jscomp$10$$, $JSCompiler_StaticMethods_registerConsentPolicyInstance$self$$.$ampdoc_$.$win$);
        });
      });
    }
  }
}, $JSCompiler_StaticMethods_ConsentPolicyManager$$module$extensions$amp_consent$0_1$consent_policy_manager_prototype$init_$$ = function($JSCompiler_StaticMethods_ConsentPolicyManager$$module$extensions$amp_consent$0_1$consent_policy_manager_prototype$init_$self$$) {
  $JSCompiler_StaticMethods_ConsentPolicyManager$$module$extensions$amp_consent$0_1$consent_policy_manager_prototype$init_$self$$.$O$.then(function($manager$jscomp$13$$) {
    $JSCompiler_StaticMethods_whenConsentReady$$($manager$jscomp$13$$).then(function() {
      $JSCompiler_StaticMethods_onConsentStateChange$$($manager$jscomp$13$$, function($manager$jscomp$13$$) {
        var $info$jscomp$13$$ = $manager$jscomp$13$$.consentState, $prevConsentStr$jscomp$inline_3075$$ = $JSCompiler_StaticMethods_ConsentPolicyManager$$module$extensions$amp_consent$0_1$consent_policy_manager_prototype$init_$self$$.$I$;
        $JSCompiler_StaticMethods_ConsentPolicyManager$$module$extensions$amp_consent$0_1$consent_policy_manager_prototype$init_$self$$.$I$ = $manager$jscomp$13$$.consentString;
        5 !== $info$jscomp$13$$ && (4 == $info$jscomp$13$$ ? 1 != $JSCompiler_StaticMethods_ConsentPolicyManager$$module$extensions$amp_consent$0_1$consent_policy_manager_prototype$init_$self$$.$D$ && 2 != $JSCompiler_StaticMethods_ConsentPolicyManager$$module$extensions$amp_consent$0_1$consent_policy_manager_prototype$init_$self$$.$D$ && ($JSCompiler_StaticMethods_ConsentPolicyManager$$module$extensions$amp_consent$0_1$consent_policy_manager_prototype$init_$self$$.$D$ = 4) : 3 == $info$jscomp$13$$ ? 
        (null === $JSCompiler_StaticMethods_ConsentPolicyManager$$module$extensions$amp_consent$0_1$consent_policy_manager_prototype$init_$self$$.$D$ && ($JSCompiler_StaticMethods_ConsentPolicyManager$$module$extensions$amp_consent$0_1$consent_policy_manager_prototype$init_$self$$.$D$ = 5), $JSCompiler_StaticMethods_ConsentPolicyManager$$module$extensions$amp_consent$0_1$consent_policy_manager_prototype$init_$self$$.$I$ = $prevConsentStr$jscomp$inline_3075$$) : $JSCompiler_StaticMethods_ConsentPolicyManager$$module$extensions$amp_consent$0_1$consent_policy_manager_prototype$init_$self$$.$D$ = 
        $info$jscomp$13$$, $JSCompiler_StaticMethods_ConsentPolicyManager$$module$extensions$amp_consent$0_1$consent_policy_manager_prototype$init_$self$$.$U$.$fire$($JSCompiler_StaticMethods_ConsentPolicyManager$$module$extensions$amp_consent$0_1$consent_policy_manager_prototype$init_$self$$.$D$));
        $JSCompiler_StaticMethods_ConsentPolicyManager$$module$extensions$amp_consent$0_1$consent_policy_manager_prototype$init_$self$$.$J$ && ($JSCompiler_StaticMethods_ConsentPolicyManager$$module$extensions$amp_consent$0_1$consent_policy_manager_prototype$init_$self$$.$J$(), $JSCompiler_StaticMethods_ConsentPolicyManager$$module$extensions$amp_consent$0_1$consent_policy_manager_prototype$init_$self$$.$J$ = null);
      });
    });
  });
}, $JSCompiler_StaticMethods_whenPolicyInstanceRegistered_$$ = function($JSCompiler_StaticMethods_whenPolicyInstanceRegistered_$self$$, $policyId$jscomp$11$$) {
  if ($JSCompiler_StaticMethods_whenPolicyInstanceRegistered_$self$$.$F$[$policyId$jscomp$11$$]) {
    return window.Promise.resolve();
  }
  $JSCompiler_StaticMethods_whenPolicyInstanceRegistered_$self$$.$G$[$policyId$jscomp$11$$] || ($JSCompiler_StaticMethods_whenPolicyInstanceRegistered_$self$$.$G$[$policyId$jscomp$11$$] = new _.$Deferred$$module$src$utils$promise$$);
  return $JSCompiler_StaticMethods_whenPolicyInstanceRegistered_$self$$.$G$[$policyId$jscomp$11$$].$promise$;
}, $ConsentPolicyInstance$$module$extensions$amp_consent$0_1$consent_policy_manager$$ = function($config$jscomp$60$$) {
  this.$config_$ = $config$jscomp$60$$;
  var $readyDeferred$jscomp$1$$ = new _.$Deferred$$module$src$utils$promise$$;
  this.$G$ = $readyDeferred$jscomp$1$$.$promise$;
  this.$D$ = $readyDeferred$jscomp$1$$.resolve;
  this.$F$ = 4;
  this.$I$ = $config$jscomp$60$$.unblockOn || [1, 3];
}, $JSCompiler_StaticMethods_startTimeout$$ = function($JSCompiler_StaticMethods_startTimeout$self$$, $win$jscomp$342$$) {
  var $timeoutConfig$$ = $JSCompiler_StaticMethods_startTimeout$self$$.$config_$.timeout, $timeoutSecond$$ = null, $fallbackState$$;
  void 0 != $timeoutConfig$$ && (_.$isObject$$module$src$types$$($timeoutConfig$$) ? ($timeoutConfig$$.fallbackAction && "reject" == $timeoutConfig$$.fallbackAction ? $fallbackState$$ = 2 : $timeoutConfig$$.fallbackAction && "dismiss" != $timeoutConfig$$.fallbackAction && _.$user$$module$src$log$$().error("consent-policy-manager", "unsupported fallbackAction %s", $timeoutConfig$$.fallbackAction), $timeoutSecond$$ = $timeoutConfig$$.seconds) : $timeoutSecond$$ = $timeoutConfig$$);
  null != $timeoutSecond$$ && $win$jscomp$342$$.setTimeout(function() {
    $fallbackState$$ = $fallbackState$$ || 5;
    $JSCompiler_StaticMethods_startTimeout$self$$.evaluate($fallbackState$$, !0);
  }, 1000 * $timeoutSecond$$);
}, $ConsentConfig$$module$extensions$amp_consent$0_1$consent_config$$ = function($element$jscomp$380$$) {
  this.$element_$ = $element$jscomp$380$$;
  this.$D$ = $element$jscomp$380$$.ownerDocument.defaultView;
  this.$config_$ = null;
}, $JSCompiler_StaticMethods_getConsentConfig$$ = function($JSCompiler_StaticMethods_getConsentConfig$self$$) {
  var $config$jscomp$61_id$jscomp$67$$ = Object.keys($JSCompiler_StaticMethods_ConsentConfig$$module$extensions$amp_consent$0_1$consent_config_prototype$getConfig_$$($JSCompiler_StaticMethods_getConsentConfig$self$$).consents)[0], $consentConfig$$ = $JSCompiler_StaticMethods_ConsentConfig$$module$extensions$amp_consent$0_1$consent_config_prototype$getConfig_$$($JSCompiler_StaticMethods_getConsentConfig$self$$).consents[$config$jscomp$61_id$jscomp$67$$];
  $config$jscomp$61_id$jscomp$67$$ = _.$dict$$module$src$utils$object$$({storageKey:$config$jscomp$61_id$jscomp$67$$});
  for (var $keys$jscomp$9$$ = Object.keys($consentConfig$$), $i$jscomp$279$$ = 0; $i$jscomp$279$$ < $keys$jscomp$9$$.length; $i$jscomp$279$$++) {
    $config$jscomp$61_id$jscomp$67$$[$keys$jscomp$9$$[$i$jscomp$279$$]] = $consentConfig$$[$keys$jscomp$9$$[$i$jscomp$279$$]];
  }
  $JSCompiler_StaticMethods_ConsentConfig$$module$extensions$amp_consent$0_1$consent_config_prototype$getConfig_$$($JSCompiler_StaticMethods_getConsentConfig$self$$).postPromptUI && ($config$jscomp$61_id$jscomp$67$$.postPromptUI = $JSCompiler_StaticMethods_ConsentConfig$$module$extensions$amp_consent$0_1$consent_config_prototype$getConfig_$$($JSCompiler_StaticMethods_getConsentConfig$self$$).postPromptUI);
  $JSCompiler_StaticMethods_ConsentConfig$$module$extensions$amp_consent$0_1$consent_config_prototype$getConfig_$$($JSCompiler_StaticMethods_getConsentConfig$self$$).clientConfig && ($config$jscomp$61_id$jscomp$67$$.clientConfig = $JSCompiler_StaticMethods_ConsentConfig$$module$extensions$amp_consent$0_1$consent_config_prototype$getConfig_$$($JSCompiler_StaticMethods_getConsentConfig$self$$).clientConfig);
  $JSCompiler_StaticMethods_ConsentConfig$$module$extensions$amp_consent$0_1$consent_config_prototype$getConfig_$$($JSCompiler_StaticMethods_getConsentConfig$self$$).uiConfig && ($config$jscomp$61_id$jscomp$67$$.uiConfig = $JSCompiler_StaticMethods_ConsentConfig$$module$extensions$amp_consent$0_1$consent_config_prototype$getConfig_$$($JSCompiler_StaticMethods_getConsentConfig$self$$).uiConfig);
  return $config$jscomp$61_id$jscomp$67$$;
}, $JSCompiler_StaticMethods_ConsentConfig$$module$extensions$amp_consent$0_1$consent_config_prototype$getConfig_$$ = function($JSCompiler_StaticMethods_ConsentConfig$$module$extensions$amp_consent$0_1$consent_config_prototype$getConfig_$self$$) {
  if (!$JSCompiler_StaticMethods_ConsentConfig$$module$extensions$amp_consent$0_1$consent_config_prototype$getConfig_$self$$.$config_$) {
    try {
      var $JSCompiler_inline_result$jscomp$5632_config$jscomp$inline_3082_inlineConfig$jscomp$inline_3080$$ = _.$getChildJsonConfig$$module$src$json$$($JSCompiler_StaticMethods_ConsentConfig$$module$extensions$amp_consent$0_1$consent_config_prototype$getConfig_$self$$.$element_$);
    } catch ($e$243$jscomp$inline_6170$$) {
      throw _.$user$$module$src$log$$($JSCompiler_StaticMethods_ConsentConfig$$module$extensions$amp_consent$0_1$consent_config_prototype$getConfig_$self$$.$element_$).$createError$("%s: %s", "amp-consent/consent-config", $e$243$jscomp$inline_6170$$);
    }
    var $JSCompiler_inline_result$jscomp$5633_constentInstance$jscomp$inline_6175_keys$jscomp$inline_3083_type$jscomp$inline_6173$$;
    if (_.$isExperimentOn$$module$src$experiments$$($JSCompiler_StaticMethods_ConsentConfig$$module$extensions$amp_consent$0_1$consent_config_prototype$getConfig_$self$$.$D$, "amp-consent-v2")) {
      if ($JSCompiler_inline_result$jscomp$5633_constentInstance$jscomp$inline_6175_keys$jscomp$inline_3083_type$jscomp$inline_6173$$ = $JSCompiler_StaticMethods_ConsentConfig$$module$extensions$amp_consent$0_1$consent_config_prototype$getConfig_$self$$.$element_$.getAttribute("type")) {
        var $config$jscomp$inline_6177_importConfig$jscomp$inline_6174$$ = $CMP_CONFIG$$module$extensions$amp_consent$0_1$cmps$$[$JSCompiler_inline_result$jscomp$5633_constentInstance$jscomp$inline_6175_keys$jscomp$inline_3083_type$jscomp$inline_6173$$];
        $JSCompiler_inline_result$jscomp$5633_constentInstance$jscomp$inline_6175_keys$jscomp$inline_3083_type$jscomp$inline_6173$$ = $config$jscomp$inline_6177_importConfig$jscomp$inline_6174$$.consentInstanceId;
        var $cmpConfig$jscomp$inline_6176_i$jscomp$inline_3084$$ = _.$dict$$module$src$utils$object$$({consents:_.$dict$$module$src$utils$object$$({})});
        $config$jscomp$inline_6177_importConfig$jscomp$inline_6174$$ = Object.assign({}, $config$jscomp$inline_6177_importConfig$jscomp$inline_6174$$);
        delete $config$jscomp$inline_6177_importConfig$jscomp$inline_6174$$.consentInstanceId;
        $cmpConfig$jscomp$inline_6176_i$jscomp$inline_3084$$.consents[$JSCompiler_inline_result$jscomp$5633_constentInstance$jscomp$inline_6175_keys$jscomp$inline_3083_type$jscomp$inline_6173$$] = $config$jscomp$inline_6177_importConfig$jscomp$inline_6174$$;
        $JSCompiler_inline_result$jscomp$5633_constentInstance$jscomp$inline_6175_keys$jscomp$inline_3083_type$jscomp$inline_6173$$ = $cmpConfig$jscomp$inline_6176_i$jscomp$inline_3084$$;
      } else {
        $JSCompiler_inline_result$jscomp$5633_constentInstance$jscomp$inline_6175_keys$jscomp$inline_3083_type$jscomp$inline_6173$$ = null;
      }
    } else {
      $JSCompiler_inline_result$jscomp$5633_constentInstance$jscomp$inline_6175_keys$jscomp$inline_3083_type$jscomp$inline_6173$$ = null;
    }
    $JSCompiler_inline_result$jscomp$5632_config$jscomp$inline_3082_inlineConfig$jscomp$inline_3080$$ = _.$deepMerge$$module$src$utils$object$$($JSCompiler_inline_result$jscomp$5633_constentInstance$jscomp$inline_6175_keys$jscomp$inline_3083_type$jscomp$inline_6173$$ || {}, $JSCompiler_inline_result$jscomp$5632_config$jscomp$inline_3082_inlineConfig$jscomp$inline_3080$$ || {}, 1);
    if ($JSCompiler_inline_result$jscomp$5632_config$jscomp$inline_3082_inlineConfig$jscomp$inline_3080$$.policy) {
      for ($JSCompiler_inline_result$jscomp$5633_constentInstance$jscomp$inline_6175_keys$jscomp$inline_3083_type$jscomp$inline_6173$$ = Object.keys($JSCompiler_inline_result$jscomp$5632_config$jscomp$inline_3082_inlineConfig$jscomp$inline_3080$$.policy), $cmpConfig$jscomp$inline_6176_i$jscomp$inline_3084$$ = 0; $cmpConfig$jscomp$inline_6176_i$jscomp$inline_3084$$ < $JSCompiler_inline_result$jscomp$5633_constentInstance$jscomp$inline_6175_keys$jscomp$inline_3083_type$jscomp$inline_6173$$.length; $cmpConfig$jscomp$inline_6176_i$jscomp$inline_3084$$++) {
        "default" != $JSCompiler_inline_result$jscomp$5633_constentInstance$jscomp$inline_6175_keys$jscomp$inline_3083_type$jscomp$inline_6173$$[$cmpConfig$jscomp$inline_6176_i$jscomp$inline_3084$$] && (_.$user$$module$src$log$$().$Log$$module$src$log_prototype$warn$("amp-consent/consent-config", "policy %s is currently not supported and will be ignored", $JSCompiler_inline_result$jscomp$5633_constentInstance$jscomp$inline_6175_keys$jscomp$inline_3083_type$jscomp$inline_6173$$[$cmpConfig$jscomp$inline_6176_i$jscomp$inline_3084$$]), 
        delete $JSCompiler_inline_result$jscomp$5632_config$jscomp$inline_3082_inlineConfig$jscomp$inline_3080$$.policy[$JSCompiler_inline_result$jscomp$5633_constentInstance$jscomp$inline_6175_keys$jscomp$inline_3083_type$jscomp$inline_6173$$[$cmpConfig$jscomp$inline_6176_i$jscomp$inline_3084$$]]);
      }
    }
    $JSCompiler_StaticMethods_ConsentConfig$$module$extensions$amp_consent$0_1$consent_config_prototype$getConfig_$self$$.$config_$ = $JSCompiler_inline_result$jscomp$5632_config$jscomp$inline_3082_inlineConfig$jscomp$inline_3080$$;
  }
  return $JSCompiler_StaticMethods_ConsentConfig$$module$extensions$amp_consent$0_1$consent_config_prototype$getConfig_$self$$.$config_$;
}, $expandPolicyConfig$$module$extensions$amp_consent$0_1$consent_config$$ = function($policyConfig$$, $consentId$jscomp$1_defaultPolicy$$) {
  var $defaultWaitForItems$$ = {};
  $defaultWaitForItems$$[$consentId$jscomp$1_defaultPolicy$$] = void 0;
  $consentId$jscomp$1_defaultPolicy$$ = {waitFor:$defaultWaitForItems$$};
  var $unblockOnAll$$ = [4, 1, 2, 3], $rejectAllOnZero$$ = {waitFor:$defaultWaitForItems$$, timeout:{seconds:0, fallbackAction:"reject"}, unblockOn:$unblockOnAll$$};
  $policyConfig$$._till_responded = {waitFor:$defaultWaitForItems$$, unblockOn:$unblockOnAll$$};
  $policyConfig$$._till_accepted = $consentId$jscomp$1_defaultPolicy$$;
  $policyConfig$$._auto_reject = $rejectAllOnZero$$;
  if ($policyConfig$$ && $policyConfig$$["default"]) {
    return $policyConfig$$;
  }
  $policyConfig$$["default"] = $consentId$jscomp$1_defaultPolicy$$;
  return $policyConfig$$;
}, $AmpConsent$$module$extensions$amp_consent$0_1$amp_consent$$ = function($$jscomp$super$this$jscomp$34_element$jscomp$381$$) {
  $$jscomp$super$this$jscomp$34_element$jscomp$381$$ = window.AMP.BaseElement.call(this, $$jscomp$super$this$jscomp$34_element$jscomp$381$$) || this;
  $$jscomp$super$this$jscomp$34_element$jscomp$381$$.$consentStateManager_$ = null;
  $$jscomp$super$this$jscomp$34_element$jscomp$381$$.$consentPolicyManager_$ = null;
  $$jscomp$super$this$jscomp$34_element$jscomp$381$$.$notificationUiManager_$ = null;
  $$jscomp$super$this$jscomp$34_element$jscomp$381$$.$consentUI_$ = null;
  $$jscomp$super$this$jscomp$34_element$jscomp$381$$.$consentConfig_$ = null;
  $$jscomp$super$this$jscomp$34_element$jscomp$381$$.$policyConfig_$ = null;
  $$jscomp$super$this$jscomp$34_element$jscomp$381$$.$postPromptUI_$ = null;
  $$jscomp$super$this$jscomp$34_element$jscomp$381$$.$dialogResolver_$ = null;
  $$jscomp$super$this$jscomp$34_element$jscomp$381$$.$isPromptUIOn_$ = !1;
  $$jscomp$super$this$jscomp$34_element$jscomp$381$$.$consentUIPending_$ = !1;
  $$jscomp$super$this$jscomp$34_element$jscomp$381$$.$vsync_$ = _.$JSCompiler_StaticMethods_getVsync$$($$jscomp$super$this$jscomp$34_element$jscomp$381$$);
  $$jscomp$super$this$jscomp$34_element$jscomp$381$$.$remoteConfigPromise_$ = null;
  $$jscomp$super$this$jscomp$34_element$jscomp$381$$.$consentId_$ = null;
  return $$jscomp$super$this$jscomp$34_element$jscomp$381$$;
}, $JSCompiler_StaticMethods_enableInteractions_$$ = function($JSCompiler_StaticMethods_enableInteractions_$self$$) {
  _.$JSCompiler_StaticMethods_registerAction$$($JSCompiler_StaticMethods_enableInteractions_$self$$, "accept", function() {
    $JSCompiler_StaticMethods_AmpConsent$$module$extensions$amp_consent$0_1$amp_consent_prototype$handleAction_$$($JSCompiler_StaticMethods_enableInteractions_$self$$, "accept");
  });
  _.$JSCompiler_StaticMethods_registerAction$$($JSCompiler_StaticMethods_enableInteractions_$self$$, "reject", function() {
    $JSCompiler_StaticMethods_AmpConsent$$module$extensions$amp_consent$0_1$amp_consent_prototype$handleAction_$$($JSCompiler_StaticMethods_enableInteractions_$self$$, "reject");
  });
  _.$JSCompiler_StaticMethods_registerAction$$($JSCompiler_StaticMethods_enableInteractions_$self$$, "dismiss", function() {
    $JSCompiler_StaticMethods_AmpConsent$$module$extensions$amp_consent$0_1$amp_consent_prototype$handleAction_$$($JSCompiler_StaticMethods_enableInteractions_$self$$, "dismiss");
  });
  _.$JSCompiler_StaticMethods_registerAction$$($JSCompiler_StaticMethods_enableInteractions_$self$$, "prompt", function() {
    $JSCompiler_StaticMethods_scheduleDisplay_$$($JSCompiler_StaticMethods_enableInteractions_$self$$);
  });
  $JSCompiler_StaticMethods_enableExternalInteractions_$$($JSCompiler_StaticMethods_enableInteractions_$self$$);
}, $JSCompiler_StaticMethods_enableExternalInteractions_$$ = function($JSCompiler_StaticMethods_enableExternalInteractions_$self$$) {
  $JSCompiler_StaticMethods_enableExternalInteractions_$self$$.$win$.addEventListener("message", function($event$jscomp$101$$) {
    if ($JSCompiler_StaticMethods_enableExternalInteractions_$self$$.$isPromptUIOn_$) {
      var $data$jscomp$119$$ = $event$jscomp$101$$.data;
      if ($data$jscomp$119$$ && "consent-response" == $data$jscomp$119$$.type) {
        if ($data$jscomp$119$$.action) {
          if (_.$isExperimentOn$$module$src$experiments$$($JSCompiler_StaticMethods_enableExternalInteractions_$self$$.$win$, "amp-consent-v2") && void 0 !== $data$jscomp$119$$.info) {
            "string" != typeof $data$jscomp$119$$.info && (_.$user$$module$src$log$$().error("amp-consent", "consent-response info only supports string, %s, treated as undefined", $data$jscomp$119$$.info), $data$jscomp$119$$.info = void 0);
            "dismiss" === $data$jscomp$119$$.action && ($data$jscomp$119$$.info && $JSCompiler_StaticMethods_enableExternalInteractions_$self$$.$user$().error("amp-consent", "Consent string value %s not applicable on user dismiss, stored value will be kept and used", $consentString$jscomp$1$$), $data$jscomp$119$$.info = void 0);
            var $consentString$jscomp$1$$ = $data$jscomp$119$$.info;
          }
          for (var $iframes$$ = $JSCompiler_StaticMethods_enableExternalInteractions_$self$$.element.querySelectorAll("iframe"), $i$jscomp$283$$ = 0; $i$jscomp$283$$ < $iframes$$.length; $i$jscomp$283$$++) {
            if ($iframes$$[$i$jscomp$283$$].contentWindow === $event$jscomp$101$$.source) {
              $JSCompiler_StaticMethods_AmpConsent$$module$extensions$amp_consent$0_1$amp_consent_prototype$handleAction_$$($JSCompiler_StaticMethods_enableExternalInteractions_$self$$, $data$jscomp$119$$.action, $consentString$jscomp$1$$);
              break;
            }
          }
        } else {
          _.$user$$module$src$log$$().error("amp-consent", "consent-response message missing required info");
        }
      }
    }
  });
}, $JSCompiler_StaticMethods_scheduleDisplay_$$ = function($JSCompiler_StaticMethods_scheduleDisplay_$self$$) {
  $JSCompiler_StaticMethods_scheduleDisplay_$self$$.$notificationUiManager_$ || _.$dev$$module$src$log$$().error("amp-consent", "notification ui manager not found");
  !$JSCompiler_StaticMethods_scheduleDisplay_$self$$.$consentUIPending_$ && $JSCompiler_StaticMethods_scheduleDisplay_$self$$.$consentUI_$ && ($JSCompiler_StaticMethods_scheduleDisplay_$self$$.$consentUIPending_$ = !0, _.$JSCompiler_StaticMethods_registerUI$$($JSCompiler_StaticMethods_scheduleDisplay_$self$$.$notificationUiManager_$, $JSCompiler_StaticMethods_scheduleDisplay_$self$$.$D$.bind($JSCompiler_StaticMethods_scheduleDisplay_$self$$)));
}, $JSCompiler_StaticMethods_AmpConsent$$module$extensions$amp_consent$0_1$amp_consent_prototype$handleAction_$$ = function($JSCompiler_StaticMethods_AmpConsent$$module$extensions$amp_consent$0_1$amp_consent_prototype$handleAction_$self$$, $action$jscomp$19$$, $consentString$jscomp$2$$) {
  _.$isEnumValue$$module$src$types$$($ACTION_TYPE$$module$extensions$amp_consent$0_1$amp_consent$$, $action$jscomp$19$$) && $JSCompiler_StaticMethods_AmpConsent$$module$extensions$amp_consent$0_1$amp_consent_prototype$handleAction_$self$$.$isPromptUIOn_$ && ($JSCompiler_StaticMethods_AmpConsent$$module$extensions$amp_consent$0_1$amp_consent_prototype$handleAction_$self$$.$consentStateManager_$ ? ("accept" == $action$jscomp$19$$ ? $JSCompiler_StaticMethods_updateConsentInstanceState$$($JSCompiler_StaticMethods_AmpConsent$$module$extensions$amp_consent$0_1$amp_consent_prototype$handleAction_$self$$.$consentStateManager_$, 
  1, $consentString$jscomp$2$$) : "reject" == $action$jscomp$19$$ ? $JSCompiler_StaticMethods_updateConsentInstanceState$$($JSCompiler_StaticMethods_AmpConsent$$module$extensions$amp_consent$0_1$amp_consent_prototype$handleAction_$self$$.$consentStateManager_$, 2, $consentString$jscomp$2$$) : "dismiss" == $action$jscomp$19$$ && $JSCompiler_StaticMethods_updateConsentInstanceState$$($JSCompiler_StaticMethods_AmpConsent$$module$extensions$amp_consent$0_1$amp_consent_prototype$handleAction_$self$$.$consentStateManager_$, 
  3), $JSCompiler_StaticMethods_AmpConsent$$module$extensions$amp_consent$0_1$amp_consent_prototype$handleAction_$self$$.$isPromptUIOn_$ || _.$dev$$module$src$log$$().error("amp-consent", "%s no consent ui to hide"), $JSCompiler_StaticMethods_AmpConsent$$module$extensions$amp_consent$0_1$amp_consent_prototype$handleAction_$self$$.$consentUI_$.$hide$(), $JSCompiler_StaticMethods_AmpConsent$$module$extensions$amp_consent$0_1$amp_consent_prototype$handleAction_$self$$.$isPromptUIOn_$ = !1, $JSCompiler_StaticMethods_AmpConsent$$module$extensions$amp_consent$0_1$amp_consent_prototype$handleAction_$self$$.$dialogResolver_$ && 
  ($JSCompiler_StaticMethods_AmpConsent$$module$extensions$amp_consent$0_1$amp_consent_prototype$handleAction_$self$$.$dialogResolver_$(), $JSCompiler_StaticMethods_AmpConsent$$module$extensions$amp_consent$0_1$amp_consent_prototype$handleAction_$self$$.$dialogResolver_$ = null), $JSCompiler_StaticMethods_AmpConsent$$module$extensions$amp_consent$0_1$amp_consent_prototype$handleAction_$self$$.$consentUIPending_$ = !1) : _.$dev$$module$src$log$$().error("amp-consent", "No consent state manager"));
}, $JSCompiler_StaticMethods_AmpConsent$$module$extensions$amp_consent$0_1$amp_consent_prototype$init_$$ = function($JSCompiler_StaticMethods_AmpConsent$$module$extensions$amp_consent$0_1$amp_consent_prototype$init_$self$$) {
  $JSCompiler_StaticMethods_passSharedData_$$($JSCompiler_StaticMethods_AmpConsent$$module$extensions$amp_consent$0_1$amp_consent_prototype$init_$self$$);
  $JSCompiler_StaticMethods_getConsentRequiredPromise_$$($JSCompiler_StaticMethods_AmpConsent$$module$extensions$amp_consent$0_1$amp_consent_prototype$init_$self$$).then(function($isConsentRequired$$) {
    return $JSCompiler_StaticMethods_initPromptUI_$$($JSCompiler_StaticMethods_AmpConsent$$module$extensions$amp_consent$0_1$amp_consent_prototype$init_$self$$, $isConsentRequired$$);
  }).then(function($isPostPromptUIRequired$$) {
    $isPostPromptUIRequired$$ && $JSCompiler_StaticMethods_handlePostPromptUI_$$($JSCompiler_StaticMethods_AmpConsent$$module$extensions$amp_consent$0_1$amp_consent_prototype$init_$self$$);
    $JSCompiler_StaticMethods_AmpConsent$$module$extensions$amp_consent$0_1$amp_consent_prototype$init_$self$$.$consentPolicyManager_$.$R$.resolve();
  }).catch(function() {
  });
  $JSCompiler_StaticMethods_enableInteractions_$$($JSCompiler_StaticMethods_AmpConsent$$module$extensions$amp_consent$0_1$amp_consent_prototype$init_$self$$);
}, $JSCompiler_StaticMethods_getConsentRequiredPromise_$$ = function($JSCompiler_StaticMethods_getConsentRequiredPromise_$self$$) {
  var $consentRequiredPromise$$ = null;
  $JSCompiler_StaticMethods_getConsentRequiredPromise_$self$$.$consentConfig_$.promptIfUnknownForGeoGroup ? $consentRequiredPromise$$ = $JSCompiler_StaticMethods_isConsentRequiredGeo_$$($JSCompiler_StaticMethods_getConsentRequiredPromise_$self$$, $JSCompiler_StaticMethods_getConsentRequiredPromise_$self$$.$consentConfig_$.promptIfUnknownForGeoGroup) : $consentRequiredPromise$$ = $JSCompiler_StaticMethods_getConsentRemote_$$($JSCompiler_StaticMethods_getConsentRequiredPromise_$self$$).then(function($consentRequiredPromise$$) {
    return $consentRequiredPromise$$ && _.$hasOwn$$module$src$utils$object$$($consentRequiredPromise$$, "promptIfUnknown") ? !!$consentRequiredPromise$$.promptIfUnknown : ($JSCompiler_StaticMethods_getConsentRequiredPromise_$self$$.$user$().error("amp-consent", "Expecting promptIfUnknown from checkConsentHref when promptIfUnknownForGeoGroup is not specified"), !1);
  });
  return $consentRequiredPromise$$.then(function($JSCompiler_StaticMethods_getConsentRequiredPromise_$self$$) {
    return !!$JSCompiler_StaticMethods_getConsentRequiredPromise_$self$$;
  });
}, $JSCompiler_StaticMethods_passSharedData_$$ = function($JSCompiler_StaticMethods_passSharedData_$self$$) {
  var $sharedDataPromise$jscomp$2$$ = $JSCompiler_StaticMethods_getConsentRemote_$$($JSCompiler_StaticMethods_passSharedData_$self$$).then(function($JSCompiler_StaticMethods_passSharedData_$self$$) {
    return $JSCompiler_StaticMethods_passSharedData_$self$$ && void 0 !== $JSCompiler_StaticMethods_passSharedData_$self$$.sharedData ? $JSCompiler_StaticMethods_passSharedData_$self$$.sharedData : null;
  });
  $JSCompiler_StaticMethods_passSharedData_$self$$.$consentStateManager_$.$instance_$.$G$ = $sharedDataPromise$jscomp$2$$;
}, $JSCompiler_StaticMethods_isConsentRequiredGeo_$$ = function($JSCompiler_StaticMethods_isConsentRequiredGeo_$self$$, $geoGroup$jscomp$1$$) {
  return _.$Services$$module$src$services$geoForDocOrNull$$($JSCompiler_StaticMethods_isConsentRequiredGeo_$self$$.element).then(function($JSCompiler_StaticMethods_isConsentRequiredGeo_$self$$) {
    return 2 == $JSCompiler_StaticMethods_isConsentRequiredGeo_$self$$.$isInCountryGroup$($geoGroup$jscomp$1$$);
  });
}, $JSCompiler_StaticMethods_getConsentRemote_$$ = function($JSCompiler_StaticMethods_getConsentRemote_$self$$) {
  if ($JSCompiler_StaticMethods_getConsentRemote_$self$$.$remoteConfigPromise_$) {
    return $JSCompiler_StaticMethods_getConsentRemote_$self$$.$remoteConfigPromise_$;
  }
  if ($JSCompiler_StaticMethods_getConsentRemote_$self$$.$consentConfig_$.checkConsentHref) {
    var $href$jscomp$10_request$jscomp$31$$ = {consentInstanceId:$JSCompiler_StaticMethods_getConsentRemote_$self$$.$consentId_$};
    $JSCompiler_StaticMethods_getConsentRemote_$self$$.$consentConfig_$.clientConfig && ($href$jscomp$10_request$jscomp$31$$.clientConfig = $JSCompiler_StaticMethods_getConsentRemote_$self$$.$consentConfig_$.clientConfig);
    var $init$jscomp$17$$ = {credentials:"include", method:"POST", body:$href$jscomp$10_request$jscomp$31$$, requireAmpResponseSourceOrigin:!1};
    $href$jscomp$10_request$jscomp$31$$ = $JSCompiler_StaticMethods_getConsentRemote_$self$$.$consentConfig_$.checkConsentHref;
    var $ampdoc$jscomp$153$$ = $JSCompiler_StaticMethods_getConsentRemote_$self$$.$getAmpDoc$(), $sourceBase$$ = _.$getSourceUrl$$module$src$url$$($ampdoc$jscomp$153$$.$AmpDoc$$module$src$service$ampdoc_impl_prototype$getUrl$()), $resolvedHref$$ = _.$resolveRelativeUrl$$module$src$url$$($href$jscomp$10_request$jscomp$31$$, $sourceBase$$);
    $JSCompiler_StaticMethods_getConsentRemote_$self$$.$remoteConfigPromise_$ = _.$Services$$module$src$services$viewerForDoc$$($ampdoc$jscomp$153$$).$D$.then(function() {
      return _.$JSCompiler_StaticMethods_fetchJson$$(_.$Services$$module$src$services$xhrFor$$($JSCompiler_StaticMethods_getConsentRemote_$self$$.$win$), $resolvedHref$$, $init$jscomp$17$$).then(function($JSCompiler_StaticMethods_getConsentRemote_$self$$) {
        return $JSCompiler_StaticMethods_getConsentRemote_$self$$.json();
      });
    });
  } else {
    $JSCompiler_StaticMethods_getConsentRemote_$self$$.$remoteConfigPromise_$ = window.Promise.resolve(null);
  }
  return $JSCompiler_StaticMethods_getConsentRemote_$self$$.$remoteConfigPromise_$;
}, $JSCompiler_StaticMethods_initPromptUI_$$ = function($JSCompiler_StaticMethods_initPromptUI_$self$$, $isConsentRequired$jscomp$1$$) {
  $JSCompiler_StaticMethods_initPromptUI_$self$$.$consentUI_$ = new $ConsentUI$$module$extensions$amp_consent$0_1$consent_ui$$($JSCompiler_StaticMethods_initPromptUI_$self$$, $JSCompiler_StaticMethods_initPromptUI_$self$$.$consentConfig_$);
  return $JSCompiler_StaticMethods_initPromptUI_$self$$.$consentStateManager_$.$instance_$.get().then(function($info$jscomp$15$$) {
    if ($info$jscomp$15$$.consentString || 1 === $info$jscomp$15$$.consentState || 2 === $info$jscomp$15$$.consentState) {
      return !0;
    }
    if (!$isConsentRequired$jscomp$1$$) {
      return $JSCompiler_StaticMethods_updateConsentInstanceState$$($JSCompiler_StaticMethods_initPromptUI_$self$$.$consentStateManager_$, 4), !1;
    }
    $JSCompiler_StaticMethods_scheduleDisplay_$$($JSCompiler_StaticMethods_initPromptUI_$self$$);
    return !0;
  });
}, $JSCompiler_StaticMethods_handlePostPromptUI_$$ = function($JSCompiler_StaticMethods_handlePostPromptUI_$self$$) {
  $JSCompiler_StaticMethods_handlePostPromptUI_$self$$.$postPromptUI_$ && ($JSCompiler_StaticMethods_onQueueEmpty$$($JSCompiler_StaticMethods_handlePostPromptUI_$self$$.$notificationUiManager_$, function() {
    $JSCompiler_StaticMethods_handlePostPromptUI_$self$$.$vsync_$.$mutate$(function() {
      $JSCompiler_StaticMethods_handlePostPromptUI_$self$$.$postPromptUI_$.show();
    });
  }), $JSCompiler_StaticMethods_onQueueNotEmpty$$($JSCompiler_StaticMethods_handlePostPromptUI_$self$$.$notificationUiManager_$, function() {
    $JSCompiler_StaticMethods_handlePostPromptUI_$self$$.$vsync_$.$mutate$(function() {
      $JSCompiler_StaticMethods_handlePostPromptUI_$self$$.$postPromptUI_$.$hide$();
    });
  }));
}, $CONSENT_ITEM_STATE$$module$extensions$amp_consent$0_1$consent_info$$ = {$ACCEPTED$:1, $REJECTED$:2, $DISMISSED$:3, $NOT_REQUIRED$:4, $UNKNOWN$:5};
var $_template$$module$extensions$amp_consent$0_1$consent_ui$$ = ['<svg viewBox="0 0 40 40"><defs><linearGradient id=grad><stop stop-color="rgb(105, 105, 105)"></stop><stop offset=100% stop-color="rgb(105, 105, 105)" stop-opacity=0></stop></linearGradient></defs><path d="M11,4.4 A18,18, 0,1,0, 38,20" stroke=url(#grad)></path></svg>'];
$ConsentUI$$module$extensions$amp_consent$0_1$consent_ui$$.prototype.show = function() {
  var $$jscomp$this$jscomp$533$$ = this;
  if (this.$D$) {
    _.$toggle$$module$src$style$$(this.$F$, !0);
    var $classList$$ = this.$F$.classList;
    $classList$$.add("amp-active");
    $classList$$.remove("amp-hidden");
    _.$JSCompiler_StaticMethods_addToFixedLayer$$(this.$G$.$getViewport$(), this.$F$);
    if (this.$O$) {
      $JSCompiler_StaticMethods_loadIframe_$$(this).then(function() {
        $$jscomp$this$jscomp$533$$.$G$.$mutateElement$(function() {
          $JSCompiler_StaticMethods_maybeShowOverlay_$$($$jscomp$this$jscomp$533$$);
          $JSCompiler_StaticMethods_showIframe_$$($$jscomp$this$jscomp$533$$);
        });
      });
    } else {
      var $show$jscomp$3$$ = function() {
        $$jscomp$this$jscomp$533$$.$D$ && ($$jscomp$this$jscomp$533$$.$R$ || ($JSCompiler_StaticMethods_maybeShowOverlay_$$($$jscomp$this$jscomp$533$$), $$jscomp$this$jscomp$533$$.$G$.$scheduleLayout$($$jscomp$this$jscomp$533$$.$D$)), _.$toggle$$module$src$style$$($$jscomp$this$jscomp$533$$.$D$, !0));
      };
      $isAmpElement$$module$src$dom$$(this.$D$) ? this.$D$.$K$().then(function() {
        return $show$jscomp$3$$();
      }) : $show$jscomp$3$$();
    }
    this.$isVisible_$ = !0;
  }
};
$ConsentUI$$module$extensions$amp_consent$0_1$consent_ui$$.prototype.$hide$ = function() {
  var $$jscomp$this$jscomp$534$$ = this;
  this.$D$ && this.$G$.$mutateElement$(function() {
    if ($$jscomp$this$jscomp$534$$.$O$) {
      var $classList$jscomp$1_classList$jscomp$inline_3054$$ = $$jscomp$this$jscomp$534$$.$F$.classList;
      $classList$jscomp$1_classList$jscomp$inline_3054$$.remove("i-amphtml-consent-ui-iframe-active");
      $$jscomp$this$jscomp$534$$.$J$.removeEventListener("message", $$jscomp$this$jscomp$534$$.$U$);
      $classList$jscomp$1_classList$jscomp$inline_3054$$.remove("i-amphtml-consent-ui-iframe-fullscreen");
      $$jscomp$this$jscomp$534$$.$isFullscreen_$ = !1;
      $classList$jscomp$1_classList$jscomp$inline_3054$$.remove("i-amphtml-consent-ui-in");
      $$jscomp$this$jscomp$534$$.$P$ = !1;
      $$jscomp$this$jscomp$534$$.$D$.removeAttribute("name");
      _.$removeElement$$module$src$dom$$($$jscomp$this$jscomp$534$$.$D$);
    }
    $$jscomp$this$jscomp$534$$.$R$ || ($classList$jscomp$1_classList$jscomp$inline_3054$$ = $$jscomp$this$jscomp$534$$.$F$.classList, $classList$jscomp$1_classList$jscomp$inline_3054$$.remove("amp-active"), $classList$jscomp$1_classList$jscomp$inline_3054$$.add("amp-hidden"));
    $$jscomp$this$jscomp$534$$.$W$ && ($$jscomp$this$jscomp$534$$.$maskElement_$ && _.$toggle$$module$src$style$$($$jscomp$this$jscomp$534$$.$maskElement_$, !1), $$jscomp$this$jscomp$534$$.$I$ || (_.$JSCompiler_StaticMethods_leaveOverlayMode$$($$jscomp$this$jscomp$534$$.$viewport_$), $$jscomp$this$jscomp$534$$.$I$ = !0));
    $$jscomp$this$jscomp$534$$.$I$ || (_.$JSCompiler_StaticMethods_leaveOverlayMode$$($$jscomp$this$jscomp$534$$.$viewport_$), $$jscomp$this$jscomp$534$$.$I$ = !0);
    _.$JSCompiler_StaticMethods_removeFromFixedLayer$$($$jscomp$this$jscomp$534$$.$G$.$getViewport$(), $$jscomp$this$jscomp$534$$.$F$);
    _.$toggle$$module$src$style$$($$jscomp$this$jscomp$534$$.$D$, !1);
    $$jscomp$this$jscomp$534$$.$isVisible_$ = !1;
  });
};
$ConsentUI$$module$extensions$amp_consent$0_1$consent_ui$$.prototype.$Y$ = function($data$jscomp$118_event$jscomp$100$$) {
  var $$jscomp$this$jscomp$538$$ = this;
  this.$D$.contentWindow === $data$jscomp$118_event$jscomp$100$$.source && ($data$jscomp$118_event$jscomp$100$$ = $data$jscomp$118_event$jscomp$100$$.data) && "consent-ui" == $data$jscomp$118_event$jscomp$100$$.type && ("ready" === $data$jscomp$118_event$jscomp$100$$.action && this.$K$.resolve(), "enter-fullscreen" === $data$jscomp$118_event$jscomp$100$$.action && this.$P$ && this.$G$.$mutateElement$(function() {
    $$jscomp$this$jscomp$538$$.$D$ && $$jscomp$this$jscomp$538$$.$isVisible_$ && !$$jscomp$this$jscomp$538$$.$isFullscreen_$ && ($$jscomp$this$jscomp$538$$.$F$.classList.add("i-amphtml-consent-ui-iframe-fullscreen"), $$jscomp$this$jscomp$538$$.$I$ && (_.$JSCompiler_StaticMethods_enterOverlayMode$$($$jscomp$this$jscomp$538$$.$viewport_$), $$jscomp$this$jscomp$538$$.$I$ = !1), $$jscomp$this$jscomp$538$$.$isFullscreen_$ = !0);
  }));
};
$ConsentInstance$$module$extensions$amp_consent$0_1$consent_state_manager$$.prototype.update = function($newConsentInfo_state$jscomp$56$$, $consentString_oldConsentInfo$$) {
  var $localConsentStr$$ = this.$D$ && this.$D$.consentString;
  var $JSCompiler_inline_result$jscomp$715_newState$jscomp$inline_3062$$ = $newConsentInfo_state$jscomp$56$$;
  var $previousState$jscomp$inline_3063$$ = this.$D$ && this.$D$.consentState;
  _.$isEnumValue$$module$src$types$$($CONSENT_ITEM_STATE$$module$extensions$amp_consent$0_1$consent_info$$, $JSCompiler_inline_result$jscomp$715_newState$jscomp$inline_3062$$) || ($JSCompiler_inline_result$jscomp$715_newState$jscomp$inline_3062$$ = 5);
  $JSCompiler_inline_result$jscomp$715_newState$jscomp$inline_3062$$ = 3 == $JSCompiler_inline_result$jscomp$715_newState$jscomp$inline_3062$$ || 5 == $JSCompiler_inline_result$jscomp$715_newState$jscomp$inline_3062$$ ? $previousState$jscomp$inline_3063$$ || 5 : 4 == $JSCompiler_inline_result$jscomp$715_newState$jscomp$inline_3062$$ && $previousState$jscomp$inline_3063$$ && 5 != $previousState$jscomp$inline_3063$$ ? $previousState$jscomp$inline_3063$$ : $JSCompiler_inline_result$jscomp$715_newState$jscomp$inline_3062$$;
  3 === $newConsentInfo_state$jscomp$56$$ ? this.$D$ = $constructConsentInfo$$module$extensions$amp_consent$0_1$consent_info$$($JSCompiler_inline_result$jscomp$715_newState$jscomp$inline_3062$$, $localConsentStr$$) : ($newConsentInfo_state$jscomp$56$$ = $constructConsentInfo$$module$extensions$amp_consent$0_1$consent_info$$($JSCompiler_inline_result$jscomp$715_newState$jscomp$inline_3062$$, $consentString_oldConsentInfo$$), $consentString_oldConsentInfo$$ = this.$D$, this.$D$ = $newConsentInfo_state$jscomp$56$$, 
  $isConsentInfoStoredValueSame$$module$extensions$amp_consent$0_1$consent_info$$($newConsentInfo_state$jscomp$56$$, $consentString_oldConsentInfo$$) || $JSCompiler_StaticMethods_updateStoredValue_$$(this, $newConsentInfo_state$jscomp$56$$));
};
$ConsentInstance$$module$extensions$amp_consent$0_1$consent_state_manager$$.prototype.get = function() {
  var $$jscomp$this$jscomp$540$$ = this;
  return this.$D$ ? window.Promise.resolve(this.$D$) : this.$storagePromise_$.then(function($storage$jscomp$7$$) {
    return $storage$jscomp$7$$.get($$jscomp$this$jscomp$540$$.$storageKey_$);
  }).then(function($JSCompiler_inline_result$jscomp$714_storedValue$$) {
    if ($$jscomp$this$jscomp$540$$.$D$) {
      return $$jscomp$this$jscomp$540$$.$D$;
    }
    if (void 0 === $JSCompiler_inline_result$jscomp$714_storedValue$$) {
      $JSCompiler_inline_result$jscomp$714_storedValue$$ = $constructConsentInfo$$module$extensions$amp_consent$0_1$consent_info$$(5, void 0, void 0);
    } else {
      if ("boolean" === typeof $JSCompiler_inline_result$jscomp$714_storedValue$$) {
        $JSCompiler_inline_result$jscomp$714_storedValue$$ = $constructConsentInfo$$module$extensions$amp_consent$0_1$consent_info$$($convertValueToState$$module$extensions$amp_consent$0_1$consent_info$$($JSCompiler_inline_result$jscomp$714_storedValue$$), void 0, void 0);
      } else {
        if (!_.$isObject$$module$src$types$$($JSCompiler_inline_result$jscomp$714_storedValue$$)) {
          throw _.$dev$$module$src$log$$().$createError$("Invalid stored consent value");
        }
        $JSCompiler_inline_result$jscomp$714_storedValue$$ = $constructConsentInfo$$module$extensions$amp_consent$0_1$consent_info$$($convertValueToState$$module$extensions$amp_consent$0_1$consent_info$$($JSCompiler_inline_result$jscomp$714_storedValue$$.s), $JSCompiler_inline_result$jscomp$714_storedValue$$.r, $JSCompiler_inline_result$jscomp$714_storedValue$$.d && 1 === $JSCompiler_inline_result$jscomp$714_storedValue$$.d);
      }
    }
    $$jscomp$this$jscomp$540$$.$D$ = $JSCompiler_inline_result$jscomp$714_storedValue$$;
    return $$jscomp$this$jscomp$540$$.$D$;
  }).catch(function($$jscomp$this$jscomp$540$$) {
    _.$dev$$module$src$log$$().error("CONSENT-STATE-MANAGER", "Failed to read storage", $$jscomp$this$jscomp$540$$);
    return $constructConsentInfo$$module$extensions$amp_consent$0_1$consent_info$$(5);
  });
};
var $WHITELIST_POLICY$$module$extensions$amp_consent$0_1$consent_policy_manager$$ = {"default":!0, _till_responded:!0, _till_accepted:!0, _auto_reject:!0};
$ConsentPolicyManager$$module$extensions$amp_consent$0_1$consent_policy_manager$$.prototype.$K$ = function($policyId$jscomp$7$$) {
  var $$jscomp$this$jscomp$544$$ = this;
  return $WHITELIST_POLICY$$module$extensions$amp_consent$0_1$consent_policy_manager$$[$policyId$jscomp$7$$] ? $JSCompiler_StaticMethods_whenPolicyInstanceRegistered_$$(this, $policyId$jscomp$7$$).then(function() {
    return $$jscomp$this$jscomp$544$$.$F$[$policyId$jscomp$7$$].$G$.then(function() {
      return $$jscomp$this$jscomp$544$$.$F$[$policyId$jscomp$7$$].$F$;
    });
  }) : (_.$user$$module$src$log$$().error("consent-policy-manager", "can not find policy %s, only predefined policies are supported", $policyId$jscomp$7$$), window.Promise.resolve(4));
};
$ConsentPolicyManager$$module$extensions$amp_consent$0_1$consent_policy_manager$$.prototype.$aa$ = function($policyId$jscomp$8$$) {
  var $$jscomp$this$jscomp$545$$ = this;
  return $WHITELIST_POLICY$$module$extensions$amp_consent$0_1$consent_policy_manager$$[$policyId$jscomp$8$$] ? $JSCompiler_StaticMethods_whenPolicyInstanceRegistered_$$(this, $policyId$jscomp$8$$).then(function() {
    return $$jscomp$this$jscomp$545$$.$F$[$policyId$jscomp$8$$].$G$.then(function() {
      var $JSCompiler_StaticMethods_shouldUnblock$self$jscomp$inline_3077$$ = $$jscomp$this$jscomp$545$$.$F$[$policyId$jscomp$8$$];
      return -1 < $JSCompiler_StaticMethods_shouldUnblock$self$jscomp$inline_3077$$.$I$.indexOf($JSCompiler_StaticMethods_shouldUnblock$self$jscomp$inline_3077$$.$F$);
    });
  }) : (_.$user$$module$src$log$$().error("consent-policy-manager", "can not find policy %s, only predefined policies are supported", $policyId$jscomp$8$$), window.Promise.resolve(!1));
};
$ConsentPolicyManager$$module$extensions$amp_consent$0_1$consent_policy_manager$$.prototype.$Y$ = function($policyId$jscomp$9$$) {
  var $$jscomp$this$jscomp$546$$ = this;
  return this.$K$($policyId$jscomp$9$$).then(function() {
    return $$jscomp$this$jscomp$546$$.$O$;
  }).then(function($policyId$jscomp$9$$) {
    return $policyId$jscomp$9$$.$instance_$.$G$;
  });
};
$ConsentPolicyManager$$module$extensions$amp_consent$0_1$consent_policy_manager$$.prototype.$W$ = function($policyId$jscomp$10$$) {
  var $$jscomp$this$jscomp$547$$ = this;
  return this.$K$($policyId$jscomp$10$$).then(function() {
    return $$jscomp$this$jscomp$547$$.$I$;
  });
};
$ConsentPolicyInstance$$module$extensions$amp_consent$0_1$consent_policy_manager$$.prototype.evaluate = function($state$jscomp$59$$, $isFallback$$) {
  !$state$jscomp$59$$ || void 0 !== $isFallback$$ && $isFallback$$ && !this.$D$ || (this.$F$ = 1 === $state$jscomp$59$$ ? 1 : 2 === $state$jscomp$59$$ ? 2 : 4 === $state$jscomp$59$$ ? 3 : 4, this.$D$ && (this.$D$(), this.$D$ = null));
};
var $CMP_CONFIG$$module$extensions$amp_consent$0_1$cmps$$ = {};
var $ACTION_TYPE$$module$extensions$amp_consent$0_1$amp_consent$$ = {$ACCEPT$:"accept", $REJECT$:"reject", $DISMISS$:"dismiss"};
_.$$jscomp$inherits$$($AmpConsent$$module$extensions$amp_consent$0_1$amp_consent$$, window.AMP.BaseElement);
$AmpConsent$$module$extensions$amp_consent$0_1$amp_consent$$.prototype.$getConsentPolicy$ = function() {
  return null;
};
$AmpConsent$$module$extensions$amp_consent$0_1$amp_consent$$.prototype.$buildCallback$ = function() {
  var $$jscomp$this$jscomp$549$$ = this, $children$jscomp$134_config$jscomp$65_consentPolicyManagerPromise_policyConfig$jscomp$1$$ = new $ConsentConfig$$module$extensions$amp_consent$0_1$consent_config$$(this.element);
  this.$consentConfig_$ = $JSCompiler_StaticMethods_getConsentConfig$$($children$jscomp$134_config$jscomp$65_consentPolicyManagerPromise_policyConfig$jscomp$1$$);
  this.$consentId_$ = this.$consentConfig_$.storageKey;
  this.$consentConfig_$.postPromptUI && (this.$postPromptUI_$ = new $ConsentUI$$module$extensions$amp_consent$0_1$consent_ui$$(this, _.$dict$$module$src$utils$object$$({}), this.$consentConfig_$.postPromptUI));
  $children$jscomp$134_config$jscomp$65_consentPolicyManagerPromise_policyConfig$jscomp$1$$ = $JSCompiler_StaticMethods_ConsentConfig$$module$extensions$amp_consent$0_1$consent_config_prototype$getConfig_$$($children$jscomp$134_config$jscomp$65_consentPolicyManagerPromise_policyConfig$jscomp$1$$).policy || _.$dict$$module$src$utils$object$$({});
  this.$policyConfig_$ = $expandPolicyConfig$$module$extensions$amp_consent$0_1$consent_config$$($children$jscomp$134_config$jscomp$65_consentPolicyManagerPromise_policyConfig$jscomp$1$$, this.$consentId_$);
  $children$jscomp$134_config$jscomp$65_consentPolicyManagerPromise_policyConfig$jscomp$1$$ = this.$getRealChildren$();
  for (var $consentStateManagerPromise_i$jscomp$282$$ = 0; $consentStateManagerPromise_i$jscomp$282$$ < $children$jscomp$134_config$jscomp$65_consentPolicyManagerPromise_policyConfig$jscomp$1$$.length; $consentStateManagerPromise_i$jscomp$282$$++) {
    var $child$jscomp$16_notificationUiManagerPromise$$ = $children$jscomp$134_config$jscomp$65_consentPolicyManagerPromise_policyConfig$jscomp$1$$[$consentStateManagerPromise_i$jscomp$282$$];
    _.$toggle$$module$src$style$$($child$jscomp$16_notificationUiManagerPromise$$, !1);
    _.$Resource$$module$src$service$resource$setOwner$$($child$jscomp$16_notificationUiManagerPromise$$, this.element);
  }
  $children$jscomp$134_config$jscomp$65_consentPolicyManagerPromise_policyConfig$jscomp$1$$ = _.$getServicePromiseForDoc$$module$src$service$$(this.$getAmpDoc$(), "consentPolicyManager").then(function($children$jscomp$134_config$jscomp$65_consentPolicyManagerPromise_policyConfig$jscomp$1$$) {
    $$jscomp$this$jscomp$549$$.$consentPolicyManager_$ = $children$jscomp$134_config$jscomp$65_consentPolicyManagerPromise_policyConfig$jscomp$1$$;
    $children$jscomp$134_config$jscomp$65_consentPolicyManagerPromise_policyConfig$jscomp$1$$ = $$jscomp$this$jscomp$549$$.$consentPolicyManager_$;
    $children$jscomp$134_config$jscomp$65_consentPolicyManagerPromise_policyConfig$jscomp$1$$.$P$ = $$jscomp$this$jscomp$549$$.$consentId_$;
    $JSCompiler_StaticMethods_ConsentPolicyManager$$module$extensions$amp_consent$0_1$consent_policy_manager_prototype$init_$$($children$jscomp$134_config$jscomp$65_consentPolicyManagerPromise_policyConfig$jscomp$1$$);
    $children$jscomp$134_config$jscomp$65_consentPolicyManagerPromise_policyConfig$jscomp$1$$ = Object.keys($$jscomp$this$jscomp$549$$.$policyConfig_$);
    for (var $consentStateManagerPromise_i$jscomp$282$$ = 0; $consentStateManagerPromise_i$jscomp$282$$ < $children$jscomp$134_config$jscomp$65_consentPolicyManagerPromise_policyConfig$jscomp$1$$.length; $consentStateManagerPromise_i$jscomp$282$$++) {
      $JSCompiler_StaticMethods_registerConsentPolicyInstance$$($$jscomp$this$jscomp$549$$.$consentPolicyManager_$, $children$jscomp$134_config$jscomp$65_consentPolicyManagerPromise_policyConfig$jscomp$1$$[$consentStateManagerPromise_i$jscomp$282$$], $$jscomp$this$jscomp$549$$.$policyConfig_$[$children$jscomp$134_config$jscomp$65_consentPolicyManagerPromise_policyConfig$jscomp$1$$[$consentStateManagerPromise_i$jscomp$282$$]]);
    }
  });
  $consentStateManagerPromise_i$jscomp$282$$ = _.$getServicePromiseForDoc$$module$src$service$$(this.$getAmpDoc$(), "consentStateManager").then(function($children$jscomp$134_config$jscomp$65_consentPolicyManagerPromise_policyConfig$jscomp$1$$) {
    var $consentStateManagerPromise_i$jscomp$282$$ = $$jscomp$this$jscomp$549$$.$consentId_$, $child$jscomp$16_notificationUiManagerPromise$$ = $$jscomp$this$jscomp$549$$.$consentConfig_$;
    $children$jscomp$134_config$jscomp$65_consentPolicyManagerPromise_policyConfig$jscomp$1$$.$instance_$ ? _.$dev$$module$src$log$$().error("CONSENT-STATE-MANAGER", "Cannot register consent instance %s, instance %s has already been registered.", $consentStateManagerPromise_i$jscomp$282$$, $children$jscomp$134_config$jscomp$65_consentPolicyManagerPromise_policyConfig$jscomp$1$$.$instanceId_$) : ($children$jscomp$134_config$jscomp$65_consentPolicyManagerPromise_policyConfig$jscomp$1$$.$instanceId_$ = 
    $consentStateManagerPromise_i$jscomp$282$$, $children$jscomp$134_config$jscomp$65_consentPolicyManagerPromise_policyConfig$jscomp$1$$.$instance_$ = new $ConsentInstance$$module$extensions$amp_consent$0_1$consent_state_manager$$($children$jscomp$134_config$jscomp$65_consentPolicyManagerPromise_policyConfig$jscomp$1$$.$ampdoc_$, $consentStateManagerPromise_i$jscomp$282$$, $child$jscomp$16_notificationUiManagerPromise$$), $children$jscomp$134_config$jscomp$65_consentPolicyManagerPromise_policyConfig$jscomp$1$$.$consentReadyResolver_$ && 
    ($children$jscomp$134_config$jscomp$65_consentPolicyManagerPromise_policyConfig$jscomp$1$$.$consentReadyResolver_$(), $children$jscomp$134_config$jscomp$65_consentPolicyManagerPromise_policyConfig$jscomp$1$$.$consentReadyResolver_$ = null));
    $$jscomp$this$jscomp$549$$.$consentStateManager_$ = $children$jscomp$134_config$jscomp$65_consentPolicyManagerPromise_policyConfig$jscomp$1$$;
  });
  $child$jscomp$16_notificationUiManagerPromise$$ = _.$getServicePromiseForDoc$$module$src$service$$(this.$getAmpDoc$(), "notificationUIManager").then(function($children$jscomp$134_config$jscomp$65_consentPolicyManagerPromise_policyConfig$jscomp$1$$) {
    $$jscomp$this$jscomp$549$$.$notificationUiManager_$ = $children$jscomp$134_config$jscomp$65_consentPolicyManagerPromise_policyConfig$jscomp$1$$;
  });
  window.Promise.all([$consentStateManagerPromise_i$jscomp$282$$, $child$jscomp$16_notificationUiManagerPromise$$, $children$jscomp$134_config$jscomp$65_consentPolicyManagerPromise_policyConfig$jscomp$1$$]).then(function() {
    $JSCompiler_StaticMethods_AmpConsent$$module$extensions$amp_consent$0_1$amp_consent_prototype$init_$$($$jscomp$this$jscomp$549$$);
  });
};
$AmpConsent$$module$extensions$amp_consent$0_1$amp_consent$$.prototype.$D$ = function() {
  var $$jscomp$this$jscomp$552$$ = this;
  this.$isPromptUIOn_$ && _.$dev$$module$src$log$$().error("amp-consent", "Attempt to show an already displayed prompt UI");
  this.$vsync_$.$mutate$(function() {
    $$jscomp$this$jscomp$552$$.$consentUI_$.show();
    $$jscomp$this$jscomp$552$$.$isPromptUIOn_$ = !0;
  });
  var $deferred$jscomp$41$$ = new _.$Deferred$$module$src$utils$promise$$;
  this.$dialogResolver_$ = $deferred$jscomp$41$$.resolve;
  return $deferred$jscomp$41$$.$promise$;
};
var $AMP$jscomp$inline_3100$$ = window.self.AMP;
$AMP$jscomp$inline_3100$$.registerElement("amp-consent", $AmpConsent$$module$extensions$amp_consent$0_1$amp_consent$$, "amp-consent{position:fixed;bottom:0;left:0;overflow:hidden!important;background:hsla(0,0%,100%,0.7);width:100%;z-index:2147483645}amp-consent[i-amphtml-notbuilt]>*{display:none!important}amp-consent>*{max-height:100vh!important}amp-consent.amp-active{visibility:visible}amp-consent.amp-hidden{visibility:hidden}@-webkit-keyframes amp-consent-ui-placeholder-spin{0%{-webkit-transform:rotate(0deg);transform:rotate(0deg)}to{-webkit-transform:rotate(360deg);transform:rotate(360deg)}}@keyframes amp-consent-ui-placeholder-spin{0%{-webkit-transform:rotate(0deg);transform:rotate(0deg)}to{-webkit-transform:rotate(360deg);transform:rotate(360deg)}}.i-amphtml-consent-ui-placeholder{width:100%;height:100%;display:-webkit-box;display:-ms-flexbox;display:flex;-webkit-box-pack:center;-ms-flex-pack:center;justify-content:center;-webkit-box-align:center;-ms-flex-align:center;align-items:center}.i-amphtml-consent-ui-placeholder>svg{width:30px;height:30px;fill:none;stroke-width:1.5px;-webkit-transform-origin:50% 50%;transform-origin:50% 50%;-webkit-animation:amp-consent-ui-placeholder-spin 1000ms linear infinite;animation:amp-consent-ui-placeholder-spin 1000ms linear infinite}.i-amphtml-consent-ui-fill{position:absolute;top:0;left:0;height:30vh;width:100%}iframe.i-amphtml-consent-ui-fill{border:none}amp-consent.i-amphtml-consent-ui-iframe-active{width:100vw!important;height:100vh!important;padding:0px!important;margin:0px!important;border-top-left-radius:8px!important;border-top-right-radius:8px!important;box-shadow:0 0 5px 0 rgba(0,0,0,0.2)!important;-webkit-transform:translate3d(0px,100vh,0px)!important;transform:translate3d(0px,100vh,0px)!important}amp-consent.i-amphtml-consent-ui-iframe-active.i-amphtml-consent-ui-in{-webkit-transition:-webkit-transform 0.5s ease-out!important;transition:-webkit-transform 0.5s ease-out!important;transition:transform 0.5s ease-out!important;transition:transform 0.5s ease-out,-webkit-transform 0.5s ease-out!important;-webkit-transform:translate3d(0px,calc(100% - 30vh),0px)!important;transform:translate3d(0px,calc(100% - 30vh),0px)!important}amp-consent.i-amphtml-consent-ui-iframe-active.i-amphtml-consent-ui-in.i-amphtml-consent-ui-iframe-fullscreen{top:0px!important;-webkit-transform:translateZ(0px)!important;transform:translateZ(0px)!important}amp-consent.i-amphtml-consent-ui-in.i-amphtml-consent-ui-iframe-fullscreen>.i-amphtml-consent-ui-fill{height:100%!important}@-webkit-keyframes i-amphtml-consent-ui-mask{0%{opacity:0.0}to{opacity:0.2}}@keyframes i-amphtml-consent-ui-mask{0%{opacity:0.0}to{opacity:0.2}}.i-amphtml-consent-ui-mask{position:fixed!important;top:0!important;left:0!important;width:100vw!important;height:100vh!important;opacity:0.2;-webkit-animation:i-amphtml-consent-ui-mask 0.25s ease-in;animation:i-amphtml-consent-ui-mask 0.25s ease-in;background-image:none!important;background-color:#000;z-index:2147483644}\n/*# sourceURL=/extensions/amp-consent/0.1/amp-consent.css*/");
$AMP$jscomp$inline_3100$$.registerServiceForDoc("notificationUIManager", _.$NotificationUiManager$$module$src$service$notification_ui_manager$$);
$AMP$jscomp$inline_3100$$.registerServiceForDoc("consentStateManager", function($ampdoc$jscomp$150$$) {
  this.$ampdoc_$ = $ampdoc$jscomp$150$$;
  this.$consentReadyResolver_$ = this.$F$ = this.$D$ = this.$instance_$ = this.$instanceId_$ = null;
});
$AMP$jscomp$inline_3100$$.registerServiceForDoc("consentPolicyManager", $ConsentPolicyManager$$module$extensions$amp_consent$0_1$consent_policy_manager$$);

})});
