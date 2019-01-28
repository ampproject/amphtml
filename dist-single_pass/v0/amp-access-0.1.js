(self.AMP=self.AMP||[]).push({n:"amp-access",i:["_base_i","_base_misc"],v:"1901181729101",f:(function(AMP,_){
var $pemToBytes$$module$src$utils$pem$$ = function($pem$$) {
  $pem$$ = $pem$$.trim();
  $pem$$ = $pem$$.replace(/^\-+BEGIN[^-]*\-+/, "");
  $pem$$ = $pem$$.replace(/\-+END[^-]*\-+$/, "");
  $pem$$ = $pem$$.replace(/[\r\n]/g, "").trim();
  return _.$stringToBytes$$module$src$utils$bytes$$((0,window.atob)($pem$$));
}, $JwtHelper$$module$extensions$amp_access$0_1$jwt$$ = function($win$jscomp$284$$) {
  this.$win$ = $win$jscomp$284$$;
  this.$D$ = $win$jscomp$284$$.crypto && ($win$jscomp$284$$.crypto.subtle || $win$jscomp$284$$.crypto.$D$) || null;
}, $JSCompiler_StaticMethods_importKey_$$ = function($JSCompiler_StaticMethods_importKey_$self$$, $pemPromise$jscomp$1$$) {
  return $pemPromise$jscomp$1$$.then(function($pemPromise$jscomp$1$$) {
    return $JSCompiler_StaticMethods_importKey_$self$$.$D$.importKey("spki", $pemToBytes$$module$src$utils$pem$$($pemPromise$jscomp$1$$), {name:"RSASSA-PKCS1-v1_5", hash:{name:"SHA-256"}}, !1, ["verify"]);
  });
}, $JSCompiler_StaticMethods_decodeAndVerify$$ = function($JSCompiler_StaticMethods_decodeAndVerify$self$$, $encodedToken$jscomp$1$$, $pemPromise$$) {
  if (!$JSCompiler_StaticMethods_decodeAndVerify$self$$.$D$) {
    throw Error("Crypto is not supported on this platform");
  }
  return (new window.Promise(function($JSCompiler_StaticMethods_decodeAndVerify$self$$) {
    return $JSCompiler_StaticMethods_decodeAndVerify$self$$(_.$JSCompiler_StaticMethods_JwtHelper$$module$extensions$amp_access$0_1$jwt_prototype$decodeInternal_$$($encodedToken$jscomp$1$$));
  })).then(function($encodedToken$jscomp$1$$) {
    var $decoded$$ = $encodedToken$jscomp$1$$.header.alg;
    if (!$decoded$$ || "RS256" != $decoded$$) {
      throw Error("Only alg=RS256 is supported");
    }
    return $JSCompiler_StaticMethods_importKey_$$($JSCompiler_StaticMethods_decodeAndVerify$self$$, $pemPromise$$).then(function($pemPromise$$) {
      var $decoded$$ = _.$base64UrlDecodeToBytes$$module$src$utils$base64$$($encodedToken$jscomp$1$$.$sig$);
      return $JSCompiler_StaticMethods_decodeAndVerify$self$$.$D$.verify({name:"RSASSA-PKCS1-v1_5"}, $pemPromise$$, $decoded$$, _.$stringToBytes$$module$src$utils$bytes$$($encodedToken$jscomp$1$$.$verifiable$));
    }).then(function($JSCompiler_StaticMethods_decodeAndVerify$self$$) {
      if ($JSCompiler_StaticMethods_decodeAndVerify$self$$) {
        return $encodedToken$jscomp$1$$.$payload$;
      }
      throw Error("Signature verification failed");
    });
  });
}, $AccessServerAdapter$$module$extensions$amp_access$0_1$amp_access_server$$ = function($ampdoc$jscomp$118$$, $configJson$jscomp$2_isInExperiment_stateElement$$, $context$jscomp$15$$) {
  this.ampdoc = $ampdoc$jscomp$118$$;
  this.$context_$ = $context$jscomp$15$$;
  this.$D$ = new _.$AccessClientAdapter$$module$extensions$amp_access$0_1$amp_access_client$$($ampdoc$jscomp$118$$, $configJson$jscomp$2_isInExperiment_stateElement$$, $context$jscomp$15$$);
  this.$viewer_$ = _.$Services$$module$src$services$viewerForDoc$$($ampdoc$jscomp$118$$);
  this.$xhr_$ = _.$Services$$module$src$services$xhrFor$$($ampdoc$jscomp$118$$.$win$);
  this.$timer_$ = _.$Services$$module$src$services$timerFor$$($ampdoc$jscomp$118$$.$win$);
  this.$vsync_$ = _.$Services$$module$src$services$vsyncFor$$($ampdoc$jscomp$118$$.$win$);
  this.$F$ = ($configJson$jscomp$2_isInExperiment_stateElement$$ = $ampdoc$jscomp$118$$.getRootNode().querySelector('meta[name="i-amphtml-access-state"]')) ? $configJson$jscomp$2_isInExperiment_stateElement$$.getAttribute("content") : null;
  $configJson$jscomp$2_isInExperiment_stateElement$$ = _.$isExperimentOn$$module$src$experiments$$($ampdoc$jscomp$118$$.$win$, "amp-access-server");
  this.$G$ = _.$isProxyOrigin$$module$src$url$$($ampdoc$jscomp$118$$.$win$.location) || $configJson$jscomp$2_isInExperiment_stateElement$$;
  this.$I$ = ($configJson$jscomp$2_isInExperiment_stateElement$$ ? this.$viewer_$.$params_$.serverAccessService : null) || _.$removeFragment$$module$src$url$$($ampdoc$jscomp$118$$.$win$.location.href);
}, $JSCompiler_StaticMethods_AccessServerAdapter$$module$extensions$amp_access$0_1$amp_access_server_prototype$replaceSections_$$ = function($JSCompiler_StaticMethods_AccessServerAdapter$$module$extensions$amp_access$0_1$amp_access_server_prototype$replaceSections_$self$$, $doc$jscomp$75$$) {
  var $sections$jscomp$2$$ = $doc$jscomp$75$$.querySelectorAll("[i-amphtml-access-id]");
  "amp-access-server";
  return _.$JSCompiler_StaticMethods_mutatePromise$$($JSCompiler_StaticMethods_AccessServerAdapter$$module$extensions$amp_access$0_1$amp_access_server_prototype$replaceSections_$self$$.$vsync_$, function() {
    for (var $doc$jscomp$75$$ = 0; $doc$jscomp$75$$ < $sections$jscomp$2$$.length; $doc$jscomp$75$$++) {
      var $section$jscomp$2$$ = $sections$jscomp$2$$[$doc$jscomp$75$$], $sectionId$$ = $section$jscomp$2$$.getAttribute("i-amphtml-access-id"), $target$jscomp$99$$ = $JSCompiler_StaticMethods_AccessServerAdapter$$module$extensions$amp_access$0_1$amp_access_server_prototype$replaceSections_$self$$.ampdoc.getRootNode().querySelector('[i-amphtml-access-id="' + _.$cssEscape$$module$third_party$css_escape$css_escape$$($sectionId$$) + '"]');
      $target$jscomp$99$$ ? $target$jscomp$99$$.parentElement.replaceChild($JSCompiler_StaticMethods_AccessServerAdapter$$module$extensions$amp_access$0_1$amp_access_server_prototype$replaceSections_$self$$.ampdoc.$win$.document.importNode($section$jscomp$2$$, !0), $target$jscomp$99$$) : _.$dev$$module$src$log$$().$Log$$module$src$log_prototype$warn$("amp-access-server", "Section not found: ", $sectionId$$);
    }
  });
}, $AccessOtherAdapter$$module$extensions$amp_access$0_1$amp_access_other$$ = function($ampdoc$jscomp$119$$, $configJson$jscomp$3$$, $context$jscomp$16$$) {
  this.ampdoc = $ampdoc$jscomp$119$$;
  this.$context_$ = $context$jscomp$16$$;
  this.$D$ = $configJson$jscomp$3$$.authorizationFallbackResponse || null;
  this.$F$ = _.$isProxyOrigin$$module$src$url$$($ampdoc$jscomp$119$$.$win$.location);
}, $AccessVendorAdapter$$module$extensions$amp_access$0_1$amp_access_vendor$$ = function($ampdoc$jscomp$120_deferred$jscomp$27$$, $configJson$jscomp$4$$) {
  this.ampdoc = $ampdoc$jscomp$120_deferred$jscomp$27$$;
  this.$O$ = $configJson$jscomp$4$$.vendor;
  this.$I$ = $configJson$jscomp$4$$[this.$O$] || {};
  this.$G$ = !$configJson$jscomp$4$$.noPingback;
  $ampdoc$jscomp$120_deferred$jscomp$27$$ = new _.$Deferred$$module$src$utils$promise$$;
  this.$D$ = $ampdoc$jscomp$120_deferred$jscomp$27$$.$promise$;
  this.$F$ = $ampdoc$jscomp$120_deferred$jscomp$27$$.resolve;
}, $AccessServerJwtAdapter$$module$extensions$amp_access$0_1$amp_access_server_jwt$$ = function($ampdoc$jscomp$121$$, $configJson$jscomp$5$$, $context$jscomp$17_isInExperiment$jscomp$1_stateElement$jscomp$1$$) {
  this.ampdoc = $ampdoc$jscomp$121$$;
  this.$context_$ = $context$jscomp$17_isInExperiment$jscomp$1_stateElement$jscomp$1$$;
  this.$D$ = new _.$AccessClientAdapter$$module$extensions$amp_access$0_1$amp_access_client$$($ampdoc$jscomp$121$$, $configJson$jscomp$5$$, $context$jscomp$17_isInExperiment$jscomp$1_stateElement$jscomp$1$$);
  this.$viewer_$ = _.$Services$$module$src$services$viewerForDoc$$($ampdoc$jscomp$121$$);
  this.$xhr_$ = _.$Services$$module$src$services$xhrFor$$($ampdoc$jscomp$121$$.$win$);
  this.$timer_$ = _.$Services$$module$src$services$timerFor$$($ampdoc$jscomp$121$$.$win$);
  this.$vsync_$ = _.$Services$$module$src$services$vsyncFor$$($ampdoc$jscomp$121$$.$win$);
  this.$G$ = ($context$jscomp$17_isInExperiment$jscomp$1_stateElement$jscomp$1$$ = $ampdoc$jscomp$121$$.getRootNode().querySelector('meta[name="i-amphtml-access-state"]')) ? $context$jscomp$17_isInExperiment$jscomp$1_stateElement$jscomp$1$$.getAttribute("content") : null;
  $context$jscomp$17_isInExperiment$jscomp$1_stateElement$jscomp$1$$ = _.$isExperimentOn$$module$src$experiments$$($ampdoc$jscomp$121$$.$win$, "amp-access-server-jwt");
  this.$J$ = _.$isProxyOrigin$$module$src$url$$($ampdoc$jscomp$121$$.$win$.location) || $context$jscomp$17_isInExperiment$jscomp$1_stateElement$jscomp$1$$;
  this.$P$ = ($context$jscomp$17_isInExperiment$jscomp$1_stateElement$jscomp$1$$ ? this.$viewer_$.$params_$.serverAccessService : null) || _.$removeFragment$$module$src$url$$($ampdoc$jscomp$121$$.$win$.location.href);
  this.$F$ = $configJson$jscomp$5$$.publicKey || null;
  this.$I$ = $configJson$jscomp$5$$.publicKeyUrl || null;
  this.$F$ && this.$I$ && _.$user$$module$src$log$$().$Log$$module$src$log_prototype$warn$("amp-access-server-jwt", 'Both "publicKey" and "publicKeyUrl" specified. The "publicKeyUrl" will be ignored.');
  this.$K$ = new $JwtHelper$$module$extensions$amp_access$0_1$jwt$$($ampdoc$jscomp$121$$.$win$);
}, $JSCompiler_StaticMethods_fetchJwt_$$ = function($JSCompiler_StaticMethods_fetchJwt_$self$$) {
  var $jwtPromise$$ = $JSCompiler_StaticMethods_fetchJwt_$self$$.$context_$.$buildUrl$($JSCompiler_StaticMethods_fetchJwt_$self$$.$D$.$D$, !1).then(function($jwtPromise$$) {
    "amp-access-server-jwt";
    return _.$JSCompiler_StaticMethods_timeoutPromise$$($JSCompiler_StaticMethods_fetchJwt_$self$$.$timer_$, 3000, _.$JSCompiler_StaticMethods_fetchText$$($JSCompiler_StaticMethods_fetchJwt_$self$$.$xhr_$, $jwtPromise$$, {credentials:"include"}));
  }).then(function($JSCompiler_StaticMethods_fetchJwt_$self$$) {
    return $JSCompiler_StaticMethods_fetchJwt_$self$$.text();
  }).then(function($JSCompiler_StaticMethods_fetchJwt_$self$$) {
    var $jwtPromise$$ = _.$JSCompiler_StaticMethods_JwtHelper$$module$extensions$amp_access$0_1$jwt_prototype$decodeInternal_$$($JSCompiler_StaticMethods_fetchJwt_$self$$).$payload$;
    return {$encoded$:$JSCompiler_StaticMethods_fetchJwt_$self$$, $jwt$:$jwtPromise$$};
  });
  _.$getMode$$module$src$mode$$().$development$ && ($JSCompiler_StaticMethods_fetchJwt_$self$$.$K$.$D$ ? $jwtPromise$$ = $jwtPromise$$.then(function($jwtPromise$$) {
    return $JSCompiler_StaticMethods_decodeAndVerify$$($JSCompiler_StaticMethods_fetchJwt_$self$$.$K$, $jwtPromise$$.$encoded$, $JSCompiler_StaticMethods_loadKeyPem_$$($JSCompiler_StaticMethods_fetchJwt_$self$$)).then(function() {
      return $jwtPromise$$;
    });
  }) : _.$user$$module$src$log$$().$Log$$module$src$log_prototype$warn$("amp-access-server-jwt", "Cannot verify signature on this browser since it doesn't support WebCrypto APIs"), $jwtPromise$$ = $jwtPromise$$.then(function($JSCompiler_StaticMethods_fetchJwt_$self$$) {
    var $jwtPromise$$ = $JSCompiler_StaticMethods_fetchJwt_$self$$.$jwt$.aud;
    if (_.$isArray$$module$src$types$$($jwtPromise$$)) {
      for (var $resp$jscomp$2$$ = 0; $resp$jscomp$2$$ < $jwtPromise$$.length && "ampproject.org" != $jwtPromise$$[$resp$jscomp$2$$]; $resp$jscomp$2$$++) {
      }
    }
    return $JSCompiler_StaticMethods_fetchJwt_$self$$;
  }));
  return $jwtPromise$$.catch(function($JSCompiler_StaticMethods_fetchJwt_$self$$) {
    throw _.$user$$module$src$log$$().$createError$("JWT fetch or validation failed: ", $JSCompiler_StaticMethods_fetchJwt_$self$$);
  });
}, $JSCompiler_StaticMethods_loadKeyPem_$$ = function($JSCompiler_StaticMethods_loadKeyPem_$self$$) {
  return $JSCompiler_StaticMethods_loadKeyPem_$self$$.$F$ ? window.Promise.resolve($JSCompiler_StaticMethods_loadKeyPem_$self$$.$F$) : _.$JSCompiler_StaticMethods_fetchText$$($JSCompiler_StaticMethods_loadKeyPem_$self$$.$xhr_$, $JSCompiler_StaticMethods_loadKeyPem_$self$$.$I$).then(function($JSCompiler_StaticMethods_loadKeyPem_$self$$) {
    return $JSCompiler_StaticMethods_loadKeyPem_$self$$.text();
  });
}, $JSCompiler_StaticMethods_authorizeOnClient_$$ = function($JSCompiler_StaticMethods_authorizeOnClient_$self$$) {
  "amp-access-server-jwt";
  return $JSCompiler_StaticMethods_fetchJwt_$$($JSCompiler_StaticMethods_authorizeOnClient_$self$$).then(function($JSCompiler_StaticMethods_authorizeOnClient_$self$$) {
    return $JSCompiler_StaticMethods_authorizeOnClient_$self$$.$jwt$.amp_authdata;
  });
}, $JSCompiler_StaticMethods_authorizeOnServer_$$ = function($JSCompiler_StaticMethods_authorizeOnServer_$self$$) {
  "amp-access-server-jwt";
  return $JSCompiler_StaticMethods_fetchJwt_$$($JSCompiler_StaticMethods_authorizeOnServer_$self$$).then(function($request$jscomp$14_resp$jscomp$4$$) {
    var $accessData$jscomp$1$$ = $request$jscomp$14_resp$jscomp$4$$.$jwt$.amp_authdata;
    $request$jscomp$14_resp$jscomp$4$$ = _.$serializeQueryString$$module$src$url$$(_.$dict$$module$src$utils$object$$({url:_.$removeFragment$$module$src$url$$($JSCompiler_StaticMethods_authorizeOnServer_$self$$.ampdoc.$win$.location.href), state:$JSCompiler_StaticMethods_authorizeOnServer_$self$$.$G$, jwt:$request$jscomp$14_resp$jscomp$4$$.$encoded$}));
    "amp-access-server-jwt";
    "amp-access-server-jwt";
    return _.$JSCompiler_StaticMethods_timeoutPromise$$($JSCompiler_StaticMethods_authorizeOnServer_$self$$.$timer_$, 3000, _.$fetchDocument$$module$src$document_fetcher$$($JSCompiler_StaticMethods_authorizeOnServer_$self$$.ampdoc.$win$, $JSCompiler_StaticMethods_authorizeOnServer_$self$$.$P$, {method:"POST", body:$request$jscomp$14_resp$jscomp$4$$, headers:_.$dict$$module$src$utils$object$$({"Content-Type":"application/x-www-form-urlencoded"}), requireAmpResponseSourceOrigin:!1})).then(function($request$jscomp$14_resp$jscomp$4$$) {
      "amp-access-server-jwt";
      return $JSCompiler_StaticMethods_AccessServerJwtAdapter$$module$extensions$amp_access$0_1$amp_access_server_jwt_prototype$replaceSections_$$($JSCompiler_StaticMethods_authorizeOnServer_$self$$, $request$jscomp$14_resp$jscomp$4$$);
    }).then(function() {
      return $accessData$jscomp$1$$;
    });
  });
}, $JSCompiler_StaticMethods_AccessServerJwtAdapter$$module$extensions$amp_access$0_1$amp_access_server_jwt_prototype$replaceSections_$$ = function($JSCompiler_StaticMethods_AccessServerJwtAdapter$$module$extensions$amp_access$0_1$amp_access_server_jwt_prototype$replaceSections_$self$$, $doc$jscomp$76$$) {
  var $sections$jscomp$3$$ = $doc$jscomp$76$$.querySelectorAll("[i-amphtml-access-id]");
  "amp-access-server-jwt";
  return _.$JSCompiler_StaticMethods_mutatePromise$$($JSCompiler_StaticMethods_AccessServerJwtAdapter$$module$extensions$amp_access$0_1$amp_access_server_jwt_prototype$replaceSections_$self$$.$vsync_$, function() {
    for (var $doc$jscomp$76$$ = 0; $doc$jscomp$76$$ < $sections$jscomp$3$$.length; $doc$jscomp$76$$++) {
      var $section$jscomp$3$$ = $sections$jscomp$3$$[$doc$jscomp$76$$], $sectionId$jscomp$1$$ = $section$jscomp$3$$.getAttribute("i-amphtml-access-id"), $target$jscomp$100$$ = $JSCompiler_StaticMethods_AccessServerJwtAdapter$$module$extensions$amp_access$0_1$amp_access_server_jwt_prototype$replaceSections_$self$$.ampdoc.getRootNode().querySelector('[i-amphtml-access-id="' + _.$cssEscape$$module$third_party$css_escape$css_escape$$($sectionId$jscomp$1$$) + '"]');
      $target$jscomp$100$$ ? $target$jscomp$100$$.parentElement.replaceChild($JSCompiler_StaticMethods_AccessServerJwtAdapter$$module$extensions$amp_access$0_1$amp_access_server_jwt_prototype$replaceSections_$self$$.ampdoc.$win$.document.importNode($section$jscomp$3$$, !0), $target$jscomp$100$$) : _.$dev$$module$src$log$$().$Log$$module$src$log_prototype$warn$("amp-access-server-jwt", "Section not found: ", $sectionId$jscomp$1$$);
    }
  });
}, $Messenger$$module$extensions$amp_access$0_1$iframe_api$messenger$$ = function($win$jscomp$286$$, $targetOrCallback$$, $targetOrigin$jscomp$3$$) {
  this.$J$ = $win$jscomp$286$$;
  this.$F$ = $targetOrCallback$$;
  this.$targetOrigin_$ = $targetOrigin$jscomp$3$$;
  this.$D$ = this.$target_$ = null;
  this.$I$ = this.$O$.bind(this);
  this.$K$ = 0;
  this.$G$ = {};
}, $JSCompiler_StaticMethods_Messenger$$module$extensions$amp_access$0_1$iframe_api$messenger_prototype$getOptionalTarget_$$ = function($JSCompiler_StaticMethods_Messenger$$module$extensions$amp_access$0_1$iframe_api$messenger_prototype$getOptionalTarget_$self$$) {
  $JSCompiler_StaticMethods_Messenger$$module$extensions$amp_access$0_1$iframe_api$messenger_prototype$getOptionalTarget_$self$$.$D$ && !$JSCompiler_StaticMethods_Messenger$$module$extensions$amp_access$0_1$iframe_api$messenger_prototype$getOptionalTarget_$self$$.$target_$ && ("function" == typeof $JSCompiler_StaticMethods_Messenger$$module$extensions$amp_access$0_1$iframe_api$messenger_prototype$getOptionalTarget_$self$$.$F$ ? $JSCompiler_StaticMethods_Messenger$$module$extensions$amp_access$0_1$iframe_api$messenger_prototype$getOptionalTarget_$self$$.$target_$ = 
  $JSCompiler_StaticMethods_Messenger$$module$extensions$amp_access$0_1$iframe_api$messenger_prototype$getOptionalTarget_$self$$.$F$() : $JSCompiler_StaticMethods_Messenger$$module$extensions$amp_access$0_1$iframe_api$messenger_prototype$getOptionalTarget_$self$$.$target_$ = $JSCompiler_StaticMethods_Messenger$$module$extensions$amp_access$0_1$iframe_api$messenger_prototype$getOptionalTarget_$self$$.$F$);
  return $JSCompiler_StaticMethods_Messenger$$module$extensions$amp_access$0_1$iframe_api$messenger_prototype$getOptionalTarget_$self$$.$target_$;
}, $JSCompiler_StaticMethods_sendCommandRsvp$$ = function($JSCompiler_StaticMethods_sendCommandRsvp$self$$, $cmd$jscomp$1$$, $opt_payload$jscomp$1$$) {
  var $rsvpId$$ = String(++$JSCompiler_StaticMethods_sendCommandRsvp$self$$.$K$), $$jscomp$destructuring$var227$$ = new _.$Deferred$$module$src$utils$promise$$, $promise$jscomp$33$$ = $$jscomp$destructuring$var227$$.$promise$;
  $JSCompiler_StaticMethods_sendCommandRsvp$self$$.$G$[$rsvpId$$] = {$promise$:$promise$jscomp$33$$, $resolver$:$$jscomp$destructuring$var227$$.resolve};
  $JSCompiler_StaticMethods_Messenger$$module$extensions$amp_access$0_1$iframe_api$messenger_prototype$sendCommand_$$($JSCompiler_StaticMethods_sendCommandRsvp$self$$, $rsvpId$$, $cmd$jscomp$1$$, $opt_payload$jscomp$1$$);
  return $promise$jscomp$33$$;
}, $JSCompiler_StaticMethods_Messenger$$module$extensions$amp_access$0_1$iframe_api$messenger_prototype$sendCommand_$$ = function($JSCompiler_StaticMethods_Messenger$$module$extensions$amp_access$0_1$iframe_api$messenger_prototype$sendCommand_$self_JSCompiler_temp$jscomp$599$$, $rsvpId$jscomp$1$$, $cmd$jscomp$2$$, $opt_payload$jscomp$2$$) {
  var $target$jscomp$inline_2138$$ = $JSCompiler_StaticMethods_Messenger$$module$extensions$amp_access$0_1$iframe_api$messenger_prototype$getOptionalTarget_$$($JSCompiler_StaticMethods_Messenger$$module$extensions$amp_access$0_1$iframe_api$messenger_prototype$sendCommand_$self_JSCompiler_temp$jscomp$599$$);
  if (!$target$jscomp$inline_2138$$) {
    throw Error("not connected");
  }
  if ("connect" == $cmd$jscomp$2$$) {
    $JSCompiler_StaticMethods_Messenger$$module$extensions$amp_access$0_1$iframe_api$messenger_prototype$sendCommand_$self_JSCompiler_temp$jscomp$599$$ = null != $JSCompiler_StaticMethods_Messenger$$module$extensions$amp_access$0_1$iframe_api$messenger_prototype$sendCommand_$self_JSCompiler_temp$jscomp$599$$.$targetOrigin_$ ? $JSCompiler_StaticMethods_Messenger$$module$extensions$amp_access$0_1$iframe_api$messenger_prototype$sendCommand_$self_JSCompiler_temp$jscomp$599$$.$targetOrigin_$ : "*";
  } else {
    if (null == $JSCompiler_StaticMethods_Messenger$$module$extensions$amp_access$0_1$iframe_api$messenger_prototype$sendCommand_$self_JSCompiler_temp$jscomp$599$$.$targetOrigin_$) {
      throw Error("not connected");
    }
    $JSCompiler_StaticMethods_Messenger$$module$extensions$amp_access$0_1$iframe_api$messenger_prototype$sendCommand_$self_JSCompiler_temp$jscomp$599$$ = $JSCompiler_StaticMethods_Messenger$$module$extensions$amp_access$0_1$iframe_api$messenger_prototype$sendCommand_$self_JSCompiler_temp$jscomp$599$$.$targetOrigin_$;
  }
  $target$jscomp$inline_2138$$.postMessage({sentinel:"__AMP__", _rsvp:$rsvpId$jscomp$1$$, cmd:$cmd$jscomp$2$$, payload:$opt_payload$jscomp$2$$ || null}, $JSCompiler_StaticMethods_Messenger$$module$extensions$amp_access$0_1$iframe_api$messenger_prototype$sendCommand_$self_JSCompiler_temp$jscomp$599$$);
}, $JSCompiler_StaticMethods_Messenger$$module$extensions$amp_access$0_1$iframe_api$messenger_prototype$handleCommand_$$ = function($JSCompiler_StaticMethods_Messenger$$module$extensions$amp_access$0_1$iframe_api$messenger_prototype$handleCommand_$self$$, $rsvpId$jscomp$3$$, $cmd$jscomp$4_waiting$$, $payload$jscomp$6$$) {
  if ("rsvp" == $cmd$jscomp$4_waiting$$) {
    if ($cmd$jscomp$4_waiting$$ = $rsvpId$jscomp$3$$ && $JSCompiler_StaticMethods_Messenger$$module$extensions$amp_access$0_1$iframe_api$messenger_prototype$handleCommand_$self$$.$G$[$rsvpId$jscomp$3$$]) {
      "error" in $payload$jscomp$6$$ ? $cmd$jscomp$4_waiting$$.$resolver$(window.Promise.reject(Error($payload$jscomp$6$$.error))) : $cmd$jscomp$4_waiting$$.$resolver$($payload$jscomp$6$$.result), delete $JSCompiler_StaticMethods_Messenger$$module$extensions$amp_access$0_1$iframe_api$messenger_prototype$handleCommand_$self$$.$G$[$rsvpId$jscomp$3$$];
    }
  } else {
    return $JSCompiler_StaticMethods_Messenger$$module$extensions$amp_access$0_1$iframe_api$messenger_prototype$handleCommand_$self$$.$D$($cmd$jscomp$4_waiting$$, $payload$jscomp$6$$);
  }
}, $AccessIframeAdapter$$module$extensions$amp_access$0_1$amp_access_iframe$$ = function($ampdoc$jscomp$122$$, $configJson$jscomp$6$$, $context$jscomp$18$$) {
  var $$jscomp$this$jscomp$272$$ = this;
  this.ampdoc = $ampdoc$jscomp$122$$;
  this.$context_$ = $context$jscomp$18$$;
  this.$configJson_$ = $configJson$jscomp$6$$;
  this.$timer_$ = _.$Services$$module$src$services$timerFor$$($ampdoc$jscomp$122$$.$win$);
  this.$iframeSrc_$ = $configJson$jscomp$6$$.iframeSrc;
  this.$I$ = $configJson$jscomp$6$$.iframeVars || null;
  this.$K$ = $configJson$jscomp$6$$.defaultResponse;
  this.$targetOrigin_$ = _.$parseUrlDeprecated$$module$src$url$$(this.$iframeSrc_$).origin;
  this.$G$ = this.$F$ = null;
  this.$iframe_$ = $ampdoc$jscomp$122$$.$win$.document.createElement("iframe");
  _.$toggle$$module$src$style$$(this.$iframe_$, !1);
  this.$D$ = new $Messenger$$module$extensions$amp_access$0_1$iframe_api$messenger$$(this.ampdoc.$win$, function() {
    return $$jscomp$this$jscomp$272$$.$iframe_$.contentWindow;
  }, this.$targetOrigin_$);
  this.$J$ = null;
}, $JSCompiler_StaticMethods_AccessIframeAdapter$$module$extensions$amp_access$0_1$amp_access_iframe_prototype$connect$$ = function($JSCompiler_StaticMethods_AccessIframeAdapter$$module$extensions$amp_access$0_1$amp_access_iframe_prototype$connect$self$$) {
  if (!$JSCompiler_StaticMethods_AccessIframeAdapter$$module$extensions$amp_access$0_1$amp_access_iframe_prototype$connect$self$$.$G$) {
    var $JSCompiler_StaticMethods_Messenger$$module$extensions$amp_access$0_1$iframe_api$messenger_prototype$connect$self$jscomp$inline_2142_deferred$jscomp$29$$ = new _.$Deferred$$module$src$utils$promise$$;
    $JSCompiler_StaticMethods_AccessIframeAdapter$$module$extensions$amp_access$0_1$amp_access_iframe_prototype$connect$self$$.$G$ = $JSCompiler_StaticMethods_Messenger$$module$extensions$amp_access$0_1$iframe_api$messenger_prototype$connect$self$jscomp$inline_2142_deferred$jscomp$29$$.$promise$;
    $JSCompiler_StaticMethods_AccessIframeAdapter$$module$extensions$amp_access$0_1$amp_access_iframe_prototype$connect$self$$.$F$ = $JSCompiler_StaticMethods_Messenger$$module$extensions$amp_access$0_1$iframe_api$messenger_prototype$connect$self$jscomp$inline_2142_deferred$jscomp$29$$.resolve;
    $JSCompiler_StaticMethods_AccessIframeAdapter$$module$extensions$amp_access$0_1$amp_access_iframe_prototype$connect$self$$.$J$ = $JSCompiler_StaticMethods_resolveConfig_$$($JSCompiler_StaticMethods_AccessIframeAdapter$$module$extensions$amp_access$0_1$amp_access_iframe_prototype$connect$self$$);
    $JSCompiler_StaticMethods_Messenger$$module$extensions$amp_access$0_1$iframe_api$messenger_prototype$connect$self$jscomp$inline_2142_deferred$jscomp$29$$ = $JSCompiler_StaticMethods_AccessIframeAdapter$$module$extensions$amp_access$0_1$amp_access_iframe_prototype$connect$self$$.$D$;
    var $onCommand$jscomp$inline_2143$$ = $JSCompiler_StaticMethods_AccessIframeAdapter$$module$extensions$amp_access$0_1$amp_access_iframe_prototype$connect$self$$.$AccessIframeAdapter$$module$extensions$amp_access$0_1$amp_access_iframe_prototype$handleCommand_$.bind($JSCompiler_StaticMethods_AccessIframeAdapter$$module$extensions$amp_access$0_1$amp_access_iframe_prototype$connect$self$$);
    if ($JSCompiler_StaticMethods_Messenger$$module$extensions$amp_access$0_1$iframe_api$messenger_prototype$connect$self$jscomp$inline_2142_deferred$jscomp$29$$.$D$) {
      throw Error("already connected");
    }
    $JSCompiler_StaticMethods_Messenger$$module$extensions$amp_access$0_1$iframe_api$messenger_prototype$connect$self$jscomp$inline_2142_deferred$jscomp$29$$.$D$ = $onCommand$jscomp$inline_2143$$;
    $JSCompiler_StaticMethods_Messenger$$module$extensions$amp_access$0_1$iframe_api$messenger_prototype$connect$self$jscomp$inline_2142_deferred$jscomp$29$$.$J$.addEventListener("message", $JSCompiler_StaticMethods_Messenger$$module$extensions$amp_access$0_1$iframe_api$messenger_prototype$connect$self$jscomp$inline_2142_deferred$jscomp$29$$.$I$);
    $JSCompiler_StaticMethods_AccessIframeAdapter$$module$extensions$amp_access$0_1$amp_access_iframe_prototype$connect$self$$.ampdoc.$getBody$().appendChild($JSCompiler_StaticMethods_AccessIframeAdapter$$module$extensions$amp_access$0_1$amp_access_iframe_prototype$connect$self$$.$iframe_$);
    $JSCompiler_StaticMethods_AccessIframeAdapter$$module$extensions$amp_access$0_1$amp_access_iframe_prototype$connect$self$$.$iframe_$.src = $JSCompiler_StaticMethods_AccessIframeAdapter$$module$extensions$amp_access$0_1$amp_access_iframe_prototype$connect$self$$.$iframeSrc_$;
  }
  return $JSCompiler_StaticMethods_AccessIframeAdapter$$module$extensions$amp_access$0_1$amp_access_iframe_prototype$connect$self$$.$G$;
}, $JSCompiler_StaticMethods_resolveConfig_$$ = function($JSCompiler_StaticMethods_resolveConfig_$self$$) {
  return new window.Promise(function($resolve$jscomp$49$$) {
    var $configJson$jscomp$7$$ = _.$parseJson$$module$src$json$$(JSON.stringify($JSCompiler_StaticMethods_resolveConfig_$self$$.$configJson_$));
    if ($JSCompiler_StaticMethods_resolveConfig_$self$$.$I$) {
      var $varsPromise$jscomp$1$$ = $JSCompiler_StaticMethods_resolveConfig_$self$$.$context_$.$collectUrlVars$($JSCompiler_StaticMethods_resolveConfig_$self$$.$I$.join("&"), !1);
      $resolve$jscomp$49$$($varsPromise$jscomp$1$$.then(function($JSCompiler_StaticMethods_resolveConfig_$self$$) {
        $configJson$jscomp$7$$.iframeVars = $JSCompiler_StaticMethods_resolveConfig_$self$$;
        return $configJson$jscomp$7$$;
      }));
    } else {
      $resolve$jscomp$49$$($configJson$jscomp$7$$);
    }
  });
}, $JSCompiler_StaticMethods_authorizeLocal_$$ = function($JSCompiler_StaticMethods_authorizeLocal_$self$$) {
  var $timeout$jscomp$8$$ = 3000 * (_.$getMode$$module$src$mode$$().$development$ ? 2 : 1);
  return $JSCompiler_StaticMethods_authorizeLocal_$self$$.$timer_$.$promise$($timeout$jscomp$8$$).then(function() {
    return $JSCompiler_StaticMethods_restore_$$($JSCompiler_StaticMethods_authorizeLocal_$self$$) || $JSCompiler_StaticMethods_authorizeLocal_$self$$.$K$;
  });
}, $JSCompiler_StaticMethods_authorizeRemote_$$ = function($JSCompiler_StaticMethods_authorizeRemote_$self$$) {
  return $JSCompiler_StaticMethods_AccessIframeAdapter$$module$extensions$amp_access$0_1$amp_access_iframe_prototype$connect$$($JSCompiler_StaticMethods_authorizeRemote_$self$$).then(function() {
    return $JSCompiler_StaticMethods_sendCommandRsvp$$($JSCompiler_StaticMethods_authorizeRemote_$self$$.$D$, "authorize", {});
  }).then(function($data$jscomp$88$$) {
    $data$jscomp$88$$ && window.Promise.resolve().then(function() {
      return $JSCompiler_StaticMethods_store_$$($JSCompiler_StaticMethods_authorizeRemote_$self$$, $data$jscomp$88$$);
    });
    return $data$jscomp$88$$;
  });
}, $JSCompiler_StaticMethods_restore_$$ = function($JSCompiler_StaticMethods_restore_$self$$) {
  var $storage$jscomp$2_win$jscomp$287$$ = $JSCompiler_StaticMethods_restore_$self$$.ampdoc.$win$;
  $storage$jscomp$2_win$jscomp$287$$ = $storage$jscomp$2_win$jscomp$287$$.sessionStorage || $storage$jscomp$2_win$jscomp$287$$.localStorage;
  if (!$storage$jscomp$2_win$jscomp$287$$) {
    return null;
  }
  try {
    var $raw$jscomp$2$$ = $storage$jscomp$2_win$jscomp$287$$.getItem("amp-access-iframe");
    if (!$raw$jscomp$2$$) {
      return null;
    }
    var $parsed$jscomp$2$$ = _.$parseJson$$module$src$json$$($raw$jscomp$2$$);
    return $parsed$jscomp$2$$.t + 6048E5 < $JSCompiler_StaticMethods_restore_$self$$.ampdoc.$win$.Date.now() ? null : $parsed$jscomp$2$$.d || null;
  } catch ($e$201$$) {
    _.$dev$$module$src$log$$().error("amp-access-iframe", "failed to restore access response: ", $e$201$$);
    try {
      $storage$jscomp$2_win$jscomp$287$$.removeItem("amp-access-iframe");
    } catch ($e$200$$) {
    }
    return null;
  }
}, $JSCompiler_StaticMethods_store_$$ = function($JSCompiler_StaticMethods_store_$self$$, $data$jscomp$89$$) {
  var $storage$jscomp$3_win$jscomp$288$$ = $JSCompiler_StaticMethods_store_$self$$.ampdoc.$win$;
  if ($storage$jscomp$3_win$jscomp$288$$ = $storage$jscomp$3_win$jscomp$288$$.sessionStorage || $storage$jscomp$3_win$jscomp$288$$.localStorage) {
    try {
      $data$jscomp$89$$ ? $storage$jscomp$3_win$jscomp$288$$.setItem("amp-access-iframe", JSON.stringify(_.$dict$$module$src$utils$object$$({t:$JSCompiler_StaticMethods_store_$self$$.ampdoc.$win$.Date.now(), d:$data$jscomp$89$$}))) : $storage$jscomp$3_win$jscomp$288$$.removeItem("amp-access-iframe");
    } catch ($e$202$$) {
      _.$dev$$module$src$log$$().error("amp-access-iframe", "failed to store access response: ", $e$202$$);
    }
  }
}, $AccessSource$$module$extensions$amp_access$0_1$amp_access_source$$ = function($ampdoc$jscomp$123_deferred$jscomp$30$$, $configJson$jscomp$9$$, $loginConfig$jscomp$inline_2151_readerIdFn_type$jscomp$inline_2147$$, $loginMap$jscomp$inline_2152_scheduleViewFn$$, $onReauthorizeFn$$, $accessElement$$) {
  this.ampdoc = $ampdoc$jscomp$123_deferred$jscomp$30$$;
  this.$V$ = $loginConfig$jscomp$inline_2151_readerIdFn_type$jscomp$inline_2147$$;
  this.$Y$ = $loginMap$jscomp$inline_2152_scheduleViewFn$$;
  this.$W$ = $onReauthorizeFn$$;
  this.$P$ = _.$isExperimentOn$$module$src$experiments$$($ampdoc$jscomp$123_deferred$jscomp$30$$.$win$, "amp-access-server");
  this.$ba$ = _.$isExperimentOn$$module$src$experiments$$($ampdoc$jscomp$123_deferred$jscomp$30$$.$win$, "amp-access-jwt");
  ($loginConfig$jscomp$inline_2151_readerIdFn_type$jscomp$inline_2147$$ = $configJson$jscomp$9$$.type ? _.$JSCompiler_StaticMethods_assertEnumValue$$(_.$user$$module$src$log$$(), $AccessType$$module$extensions$amp_access$0_1$amp_access_source$$, $configJson$jscomp$9$$.type, "access type") : null) || ($loginConfig$jscomp$inline_2151_readerIdFn_type$jscomp$inline_2147$$ = $configJson$jscomp$9$$.vendor ? "vendor" : "client");
  "server" != $loginConfig$jscomp$inline_2151_readerIdFn_type$jscomp$inline_2147$$ || this.$P$ || (_.$user$$module$src$log$$().$Log$$module$src$log_prototype$warn$("amp-access", 'Experiment "amp-access-server" is not enabled.'), $loginConfig$jscomp$inline_2151_readerIdFn_type$jscomp$inline_2147$$ = "client");
  "client" == $loginConfig$jscomp$inline_2151_readerIdFn_type$jscomp$inline_2147$$ && this.$P$ && (_.$user$$module$src$log$$().$Log$$module$src$log_prototype$info$("amp-access", "Forcing access type: SERVER"), $loginConfig$jscomp$inline_2151_readerIdFn_type$jscomp$inline_2147$$ = "server");
  "iframe" != $loginConfig$jscomp$inline_2151_readerIdFn_type$jscomp$inline_2147$$ || _.$isExperimentOn$$module$src$experiments$$(this.ampdoc.$win$, "amp-access-iframe") || (_.$user$$module$src$log$$().error("amp-access", 'Experiment "amp-access-iframe" is not enabled.'), $loginConfig$jscomp$inline_2151_readerIdFn_type$jscomp$inline_2147$$ = "client");
  this.$type_$ = $loginConfig$jscomp$inline_2151_readerIdFn_type$jscomp$inline_2147$$;
  $loginConfig$jscomp$inline_2151_readerIdFn_type$jscomp$inline_2147$$ = $configJson$jscomp$9$$.login;
  $loginMap$jscomp$inline_2152_scheduleViewFn$$ = {};
  if ($loginConfig$jscomp$inline_2151_readerIdFn_type$jscomp$inline_2147$$) {
    if ("string" == typeof $loginConfig$jscomp$inline_2151_readerIdFn_type$jscomp$inline_2147$$) {
      $loginMap$jscomp$inline_2152_scheduleViewFn$$[""] = $loginConfig$jscomp$inline_2151_readerIdFn_type$jscomp$inline_2147$$;
    } else {
      if (_.$isObject$$module$src$types$$($loginConfig$jscomp$inline_2151_readerIdFn_type$jscomp$inline_2147$$)) {
        for (var $k$jscomp$inline_2153$$ in $loginConfig$jscomp$inline_2151_readerIdFn_type$jscomp$inline_2147$$) {
          $loginMap$jscomp$inline_2152_scheduleViewFn$$[$k$jscomp$inline_2153$$] = $loginConfig$jscomp$inline_2151_readerIdFn_type$jscomp$inline_2147$$[$k$jscomp$inline_2153$$];
        }
      }
    }
  }
  for (var $k$203$jscomp$inline_2154$$ in $loginMap$jscomp$inline_2152_scheduleViewFn$$) {
  }
  this.$J$ = $loginMap$jscomp$inline_2152_scheduleViewFn$$;
  this.$O$ = $configJson$jscomp$9$$.authorizationFallbackResponse;
  this.$K$ = $configJson$jscomp$9$$.namespace || null;
  this.$D$ = $JSCompiler_StaticMethods_createAdapter_$$(this, $configJson$jscomp$9$$);
  this.$urlReplacements_$ = _.$Services$$module$src$services$urlReplacementsForDoc$$($accessElement$$);
  this.$ea$ = _.$openLoginDialog$$module$extensions$amp_access$0_1$login_dialog$$.bind(null, $ampdoc$jscomp$123_deferred$jscomp$30$$);
  this.$F$ = null;
  $ampdoc$jscomp$123_deferred$jscomp$30$$ = new _.$Deferred$$module$src$utils$promise$$;
  this.$aa$ = $ampdoc$jscomp$123_deferred$jscomp$30$$.$promise$;
  this.$I$ = $ampdoc$jscomp$123_deferred$jscomp$30$$.resolve;
  this.$U$ = {};
  this.$G$ = null;
  this.$R$ = 0;
}, $JSCompiler_StaticMethods_createAdapter_$$ = function($JSCompiler_StaticMethods_createAdapter_$self$$, $configJson$jscomp$10$$) {
  var $context$jscomp$19$$ = {$buildUrl$:$JSCompiler_StaticMethods_createAdapter_$self$$.$buildUrl$.bind($JSCompiler_StaticMethods_createAdapter_$self$$), $collectUrlVars$:$JSCompiler_StaticMethods_createAdapter_$self$$.$collectUrlVars$.bind($JSCompiler_StaticMethods_createAdapter_$self$$)}, $isJwt$$ = $JSCompiler_StaticMethods_createAdapter_$self$$.$ba$ && !0 === $configJson$jscomp$10$$.jwt;
  switch($JSCompiler_StaticMethods_createAdapter_$self$$.$type_$) {
    case "client":
      return $isJwt$$ ? new $AccessServerJwtAdapter$$module$extensions$amp_access$0_1$amp_access_server_jwt$$($JSCompiler_StaticMethods_createAdapter_$self$$.ampdoc, $configJson$jscomp$10$$, $context$jscomp$19$$) : new _.$AccessClientAdapter$$module$extensions$amp_access$0_1$amp_access_client$$($JSCompiler_StaticMethods_createAdapter_$self$$.ampdoc, $configJson$jscomp$10$$, $context$jscomp$19$$);
    case "iframe":
      return new $AccessIframeAdapter$$module$extensions$amp_access$0_1$amp_access_iframe$$($JSCompiler_StaticMethods_createAdapter_$self$$.ampdoc, $configJson$jscomp$10$$, $context$jscomp$19$$);
    case "server":
      return $isJwt$$ ? new $AccessServerJwtAdapter$$module$extensions$amp_access$0_1$amp_access_server_jwt$$($JSCompiler_StaticMethods_createAdapter_$self$$.ampdoc, $configJson$jscomp$10$$, $context$jscomp$19$$) : new $AccessServerAdapter$$module$extensions$amp_access$0_1$amp_access_server$$($JSCompiler_StaticMethods_createAdapter_$self$$.ampdoc, $configJson$jscomp$10$$, $context$jscomp$19$$);
    case "vendor":
      return new $AccessVendorAdapter$$module$extensions$amp_access$0_1$amp_access_vendor$$($JSCompiler_StaticMethods_createAdapter_$self$$.ampdoc, $configJson$jscomp$10$$);
    case "other":
      return new $AccessOtherAdapter$$module$extensions$amp_access$0_1$amp_access_other$$($JSCompiler_StaticMethods_createAdapter_$self$$.ampdoc, $configJson$jscomp$10$$, $context$jscomp$19$$);
  }
  throw _.$dev$$module$src$log$$().$createError$("Unsupported access type: ", $JSCompiler_StaticMethods_createAdapter_$self$$.$type_$);
}, $JSCompiler_StaticMethods_AccessSource$$module$extensions$amp_access$0_1$amp_access_source_prototype$getRootElement_$$ = function($JSCompiler_StaticMethods_AccessSource$$module$extensions$amp_access$0_1$amp_access_source_prototype$getRootElement_$self_root$jscomp$24$$) {
  $JSCompiler_StaticMethods_AccessSource$$module$extensions$amp_access$0_1$amp_access_source_prototype$getRootElement_$self_root$jscomp$24$$ = $JSCompiler_StaticMethods_AccessSource$$module$extensions$amp_access$0_1$amp_access_source_prototype$getRootElement_$self_root$jscomp$24$$.ampdoc.getRootNode();
  return $JSCompiler_StaticMethods_AccessSource$$module$extensions$amp_access$0_1$amp_access_source_prototype$getRootElement_$self_root$jscomp$24$$.documentElement || $JSCompiler_StaticMethods_AccessSource$$module$extensions$amp_access$0_1$amp_access_source_prototype$getRootElement_$self_root$jscomp$24$$.body || $JSCompiler_StaticMethods_AccessSource$$module$extensions$amp_access$0_1$amp_access_source_prototype$getRootElement_$self_root$jscomp$24$$;
}, $JSCompiler_StaticMethods_AccessSource$$module$extensions$amp_access$0_1$amp_access_source_prototype$prepareUrlVars_$$ = function($JSCompiler_StaticMethods_AccessSource$$module$extensions$amp_access$0_1$amp_access_source_prototype$prepareUrlVars_$self$$, $useAuthData$jscomp$2$$) {
  return $JSCompiler_StaticMethods_AccessSource$$module$extensions$amp_access$0_1$amp_access_source_prototype$prepareUrlVars_$self$$.$V$().then(function($readerId_vars$jscomp$10$$) {
    $readerId_vars$jscomp$10$$ = {READER_ID:$readerId_vars$jscomp$10$$, ACCESS_READER_ID:$readerId_vars$jscomp$10$$};
    $useAuthData$jscomp$2$$ && ($readerId_vars$jscomp$10$$.AUTHDATA = function($useAuthData$jscomp$2$$) {
      if ($JSCompiler_StaticMethods_AccessSource$$module$extensions$amp_access$0_1$amp_access_source_prototype$prepareUrlVars_$self$$.$F$) {
        return _.$getValueForExpr$$module$src$json$$($JSCompiler_StaticMethods_AccessSource$$module$extensions$amp_access$0_1$amp_access_source_prototype$prepareUrlVars_$self$$.$F$, $useAuthData$jscomp$2$$);
      }
    });
    return $readerId_vars$jscomp$10$$;
  });
}, $JSCompiler_StaticMethods_runAuthorization$$ = function($JSCompiler_StaticMethods_runAuthorization$self$$, $opt_disableFallback$$) {
  return $JSCompiler_StaticMethods_runAuthorization$self$$.$D$.$isAuthorizationEnabled$() ? $JSCompiler_StaticMethods_runAuthorization$self$$.$D$.$authorize$().catch(function($error$jscomp$39$$) {
    _.$triggerAnalyticsEvent$$module$src$analytics$$($JSCompiler_StaticMethods_AccessSource$$module$extensions$amp_access$0_1$amp_access_source_prototype$getRootElement_$$($JSCompiler_StaticMethods_runAuthorization$self$$), "access-authorization-failed");
    if ($JSCompiler_StaticMethods_runAuthorization$self$$.$O$ && !$opt_disableFallback$$) {
      return _.$user$$module$src$log$$().error("amp-access", "Authorization failed: ", $error$jscomp$39$$), $JSCompiler_StaticMethods_runAuthorization$self$$.$O$;
    }
    throw $error$jscomp$39$$;
  }).then(function($opt_disableFallback$$) {
    "amp-access";
    $JSCompiler_StaticMethods_runAuthorization$self$$.$F$ = $opt_disableFallback$$;
    $JSCompiler_StaticMethods_runAuthorization$self$$.$I$();
    $JSCompiler_StaticMethods_buildLoginUrls_$$($JSCompiler_StaticMethods_runAuthorization$self$$);
    return $opt_disableFallback$$;
  }).catch(function($opt_disableFallback$$) {
    _.$user$$module$src$log$$().error("amp-access", "Authorization failed: ", $opt_disableFallback$$);
    $JSCompiler_StaticMethods_runAuthorization$self$$.$I$();
    throw $opt_disableFallback$$;
  }) : ("amp-access", $JSCompiler_StaticMethods_runAuthorization$self$$.$I$(), window.Promise.resolve());
}, $JSCompiler_StaticMethods_reportViewToServer$$ = function($JSCompiler_StaticMethods_reportViewToServer$self$$) {
  return $JSCompiler_StaticMethods_reportViewToServer$self$$.$D$.$AccessClientAdapter$$module$extensions$amp_access$0_1$amp_access_client_prototype$pingback$().then(function() {
    "amp-access";
    _.$triggerAnalyticsEvent$$module$src$analytics$$($JSCompiler_StaticMethods_AccessSource$$module$extensions$amp_access$0_1$amp_access_source_prototype$getRootElement_$$($JSCompiler_StaticMethods_reportViewToServer$self$$), "access-pingback-sent");
  }).catch(function($error$jscomp$41$$) {
    _.$triggerAnalyticsEvent$$module$src$analytics$$($JSCompiler_StaticMethods_AccessSource$$module$extensions$amp_access$0_1$amp_access_source_prototype$getRootElement_$$($JSCompiler_StaticMethods_reportViewToServer$self$$), "access-pingback-failed");
    throw _.$user$$module$src$log$$().$createError$("Pingback failed: ", $error$jscomp$41$$);
  });
}, $JSCompiler_StaticMethods_loginWithType$$ = function($JSCompiler_StaticMethods_loginWithType$self$$, $type$jscomp$152$$) {
  $JSCompiler_StaticMethods_login_$$($JSCompiler_StaticMethods_loginWithType$self$$, $JSCompiler_StaticMethods_loginWithType$self$$.$U$[$type$jscomp$152$$], $type$jscomp$152$$);
}, $JSCompiler_StaticMethods_login_$$ = function($JSCompiler_StaticMethods_login_$self$$, $loginUrl$jscomp$4$$, $eventLabel$jscomp$1$$) {
  var $now$jscomp$23$$ = Date.now();
  if (!($JSCompiler_StaticMethods_login_$self$$.$G$ && 1000 > $now$jscomp$23$$ - $JSCompiler_StaticMethods_login_$self$$.$R$)) {
    "amp-access";
    $JSCompiler_StaticMethods_loginAnalyticsEvent_$$($JSCompiler_StaticMethods_login_$self$$, $eventLabel$jscomp$1$$, "started");
    var $loginPromise$$ = $JSCompiler_StaticMethods_login_$self$$.$ea$($loginUrl$jscomp$4$$).then(function($loginUrl$jscomp$4$$) {
      "amp-access";
      $JSCompiler_StaticMethods_login_$self$$.$G$ = null;
      $loginUrl$jscomp$4$$ = _.$parseQueryString_$$module$src$url_parse_query_string$$($loginUrl$jscomp$4$$).success;
      var $now$jscomp$23$$ = "true" == $loginUrl$jscomp$4$$ || "yes" == $loginUrl$jscomp$4$$ || "1" == $loginUrl$jscomp$4$$;
      $now$jscomp$23$$ ? $JSCompiler_StaticMethods_loginAnalyticsEvent_$$($JSCompiler_StaticMethods_login_$self$$, $eventLabel$jscomp$1$$, "success") : $JSCompiler_StaticMethods_loginAnalyticsEvent_$$($JSCompiler_StaticMethods_login_$self$$, $eventLabel$jscomp$1$$, "rejected");
      if ($now$jscomp$23$$ || !$loginUrl$jscomp$4$$) {
        return $JSCompiler_StaticMethods_login_$self$$.$D$.$postAction$(), $loginUrl$jscomp$4$$ = $JSCompiler_StaticMethods_runAuthorization$$($JSCompiler_StaticMethods_login_$self$$, !0), $JSCompiler_StaticMethods_login_$self$$.$W$($loginUrl$jscomp$4$$), $loginUrl$jscomp$4$$.then(function() {
          $JSCompiler_StaticMethods_login_$self$$.$Y$(0);
        });
      }
    }).catch(function($loginUrl$jscomp$4$$) {
      "amp-access";
      $JSCompiler_StaticMethods_loginAnalyticsEvent_$$($JSCompiler_StaticMethods_login_$self$$, $eventLabel$jscomp$1$$, "failed");
      $JSCompiler_StaticMethods_login_$self$$.$G$ == $loginPromise$$ && ($JSCompiler_StaticMethods_login_$self$$.$G$ = null);
      throw $loginUrl$jscomp$4$$;
    });
    $JSCompiler_StaticMethods_login_$self$$.$G$ = $loginPromise$$;
    $JSCompiler_StaticMethods_login_$self$$.$R$ = $now$jscomp$23$$;
  }
}, $JSCompiler_StaticMethods_loginAnalyticsEvent_$$ = function($JSCompiler_StaticMethods_loginAnalyticsEvent_$self$$, $eventType$jscomp$inline_2172_type$jscomp$153$$, $event$jscomp$55$$) {
  var $eventType$jscomp$inline_2169$$ = "access-login-" + $event$jscomp$55$$;
  _.$triggerAnalyticsEvent$$module$src$analytics$$($JSCompiler_StaticMethods_AccessSource$$module$extensions$amp_access$0_1$amp_access_source_prototype$getRootElement_$$($JSCompiler_StaticMethods_loginAnalyticsEvent_$self$$), $eventType$jscomp$inline_2169$$);
  $eventType$jscomp$inline_2172_type$jscomp$153$$ && ($eventType$jscomp$inline_2172_type$jscomp$153$$ = "access-login-" + $eventType$jscomp$inline_2172_type$jscomp$153$$ + "-" + $event$jscomp$55$$, _.$triggerAnalyticsEvent$$module$src$analytics$$($JSCompiler_StaticMethods_AccessSource$$module$extensions$amp_access$0_1$amp_access_source_prototype$getRootElement_$$($JSCompiler_StaticMethods_loginAnalyticsEvent_$self$$), $eventType$jscomp$inline_2172_type$jscomp$153$$));
}, $JSCompiler_StaticMethods_buildLoginUrls_$$ = function($JSCompiler_StaticMethods_buildLoginUrls_$self$$) {
  if (0 != Object.keys($JSCompiler_StaticMethods_buildLoginUrls_$self$$.$J$).length) {
    var $promises$jscomp$9$$ = [], $$jscomp$loop$394$$ = {}, $k$jscomp$20$$;
    for ($k$jscomp$20$$ in $JSCompiler_StaticMethods_buildLoginUrls_$self$$.$J$) {
      $$jscomp$loop$394$$.k = $k$jscomp$20$$, $promises$jscomp$9$$.push($JSCompiler_StaticMethods_buildLoginUrls_$self$$.$buildUrl$($JSCompiler_StaticMethods_buildLoginUrls_$self$$.$J$[$$jscomp$loop$394$$.k], !0).then(function($promises$jscomp$9$$) {
        return function($$jscomp$loop$394$$) {
          $JSCompiler_StaticMethods_buildLoginUrls_$self$$.$U$[$promises$jscomp$9$$.k] = $$jscomp$loop$394$$;
          return {type:$promises$jscomp$9$$.k, url:$$jscomp$loop$394$$};
        };
      }($$jscomp$loop$394$$))), $$jscomp$loop$394$$ = {k:$$jscomp$loop$394$$.k};
    }
    window.Promise.all($promises$jscomp$9$$);
  }
}, $AccessService$$module$extensions$amp_access$0_1$amp_access$$ = function($ampdoc$jscomp$124$$) {
  var $$jscomp$this$jscomp$285$$ = this;
  this.ampdoc = $ampdoc$jscomp$124$$;
  _.$installStylesForDoc$$module$src$style_installer$$($ampdoc$jscomp$124$$, "\n/*# sourceURL=/extensions/amp-access/0.1/amp-access.css*/", function() {
  }, !1, "amp-access");
  var $accessElement$jscomp$1_promises$jscomp$10$$ = $ampdoc$jscomp$124$$.getElementById("amp-access");
  if (this.$K$ = !!$accessElement$jscomp$1_promises$jscomp$10$$) {
    this.$I$ = $accessElement$jscomp$1_promises$jscomp$10$$, this.$U$ = _.$getSourceOrigin$$module$src$url$$($ampdoc$jscomp$124$$.$win$.location), this.$timer_$ = _.$Services$$module$src$services$timerFor$$($ampdoc$jscomp$124$$.$win$), this.$vsync_$ = _.$Services$$module$src$services$vsyncFor$$($ampdoc$jscomp$124$$.$win$), this.$V$ = _.$Services$$module$src$services$cidForDoc$$($ampdoc$jscomp$124$$), this.$viewer_$ = _.$Services$$module$src$services$viewerForDoc$$($ampdoc$jscomp$124$$), this.$viewport_$ = 
    _.$Services$$module$src$services$viewportForDoc$$($ampdoc$jscomp$124$$), this.$templates_$ = _.$Services$$module$src$services$templatesFor$$($ampdoc$jscomp$124$$.$win$), this.$W$ = _.$Services$$module$src$services$resourcesForDoc$$($ampdoc$jscomp$124$$), this.$J$ = _.$Services$$module$src$services$performanceForOrNull$$($ampdoc$jscomp$124$$.$win$), this.$P$ = null, this.$D$ = $JSCompiler_StaticMethods_parseConfig_$$(this), $accessElement$jscomp$1_promises$jscomp$10$$ = this.$D$.map(function($ampdoc$jscomp$124$$) {
      return $ampdoc$jscomp$124$$.$aa$;
    }), this.$O$ = !1, this.$F$ = window.Promise.all($accessElement$jscomp$1_promises$jscomp$10$$), this.$G$ = null, this.$R$ = new _.$Observable$$module$src$observable$$, this.$F$.then(function() {
      $$jscomp$this$jscomp$285$$.$O$ = !0;
      _.$triggerAnalyticsEvent$$module$src$analytics$$($JSCompiler_StaticMethods_AccessService$$module$extensions$amp_access$0_1$amp_access_prototype$getRootElement_$$($$jscomp$this$jscomp$285$$), "access-authorization-received");
      if ($$jscomp$this$jscomp$285$$.$J$) {
        $$jscomp$this$jscomp$285$$.$J$.$D$("aaa");
        var $ampdoc$jscomp$124$$ = $$jscomp$this$jscomp$285$$.$J$, $accessElement$jscomp$1_promises$jscomp$10$$ = $ampdoc$jscomp$124$$.$win$.Date.now(), $visibleTime$jscomp$inline_2180$$ = $ampdoc$jscomp$124$$.$viewer_$ ? $ampdoc$jscomp$124$$.$viewer_$.$Y$ : 0;
        $ampdoc$jscomp$124$$.$D$("aaav", $visibleTime$jscomp$inline_2180$$ ? Math.max($accessElement$jscomp$1_promises$jscomp$10$$ - $visibleTime$jscomp$inline_2180$$, 0) : 0);
        $$jscomp$this$jscomp$285$$.$J$.$F$();
      }
    }), $ampdoc$jscomp$124$$.getRootNode().addEventListener("amp:dom-update", this.$AccessService$$module$extensions$amp_access$0_1$amp_access_prototype$onDomUpdate_$.bind(this));
  }
}, $JSCompiler_StaticMethods_parseConfig_$$ = function($JSCompiler_StaticMethods_parseConfig_$self$$) {
  var $rawContent$$ = _.$tryParseJson$$module$src$json$$($JSCompiler_StaticMethods_parseConfig_$self$$.$I$.textContent, function($JSCompiler_StaticMethods_parseConfig_$self$$) {
    throw _.$user$$module$src$log$$().$createError$('Failed to parse "amp-access" JSON: ' + $JSCompiler_StaticMethods_parseConfig_$self$$);
  }), $configMap$$ = {};
  if (_.$isArray$$module$src$types$$($rawContent$$)) {
    for (var $i$jscomp$176$$ = 0; $i$jscomp$176$$ < $rawContent$$.length; $i$jscomp$176$$++) {
      $configMap$$[$rawContent$$[$i$jscomp$176$$].namespace] = $rawContent$$[$i$jscomp$176$$];
    }
  } else {
    $configMap$$[$rawContent$$.namespace || ""] = $rawContent$$;
  }
  var $readerIdFn$jscomp$1$$ = $JSCompiler_StaticMethods_parseConfig_$self$$.$AccessService$$module$extensions$amp_access$0_1$amp_access_prototype$getReaderId_$.bind($JSCompiler_StaticMethods_parseConfig_$self$$), $scheduleViewFn$jscomp$1$$ = $JSCompiler_StaticMethods_parseConfig_$self$$.$AccessService$$module$extensions$amp_access$0_1$amp_access_prototype$scheduleView_$.bind($JSCompiler_StaticMethods_parseConfig_$self$$), $onReauthorizeFn$jscomp$1$$ = $JSCompiler_StaticMethods_parseConfig_$self$$.$AccessService$$module$extensions$amp_access$0_1$amp_access_prototype$onReauthorize_$.bind($JSCompiler_StaticMethods_parseConfig_$self$$);
  return Object.keys($configMap$$).map(function($rawContent$$) {
    return new $AccessSource$$module$extensions$amp_access$0_1$amp_access_source$$($JSCompiler_StaticMethods_parseConfig_$self$$.ampdoc, $configMap$$[$rawContent$$], $readerIdFn$jscomp$1$$, $scheduleViewFn$jscomp$1$$, $onReauthorizeFn$jscomp$1$$, $JSCompiler_StaticMethods_parseConfig_$self$$.$I$);
  });
}, $JSCompiler_StaticMethods_AccessService$$module$extensions$amp_access$0_1$amp_access_prototype$getRootElement_$$ = function($JSCompiler_StaticMethods_AccessService$$module$extensions$amp_access$0_1$amp_access_prototype$getRootElement_$self_root$jscomp$25$$) {
  $JSCompiler_StaticMethods_AccessService$$module$extensions$amp_access$0_1$amp_access_prototype$getRootElement_$self_root$jscomp$25$$ = $JSCompiler_StaticMethods_AccessService$$module$extensions$amp_access$0_1$amp_access_prototype$getRootElement_$self_root$jscomp$25$$.ampdoc.getRootNode();
  return $JSCompiler_StaticMethods_AccessService$$module$extensions$amp_access$0_1$amp_access_prototype$getRootElement_$self_root$jscomp$25$$.documentElement || $JSCompiler_StaticMethods_AccessService$$module$extensions$amp_access$0_1$amp_access_prototype$getRootElement_$self_root$jscomp$25$$.body || $JSCompiler_StaticMethods_AccessService$$module$extensions$amp_access$0_1$amp_access_prototype$getRootElement_$self_root$jscomp$25$$;
}, $JSCompiler_StaticMethods_AccessService$$module$extensions$amp_access$0_1$amp_access_prototype$listenToBroadcasts_$$ = function($JSCompiler_StaticMethods_AccessService$$module$extensions$amp_access$0_1$amp_access_prototype$listenToBroadcasts_$self$$) {
  _.$JSCompiler_StaticMethods_onBroadcast$$($JSCompiler_StaticMethods_AccessService$$module$extensions$amp_access$0_1$amp_access_prototype$listenToBroadcasts_$self$$.$viewer_$, function($message$jscomp$51$$) {
    "amp-access-reauthorize" == $message$jscomp$51$$.type && $message$jscomp$51$$.origin == $JSCompiler_StaticMethods_AccessService$$module$extensions$amp_access$0_1$amp_access_prototype$listenToBroadcasts_$self$$.$U$ && $JSCompiler_StaticMethods_runAuthorization_$$($JSCompiler_StaticMethods_AccessService$$module$extensions$amp_access$0_1$amp_access_prototype$listenToBroadcasts_$self$$);
  });
}, $JSCompiler_StaticMethods_runAuthorization_$$ = function($JSCompiler_StaticMethods_runAuthorization_$self$$) {
  $JSCompiler_StaticMethods_toggleTopClass_$$($JSCompiler_StaticMethods_runAuthorization_$self$$, "amp-access-loading", !0);
  var $rendered$$ = $JSCompiler_StaticMethods_runAuthorization_$self$$.$viewer_$.$D$.then(function() {
    return window.Promise.all($JSCompiler_StaticMethods_runAuthorization_$self$$.$D$.map(function($rendered$$) {
      return $JSCompiler_StaticMethods_runOneAuthorization_$$($JSCompiler_StaticMethods_runAuthorization_$self$$, $rendered$$);
    }));
  }).then(function() {
    $JSCompiler_StaticMethods_toggleTopClass_$$($JSCompiler_StaticMethods_runAuthorization_$self$$, "amp-access-loading", !1);
    return $JSCompiler_StaticMethods_runAuthorization_$self$$.ampdoc.$whenReady$().then(function() {
      var $rendered$$ = $JSCompiler_StaticMethods_runAuthorization_$self$$.ampdoc.getRootNode(), $responses$jscomp$2$$ = $JSCompiler_StaticMethods_combinedResponses$$($JSCompiler_StaticMethods_runAuthorization_$self$$);
      return $JSCompiler_StaticMethods_applyAuthorizationToRoot_$$($JSCompiler_StaticMethods_runAuthorization_$self$$, $rendered$$, $responses$jscomp$2$$);
    });
  });
  $JSCompiler_StaticMethods_runAuthorization_$self$$.$F$ = $rendered$$;
}, $JSCompiler_StaticMethods_runOneAuthorization_$$ = function($JSCompiler_StaticMethods_runOneAuthorization_$self$$, $source$jscomp$33$$) {
  return $JSCompiler_StaticMethods_runAuthorization$$($source$jscomp$33$$).catch(function() {
    $JSCompiler_StaticMethods_toggleTopClass_$$($JSCompiler_StaticMethods_runOneAuthorization_$self$$, "amp-access-error", !0);
  });
}, $JSCompiler_StaticMethods_applyAuthorizationToRoot_$$ = function($JSCompiler_StaticMethods_applyAuthorizationToRoot_$self$$, $elements$jscomp$17_root$jscomp$28$$, $response$jscomp$36$$) {
  $elements$jscomp$17_root$jscomp$28$$ = $elements$jscomp$17_root$jscomp$28$$.querySelectorAll("[amp-access]");
  for (var $promises$jscomp$11$$ = [], $i$jscomp$179$$ = 0; $i$jscomp$179$$ < $elements$jscomp$17_root$jscomp$28$$.length; $i$jscomp$179$$++) {
    $promises$jscomp$11$$.push($JSCompiler_StaticMethods_applyAuthorizationToElement_$$($JSCompiler_StaticMethods_applyAuthorizationToRoot_$self$$, $elements$jscomp$17_root$jscomp$28$$[$i$jscomp$179$$], $response$jscomp$36$$));
  }
  return window.Promise.all($promises$jscomp$11$$).then(function() {
    $JSCompiler_StaticMethods_applyAuthorizationToRoot_$self$$.$R$.$fire$();
  });
}, $JSCompiler_StaticMethods_applyAuthorizationToElement_$$ = function($JSCompiler_StaticMethods_applyAuthorizationToElement_$self$$, $element$jscomp$276$$, $response$jscomp$37$$) {
  var $expr$jscomp$13_renderPromise$jscomp$1$$ = $element$jscomp$276$$.getAttribute("amp-access"), $on$jscomp$4$$ = _.$evaluateAccessExpr$$module$extensions$amp_access$0_1$access_expr$$($expr$jscomp$13_renderPromise$jscomp$1$$, $response$jscomp$37$$);
  $expr$jscomp$13_renderPromise$jscomp$1$$ = null;
  $on$jscomp$4$$ && ($expr$jscomp$13_renderPromise$jscomp$1$$ = $JSCompiler_StaticMethods_renderTemplates_$$($JSCompiler_StaticMethods_applyAuthorizationToElement_$self$$, $element$jscomp$276$$, $response$jscomp$37$$));
  return $expr$jscomp$13_renderPromise$jscomp$1$$ ? $expr$jscomp$13_renderPromise$jscomp$1$$.then(function() {
    return $JSCompiler_StaticMethods_applyAuthorizationAttrs_$$($JSCompiler_StaticMethods_applyAuthorizationToElement_$self$$, $element$jscomp$276$$, $on$jscomp$4$$);
  }) : $JSCompiler_StaticMethods_applyAuthorizationAttrs_$$($JSCompiler_StaticMethods_applyAuthorizationToElement_$self$$, $element$jscomp$276$$, $on$jscomp$4$$);
}, $JSCompiler_StaticMethods_applyAuthorizationAttrs_$$ = function($JSCompiler_StaticMethods_applyAuthorizationAttrs_$self$$, $element$jscomp$277$$, $on$jscomp$5$$) {
  return $on$jscomp$5$$ == !$element$jscomp$277$$.hasAttribute("amp-access-hide") ? window.Promise.resolve() : $JSCompiler_StaticMethods_applyAuthorizationAttrs_$self$$.$W$.$mutateElement$($element$jscomp$277$$, function() {
    $on$jscomp$5$$ ? $element$jscomp$277$$.removeAttribute("amp-access-hide") : $element$jscomp$277$$.setAttribute("amp-access-hide", "");
  });
}, $JSCompiler_StaticMethods_renderTemplates_$$ = function($JSCompiler_StaticMethods_renderTemplates_$self$$, $element$jscomp$278$$, $response$jscomp$38$$) {
  var $promises$jscomp$12$$ = [], $templateElements$$ = $element$jscomp$278$$.querySelectorAll("[amp-access-template]");
  if (0 < $templateElements$$.length) {
    for (var $$jscomp$loop$395$$ = {i:0}; $$jscomp$loop$395$$.i < $templateElements$$.length; $$jscomp$loop$395$$ = {i:$$jscomp$loop$395$$.i}, $$jscomp$loop$395$$.i++) {
      var $p$jscomp$14$$ = $JSCompiler_StaticMethods_AccessService$$module$extensions$amp_access$0_1$amp_access_prototype$renderTemplate_$$($JSCompiler_StaticMethods_renderTemplates_$self$$, $templateElements$$[$$jscomp$loop$395$$.i], $response$jscomp$38$$).catch(function($JSCompiler_StaticMethods_renderTemplates_$self$$) {
        return function($response$jscomp$38$$) {
          _.$dev$$module$src$log$$().error("amp-access", "Template failed: ", $response$jscomp$38$$, $templateElements$$[$JSCompiler_StaticMethods_renderTemplates_$self$$.i], $element$jscomp$278$$);
        };
      }($$jscomp$loop$395$$));
      $promises$jscomp$12$$.push($p$jscomp$14$$);
    }
  }
  return 0 < $promises$jscomp$12$$.length ? window.Promise.all($promises$jscomp$12$$) : null;
}, $JSCompiler_StaticMethods_AccessService$$module$extensions$amp_access$0_1$amp_access_prototype$renderTemplate_$$ = function($JSCompiler_StaticMethods_AccessService$$module$extensions$amp_access$0_1$amp_access_prototype$renderTemplate_$self$$, $templateOrPrev$$, $response$jscomp$39$$) {
  var $template$jscomp$12$$ = $templateOrPrev$$, $prev$jscomp$1$$ = null;
  "TEMPLATE" != $template$jscomp$12$$.tagName && ($prev$jscomp$1$$ = $template$jscomp$12$$, $template$jscomp$12$$ = $prev$jscomp$1$$.__AMP_ACCESS__TEMPLATE);
  return $template$jscomp$12$$ ? _.$JSCompiler_StaticMethods_Templates$$module$src$service$template_impl_prototype$renderTemplate$$($JSCompiler_StaticMethods_AccessService$$module$extensions$amp_access$0_1$amp_access_prototype$renderTemplate_$self$$.$templates_$, $template$jscomp$12$$, $response$jscomp$39$$).then(function($templateOrPrev$$) {
    return _.$JSCompiler_StaticMethods_mutatePromise$$($JSCompiler_StaticMethods_AccessService$$module$extensions$amp_access$0_1$amp_access_prototype$renderTemplate_$self$$.$vsync_$, function() {
      $templateOrPrev$$.setAttribute("amp-access-template", "");
      $templateOrPrev$$.__AMP_ACCESS__TEMPLATE = $template$jscomp$12$$;
      $template$jscomp$12$$.parentElement ? $template$jscomp$12$$.parentElement.replaceChild($templateOrPrev$$, $template$jscomp$12$$) : $prev$jscomp$1$$ && $prev$jscomp$1$$.parentElement && $prev$jscomp$1$$.parentElement.replaceChild($templateOrPrev$$, $prev$jscomp$1$$);
    });
  }) : window.Promise.reject(Error("template not found"));
}, $JSCompiler_StaticMethods_AccessService$$module$extensions$amp_access$0_1$amp_access_prototype$reportWhenViewed_$$ = function($JSCompiler_StaticMethods_AccessService$$module$extensions$amp_access$0_1$amp_access_prototype$reportWhenViewed_$self$$, $timeToView$jscomp$1$$) {
  $JSCompiler_StaticMethods_AccessService$$module$extensions$amp_access$0_1$amp_access_prototype$reportWhenViewed_$self$$.$G$ || ("amp-access", $JSCompiler_StaticMethods_AccessService$$module$extensions$amp_access$0_1$amp_access_prototype$reportWhenViewed_$self$$.$G$ = $JSCompiler_StaticMethods_AccessService$$module$extensions$amp_access$0_1$amp_access_prototype$whenViewed_$$($JSCompiler_StaticMethods_AccessService$$module$extensions$amp_access$0_1$amp_access_prototype$reportWhenViewed_$self$$, $timeToView$jscomp$1$$).then(function() {
    return $JSCompiler_StaticMethods_AccessService$$module$extensions$amp_access$0_1$amp_access_prototype$reportWhenViewed_$self$$.$F$;
  }).then(function() {
    _.$triggerAnalyticsEvent$$module$src$analytics$$($JSCompiler_StaticMethods_AccessService$$module$extensions$amp_access$0_1$amp_access_prototype$getRootElement_$$($JSCompiler_StaticMethods_AccessService$$module$extensions$amp_access$0_1$amp_access_prototype$reportWhenViewed_$self$$), "access-viewed");
    for (var $timeToView$jscomp$1$$ = [], $i$jscomp$inline_2187$$ = 0; $i$jscomp$inline_2187$$ < $JSCompiler_StaticMethods_AccessService$$module$extensions$amp_access$0_1$amp_access_prototype$reportWhenViewed_$self$$.$D$.length; $i$jscomp$inline_2187$$++) {
      $JSCompiler_StaticMethods_AccessService$$module$extensions$amp_access$0_1$amp_access_prototype$reportWhenViewed_$self$$.$D$[$i$jscomp$inline_2187$$].$D$.$AccessClientAdapter$$module$extensions$amp_access$0_1$amp_access_client_prototype$isPingbackEnabled$() && $timeToView$jscomp$1$$.push($JSCompiler_StaticMethods_reportViewToServer$$($JSCompiler_StaticMethods_AccessService$$module$extensions$amp_access$0_1$amp_access_prototype$reportWhenViewed_$self$$.$D$[$i$jscomp$inline_2187$$]));
    }
    return window.Promise.all($timeToView$jscomp$1$$);
  }).catch(function($timeToView$jscomp$1$$) {
    "amp-access";
    $JSCompiler_StaticMethods_AccessService$$module$extensions$amp_access$0_1$amp_access_prototype$reportWhenViewed_$self$$.$G$ = null;
    throw $timeToView$jscomp$1$$;
  }), $JSCompiler_StaticMethods_AccessService$$module$extensions$amp_access$0_1$amp_access_prototype$reportWhenViewed_$self$$.$G$.then($JSCompiler_StaticMethods_AccessService$$module$extensions$amp_access$0_1$amp_access_prototype$reportWhenViewed_$self$$.$broadcastReauthorize_$.bind($JSCompiler_StaticMethods_AccessService$$module$extensions$amp_access$0_1$amp_access_prototype$reportWhenViewed_$self$$)));
}, $JSCompiler_StaticMethods_AccessService$$module$extensions$amp_access$0_1$amp_access_prototype$whenViewed_$$ = function($JSCompiler_StaticMethods_AccessService$$module$extensions$amp_access$0_1$amp_access_prototype$whenViewed_$self$$, $timeToView$jscomp$2$$) {
  if (0 == $timeToView$jscomp$2$$) {
    return window.Promise.resolve();
  }
  var $unlistenSet$$ = [];
  return (new window.Promise(function($resolve$jscomp$50$$, $reject$jscomp$21$$) {
    $unlistenSet$$.push(_.$JSCompiler_StaticMethods_Viewer$$module$src$service$viewer_impl_prototype$onVisibilityChanged$$($JSCompiler_StaticMethods_AccessService$$module$extensions$amp_access$0_1$amp_access_prototype$whenViewed_$self$$.$viewer_$, function() {
      _.$JSCompiler_StaticMethods_Viewer$$module$src$service$viewer_impl_prototype$isVisible$$($JSCompiler_StaticMethods_AccessService$$module$extensions$amp_access$0_1$amp_access_prototype$whenViewed_$self$$.$viewer_$) || $reject$jscomp$21$$(_.$cancellation$$module$src$error$$());
    }));
    var $timeoutId$jscomp$1$$ = $JSCompiler_StaticMethods_AccessService$$module$extensions$amp_access$0_1$amp_access_prototype$whenViewed_$self$$.$timer_$.delay($resolve$jscomp$50$$, $timeToView$jscomp$2$$);
    $unlistenSet$$.push(function() {
      return $JSCompiler_StaticMethods_AccessService$$module$extensions$amp_access$0_1$amp_access_prototype$whenViewed_$self$$.$timer_$.cancel($timeoutId$jscomp$1$$);
    });
    $unlistenSet$$.push(_.$JSCompiler_StaticMethods_Viewport$$module$src$service$viewport$viewport_impl_prototype$onScroll$$($JSCompiler_StaticMethods_AccessService$$module$extensions$amp_access$0_1$amp_access_prototype$whenViewed_$self$$.$viewport_$, $resolve$jscomp$50$$));
    $unlistenSet$$.push(_.$listenOnce$$module$src$event_helper$$($JSCompiler_StaticMethods_AccessService$$module$extensions$amp_access$0_1$amp_access_prototype$whenViewed_$self$$.ampdoc.getRootNode(), "click", $resolve$jscomp$50$$));
  })).then(function() {
    $unlistenSet$$.forEach(function($JSCompiler_StaticMethods_AccessService$$module$extensions$amp_access$0_1$amp_access_prototype$whenViewed_$self$$) {
      return $JSCompiler_StaticMethods_AccessService$$module$extensions$amp_access$0_1$amp_access_prototype$whenViewed_$self$$();
    });
  }, function($JSCompiler_StaticMethods_AccessService$$module$extensions$amp_access$0_1$amp_access_prototype$whenViewed_$self$$) {
    $unlistenSet$$.forEach(function($JSCompiler_StaticMethods_AccessService$$module$extensions$amp_access$0_1$amp_access_prototype$whenViewed_$self$$) {
      return $JSCompiler_StaticMethods_AccessService$$module$extensions$amp_access$0_1$amp_access_prototype$whenViewed_$self$$();
    });
    throw $JSCompiler_StaticMethods_AccessService$$module$extensions$amp_access$0_1$amp_access_prototype$whenViewed_$self$$;
  });
}, $JSCompiler_StaticMethods_toggleTopClass_$$ = function($JSCompiler_StaticMethods_toggleTopClass_$self$$, $className$jscomp$2$$, $on$jscomp$6$$) {
  $JSCompiler_StaticMethods_toggleTopClass_$self$$.$vsync_$.$mutate$(function() {
    $JSCompiler_StaticMethods_AccessService$$module$extensions$amp_access$0_1$amp_access_prototype$getRootElement_$$($JSCompiler_StaticMethods_toggleTopClass_$self$$).classList.toggle($className$jscomp$2$$, $on$jscomp$6$$);
  });
}, $JSCompiler_StaticMethods_loginWithType_$$ = function($JSCompiler_StaticMethods_loginWithType_$self$$, $type$jscomp$154$$) {
  var $splitPoint$$ = $type$jscomp$154$$.indexOf("-"), $namespace$jscomp$4$$ = -1 < $splitPoint$$ ? $type$jscomp$154$$.substring(0, $splitPoint$$) : $type$jscomp$154$$, $match$jscomp$17$$ = $JSCompiler_StaticMethods_loginWithType_$self$$.$D$.filter(function($JSCompiler_StaticMethods_loginWithType_$self$$) {
    return $JSCompiler_StaticMethods_loginWithType_$self$$.$K$ == $namespace$jscomp$4$$;
  });
  $match$jscomp$17$$.length ? $JSCompiler_StaticMethods_loginWithType$$($match$jscomp$17$$[0], -1 < $splitPoint$$ ? $type$jscomp$154$$.substring($splitPoint$$ + 1) : "") : $JSCompiler_StaticMethods_loginWithType$$($JSCompiler_StaticMethods_loginWithType_$self$$.$D$[0], $type$jscomp$154$$);
}, $JSCompiler_StaticMethods_combinedResponses$$ = function($JSCompiler_StaticMethods_combinedResponses$self$$) {
  if (1 == $JSCompiler_StaticMethods_combinedResponses$self$$.$D$.length && !$JSCompiler_StaticMethods_combinedResponses$self$$.$D$[0].$K$) {
    return $JSCompiler_StaticMethods_combinedResponses$self$$.$D$[0].$F$ || {};
  }
  var $combined$$ = {};
  $JSCompiler_StaticMethods_combinedResponses$self$$.$D$.forEach(function($JSCompiler_StaticMethods_combinedResponses$self$$) {
    return $combined$$[$JSCompiler_StaticMethods_combinedResponses$self$$.$K$] = $JSCompiler_StaticMethods_combinedResponses$self$$.$F$;
  });
  return $combined$$;
};
_.$JSCompiler_prototypeAlias$$ = _.$AccessClientAdapter$$module$extensions$amp_access$0_1$amp_access_client$$.prototype;
_.$JSCompiler_prototypeAlias$$.$postAction$ = _.$JSCompiler_unstubMethod$$(60, function() {
});
_.$JSCompiler_prototypeAlias$$.$AccessClientAdapter$$module$extensions$amp_access$0_1$amp_access_client_prototype$pingback$ = _.$JSCompiler_unstubMethod$$(59, function() {
  var $$jscomp$this$jscomp$241$$ = this;
  return this.$context_$.$buildUrl$(this.$J$, !0).then(function($url$jscomp$113$$) {
    "amp-access-client";
    return _.$JSCompiler_StaticMethods_sendSignal$$($$jscomp$this$jscomp$241$$.$xhr_$, $url$jscomp$113$$, {method:"POST", credentials:"include", headers:_.$dict$$module$src$utils$object$$({"Content-Type":"application/x-www-form-urlencoded"}), body:""});
  });
});
_.$JSCompiler_prototypeAlias$$.$AccessClientAdapter$$module$extensions$amp_access$0_1$amp_access_client_prototype$isPingbackEnabled$ = _.$JSCompiler_unstubMethod$$(58, function() {
  return this.$I$;
});
_.$JSCompiler_prototypeAlias$$.$authorize$ = _.$JSCompiler_unstubMethod$$(57, function() {
  var $$jscomp$this$jscomp$240$$ = this;
  "amp-access-client";
  return this.$context_$.$buildUrl$(this.$D$, !1).then(function($url$jscomp$112$$) {
    "amp-access-client";
    return _.$JSCompiler_StaticMethods_timeoutPromise$$($$jscomp$this$jscomp$240$$.$timer_$, $$jscomp$this$jscomp$240$$.$G$, _.$JSCompiler_StaticMethods_fetchJson$$($$jscomp$this$jscomp$240$$.$xhr_$, $url$jscomp$112$$, {credentials:"include"})).then(function($$jscomp$this$jscomp$240$$) {
      return $$jscomp$this$jscomp$240$$.json();
    });
  });
});
_.$JSCompiler_prototypeAlias$$.$isAuthorizationEnabled$ = _.$JSCompiler_unstubMethod$$(56, function() {
  return !0;
});
_.$JSCompiler_prototypeAlias$$.$getConfig$ = _.$JSCompiler_unstubMethod$$(55, function() {
  return {authorizationUrl:this.$D$, pingbackEnabled:this.$I$, pingbackUrl:this.$J$, authorizationTimeout:this.$G$};
});
_.$JSCompiler_prototypeAlias$$ = $AccessServerAdapter$$module$extensions$amp_access$0_1$amp_access_server$$.prototype;
_.$JSCompiler_prototypeAlias$$.$getConfig$ = function() {
  return {client:this.$D$.$getConfig$(), proxy:this.$G$, serverState:this.$F$};
};
_.$JSCompiler_prototypeAlias$$.$isAuthorizationEnabled$ = function() {
  return !0;
};
_.$JSCompiler_prototypeAlias$$.$authorize$ = function() {
  var $$jscomp$this$jscomp$266$$ = this;
  "amp-access-server";
  if (!this.$G$ || !this.$F$) {
    return "amp-access-server", this.$D$.$authorize$();
  }
  "amp-access-server";
  return this.$context_$.$collectUrlVars$(this.$D$.$D$, !1).then(function($request$jscomp$13_vars$jscomp$6$$) {
    var $requestVars$$ = {}, $k$jscomp$18$$;
    for ($k$jscomp$18$$ in $request$jscomp$13_vars$jscomp$6$$) {
      null != $request$jscomp$13_vars$jscomp$6$$[$k$jscomp$18$$] && ($requestVars$$[$k$jscomp$18$$] = String($request$jscomp$13_vars$jscomp$6$$[$k$jscomp$18$$]));
    }
    $request$jscomp$13_vars$jscomp$6$$ = _.$dict$$module$src$utils$object$$({url:_.$removeFragment$$module$src$url$$($$jscomp$this$jscomp$266$$.ampdoc.$win$.location.href), state:$$jscomp$this$jscomp$266$$.$F$, vars:$requestVars$$});
    "amp-access-server";
    return _.$JSCompiler_StaticMethods_timeoutPromise$$($$jscomp$this$jscomp$266$$.$timer_$, $$jscomp$this$jscomp$266$$.$D$.$G$, _.$fetchDocument$$module$src$document_fetcher$$($$jscomp$this$jscomp$266$$.ampdoc.$win$, $$jscomp$this$jscomp$266$$.$I$, {method:"POST", body:"request=" + (0,window.encodeURIComponent)(JSON.stringify($request$jscomp$13_vars$jscomp$6$$)), headers:_.$dict$$module$src$utils$object$$({"Content-Type":"application/x-www-form-urlencoded"}), requireAmpResponseSourceOrigin:!1}));
  }).then(function($responseDoc$$) {
    "amp-access-server";
    var $accessData$$ = _.$parseJson$$module$src$json$$($responseDoc$$.querySelector('script[id="amp-access-data"]').textContent);
    "amp-access-server";
    return $JSCompiler_StaticMethods_AccessServerAdapter$$module$extensions$amp_access$0_1$amp_access_server_prototype$replaceSections_$$($$jscomp$this$jscomp$266$$, $responseDoc$$).then(function() {
      return $accessData$$;
    });
  });
};
_.$JSCompiler_prototypeAlias$$.$AccessClientAdapter$$module$extensions$amp_access$0_1$amp_access_client_prototype$isPingbackEnabled$ = function() {
  return this.$D$.$AccessClientAdapter$$module$extensions$amp_access$0_1$amp_access_client_prototype$isPingbackEnabled$();
};
_.$JSCompiler_prototypeAlias$$.$AccessClientAdapter$$module$extensions$amp_access$0_1$amp_access_client_prototype$pingback$ = function() {
  return this.$D$.$AccessClientAdapter$$module$extensions$amp_access$0_1$amp_access_client_prototype$pingback$();
};
_.$JSCompiler_prototypeAlias$$.$postAction$ = function() {
};
_.$JSCompiler_prototypeAlias$$ = $AccessOtherAdapter$$module$extensions$amp_access$0_1$amp_access_other$$.prototype;
_.$JSCompiler_prototypeAlias$$.$getConfig$ = function() {
  return {authorizationResponse:this.$D$};
};
_.$JSCompiler_prototypeAlias$$.$isAuthorizationEnabled$ = function() {
  return !!this.$D$ && !this.$F$;
};
_.$JSCompiler_prototypeAlias$$.$authorize$ = function() {
  "amp-access-other";
  return window.Promise.resolve(this.$D$);
};
_.$JSCompiler_prototypeAlias$$.$AccessClientAdapter$$module$extensions$amp_access$0_1$amp_access_client_prototype$isPingbackEnabled$ = function() {
  return !1;
};
_.$JSCompiler_prototypeAlias$$.$AccessClientAdapter$$module$extensions$amp_access$0_1$amp_access_client_prototype$pingback$ = function() {
  "amp-access-other";
  return window.Promise.resolve();
};
_.$JSCompiler_prototypeAlias$$.$postAction$ = function() {
};
_.$JSCompiler_prototypeAlias$$ = $AccessVendorAdapter$$module$extensions$amp_access$0_1$amp_access_vendor$$.prototype;
_.$JSCompiler_prototypeAlias$$.$getConfig$ = function() {
  return this.$I$;
};
_.$JSCompiler_prototypeAlias$$.$registerVendor$ = function($vendor$jscomp$4$$) {
  this.$F$($vendor$jscomp$4$$);
  this.$F$ = null;
};
_.$JSCompiler_prototypeAlias$$.$isAuthorizationEnabled$ = function() {
  return !0;
};
_.$JSCompiler_prototypeAlias$$.$authorize$ = function() {
  "amp-access-vendor";
  return this.$D$.then(function($vendor$jscomp$5$$) {
    return $vendor$jscomp$5$$.$authorize$();
  });
};
_.$JSCompiler_prototypeAlias$$.$AccessClientAdapter$$module$extensions$amp_access$0_1$amp_access_client_prototype$isPingbackEnabled$ = function() {
  return this.$G$;
};
_.$JSCompiler_prototypeAlias$$.$AccessClientAdapter$$module$extensions$amp_access$0_1$amp_access_client_prototype$pingback$ = function() {
  "amp-access-vendor";
  return this.$D$.then(function($vendor$jscomp$6$$) {
    return $vendor$jscomp$6$$.$AccessClientAdapter$$module$extensions$amp_access$0_1$amp_access_client_prototype$pingback$();
  });
};
_.$JSCompiler_prototypeAlias$$.$postAction$ = function() {
};
_.$JSCompiler_prototypeAlias$$ = $AccessServerJwtAdapter$$module$extensions$amp_access$0_1$amp_access_server_jwt$$.prototype;
_.$JSCompiler_prototypeAlias$$.$getConfig$ = function() {
  return {client:this.$D$.$getConfig$(), proxy:this.$J$, serverState:this.$G$, publicKey:this.$F$, publicKeyUrl:this.$I$};
};
_.$JSCompiler_prototypeAlias$$.$isAuthorizationEnabled$ = function() {
  return !0;
};
_.$JSCompiler_prototypeAlias$$.$authorize$ = function() {
  "amp-access-server-jwt";
  return this.$J$ && this.$G$ ? $JSCompiler_StaticMethods_authorizeOnServer_$$(this) : $JSCompiler_StaticMethods_authorizeOnClient_$$(this);
};
_.$JSCompiler_prototypeAlias$$.$AccessClientAdapter$$module$extensions$amp_access$0_1$amp_access_client_prototype$isPingbackEnabled$ = function() {
  return this.$D$.$AccessClientAdapter$$module$extensions$amp_access$0_1$amp_access_client_prototype$isPingbackEnabled$();
};
_.$JSCompiler_prototypeAlias$$.$AccessClientAdapter$$module$extensions$amp_access$0_1$amp_access_client_prototype$pingback$ = function() {
  return this.$D$.$AccessClientAdapter$$module$extensions$amp_access$0_1$amp_access_client_prototype$pingback$();
};
_.$JSCompiler_prototypeAlias$$.$postAction$ = function() {
};
$Messenger$$module$extensions$amp_access$0_1$iframe_api$messenger$$.prototype.disconnect = function() {
  this.$D$ && (this.$D$ = null, this.$J$.removeEventListener("message", this.$I$));
};
$Messenger$$module$extensions$amp_access$0_1$iframe_api$messenger$$.prototype.isConnected = function() {
  return null != this.$targetOrigin_$;
};
$Messenger$$module$extensions$amp_access$0_1$iframe_api$messenger$$.prototype.$O$ = function($e$jscomp$118_rsvp$$) {
  var $$jscomp$this$jscomp$271$$ = this, $data$jscomp$87$$ = $e$jscomp$118_rsvp$$.data;
  if ($data$jscomp$87$$ && "__AMP__" == $data$jscomp$87$$.sentinel) {
    var $origin$jscomp$19$$ = $e$jscomp$118_rsvp$$.origin, $cmd$jscomp$3_result$jscomp$21$$ = $data$jscomp$87$$.cmd, $payload$jscomp$5$$ = $data$jscomp$87$$.payload || null;
    null == this.$targetOrigin_$ && "start" == $cmd$jscomp$3_result$jscomp$21$$ && (this.$targetOrigin_$ = $origin$jscomp$19$$);
    null == this.$targetOrigin_$ && $e$jscomp$118_rsvp$$.source && $JSCompiler_StaticMethods_Messenger$$module$extensions$amp_access$0_1$iframe_api$messenger_prototype$getOptionalTarget_$$(this) == $e$jscomp$118_rsvp$$.source && (this.$targetOrigin_$ = $origin$jscomp$19$$);
    if ($origin$jscomp$19$$ == this.$targetOrigin_$) {
      var $rsvpId$jscomp$2$$ = $data$jscomp$87$$._rsvp;
      $e$jscomp$118_rsvp$$ = !!$rsvpId$jscomp$2$$ && "rsvp" != $cmd$jscomp$3_result$jscomp$21$$;
      $cmd$jscomp$3_result$jscomp$21$$ = $JSCompiler_StaticMethods_Messenger$$module$extensions$amp_access$0_1$iframe_api$messenger_prototype$handleCommand_$$(this, $rsvpId$jscomp$2$$, $cmd$jscomp$3_result$jscomp$21$$, $payload$jscomp$5$$);
      $e$jscomp$118_rsvp$$ && window.Promise.resolve($cmd$jscomp$3_result$jscomp$21$$).then(function($e$jscomp$118_rsvp$$) {
        $JSCompiler_StaticMethods_Messenger$$module$extensions$amp_access$0_1$iframe_api$messenger_prototype$sendCommand_$$($$jscomp$this$jscomp$271$$, $rsvpId$jscomp$2$$, "rsvp", {result:$e$jscomp$118_rsvp$$});
      }, function($e$jscomp$118_rsvp$$) {
        $JSCompiler_StaticMethods_Messenger$$module$extensions$amp_access$0_1$iframe_api$messenger_prototype$sendCommand_$$($$jscomp$this$jscomp$271$$, $rsvpId$jscomp$2$$, "rsvp", {error:String($e$jscomp$118_rsvp$$)});
      });
    }
  }
};
_.$JSCompiler_prototypeAlias$$ = $AccessIframeAdapter$$module$extensions$amp_access$0_1$amp_access_iframe$$.prototype;
_.$JSCompiler_prototypeAlias$$.disconnect = function() {
  this.$D$.disconnect();
  this.ampdoc.$getBody$().removeChild(this.$iframe_$);
};
_.$JSCompiler_prototypeAlias$$.$getConfig$ = function() {
  return {iframeSrc:this.$iframeSrc_$, iframeVars:this.$I$};
};
_.$JSCompiler_prototypeAlias$$.$isAuthorizationEnabled$ = function() {
  return !0;
};
_.$JSCompiler_prototypeAlias$$.$authorize$ = function() {
  return window.Promise.race([$JSCompiler_StaticMethods_authorizeLocal_$$(this), $JSCompiler_StaticMethods_authorizeRemote_$$(this)]);
};
_.$JSCompiler_prototypeAlias$$.$AccessClientAdapter$$module$extensions$amp_access$0_1$amp_access_client_prototype$isPingbackEnabled$ = function() {
  return !0;
};
_.$JSCompiler_prototypeAlias$$.$AccessClientAdapter$$module$extensions$amp_access$0_1$amp_access_client_prototype$pingback$ = function() {
  var $$jscomp$this$jscomp$273$$ = this;
  return $JSCompiler_StaticMethods_AccessIframeAdapter$$module$extensions$amp_access$0_1$amp_access_iframe_prototype$connect$$(this).then(function() {
    return $JSCompiler_StaticMethods_sendCommandRsvp$$($$jscomp$this$jscomp$273$$.$D$, "pingback", {});
  });
};
_.$JSCompiler_prototypeAlias$$.$postAction$ = function() {
  $JSCompiler_StaticMethods_store_$$(this, null);
};
_.$JSCompiler_prototypeAlias$$.$AccessIframeAdapter$$module$extensions$amp_access$0_1$amp_access_iframe_prototype$handleCommand_$ = function($cmd$jscomp$5$$) {
  var $$jscomp$this$jscomp$277$$ = this;
  "connect" == $cmd$jscomp$5$$ && this.$J$.then(function($cmd$jscomp$5$$) {
    $JSCompiler_StaticMethods_sendCommandRsvp$$($$jscomp$this$jscomp$277$$.$D$, "start", {protocol:"amp-access", config:$cmd$jscomp$5$$}).then(function() {
      $$jscomp$this$jscomp$277$$.$F$ && ($$jscomp$this$jscomp$277$$.$F$(), $$jscomp$this$jscomp$277$$.$F$ = null);
    });
  });
};
var $AccessType$$module$extensions$amp_access$0_1$amp_access_source$$ = {$CLIENT$:"client", $IFRAME$:"iframe", $SERVER$:"server", VENDOR:"vendor", $OTHER$:"other"};
_.$JSCompiler_prototypeAlias$$ = $AccessSource$$module$extensions$amp_access$0_1$amp_access_source$$.prototype;
_.$JSCompiler_prototypeAlias$$.$getType$ = function() {
  return this.$type_$;
};
_.$JSCompiler_prototypeAlias$$.$getAdapterConfig$ = function() {
  return this.$D$.$getConfig$();
};
_.$JSCompiler_prototypeAlias$$.start = function() {
  "amp-access";
  $JSCompiler_StaticMethods_buildLoginUrls_$$(this);
};
_.$JSCompiler_prototypeAlias$$.$buildUrl$ = function($url$jscomp$128$$, $useAuthData$$) {
  var $$jscomp$this$jscomp$278$$ = this;
  return $JSCompiler_StaticMethods_AccessSource$$module$extensions$amp_access$0_1$amp_access_source_prototype$prepareUrlVars_$$(this, $useAuthData$$).then(function($useAuthData$$) {
    return _.$JSCompiler_StaticMethods_expandUrlAsync$$($$jscomp$this$jscomp$278$$.$urlReplacements_$, $url$jscomp$128$$, $useAuthData$$);
  });
};
_.$JSCompiler_prototypeAlias$$.$collectUrlVars$ = function($url$jscomp$129$$, $useAuthData$jscomp$1$$) {
  var $$jscomp$this$jscomp$279$$ = this;
  return $JSCompiler_StaticMethods_AccessSource$$module$extensions$amp_access$0_1$amp_access_source_prototype$prepareUrlVars_$$(this, $useAuthData$jscomp$1$$).then(function($useAuthData$jscomp$1$$) {
    return _.$JSCompiler_StaticMethods_collectVars$$($$jscomp$this$jscomp$279$$.$urlReplacements_$, $url$jscomp$129$$, $useAuthData$jscomp$1$$);
  });
};
_.$JSCompiler_prototypeAlias$$.$AccessSource$$module$extensions$amp_access$0_1$amp_access_source_prototype$getLoginUrl$ = function($urlOrPromise$jscomp$5$$) {
  return _.$createLoginDialog$$module$extensions$amp_access$0_1$login_dialog$$(this.ampdoc, $urlOrPromise$jscomp$5$$).$O$();
};
_.$JSCompiler_prototypeAlias$$.$loginWithUrl$ = function($url$jscomp$130$$, $eventLabel$$) {
  $JSCompiler_StaticMethods_login_$$(this, $url$jscomp$130$$, void 0 === $eventLabel$$ ? "" : $eventLabel$$);
};
_.$JSCompiler_prototypeAlias$$ = $AccessService$$module$extensions$amp_access$0_1$amp_access$$.prototype;
_.$JSCompiler_prototypeAlias$$.$AccessService$$module$extensions$amp_access$0_1$amp_access_prototype$getAccessReaderId$ = function() {
  return this.$K$ ? this.$AccessService$$module$extensions$amp_access$0_1$amp_access_prototype$getReaderId_$() : null;
};
_.$JSCompiler_prototypeAlias$$.$AccessService$$module$extensions$amp_access$0_1$amp_access_prototype$getReaderId_$ = function() {
  if (!this.$P$) {
    var $consent$jscomp$3$$ = window.Promise.resolve();
    this.$P$ = this.$V$.then(function($cid$jscomp$7$$) {
      return $cid$jscomp$7$$.get({scope:"amp-access", createCookieIfNotPresent:!0}, $consent$jscomp$3$$);
    });
  }
  return this.$P$;
};
_.$JSCompiler_prototypeAlias$$.$onApplyAuthorizations$ = function($callback$jscomp$104$$) {
  this.$R$.add($callback$jscomp$104$$);
};
_.$JSCompiler_prototypeAlias$$.$AccessService$$module$extensions$amp_access$0_1$amp_access_prototype$onDomUpdate_$ = function($event$jscomp$56$$) {
  var $$jscomp$this$jscomp$287$$ = this;
  if (this.$O$) {
    var $target$jscomp$103$$ = $event$jscomp$56$$.target;
    return this.$F$.then(function() {
      var $event$jscomp$56$$ = $JSCompiler_StaticMethods_combinedResponses$$($$jscomp$this$jscomp$287$$);
      $JSCompiler_StaticMethods_applyAuthorizationToRoot_$$($$jscomp$this$jscomp$287$$, $target$jscomp$103$$, $event$jscomp$56$$);
    });
  }
};
_.$JSCompiler_prototypeAlias$$.$getVendorSource$ = function($name$jscomp$171$$) {
  for (var $i$jscomp$177$$ = 0; $i$jscomp$177$$ < this.$D$.length; $i$jscomp$177$$++) {
    var $source$jscomp$31$$ = this.$D$[$i$jscomp$177$$];
    if ("vendor" == $source$jscomp$31$$.$getType$() && $source$jscomp$31$$.$D$.$O$ == $name$jscomp$171$$) {
      return $source$jscomp$31$$;
    }
  }
  throw Error();
};
_.$JSCompiler_prototypeAlias$$.$AccessService$$module$extensions$amp_access$0_1$amp_access_prototype$onReauthorize_$ = function($authorization$$) {
  var $$jscomp$this$jscomp$289$$ = this;
  this.$broadcastReauthorize_$();
  $authorization$$.then(function() {
    $$jscomp$this$jscomp$289$$.$O$ && $$jscomp$this$jscomp$289$$.$F$.then(function() {
      $$jscomp$this$jscomp$289$$.ampdoc.$whenReady$().then(function() {
        var $authorization$$ = $$jscomp$this$jscomp$289$$.ampdoc.getRootNode(), $responses$jscomp$1$$ = $JSCompiler_StaticMethods_combinedResponses$$($$jscomp$this$jscomp$289$$);
        return $JSCompiler_StaticMethods_applyAuthorizationToRoot_$$($$jscomp$this$jscomp$289$$, $authorization$$, $responses$jscomp$1$$);
      });
    });
  });
};
_.$JSCompiler_prototypeAlias$$.$broadcastReauthorize_$ = function() {
  _.$JSCompiler_StaticMethods_broadcast$$(this.$viewer_$, _.$dict$$module$src$utils$object$$({type:"amp-access-reauthorize", origin:this.$U$}));
};
_.$JSCompiler_prototypeAlias$$.$AccessService$$module$extensions$amp_access$0_1$amp_access_prototype$getAuthdataField$ = function($field$jscomp$4$$) {
  var $$jscomp$this$jscomp$292$$ = this;
  return this.$K$ ? this.$F$.then(function() {
    var $responses$jscomp$3_v$jscomp$8$$ = $JSCompiler_StaticMethods_combinedResponses$$($$jscomp$this$jscomp$292$$);
    $responses$jscomp$3_v$jscomp$8$$ = _.$getValueForExpr$$module$src$json$$($responses$jscomp$3_v$jscomp$8$$, $field$jscomp$4$$);
    return void 0 !== $responses$jscomp$3_v$jscomp$8$$ ? $responses$jscomp$3_v$jscomp$8$$ : null;
  }) : null;
};
_.$JSCompiler_prototypeAlias$$.$AccessService$$module$extensions$amp_access$0_1$amp_access_prototype$scheduleView_$ = function($timeToView$$) {
  var $$jscomp$this$jscomp$296$$ = this;
  this.$D$.some(function($timeToView$$) {
    return $timeToView$$.$D$.$AccessClientAdapter$$module$extensions$amp_access$0_1$amp_access_client_prototype$isPingbackEnabled$();
  }) && (this.$G$ = null, this.ampdoc.$whenReady$().then(function() {
    _.$JSCompiler_StaticMethods_Viewer$$module$src$service$viewer_impl_prototype$isVisible$$($$jscomp$this$jscomp$296$$.$viewer_$) && $JSCompiler_StaticMethods_AccessService$$module$extensions$amp_access$0_1$amp_access_prototype$reportWhenViewed_$$($$jscomp$this$jscomp$296$$, $timeToView$$);
    _.$JSCompiler_StaticMethods_Viewer$$module$src$service$viewer_impl_prototype$onVisibilityChanged$$($$jscomp$this$jscomp$296$$.$viewer_$, function() {
      _.$JSCompiler_StaticMethods_Viewer$$module$src$service$viewer_impl_prototype$isVisible$$($$jscomp$this$jscomp$296$$.$viewer_$) && $JSCompiler_StaticMethods_AccessService$$module$extensions$amp_access$0_1$amp_access_prototype$reportWhenViewed_$$($$jscomp$this$jscomp$296$$, $timeToView$$);
    });
  }));
};
_.$JSCompiler_prototypeAlias$$.$AccessService$$module$extensions$amp_access$0_1$amp_access_prototype$handleAction_$ = function($invocation$jscomp$19$$) {
  "login" == $invocation$jscomp$19$$.method ? ($invocation$jscomp$19$$.event && $invocation$jscomp$19$$.event.preventDefault(), $JSCompiler_StaticMethods_loginWithType_$$(this, "")) : _.$startsWith$$module$src$string$$($invocation$jscomp$19$$.method, "login-") ? ($invocation$jscomp$19$$.event && $invocation$jscomp$19$$.event.preventDefault(), $JSCompiler_StaticMethods_loginWithType_$$(this, $invocation$jscomp$19$$.method.substring(6))) : "refresh" == $invocation$jscomp$19$$.method && ($invocation$jscomp$19$$.event && 
  $invocation$jscomp$19$$.event.preventDefault(), $JSCompiler_StaticMethods_runAuthorization_$$(this));
  return null;
};
(function($AMP$jscomp$7$$) {
  $AMP$jscomp$7$$.registerServiceForDoc("access", function($AMP$jscomp$7$$) {
    $AMP$jscomp$7$$ = new $AccessService$$module$extensions$amp_access$0_1$amp_access$$($AMP$jscomp$7$$);
    if ($AMP$jscomp$7$$.$K$) {
      _.$JSCompiler_StaticMethods_installActionHandler$$(_.$Services$$module$src$services$actionServiceForDoc$$($AMP$jscomp$7$$.$I$), $AMP$jscomp$7$$.$I$, $AMP$jscomp$7$$.$AccessService$$module$extensions$amp_access$0_1$amp_access_prototype$handleAction_$.bind($AMP$jscomp$7$$));
      for (var $JSCompiler_StaticMethods_AccessService$$module$extensions$amp_access$0_1$amp_access_prototype$start_$self$jscomp$inline_2189_ampdoc$jscomp$125$$ = 0; $JSCompiler_StaticMethods_AccessService$$module$extensions$amp_access$0_1$amp_access_prototype$start_$self$jscomp$inline_2189_ampdoc$jscomp$125$$ < $AMP$jscomp$7$$.$D$.length; $JSCompiler_StaticMethods_AccessService$$module$extensions$amp_access$0_1$amp_access_prototype$start_$self$jscomp$inline_2189_ampdoc$jscomp$125$$++) {
        $AMP$jscomp$7$$.$D$[$JSCompiler_StaticMethods_AccessService$$module$extensions$amp_access$0_1$amp_access_prototype$start_$self$jscomp$inline_2189_ampdoc$jscomp$125$$].start();
      }
      $JSCompiler_StaticMethods_runAuthorization_$$($AMP$jscomp$7$$);
      $AMP$jscomp$7$$.$AccessService$$module$extensions$amp_access$0_1$amp_access_prototype$scheduleView_$(2000);
      $JSCompiler_StaticMethods_AccessService$$module$extensions$amp_access$0_1$amp_access_prototype$listenToBroadcasts_$$($AMP$jscomp$7$$);
    } else {
      _.$user$$module$src$log$$().$Log$$module$src$log_prototype$info$("amp-access", 'Access is disabled - no "id=amp-access" element');
    }
    return $AMP$jscomp$7$$;
  });
})(window.self.AMP);

})});
